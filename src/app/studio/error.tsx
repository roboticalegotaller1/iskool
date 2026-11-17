'use client';
import { PortalErrorFallback } from '@/components/layout/PortalSegmentFallback';
export default function StudioError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalErrorFallback {...props} portalLabel="Estudio de Actividades Interactivas" />;
}
