'use client';

import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PortalErrorFallback error={error} reset={reset} portalLabel="Plataforma Educativa ISkool" />;
}
