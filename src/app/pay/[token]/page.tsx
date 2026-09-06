'use client';

/**
 * Pasarela Nativa de Cobranza ISkool (/pay/[token])
 * Cero Gamificación • Seguridad Bancaria • Marca Blanca
 * Soporta Magic Links directos sin contraseñas para pagos con Tarjeta, SPEI y OXXO.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Landmark, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Download, 
  Receipt, 
  FileText, 
  AlertTriangle,
  Clock,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface PayTokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function PayTokenPage({ params }: PayTokenPageProps) {
  const [tokenValue, setTokenValue] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'spei' | 'store'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Formulario de tarjeta con validación
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('Israel López Ángeles');
  const [formError, setFormError] = useState<string | null>(null);

  // Datos estructurados del cargo
  const invoiceData = {
    invoiceNumber: 'COL-2026-00452',
    concept: 'Colegiatura de Septiembre 2026',
    schoolName: 'Colegio ISkool México',
    studentName: 'Mateo López Mendoza',
    studentGrade: '3º de Secundaria — Grupo A',
    parentName: 'Israel López Ángeles',
    subtotal: 3600.00,
    discount: 150.00,
    surcharge: 0.00,
    total: 3450.00,
    dueDate: '10 de Septiembre de 2026',
    speiClabe: '710969000145829103',
    speiBank: 'Sistema de Pagos Interbancarios (SPEI)',
    storeReference: '9845 2301 9842 1094'
  };

  useEffect(() => {
    params.then((p) => {
      setTokenValue(p.token);
      if (p.token === 'expired') {
        setIsExpired(true);
      }
    });
  }, [params]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    // Agrupar en bloques de 4
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  const handleCopyClabe = () => {
    navigator.clipboard.writeText(invoiceData.speiClabe);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setFormError('Por favor ingrese un número de tarjeta válido de 16 dígitos.');
        return;
      }
      if (cardExpiry.length < 5) {
        setFormError('Ingrese una fecha de expiración válida (MM/AA).');
        return;
      }
      if (cardCvv.length < 3) {
        setFormError('Ingrese el código de seguridad CVV (3 o 4 dígitos).');
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1800);
  };

  if (isExpired) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900">{invoiceData.schoolName}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Pasarela Financiera Institucional</div>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto w-full my-auto py-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Clock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Enlace de Pago Expirado</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Por políticas de seguridad bancaria, los enlaces directos de cobro tienen una vigencia estricta de 48 horas.
            </p>
            <Link
              href="/parent/financial"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm"
            >
              <span>Acceder al Portal de Pagos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200">
          <p>© 2026 {invoiceData.schoolName}. Todos los derechos reservados.</p>
        </footer>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900">{invoiceData.schoolName}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Comprobante Oficial de Pago</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transacción Cifrada TLS 1.3</span>
          </div>
        </header>

        <div className="max-w-lg mx-auto w-full my-auto py-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Pago Realizado con Éxito</h2>
              <p className="text-sm text-slate-500">Su pago ha sido acreditado en el sistema escolar institucional.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs text-slate-700 space-y-3 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Folio de Recibo:</span>
                <span className="font-mono font-semibold text-slate-900">REC-2026-098234</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Fecha de Operación:</span>
                <span className="text-slate-800">{new Date().toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Concepto:</span>
                <span className="font-semibold text-slate-900">{invoiceData.concept}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Alumno:</span>
                <span className="text-slate-800">{invoiceData.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="text-slate-800 uppercase">{selectedMethod === 'card' ? 'Tarjeta Bancaria' : selectedMethod === 'spei' ? 'Transferencia SPEI' : 'Tienda OXXO'}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold pt-2">
                <span className="text-slate-900">Total Pagado:</span>
                <span className="text-emerald-700 font-mono">${invoiceData.total.toFixed(2)} MXN</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`/api/billing/invoice/pdf?receipt_id=REC-2026-098234&uuid=4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D&amount=${invoiceData.total}&concept=${encodeURIComponent(invoiceData.concept)}&student=${encodeURIComponent(invoiceData.studentName)}&tax_name=${encodeURIComponent(invoiceData.parentName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm shadow-sm text-center"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Recibo Oficial (PDF)</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/api/billing/invoice/download?receipt_id=REC-2026-098234&format=xml&uuid=4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D&amount=${invoiceData.total}&concept=${encodeURIComponent(invoiceData.concept)}&student=${encodeURIComponent(invoiceData.studentName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-800 font-medium py-2.5 px-3 rounded-xl transition-colors text-xs border border-slate-300"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Descargar XML</span>
                </a>

                <Link
                  href="/parent/financial"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-3 rounded-xl transition-colors text-xs border border-slate-300"
                >
                  <span>Estado de Cuenta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200">
          <p>© 2026 {invoiceData.schoolName}. Comprobante emitido con validez institucional.</p>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Encabezado Superior */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900 tracking-tight">{invoiceData.schoolName}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Pasarela Financiera Segura • Marca Blanca</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Cifrado TLS 1.3 • PCI-DSS</span>
        </div>
      </header>

      {/* Contenedor Principal de Checkout */}
      <div className="max-w-5xl mx-auto w-full py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Columna Izquierda: Selección y Formulario del Método de Pago */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-700" />
                <span>Método de Pago</span>
              </h2>
              <p className="text-xs text-slate-500 mb-5">Seleccione la opción preferida para liquidar este cargo institucional.</p>

              {/* Selector de Pestañas de Pago */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedMethod === 'card'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mb-2 ${selectedMethod === 'card' ? 'text-blue-700' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-xs">Tarjeta</div>
                    <div className="text-[10px] text-slate-500">Crédito / Débito</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('spei')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedMethod === 'spei'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Landmark className={`w-5 h-5 mb-2 ${selectedMethod === 'spei' ? 'text-blue-700' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-xs">SPEI</div>
                    <div className="text-[10px] text-slate-500">Transferencia 24/7</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('store')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedMethod === 'store'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Store className={`w-5 h-5 mb-2 ${selectedMethod === 'store' ? 'text-blue-700' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-xs">Efectivo</div>
                    <div className="text-[10px] text-slate-500">OXXO / Paynet</div>
                  </div>
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Formulario Dinámico según Método */}
              <form onSubmit={handleProcessPayment}>
                {selectedMethod === 'card' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Número de Tarjeta</label>
                      <input
                        type="text"
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Vencimiento (MM/AA)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Código de Seguridad (CVV)</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nombre del Titular</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 uppercase"
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'spei' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Banco Receptor:</span>
                      <span className="font-semibold text-slate-900">{invoiceData.speiBank}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">CLABE Interbancaria Personalizada:</span>
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-300 shadow-sm">
                        <span className="font-mono text-sm font-bold text-blue-900">{invoiceData.speiClabe}</span>
                        <button
                          type="button"
                          onClick={handleCopyClabe}
                          className="flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded border border-slate-300 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedClabe ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed bg-blue-50/60 p-2.5 rounded border border-blue-100">
                      💡 La transferencia SPEI se acredita en tiempo real. Utilice el monto exacto de <strong>${invoiceData.total.toFixed(2)} MXN</strong>.
                    </div>
                  </div>
                )}

                {selectedMethod === 'store' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <div>
                      <span className="text-slate-500 block mb-1">Referencia Oficial de Pago en Tienda:</span>
                      <div className="bg-white p-3.5 rounded-lg border border-slate-300 text-center shadow-sm">
                        <div className="font-mono text-base font-bold text-slate-900 tracking-wider mb-1">{invoiceData.storeReference}</div>
                        <div className="text-[11px] text-slate-500">Presente este número de referencia en cajas de OXXO o comercios afiliados.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de Confirmación y Pago */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3.5 px-6 rounded-xl transition-all text-sm shadow-md"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Procesando Pago Seguro...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Confirmar y Pagar ${invoiceData.total.toFixed(2)} MXN</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Facturación Fiscal */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span className="font-medium text-slate-800">Facturación Automática SAT (CFDI 4.0 D10 - Colegiaturas)</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">RFC: LOAI840512AB3</span>
            </div>
          </div>

          {/* Columna Derecha: Resumen Formal del Cargo */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-3 border-b border-slate-200 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <span>Desglose de Cobranza</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Concepto:</span>
                  <span className="font-bold text-slate-900 text-sm">{invoiceData.concept}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Alumno Asignado:</span>
                  <span className="font-semibold text-slate-800">{invoiceData.studentName}</span>
                  <span className="text-slate-500 block text-[11px]">{invoiceData.studentGrade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Folio de Control:</span>
                  <span className="font-mono text-slate-700">{invoiceData.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Fecha Límite:</span>
                  <span className="font-medium text-slate-800">{invoiceData.dueDate}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  {invoiceData.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Descuento / Beca Pronto Pago:</span>
                      <span>-${invoiceData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoiceData.surcharge > 0 && (
                    <div className="flex justify-between text-rose-700 font-medium">
                      <span>Recargo por mora:</span>
                      <span>+${invoiceData.surcharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total a Liquidar:</span>
                    <span className="text-blue-900 font-mono">${invoiceData.total.toFixed(2)} MXN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificación de Seguridad */}
            <div className="bg-slate-100 rounded-xl p-4 text-[11px] text-slate-600 space-y-2 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Seguridad y Privacidad Financiera</span>
              </div>
              <p className="leading-relaxed">
                Su pago se procesa bajo estándares de seguridad bancaria. No almacenamos datos sensibles de tarjetas en nuestros servidores.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Pie de Página */}
      <footer className="max-w-5xl mx-auto w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200">
        <p>© 2026 {invoiceData.schoolName}. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
