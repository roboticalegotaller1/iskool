'use client';

/**
 * @page /admin/crm
 * @description Ruta dedicada del CRM Escolar de ISkool.
 *   Módulo de captación, seguimiento y retención de familias.
 *   Aislado completamente del panel admin principal para no interferir con otros desarrollos.
 * @access superadmin, admin, owner, director, coordinator
 */
import dynamic from 'next/dynamic';

const CrmAdmissionsStudio = dynamic(
  () => import('@/components/crm/CrmAdmissionsStudio'),
  { ssr: false, loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
          <span className="text-3xl">📋</span>
        </div>
        <p className="text-slate-500 font-medium">Cargando CRM de Admisiones…</p>
      </div>
    </div>
  )}
);

export default function CrmPage() {
  return <CrmAdmissionsStudio />;
}
