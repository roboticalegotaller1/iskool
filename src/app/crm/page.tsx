'use client';

/**
 * @page /crm
 * @description Ruta directa e independiente del CRM Escolar 360°.
 *   Permite acceso directo para demostraciones, revisiones directas y directivos
 *   sin depender de layouts o restricciones de roles intermedias.
 */
import dynamic from 'next/dynamic';

const CrmAdmissionsStudio = dynamic(
  () => import('@/components/crm/CrmAdmissionsStudio'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse text-white shadow-lg">
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-slate-600 font-semibold text-sm">Cargando CRM de Admisiones…</p>
        </div>
      </div>
    ),
  }
);

export default function DirectCrmPage() {
  return <CrmAdmissionsStudio />;
}
