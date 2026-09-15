"use client";

import React from 'react';

export type CardVariant = 'minimalist' | 'gamified';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: CardPadding;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'minimalist',
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}, ref) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  }[padding];

  const variantClasses = {
    minimalist: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-corporate-card ${
      hoverable ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''
    }`,
    gamified: `bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 text-slate-100 rounded-3xl shadow-gamified-card ${
      hoverable ? 'transition-all duration-200 hover:border-indigo-400/60 hover:shadow-gamified-hud hover:scale-[1.01]' : ''
    }`
  }[variant];

  return (
    <div
      ref={ref}
      className={`${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
