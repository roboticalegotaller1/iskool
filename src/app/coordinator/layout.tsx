"use client";

import React, { Suspense } from 'react';
import { Loader } from '@/components/Loader';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader message="Cargando coordinación escolar..." />}>
      <RoleGuard allowedRoles={['coordinator']}>
        {children}
      </RoleGuard>
    </Suspense>
  );
}
