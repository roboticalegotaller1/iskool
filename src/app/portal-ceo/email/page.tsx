'use client';

import React, { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CEOEmailCommunicationsModal } from '@/components/admin/CEOEmailCommunicationsModal';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useAuth } from '@/context/AuthContext';
import { buildHoldingForInstitution, DEFAULT_IBIME_HOLDING } from '@/components/admin/CEOExecutiveDashboard';
import { useNavigationStore } from '@/store/useNavigationStore';
import { Clock } from 'lucide-react';

function CEOEmailPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySchoolId = searchParams?.get('schoolId') || searchParams?.get('id');
  const { user } = useAuth();
  const { 
    institutionsList, 
    activeSchoolId, 
    campusesList, 
    detailedStudents, 
    teachersList 
  } = useSchoolAdminStore();

  const effectiveId = querySchoolId || activeSchoolId || user?.school_id || 'sch-ibime';
  const popBackUrl = useNavigationStore(state => state.popBackUrl);

  const currentInstitution = useMemo(() => {
    return institutionsList.find(inst => inst.id === effectiveId) || institutionsList[0] || null;
  }, [effectiveId, institutionsList]);

  const dynamicHolding = useMemo(() => {
    if (currentInstitution) {
      return buildHoldingForInstitution(currentInstitution, campusesList, detailedStudents, teachersList);
    }
    return DEFAULT_IBIME_HOLDING;
  }, [currentInstitution, campusesList, detailedStudents, teachersList]);

  const handleClose = () => {
    const fallback = user?.role === 'director' ? '/director' : '/admin';
    const target = popBackUrl('/portal-ceo/email', user?.role, fallback);
    router.push(target);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <CEOEmailCommunicationsModal
        key={effectiveId}
        isOpen={true}
        onClose={handleClose}
        holding={dynamicHolding}
        schoolId={effectiveId}
      />
    </div>
  );
}

export default function CEOEmailPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-5 h-5 animate-spin text-blue-400" />
          <span>Iniciando Consola de Correo Institucional CEO...</span>
        </div>
      </div>
    }>
      <CEOEmailPortalContent />
    </Suspense>
  );
}
