"use client";

import React from 'react';
import UnifiedLoginView from '@/components/auth/UnifiedLoginView';

/**
 * Portada Oficial de Acceso Institucional iSkool.
 * Exclusivamente para usuarios y docentes institucionales.
 * Cero cuentas de demostración o accesos demo expuestos.
 */
export default function LoginPage() {
  return <UnifiedLoginView mode="public" />;
}
