"use client";

import React, { Suspense } from 'react';
import { Skeleton, CardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoader';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
          <div className="flex justify-between items-center py-2">
            <Skeleton className="w-56 h-8" />
            <Skeleton className="w-36 h-8" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={4} columns={5} />
        </div>
      }
    >
      <RoleGuard allowedRoles={['coordinator', 'billing']}>
        <a
          href="#portal-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-slate-900 focus:text-white focus:text-xs focus:font-bold focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        <div id="portal-main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
      </RoleGuard>
    </Suspense>
  );
}
