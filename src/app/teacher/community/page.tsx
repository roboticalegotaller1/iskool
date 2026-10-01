"use client";

import React from 'react';
import { Header } from '@/components/Header';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BackButton } from '@/components/navigation/BackButton';

const TeacherCommunityView = dynamic(
  () => import('@/components/TeacherCommunityView').then((m) => m.TeacherCommunityView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Cargando Red Social Docente...</span>
        </div>
      </div>
    ),
  }
);

export default function TeacherCommunityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Botón de Retorno Inteligente con Memoria de Procedencia */}
        <div>
          <BackButton 
            fallbackUrl="/teacher" 
            label="Volver a la página anterior" 
            variant="subtle" 
          />
        </div>

        {/* Vista de la Red Social Docente */}
        <TeacherCommunityView />

      </main>
    </div>
  );
}
