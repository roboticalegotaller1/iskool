"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ExecutiveAnalyticsStudio from '@/components/admin/ExecutiveAnalyticsStudio';

export default function AdminIntelligencePage() {
  const router = useRouter();

  return (
    <ExecutiveAnalyticsStudio 
      onBack={() => router.push('/admin')}
    />
  );
}
