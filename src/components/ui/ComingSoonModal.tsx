"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, X, Clock, CheckCircle2, ArrowRight } from "lucide-react";

interface ComingSoonOptions {
  title?: string;
  category?: string;
  description?: string;
  timeline?: string;
}

interface ComingSoonContextType {
  showComingSoon: (options?: string | ComingSoonOptions) => void;
  closeComingSoon: () => void;
}

const ComingSoonContext = createContext<ComingSoonContextType>({
  showComingSoon: () => {},
  closeComingSoon: () => {}
});

export const useComingSoon = () => useContext(ComingSoonContext);

interface ComingSoonProviderProps {
  children: React.ReactNode;
}

export const ComingSoonProvider: React.FC<ComingSoonProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [info, setInfo] = useState<ComingSoonOptions>({
    title: "Módulo en Despliegue Institucional",
    category: "Próxima Actualización",
    description: "Esta funcionalidad está siendo optimizada por la Dirección Académica y de Tecnología conforme a los lineamientos pedagógicos vigentes.",
    timeline: "Despliegue Programado: Próximo Ciclo Escolar"
  });

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const showComingSoon = useCallback((options?: string | ComingSoonOptions) => {
    if (typeof options === "string") {
      setInfo({
        title: options,
        category: "Próxima Actualización",
        description: "Esta funcionalidad está programada para su activación dentro de la plataforma institucional ISkool.",
        timeline: "Despliegue Progresivo Oficial"
      });
    } else if (options) {
      setInfo({
        title: options.title || "Módulo en Despliegue Institucional",
        category: options.category || "Próxima Actualización",
        description: options.description || "Esta funcionalidad está programada para su activación dentro de la plataforma institucional ISkool.",
        timeline: options.timeline || "Despliegue Progresivo Oficial"
      });
    }
    setIsOpen(true);
  }, []);

  const closeComingSoon = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Manejador de teclado para accesibilidad (Escape cierra el modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeComingSoon();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeComingSoon]);

  // Autofoco al abrir para cumplimiento WCAG 2.1 AA
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <ComingSoonContext.Provider value={{ showComingSoon, closeComingSoon }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
          aria-describedby="coming-soon-desc"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 flex flex-col gap-4 text-slate-900 dark:text-zinc-100 transition-all">
            
            {/* Botón de cierre */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeComingSoon}
              aria-label="Cerrar modal informativo"
              className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Encabezado con insignia */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {info.category}
              </span>
            </div>

            {/* Título y descripción */}
            <div className="space-y-2">
              <h3 id="coming-soon-title" className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                {info.title}
              </h3>
              <p id="coming-soon-desc" className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {info.description}
              </p>
            </div>

            {/* Recuadro de línea de tiempo */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 flex items-center gap-3 text-xs">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">Estatus de Liberación</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                  {info.timeline}
                </span>
              </div>
            </div>

            {/* Botón de acción accesible */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={closeComingSoon}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                <span>Entendido</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </ComingSoonContext.Provider>
  );
};
