"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/Loader';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAllowed = user && (user.role === 'admin' || allowedRoles.includes(user.role));

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
            router.push('/parent');
            break;
          case 'coordinator':
            router.push('/coordinator');
            break;
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
