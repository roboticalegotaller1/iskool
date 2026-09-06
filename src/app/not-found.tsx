import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Home, BookOpen, Sparkles, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4 relative overflow-hidden select-none">
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-500/10 rounded-full blur-[140px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center gap-6 p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl animate-fade-in">
        {/* Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)]">
          <ShieldAlert className="w-10 h-10 text-rose-400 animate-bounce" />
        </div>

        {/* Title & Description */}
        <div>
          <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-rose-400 uppercase">
            ERROR 404 • COORDENADAS DESCONOCIDAS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 font-serif text-white tracking-wide">
            Aventura No Encontrada
          </h1>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            El portal mágico o misión a la que intentas acceder no existe, ha expirado o no tienes los permisos académicos necesarios para entrar en esta zona.
          </p>
        </div>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
          <Link
            href="/student"
            aria-label="Volver al mapa de misiones del estudiante"
            className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Compass className="w-4 h-4" />
            Mapa de Misiones
          </Link>
          
          <Link
            href="/teacher"
            aria-label="Ir al portal del profesor"
            className="flex-1 px-5 py-3 rounded-2xl bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/60 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            Portal Docente
          </Link>
          
          <Link
            href="/"
            aria-label="Ir a la página principal de ISkool"
            className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
