'use client';

/**
 * @file src/app/coordinator/institutional-memory/page.tsx
 * @description Portal Directo de Memoria Institucional & Segundo Cerebro para Coordinadores.
 */

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { InstitutionalMemoryOverview } from '@/components/coordinator/InstitutionalMemoryOverview';
import { ArrowLeft } from 'lucide-react';

export default function CoordinatorInstitutionalMemoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Barra de Retorno Apple (Regla de Navegación Unificada) */}
        <div>
          <Link
            href="/coordinator"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Volver al Panel de Coordinación</span>
          </Link>
        </div>

        {/* Vista Macroscópica de Memoria Institucional */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <InstitutionalMemoryOverview />
        </div>
      </main>
    </div>
  );
}
