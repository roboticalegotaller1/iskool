"use client";

import React, { useMemo, useRef, useState } from 'react';
import { SuperUserCommandCenter } from '@/components/admin/SuperUserCommandCenter';
import { SuperUserFourQuadrantCockpit } from '@/components/ergonomics/SuperUserFourQuadrantCockpit';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';

export default function SuperUserPage() {
  const rawInstitutions = useSchoolAdminStore((s) => s.institutionsList);
  const activeSchoolsCount = useMemo(() => {
    const list = rawInstitutions || [];
    return list.filter((inst) => inst.status !== 'inactive').length || list.length;
  }, [rawInstitutions]);

  const [tabOverride, setTabOverride] = useState<{
    tab: 'governance' | 'tokens' | 'vault' | 'audit';
    nonce: number;
  } | null>(null);
  const commandCenterRef = useRef<HTMLDivElement | null>(null);

  const handleOpenSecurityAudit = () => {
    setTabOverride({ tab: 'audit', nonce: Date.now() });
    commandCenterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SuperUserFourQuadrantCockpit
          activeSchoolsCount={activeSchoolsCount}
          onOpenSecurityAuditTab={handleOpenSecurityAudit}
        />
      </div>
      <div ref={commandCenterRef}>
        <SuperUserCommandCenter activeTabOverride={tabOverride} />
      </div>
    </div>
  );
}
