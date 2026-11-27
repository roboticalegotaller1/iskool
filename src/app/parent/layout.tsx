import React, { Suspense } from 'react';
import { Loader } from '@/components/Loader';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader message="Cargando portal de tutores..." />}>
      <RoleGuard allowedRoles={['parent', 'tutor', 'director', 'admin', 'superadmin', 'owner', 'coordinator', 'teacher', 'student']}>
        <a
          href="#portal-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-slate-900 focus:text-white focus:text-xs focus:font-bold focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        <div id="portal-main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
      </RoleGuard>
    </Suspense>
  );
}
