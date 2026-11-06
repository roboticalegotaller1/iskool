"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight, X, Command } from 'lucide-react';

interface CommandAction {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  href: string;
  keywords: string;
}

const COMMAND_ACTIONS: CommandAction[] = [
  {
    id: 'cmd-teacher-plan',
    title: 'Crear Planeación NEM o Clase Guiada',
    subtitle: 'Genera una planeación oficial o inicia tu clase en 3 pasos simples',
    badge: 'Docente · 1 Clic',
    icon: '⚡',
    href: '/teacher',
    keywords: 'planeacion nem clase fracciones examen asistencia lista docente profesor',
  },
  {
    id: 'cmd-studio-recipes',
    title: 'Abrir Estudio iSkool (Recetas en 1 Clic)',
    subtitle: 'Crea una Aventura RPG, Escape Room o Personaje Histórico en 30 segundos',
    badge: 'Estudio · IA',
    icon: '🎨',
    href: '/teacher/studio',
    keywords: 'estudio recetas juego rpg escape room personaje historico actividad interactiva',
  },
  {
    id: 'cmd-teacher-grades',
    title: 'Capturar Calificaciones y Boleta SEP',
    subtitle: 'Evalúa entregables y descarga boletas oficiales por periodo',
    badge: 'Evaluación SEP',
    icon: '⭐',
    href: '/teacher/grades',
    keywords: 'boleta calificaciones sep evaluacion promedios notas',
  },
  {
    id: 'cmd-coord-groups',
    title: 'Gestionar Expedientes y Conformar Grupos',
    subtitle: 'Da de alta alumnos por CURP, asigna grupos A/B y configura horarios',
    badge: 'Control Escolar',
    icon: '🎓',
    href: '/coordinator',
    keywords: 'expedientes alumnos curp grupos horarios inscripciones coordinacion',
  },
  {
    id: 'cmd-coord-billing',
    title: 'Estado de Cuenta, Colegiaturas y Cobranza',
    subtitle: 'Consulta pagos, becas, recargos y conciliación financiera del plantel',
    badge: 'Finanzas',
    icon: '💳',
    href: '/coordinator/billing',
    keywords: 'cobranza pagos colegiaturas recibos finanzas estado de cuenta',
  },
  {
    id: 'cmd-coord-fiscal',
    title: 'Facturación Electrónica SAT (CFDI 4.0)',
    subtitle: 'Timbrado institucional y envío automático de comprobantes fiscales',
    badge: 'Fiscal SAT',
    icon: '📑',
    href: '/coordinator/fiscal',
    keywords: 'facturacion sat cfdi rfc impuestos facturas',
  },
  {
    id: 'cmd-parent-portal',
    title: 'Ver Muro de Logros y Avisos Familiares',
    subtitle: 'Revisa evidencias selladas, asistencia e insignias de tus hijos',
    badge: 'Familias',
    icon: '🏆',
    href: '/parent',
    keywords: 'padres familia tutor hijos logros tareas avisos',
  },
  {
    id: 'cmd-student-missions',
    title: 'Ir a Misiones Interactivas de Alumno',
    subtitle: 'Explora mundos de estudio, mascotas evolutivas y retos del día',
    badge: 'Alumno',
    icon: '🗺️',
    href: '/student',
    keywords: 'alumno misiones juegos tareas avatar mascota monedas',
  },
];

interface UniversalCommandBarProps {
  variant?: 'light' | 'dark';
}

export function UniversalCommandBar({ variant = 'light' }: UniversalCommandBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMAND_ACTIONS;
    return COMMAND_ACTIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.keywords.includes(q)
    );
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  const executeAction = (action: CommandAction) => {
    setIsOpen(false);
    setQuery('');
    router.push(action.href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        data-testid="universal-command-bar-trigger"
        aria-label="Abrir barra de comando universal (Ctrl+K)"
        className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border whitespace-nowrap ${
          variant === 'dark'
            ? 'bg-white/10 hover:bg-white/15 text-blue-100 border-blue-700/70'
            : 'bg-zinc-100/90 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800'
        }`}
      >
        <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span className="hidden 2xl:inline">¿Qué deseas hacer hoy?</span>
        <span className="2xl:hidden">¿Qué hacer hoy?</span>
        <kbd
          className={`px-1.5 py-0.5 text-[10px] font-black rounded-md border ${
            variant === 'dark'
              ? 'bg-slate-900/80 text-blue-200 border-blue-700'
              : 'bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 shadow-2xs'
          }`}
        >
          Ctrl K
        </kbd>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Barra de Comando Universal iSkool"
            data-testid="universal-command-bar-modal"
            className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input de Búsqueda Semántica */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + Math.max(1, filteredActions.length)) % Math.max(1, filteredActions.length));
                  } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
                    e.preventDefault();
                    executeAction(filteredActions[selectedIndex]);
                  }
                }}
                placeholder="¿Qué deseas hacer hoy? Ej: crear planeación, pasar lista, conformar grupos, cobranza..."
                className="w-full bg-transparent text-sm sm:text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Cerrar comando"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Acciones en 1 Clic */}
            <div className="max-h-[360px] overflow-y-auto p-3 space-y-1.5">
              <div className="px-3 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <span>Acciones Rápidas en 1 Clic</span>
                <span>{filteredActions.length} resultados</span>
              </div>

              {filteredActions.length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  No encontramos una acción con &ldquo;{query}&rdquo;. Prueba con &ldquo;planeación&rdquo;, &ldquo;grupos&rdquo; o &ldquo;cobranza&rdquo;.
                </div>
              ) : (
                filteredActions.map((action, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => executeAction(action)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 shadow-xs'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs">
                          {action.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white truncate">
                              {action.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              {action.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {action.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-blue-600 dark:text-blue-400 translate-x-0.5' : 'text-zinc-300 dark:text-zinc-600'
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* Pie de Modal con Atajos */}
            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Command className="w-3 h-3 text-blue-500" />
                  <strong>Navegación Directa</strong>
                </span>
                <span>· Sin menús profundos</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold">↑↓</span>
                <span>Elegir</span>
                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold">↵</span>
                <span>Ir ahora</span>
                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold">ESC</span>
                <span>Salir</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

