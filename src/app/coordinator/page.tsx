export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @file src/app/coordinator/page.tsx
 * @description Servidor de Página para el Dashboard de Coordinación iSkool.
 * Configurado con dynamic = 'force-dynamic' y revalidate = 0 para garantizar renderizado
 * dinámico en tiempo de ejecución (AWS Amplify / Producción).
 */

import React from 'react';
import CoordinatorDashboard from './CoordinatorDashboardClient';

export default function CoordinatorPage() {
  return <CoordinatorDashboard />;
}
