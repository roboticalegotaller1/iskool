"use client";

import React, { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CEOExecutiveDashboard, { buildHoldingForInstitution, DEFAULT_IBIME_HOLDING } from '@/components/admin/CEOExecutiveDashboard';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useAuth } from '@/context/AuthContext';
import { isPlatformSuperUser } from '@/types';

function CEOExecutiveDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySchoolId = searchParams?.get('schoolId') || searchParams?.get('id');
  const { user } = useAuth();
  const { 
    institutionsList, 
    activeSchoolId, 
    selectSchool,
    campusesList, 
    detailedStudents, 
    teachersList 
  } = useSchoolAdminStore();

  const isSuperUser = isPlatformSuperUser(user);
  const effectiveId = querySchoolId || activeSchoolId;

  // Determinar la institución actual: por parámetro de URL, activeSchoolId, o usuario
  const currentInstitution = useMemo(() => {
    if (effectiveId) {
      return institutionsList.find(inst => inst.id === effectiveId) || null;
    }
    if (user?.school_id) {
      return institutionsList.find(inst => inst.id === user.school_id) || null;
    }
    return institutionsList[0] || null;
  }, [effectiveId, user?.school_id, institutionsList]);

  // Construir holding adaptado a la institución seleccionada
  const dynamicHolding = useMemo(() => {
    if (currentInstitution) {
      return buildHoldingForInstitution(currentInstitution, campusesList, detailedStudents, teachersList);
    }
    return DEFAULT_IBIME_HOLDING;
  }, [currentInstitution, campusesList, detailedStudents, teachersList]);

  return (
    <CEOExecutiveDashboard 
      holding={dynamicHolding}
      schoolId={currentInstitution?.id}
      isSuperUser={isSuperUser}
      onSwitchToOperational={() => router.push('/admin')}
      onBackToDirectory={isSuperUser ? () => {
        selectSchool(null);
        router.push('/admin');
      } : undefined}
    />
  );
}

export default function CEOExecutiveDashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white font-bold">Cargando Consola CEO...</div>}>
      <CEOExecutiveDashboardContent />
    </Suspense>
  );
}

