"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHydration } from '@/hooks/useHydration';
import { Loader } from '@/components/Loader';
import dynamic from 'next/dynamic';

import { useNavigationStore } from '@/store/useNavigationStore';

const AvatarCustomizer = dynamic(
  () => import('@/components/AvatarCustomizer').then((m) => m.AvatarCustomizer),
  {
    ssr: false,
    loading: () => <Loader message="Cargando vestidor interactivo de avatar..." />,
  }
);

export default function AvatarCustomizerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isHydrated = useHydration();
  const popBackUrl = useNavigationStore(state => state.popBackUrl);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (!isHydrated || loading || !user) {
    return <Loader message="Cargando vestidor de avatar..." />;
  }

  const handleClose = () => {
    const target = popBackUrl('/student/avatar', user?.role, '/student');
    router.push(target);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <AvatarCustomizer 
        isOpen={true} 
        onClose={handleClose} 
      />
    </div>
  );
}
