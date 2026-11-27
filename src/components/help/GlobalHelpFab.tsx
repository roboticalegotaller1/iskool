"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';

const GlobalHelpDrawer = dynamic(() => import('./GlobalHelpDrawer'), {
  ssr: false,
});

export const GlobalHelpFab: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Integración con el estado del Taller de Actividades para evitar solapar botones de configuración
  const isNodeConfigDrawerOpen = useActivityBuilderStore((s) => s.isNodeConfigDrawerOpen);
  const isExtendedMenuOpen = useActivityBuilderStore((s) => s.isExtendedMenuOpen);
  const isPreviewModalOpen = useActivityBuilderStore((s) => s.isPreviewModalOpen);

  // No mostrar en la página de guía ni en la sala ejecutiva de vídeo (/video) para evitar ruido visual
  if (pathname === '/guide' || pathname === '/video' || pathname?.startsWith('/video/')) return null;

  const shouldHideFab = isOpen || isNodeConfigDrawerOpen || isExtendedMenuOpen || isPreviewModalOpen;

  return (
    <>
      {/* Botón Flotante No Invasivo en la esquina inferior derecha */}
      {!shouldHideFab && (
        <aside
          aria-label="Asistencia Rápida"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 print:hidden transition-all duration-300"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center justify-center gap-2 p-2.5 sm:px-3.5 sm:py-2 min-h-[44px] min-w-[44px] rounded-full bg-slate-900/90 hover:bg-slate-900 text-white font-semibold text-xs shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/15 backdrop-blur-md"
            title="Abrir Centro de Ayuda & Guía"
          >
            <HelpCircle className="w-4 h-4 text-purple-400 transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline text-xs">Ayuda & Guía</span>
          </button>
        </aside>
      )}

      {/* Cajón Lateral cargado de forma diferida solo al abrir */}
      {isOpen && <GlobalHelpDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
};
