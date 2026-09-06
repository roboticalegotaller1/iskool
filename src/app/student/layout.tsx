"use client";

import React, { Suspense, useEffect } from 'react';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { useStudentStore } from '@/store/useStudentStore';

import { RoleGuard } from '@/components/auth/RoleGuard';

function StudentSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'student') {
      const currentActiveId = useStudentStore.getState().activeStudentId;
      if (currentActiveId !== user.id) {
        useStudentStore.setState({ activeStudentId: user.id });
      }
    }
  }, [user]);

  return <>{children}</>;
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader />}>
      <RoleGuard allowedRoles={['student']}>
        <StudentSyncProvider>
          {children}
        </StudentSyncProvider>
      </RoleGuard>
    </Suspense>
  );
}

