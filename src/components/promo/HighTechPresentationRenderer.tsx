"use client";

import React, { useState } from "react";
import { Play, Sparkles, Maximize2, Loader2, Video } from "lucide-react";

interface HighTechPresentationRendererProps {
  className?: string;
  autoPlay?: boolean;
}

/**
 * Renderizador diferido de alta tecnología (High-Tech Presentation Renderer).
 * Implementa Lazy Loading mediante next/dynamic para aplazar la carga de assets pesados
 * (WebGL, canvas y animaciones de alta densidad) hasta la interacción explícita del usuario,
 * optimizando drásticamente el Time to Interactive (TTI) y First Contentful Paint (FCP).
 */
export const HighTechPresentationRenderer: React.FC<HighTechPresentationRendererProps> = ({
  className = "w-full h-[600px]",
  autoPlay = false
}) => {
  const [isLoaded, setIsLoaded] = useState(autoPlay);
  const [isLoadingIframe, setIsLoadingIframe] = useState(false);

  const handleStartPlayback = () => {
    setIsLoadingIframe(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-2xl shadow-emerald-500/10 flex flex-col ${className}`}>
      {/* Barra superior de control */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Renderizador de Alta Tecnología (Estudio 60 FPS)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">1080p · WebGL Dinámico</span>
          {isLoaded && (
            <a
              href="/high_tech_renderer_v3.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-colors"
            >
              Pantalla Completa <Maximize2 className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Vista previa o Contenedor Iframe diferido */}
      <div className="relative flex-1 w-full h-full bg-slate-950">
        {!isLoaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-radial from-slate-900 via-slate-950 to-black">
            <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 mb-5 shadow-lg shadow-emerald-500/20 text-emerald-400">
              <Video className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-2">
              Presentación Ejecutiva de Alta Definición
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              Carga diferida activada para optimizar el rendimiento de tu navegador. Haz clic para inicializar el motor de renderizado gráfico de 60 FPS.
            </p>
            <button
              onClick={handleStartPlayback}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black tracking-wide uppercase flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" /> Inicializar Renderizador
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {isLoadingIframe && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs z-20">
                <div className="flex flex-col items-center gap-2 text-emerald-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-xs font-bold font-mono">Cargando motor de visualización...</span>
                </div>
              </div>
            )}
            <iframe
              src="/high_tech_renderer_v3.html"
              title="Renderizador de Presentación de Alta Tecnología"
              className="w-full h-full border-none"
              onLoad={() => setIsLoadingIframe(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HighTechPresentationRenderer;
