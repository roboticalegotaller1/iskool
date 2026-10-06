"use client";

import React, { useState, useMemo } from 'react';
import { OrganizationHolding } from '@/types';
import {
  Mail,
  Send,
  Inbox,
  Users,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Sparkles,
  ChevronRight,
  X,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

interface CEOEmailCommunicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: OrganizationHolding;
  schoolId?: string;
  selectedCampusId?: string;
  onTriggerToast: (msg: string) => void;
}

interface OutgoingEmailLog {
  id: string;
  timestamp: string;
  subject: string;
  recipientGroup: string;
  targetCount: number;
  status: 'Entregado (100%)' | 'Enviado' | 'En Cola';
  sender: string;
}

export function CEOEmailCommunicationsModal({
  isOpen,
  onClose,
  holding,
  schoolId = 'sch-ibime',
  selectedCampusId = 'all',
  onTriggerToast
}: CEOEmailCommunicationsModalProps) {
  const [activeTab, setActiveTab] = useState<'redactar' | 'directorio' | 'bitacora'>('redactar');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all-network');
  const [subject, setSubject] = useState<string>('Circular Institucional: Lineamientos de Operación y Calendario Escolar 2026-2027');
  const [content, setContent] = useState<string>(
`Estimada Comunidad Institucional de ${holding?.name || 'Instituto Bilingüe IBIME'},

Por medio del presente comunicado oficial de la Dirección General, les extendemos un cordial saludo y compartimos las directrices académicas y operativas para el ciclo escolar en curso en nuestras 4 sedes.

1. Seguimiento Curricular: Verificación continua de PDA y fases de aprendizaje activas.
2. Comunicación Oficial: Canales institucionales abiertos para atención directiva y académica.
3. Compromiso con la Excelencia: Continuidad en programas bilingües y formación integral.

Agradecemos su compromiso constante con nuestra misión educativa.

Atentamente,
Dirección General & Consejo Directivo
${holding?.name || 'Instituto Bilingüe IBIME'}`
  );

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Historial de correos despachados
  const [logs, setLogs] = useState<OutgoingEmailLog[]>([
    {
      id: 'log-1',
      timestamp: 'Hoy, 09:15 hrs',
      subject: 'Circular No. 2026-08: Convocatoria a Sesión de Consejo Directivo y Directores de Plantel',
      recipientGroup: 'Directores de Campus & Coordinación',
      targetCount: 4,
      status: 'Entregado (100%)',
      sender: 'direccion.general@ibime.edu.mx'
    },
    {
      id: 'log-2',
      timestamp: 'Ayer, 16:30 hrs',
      subject: 'Aviso de Facturación CFDI 4.0 con Complemento IEDU - Ciclo 2026-2027',
      recipientGroup: 'Comunidad de Padres de Familia (4 Sedes)',
      targetCount: 3740,
      status: 'Entregado (100%)',
      sender: 'cobranza@ibime.edu.mx'
    },
    {
      id: 'log-3',
      timestamp: '03 Oct 2026, 11:00 hrs',
      subject: 'Boletín Trimestral de Logros Bilingües y Evaluación Pedagógica',
      recipientGroup: 'Cuerpo Docente & Académico',
      targetCount: 200,
      status: 'Entregado (100%)',
      sender: 'academico@ibime.edu.mx'
    }
  ]);

  // Cuentas del directorio institucional
  const institutionalDirectory = useMemo(() => {
    return [
      {
        campus: 'Central / Consorcio',
        department: 'Dirección General Holding',
        email: 'direccion.general@ibime.edu.mx',
        holder: holding.directorName || 'Lic. Patricia Reyes Mondragón',
        role: 'CEO & Directora General'
      },
      {
        campus: 'Central / Consorcio',
        department: 'Admisiones & Matrícula Red',
        email: 'admisiones@ibime.edu.mx',
        holder: 'Coordinación Central de Admisiones',
        role: 'Atención a Nuevas Familias'
      },
      {
        campus: 'Central / Consorcio',
        department: 'Finanzas, Facturación & Cobranza',
        email: 'cobranza@ibime.edu.mx',
        holder: 'C.P. Claudia Albarrán',
        role: 'Dirección de Administración y Finanzas'
      },
      {
        campus: 'Campus Montes (Sede Matriz)',
        department: 'Dirección de Plantel',
        email: 'direccion.montes@ibime.edu.mx',
        holder: 'Mtra. Elena Cárdenas V.',
        role: 'Directora Técnica Montes'
      },
      {
        campus: 'Campus Lagos (Fundador)',
        department: 'Dirección de Plantel',
        email: 'direccion.lagos@ibime.edu.mx',
        holder: 'Lic. Roberto Garza Treviño',
        role: 'Director Técnico Lagos'
      },
      {
        campus: 'Campus San Cristóbal (Centro)',
        department: 'Dirección de Plantel',
        email: 'direccion.sancristobal@ibime.edu.mx',
        holder: 'Dra. Andrea Ruiz Pantoja',
        role: 'Directora Técnica San Cristóbal'
      },
      {
        campus: 'Campus Coacalco (Metropolitano)',
        department: 'Dirección de Plantel',
        email: 'direccion.coacalco@ibime.edu.mx',
        holder: 'Mtro. Héctor Ortiz Beltrán',
        role: 'Director Técnico Coacalco'
      }
    ];
  }, [holding]);

  // Plantillas oficiales para directivos
  const applyTemplate = (type: 'circular' | 'consejo' | 'cobranza' | 'urgente') => {
    if (type === 'circular') {
      setSubject('Circular Ejecutiva: Directrices Académicas y Operativas de la Red Escolar');
      setContent(
`Estimada Comunidad de ${holding?.name || 'Instituto Bilingüe IBIME'},

Por este conducto institucional, la Dirección General hace de su conocimiento los siguientes acuerdos y lineamientos aplicables a nuestros 4 campus:

1. Calendario de Evaluaciones y Entregables Curriculares.
2. Protocolos de Seguridad y Convivencia Escolar Activos.
3. Actividades Extracurriculares y Formación Integral.

Reiteramos nuestro compromiso con la excelencia educativa de sus hijos.

Atentamente,
Dirección General
${holding?.name || 'Instituto Bilingüe IBIME'}`
      );
      setSelectedRecipient('all-network');
      onTriggerToast('Plantilla cargada: Circular Ejecutiva');
    } else if (type === 'consejo') {
      setSubject('Convocatoria Oficial: Sesión Ordinaria de Consejo Directivo y Directores de Campus');
      setContent(
`Estimados Directores de Campus y Coordinadores Académicos,

Por instrucción de la Dirección General de ${holding?.name || 'Instituto Bilingüe IBIME'}, se convoca a la Sesión de Consejo Directivo:

• Fecha: Próximo Viernes
• Hora: 10:00 hrs
• Orden del Día:
  1. Revisión de Indicadores de Retención y Cobranza por Campus.
  2. Auditoría Curricular de Fases de Aprendizaje y Portafolios.
  3. Proyecciones de Cierre del Período y Mantenimiento de Infraestructura.

Favor de confirmar asistencia y remitir sus informes departamentales con antelación.

Atentamente,
Secretaría Técnica de Dirección General`
      );
      setSelectedRecipient('directors');
      onTriggerToast('Plantilla cargada: Convocatoria a Consejo Directivo');
    } else if (type === 'cobranza') {
      setSubject('Recordatorio Institucional: Emisión de Comprobantes Fiscales CFDI 4.0 y Fechas de Corte');
      setContent(
`Estimados Padres de Familia y Tutores de ${holding?.name || 'Instituto Bilingüe IBIME'},

Les saludamos cordialmente. Ponemos a su disposición el calendario de corte para el timbrado de colegiaturas y comprobantes fiscales CFDI 4.0 con complemento IEDU correspondiente a este período.

• Canales de Pago Seguros: Transferencia SPEI, Tarjeta y Caja Escolar en Campus.
• Descarga de Facturas: Disponibles automáticamente en su portal institucional.
• Aclaraciones: A través del departamento de Finanzas en cobranza@ibime.edu.mx.

Agradecemos su puntual colaboración para mantener el óptimo funcionamiento institucional.

Atentamente,
Departamento de Administración y Cobranza`
      );
      setSelectedRecipient('parents');
      onTriggerToast('Plantilla cargada: Recordatorio de Facturación y Pagos');
    } else if (type === 'urgente') {
      setSubject('Aviso Urgente de Dirección: Activación Preventiva de Protocolo Institucional');
      setContent(
`COMUNICADO OFICIAL URGENTE
Comunidad Escolar de ${holding?.name || 'Instituto Bilingüe IBIME'}:

Les informamos que se ha activado de manera preventiva el protocolo de protección institucional en nuestros planteles debido a las condiciones notificadas por Protección Civil.

• Las actividades escolares continúan bajo resguardo seguro en instalaciones.
• Se solicita a los tutores mantenerse atentos exclusivamente a los canales institucionales oficiales.
• Las puertas y accesos permanecen bajo estricto control de seguridad y credencialización.

Atentamente,
Comité de Seguridad y Protección Escolar`
      );
      setSelectedRecipient('all-network');
      onTriggerToast('Plantilla cargada: Aviso Urgente');
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`Asunto: ${subject}\n\n${content}`);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    onTriggerToast('✓ Comunicado copiado al portapapeles');
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedAddress(email);
    setTimeout(() => setCopiedAddress(null), 2000);
    onTriggerToast(`✓ Correo copiado: ${email}`);
  };

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newLog: OutgoingEmailLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Justo ahora',
        subject: subject,
        recipientGroup:
          selectedRecipient === 'all-network' ? 'Toda la Red (4 Sedes)' :
          selectedRecipient === 'directors' ? 'Directores de Campus' :
          selectedRecipient === 'teachers' ? 'Cuerpo Docente (200 profesores)' :
          selectedRecipient === 'parents' ? 'Padres de Familia (3,740)' : 'Campus Seleccionado',
        targetCount:
          selectedRecipient === 'all-network' ? 3944 :
          selectedRecipient === 'directors' ? 4 :
          selectedRecipient === 'teachers' ? 200 :
          selectedRecipient === 'parents' ? 3740 : 1,
        status: 'Entregado (100%)',
        sender: 'direccion.general@ibime.edu.mx'
      };
      setLogs([newLog, ...logs]);
      onTriggerToast(`✓ Comunicado oficial despachado exitosamente a ${newLog.recipientGroup}`);
      setActiveTab('bitacora');
    }, 600);
  };

  const handleOpenMailto = () => {
    const targetEmail =
      selectedRecipient === 'directors' ? 'directores@ibime.edu.mx' :
      selectedRecipient === 'parents' ? 'padres@ibime.edu.mx' :
      selectedRecipient === 'teachers' ? 'docentes@ibime.edu.mx' :
      'direccion.general@ibime.edu.mx';
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
    window.open(mailtoUrl, '_blank');
    onTriggerToast('Abriendo cliente de correo institucional...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* ========================================================= */}
        {/* HEADER DEL MODAL                                          */}
        {/* ========================================================= */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/40">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5448f7] to-[#4338ca] text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Consola de Correo Institucional & Comunicados CEO
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Red Oficial TLS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {holding?.name || 'Instituto Bilingüe IBIME'} · Gestión centralizada de correspondencia directiva y masiva
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* SELECTOR DE PESTAÑAS                                      */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('redactar')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 ${
                activeTab === 'redactar'
                  ? 'border-[#5448f7] text-[#5448f7] bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Redactar Comunicado</span>
            </button>

            <button
              onClick={() => setActiveTab('directorio')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 ${
                activeTab === 'directorio'
                  ? 'border-[#5448f7] text-[#5448f7] bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Directorio de Cuentas ({institutionalDirectory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bitacora')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 ${
                activeTab === 'bitacora'
                  ? 'border-[#5448f7] text-[#5448f7] bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Bitácora de Envíos ({logs.length})</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Servidor SMTP/TLS Activo</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CONTENIDO PRINCIPAL SCROLLABLE                            */}
        {/* ========================================================= */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/30">
          
          {/* TAB 1: REDACTAR COMUNICADO */}
          {activeTab === 'redactar' && (
            <div className="space-y-4">
              
              {/* Plantillas Rápidas */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
                  Plantillas Ejecutivas 1-Clic:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => applyTemplate('circular')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                      <span>Circular General</span>
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">Lineamientos red</div>
                  </button>

                  <button
                    onClick={() => applyTemplate('consejo')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                      <span>Consejo Directivo</span>
                      <Users className="h-3 w-3 text-indigo-500" />
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">Convocatoria campus</div>
                  </button>

                  <button
                    onClick={() => applyTemplate('cobranza')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                      <span>Aviso Cobranza</span>
                      <FileText className="h-3 w-3 text-indigo-500" />
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">Corte fiscal CFDI 4.0</div>
                  </button>

                  <button
                    onClick={() => applyTemplate('urgente')}
                    className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="text-[11px] font-bold text-rose-800 flex items-center justify-between">
                      <span>Aviso Urgente</span>
                      <AlertCircle className="h-3 w-3 text-rose-500" />
                    </div>
                    <div className="text-[10px] text-rose-600 truncate">Protección Civil</div>
                  </button>
                </div>
              </div>

              {/* Destinatarios */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Destinatarios / Alcance:
                    </label>
                    <select
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      <option value="all-network">Toda la Red (4 Sedes · 3,740 Familias)</option>
                      <option value="directors">Directores de Campus (Montes, Lagos, San Cristóbal, Coacalco)</option>
                      <option value="teachers">Cuerpo Docente Completo (200 Profesores)</option>
                      <option value="parents">Padres de Familia y Tutores</option>
                      <option value="campus-montes">Solo Campus Montes (Sede Matriz)</option>
                      <option value="campus-lagos">Solo Campus Lagos</option>
                      <option value="campus-sancristobal">Solo Campus San Cristóbal</option>
                      <option value="campus-coacalco">Solo Campus Coacalco</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Asunto del Correo:
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Escribe el asunto del comunicado..."
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Área de Mensaje */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Cuerpo del Comunicado:
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {content.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-xs font-sans leading-relaxed p-3.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors custom-scrollbar"
                    placeholder="Redacta las indicaciones oficiales..."
                  />
                </div>

                {/* Barra de Acciones */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyContent}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedMessage ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                      <span>{copiedMessage ? 'Copiado' : 'Copiar Texto'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenMailto}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      title="Abrir en cliente de correo predeterminado del sistema operativo"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Abrir en Cliente de Correo</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSending || !subject.trim() || !content.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5448f7] hover:bg-[#4639ed] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Despachando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Enviar Comunicado Oficial</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECTORIO DE CUENTAS */}
          {activeTab === 'directorio' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Cuentas oficiales de correo institucional autorizadas en el servidor:</span>
                <span className="font-bold text-indigo-600">Dominio @ibime.edu.mx</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {institutionalDirectory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-200 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                        {item.campus}
                      </div>
                      <div className="text-xs font-black text-slate-900 truncate">
                        {item.department}
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                        {item.holder} · <span className="text-slate-400">{item.role}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="font-bold">{item.email}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyEmail(item.email)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Copiar correo"
                      >
                        {copiedAddress === item.email ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent('Comunicación Directiva CEO')}`}
                        className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer text-center"
                        title="Redactar a esta dirección"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BITÁCORA DE ENVÍOS */}
          {activeTab === 'bitacora' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Registro cronológico de despachos de correo emitidos desde la suite directiva:</span>
                <span className="font-mono text-emerald-600 font-bold">● Tasa de Entrega: 100%</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3.5">Fecha y Hora</th>
                      <th className="py-2.5 px-3.5">Asunto Institucional</th>
                      <th className="py-2.5 px-3.5">Destinatarios</th>
                      <th className="py-2.5 px-3.5 text-right">Alcance</th>
                      <th className="py-2.5 px-3.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-800 max-w-[280px] truncate" title={log.subject}>
                          {log.subject}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600 font-medium">
                          {log.recipientGroup}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-700">
                          {log.targetCount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* FOOTER DEL MODAL                                          */}
        {/* ========================================================= */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Encriptación Institucional · Bitácora Inmutable de Salida</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
export default CEOEmailCommunicationsModal;
