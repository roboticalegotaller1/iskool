"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { TeacherCommunityView } from '@/components/TeacherCommunityView';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherCommunityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Botón de Retorno al Dashboard / Hub */}
        <div>
          <button
            type="button"
            onClick={() => router.push('/teacher')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Hub Docente</span>
          </button>
        </div>

        {/* Vista de la Red Social Docente */}
        <TeacherCommunityView />

      </main>
    </div>
  );
}
