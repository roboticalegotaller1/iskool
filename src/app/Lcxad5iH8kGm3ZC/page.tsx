"use client";

import React from 'react';
import UnifiedLoginView from '@/components/auth/UnifiedLoginView';

/**
 * Portal Secreto de Demostración Completa de iSkool.
 * Contiene todos los perfiles de demostración (Docentes, Estudiantes, Gestión y Superusuarios de Plataforma)
 * con acceso en 1 clic e inicio de sesión funcional.
 */
export default function FullDemoShowcasePage() {
  return <UnifiedLoginView mode="full_demo" />;
}
