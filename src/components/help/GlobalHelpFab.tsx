"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GUIDE_ROLE_DATA } from '@/data/guideRoleContent';
import { 
  HelpCircle, 
  X, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  GraduationCap, 
  Gamepad2, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  Globe 
} from 'lucide-react';

export const GlobalHelpFab: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // No mostrar en la propia página de guía para evitar redundancia
  if (pathname === '/guide') return null;

  // Detectar rol actual basado en la ruta o usuario
  const getActiveRole = (): 'teacher' | 'student' | 'parent' | 'admin' => {
    if (pathname.startsWith('/teacher')) return 'teacher';
    if (pathname.startsWith('/student')) return 'student';
    if (pathname.startsWith('/parent')) return 'parent';
    if (pathname.startsWith('/coordinator') || pathname.startsWith('/admin')) return 'admin';
    if (user?.role === 'teacher') return 'teacher';
    if (user?.role === 'parent') return 'parent';
    if (user?.role === 'coordinator' || user?.role === 'admin') return 'admin';
    return 'student';
  };

  const role = getActiveRole();
  const roleData = GUIDE_ROLE_DATA[role] || GUIDE_ROLE_DATA.teacher;

  return (
    <>
      {/* Botón Flotante No Invasivo en la esquina inferior derecha */}
      <aside aria-label="Asistencia Rápida" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white font-semibold text-xs shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/15 backdrop-blur-md"
          title="Abrir Centro de Ayuda & Guía"
        >
          <HelpCircle className="w-4 h-4 text-purple-400 transition-transform group-hover:rotate-12" />
          <span className="hidden sm:inline text-xs">Ayuda & Guía</span>
        </button>
      </aside>

      {/* Cajón Lateral Deslizante de Asistencia Rápida */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Fondo semi-transparente */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between animate-slide-in-right">
              {/* Cabecera del Cajón */}
              <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                      Asistencia Rápida ISkool
                    </h3>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      {roleData.roleBadge}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido Desplazable del Cajón */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
                {/* Resumen del Rol */}
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-2">
                  <h4 className="text-xs font-black text-purple-900 dark:text-purple-200">
                    {roleData.roleTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {roleData.heroDescription}
                  </p>
                </div>

                {/* Pasos Rápidos Recomendados */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Flujo de Trabajo Recomendado:
                  </h4>

                  <div className="space-y-2">
                    {roleData.steps.slice(0, 3).map((st) => (
                      <div 
                        key={st.stepNumber}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-750 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {st.stepNumber}
                        </span>
                        <div className="space-y-0.5">
                          <strong className="text-slate-900 dark:text-white font-bold block">{st.title}</strong>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{st.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Directorio de Simuladores Rápido (si es docente) */}
                {role === 'teacher' && (
                  <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-950 dark:text-cyan-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-black text-xs text-cyan-800 dark:text-cyan-300">
                      <Globe className="w-3.5 h-3.5" />
                      <span>50 Simuladores Web Listos</span>
                    </div>
                    <p className="text-[11px] text-cyan-900 dark:text-cyan-200">
                      Encuentra laboratorios interactivos de PhET, GeoGebra, Desmos y NASA en la guía completa.
                    </p>
                    <Link
                      href="/guide?role=teacher#simuladores"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 underline block"
                    >
                      Ver directorio completo ➔
                    </Link>
                  </div>
                )}
              </div>

              {/* Pie del Cajón con Botón a Guía Completa */}
              <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 space-y-2">
                <Link
                  href={`/guide?role=${role}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 hover:from-purple-700 transition-all text-center"
                >
                  <span>Abrir Manual y Guía Completa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
