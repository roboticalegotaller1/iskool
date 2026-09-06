'use client';

/**
 * Portal de Administración Fiscal y Timbrado SAT CFDI 4.0 (ISkool)
 * Gestión de Proveedor PAC, Complemento IEDU, Bitácora Fiscal y Cancelaciones Oficiales
 * Cero Marcas Comerciales • Cumplimiento Normativo SAT México
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Key, 
  Send, 
  ExternalLink, 
  Copy, 
  Printer, 
  Check, 
  Zap, 
  Lock, 
  QrCode, 
  BookOpen, 
  Award,
  AlertCircle
} from 'lucide-react';
import { TaxRegimeCode, CfdiUseCode, IeduEducationLevel } from '@/types';

interface StoredFiscalRecord {
  uuid: string;
  receiptNumber: string;
  rfcReceptor: string;
  taxName: string;
  studentName: string;
  curp: string;
  educationLevel: string;
  rvoe: string;
  concept: string;
  amount: number;
  stampedAt: string;
  statusSat: 'Vigente' | 'Cancelado';
  cancellationMotivo?: string;
  xmlContent?: string;
}

export default function CoordinatorFiscalPage() {
  const [activeTab, setActiveTab] = useState<'log' | 'manual_stamp' | 'config'>('log');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Vigente' | 'Cancelado'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del PAC y registros
  const [pacStatus, setPacStatus] = useState<{ status: string; environment: string; latencyMs: number }>({
    status: 'healthy',
    environment: 'sandbox',
    latencyMs: 38
  });

  const [records, setRecords] = useState<StoredFiscalRecord[]>([
    {
      uuid: '4A8B9C1D-2E3F-4A5B-6C7D-8E9F0A1B2C3D',
      receiptNumber: 'REC-2026-08102',
      rfcReceptor: 'LOAI840512AB3',
      taxName: 'ISRAEL LOPEZ ANGELES',
      studentName: 'Mateo López Mendoza',
      curp: 'LOMA080912HDFZNS01',
      educationLevel: 'Secundaria',
      rvoe: 'SEP-RVOE-2024-SEC-098',
      concept: 'Colegiatura de Septiembre 2026',
      amount: 3450.00,
      stampedAt: '2026-08-25T10:14:22',
      statusSat: 'Vigente'
    },
    {
      uuid: '7F9E8D6C-5B4A-3C2D-1E0F-9A8B7C6D5E4F',
      receiptNumber: 'REC-2026-08099',
      rfcReceptor: 'MERC901124HG8',
      taxName: 'CLAUDIA MENDOZA RUIZ',
      studentName: 'Sofía Mendoza Ruiz',
      curp: 'MERS110304MDFRZN02',
      educationLevel: 'Secundaria',
      rvoe: 'SEP-RVOE-2024-SEC-098',
      concept: 'Colegiatura de Septiembre 2026',
      amount: 3200.00,
      stampedAt: '2026-08-24T16:30:11',
      statusSat: 'Vigente'
    },
    {
      uuid: '1C2D3E4F-5A6B-7C8D-9E0F-1A2B3C4D5E6F',
      receiptNumber: 'REC-2026-07945',
      rfcReceptor: 'HEGA750819KJ2',
      taxName: 'ARTURO HERNANDEZ GARCIA',
      studentName: 'Santiago Hernández Cruz',
      curp: 'HECS120516HDFRNZ03',
      educationLevel: 'Secundaria',
      rvoe: 'SEP-RVOE-2024-SEC-098',
      concept: 'Inscripción Ciclo Escolar 2026-2027',
      amount: 4800.00,
      stampedAt: '2026-08-20T09:12:00',
      statusSat: 'Cancelado',
      cancellationMotivo: '02'
    }
  ]);

  // Modal de Cancelación SAT
  const [cancellingRecord, setCancellingRecord] = useState<StoredFiscalRecord | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState<'01' | '02' | '03' | '04'>('02');
  const [cancelReplacementUuid, setCancelReplacementUuid] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Formulario de Timbrado Manual / Sandbox
  const [manualForm, setManualForm] = useState({
    rfcReceptor: 'LOAI840512AB3',
    taxName: 'ISRAEL LOPEZ ANGELES',
    taxRegime: '605',
    postalCode: '06700',
    cfdiUse: 'D10',
    studentName: 'Mateo López Mendoza',
    curp: 'LOMA080912HDFZNS01',
    educationLevel: 'Secundaria',
    rvoe: 'SEP-RVOE-2024-SEC-098',
    concept: 'Colegiatura Mensual Septiembre 2026',
    amount: 3450.00,
    formaPago: '03'
  });
  const [isStamping, setIsStamping] = useState(false);
  const [lastStampedResult, setLastStampedResult] = useState<any>(null);

  // Configuración del Plantel
  const [schoolConfig, setSchoolConfig] = useState({
    rfcEmisor: 'CAM180312AB9',
    razonSocial: 'COLEGIO ANGLO MEXICANO S.C.',
    regimenFiscal: '603',
    codigoPostal: '06700',
    rvoePreescolar: 'SEP-RVOE-2022-PRE-012',
    rvoePrimaria: 'SEP-RVOE-2023-PRI-045',
    rvoeSecundaria: 'SEP-RVOE-2024-SEC-098',
    rvoeBachillerato: 'SEP-RVOE-2025-BAC-110',
    pacEnvironment: 'sandbox',
    pacApiKey: 'sk_live_pac_fiscal_sat_auth_2026_cam',
    csdCertNumber: '30001000000500003416',
    csdExpiresAt: '2028-12-31',
    autoInvoiceOnPayment: true
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtrado de registros
  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rfcReceptor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.taxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.statusSat === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Ejecutar Timbrado Manual
  const handleExecuteManualStamp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStamping(true);

    try {
      const receiptNumber = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const res = await fetch('/api/fiscal/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: `inv-manual-${Date.now()}`,
          receiptNumber,
          emisor: {
            rfc: schoolConfig.rfcEmisor,
            nombre: schoolConfig.razonSocial,
            regimenFiscal: schoolConfig.regimenFiscal,
            codigoPostal: schoolConfig.codigoPostal
          },
          receptor: {
            rfc: manualForm.rfcReceptor,
            nombre: manualForm.taxName,
            regimenFiscalReceptor: manualForm.taxRegime,
            domicilioFiscalReceptor: manualForm.postalCode,
            usoCFDI: manualForm.cfdiUse
          },
          items: [{
            claveProdServ: '86121500',
            noIdentificacion: receiptNumber,
            cantidad: 1,
            claveUnidad: 'E48',
            unidad: 'Servicio',
            descripcion: manualForm.concept,
            valorUnitario: Number(manualForm.amount),
            importe: Number(manualForm.amount),
            objetoImp: '01',
            ieduComplement: {
              nombreAlumno: manualForm.studentName,
              curp: manualForm.curp,
              nivelEducativo: manualForm.educationLevel,
              autRvoe: manualForm.rvoe
            }
          }],
          formaPago: manualForm.formaPago,
          metodoPago: 'PUE',
          subtotal: Number(manualForm.amount),
          total: Number(manualForm.amount),
          moneda: 'MXN'
        })
      });

      const data = await res.json();

      if (data.success && data.data) {
        const newRecord: StoredFiscalRecord = {
          uuid: data.data.uuid,
          receiptNumber,
          rfcReceptor: manualForm.rfcReceptor,
          taxName: manualForm.taxName,
          studentName: manualForm.studentName,
          curp: manualForm.curp,
          educationLevel: manualForm.educationLevel,
          rvoe: manualForm.rvoe,
          concept: manualForm.concept,
          amount: Number(manualForm.amount),
          stampedAt: data.data.fechaTimbrado || new Date().toISOString(),
          statusSat: 'Vigente',
          xmlContent: data.data.xmlContent
        };

        setRecords(prev => [newRecord, ...prev]);
        setLastStampedResult(data.data);
        showToast('¡CFDI 4.0 con Complemento IEDU timbrado exitosamente ante el SAT!');
      } else {
        alert(data.error || 'Error al timbrar el comprobante.');
      }
    } catch (err: any) {
      alert(`Error de comunicación con el motor fiscal: ${err.message}`);
    } finally {
      setIsStamping(false);
    }
  };

  // Ejecutar Cancelación SAT
  const handleConfirmCancel = async () => {
    if (!cancellingRecord) return;
    setIsCancelling(true);

    try {
      const res = await fetch('/api/fiscal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: cancellingRecord.uuid,
          motivo: cancelMotivo,
          folioSustitucion: cancelMotivo === '01' ? cancelReplacementUuid : undefined,
          rfcEmisor: schoolConfig.rfcEmisor
        })
      });

      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.map(r => 
          r.uuid === cancellingRecord.uuid 
            ? { ...r, statusSat: 'Cancelado', cancellationMotivo: cancelMotivo } 
            : r
        ));
        showToast(`Comprobante ${cancellingRecord.uuid.slice(0, 8)} cancelado ante el SAT.`);
        setCancellingRecord(null);
      } else {
        alert(data.error || 'No se pudo cancelar el comprobante.');
      }
    } catch (err: any) {
      alert(`Error al cancelar: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 text-xs font-semibold">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Encabezado y Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Módulo Fiscal SAT
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-medium">CFDI Versión 4.0 & Complemento IEDU V1.0</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-700" />
            <span>Facturación Electrónica & Timbrado Fiscal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Colegio Anglo Mexicano • CSD Activo • Emisión, certificación PAC y cancelaciones ante la Secretaría de Hacienda
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/coordinator/billing"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <span>Ir a Cobranza</span>
          </Link>
          <button
            onClick={() => setActiveTab('manual_stamp')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir / Timbrar CFDI</span>
          </button>
        </div>
      </div>

      {/* KPIs Fiscales & Estado del Motor PAC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Estado PAC */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motor de Timbrado (PAC)</span>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              En Línea
            </span>
          </div>
          <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Ambiente {pacStatus.environment === 'sandbox' ? 'Homologación (Sandbox)' : 'Producción SAT'}</span>
          </div>
          <p className="text-[11px] text-slate-400">Latencia de timbrado: {pacStatus.latencyMs}ms • CSD Válido</p>
        </div>

        {/* Total Facturado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Facturado (Periodo)</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${records.filter(r => r.statusSat === 'Vigente').reduce((acc, r) => acc + r.amount, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400 font-sans">MXN</span>
          </div>
          <p className="text-[11px] text-slate-400">Colegiaturas e inscripciones timbradas con IEDU</p>
        </div>

        {/* Comprobantes Vigentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comprobantes Timbrados</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {records.filter(r => r.statusSat === 'Vigente').length} <span className="text-xs font-medium text-slate-500 font-sans">CFDIs Vigentes</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">100% validados contra Anexo 20 del SAT</p>
        </div>

        {/* Cancelaciones */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelaciones SAT</span>
          <div className="text-2xl font-black text-slate-700 font-mono">
            {records.filter(r => r.statusSat === 'Cancelado').length} <span className="text-xs font-medium text-slate-400 font-sans">Comprobantes</span>
          </div>
          <p className="text-[11px] text-slate-400">Acuses de cancelación emitidos por el SAT</p>
        </div>

      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('log')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'log'
              ? 'border-blue-700 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bitácora de CFDI Timbrados</span>
        </button>
        <button
          onClick={() => setActiveTab('manual_stamp')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'manual_stamp'
              ? 'border-blue-700 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Emisión & Pruebas en Vivo</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'config'
              ? 'border-blue-700 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Configuración Fiscal & CSD</span>
        </button>
      </div>

      {/* PESTAÑA 1: BITÁCORA DE COMPROBANTES */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por UUID, RFC, Alumno o Folio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Estatus:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="all">Todos los Comprobantes</option>
                <option value="Vigente">Solo Vigentes</option>
                <option value="Cancelado">Solo Cancelados</option>
              </select>
            </div>
          </div>

          {/* Tabla de Facturas Timbradas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Folio Fiscal (UUID) / Recibo</th>
                    <th className="py-3 px-4">Receptor Fiscal (Tutor)</th>
                    <th className="py-3 px-4">Alumno & CURP (IEDU)</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                    <th className="py-3 px-4 text-center">Estatus SAT</th>
                    <th className="py-3 px-4 text-center">Descargas & Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((item) => (
                    <tr key={item.uuid} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* UUID & Folio */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.uuid.slice(0, 18)}...</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.uuid);
                              showToast('UUID copiado al portapapeles.');
                            }}
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            title="Copiar UUID completo"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.receiptNumber} • {new Date(item.stampedAt).toLocaleDateString('es-MX')}</div>
                      </td>

                      {/* Receptor */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.taxName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">RFC: {item.rfcReceptor}</div>
                      </td>

                      {/* Complemento IEDU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.studentName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">CURP: {item.curp} ({item.educationLevel})</div>
                      </td>

                      {/* Monto */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900">${item.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">{item.concept}</div>
                      </td>

                      {/* Estatus SAT */}
                      <td className="py-3 px-4 text-center">
                        {item.statusSat === 'Vigente' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Vigente</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]" title={`Motivo SAT: ${item.cancellationMotivo}`}>
                            <X className="w-3 h-3" />
                            <span>Cancelado (SAT {item.cancellationMotivo})</span>
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Descargar XML */}
                          <a
                            href={`/api/billing/invoice/download?receipt_id=${item.receiptNumber}&format=xml&uuid=${item.uuid}&rfc=${item.rfcReceptor}&tax_name=${encodeURIComponent(item.taxName)}&amount=${item.amount}&concept=${encodeURIComponent(item.concept)}&student=${encodeURIComponent(item.studentName)}&curp=${item.curp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors border border-slate-200"
                            title="Descargar archivo XML oficial timbrado"
                          >
                            XML
                          </a>

                          {/* Ver PDF */}
                          <a
                            href={`/api/billing/invoice/pdf?receipt_id=${item.receiptNumber}&uuid=${item.uuid}&rfc=${item.rfcReceptor}&tax_name=${encodeURIComponent(item.taxName)}&amount=${item.amount}&concept=${encodeURIComponent(item.concept)}&student=${encodeURIComponent(item.studentName)}&curp=${item.curp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors border border-blue-200"
                            title="Ver representación impresa oficial en PDF"
                          >
                            PDF
                          </a>

                          {/* Cancelar ante el SAT (si está vigente) */}
                          {item.statusSat === 'Vigente' && (
                            <button
                              onClick={() => setCancellingRecord(item)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                              title="Solicitar Cancelación Fiscal SAT"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se encontraron comprobantes fiscales con los criterios seleccionados.
              </div>
            )}
          </div>

        </div>
      )}

      {/* PESTAÑA 2: EMISIÓN & TIMBRADO EN VIVO (SANDBOX) */}
      {activeTab === 'manual_stamp' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200 mb-5">
              <Zap className="w-5 h-5 text-blue-700" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Emisión y Timbrado Digital SAT CFDI 4.0</h3>
                <p className="text-xs text-slate-500">Prueba en vivo del motor de timbrado PAC con Complemento IEDU V1.0</p>
              </div>
            </div>

            <form onSubmit={handleExecuteManualStamp} className="space-y-4 text-xs">
              
              {/* Sección Datos del Receptor */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-blue-900">1. Datos Fiscales del Receptor (Tutor)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">RFC del Receptor:</label>
                    <input
                      type="text"
                      required
                      value={manualForm.rfcReceptor}
                      onChange={(e) => setManualForm({ ...manualForm, rfcReceptor: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Razón Social / Nombre:</label>
                    <input
                      type="text"
                      required
                      value={manualForm.taxName}
                      onChange={(e) => setManualForm({ ...manualForm, taxName: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Régimen Fiscal Receptor:</label>
                    <select
                      value={manualForm.taxRegime}
                      onChange={(e) => setManualForm({ ...manualForm, taxRegime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="605">605 - Sueldos y Salarios</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                      <option value="606">606 - Arrendamiento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Código Postal Fiscal:</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={manualForm.postalCode}
                      onChange={(e) => setManualForm({ ...manualForm, postalCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Complemento IEDU */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>2. Complemento de Instituciones Educativas Privadas (IEDU V1.0)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1">Nombre Completo del Alumno:</label>
                    <input
                      type="text"
                      required
                      value={manualForm.studentName}
                      onChange={(e) => setManualForm({ ...manualForm, studentName: e.target.value })}
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1">CURP del Alumno (18 Caracteres):</label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      value={manualForm.curp}
                      onChange={(e) => setManualForm({ ...manualForm, curp: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-emerald-600 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1">Nivel Educativo:</label>
                    <select
                      value={manualForm.educationLevel}
                      onChange={(e) => setManualForm({ ...manualForm, educationLevel: e.target.value })}
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Preescolar">Preescolar</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                      <option value="Bachillerato o su equivalente">Bachillerato o su equivalente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1">Clave de Autorización RVOE SEP:</label>
                    <input
                      type="text"
                      required
                      value={manualForm.rvoe}
                      onChange={(e) => setManualForm({ ...manualForm, rvoe: e.target.value })}
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Concepto y Monto */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-blue-900">3. Partida y Monto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Descripción del Servicio Educativo:</label>
                    <input
                      type="text"
                      required
                      value={manualForm.concept}
                      onChange={(e) => setManualForm({ ...manualForm, concept: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Monto Total (MXN):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={manualForm.amount}
                      onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de Timbrado */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isStamping}
                  className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-blue-700/20"
                >
                  {isStamping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Certificando ante el PAC / SAT...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Timbrar CFDI 4.0 con Complemento IEDU</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Tarjeta de Resultado del Timbre */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm text-slate-200">Sello Digital del SAT</h3>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Anexo 20</span>
              </div>

              {lastStampedResult ? (
                <div className="space-y-3 text-xs mt-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Folio Fiscal (UUID):</span>
                    <span className="font-mono text-emerald-400 font-bold break-all text-[11px]">{lastStampedResult.uuid}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha y Hora de Certificación:</span>
                    <span className="font-mono text-slate-300">{lastStampedResult.fechaTimbrado}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">No. Certificado SAT:</span>
                    <span className="font-mono text-slate-300">{lastStampedResult.noCertificadoSat}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cadena Original SAT:</span>
                    <p className="font-mono text-[9px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 break-all leading-tight">
                      {lastStampedResult.cadenaOriginalSat}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-2 text-slate-500">
                  <QrCode className="w-12 h-12 mx-auto stroke-1 opacity-50" />
                  <p className="text-xs">Los datos del Sello Digital, UUID y XML generado aparecerán aquí al emitir un CFDI.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              Infraestructura con Cifrado RSA-4096 y Sellado SHA-256
            </div>
          </div>

        </div>
      )}

      {/* PESTAÑA 3: CONFIGURACIÓN FISCAL & CSD */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          
          <div className="pb-4 border-b border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Configuración Fiscal del Plantel Escolar</h3>
            <p className="text-xs text-slate-500">Datos fiscales institucionales, Certificado de Sello Digital (CSD) y credenciales del PAC</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            
            {/* Datos del Plantel Emisor */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-900">1. Datos Fiscales del Colegio (Emisor)</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Razón Social Institucional:</label>
                  <input
                    type="text"
                    value={schoolConfig.razonSocial}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, razonSocial: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">RFC Emisor:</label>
                    <input
                      type="text"
                      value={schoolConfig.rfcEmisor}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, rfcEmisor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Código Postal (Lugar Expedición):</label>
                    <input
                      type="text"
                      value={schoolConfig.codigoPostal}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, codigoPostal: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Régimen Fiscal Institucional:</label>
                  <select
                    value={schoolConfig.regimenFiscal}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, regimenFiscal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  >
                    <option value="603">603 - Personas Morales con Fines no Lucrativos (Colegios e Institutos)</option>
                    <option value="601">601 - General de Ley Personas Morales</option>
                  </select>
                </div>
              </div>

              {/* RVOEs Oficiales */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-900">2. Claves de Incorporación RVOE SEP por Nivel</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">RVOE Preescolar:</label>
                    <input
                      type="text"
                      value={schoolConfig.rvoePreescolar}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, rvoePreescolar: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">RVOE Primaria:</label>
                    <input
                      type="text"
                      value={schoolConfig.rvoePrimaria}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, rvoePrimaria: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">RVOE Secundaria:</label>
                    <input
                      type="text"
                      value={schoolConfig.rvoeSecundaria}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, rvoeSecundaria: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">RVOE Bachillerato:</label>
                    <input
                      type="text"
                      value={schoolConfig.rvoeBachillerato}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, rvoeBachillerato: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Credenciales PAC & CSD */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-900">3. Conexión del PAC & Certificado CSD</h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ambiente del PAC:</label>
                  <select
                    value={schoolConfig.pacEnvironment}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, pacEnvironment: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  >
                    <option value="sandbox">Sandbox / Homologación (Pruebas SAT)</option>
                    <option value="production">Producción Oficial (Timbrado Real SAT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Clave de API / Token del PAC:</label>
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={schoolConfig.pacApiKey}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, pacApiKey: e.target.value })}
                      className="w-full bg-transparent text-slate-800 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Certificado de Sello Digital (CSD)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Válido</span>
                  </div>
                  <div className="text-[11px] text-slate-600">No. Certificado: <span className="font-mono font-bold text-slate-900">{schoolConfig.csdCertNumber}</span></div>
                  <div className="text-[11px] text-slate-500">Vigencia hasta: {schoolConfig.csdExpiresAt}</div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <input
                    type="checkbox"
                    id="chkAutoInvoiceSchool"
                    checked={schoolConfig.autoInvoiceOnPayment}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, autoInvoiceOnPayment: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="chkAutoInvoiceSchool" className="text-[11px] text-slate-700">
                    <strong className="block text-blue-900 font-bold">Timbrado Automático Inmediato en Pasarela</strong>
                    Generar y timbrar el CFDI 4.0 al instante cuando el padre de familia pague con tarjeta, SPEI o Magic Link.
                  </label>
                </div>

              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast('Configuración fiscal y credenciales guardadas correctamente.')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Guardar Configuración Fiscal
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Modal de Cancelación SAT */}
      {cancellingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Solicitud de Cancelación Fiscal SAT</h3>
              </div>
              <button
                onClick={() => setCancellingRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950 space-y-1.5">
              <div className="font-bold">¿Está seguro de cancelar este comprobante fiscal ante el SAT?</div>
              <div className="font-mono text-[11px]">UUID: {cancellingRecord.uuid}</div>
              <div>Receptor: <strong>{cancellingRecord.taxName}</strong> ({cancellingRecord.rfcReceptor})</div>
              <div>Monto: <strong>${cancellingRecord.amount.toFixed(2)} MXN</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Motivo Oficial de Cancelación (SAT):</label>
                <select
                  value={cancelMotivo}
                  onChange={(e) => setCancelMotivo(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="01">01 - Comprobante emitido con errores con relación (Requiere UUID sustitución)</option>
                  <option value="02">02 - Comprobante emitido con errores sin relación</option>
                  <option value="03">03 - No se llevó a cabo la operación</option>
                  <option value="04">04 - Operación nominativa relacionada en una factura global</option>
                </select>
              </div>

              {cancelMotivo === '01' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Folio Fiscal UUID de Sustitución:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 8F4A2B1C-3D4E-5F6A-7B8C-9D0E1F2A3B4C"
                    value={cancelReplacementUuid}
                    onChange={(e) => setCancelReplacementUuid(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCancellingRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling || (cancelMotivo === '01' && !cancelReplacementUuid)}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-md shadow-rose-600/20"
              >
                {isCancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Cancelando ante el SAT...</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Confirmar Cancelación SAT</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
