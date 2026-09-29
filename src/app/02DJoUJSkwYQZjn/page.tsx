"use client";

import React from 'react';
import UnifiedLoginView from '@/components/auth/UnifiedLoginView';

/**
 * Portal Secreto de Demostración Exclusiva del Instituto Bilingüe IBIME.
 * Blindado herméticamente para mostrar únicamente la identidad y cuentas del IBIME:
 * Directiva de Planteles (Montes, Lagos, San Cristóbal, Coacalco), Coordinación Académica,
 * Docentes Bilingües STEAM, Alumnos con Perfil 360 y Familias.
 * PROHIBICIÓN ESTRICTA: Cero superusuarios o directivos globales de iSkool en este portal.
 */
export default function IbimeShowcasePage() {
  return <UnifiedLoginView mode="ibime_demo" />;
}
