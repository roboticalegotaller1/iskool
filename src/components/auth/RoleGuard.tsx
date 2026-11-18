"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isRoleTransitionInFlight } from '@/context/AuthContext';
import { Loader } from '@/components/Loader';
import { isPlatformSuperUser } from '@/types';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading, isSwitchingRole } = useAuth();
  const router = useRouter();

  // Solo los 3 Super Usuarios oficiales de ISkool tienen pase de supervisión global.
  // Dueños de escuela (owner) y demás roles están estrictamente sujetos a allowedRoles de su módulo.
  const isSuperExecutive = user && isPlatformSuperUser(user);
  const isAllowed = user && (isSuperExecutive || allowedRoles.includes(user.role));
  const inRoleTransition = Boolean(isSwitchingRole || isRoleTransitionInFlight());

  useEffect(() => {
    if (!loading && !inRoleTransition) {
      if (!user) {
        router.replace('/login');
      } else if (!isAllowed) {
        // Redirigir al usuario estrictamente a su propio portal según su rol con replace para no atrapar el historial
        switch (user.role) {
          case 'teacher':
            router.replace('/teacher');
            break;
          case 'parent':
          case 'tutor':
            router.replace('/parent');
            break;
          case 'coordinator':
            router.replace('/coordinator');
            break;
          case 'billing':
            router.replace('/coordinator/billing');
            break;
          case 'director':
            router.replace('/director');
            break;
          case 'ceo':
          case 'owner':
          case 'superadmin':
          case 'admin':
            router.replace('/admin');
            break;
          case 'student':
          default:
            router.replace('/student');
            break;
        }
      }
    }
  }, [user, loading, isAllowed, inRoleTransition, router]);

  if (loading) {
    return <Loader message="Comprobando credenciales de acceso..." />;
  }

  if (!user) {
    return <Loader message="Redirigiendo a tu espacio institucional..." />;
  }

  if (!isAllowed) {
    if (inRoleTransition) {
      return <>{children}</>;
    }
    return <Loader message="Redirigiendo a tu espacio institucional..." />;
  }

  return <>{children}</>;
}
