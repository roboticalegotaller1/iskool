"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface RowActionItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: boolean;
}

export interface RowActionMenuProps {
  actions: RowActionItem[];
  align?: 'right' | 'left';
  className?: string;
  triggerAriaLabel?: string;
}

export const RowActionMenu: React.FC<RowActionMenuProps> = ({
  actions,
  align = 'right',
  className = '',
  triggerAriaLabel = 'Opciones contextuales'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        aria-label={triggerAriaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-48 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800 shadow-xl shadow-slate-900/10 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="flex flex-col gap-0.5">
            {actions.map((action, idx) => {
              const Icon = action.icon;
              const isDanger = action.variant === 'danger';
              const isWarning = action.variant === 'warning';

              const itemClass = isDanger
                ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50"
                : isWarning
                ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 focus:bg-amber-50"
                : "text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 focus:bg-slate-100";

              return (
                <button
                  key={`${action.label}-${idx}`}
                  type="button"
                  disabled={action.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    action.onClick();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${itemClass}`}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
