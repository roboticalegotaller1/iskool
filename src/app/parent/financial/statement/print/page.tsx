'use client';

/**
 * Estado de Cuenta Oficial Escolar — Vista de Impresión y Generación de PDF (ISkool)
 * Cero Gamificación • Formato Carta • Estilo Bancario Institucional
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  Landmark 
} from 'lucide-react';

export default function AccountStatementPrintPage() {
  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const pendingCharges = [
    {
      folio: 'COL-2026-00452',
      concept: 'Colegiatura de Septiembre 2026',
      student: 'Mateo López Mendoza (3º de Secundaria — Grupo A)',
      dueDate: '10 de Septiembre de 2026',
      subtotal: 3600.00,
      discount: 150.00,
      total: 3450.00,
      status: 'Exigible'
    },
    {
      folio: 'COL-2026-00489',
      concept: 'Taller Extraescolar de Robótica y Programación (Mensual)',
      student: 'Mateo López Mendoza (3º de Secundaria — Grupo A)',
      dueDate: '15 de Septiembre de 2026',
      subtotal: 800.00,
      discount: 0.00,
      total: 800.00,
      status: 'Exigible'
    }
  ];

  const paidCharges = [
    {
      receipt: 'REC-2026-08102',
      concept: 'Inscripción Anual Ciclo 2026-2027',
      paidAt: '12 de Agosto de 2026, 11:24 hrs',
      method: 'Tarjeta de Crédito (Visa ***4012)',
      amount: 4500.00,
      uuid: '4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D'
    },
    {
      receipt: 'REC-2026-08103',
      concept: 'Paquete de Libros y Materiales Digitales',
      paidAt: '12 de Agosto de 2026, 11:30 hrs',
      method: 'Transferencia SPEI',
      amount: 2250.00,
      uuid: '9F8E7D6C-5B4A-3F2E-1D0C-B9A8F7E6D5C4'
    },
    {
      receipt: 'REC-2026-07011',
      concept: 'Colegiatura de Agosto 2026 (Curso Propedéutico)',
      paidAt: '05 de Agosto de 2026, 09:15 hrs',
      method: 'Tarjeta de Débito (Mastercard ***8831)',
      amount: 3600.00,
      uuid: '1A2B3C4D-5E6F-7A8B-9C0D-1E2F3A4B5C6D'
    }
  ];

  const totalPending = pendingCharges.reduce((acc, c) => acc + c.total, 0);
  const totalPaid = paidCharges.reduce((acc, p) => acc + p.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans print:p-0 print:bg-white text-slate-900">
      
      {/* Barra de Controles en Pantalla (No se imprime) */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl border border-slate-300 shadow-sm flex items-center justify-between print:hidden">
        <Link
          href="/parent/financial"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Estado de Cuenta</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">Listo para imprimir o exportar a PDF</span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>
      </div>

      {/* Documento Oficial Formato Carta */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg print:border-none print:shadow-none print:p-0">
        
        {/* Encabezado Institucional */}
        <div className="border-b-2 border-blue-900 pb-6 mb-6 flex justify-between items-start">
          <div>
            <div className="text-2xl font-black text-blue-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-800 shrink-0" />
              <span>COLEGIO ISKOOL MÉXICO</span>
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Institución Educativa Oficial • CCT: 09PPR1849Z
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Departamento de Control Escolar, Cobranza y Facturación
            </div>
          </div>

          <div className="text-right">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-400">Documento Oficial</div>
              <div className="text-sm font-bold text-slate-900">ESTADO DE CUENTA</div>
              <div className="text-[11px] text-blue-800 font-mono font-semibold">PERIODO: CICLO 2026-2027</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fecha de Emisión: {dateStr}</div>
            </div>
          </div>
        </div>

        {/* Ficha del Tutor y Alumnos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Datos del Tutor Responsable
            </div>
            <div className="space-y-1">
              <div><span className="font-semibold text-slate-600">Nombre:</span> <span className="font-bold text-slate-900">Prof. Israel López Ángeles</span></div>
              <div><span className="font-semibold text-slate-600">RFC Fiscal:</span> <span className="font-mono font-semibold text-slate-900">LOAI840512AB3</span></div>
              <div><span className="font-semibold text-slate-600">Régimen SAT:</span> <span className="text-slate-800">605 - Sueldos y Salarios</span></div>
              <div><span className="font-semibold text-slate-600">Correo:</span> <span className="text-slate-800">israel.lopez@ejemplo.com</span></div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Alumnos Vinculados
            </div>
            <div className="space-y-1">
              <div><span className="font-semibold text-slate-600">Alumno:</span> <span className="font-bold text-slate-900">Mateo López Mendoza</span></div>
              <div><span className="font-semibold text-slate-600">Nivel y Grado:</span> <span className="text-slate-800">3º de Secundaria — Grupo "A"</span></div>
              <div><span className="font-semibold text-slate-600">Matrícula:</span> <span className="font-mono font-semibold text-slate-900">MAT-2026-089</span></div>
              <div><span className="font-semibold text-slate-600">Estatus Académico:</span> <span className="text-emerald-700 font-bold">Activo Regular</span></div>
            </div>
          </div>
        </div>

        {/* Resumen Financiero Ejecutivo */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-amber-800">Saldo Total Pendiente</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-1">${totalPending.toFixed(2)} <span className="text-[10px] font-sans font-normal text-slate-500">MXN</span></div>
            <div className="text-[10px] text-amber-700 mt-0.5">2 conceptos por liquidar</div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-emerald-800">Total Liquidado en el Ciclo</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-1">${totalPaid.toFixed(2)} <span className="text-[10px] font-sans font-normal text-slate-500">MXN</span></div>
            <div className="text-[10px] text-emerald-700 mt-0.5">3 recibos timbrados SAT</div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-blue-800">Próximo Vencimiento</div>
            <div className="text-sm font-bold text-slate-900 mt-1">10 de Septiembre de 2026</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Colegiatura Septiembre 2026</div>
          </div>
        </div>

        {/* SECCIÓN 1: CARGOS PENDIENTES */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between">
            <span>1. Cargos Escolares Vigentes y Próximos Vencimientos</span>
            <span className="text-[10px] text-slate-500 font-normal">Moneda: Pesos Mexicanos (MXN)</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Folio</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3">Fecha Límite</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-right">Descuento</th>
                <th className="py-2.5 px-3 text-right">Total a Pagar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pendingCharges.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">{c.folio}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{c.concept}</div>
                    <div className="text-[10px] text-slate-500">{c.student}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{c.dueDate}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">${c.subtotal.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                    {c.discount > 0 ? `-$${c.discount.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${c.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={5} className="py-2.5 px-3 text-right text-slate-700">Total Pendiente Exigible:</td>
                <td className="py-2.5 px-3 text-right font-mono text-base text-blue-900">${totalPending.toFixed(2)} MXN</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* SECCIÓN 2: HISTORIAL DE PAGOS */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between">
            <span>2. Historial de Pagos Realizados y Comprobantes Fiscales</span>
            <span className="text-[10px] text-slate-500 font-normal">Timbrado Digital CFDI 4.0 SAT</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Folio Recibo</th>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Concepto Liquidado</th>
                <th className="py-2.5 px-3">Método de Pago</th>
                <th className="py-2.5 px-3">Folio Fiscal SAT (UUID)</th>
                <th className="py-2.5 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paidCharges.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-800">{p.receipt}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.paidAt}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{p.concept}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.method}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{p.uuid}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">${p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={5} className="py-2.5 px-3 text-right text-slate-700">Total Liquidado en el Periodo:</td>
                <td className="py-2.5 px-3 text-right font-mono text-base text-emerald-800">${totalPaid.toFixed(2)} MXN</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notas y Sellos de Autenticidad */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
              <span>Documento Oficial emitido por el Sistema Institucional de Pagos y Facturación ISkool.</span>
            </div>
            <div>Todos los pagos son conciliados automáticamente y cuentan con su correspondiente timbre fiscal digital CFDI 4.0 ante el SAT.</div>
            <div className="font-mono text-slate-400">Sello Digital de Validación: ISK-AUTH-2026-SECURE-STAMP-{Date.now().toString(16).toUpperCase()}</div>
          </div>

          <div className="text-center shrink-0">
            <div className="w-16 h-16 bg-white border border-slate-300 rounded flex flex-col items-center justify-center text-[8px] font-bold p-1">
              <div className="text-sm">🏛️</div>
              <span>VALIDACIÓN</span>
              <span className="text-[6px] text-slate-400">QR OFICIAL</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
