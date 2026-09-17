"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CEOExecutiveDashboard, { buildHoldingForInstitution, DEFAULT_IBIME_HOLDING } from '@/components/admin/CEOExecutiveDashboard';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useAuth } from '@/context/AuthContext';
import { isPlatformSuperUser } from '@/types';

export default function CEOExecutiveDashboardPage() {
  const router = useRouter();
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

  // Determinar la institución actual: por activeSchoolId, o la del usuario, o la primera de la lista
  const currentInstitution = useMemo(() => {
    if (activeSchoolId) {
      return institutionsList.find(inst => inst.id === activeSchoolId) || null;
    }
    if (user?.school_id) {
      return institutionsList.find(inst => inst.id === user.school_id) || null;
    }
    return institutionsList[0] || null;
  }, [activeSchoolId, user?.school_id, institutionsList]);

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

