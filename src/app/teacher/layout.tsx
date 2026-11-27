import React, { Suspense } from 'react';
import { Skeleton, CardSkeleton, HeroBannerSkeleton } from '@/components/ui/SkeletonLoader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { TeacherNavbar } from '@/components/layout/TeacherNavbar';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
          <div className="flex justify-between items-center py-2">
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-32 h-8" />
          </div>
          <HeroBannerSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      }
    >
      <RoleGuard allowedRoles={['teacher', 'admin', 'superadmin', 'owner', 'director', 'coordinator']}>
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
          <a
            href="#portal-main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-slate-900 focus:text-white focus:text-xs focus:font-bold focus:shadow-lg"
          >
            Saltar al contenido principal
          </a>
          <TeacherNavbar />
          <div id="portal-main-content" tabIndex={-1} className="flex-1 w-full outline-none">
            {children}
          </div>
        </div>
      </RoleGuard>
    </Suspense>
  );
}
