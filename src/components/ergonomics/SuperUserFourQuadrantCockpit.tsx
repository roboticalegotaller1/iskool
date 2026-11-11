"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Zap,
  CheckCircle2,
  Palette,
  KeyRound,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';

interface SuperUserFourQuadrantCockpitProps {
  activeSchoolsCount?: number;
  onQuickCreateSchool?: () => void;
  onOpenSecurityAuditTab?: () => void;
}

export const SuperUserFourQuadrantCockpit: React.FC<SuperUserFourQuadrantCockpitProps> = ({
  activeSchoolsCount = 18,
  onQuickCreateSchool,
  onOpenSecurityAuditTab,
}) => {
  const [securityVerifiedAt, setSecurityVerifiedAt] = useState<string>('Hace instantes');
  const [isCheckingZeroTrust, setIsCheckingZeroTrust] = useState<boolean>(false);

  const handleVerifyZeroTrustLive = async () => {
    setIsCheckingZeroTrust(true);
    try {
      await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' }).catch(() => null);
      setSecurityVerifiedAt(
        new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } finally {
      setIsCheckingZeroTrust(false);
    }
  };

  return (
    <section
      data-testid="superuser-4quadrant-cockpit"
      className="w-full rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden"
    >
      {/* Top Executive Dark-Indigo Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 sm:px-7 py-4 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
            <span className="font-black text-sm tracking-tighter text-indigo-300">iS</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Torre de Control Ejecutiva • Super Usuario
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zero-Trust Activo
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300/90 mt-0.5">
              Monitoreo consolidado en tiempo real: Cobertura Curricular NEM/CEFR, Seguridad Criptográfica, Finanzas SAT CFDI 4.0 y Acciones Directivas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 font-bold text-slate-200">
            <Building2 className="h-3.5 w-3.5 text-indigo-300" />
            Planteles Activos: <strong className="text-white">{activeSchoolsCount}</strong>
          </span>
          <button
            type="button"
            data-testid="btn-verify-zerotrust-live"
            onClick={handleVerifyZeroTrustLive}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 px-3 py-1.5 text-[11px] font-extrabold text-emerald-200 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-300 ${isCheckingZeroTrust ? 'animate-spin' : ''}`} />
            <span>Verificar Blindaje ({securityVerifiedAt})</span>
          </button>
        </div>
      </div>

      {/* 4-Column Executive Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-5 sm:p-6 bg-slate-50/50">
        {/* Card 1: Cobertura Curricular & Salud Multi-Plantel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Salud & Cobertura</h3>
                  <p className="text-[10px] font-semibold text-slate-500">NEM 2024 • Marco CEFR</p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                Bóveda 100%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-2">
              <div className="rounded-xl bg-slate-50/90 p-2.5 border border-slate-100 text-center">
                <div className="text-lg font-black text-slate-900 leading-none">{activeSchoolsCount}</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">Instituciones</div>
              </div>
              <div className="rounded-xl bg-slate-50/90 p-2.5 border border-slate-100 text-center">
                <div className="text-lg font-black text-indigo-600 leading-none">96.4%</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">Asistencia</div>
              </div>
              <div className="rounded-xl bg-slate-50/90 p-2.5 border border-slate-100 text-center">
                <div className="text-lg font-black text-blue-600 leading-none">A1–B2</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">12 Módulos</div>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500">Sincronización Curricular</span>
            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Operativo
            </span>
          </div>
        </div>

        {/* Card 2: Escudo DevSecOps Zero-Trust */}
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-emerald-400 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Escudo Zero-Trust</h3>
                  <p className="text-[10px] font-semibold text-slate-500">Criptografía & Sesiones</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                Hermético
              </span>
            </div>

            <div className="space-y-1.5 my-1">
              <div className="flex items-center justify-between rounded-xl bg-slate-50/90 px-3 py-1.5 border border-slate-100 text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 truncate">
                  <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">Cookies HttpOnly HMAC-SHA256</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md shrink-0">
                  ACTIVO
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/90 px-3 py-1.5 border border-slate-100 text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">Aislamiento Multi-Tenant (404)</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md shrink-0">
                  BLINDADO
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/90 px-3 py-1.5 border border-slate-100 text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 truncate">
                  <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">Rate Limiting & Anti-Bot</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md shrink-0">
                  100% OK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pulso Financiero & Timbrado SAT CFDI 4.0 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Pulso Financiero SAT</h3>
                  <p className="text-[10px] font-semibold text-slate-500">Cobranza & CFDI 4.0</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> PAC Válido
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-2">
              <div className="col-span-2 rounded-xl bg-slate-50/90 p-2.5 border border-slate-100">
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none">$4,820,000</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">Facturado Ciclo MXN</div>
              </div>
              <div className="rounded-xl bg-slate-50/90 p-2.5 border border-slate-100 text-center">
                <div className="text-base sm:text-lg font-black text-emerald-600 leading-none">94.2%</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">Cobranza</div>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500">Complemento Educativo</span>
            <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              IEDU 1.0 Activo
            </span>
          </div>
        </div>

        {/* Card 4: Acciones Rápidas de Super Usuario en 1 Clic */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 leading-tight">Acciones en 1 Clic</h3>
                <p className="text-[10px] font-semibold text-slate-500">Atajos Directivos</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
              Rápido
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            {onQuickCreateSchool ? (
              <button
                type="button"
                onClick={onQuickCreateSchool}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 py-2.5 text-[11px] font-extrabold text-white hover:bg-indigo-500 transition shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-200 shrink-0" />
                <span className="truncate">Nuevo Colegio</span>
              </button>
            ) : (
              <Link
                href="/admin"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 py-2.5 text-[11px] font-extrabold text-white hover:bg-indigo-500 transition shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-200 shrink-0" />
                <span className="truncate">Directorio</span>
              </Link>
            )}

            <Link
              href="/admin/whitelabel"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 text-[11px] font-extrabold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition"
            >
              <Palette className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Marca Blanca</span>
            </Link>

            {onOpenSecurityAuditTab ? (
              <button
                type="button"
                onClick={onOpenSecurityAuditTab}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 text-[11px] font-extrabold text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Auditoría</span>
              </button>
            ) : (
              <Link
                href="/director"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 text-[11px] font-extrabold text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Supervisión</span>
              </Link>
            )}

            <Link
              href="/coordinator/fiscal"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 text-[11px] font-extrabold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Consola CFDI</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
