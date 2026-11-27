'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';

const DemoGuidedTourDock = dynamic(
  () => import('@/components/demo/DemoGuidedTourDock').then((m) => m.DemoGuidedTourDock),
  { ssr: false }
);

const GlobalHelpFab = dynamic(
  () => import('@/components/help/GlobalHelpFab').then((m) => m.GlobalHelpFab),
  { ssr: false }
);

export function ClientFloatingShell() {
  const { user } = useAuth();
  const isDemoUser = Boolean(
    user &&
      isDemoSandboxContext({
        email: user.email,
        schoolId: user.school_id,
        userId: user.id,
      })
  );

  return (
    <>
      {isDemoUser && <DemoGuidedTourDock />}
      <GlobalHelpFab />
    </>
  );
}
