"use client";

import React from 'react';
import { TenantTeacherHubCards } from '@/components/branding/TenantTeacherHubCards';
import { useRouter } from 'next/navigation';

/**
 * Portal Oficial de Docentes y Coordinadores de IBIME.
 * Renderiza la interfaz docente bajo la Regla de los 3 Clics de Apple
 * con la paleta y tokens institucionales oficiales de IBIME.
 */
export default function IbimePortalPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <TenantTeacherHubCards
          teacherName="Prof. Gabriela Morales"
          onNavigateToClasses={() => router.push('/ibime/portal#clases')}
          onNavigateToStudio={() => router.push('/teacher/studio')}
          onNavigateToCommunity={() => router.push('/ibime/portal#comunidad')}
        />
      </div>
    </main>
  );
}
