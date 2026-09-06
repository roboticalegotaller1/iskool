"use client";

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
      <RoleGuard allowedRoles={['parent']}>
        {children}
      </RoleGuard>
    </Suspense>
  );
}
