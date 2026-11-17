'use client';
import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';
export default function DirectorError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalErrorFallback {...props} portalLabel="Portal de Dirección General" />;
}
