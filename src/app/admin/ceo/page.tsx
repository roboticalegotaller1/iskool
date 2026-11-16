"use client";

import React, { useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CEOExecutiveDashboard, { buildHoldingForInstitution, DEFAULT_IBIME_HOLDING } from '@/components/admin/CEOExecutiveDashboard';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useAuth } from '@/context/AuthContext';
import { isPlatformSuperUser } from '@/types';
import { useNavigationStore } from '@/store/useNavigationStore';

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
  const effectiveId = (!isSuperUser && user?.school_id) ? user.school_id : (querySchoolId || activeSchoolId);
  const popBackUrl = useNavigationStore(state => state.popBackUrl);

  useEffect(() => {
    if (effectiveId === 'sch-demo-0001' && activeSchoolId !== 'sch-demo-0001') {
      selectSchool('sch-demo-0001');
    }
  }, [effectiveId, activeSchoolId, selectSchool]);

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
      schoolId={currentInstitution?.id || effectiveId || user?.school_id}
      isSuperUser={isSuperUser}
      onSwitchToOperational={() => {
        if (!isSuperUser && user?.school_id === 'sch-demo-0001') {
          router.push('/director');
          return;
        }
        const target = popBackUrl('/admin/ceo', user?.role, '/admin');
        router.push(target);
      }}
      onBackToDirectory={isSuperUser ? () => {
        selectSchool(null);
        const target = popBackUrl('/admin/ceo', user?.role, '/admin');
        router.push(target);
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

