"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/Loader';
import { isPlatformSuperUser } from '@/types';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Solo los 3 Super Usuarios oficiales de ISkool tienen pase de supervisión global.
  // Dueños de escuela (owner) y demás roles están estrictamente sujetos a allowedRoles de su módulo.
  const isSuperExecutive = user && isPlatformSuperUser(user);
  const isAllowed = user && (isSuperExecutive || allowedRoles.includes(user.role));

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAllowed) {
        // Redirigir al usuario estrictamente a su propio portal según su rol
        switch (user.role) {
          case 'teacher':
            router.push('/teacher');
            break;
          case 'parent':
          case 'tutor':
            router.push('/parent');
            break;
          case 'coordinator':
            router.push('/coordinator');
            break;
          case 'billing':
            router.push('/coordinator/billing');
            break;
          case 'director':
            router.push('/director');
            break;
          case 'owner':
          case 'superadmin':
          case 'admin':
            router.push('/admin');
            break;
          case 'student':
          default:
            router.push('/student');
            break;
        }
      }
    }
  }, [user, loading, isAllowed, router]);

  if (loading) {
    return <Loader message="Comprobando credenciales de acceso..." />;
  }

  if (!user || !isAllowed) {
    return <Loader message="Redirigiendo a tu espacio institucional..." />;
  }

  return <>{children}</>;
}
