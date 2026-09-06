"use client";

import React, { Suspense } from 'react';
import { Loader } from '@/components/Loader';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader message="Cargando portal docente..." />}>
      <RoleGuard allowedRoles={['teacher']}>
        {children}
      </RoleGuard>
    </Suspense>
  );
}
