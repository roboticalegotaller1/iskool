"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/Loader";

const AdminPortalHub = dynamic(() => import("./AdminPortalHub"), {
  ssr: false,
  loading: () => <Loader message="Cargando centro de mando..." />,
});

// La portada llega ya renderizada desde el servidor: así su HTML viaja en la respuesta inicial y su código no pesa en el cliente.
export default function HomeClient({ landing }: { landing: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // En app.iskool.mx abre directo al login; en iskool.mx se queda en la portada pública
        if (typeof window !== 'undefined') {
          const host = window.location.hostname.toLowerCase();
          if (host.startsWith('app.') || host.includes('app.iskool.mx')) {
            router.replace('/login');
            return;
          }
        }
        return;
      } else if (user.role !== 'admin') {
        // Redirigir a cada cuenta exclusivamente a su propio portal
        switch (user.role) {
          case 'student':
            router.replace('/student');
            break;
          case 'teacher':
            router.replace('/teacher');
            break;
          case 'parent':
            router.replace('/parent');
            break;
          case 'coordinator':
            router.replace('/coordinator');
            break;
          default:
            router.replace('/login');
            break;
        }
      }
    }
  }, [user, loading, router]);

  // Visitantes sin sesión (y la carga inicial): página de inicio pública con enlaces legales.
  if (loading || !user) {
    return landing;
  }

  // Usuarios con sesión que no son Super Usuario: se redirigen a su portal
  if (user.role !== 'admin') {
    return <Loader message="Verificando permisos de super usuario..." />;
  }

  return <AdminPortalHub />;
}
