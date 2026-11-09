"use client";

import React from 'react';
import { SuperUserCommandCenter } from '@/components/admin/SuperUserCommandCenter';
import { SuperUserFourQuadrantCockpit } from '@/components/ergonomics/SuperUserFourQuadrantCockpit';

export default function SuperUserPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SuperUserFourQuadrantCockpit />
      </div>
      <SuperUserCommandCenter />
    </div>
  );
}
