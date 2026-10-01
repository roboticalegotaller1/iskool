"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigationStore } from '@/store/useNavigationStore';

export interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  sublabel?: string;
  variant?: 'default' | 'subtle' | 'ghost' | 'header';
  className?: string;
  showIcon?: boolean;
}

export function BackButton({
  fallbackUrl,
  label = 'Volver',
  sublabel,
  variant = 'default',
  className = '',
  showIcon = true,
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const popBackUrl = useNavigationStore(state => state.popBackUrl);
  const previousPath = useNavigationStore(state => state.previousPath);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetUrl = popBackUrl(pathname, user?.role, fallbackUrl);
    router.push(targetUrl);
  };

  // Estilos según variante
  let variantStyles = 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border-slate-700/80 hover:border-slate-600 shadow-sm';
  if (variant === 'subtle') {
    variantStyles = 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-2xs';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent';
  } else if (variant === 'header') {
    variantStyles = 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border-indigo-500/40 hover:border-cyan-400/60 shadow-lg shadow-indigo-950/50';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-2xl border text-xs font-bold transition-all group cursor-pointer select-none active:scale-95 ${variantStyles} ${className}`}
    >
      {showIcon && (
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 shrink-0" />
      )}
      <div className="flex flex-col text-left leading-none">
        <span>{label}</span>
        {sublabel && (
          <span className="text-[10px] font-normal opacity-75 mt-0.5">{sublabel}</span>
        )}
      </div>
    </button>
  );
}
