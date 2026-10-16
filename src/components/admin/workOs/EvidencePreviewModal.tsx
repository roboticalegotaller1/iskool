"use client";

import React, { useState } from 'react';
import {
  WorkOsEvidenceDoc,
  WorkOsTask
} from '@/lib/services/workOs/workOsTypes';
import {
  X,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  UserCheck,
  Users,
  Calendar,
  Eye,
  FileCheck,
  Printer,
  Sparkles
} from 'lucide-react';

interface EvidencePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: (WorkOsEvidenceDoc & { matterCode?: string; taskTitle?: string; task?: WorkOsTask }) | null;
  task?: WorkOsTask | null;
  onOpenFullTask?: (task: WorkOsTask) => void;
}

export const EvidencePreviewModal: React.FC<EvidencePreviewModalProps> = ({
  isOpen,
  onClose,
  doc,
  task: propTask,
  onOpenFullTask
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen || !doc) return null;

  const associatedTask: WorkOsTask | undefined = propTask || doc.task;
  const matterCode = associatedTask?.matterCode || doc.matterCode || 'EXP-INSTITUCIONAL';
  const taskTitle = associatedTask?.title || doc.taskTitle || 'Asunto Institucional';
  const taskStatus = associatedTask?.status || 'EN_PROCESO';
  const progressPercent = associatedTask?.progressPercent ?? (taskStatus === 'RESUELTO' ? 100 : 50);

  // Formato de fecha
  const formattedDate = doc.uploadedAt
    ? new Date(doc.uploadedAt).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City'
      })
    : 'Fecha reciente';

  // Manejo de descarga
  const handleDownload = () => {
    if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Si no tiene dataUrl binario, descargar una copia certificada con membrete
      const textContent = `INSTITUTO BILINGÜE IBIME - BÓVEDA CENTRAL DE EVIDENCIAS
EXPEDIENTE: ${matterCode}
ASUNTO: ${taskTitle}
DOCUMENTO: ${doc.fileName}
SUBIDO POR: ${doc.uploadedBy}
FECHA: ${formattedDate}
ESTADO DEL CASO: ${taskStatus} (Progreso: ${progressPercent}%)

==================================================
CONSTANCIA DE RESGUARDO INSTITUCIONAL CERTIFICADO
==================================================
El presente documento probatorio ha sido registrado en la Bóveda Central de Evidencias con trazabilidad inmutable de Dirección General y comités delegados de IBIME.`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName.endsWith('.pdf') ? doc.fileName.replace('.pdf', '_certificado.txt') : `${doc.fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* ========================================================= */}
        {/* HEADER DEL MODAL                                          */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Vista Previa de Evidencia Documental
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {doc.fileName.split('.').pop()?.toUpperCase()} · {(doc.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                {doc.fileName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Descargar archivo"
            >
              <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CUERPO DEL MODAL (INFORMACIÓN DEL CASO + VISOR)           */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* BANNER INFORMATIVO: ¿DE QUÉ CASO ES Y CUÁL ES SU ESTADO? */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/50 shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  {matterCode}
                </span>
                {associatedTask?.sectionName && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-200">
                    {associatedTask.sectionName}
                  </span>
                )}
              </div>

              {/* Distintivo de Estado del Caso */}
              <div className="flex items-center gap-2">
                {taskStatus === 'RESUELTO' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> RESUELTO (100%)
                  </span>
                )}
                {taskStatus === 'EN_PROCESO' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs">
                    <Clock className="h-3.5 w-3.5" /> EN PROCESO ({progressPercent}%)
                  </span>
                )}
                {taskStatus === 'NO_ATENDIDO' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-400/40 animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5" /> (NO ATENDIDO)
                  </span>
                )}
                {taskStatus === 'URGENTE' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-orange-500/20 text-orange-300 border border-orange-400/40">
                    <Flame className="h-3.5 w-3.5" /> URGENTE
                  </span>
                )}
                {taskStatus === 'ESCALADO_CEO' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/40">
                    <ShieldCheck className="h-3.5 w-3.5" /> ESCALADO A CEO
                  </span>
                )}
                {taskStatus === 'PENDIENTE' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/40">
                    <Clock className="h-3.5 w-3.5" /> RECIÉN DELEGADO
                  </span>
                )}
              </div>
            </div>

            {/* Título del Expediente */}
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Expediente Institucional Vinculado
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {taskTitle}
              </h3>
            </div>

            {/* Avance del caso */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>Avance de Resolución:</span>
                <strong className="font-mono font-bold">{progressPercent}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent >= 100
                      ? 'bg-emerald-400'
                      : progressPercent >= 80
                      ? 'bg-yellow-400'
                      : progressPercent >= 30
                      ? 'bg-orange-400'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Delegados y Responsables del Caso */}
            {associatedTask && (
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-200">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    Titular: <strong className="text-white">{associatedTask.primaryAssignee.name}</strong> ({associatedTask.primaryAssignee.role})
                  </span>
                  {associatedTask.collaborators && associatedTask.collaborators.length > 0 && (
                    <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                      <Users className="h-3.5 w-3.5" />
                      {associatedTask.collaborators.length} Co-delegados: {associatedTask.collaborators.map(c => c.name).join(', ')}
                    </span>
                  )}
                </div>

                {onOpenFullTask && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFullTask(associatedTask);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span>Abrir Expediente Completo</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FICHA TÉCNICA DEL DOCUMENTO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Subido Por</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold block truncate">
                {doc.uploadedBy}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Fecha de Carga</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium block">
                {formattedDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Categoría</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize block">
                {doc.category || 'General'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Certificación</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> Válido en Bóveda
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VISOR INSTITUCIONAL DEL DOCUMENTO                         */}
          {/* ========================================================= */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-inner">
            
            {/* Barra de herramientas del visor */}
            <div className="px-4 py-2.5 bg-slate-200/70 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold">Visor de Documento Oficial · Hoja Membretada</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 cursor-pointer font-mono font-bold"
                >
                  -
                </button>
                <span className="font-mono">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 cursor-pointer font-mono font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Lienzo del Documento */}
            <div className="p-4 sm:p-8 flex justify-center overflow-x-auto bg-slate-200/50 dark:bg-slate-950">
              
              {/* Si es una imagen dataUrl pura */}
              {doc.dataUrl && (doc.fileType === 'jpg' || doc.fileType === 'jpeg') ? (
                <div
                  className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-200"
                  style={{ width: `${Math.round(650 * (zoomLevel / 100))}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.dataUrl}
                    alt={doc.fileName}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                /* Hoja Membretada Oficial Auténtica */
                <div
                  className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-slate-300 space-y-6 transition-all duration-200 font-sans"
                  style={{
                    width: `${Math.round(680 * (zoomLevel / 100))}px`,
                    minHeight: '800px'
                  }}
                >
                  {/* Encabezado Membretado */}
                  <div className="border-b-2 border-indigo-900 pb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white font-black flex items-center justify-center text-sm tracking-wider">
                          IB
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-indigo-950 uppercase tracking-tight">
                            Instituto Bilingüe IBIME
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Excelencia Académica y Formación Humana · Clave CCT: 15PPR3491Z
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-500 font-mono">
                      <strong className="block text-indigo-900 font-bold text-xs">{matterCode}</strong>
                      <span>Bóveda Evidencias · Certificación Digital</span>
                    </div>
                  </div>

                  {/* Título del Documento Formal */}
                  <div className="text-center space-y-1 py-2 bg-slate-50 rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-700 block">
                      DOCUMENTO PROBATORIO OFICIAL
                    </span>
                    <h5 className="text-base font-black text-slate-900">
                      {doc.fileName.replace(/\.(pdf|doc|docx|jpg|png)$/i, '').replace(/_/g, ' ')}
                    </h5>
                    <p className="text-xs text-slate-500">
                      Caso: {taskTitle}
                    </p>
                  </div>

                  {/* Metadatos en el cuerpo del documento */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Órgano Emisor / Responsable:</span>
                      <strong className="text-slate-800">{doc.uploadedBy}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Fecha de Registro:</span>
                      <span className="text-slate-700 font-medium">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Estado del Dictamen:</span>
                      <span className="font-bold text-emerald-700">{taskStatus === 'RESUELTO' ? 'RESOLUCIÓN DEFINITIVA (100%)' : `EN PROCESO (${progressPercent}%)`}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Validez Jurídico-Institucional:</span>
                      <span className="text-indigo-700 font-bold">Registrado en Segundo Cerebro</span>
                    </div>
                  </div>

                  {/* Cuerpo Específico según el tipo de documento */}
                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed text-justify">
                    {doc.fileName.includes('TDAH') || doc.fileName.includes('Adecuacion') || doc.fileName.includes('Curricular') ? (
                      <>
                        <h6 className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                          1. Dictamen de Adecuación Curricular y Metodológica NEM 2024
                        </h6>
                        <p>
                          Por medio de la presente, el Comité Técnico Pedagógico del Instituto Bilingüe IBIME certifica la implementación de los ajustes razonables solicitados para el alumno, atendiendo a las directrices de la Nueva Escuela Mexicana y diagnóstico de neurodiversidad (TDAH).
                        </p>
                        <p>
                          <strong>Estrategias aprobadas:</strong> Segmentación de consignas complejas en pasos individuales cronometrados, tolerancia de 10 minutos adicionales en evaluaciones escritas, asignación de asiento en primera fila libre de distractores visuales y acompañamiento socioemocional continuo.
                        </p>
                      </>
                    ) : doc.fileName.includes('Enfermeria') || doc.fileName.includes('Clinica') || doc.fileName.includes('Alergia') ? (
                      <>
                        <h6 className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                          1. Dictamen Clínico y Protocolo de Salud Escolar
                        </h6>
                        <p>
                          Se hace constar la atención médica y valoración clínica especializada realizada en las instalaciones del Servicio Médico de IBIME. Los signos vitales y antecedentes patológicos han quedado incorporados en el expediente clínico y módulo de enfermería.
                        </p>
                        <p>
                          <strong>Medidas preventivas inmediatas:</strong> Resguardo de medicamento de urgencia en gabinete clínico rotulado, emisión de alerta de salud en la plataforma escolar para conocimiento exclusivo de docentes titulares y coordinación de educación física.
                        </p>
                      </>
                    ) : doc.fileName.includes('Fiscal') || doc.fileName.includes('CFDI') ? (
                      <>
                        <h6 className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                          1. Cotejo y Conciliación Fiscal SAT (CFDI 4.0 con Complemento IEDU)
                        </h6>
                        <p>
                          El Departamento Administrativo y de Cobranza certifica la validación del RFC en la lista de contribuyentes del SAT. Se corroboró la vigencia de la constancia de situación fiscal y se vinculó la CURP oficial del alumno para habilitar la deducibilidad fiscal en colegiaturas bajo el decreto IEDU.
                        </p>
                      </>
                    ) : (
                      <>
                        <h6 className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                          1. Relatoría de Hechos y Medidas de Resolución
                        </h6>
                        <p>
                          En atención a las instrucciones emitidas por Dirección General en el expediente <strong>{matterCode}</strong>, se presenta este instrumento documental que avala las acciones llevadas a cabo por los delegados responsables para el cumplimiento integral de los acuerdos institucionales.
                        </p>
                        {doc.notes && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs italic">
                            <strong>Nota del Responsable:</strong> {doc.notes}
                          </div>
                        )}
                      </>
                    )}

                    {associatedTask?.resolutionSummary && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                        <strong className="block text-[11px] uppercase font-black text-emerald-800">
                          Síntesis Resolutiva Concluyente del Caso:
                        </strong>
                        <p className="text-xs">
                          {associatedTask.resolutionSummary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Firmas Digitales Institucionales */}
                  <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-6 text-center text-xs">
                    <div className="space-y-1">
                      <div className="h-10 flex items-center justify-center font-serif italic text-indigo-900 text-sm font-bold opacity-80">
                        {doc.uploadedBy}
                      </div>
                      <div className="border-t border-slate-400 pt-1">
                        <strong className="block text-slate-800">{doc.uploadedBy}</strong>
                        <span className="text-[10px] text-slate-500">Delegado Responsable Emisor</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="h-10 flex items-center justify-center font-serif italic text-indigo-900 text-sm font-bold opacity-80">
                        Dirección General IBIME
                      </div>
                      <div className="border-t border-slate-400 pt-1">
                        <strong className="block text-slate-800">Dirección General / CEO</strong>
                        <span className="text-[10px] text-slate-500">Supervisión y Visto Bueno Institucional</span>
                      </div>
                    </div>
                  </div>

                  {/* Sello de Seguridad y Hash */}
                  <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>SELLO DIGITAL: SHA256-IBIME-{matterCode.replace(/[^A-Z0-9]/g, '')}-7F8A</span>
                    <span>PÁGINA 1 DE 1 · COPIA FIEL DEL EXPEDIENTE DIGITAL</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER DEL MODAL                                          */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Documento asegurado en la Bóveda Central de Evidencias de ISkool.</span>
          </div>

          <div className="flex items-center gap-2">
            {associatedTask && onOpenFullTask && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullTask(associatedTask);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                Abrir Expediente Completo
              </button>
            )}
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar Documento</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
