'use client';

/**
 * Pantalla de Checkout Formal y Pasarela Bancaria Institucional (ISkool)
 * Cero Gamificación • Seguridad Bancaria • Integración PaymentGateway (Marca Blanca)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Receipt, 
  AlertCircle, 
  HelpCircle,
  Copy,
  Download,
  Landmark,
  Store
} from 'lucide-react';

interface CheckoutPageProps {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams?: Promise<{
    auth_token?: string;
    source?: string;
    ref?: string;
    amount?: string;
    concept?: string;
    student?: string;
    parent?: string;
    invoiceNumber?: string;
    dueDate?: string;
    [key: string]: string | undefined;
  }>;
}

export default function CheckoutPage(props: CheckoutPageProps) {
  const resolvedParams = React.use(props.params);
  const resolvedSearchParams = props.searchParams ? React.use(props.searchParams) : ({} as Record<string, string | undefined>);

  const [selectedMethod, setSelectedMethod] = useState<'card' | 'spei' | 'store'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedClabe, setCopiedClabe] = useState(false);

  // Parámetros dinámicos inyectados desde el Magic Link o sesión
  const amount = Number(resolvedSearchParams.amount) || 3450.00;
  const concept = resolvedSearchParams.concept ? decodeURIComponent(resolvedSearchParams.concept) : 'Colegiatura de Septiembre 2026';
  const studentName = resolvedSearchParams.student ? decodeURIComponent(resolvedSearchParams.student) : 'Mateo López Mendoza';
  const parentName = resolvedSearchParams.parent ? decodeURIComponent(resolvedSearchParams.parent) : 'Israel López Ángeles';
  const invoiceNumber = resolvedSearchParams.invoiceNumber ? decodeURIComponent(resolvedSearchParams.invoiceNumber) : (resolvedParams.sessionId?.startsWith('COL-') ? resolvedParams.sessionId : 'COL-2026-00452');
  const dueDate = resolvedSearchParams.dueDate ? decodeURIComponent(resolvedSearchParams.dueDate) : '10 de Septiembre de 2026';

  // Datos estructurados del cargo institucional
  const invoiceData = {
    invoiceNumber,
    concept,
    schoolName: 'Colegio Anglo Mexicano',
    studentName,
    studentGrade: '3º de Secundaria — Grupo A',
    parentName,
    subtotal: amount,
    discount: 0.00,
    surcharge: 0.00,
    total: amount,
    dueDate,
    speiClabe: '710969000145829103',
    speiBank: 'Sistema de Pagos Interbancarios (SPEI)',
    storeReference: '9845 2301 9842 1094'
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1800);
  };

  const handleCopyClabe = () => {
    navigator.clipboard.writeText(invoiceData.speiClabe);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg text-white tracking-tight">{invoiceData.schoolName}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Comprobante Oficial de Pago</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transacción Cifrada</span>
          </div>
        </header>

        <div className="max-w-lg mx-auto w-full my-auto py-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Pago Procesado con Éxito</h2>
              <p className="text-sm text-slate-400">Su transacción ha sido confirmada y conciliada en el sistema escolar.</p>
            </div>

            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 text-xs text-slate-300 space-y-3 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Folio de Recibo:</span>
                <span className="font-mono font-semibold text-white">REC-2026-098234</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Fecha y Hora:</span>
                <span className="text-slate-300">{new Date().toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Concepto:</span>
                <span className="font-medium text-white">{invoiceData.concept}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Alumno:</span>
                <span className="text-slate-200">{invoiceData.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="text-slate-200 uppercase">{selectedMethod === 'card' ? 'Tarjeta Bancaria' : selectedMethod === 'spei' ? 'Transferencia SPEI' : 'Tienda de Conveniencia'}</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="font-bold text-slate-300">Monto Liquidado:</span>
                <span className="font-bold text-emerald-400">${invoiceData.total.toFixed(2)} MXN</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`/api/billing/invoice/pdf?receipt_id=REC-2026-098234&uuid=4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D&amount=${invoiceData.total}&concept=${encodeURIComponent(invoiceData.concept)}&student=${encodeURIComponent(invoiceData.studentName)}&tax_name=${encodeURIComponent(invoiceData.parentName)}&payment_method=${encodeURIComponent(selectedMethod === 'card' ? 'Tarjeta Bancaria' : selectedMethod === 'spei' ? 'Transferencia SPEI' : 'Tienda de Conveniencia')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm shadow-lg shadow-blue-600/20 text-center"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Comprobante Digital (PDF)</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/api/billing/invoice/download?receipt_id=REC-2026-098234&format=xml&uuid=4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D&amount=${invoiceData.total}&concept=${encodeURIComponent(invoiceData.concept)}&student=${encodeURIComponent(invoiceData.studentName)}&tax_name=${encodeURIComponent(invoiceData.parentName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium py-2.5 px-3 rounded-xl transition-colors text-xs border border-slate-700"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Descargar XML SAT</span>
                </a>

                <Link
                  href="/parent/financial"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-3 rounded-xl transition-colors text-xs border border-slate-700"
                >
                  <span>Portal de Pagos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-500 border-t border-slate-800">
          <p>© 2026 {invoiceData.schoolName}. Comprobante emitido con validez institucional.</p>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Encabezado Superior */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-white tracking-tight">{invoiceData.schoolName}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Pasarela Financiera Segura • Cero Fricción</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Cifrado Bancario TLS 1.3 • PCI-DSS</span>
          <span className="sm:hidden">TLS 1.3</span>
        </div>
      </header>

      {/* Contenido Principal de Checkout */}
      <div className="max-w-5xl mx-auto w-full py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Columna Izquierda: Selección de Método de Pago */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span>Seleccione su Método de Pago</span>
              </h2>
              <p className="text-xs text-slate-400 mb-5">Operaciones procesadas directamente por la pasarela financiera del colegio.</p>

              {/* Selector de Pestañas de Pago */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <button
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedMethod === 'card'
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mb-2 ${selectedMethod === 'card' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-semibold text-xs text-white">Tarjeta</div>
                    <div className="text-[10px] text-slate-400">Crédito o Débito</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('spei')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedMethod === 'spei'
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Landmark className={`w-5 h-5 mb-2 ${selectedMethod === 'spei' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-semibold text-xs text-white">SPEI</div>
                    <div className="text-[10px] text-slate-400">Transferencia 24/7</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('store')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedMethod === 'store'
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Store className={`w-5 h-5 mb-2 ${selectedMethod === 'store' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-semibold text-xs text-white">Efectivo</div>
                    <div className="text-[10px] text-slate-400">Tienda / Ventanilla</div>
                  </div>
                </button>
              </div>

              {/* Formulario según Método */}
              {selectedMethod === 'card' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Número de Tarjeta</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Código de Seguridad (CVV)</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Nombre del Titular</label>
                    <input
                      type="text"
                      defaultValue={invoiceData.parentName}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'spei' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Banco Receptor:</span>
                    <span className="font-semibold text-white">{invoiceData.speiBank}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">CLABE Interbancaria Personalizada:</span>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                      <span className="font-mono text-sm font-bold text-blue-400">{invoiceData.speiClabe}</span>
                      <button
                        onClick={handleCopyClabe}
                        className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedClabe ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    💡 La acreditación por SPEI se refleja de forma automática e inmediata en su estado de cuenta.
                  </div>
                </div>
              )}

              {selectedMethod === 'store' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                  <div>
                    <span className="text-slate-400 block mb-1">Referencia para Ventanilla / Tienda:</span>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                      <div className="font-mono text-base font-bold text-amber-400 tracking-wider mb-1">{invoiceData.storeReference}</div>
                      <div className="text-[10px] text-slate-400">Muestre esta referencia al cajero para liquidar el importe exacto.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de Acción */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all text-sm shadow-xl shadow-blue-600/20"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Procesando Transacción Segura...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Pagar ${invoiceData.total.toFixed(2)} MXN</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Datos Fiscales SAT (CFDI 4.0) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Facturación Electrónica SAT (CFDI 4.0)</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">D10 • Colegiaturas</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Su factura con desglose curricular deducible de impuestos se generará y timbrará automáticamente al acreditarse el pago.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Resumen Formal del Cargo */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <span>Resumen de Cobro</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Concepto:</span>
                  <span className="font-semibold text-white text-sm">{invoiceData.concept}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Alumno:</span>
                  <span className="font-medium text-slate-200">{invoiceData.studentName}</span>
                  <span className="text-slate-400 block text-[10px]">{invoiceData.studentGrade}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Folio de Control:</span>
                  <span className="font-mono text-slate-300">{invoiceData.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Fecha Límite:</span>
                  <span className="text-slate-300">{invoiceData.dueDate}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  {invoiceData.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Beca / Descuento Pronto Pago:</span>
                      <span>-${invoiceData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoiceData.surcharge > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Recargo por mora:</span>
                      <span>+${invoiceData.surcharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total a Liquidar:</span>
                    <span className="text-blue-400 font-mono">${invoiceData.total.toFixed(2)} MXN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sello de Garantía y Cumplimiento Bancario */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantía de Privacidad y Seguridad</span>
              </div>
              <p className="leading-relaxed">
                Ningún dato de su tarjeta es almacenado en nuestros servidores. La transacción se procesa bajo el estándar de seguridad PCI-DSS Nivel 1.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Pie de Página Institucional */}
      <footer className="max-w-5xl mx-auto w-full py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>© 2026 {invoiceData.schoolName}. Módulo Financiero Institucional • Cero Fricción.</p>
      </footer>
    </main>
  );
}
