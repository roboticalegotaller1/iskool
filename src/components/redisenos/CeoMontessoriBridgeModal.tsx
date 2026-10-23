// src/components/redisenos/CeoMontessoriBridgeModal.tsx
"use client";

import React from 'react';
import { X, Building2, Users, GraduationCap, Cpu, CheckCircle2, TrendingUp, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { COLEGIO_MONTESSORI_METRICS } from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CeoMontessoriBridgeModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Conexión CEO: Colegio Montessori del Valle
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  OFICIAL ACTIVO
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                CCT: {COLEGIO_MONTESSORI_METRICS.cct} · {COLEGIO_MONTESSORI_METRICS.slogan}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          
          {/* Card Principal ID del Colegio */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CCT: {COLEGIO_MONTESSORI_METRICS.cct}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {COLEGIO_MONTESSORI_METRICS.address}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{COLEGIO_MONTESSORI_METRICS.name}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{COLEGIO_MONTESSORI_METRICS.director}</p>
            </div>

            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Ver en Tablero CEO
              <ExternalLink className="w-3 h-3 text-purple-200" />
            </a>
          </div>

          {/* Grid de 4 Métricas Clave */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
              <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <span className="text-2xl font-black text-white block">{COLEGIO_MONTESSORI_METRICS.planteles}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Planteles</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
              <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <span className="text-2xl font-black text-cyan-300 block">{COLEGIO_MONTESSORI_METRICS.alumnosReales}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Alumnos Demo</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
              <GraduationCap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <span className="text-2xl font-black text-emerald-300 block">{COLEGIO_MONTESSORI_METRICS.docentesReales}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Docentes Demo</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
              <Cpu className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <span className="text-2xl font-black text-amber-300 block">{COLEGIO_MONTESSORI_METRICS.tokensIaConsumidos}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Tokens IA</span>
            </div>
          </div>

          {/* Estado de Integración Financiera y Académica */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Salud Académica del Colegio
              </span>
              <span className="text-emerald-400 font-bold">{COLEGIO_MONTESSORI_METRICS.saludAcademica} (Excelente)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                CFDI Facturación de Colegiaturas
              </span>
              <span className="text-emerald-400 font-bold">{COLEGIO_MONTESSORI_METRICS.cfdiColegiaturasAlDia} (Sin Rezago)</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Colegio Montessori del Valle · Matriz Institucional ISkool</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
}
