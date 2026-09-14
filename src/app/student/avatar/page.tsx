"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHydration } from '@/hooks/useHydration';
import { Loader } from '@/components/Loader';
import { AvatarCustomizer } from '@/components/AvatarCustomizer';

export default function AvatarCustomizerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isHydrated = useHydration();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!isHydrated || loading || !user) {
    return <Loader message="Cargando vestidor de avatar..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <AvatarCustomizer 
        isOpen={true} 
        onClose={() => router.push('/student')} 
      />
    </div>
  );
}
