"use client";

import { useEffect, useState } from 'react';

import { CDMX_TIMEZONE } from '@/utils/timeZoneUtils';

interface FormattedDateProps {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  prefix?: string;
  className?: string;
}

export function FormattedDate({ date, options, prefix = '', className = '' }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>...</span>;
  }

  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: CDMX_TIMEZONE
    };
    const effectiveOptions = options ? { timeZone: CDMX_TIMEZONE, ...options } : defaultOptions;
    const formatted = new Date(date).toLocaleDateString('es-MX', effectiveOptions);
    return <span className={className}>{prefix}{formatted}</span>;
  } catch (e) {
    return <span className={className}>...</span>;
  }
}
