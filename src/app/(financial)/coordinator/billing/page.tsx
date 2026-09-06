'use client';

/**
 * Dashboard de Cobranza del Coordinador — Analítica, Filtros, Aranceles y Becas (ISkool)
 * Cero Gamificación • Seguridad Bancaria • Marca Blanca
 */

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  Send, 
  Copy, 
  MessageSquare, 
  Mail, 
  Download, 
  FileText, 
  Check, 
  ExternalLink,
  Users,
  ShieldCheck,
  ChevronDown,
  X,
  Zap,
  ArrowUpRight,
  Landmark,
  CreditCard,
  Receipt,
  DollarSign,
  RefreshCw,
  Printer,
  AlertCircle,
  Percent,
  Sliders,
  Award,
  Sparkles,
  GraduationCap,
  Lock
} from 'lucide-react';
import { 
  useSchoolAdminStore, 
  getTuitionFeeForStudent, 
  getSchoolBillingRecords, 
  getSchoolTuitionPricings, 
  getSchoolStudents,
  getSchoolGovernance
} from '@/store/useSchoolAdminStore';
import { FamilyBillingRecord, TuitionPricing, DetailedStudent } from '@/types';
import { TUITION_PRICINGS_SEED, BILLING_RECORDS_SEED } from '@/store/seeds';

export default function CoordinatorBillingDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Zustand Store
  const {
    billingRecords: storeBillingRecords,
    tuitionPricings: storeTuitionPricings,
    detailedStudents: storeDetailedStudents,
    schoolGovernance,
    activeSchoolId,
    updateTuitionPricing,
    assignScholarship,
    recordBillingPayment
  } = useSchoolAdminStore();

  const currentGovernance = useMemo(() => {
    return getSchoolGovernance(schoolGovernance, activeSchoolId);
  }, [schoolGovernance, activeSchoolId]);

  const detailedStudents = useMemo(() => {
    return getSchoolStudents(storeDetailedStudents, activeSchoolId);
  }, [storeDetailedStudents, activeSchoolId]);

  const records = useMemo(() => {
    const raw = storeBillingRecords && storeBillingRecords.length > 0 ? storeBillingRecords : BILLING_RECORDS_SEED;
    return getSchoolBillingRecords(raw, activeSchoolId, detailedStudents);
  }, [storeBillingRecords, activeSchoolId, detailedStudents]);

  const tuitionPricings = useMemo(() => {
    const raw = storeTuitionPricings && storeTuitionPricings.length > 0 ? storeTuitionPricings : TUITION_PRICINGS_SEED;
    return getSchoolTuitionPricings(raw, activeSchoolId);
  }, [storeTuitionPricings, activeSchoolId]);

  // Estado del modal de recordatorio Magic Link
  const [activeModalRecord, setActiveModalRecord] = useState<FamilyBillingRecord | null>(null);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [magicLinkResult, setMagicLinkResult] = useState<{
    paymentUrl: string;
    whatsAppMessage: string;
    emailSubject: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Modal: Configuración de Aranceles & Colegiaturas por Nivel
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingPricings, setEditingPricings] = useState<TuitionPricing[]>(tuitionPricings);

  useEffect(() => {
    setEditingPricings(tuitionPricings);
  }, [tuitionPricings]);

  // Modal: Expediente Financiero & Asignación de Beca
  const [activeScholarshipStudent, setActiveScholarshipStudent] = useState<{
    student: DetailedStudent | null;
    billingRecord?: FamilyBillingRecord;
  } | null>(null);
  const [scholarshipPercent, setScholarshipPercent] = useState<number>(0);
  const [scholarshipType, setScholarshipType] = useState<string>('academica');
  const [scholarshipNotes, setScholarshipNotes] = useState<string>('');

  // Estado para el modal de Registro de Pago Manual (Caja / Ventanilla / Transferencia)
  const [manualPaymentRecord, setManualPaymentRecord] = useState<FamilyBillingRecord | null>(null);
  const [manualMethod, setManualMethod] = useState<'cash' | 'spei' | 'terminal_card' | 'check'>('cash');
  const [manualReference, setManualReference] = useState<string>('');
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualAutoInvoice, setManualAutoInvoice] = useState<boolean>(true);
  const [manualNotes, setManualNotes] = useState<string>('');
  const [isProcessingManualPayment, setIsProcessingManualPayment] = useState<boolean>(false);

  // Estado para visualización de Recibo Oficial de Pago
  const [viewReceiptRecord, setViewReceiptRecord] = useState<{
    record: FamilyBillingRecord;
    receiptNumber: string;
    paidAt: string;
    paymentMethod: string;
    reference: string;
    notes?: string;
  } | null>(null);

  // KPIs dinámicos calculados en tiempo real basados en los registros activos
  const totalTarget = useMemo(() => records.reduce((acc, r) => acc + r.amount, 0), [records]);
  const totalCollected = useMemo(() => records.filter(r => r.status === 'paid').reduce((acc, r) => acc + r.amount, 0), [records]);
  const totalOverdue = useMemo(() => records.filter(r => r.status === 'overdue').reduce((acc, r) => acc + r.amount, 0), [records]);
  const overdueCount = useMemo(() => records.filter(r => r.status === 'overdue').length, [records]);

  const collectionPercentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;
  const delinquencyRate = totalTarget > 0 ? ((totalOverdue / totalTarget) * 100).toFixed(1) : '0.0';

  // Filtrado reactivo multidimensional
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      // 1. Búsqueda por texto (Nombre del alumno, tutor o número de folio)
      const matchesSearch = 
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.concept.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filtro por Nivel Educativo
      const matchesLevel = selectedLevel === 'all' || item.level.toLowerCase() === selectedLevel.toLowerCase();

      // 3. Filtro por Grado
      const matchesGrade = selectedGrade === 'all' || item.grade === selectedGrade;

      // 4. Filtro por Grupo
      const matchesGroup = selectedGroup === 'all' || item.group === selectedGroup;

      // 5. Filtro por Estatus
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesLevel && matchesGrade && matchesGroup && matchesStatus;
    });
  }, [records, searchTerm, selectedLevel, selectedGrade, selectedGroup, selectedStatus]);

  // Manejo de apertura de modal de Beca
  const handleOpenScholarshipModal = (record: FamilyBillingRecord) => {
    // Buscar el estudiante correspondiente en el store
    const student = (detailedStudents || []).find(s => 
      s.id === record.studentId || 
      `${s.first_name} ${s.last_name_1}`.toLowerCase().includes(record.studentName.toLowerCase()) ||
      record.studentName.toLowerCase().includes(s.first_name.toLowerCase())
    ) || null;

    setActiveScholarshipStudent({ student, billingRecord: record });
    setScholarshipPercent(record.scholarshipPercentage || student?.scholarship_percentage || 0);
    setScholarshipType(record.scholarshipType || student?.scholarship_type || 'academica');
    setScholarshipNotes(student?.scholarship_notes || '');
  };

  // Guardar beca asignada
  const handleSaveScholarship = () => {
    if (!activeScholarshipStudent) return;
    const targetStudentId = activeScholarshipStudent.student?.id || activeScholarshipStudent.billingRecord?.studentId;

    if (targetStudentId) {
      assignScholarship(targetStudentId, {
        percentage: Number(scholarshipPercent),
        type: scholarshipType,
        notes: scholarshipNotes
      });
      showToast(`Beca del ${scholarshipPercent}% aplicada correctamente a ${activeScholarshipStudent.billingRecord?.studentName || 'el alumno'}.`);
    } else {
      showToast('Beca actualizada en el registro de cobranza.');
    }

    setActiveScholarshipStudent(null);
  };

  // Guardar edición de aranceles
  const handleSavePricings = () => {
    editingPricings.forEach(p => {
      updateTuitionPricing(p.id, {
        ...p,
        school_id: p.school_id || activeSchoolId || 'sch-test-case'
      });
    });
    showToast('Catálogo de aranceles y colegiaturas actualizado exitosamente.');
    setShowPricingModal(false);
  };

  // Apertura del modal de pago manual
  const handleOpenManualPayment = (record: FamilyBillingRecord) => {
    setManualPaymentRecord(record);
    setManualAmount(record.amount);
    setManualReference(`REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualNotes('');
    setManualMethod('cash');
    setManualAutoInvoice(record.autoInvoice ?? true);
  };

  // Confirmación del pago manual
  const handleConfirmManualPayment = () => {
    if (!manualPaymentRecord) return;
    setIsProcessingManualPayment(true);

    setTimeout(() => {
      const receiptNum = manualReference || `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const formattedDate = new Date(manualDate + 'T12:00:00').toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // 1. Actualizar en Zustand Store
      recordBillingPayment(manualPaymentRecord.id, {
        method: manualMethod,
        reference: receiptNum,
        notes: manualNotes
      });

      setIsProcessingManualPayment(false);
      const paidRecord = { ...manualPaymentRecord, status: 'paid' as const, paidAt: formattedDate };
      setManualPaymentRecord(null);

      // 2. Abrir comprobante oficial
      setViewReceiptRecord({
        record: paidRecord,
        receiptNumber: receiptNum,
        paidAt: formattedDate,
        paymentMethod: 
          manualMethod === 'cash' ? 'Efectivo en Ventanilla' :
          manualMethod === 'spei' ? 'Transferencia Bancaria / SPEI' :
          manualMethod === 'terminal_card' ? 'Tarjeta en Terminal Física' : 'Cheque',
        reference: manualReference,
        notes: manualNotes
      });

      showToast(`Pago de $${manualAmount.toFixed(2)} registrado exitosamente. Folio: ${receiptNum}`);
    }, 500);
  };

  const handleOpenReminderModal = async (record: FamilyBillingRecord) => {
    setActiveModalRecord(record);
    setIsSendingLink(true);
    setMagicLinkResult(null);

    try {
      const res = await fetch('/api/billing/magic-link/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: record.id,
          parentName: record.parentName,
          studentName: record.studentName,
          concept: record.concept,
          invoiceNumber: record.invoiceNumber,
          amount: record.amount,
          dueDate: record.dueDate
        })
      });

      const json = await res.json();
      if (json.success) {
        setMagicLinkResult({
          paymentUrl: json.paymentUrl,
          whatsAppMessage: json.whatsAppMessage,
          emailSubject: json.emailSubject
        });
        showToast(`Recordatorio generado exitosamente para la familia ${record.parentName}.`);
      }
    } catch (e) {
      showToast(`Error al despachar el enlace: ${(e as any).message}`);
    } finally {
      setIsSendingLink(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleCopyWhatsApp = () => {
    if (magicLinkResult?.whatsAppMessage) {
      navigator.clipboard.writeText(magicLinkResult.whatsAppMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
      showToast('Mensaje de WhatsApp copiado al portapapeles.');
    }
  };

  const handleExportConciliation = () => {
    const headers = ['Folio de Cargo', 'Familia / Tutor', 'Alumno', 'Grado / Grupo', 'Concepto', 'Monto Base', 'Beca %', 'Monto Neto (MXN)', 'Fecha de Vencimiento', 'Estatus', 'Fecha de Pago', 'Facturacion'];
    const rows = filteredRecords.map(r => [
      r.invoiceNumber,
      `"${r.parentName}"`,
      `"${r.studentName}"`,
      `"${r.level} ${r.grade} ${r.group}"`,
      `"${r.concept}"`,
      (r.baseAmount || r.amount).toFixed(2),
      `${r.scholarshipPercentage || 0}%`,
      r.amount.toFixed(2),
      `"${r.dueDate}"`,
      r.status,
      r.paidAt ? `"${r.paidAt}"` : 'N/A',
      r.autoInvoice ? 'CFDI 4.0' : 'Manual'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Conciliacion_Cobranza_ISkool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Informe de conciliación exportado exitosamente en formato CSV.');
  };

  // Cálculo en vivo de beca en el modal
  const baseFeeForModal = useMemo(() => {
    if (!activeScholarshipStudent?.billingRecord) return 3450;
    return activeScholarshipStudent.billingRecord.baseAmount || 
      getTuitionFeeForStudent(activeScholarshipStudent.billingRecord.level, activeScholarshipStudent.billingRecord.grade, tuitionPricings);
  }, [activeScholarshipStudent, tuitionPricings]);

  const scholarshipDiscountCalculated = (baseFeeForModal * (Number(scholarshipPercent) || 0)) / 100;
  const netMonthlyCalculated = Math.max(0, baseFeeForModal - scholarshipDiscountCalculated);

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600" />
          <p className="text-xs font-bold text-slate-500">Verificando autorización financiera...</p>
        </div>
      </div>
    );
  }

  const isFinancialAuthorized = ['billing', 'director', 'admin', 'superadmin', 'owner'].includes(user.role) ||
    (user.role === 'coordinator' && currentGovernance.allowCoordinatorBilling);

  if (!isFinancialAuthorized) {
    const getRedirectInfo = () => {
      switch (user.role) {
        case 'coordinator':
          return { label: 'Volver a Control Escolar', path: '/coordinator' };
        case 'student':
          return { label: 'Ir a mi Portal de Alumno', path: '/student' };
        case 'teacher':
          return { label: 'Ir a mi Portal Docente', path: '/teacher' };
        case 'parent':
        case 'tutor':
          return { label: 'Ir a mi Portal Familiar', path: '/parent' };
        default:
          return { label: 'Iniciar Sesión', path: '/login' };
      }
    };

    const redirectInfo = getRedirectInfo();

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-4 shadow-2xl text-white">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-white">Acceso Financiero Restringido</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {user.role === 'coordinator'
              ? 'La Dirección del Colegio ha restringido el módulo de Cobranza y Aranceles para las cuentas de Coordinación. Para cualquier gestión financiera, consulte directamente con Dirección de Plantel o Presidencia Corporativa.'
              : 'Este módulo contiene información confidencial de facturación, becas y cobranza institucional reservada exclusivamente para el departamento de Finanzas y Dirección.'}
          </p>
          <Link
            href={redirectInfo.path}
            className="inline-block w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
          >
            {redirectInfo.label}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Formal de Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-5 py-3.5 rounded-xl border border-slate-700 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Landmark className="w-4 h-4" />
            <span>Coordinación Administrativa y Financiera</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard de Cobranza, Aranceles y Becas</h1>
          <p className="text-sm text-slate-500 mt-1">Supervisión en tiempo real de recaudación, catálogo de colegiaturas y asignación de becas institucionales.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Estratégico para Configuración de Precios / Aranceles */}
          <button
            onClick={() => {
              setEditingPricings(tuitionPricings);
              setShowPricingModal(true);
            }}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-xs shadow-sm hover:shadow-md"
            title="Configurar los precios y cuotas mensuales por cada nivel educativo"
          >
            <DollarSign className="w-4 h-4 text-emerald-200" />
            <span>Aranceles y Colegiaturas</span>
          </button>

          <Link
            href="/coordinator/fiscal"
            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold px-3.5 py-2.5 rounded-lg border border-blue-200 transition-colors text-xs shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Facturación SAT CFDI 4.0</span>
          </Link>

          {(user?.role === 'owner' || user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'director') && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-xs shadow-sm"
              title="Ir al Portal de Finanzas y Nóminas del Personal del Dueño"
            >
              <Landmark className="w-4 h-4 text-purple-200" />
              <span>Nóminas del Personal (Dueño)</span>
            </Link>
          )}

          <Link
            href="/coordinator"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg border border-slate-300 transition-colors text-xs shadow-sm"
          >
            <span>Coordinación</span>
          </Link>

          <button
            onClick={handleExportConciliation}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-xs shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Conciliación</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales (3 KPIs Requeridos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Recaudación del Mes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Recaudación del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">${totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Meta mensual: ${totalTarget.toLocaleString('es-MX')}</span>
              <span className="font-semibold text-emerald-700">{collectionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${collectionPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Índice de Morosidad */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Índice de Morosidad</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">{delinquencyRate}%</div>
          
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">↓ 2.3%</span>
            <span>Reducción respecto al mes anterior</span>
          </div>
        </div>

        {/* KPI 3: Total Vencido */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Vencido</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-700 font-mono">${totalOverdue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          
          <div className="mt-3 text-xs text-slate-500">
            <span>{overdueCount} cargos extemporáneos con acción de cobro activa</span>
          </div>
        </div>

      </div>

      {/* Franja de Resumen de Aranceles Vigentes por Nivel */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Catálogo Activo de Colegiaturas por Nivel Educativo</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Precios base oficiales aplicados automáticamente al matricular nuevos alumnos.</p>
          </div>
          <button
            onClick={() => {
              setEditingPricings(tuitionPricings);
              setShowPricingModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-blue-100 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors self-start md:self-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editar Aranceles</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tuitionPricings.map((p) => (
            <div key={p.id} className="bg-white/5 backdrop-blur-xs border border-white/10 p-3.5 rounded-xl">
              <div className="text-[11px] font-medium text-slate-300 truncate">{p.name}</div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                ${p.monthly_fee.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-[10px] font-normal text-slate-400">/mes</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>Inscripción:</span>
                <span className="text-slate-300 font-semibold">${p.annual_inscription.toLocaleString('es-MX')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor de la Tabla de Cobranza & Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Barra de Filtros */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          
          {/* Campo de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por alumno, tutor, folio o concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm transition-all"
            />
          </div>

          {/* Filtros Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Filtro de Nivel */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
            >
              <option value="all">Todos los Niveles</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Preparatoria">Preparatoria</option>
            </select>

            {/* Filtro de Grado */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
            >
              <option value="all">Todos los Grados</option>
              <option value="1º">1º Grado</option>
              <option value="2º">2º Grado</option>
              <option value="3º">3º Grado</option>
              <option value="4º">4º Grado</option>
              <option value="5º">5º Grado</option>
              <option value="6º">6º Grado</option>
            </select>

            {/* Filtro de Grupo */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
            >
              <option value="all">Grupo A / B</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
            </select>

            {/* Filtro de Estatus */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
            >
              <option value="all">Todos los Estatus</option>
              <option value="paid">Al Corriente (Pagado)</option>
              <option value="pending">Pendiente de Pago</option>
              <option value="overdue">Vencido (Mora)</option>
            </select>

          </div>
        </div>

        {/* Tabla de Cobranza */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4 font-semibold">Folio</th>
                <th className="py-3 px-4 font-semibold">Tutor / Familia</th>
                <th className="py-3 px-4 font-semibold">Alumno (Clic para Beca)</th>
                <th className="py-3 px-4 font-semibold">Grado y Grupo</th>
                <th className="py-3 px-4 font-semibold">Concepto</th>
                <th className="py-3 px-4 font-semibold text-right">Monto Neto</th>
                <th className="py-3 px-4 font-semibold">Fecha Límite</th>
                <th className="py-3 px-4 font-semibold text-center">Estatus</th>
                <th className="py-3 px-4 font-semibold text-center">Beca / Factura</th>
                <th className="py-3 px-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No se encontraron registros de cobro con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{item.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.parentName}</div>
                      <div className="text-[11px] text-slate-500">{item.parentPhone}</div>
                    </td>
                    
                    {/* Alumno con Clic Interactivo para Beca */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleOpenScholarshipModal(item)}
                        className="text-left group inline-flex items-center gap-1.5 focus:outline-none"
                        title="Haz clic para asignar o editar la beca y descuento de este alumno"
                      >
                        <div>
                          <div className="font-semibold text-blue-900 group-hover:text-blue-700 group-hover:underline flex items-center gap-1">
                            <span>{item.studentName}</span>
                            <Award className="w-3.5 h-3.5 text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {item.scholarshipPercentage && item.scholarshipPercentage > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md mt-0.5">
                              <Percent className="w-2.5 h-2.5" />
                              <span>Beca {item.scholarshipPercentage}% ({item.scholarshipType || 'Académica'})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 group-hover:text-blue-600 transition-colors">
                              + Asignar Beca
                            </span>
                          )}
                        </div>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
                        {item.level} {item.grade} "{item.group}"
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[180px] truncate" title={item.concept}>
                      {item.concept}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {item.baseAmount && item.baseAmount > item.amount && (
                        <div className="text-[10px] text-slate-400 line-through font-normal">
                          ${item.baseAmount.toFixed(2)}
                        </div>
                      )}
                      <div>${item.amount.toFixed(2)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.dueDate}</td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'paid' ? (
                        <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase">
                          Pagado
                        </span>
                      ) : item.status === 'overdue' ? (
                        <span className="bg-rose-100 text-rose-800 font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase">
                          Vencido
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.autoInvoice ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                          <Zap className="w-3 h-3 text-blue-600" />
                          <span>Sí (CFDI)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Manual</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status !== 'paid' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenManualPayment(item)}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-colors shadow-sm"
                            title="Registrar pago recibido en efectivo, cheque o transferencia"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Cobrar en Caja</span>
                          </button>
                          <button
                            onClick={() => handleOpenScholarshipModal(item)}
                            className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-2 py-1.5 rounded-lg text-[11px] transition-colors border border-purple-200"
                            title="Asignar o editar beca para este alumno"
                          >
                            <Percent className="w-3 h-3 text-purple-600" />
                            <span className="hidden lg:inline">Beca</span>
                          </button>
                          <button
                            onClick={() => handleOpenReminderModal(item)}
                            className="inline-flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition-colors shadow-sm"
                            title="Enviar Magic Link para pago automático en línea"
                          >
                            <Send className="w-3 h-3" />
                            <span className="hidden sm:inline">Recordatorio</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewReceiptRecord({
                              record: item,
                              receiptNumber: `REC-${new Date().getFullYear()}-${item.id.replace('inv-', '00')}`,
                              paidAt: item.paidAt || '24 Agosto 2026',
                              paymentMethod: 'Conciliación Directa / Caja',
                              reference: item.invoiceNumber
                            })}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition-colors border border-slate-200"
                            title="Ver o imprimir recibo oficial"
                          >
                            <Receipt className="w-3 h-3 text-emerald-600" />
                            <span>Recibo</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL 1: Configuración de Aranceles & Colegiaturas por Nivel Educativo */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Catálogo de Aranceles y Colegiaturas</h3>
                  <p className="text-xs text-slate-500">Asigna los precios de colegiatura e inscripción para cada nivel educativo</p>
                </div>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Listado de Niveles Editables */}
            <div className="space-y-4">
              {editingPricings.map((pricing, index) => (
                <div key={pricing.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-sm text-slate-900">{pricing.name}</span>
                    </div>
                    <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                      Día de corte: {pricing.due_day} de cada mes
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">{pricing.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* Colegiatura Mensual */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Colegiatura Mensual (MXN):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="50"
                          value={pricing.monthly_fee}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingPricings(prev => prev.map((item, idx) => idx === index ? { ...item, monthly_fee: val } : item));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 pl-7 font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Inscripción Anual */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inscripción Anual (MXN):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="50"
                          value={pricing.annual_inscription}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingPricings(prev => prev.map((item, idx) => idx === index ? { ...item, annual_inscription: val } : item));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 pl-7 font-mono font-medium text-slate-800 text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Cuota de Materiales */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cuota de Materiales (MXN):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="50"
                          value={pricing.materials_fee}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingPricings(prev => prev.map((item, idx) => idx === index ? { ...item, materials_fee: val } : item));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 pl-7 font-mono font-medium text-slate-800 text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPricingModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePricings}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Aranceles Oficiales</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Expediente Financiero & Asignación de Beca */}
      {activeScholarshipStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Expediente Financiero y Asignación de Beca</h3>
                  <p className="text-xs text-slate-500">Aplica descuentos porcentuales o becas de excelencia institucional</p>
                </div>
              </div>
              <button
                onClick={() => setActiveScholarshipStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha del Alumno */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Alumno:</span>
                <span className="font-bold text-sm text-slate-900">
                  {activeScholarshipStudent.billingRecord?.studentName || activeScholarshipStudent.student?.first_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nivel y Grado:</span>
                <span className="font-medium text-slate-800">
                  {activeScholarshipStudent.billingRecord?.level} {activeScholarshipStudent.billingRecord?.grade} "{activeScholarshipStudent.billingRecord?.group}"
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tutor Responsable:</span>
                <span className="text-slate-700">
                  {activeScholarshipStudent.billingRecord?.parentName}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-600">Arancel Base del Nivel:</span>
                <span className="font-mono font-bold text-slate-800">${baseFeeForModal.toFixed(2)} MXN / mes</span>
              </div>
            </div>

            {/* Formulario de Beca */}
            <div className="space-y-3.5 text-xs">
              
              {/* Botones Rápidos de Porcentaje */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Porcentaje de Beca a Asignar:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { val: 0, label: '0%', desc: 'Sin Beca' },
                    { val: 10, label: '10%', desc: 'Inicial' },
                    { val: 25, label: '25%', desc: 'Hermanos' },
                    { val: 50, label: '50%', desc: 'Académica' },
                    { val: 75, label: '75%', desc: 'Deportiva' },
                    { val: 100, label: '100%', desc: 'Excelencia' }
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setScholarshipPercent(p.val)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        scholarshipPercent === p.val
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[9px] text-slate-400 font-normal truncate">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider o Input Libre */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={scholarshipPercent}
                  onChange={(e) => setScholarshipPercent(Number(e.target.value))}
                  className="flex-1 accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-black text-purple-800 text-sm w-12 text-right">
                  {scholarshipPercent}%
                </span>
              </div>

              {/* Tipo de Beca */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Categoría / Modalidad de Beca:</label>
                <select
                  value={scholarshipType}
                  onChange={(e) => setScholarshipType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-none focus:border-purple-600"
                >
                  <option value="academica">Beca Académica (Promedio Destacado / Cuadro de Honor)</option>
                  <option value="deportiva">Beca Deportiva & Talleres Extracurriculares</option>
                  <option value="hermanos">Beca Familiar por Hermanos (Descuento Multi-hijo)</option>
                  <option value="sep">Beca Oficial SEP / Institucional</option>
                  <option value="socioeconomica">Apoyo Socioeconómico y Comité Escolar</option>
                </select>
              </div>

              {/* Justificación / Folio */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Folio de Aprobación o Justificación:</label>
                <input
                  type="text"
                  value={scholarshipNotes}
                  onChange={(e) => setScholarshipNotes(e.target.value)}
                  placeholder="Ej. Aprobado por Comité de Becas en Sesión Ordinaria 2026-B"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Desglose de Cálculo en Vivo */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Precio Base de Colegiatura:</span>
                  <span className="font-mono">${baseFeeForModal.toFixed(2)} MXN</span>
                </div>
                <div className="flex justify-between text-purple-700 font-medium">
                  <span>Descuento por Beca ({scholarshipPercent}%):</span>
                  <span className="font-mono">-${scholarshipDiscountCalculated.toFixed(2)} MXN</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-purple-200 text-sm font-bold text-slate-900">
                  <span>Nuevo Total Neto Mensual:</span>
                  <span className="font-mono text-purple-900 text-base">${netMonthlyCalculated.toFixed(2)} MXN</span>
                </div>
              </div>

            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveScholarshipStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveScholarship}
                className="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-purple-700/20"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar y Actualizar Estados de Cuenta</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Recordatorio Magic Link */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Despachar Recordatorio de Cobro</h3>
                  <p className="text-xs text-slate-500">Magic Link cifrado con pasarela bancaria</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSendingLink ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="text-xs text-slate-600 font-medium">Generando enlace institucional con token firmado...</div>
              </div>
            ) : magicLinkResult ? (
              <div className="space-y-4 text-xs">
                
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tutor / Familia:</span>
                    <span className="font-semibold text-slate-800">{activeModalRecord.parentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alumno:</span>
                    <span className="font-semibold text-slate-800">{activeModalRecord.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monto Exigible:</span>
                    <span className="font-mono font-bold text-slate-900">${activeModalRecord.amount.toFixed(2)} MXN</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Enlace Seguro de Pago (Magic Link):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={magicLinkResult.paymentUrl}
                      className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 font-mono text-slate-700 text-[11px]"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(magicLinkResult.paymentUrl);
                        showToast('Enlace copiado al portapapeles.');
                      }}
                      className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg shrink-0"
                      title="Copiar enlace"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleCopyWhatsApp}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedText ? '¡Copiado!' : 'Copiar para WhatsApp'}</span>
                  </button>

                  <a
                    href={`https://wa.me/52${activeModalRecord.parentPhone}?text=${encodeURIComponent(magicLinkResult.whatsAppMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
                  >
                    <span>Abrir WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* Modal de Registro de Pago Manual (Caja / Ventanilla) */}
      {manualPaymentRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Registrar Pago Manual en Caja</h3>
                  <p className="text-xs text-slate-500">Conciliación directa de colegiatura o cuota</p>
                </div>
              </div>
              <button
                onClick={() => setManualPaymentRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha Resumen del Cargo */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Folio de Cargo:</span>
                <span className="font-mono font-bold text-slate-800">{manualPaymentRecord.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alumno:</span>
                <span className="font-bold text-slate-900">{manualPaymentRecord.studentName} ({manualPaymentRecord.grade} "{manualPaymentRecord.group}")</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tutor Responsable:</span>
                <span className="text-slate-800">{manualPaymentRecord.parentName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-700">Monto del Adeudo:</span>
                <span className="font-mono font-black text-emerald-700">${manualPaymentRecord.amount.toFixed(2)} MXN</span>
              </div>
            </div>

            {/* Formulario de Conciliación Manual */}
            <div className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-700 font-bold mb-1">Método de Pago Recibido:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cash', label: 'Efectivo', desc: 'Ventanilla' },
                    { id: 'spei', label: 'SPEI / Transf.', desc: 'Bancarizado' },
                    { id: 'terminal_card', label: 'Tarjeta (TPV)', desc: 'Terminal física' },
                    { id: 'check', label: 'Cheque', desc: 'Institucional' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setManualMethod(m.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        manualMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{m.label}</div>
                      <div className="text-[9px] text-slate-400 font-normal">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Folio / Voucher / Ref:</label>
                  <input
                    type="text"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    placeholder="Ej. AUT-891230"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha de Cobro:</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Monto Cobrado (MXN):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 pl-7 font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <input
                  type="checkbox"
                  id="chkAutoInvoice"
                  checked={manualAutoInvoice}
                  onChange={(e) => setManualAutoInvoice(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chkAutoInvoice" className="text-[11px] text-slate-700">
                  <strong className="block text-blue-900 font-bold">Timbrado Fiscal Automático CFDI 4.0 (SAT)</strong>
                  Generar y enviar la factura electrónica al correo fiscal del tutor inmediatamente tras el cobro.
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Observaciones / Notas Internas:</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Ej. Pago en ventanilla escolar entregado por el tutor"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setManualPaymentRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmManualPayment}
                disabled={isProcessingManualPayment || manualAmount <= 0}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20"
              >
                {isProcessingManualPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Conciliando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirmar y Aplicar Pago</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Comprobante / Recibo Oficial de Pago */}
      {viewReceiptRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  JJR
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">UP Juan Jacobo Rosseau</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Recibo Oficial de Pago • Control Escolar</p>
                </div>
              </div>
              <button
                onClick={() => setViewReceiptRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-xs">Pago Conciliado & Acreditado</div>
                  <div className="text-[10px] text-emerald-600">Estatus: Al Corriente en Plataforma</div>
                </div>
              </div>
              <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-900">
                {viewReceiptRecord.receiptNumber}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Alumno:</span>
                <span className="font-bold text-slate-900">{viewReceiptRecord.record.studentName} ({viewReceiptRecord.record.grade} "{viewReceiptRecord.record.group}")</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Tutor:</span>
                <span className="text-slate-800">{viewReceiptRecord.record.parentName}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Concepto:</span>
                <span className="font-medium text-slate-800">{viewReceiptRecord.record.concept}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-semibold text-slate-800">{viewReceiptRecord.paymentMethod}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Fecha de Acreditación:</span>
                <span className="text-slate-800">{viewReceiptRecord.paidAt}</span>
              </div>
              <div className="p-3 flex justify-between bg-slate-50 rounded-b-xl text-sm">
                <span className="font-bold text-slate-800">Total Liquidado:</span>
                <span className="font-mono font-black text-emerald-700">${viewReceiptRecord.record.amount.toFixed(2)} MXN</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[10px] text-slate-400">
                CFDI 4.0: {viewReceiptRecord.record.autoInvoice ? 'Timbrado y enviado por correo' : 'Comprobante interno'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewReceiptRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
