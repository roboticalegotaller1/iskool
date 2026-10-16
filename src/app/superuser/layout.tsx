"use client";

import React, { Suspense } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function SuperUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500">Cargando Centro de Mando Superusuario...</p>
          </div>
        </div>
      }
    >
      <RoleGuard allowedRoles={['admin', 'superadmin', 'owner', 'ceo']}>
        {children}
      </RoleGuard>
    </Suspense>
  );
}
