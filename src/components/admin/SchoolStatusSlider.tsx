"use client";

import React, { useState, useRef } from 'react';
import { Check, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SchoolStatusSliderProps {
  schoolId: string;
  schoolName: string;
  status: 'active' | 'inactive' | 'trial';
  isTestCase?: boolean;
  onToggle: (newStatus: 'active' | 'inactive') => void;
  className?: string;
}

export const SchoolStatusSlider: React.FC<SchoolStatusSliderProps> = ({
  schoolId,
  schoolName,
  status,
  isTestCase,
  onToggle,
  className = ''
}) => {
  const isSuspended = status === 'inactive';
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    startXRef.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    const delta = e.clientX - startXRef.current;
    // Si está activo, solo se puede arrastrar hacia la derecha (valores positivos)
    // Si está suspendido, solo se puede arrastrar hacia la izquierda (valores negativos)
    if (!isSuspended) {
      setDragOffset(Math.max(0, Math.min(delta, 72)));
    } else {
      setDragOffset(Math.min(0, Math.max(delta, -72)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);

    // Si arrastró más de 25px o fue un clic directo
    const threshold = 25;
    if (!isSuspended && dragOffset >= threshold) {
      onToggle('inactive');
    } else if (isSuspended && dragOffset <= -threshold) {
      onToggle('active');
    } else if (Math.abs(dragOffset) < 5) {
      // Clic directo en el interruptor
      onToggle(isSuspended ? 'active' : 'inactive');
    }
    setDragOffset(0);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`inline-flex flex-col items-end ${className}`}
      onClick={handleClick}
      title={isSuspended 
        ? `Colegio ${schoolName} suspendido. Haz clic o arrastra a la izquierda para reactivar todas las cuentas.` 
        : `Colegio ${schoolName} activo. Haz clic o arrastra a la derecha para suspender e inhabilitar todas las cuentas.`
      }
    >
      {/* Control Deslizante Interactivo (Slider Switch) */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`relative flex items-center h-7 px-1.5 rounded-full cursor-grab active:cursor-grabbing select-none transition-colors duration-300 shadow-sm border touch-none ${
          isSuspended
            ? 'bg-rose-600 hover:bg-rose-700 border-rose-700 text-white min-w-[144px]'
            : isTestCase
            ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white min-w-[152px]'
            : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white min-w-[140px]'
        }`}
      >
        {/* Texto del estado cuando está activo (a la derecha de la perilla) */}
        {!isSuspended && (
          <span className="text-[10px] font-black uppercase tracking-wider pl-6 pr-2 flex items-center gap-1.5 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            {isTestCase ? 'Sandbox Activo' : 'Oficial Activo'}
          </span>
        )}

        {/* Texto del estado cuando está suspendido (a la izquierda de la perilla) */}
        {isSuspended && (
          <span className="text-[10px] font-black uppercase tracking-wider pl-2 pr-6 flex items-center gap-1.5 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Inactivo
          </span>
        )}

        {/* Perilla deslizante con icono háptico */}
        <div
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-none transition-transform ${
            isDragging ? 'duration-0 scale-105 shadow-lg' : 'duration-300 ease-out'
          }`}
          style={{
            transform: `translateX(${dragOffset}px)`,
            right: isSuspended ? '2px' : 'auto',
            left: isSuspended ? 'auto' : '2px'
          }}
        >
          {isSuspended ? (
            <Lock className="w-3.5 h-3.5 text-rose-600" />
          ) : isTestCase ? (
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          )}
        </div>
      </div>

      {/* Subtexto descriptivo del deslizador */}
      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
        {isSuspended ? (
          <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-0.5">
            <AlertTriangle className="w-2.5 h-2.5" /> Cuentas inhabilitadas
          </span>
        ) : (
          <span>Desliza para suspender</span>
        )}
      </span>
    </div>
  );
};
