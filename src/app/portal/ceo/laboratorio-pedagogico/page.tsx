"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  LaboratorioAuthGate 
} from '@/components/portal/ceo/laboratorio/LaboratorioAuthGate';
import type { LaboratorioSessionMetadata } from '@/app/api/auth/laboratorio-session/route';
import type { TriageResult, EmailQuadrant } from '@/lib/services/hermetic-email-brain.service';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Building2, 
  Send, 
  Zap, 
  Copy, 
  Check, 
  Clock, 
  FileText, 
  Layers, 
  AlertTriangle, 
  Info, 
  Trash2, 
  RefreshCw, 
  UploadCloud, 
  User, 
  Mail, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Inbox,
  LogOut,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface TestCasePreset {
  name: string;
  quadrant: EmailQuadrant;
  icon: string;
  sender_name: string;
  sender_email: string;
  recipient_account: string;
  subject: string;
  body_text: string;
  reincidence_count: number;
}

export default function LaboratorioPedagógicoPage() {
  const [session, setSession] = useState<LaboratorioSessionMetadata | null>(null);

  // Campos de formulario de ingesta en vivo
  const [recipientAccount, setRecipientAccount] = useState<string>('direccion');
  const [senderName, setSenderName] = useState<string>('Sra. Patricia Mendoza');
  const [senderEmail, setSenderEmail] = useState<string>('pmendoza@familia.com');
  const [subject, setSubject] = useState<string>('Urgente: Acoso escolar y conflicto recurrente en 5º B');
  const [bodyText, setBodyText] = useState<string>(
    'Estimada Dirección:\n\nMe dirijo a usted con profunda preocupación. Mi hijo volvió a ser agredido física y verbalmente durante el recreo de ayer. Ya es la tercera ocasión que reportamos esto sin una respuesta definitiva. Exijo una reunión urgente con Dirección General mañana mismo o nos veremos forzados a escalar el asunto formalmente.'
  );
  const [reincidenceCount, setReincidenceCount] = useState<number>(3);

  // Estados de ejecución
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [dispatchApproved, setDispatchApproved] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Editable en borrador
  const [editableSubject, setEditableSubject] = useState<string>('');
  const [editableBody, setEditableBody] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actualizar el sufijo del dominio de las cuentas receptoras según la sesión
  const institutionDomain = session?.email?.includes('@') 
    ? session.email.split('@')[1] 
    : 'colegio.edu.mx';

  // Casos de prueba preconfigurados para demostración rápida
  const TEST_PRESETS: TestCasePreset[] = [
    {
      name: '🔴 Caso Crítico: Acoso en Recreo',
      quadrant: 'ATENCION_CEO',
      icon: 'AlertTriangle',
      sender_name: 'Sra. Patricia Mendoza',
      sender_email: 'pmendoza@familia.com',
      recipient_account: 'direccion',
      subject: 'Urgente: Acoso escolar y conflicto recurrente en 5º B',
      body_text: 'Estimada Dirección:\n\nMi hijo volvió a ser agredido en el recreo de ayer en Campus Central. Ya habíamos solicitado mediación pero la situación continúa. Exijo una cita presencial con Dirección General mañana.',
      reincidence_count: 3
    },
    {
      name: '🟡 Logística: Retraso Ruta 4',
      quadrant: 'DELEGADO_CON_SLA',
      icon: 'Clock',
      sender_name: 'Mtra. Elena Torres',
      sender_email: 'fam.torres@gmail.com',
      recipient_account: 'prefectura',
      subject: 'Demora recurrente en Ruta 4 matutina',
      body_text: 'Buenos días. Nuevamente el transporte escolar de la Ruta 4 llegó con 25 minutos de retraso a la parada central de la avenida. Agradecemos su revisión para no afectar el ingreso a clase.',
      reincidence_count: 1
    },
    {
      name: '🟡 Cobranza: Factura CFDI Octubre',
      quadrant: 'DELEGADO_CON_SLA',
      icon: 'FileText',
      sender_name: 'Lic. Claudia Nava',
      sender_email: 'fiscal@corporativo.com',
      recipient_account: 'cobranza',
      subject: 'Solicitud de factura CFDI colegiatura octubre',
      body_text: 'Estimado departamento administrativo:\n\nAdjunto comprobante de pago de la colegiatura correspondiente a octubre para Diego y solicito la emisión del CFDI con complemento educativo para deducibilidad.',
      reincidence_count: 1
    },
    {
      name: '🟡 Control Escolar: Kardex SEP',
      quadrant: 'DELEGADO_CON_SLA',
      icon: 'Layers',
      sender_name: 'Dr. Fernando Ortiz',
      sender_email: 'fortiz@medica.mx',
      recipient_account: 'controlescolar',
      subject: 'Solicitud de constancia de estudios con kardex oficial SEP',
      body_text: 'Buenas tardes. Requerimos la constancia de estudios con promedio acumulado y folio SEP para el trámite de beca universitaria de nuestra hija.',
      reincidence_count: 1
    },
    {
      name: '🔵 Informativo: Asistencia a Asamblea',
      quadrant: 'INFORMATIVO',
      icon: 'Info',
      sender_name: 'Familia Salazar Gómez',
      sender_email: 'salazar.g@outlook.com',
      recipient_account: 'direccion',
      subject: 'Confirmación de asistencia a la escuela para padres',
      body_text: 'Confirmamos con gusto la presencia de ambos tutores en la conferencia de orientación socioemocional del próximo viernes a las 18:00 hrs.',
      reincidence_count: 1
    },
    {
      name: '⚪ Spam: Préstamo sin Buró',
      quadrant: 'SPAM_DESCARTADO',
      icon: 'Trash2',
      sender_name: 'Créditos Inmediatos FinTech',
      sender_email: 'ofertas@prestamos-rapidos.biz',
      recipient_account: 'direccion',
      subject: '¡Felicidades! Crédito preaprobado de $500,000 sin buró',
      body_text: 'Disfruta de liquidez inmediata para tu institución o personas físicas sin revisión de buró de crédito ni avales. Haz clic aquí ahora.',
      reincidence_count: 1
    }
  ];

  const applyPreset = (preset: TestCasePreset) => {
    setSenderName(preset.sender_name);
    setSenderEmail(preset.sender_email);
    setRecipientAccount(preset.recipient_account);
    setSubject(preset.subject);
    setBodyText(preset.body_text);
    setReincidenceCount(preset.reincidence_count);
    setTriageResult(null);
    setErrorMessage('');
    setDispatchApproved(false);
  };

  // Procesamiento del correo en vivo
  const handleProcessEmail = async () => {
    if (!subject || !bodyText) {
      setErrorMessage('Por favor ingrese el asunto y cuerpo del correo.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setDispatchApproved(false);

    try {
      const res = await fetch('/api/portal/ceo/laboratorio/process-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_name: senderName,
          sender_email: senderEmail,
          recipient_email: `${recipientAccount}@${institutionDomain}`,
          subject,
          body_text: bodyText,
          reincidence_count: reincidenceCount
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.triage) {
        setTriageResult(data.triage);
        setEditableSubject(data.triage.suggested_draft?.subject || `Re: ${subject}`);
        setEditableBody(data.triage.suggested_draft?.body || '');
      } else {
        setErrorMessage(data.error || 'Error procesando el correo con el motor cognitivo.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el laboratorio.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Soporte para arrastrar y soltar archivos .eml
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Parseo básico de archivos RFC 822 / .eml
      const lines = content.split(/\r?\n/);
      let parsedSubject = '';
      let parsedFrom = '';
      let bodyStartIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().startsWith('subject:')) {
          parsedSubject = line.substring(8).trim();
        } else if (line.toLowerCase().startsWith('from:')) {
          parsedFrom = line.substring(5).trim();
        } else if (line.trim() === '') {
          bodyStartIndex = i + 1;
          break;
        }
      }

      const parsedBody = bodyStartIndex > 0 
        ? lines.slice(bodyStartIndex).join('\n').trim() 
        : content;

      if (parsedSubject) setSubject(parsedSubject);
      if (parsedFrom) {
        if (parsedFrom.includes('<') && parsedFrom.includes('>')) {
          const matchName = parsedFrom.split('<')[0].replace(/"/g, '').trim();
          const matchEmail = parsedFrom.split('<')[1].replace('>', '').trim();
          if (matchName) setSenderName(matchName);
          if (matchEmail) setSenderEmail(matchEmail);
        } else {
          setSenderEmail(parsedFrom);
        }
      }
      if (parsedBody) setBodyText(parsedBody);
    };

    reader.readAsText(file);
  };

  const copyDraftToClipboard = () => {
    const fullText = `Asunto: ${editableSubject}\n\n${editableBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const approveDispatch = () => {
    setDispatchApproved(true);
  };

  // Renderizador del Badge de Cuadrante
  const renderQuadrantBadge = (quadrant: EmailQuadrant) => {
    switch (quadrant) {
      case 'ATENCION_CEO':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wide shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>🔴 Cuadrante 1: Atención CEO & Gobernanza</span>
          </div>
        );
      case 'DELEGADO_CON_SLA':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wide shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>🟡 Cuadrante 2: Delegado Operativo con SLA</span>
          </div>
        );
      case 'INFORMATIVO':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold text-xs uppercase tracking-wide shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>🔵 Cuadrante 3: Informativo / Archivo</span>
          </div>
        );
      case 'SPAM_DESCARTADO':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-500/15 border border-slate-500/30 text-slate-400 font-bold text-xs uppercase tracking-wide shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>⚪ Cuadrante 4: Descartado / No Deseado</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Compuerta de Acceso con Auth Gate (Bloquea la vista si no hay sesión) */}
      <LaboratorioAuthGate onSessionChange={(activeSession) => setSession(activeSession)}>
        
        {/* ENCABEZADO CON ESTADO DEL ENTORNO */}
        <header className="mb-8 p-6 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Laboratorio Pedagógico & Test Cases
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Simulación de inferencia y triage directivo en tiempo real con aislamiento de bóveda para{' '}
                <strong className="text-slate-200">{session?.institution_name || 'Institución'}</strong>.
              </p>
            </div>

            {/* Insignias de Seguridad del Entorno Activo */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bóveda 100% Hermética y Cifrada</span>
              </div>

              {session?.is_isolated_sandbox ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Sandbox Aislado</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Tenant Canónico</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BARRA DE CASOS PRECONFIGURADOS RÁPIDOS */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Casos de Prueba Canónicos (Carga Instantánea)</span>
            </span>
            <span className="text-[11px] text-slate-500">Selecciona un preset para evaluar el motor</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {TEST_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-left transition-all duration-200 group active:scale-[0.98] cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  {preset.sender_name}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* LAYOUT PRINCIPAL: PANEL DIVIDIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PANEL IZQUIERDO: ÁREA DE INGESTA Y PRUEBAS EN VIVO (5 COLUMNAS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-xl relative">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-sky-400" />
                  <span>Ingesta de Correo en Vivo</span>
                </h2>
                <span className="text-[11px] text-slate-500 font-mono">RFC 822 / Live DTO</span>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2.5 text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleProcessEmail(); }} className="space-y-4">
                {/* Selector de Cuenta Receptora Dinámica */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bandeja Receptora Institucional
                  </label>
                  <select
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                  >
                    <option value="direccion">direccion@{institutionDomain} (Dirección General / Rectoría)</option>
                    <option value="cobranza">cobranza@{institutionDomain} (Cobranza y Facturación)</option>
                    <option value="controlescolar">controlescolar@{institutionDomain} (Control Escolar / Secretaría)</option>
                    <option value="coordinacion">coordinacion@{institutionDomain} (Coordinación Académica)</option>
                    <option value="prefectura">prefectura@{institutionDomain} (Logística / Transporte)</option>
                  </select>
                </div>

                {/* Remitente: Nombre y Correo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nombre del Remitente
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="ej. Sra. Patricia Mendoza"
                        required
                        className="w-full pl-8 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="remitente@familia.com"
                        required
                        className="w-full pl-8 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>

                {/* Asunto y Contador de Reincidencias */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Asunto del Correo
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Asunto formal"
                      required
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Reincidencias
                    </label>
                    <select
                      value={reincidenceCount}
                      onChange={(e) => setReincidenceCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    >
                      <option value={1}>1 (Primer reporte)</option>
                      <option value={2}>2 (Segunda vez)</option>
                      <option value={3}>3 (Alerta Directiva)</option>
                      <option value={4}>4 (Caso crítico)</option>
                      <option value={5}>5+ (Riesgo máximo)</option>
                    </select>
                  </div>
                </div>

                {/* Zona de Arrastrar y Soltar / Textarea de Correo */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Cuerpo del Mensaje / Archivo .EML
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                    >
                      Cargar archivo .eml
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept=".eml,.txt"
                      className="hidden"
                    />
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl border transition-all ${
                      isDragging 
                        ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/40' 
                        : 'border-slate-800 bg-slate-950/80'
                    }`}
                  >
                    <textarea
                      rows={7}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Pegue aquí el texto completo del correo electrónico o arrastre un archivo .eml exportado de su cliente de mensajería..."
                      required
                      className="w-full p-3.5 bg-transparent rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-mono text-[12px] leading-relaxed"
                    />

                    {isDragging && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-2xl backdrop-blur-xs pointer-events-none">
                        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
                          <UploadCloud className="w-5 h-5 animate-bounce" />
                          <span>Suelte el archivo .eml para procesar</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de Acción Principal */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl shadow-sky-600/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Iniciando Inferencia Hermética en Tiempo Real...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>⚡ Procesar en Tiempo Real con Cerebro Institucional</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* PANEL DERECHO: RESULTADOS REACTIVOS (7 COLUMNAS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Estado Vacío / Espera */}
            {!triageResult && !isProcessing && (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">
                  Esperando Mensaje de Entrada
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-md leading-relaxed">
                  Ingrese un correo manual o seleccione un caso canónico en la barra superior. El motor evaluará el cuadrante correspondiente, recuperará precedentes de la bóveda del colegio y formulará la respuesta oficial.
                </p>
              </div>
            )}

            {/* Spinner Activo de Inferencia */}
            {isProcessing && (
              <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-sky-400 absolute" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">
                  Resolviendo Bounded Context & Matriz de Decisión
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Filtrando precedentes normativos exclusivamente para {session?.institution_name}...
                </p>
              </div>
            )}

            {/* VISTA DE RESULTADOS REACTIVOS */}
            {triageResult && !isProcessing && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. CUADRANTE DE DECISIÓN Y METADATOS */}
                <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    {renderQuadrantBadge(triageResult.quadrant)}

                    {/* Telemetría en Vivo */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>{triageResult.telemetry.latency_ms} ms</span>
                      <span className="text-slate-600">|</span>
                      <span>Vector: {triageResult.telemetry.vector_search_ms}ms</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Categoría</span>
                      <span className="font-semibold text-slate-200">{triageResult.category}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Área Responsable</span>
                      <span className="font-semibold text-slate-200">
                        {triageResult.assigned_department || 'Dirección General'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">SLA de Resolución</span>
                      <span className="font-semibold text-slate-200">
                        {triageResult.sla_hours ? `${triageResult.sla_hours} horas` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. MÓDULO "¿POR QUÉ TE LO MUESTRO?" */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-indigo-500/20 shadow-xl">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      ¿Por qué te lo muestro? (Explicabilidad Directiva)
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    {triageResult.why_shown_to_director}
                  </p>

                  <div className="mt-3.5 flex items-start gap-2.5 text-xs text-sky-300 bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Acción Recomendada:</strong>
                      <span>{triageResult.recommended_action}</span>
                    </div>
                  </div>
                </div>

                {/* 3. BORRADOR DE RESPUESTA OFICIAL */}
                <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <h3 className="text-sm font-bold text-white">
                        Borrador de Respuesta Oficial
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                        Tono: {triageResult.suggested_draft.tone}
                      </span>
                    </div>
                  </div>

                  {dispatchApproved && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Despacho oficial aprobado. Folio registrado en el Libro de Actas de Dirección.</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Asunto Saliente
                      </label>
                      <input
                        type="text"
                        value={editableSubject}
                        onChange={(e) => setEditableSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Cuerpo Institucional
                      </label>
                      <textarea
                        rows={7}
                        value={editableBody}
                        onChange={(e) => setEditableBody(e.target.value)}
                        className="w-full p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none font-mono text-[12px] leading-relaxed"
                      />
                    </div>

                    {/* Botones de Acción del Borrador */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={copyDraftToClipboard}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {copiedDraft ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Borrador</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={approveDispatch}
                        disabled={dispatchApproved}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Aprobar Despacho Oficial</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. PROCEDENCIA DE BÓVEDA CURRICULAR E INSTITUCIONAL */}
                <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">
                        Procedencia Institucional Verificada
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {triageResult.provenance.length} documento(s) consultado(s)
                    </span>
                  </div>

                  {triageResult.provenance.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-xl">
                      No se requirió citar precedentes normativos para esta categoría.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {triageResult.provenance.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-200">
                              {doc.document_title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {Math.round(doc.confidence_score * 100)}% match
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono mb-2">
                            {doc.source_path}
                          </div>

                          <blockquote className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border-l-2 border-emerald-500 leading-relaxed italic">
                            "{doc.matched_clause}"
                          </blockquote>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </LaboratorioAuthGate>
    </div>
  );
}
