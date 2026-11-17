'use client';
import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';
export default function ParentError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalErrorFallback {...props} portalLabel="Portal de Padres y Tutores" />;
}
