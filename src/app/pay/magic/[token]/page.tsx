/**
 * Acceso Rápido por Enlace Mágico de Cobranza (Magic Link Route)
 * Valida el token criptográfico al vuelo y redirige al Checkout Institucional
 * Cero Gamificación • Seguridad Bancaria
 */

import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { magicLinkService } from '@/lib/magicLinkService';
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, Building2, Lock, ArrowRight, HelpCircle } from 'lucide-react';

interface MagicLinkPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function MagicLinkPage({ params }: MagicLinkPageProps) {
  const { token } = await params;
  
  // Validación criptográfica en el servidor
  const validation = await magicLinkService.validateToken(token);

  // Si es completamente válido, redirigimos a la pantalla de checkout formal con el token temporal y metadatos
  if (validation.isValid) {
    const invoiceId = validation.invoice?.id || validation.magicLink?.invoice_id || 'inv-101';
    const amount = validation.invoice?.total_amount || validation.magicLink?.metadata?.amount || 3450;
    const concept = encodeURIComponent(validation.invoice?.concept || validation.magicLink?.metadata?.concept || 'Colegiatura Escolar');
    const student = encodeURIComponent(validation.magicLink?.metadata?.studentName || 'Alumno');
    const parent = encodeURIComponent(validation.magicLink?.metadata?.parentName || 'Tutor');
    const invoiceNum = encodeURIComponent(validation.invoice?.invoice_number || validation.magicLink?.metadata?.invoiceNumber || 'COL-2026-00452');
    const dueDate = encodeURIComponent(validation.invoice?.due_date || validation.magicLink?.metadata?.dueDate || '10 de Septiembre de 2026');

    redirect(`/checkout/${invoiceId}?auth_token=${validation.temporaryPaymentToken}&source=magic_link&amount=${amount}&concept=${concept}&student=${student}&parent=${parent}&invoiceNumber=${invoiceNum}&dueDate=${dueDate}`);
  }

  // Si falló la validación, renderizamos una pantalla formal y elegante de seguridad bancaria
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Barra Superior Institucional */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-white tracking-tight">ISkool</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Pasarela Financiera Segura</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cifrado TLS 1.3</span>
        </div>
      </header>

      {/* Tarjeta Central de Estado / Error */}
      <div className="max-w-lg mx-auto w-full my-auto py-12">
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {validation.errorCode === 'ALREADY_PAID' ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Cargo Liquidado Previamente</h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                El cargo escolar vinculado a este enlace ya fue pagado con éxito. No es necesario realizar ninguna acción adicional.
              </p>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/60 text-left text-xs text-slate-300 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Concepto:</span>
                  <span className="font-semibold text-white">{validation.invoice?.concept || 'Colegiatura Escolar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Folio:</span>
                  <span className="font-mono text-slate-200">{validation.invoice?.invoice_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estatus:</span>
                  <span className="text-emerald-400 font-semibold uppercase">Pagado</span>
                </div>
              </div>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm shadow-lg shadow-blue-600/20"
              >
                <span>Acceder a Mi Portal Institucional</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : validation.errorCode === 'EXPIRED_TOKEN' ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Enlace de Pago Expirado</h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Por políticas de protección financiera y seguridad bancaria, los enlaces directos caducan tras 48 horas de emisión.
              </p>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/60 text-left text-xs text-slate-300 space-y-2 mb-6">
                <div className="text-slate-400 font-semibold mb-1">¿Cómo proceder?</div>
                <p className="leading-relaxed">
                  1. Inicie sesión en su portal de padre de familia para realizar el pago directamente.<br />
                  2. O bien, solicite al área administrativa del colegio la reexpedición de un nuevo enlace.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
              >
                <span>Ingresar con Usuario y Contraseña</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Enlace No Válido</h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                {validation.errorMessage || 'El token de seguridad proporcionado no coincide con ningún registro activo o ya fue consumido.'}
              </p>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/60 text-left text-xs text-slate-400 mb-6 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Si considera que se trata de un error, comuníquese con el departamento de cobranza de su plantel educativo.</span>
              </div>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
              >
                <span>Ir al Portal Principal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pie de Página Institucional */}
      <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Infraestructura Bancaria con Certificación PCI-DSS</span>
          </span>
          <span>•</span>
          <span>Integración Financiera Oficial</span>
          <span>•</span>
          <span>Facturación Electrónica CFDI 4.0</span>
        </div>
        <p>© 2026 ISkool Plataforma Educativa. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
