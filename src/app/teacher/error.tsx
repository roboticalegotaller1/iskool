'use client';
import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';
export default function TeacherError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalErrorFallback {...props} portalLabel="Portal Docente ISkool" />;
}
