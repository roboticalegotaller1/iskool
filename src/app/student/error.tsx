'use client';
import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';
export default function StudentError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalErrorFallback {...props} portalLabel="Portal del Estudiante ISkool" />;
}
