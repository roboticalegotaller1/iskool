"use client";

import { useAuth } from '@/context/AuthContext';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { isPlatformSuperUser } from '@/types';

/**
 * Hook universal de comprobación de Super Usuario en ISkool.
 * Valida tanto la sesión de AuthContext como el estado en memoria de SchoolAdminStore.
 * Regla Estricta: Solo Super Usuarios pueden ver la palabra "tokens" y los conteos exactos de tokens.
 */
export function useIsSuperUser(): boolean {
  const { user } = useAuth();
  const staffUsers = useSchoolAdminStore((s) => s.staffUsers);
  const target = user || staffUsers?.find((u) => isPlatformSuperUser(u));

  if (!target) return false;

  return (
    isPlatformSuperUser(target) ||
    target.role === 'admin' ||
    target.role === 'superadmin' ||
    target.role === 'owner' ||
    target.role === 'ceo' ||
    Boolean(target.id?.startsWith('usr-superadmin')) ||
    target.id === 'usr-admin-1'
  );
}

/**
 * Hook para obtener la telemetría de tokens exclusiva para el Super Usuario.
 * Retorna isSuperUser y los conteos precisos acumulados de tokens por docente.
 */
export function useSuperUserTokenMetrics() {
  const isSuper = useIsSuperUser();
  const teachers = useSchoolAdminStore((s) => s.teachersList);

  const totalTokensConsumed = (teachers || []).reduce(
    (acc: number, t) => acc + (t.ai_tokens_consumed || 0),
    0
  );

  const totalTokenQuota = (teachers || []).reduce(
    (acc: number, t) => acc + (t.token_quota || 250000),
    0
  );

  return {
    isSuperUser: isSuper,
    totalTokensConsumed,
    totalTokenQuota: totalTokenQuota || 1500000,
    estimatedCostUsd: Number((totalTokensConsumed * 0.000002).toFixed(3))
  };
}
