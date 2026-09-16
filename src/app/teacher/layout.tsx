"use client";

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
          <TeacherNavbar />
          <div className="flex-1 w-full">
            {children}
          </div>
        </div>
      </RoleGuard>
    </Suspense>
  );
}
