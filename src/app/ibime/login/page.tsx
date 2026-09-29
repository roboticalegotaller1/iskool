"use client";

import React from 'react';
import UnifiedLoginView from '@/components/auth/UnifiedLoginView';

/**
 * Portal Oficial de Acceso Institucional IBIME.
 * Provee acceso seguro tanto con cuentas institucionales como con perfiles de demostración IBIME.
 */
export default function IbimeLoginPage() {
  return <UnifiedLoginView mode="ibime_demo" />;
}
