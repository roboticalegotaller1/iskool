'use client';
import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';
export default function AdminError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalErrorFallback {...props} portalLabel="Portal Administrativo y Dirección" />;
}
