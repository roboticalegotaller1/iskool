import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  Receipt, 
  FileText, 
  Landmark, 
  HelpCircle,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const metadata = {
  title: 'Portal Financiero y Cobranza | ISkool',
  description: 'Gestión formal de colegiaturas, facturación electrónica CFDI 4.0 y estado de cuenta institucional.',
};

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Barra Superior Corporativa */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logotipo e Identidad Institucional */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold shadow-sm">
                <Building2 className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900 tracking-tight">ISkool</span>
                  <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    Finanzas
                  </span>
                </div>
                <div className="text-xs text-slate-500">Portal de Pagos y Facturación</div>
              </div>
            </div>

            {/* Distintivos de Seguridad Bancaria y Usuario */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Cifrado Bancario TLS 1.3 • PCI-DSS</span>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

              {/* Perfil del Padre de Familia */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-900">Prof. Israel López Ángeles</div>
                  <div className="text-[11px] text-slate-500">Tutor Responsable</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  IL
                </div>
                <Link 
                  href="/parent"
                  title="Volver al Portal Académico"
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </div>

      {/* Pie de Página Institucional Formal */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Infraestructura Segura con Cumplimiento Fiscal SAT (CFDI 4.0)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/parent" className="hover:text-slate-800 transition-colors">Portal Académico</Link>
            <span>•</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Aviso de Privacidad</span>
            <span>•</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Términos del Servicio</span>
          </div>
          <div>© 2026 ISkool Plataforma Educativa. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
