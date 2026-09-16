"use client";

import React, { Suspense } from 'react';
import { Skeleton, CardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoader';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminLayout({
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
            <Skeleton className="w-40 h-8" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton lines={2} className="h-32" />
            <CardSkeleton lines={2} className="h-32" />
            <CardSkeleton lines={2} className="h-32" />
            <CardSkeleton lines={2} className="h-32" />
          </div>
          <TableSkeleton rows={6} columns={6} />
        </div>
      }
    >
      <RoleGuard allowedRoles={['admin', 'superadmin', 'owner']}>
        {children}
      </RoleGuard>
    </Suspense>
  );
}
