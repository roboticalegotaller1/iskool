"use client";

import React from 'react';
import Link from 'next/link';

export interface BentoCardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'minimalist' | 'gamified';
  colSpan?: string; // e.g. 'col-span-1', 'md:col-span-2', 'lg:col-span-2'
  rowSpan?: string; // e.g. 'row-span-1', 'row-span-2'
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  hoverable?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  variant = 'minimalist',
  colSpan = 'col-span-1',
  rowSpan = 'row-span-1',
  badge,
  icon,
  title,
  subtitle,
  footer,
  onClick,
  href,
  hoverable = true,
}) => {
  const isMinimalist = variant === 'minimalist';

  // Base styles reflecting the Bento System and Dual UX
  const baseCardStyles = isMinimalist
    ? "relative bg-white dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-50 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm shadow-slate-100 dark:shadow-none flex flex-col justify-between overflow-hidden"
    : "relative bg-slate-900/90 text-white border border-slate-800 rounded-3xl p-6 shadow-gamified-card flex flex-col justify-between overflow-hidden";

  const hoverStyles = hoverable
    ? isMinimalist
      ? "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-blue-400/50 cursor-pointer"
      : "transition-all duration-300 hover:scale-[1.02] hover:shadow-gamified-hud hover:border-amber-500/50 cursor-pointer"
    : "";

  const combinedClassName = `${colSpan} ${rowSpan} ${baseCardStyles} ${hoverStyles} ${className}`.trim();

  const content = (
    <>
      <div className="space-y-4 relative z-10 w-full">
        {/* Header: Icon & Badge */}
        {(icon || badge) && (
          <div className="flex items-center justify-between gap-3 w-full">
            {icon && (
              <div className="shrink-0 flex items-center justify-center">
                {icon}
              </div>
            )}
            {badge && (
              <div className="shrink-0">
                {badge}
              </div>
            )}
          </div>
        )}

        {/* Title & Subtitle */}
        {(title || subtitle) && (
          <div className="space-y-1.5">
            {subtitle && (
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {subtitle}
              </div>
            )}
            {title && (
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h3>
            )}
          </div>
        )}

        {/* Custom Body / Children */}
        {children && (
          <div className="w-full">
            {children}
          </div>
        )}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/70 relative z-10 w-full">
          {footer}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={combinedClassName}>
      {content}
    </div>
  );
};
