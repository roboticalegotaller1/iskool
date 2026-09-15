"use client";

import React, { Suspense } from 'react';
import { Loader } from '@/components/Loader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { TeacherNavbar } from '@/components/layout/TeacherNavbar';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader message="Cargando portal docente..." />}>
      <RoleGuard allowedRoles={['teacher', 'admin', 'superadmin', 'owner', 'director', 'coordinator']}>
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
          <TeacherNavbar />
          <div className="flex-1 w-full">
            {children}
          </div>
        </div>
      </RoleGuard>
    </Suspense>
  );
}
