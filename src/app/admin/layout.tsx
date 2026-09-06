"use client";

import React, { Suspense } from 'react';
import { Loader } from '@/components/Loader';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader message="Cargando portal de super usuario..." />}>
      <RoleGuard allowedRoles={['admin']}>
        {children}
      </RoleGuard>
    </Suspense>
  );
}
