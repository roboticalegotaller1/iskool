"use client";

import React, { Suspense, useEffect } from 'react';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { useStudentStore } from '@/store/useStudentStore';

import { RoleGuard } from '@/components/auth/RoleGuard';
import { StudentHUD } from '@/components/layout/StudentHUD';

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
      <RoleGuard allowedRoles={['student', 'admin', 'superadmin', 'owner', 'director']}>
        <StudentSyncProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
            {/* Atmósfera Inmersiva RPG */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),rgba(15,23,42,0))] pointer-events-none z-0" />
            
            {/* Gamer HUD Superior */}
            <StudentHUD />

            {/* Contenedor de Pantalla Completa Inmersivo */}
            <div className="flex-1 w-full flex flex-col relative z-10">
              {children}
            </div>
          </div>
        </StudentSyncProvider>
      </RoleGuard>
    </Suspense>
  );
}

