"use client";

import React, { Suspense, useEffect } from 'react';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { useStudentStore } from '@/store/useStudentStore';

import { RoleGuard } from '@/components/auth/RoleGuard';
import { StudentHUD } from '@/components/layout/StudentHUD';

import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { BookOpen } from 'lucide-react';

function StudentSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const studentData = detailedStudents.find(s => s.id === user?.id || s.email === user?.email);
  const isGamificationDisabled = user?.school_id === 'sch-profesores-independientes' || studentData?.gamification_enabled === false;

  useEffect(() => {
    if (user && user.role === 'student' && !isGamificationDisabled) {
      const currentActiveId = useStudentStore.getState().activeStudentId;
      if (currentActiveId !== user.id) {
        useStudentStore.setState({ activeStudentId: user.id });
      }
    }
  }, [user, isGamificationDisabled]);

  if (user?.role === 'student' && isGamificationDisabled) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-purple-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <BookOpen className="h-8 w-8 text-amber-300" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Red Docente Autónoma
          </span>
          <h2 className="text-xl font-black text-white">Modalidad Aula & Evaluación Directa</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tu cuenta está vinculada a un docente autónomo. Tu participación se gestiona directamente en el aula con tu profesor a través de la ruleta de participación, asistencia y calificaciones formativas oficiales.
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition shadow-lg cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

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

