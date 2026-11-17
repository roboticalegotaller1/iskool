'use client';
import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';
export default function CoordinatorError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalErrorFallback {...props} portalLabel="Portal de Coordinación Académica" />;
}
