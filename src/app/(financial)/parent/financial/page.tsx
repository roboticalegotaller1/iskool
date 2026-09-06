'use client';

/**
 * Portal Financiero del Padre — Estado de Cuenta y Cobranza (ISkool)
 * Cero Gamificación • Seguridad Bancaria • Fondos Claros • Estilo Corporativo
 * Facturación Automática SAT (CFDI 4.0) • Descarga de XML y PDF
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Receipt, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Landmark, 
  User, 
  Calendar, 
  Building2, 
  Search,
  Filter,
  Check,
  ExternalLink,
  ChevronDown,
  FileCode,
  Sparkles,
  Zap,
  Info,
  AlertTriangle
} from 'lucide-react';
import { PaymentGatewayService } from '@/lib/paymentGateway';
import { validateRfc, validateCurp } from '@/lib/fiscal/fiscalValidation';

interface ChargeItem {
  id: string;
  invoiceNumber: string;
  concept: string;
  studentName: string;
  studentGrade: string;
  category: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  surcharge: number;
  total: number;
  status: 'pending' | 'overdue' | 'paid';
}

interface PaymentRecord {
  id: string;
  receiptNumber: string;
  concept: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  cfdiUuid?: string;
  status: 'succeeded';
}

export default function ParentFinancialStatementPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'tax'>('pending');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSavingTax, setIsSavingTax] = useState<boolean>(false);
  const [taxFormSaved, setTaxFormSaved] = useState<boolean>(false);
  const [taxError, setTaxError] = useState<string | null>(null);

  // Formulario Fiscal SAT (CFDI 4.0 & Complemento IEDU)
  const [taxData, setTaxData] = useState({
    rfc: 'LOAI840512AB3',
    taxName: 'ISRAEL LOPEZ ANGELES',
    taxRegime: '605', // Sueldos y Salarios
    postalCode: '06700',
    cfdiUse: 'D10', // Colegiaturas
    studentCurp: 'LOMA080912HDFZNS01',
    educationLevel: 'Secundaria',
    billingEmail: 'israel.lopez@ejemplo.com',
    autoInvoiceOnPayment: true
  });

  const [curpValidation, setCurpValidation] = useState<{ isValid: boolean; error?: string }>({
    isValid: true
  });

  // Validación de RFC en vivo
  const [rfcValidation, setRfcValidation] = useState<{ isValid: boolean; type?: 'fisica' | 'moral'; error?: string }>({
    isValid: true,
    type: 'fisica'
  });

  useEffect(() => {
    // Cargar datos fiscales iniciales desde el backend
    async function loadBillingProfile() {
      try {
        const res = await fetch('/api/billing/profile?parent_id=usr-parent-001');
        const json = await res.json();
        if (json.success && json.profile) {
          setTaxData(prev => ({
            ...prev,
            rfc: json.profile.rfc || prev.rfc,
            taxName: json.profile.tax_name || prev.taxName,
            taxRegime: json.profile.tax_regime || prev.taxRegime,
            postalCode: json.profile.postal_code || prev.postalCode,
            cfdiUse: json.profile.cfdi_use || prev.cfdiUse,
            studentCurp: json.profile.student_curp || prev.studentCurp,
            educationLevel: json.profile.education_level || prev.educationLevel,
            billingEmail: json.profile.billing_email || prev.billingEmail,
            autoInvoiceOnPayment: json.profile.auto_invoice_on_payment ?? prev.autoInvoiceOnPayment
          }));
        }
      } catch (e) {
        console.warn('Carga de perfil local:', e);
      }
    }
    loadBillingProfile();
  }, []);

  const handleRfcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9&Ñ]/g, '').slice(0, 13);
    setTaxData(prev => ({ ...prev, rfc: val }));
    if (val.length >= 12) {
      setRfcValidation(validateRfc(val));
    } else {
      setRfcValidation({ isValid: false, error: 'Longitud mínima: 12 caracteres (Moral) o 13 (Física).' });
    }
  };

  const handleCurpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 18);
    setTaxData(prev => ({ ...prev, studentCurp: val }));
    if (val.length === 18) {
      setCurpValidation(validateCurp(val));
    } else {
      setCurpValidation({ isValid: false, error: 'La CURP debe tener exactamente 18 caracteres.' });
    }
  };

  // Datos estructurados de cargos pendientes
  const pendingCharges: ChargeItem[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'COL-2026-00452',
      concept: 'Colegiatura de Septiembre 2026',
      studentName: 'Mateo López Mendoza',
      studentGrade: '3º de Secundaria — Grupo A',
      category: 'Colegiatura',
      dueDate: '10 de Septiembre de 2026',
      subtotal: 3600.00,
      discount: 150.00, // Descuento pronto pago
      surcharge: 0.00,
      total: 3450.00,
      status: 'pending'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'COL-2026-00489',
      concept: 'Taller Extraescolar de Robótica y Programación (Mensual)',
      studentName: 'Mateo López Mendoza',
      studentGrade: '3º de Secundaria — Grupo A',
      category: 'Extraescolar',
      dueDate: '15 de Septiembre de 2026',
      subtotal: 800.00,
      discount: 0.00,
      surcharge: 0.00,
      total: 800.00,
      status: 'pending'
    }
  ];

  // Historial de pagos liquidados con timbrado SAT
  const paymentHistory: PaymentRecord[] = [
    {
      id: 'pay-001',
      receiptNumber: 'REC-2026-08102',
      concept: 'Inscripción Anual Ciclo 2026-2027',
      studentName: 'Mateo López Mendoza',
      amount: 4500.00,
      paymentMethod: 'Tarjeta de Crédito (Visa ***4012)',
      paidAt: '12 de Agosto de 2026, 11:24 hrs',
      cfdiUuid: '4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D',
      status: 'succeeded'
    },
    {
      id: 'pay-002',
      receiptNumber: 'REC-2026-08103',
      concept: 'Paquete de Libros y Materiales Digitales',
      studentName: 'Mateo López Mendoza',
      amount: 2250.00,
      paymentMethod: 'Transferencia SPEI',
      paidAt: '12 de Agosto de 2026, 11:30 hrs',
      cfdiUuid: '9F8E7D6C-5B4A-3F2E-1D0C-B9A8F7E6D5C4',
      status: 'succeeded'
    },
    {
      id: 'pay-003',
      receiptNumber: 'REC-2026-07011',
      concept: 'Colegiatura de Agosto 2026 (Curso Propedéutico)',
      studentName: 'Mateo López Mendoza',
      amount: 3600.00,
      paymentMethod: 'Tarjeta de Débito (Mastercard ***8831)',
      paidAt: '05 de Agosto de 2026, 09:15 hrs',
      cfdiUuid: '1A2B3C4D-5E6F-7A8B-9C0D-1E2F3A4B5C6D',
      status: 'succeeded'
    }
  ];

  const totalPending = pendingCharges.reduce((acc, c) => acc + c.total, 0);
  const totalPaid = paymentHistory.reduce((acc, p) => acc + p.amount, 0);

  const handleExportPdf = () => {
    setIsExporting(true);
    window.open('/parent/financial/statement/print', '_blank');
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  const handleDownloadXml = (payment: PaymentRecord) => {
    window.open(
      `/api/billing/invoice/download?receipt_id=${payment.receiptNumber}&format=xml&uuid=${payment.cfdiUuid || ''}&rfc=${taxData.rfc}&amount=${payment.amount}&concept=${encodeURIComponent(payment.concept)}`,
      '_blank'
    );
  };

  const handleDownloadPdf = (payment: PaymentRecord) => {
    window.open(
      `/api/billing/invoice/pdf?receipt_id=${payment.receiptNumber}&uuid=${payment.cfdiUuid || ''}&rfc=${taxData.rfc}&tax_name=${encodeURIComponent(taxData.taxName)}&amount=${payment.amount}&concept=${encodeURIComponent(payment.concept)}&payment_method=${encodeURIComponent(payment.paymentMethod)}`,
      '_blank'
    );
  };

  const handleSaveTaxForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaxError(null);
    setIsSavingTax(true);

    try {
      const res = await fetch('/api/billing/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: 'usr-parent-001',
          school_id: 'sch-001',
          rfc: taxData.rfc,
          tax_name: taxData.taxName,
          tax_regime: taxData.taxRegime,
          postal_code: taxData.postalCode,
          cfdi_use: taxData.cfdiUse,
          billing_email: taxData.billingEmail,
          auto_invoice_on_payment: taxData.autoInvoiceOnPayment
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al guardar los datos fiscales.');
      }

      setTaxFormSaved(true);
      setTimeout(() => setTaxFormSaved(false), 4000);
    } catch (err: any) {
      setTaxError(err.message || 'Ocurrió un error al actualizar los datos fiscales.');
    } finally {
      setIsSavingTax(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Encabezado del Estado de Cuenta */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Departamento de Cobranza y Facturación</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Estado de Cuenta Escolar</h1>
          <p className="text-sm text-slate-500 mt-1">Consulte los cargos vigentes, liquide con tarjeta o SPEI y descargue sus comprobantes fiscales CFDI 4.0.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg border border-slate-300 transition-colors text-xs shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isExporting ? 'Generando PDF...' : 'Descargar Estado de Cuenta'}</span>
          </button>

          <Link
            href={`/checkout/all?amount=${totalPending}&concept=Liquidaci%C3%B3n%20Total%20de%20Colegiaturas&student=Mateo%20y%20Sof%C3%ADa%20L%C3%B3pez`}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-xs shadow-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagar Saldo Pendiente</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Saldo Pendiente */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Total Pendiente</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">${totalPending.toFixed(2)} <span className="text-xs font-sans text-slate-500 font-normal">MXN</span></div>
          <div className="text-xs text-amber-700 font-medium mt-1">2 cargos por vencer en septiembre</div>
        </div>

        {/* Próximo Vencimiento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Próximo Vencimiento</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">10 Septiembre 2026</div>
          <div className="text-xs text-slate-500 mt-1">Colegiatura Septiembre 2026</div>
        </div>

        {/* Total Pagado en el Ciclo */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pagado (Ciclo 2026-2027)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">${totalPaid.toFixed(2)} <span className="text-xs font-sans text-slate-500 font-normal">MXN</span></div>
          <div className="text-xs text-emerald-700 font-medium mt-1">3 comprobantes timbrados</div>
        </div>

        {/* Facturación Electrónica Automática */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Facturación SAT (CFDI 4.0)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono truncate">{taxData.rfc}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>Timbrado Automático Activo</span>
          </div>
        </div>

      </div>

      {/* Pestañas Principales */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Barra de Pestañas */}
        <div className="border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Próximos Vencimientos</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingCharges.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Historial de Pagos y Facturas</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {paymentHistory.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tax')}
              className={`py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'tax'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Mis Datos Fiscales (CFDI 4.0)</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO PESTAÑA 1: PRÓXIMOS VENCIMIENTOS */}
        {activeTab === 'pending' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4 font-semibold">Folio</th>
                    <th className="py-3 px-4 font-semibold">Concepto</th>
                    <th className="py-3 px-4 font-semibold">Alumno</th>
                    <th className="py-3 px-4 font-semibold">Fecha Límite</th>
                    <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                    <th className="py-3 px-4 font-semibold text-right">Descuento</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                    <th className="py-3 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingCharges.map((charge) => (
                    <tr key={charge.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{charge.invoiceNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{charge.concept}</div>
                        <div className="text-[11px] text-slate-500">{charge.category}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{charge.studentName}</div>
                        <div className="text-[11px] text-slate-500">{charge.studentGrade}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{charge.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">${charge.subtotal.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-medium">
                        {charge.discount > 0 ? `-$${charge.discount.toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        ${charge.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/checkout/${charge.id}?amount=${charge.total}&concept=${encodeURIComponent(charge.concept)}&student=${encodeURIComponent(charge.studentName)}&invoiceNumber=${encodeURIComponent(charge.invoiceNumber)}`}
                          className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          <span>Pagar</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ficha Resumen de Liquidación */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-slate-600">
                  {taxData.autoInvoiceOnPayment 
                    ? `⚡ Facturación Automática Activada: Su CFDI 4.0 deducible (Uso ${taxData.cfdiUse}) se emitirá y enviará a ${taxData.billingEmail} al confirmar el pago.`
                    : 'Los pagos realizados con Tarjeta Bancaria o SPEI se reflejan automáticamente en el sistema en menos de 60 segundos.'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-700 font-semibold text-sm">Total por Liquidar: <span className="text-slate-900 font-mono font-bold text-base">${totalPending.toFixed(2)} MXN</span></span>
                <Link
                  href={`/checkout/all?amount=${totalPending}&concept=Liquidaci%C3%B3n%20Total%20de%20Colegiaturas&student=Mateo%20y%20Sof%C3%ADa%20L%C3%B3pez`}
                  className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
                >
                  Pagar Todo el Saldo
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: HISTORIAL DE PAGOS Y COMPROBANTES FISCALES */}
        {activeTab === 'history' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4 font-semibold">Folio Recibo</th>
                    <th className="py-3 px-4 font-semibold">Fecha y Hora</th>
                    <th className="py-3 px-4 font-semibold">Concepto</th>
                    <th className="py-3 px-4 font-semibold">Método de Pago</th>
                    <th className="py-3 px-4 font-semibold text-right">Monto Liquidado</th>
                    <th className="py-3 px-4 font-semibold">Folio Fiscal SAT (UUID)</th>
                    <th className="py-3 px-4 font-semibold text-center">Comprobante Fiscal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{payment.receiptNumber}</td>
                      <td className="py-3.5 px-4 text-slate-600">{payment.paidAt}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{payment.concept}</td>
                      <td className="py-3.5 px-4 text-slate-600">{payment.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">${payment.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 max-w-[150px] truncate" title={payment.cfdiUuid}>
                        {payment.cfdiUuid ? (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {payment.cfdiUuid.slice(0, 18)}...
                          </span>
                        ) : (
                          <span className="text-slate-400">En proceso</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Botón Minimalista Descargar PDF */}
                          <button
                            onClick={() => handleDownloadPdf(payment)}
                            title="Descargar Representación Impresa en PDF"
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-blue-200 px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-700" />
                            <span>PDF</span>
                          </button>

                          {/* Botón Minimalista Descargar XML SAT */}
                          <button
                            onClick={() => handleDownloadXml(payment)}
                            title="Descargar Archivo XML Oficial CFDI 4.0 SAT"
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-300 hover:border-emerald-200 px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5 text-emerald-700" />
                            <span>XML</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 3: MIS DATOS FISCALES (CFDI 4.0) */}
        {activeTab === 'tax' && (
          <div className="p-6 max-w-3xl">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Configuración Fiscal SAT (Anexo 20 - CFDI 4.0)</h2>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Vigente 2026</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Asegúrese de que los datos coincidan <strong>exactamente</strong> con su <em>Constancia de Situación Fiscal</em> emitida por el SAT para garantizar el timbrado y deducibilidad de colegiaturas.
              </p>
            </div>

            {taxFormSaved && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sus datos fiscales han sido validados y guardados exitosamente en la base de datos institucional.</span>
              </div>
            )}

            {taxError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{taxError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTaxForm} className="space-y-5 text-xs">
              
              {/* Switch / Toggle Corporativo de Facturación Automática */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Generar factura automáticamente al pagar</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Al confirmar cada pago de colegiatura o cuota escolar, el sistema timbrará el CFDI 4.0 ante el SAT y enviará los archivos XML y PDF a su correo.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={taxData.autoInvoiceOnPayment}
                    onChange={(e) => setTaxData({ ...taxData, autoInvoiceOnPayment: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-700"></div>
                </label>
              </div>

              {/* RFC y Código Postal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">RFC (Registro Federal de Contribuyentes)</label>
                    {taxData.rfc.length >= 12 && (
                      <span className={`text-[10px] font-bold ${rfcValidation.isValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {rfcValidation.isValid ? `✓ RFC Válido (${rfcValidation.type})` : '✕ Inválido'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={taxData.rfc}
                    onChange={handleRfcChange}
                    maxLength={13}
                    placeholder="ABCD800101XYZ"
                    className={`w-full bg-white border rounded-lg px-3 py-2.5 text-slate-900 font-mono uppercase focus:outline-none ${
                      rfcValidation.isValid ? 'border-slate-300 focus:border-blue-600' : 'border-rose-300 focus:border-rose-500'
                    }`}
                    required
                  />
                  {!rfcValidation.isValid && taxData.rfc.length > 0 && (
                    <p className="text-[10px] text-rose-600 mt-1">{rfcValidation.error}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Código Postal Fiscal del Receptor</label>
                  <input
                    type="text"
                    value={taxData.postalCode}
                    onChange={(e) => setTaxData({ ...taxData, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                    maxLength={5}
                    placeholder="06700"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Debe ser idéntico al domicilio fiscal registrado en el SAT.</p>
                </div>
              </div>

              {/* Razón Social / Nombre */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombre o Razón Social (Mayúsculas, sin régimen societario)
                </label>
                <input
                  type="text"
                  value={taxData.taxName}
                  onChange={(e) => setTaxData({ ...taxData, taxName: e.target.value.toUpperCase() })}
                  placeholder="NOMBRE APELLIDO PATERNO MATERNO"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">En CFDI 4.0 no se debe incluir "S.A. de C.V.", "S.C." ni caracteres especiales.</p>
              </div>

              {/* Régimen Fiscal y Uso de CFDI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Régimen Fiscal SAT</label>
                  <select
                    value={taxData.taxRegime}
                    onChange={(e) => setTaxData({ ...taxData, taxRegime: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                    <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                    <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                    <option value="601">601 - General de Ley Personas Morales</option>
                    <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                    <option value="606">606 - Arrendamiento</option>
                    <option value="616">616 - Sin obligaciones fiscales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Uso de CFDI</label>
                  <select
                    value={taxData.cfdiUse}
                    onChange={(e) => setTaxData({ ...taxData, cfdiUse: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="D10">D10 - Pagos por servicios educativos (Colegiaturas) [Deducible]</option>
                    <option value="G03">G03 - Gastos en general</option>
                    <option value="G01">G01 - Adquisición de mercancías</option>
                    <option value="S01">S01 - Sin efectos fiscales</option>
                    <option value="CP01">CP01 - Pagos</option>
                  </select>
                </div>
              </div>

              {/* Complemento IEDU: CURP del Alumno */}
              {taxData.cfdiUse === 'D10' && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Complemento IEDU del SAT (Deducción Personal de Colegiaturas)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Requerido por SAT</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Conforme al Decreto Fiscal del SAT, para deducir colegiaturas en su declaración anual es obligatorio incluir la CURP y Nivel Educativo del alumno.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-semibold text-xs">CURP del Alumno:</label>
                        {taxData.studentCurp.length === 18 && (
                          <span className={`text-[10px] font-bold ${curpValidation.isValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {curpValidation.isValid ? '✓ Estructura Válida' : '✕ Inválida'}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={taxData.studentCurp}
                        onChange={handleCurpChange}
                        maxLength={18}
                        placeholder="AAAA000000HDFXXX00"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-xs">Nivel Educativo:</label>
                      <select
                        value={taxData.educationLevel}
                        onChange={(e) => setTaxData({ ...taxData, educationLevel: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="Preescolar">Preescolar (Tope anual: $14,200 MXN)</option>
                        <option value="Primaria">Primaria (Tope anual: $12,900 MXN)</option>
                        <option value="Secundaria">Secundaria (Tope anual: $19,900 MXN)</option>
                        <option value="Profesional tecnico">Profesional Técnico (Tope: $17,100 MXN)</option>
                        <option value="Bachillerato o su equivalente">Bachillerato (Tope: $24,500 MXN)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Correo Electrónico Fiscal */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico de Recepción de XML y PDF</label>
                <input
                  type="email"
                  value={taxData.billingEmail}
                  onChange={(e) => setTaxData({ ...taxData, billingEmail: e.target.value.toLowerCase() })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {/* Botón de Guardado */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSavingTax || !rfcValidation.isValid}
                  className="bg-blue-700 hover:bg-blue-600 disabled:bg-slate-300 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSavingTax ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Validando y Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Datos Fiscales SAT</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cifrado y validado contra el catálogo del SAT</span>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
}
