'use client';

import dynamic from 'next/dynamic';

const DemoGuidedTourDock = dynamic(
  () => import('@/components/demo/DemoGuidedTourDock').then((m) => m.DemoGuidedTourDock),
  { ssr: false }
);

const GlobalHelpFab = dynamic(
  () => import('@/components/help/GlobalHelpFab').then((m) => m.GlobalHelpFab),
  { ssr: false }
);

export function ClientFloatingShell() {
  return (
    <>
      <DemoGuidedTourDock />
      <GlobalHelpFab />
    </>
  );
}
