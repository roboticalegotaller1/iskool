"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'minimalist' | 'gamified';
export type ButtonIntent = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'minimalist',
  intent = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Dimensionamiento base
  const sizeClasses = {
    sm: variant === 'minimalist' ? 'px-3 py-1.5 text-xs rounded-xl gap-1.5' : 'px-3.5 py-1.5 text-xs rounded-2xl gap-1.5',
    md: variant === 'minimalist' ? 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2' : 'px-5 py-2.5 text-xs sm:text-sm rounded-2xl gap-2',
    lg: variant === 'minimalist' ? 'px-6 py-3 text-sm sm:text-base rounded-2xl gap-2.5' : 'px-7 py-3.5 text-sm sm:text-base rounded-3xl gap-2.5'
  }[size];

  // Estilos según variante: Minimalista (Docentes) vs Gamificado (Estudiantes)
  const variantIntentClasses = {
    minimalist: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-slate-400/50',
      outline: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-slate-300',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-semibold transition-colors',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-rose-500/50',
      gold: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-amber-500/50'
    },
    gamified: {
      primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black uppercase tracking-wider border border-indigo-400/40 shadow-lg shadow-indigo-600/30 glow-indigo transition-all hover:scale-102 active:scale-95',
      secondary: 'bg-slate-900/85 hover:bg-slate-800 text-teal-300 font-black uppercase tracking-wider border border-teal-500/40 shadow-md shadow-teal-950/40 glow-teal transition-all hover:scale-102 active:scale-95',
      outline: 'bg-indigo-950/50 hover:bg-indigo-900/70 border-2 border-indigo-400/60 text-indigo-200 font-black uppercase tracking-wider shadow-md transition-all hover:scale-102 active:scale-95',
      ghost: 'bg-white/5 hover:bg-white/15 text-slate-200 font-bold border border-white/10 transition-all hover:scale-102 active:scale-95',
      danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black uppercase tracking-wider border border-rose-400/40 shadow-lg shadow-rose-950/50 transition-all hover:scale-102 active:scale-95',
      gold: 'btn-golden-action glow-gold font-black uppercase tracking-wider transition-all hover:scale-103 active:scale-95'
    }
  }[variant][intent];

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center cursor-pointer select-none outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${variantIntentClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
