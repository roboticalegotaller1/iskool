"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import CEOExecutiveDashboard, { DEFAULT_IBIME_HOLDING } from '@/components/admin/CEOExecutiveDashboard';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';

export default function CEOExecutiveDashboardPage() {
  const router = useRouter();
  const { schoolSettings } = useSchoolAdminStore();

  // Si la escuela tiene configuración institucional personalizada, adaptamos el holding dinámicamente
  const dynamicHolding = {
    ...DEFAULT_IBIME_HOLDING,
    name: schoolSettings?.name?.includes('IBIME') ? 'IBIME' : (schoolSettings?.name || DEFAULT_IBIME_HOLDING.name),
  };

  return (
    <CEOExecutiveDashboard 
      holding={dynamicHolding}
      onSwitchToOperational={() => router.push('/admin')}
    />
  );
}
