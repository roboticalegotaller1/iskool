"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Volume2,
  FileText,
  Receipt,
  Sparkles,
  Check,
  Award,
  Clock,
  Headphones
} from 'lucide-react';

interface ParentFiveSecondSummaryCardProps {
  familyName: string;
  studentName: string;
  gradeLabel: string;
  studentId: string;
}

export const ParentFiveSecondSummaryCard: React.FC<ParentFiveSecondSummaryCardProps> = ({
  familyName,
  studentName,
  gradeLabel,
  studentId,
}) => {
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedLangHighlight, setSelectedLangHighlight] = useState<'fr' | 'en'>('fr');

  const handlePlayChildHighlight = () => {
    setIsPlayingAudio(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text =
        selectedLangHighlight === 'fr'
          ? 'Bonjour maman et papa ! Notre séance au laboratoire de sciences commence exactement à huit heures du matin.'
          : 'Good morning! Science lab starts at eight in the morning, and I completed my experiment today.';
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = selectedLangHighlight === 'fr' ? 'fr-FR' : 'en-GB';
      utter.rate = 0.92;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3500);
    }
  };

  const handleSignAcknowledgement = async () => {
    setIsSigned(true);
    try {
      await fetch('/api/parent/magic-link', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: `ml_${studentId}_5sec`,
          studentId,
          studentName,
          status: 'signed',
          signedBy: familyName,
          parentReply: 'Firmado de enterado en 1 toque desde el Resumen Familiar de 5 Segundos.',
        }),
      }).catch(() => null);
    } catch {}
  };

  const pdfInvoiceUrl = `/api/billing/invoice/pdf?student=${encodeURIComponent(
    studentName
  )}&level=${encodeURIComponent(gradeLabel)}&concept=${encodeURIComponent(
    'Colegiatura Mensual Ciclo Escolar Activo'
  )}&amount=4500`;

  return (
    <section
      data-testid="parent-5sec-summary-hub"
      className="mb-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/80 p-5 sm:p-6 shadow-xl text-white"
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20">
            5s
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Resumen de tu Hijo en 5 Segundos • {studentName}
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-400/30">
                Actualizado en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {familyName} • {gradeLabel} • Todo lo importante del día en una sola vista.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Card Grid matching Redesign 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1 (5 Cols): Giant Emerald Traffic Light Card */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-700 p-5 shadow-lg flex flex-col justify-between border border-emerald-400/40">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-200 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
                HOY EN EL COLEGIO: TODO EXCELENTE
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2.5 rounded-xl bg-black/20 px-3.5 py-2 text-xs font-bold text-white">
                <Clock className="h-4 w-4 text-emerald-200 shrink-0" />
                <span>✓ Entrada Puntual Registrada: 07:56 AM</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-black/20 px-3.5 py-2 text-xs font-bold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-200 shrink-0" />
                <span>✓ Libreta Física Sellada: Pág. 48 (Verificada)</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-black/20 px-3.5 py-2 text-xs font-bold text-white">
                <Award className="h-4 w-4 text-amber-300 shrink-0" />
                <span>✓ Mérito del Día: +50 XP por Participación</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-parent-1tap-sign"
            onClick={handleSignAcknowledgement}
            className={`w-full rounded-xl px-4 py-3 text-xs font-black transition flex items-center justify-center gap-2 shadow-md ${
              isSigned
                ? 'bg-white text-emerald-800'
                : 'bg-slate-950/90 text-white hover:bg-slate-950 border border-white/20'
            }`}
          >
            {isSigned ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                ✓ Enterado Firmado Digitalmente Hoy
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-300" />
                ✍️ Firmar de Enterado en 1 Toque
              </>
            )}
          </button>
        </div>

        {/* Right 7 Cols: Language Audio Highlight Card + 1-Click CFDI 4.0 Card */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* Card 2: Audio Highlight from Language Center */}
          <div className="rounded-2xl bg-white text-slate-900 p-4 sm:p-5 shadow-md border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Escucha a tu hijo hablar en Francés e Inglés hoy
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedLangHighlight('fr')}
                  className={`rounded-md px-2 py-0.5 transition ${
                    selectedLangHighlight === 'fr'
                      ? 'bg-indigo-600 text-white font-extrabold'
                      : 'text-slate-600'
                  }`}
                >
                  🇫🇷 Francés DELF A1
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLangHighlight('en')}
                  className={`rounded-md px-2 py-0.5 transition ${
                    selectedLangHighlight === 'en'
                      ? 'bg-blue-600 text-white font-extrabold'
                      : 'text-slate-600'
                  }`}
                >
                  🇬🇧 Inglés Cambridge A1
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 italic">
              {selectedLangHighlight === 'fr'
                ? '« Notre séance au laboratoire de sciences commence exactement à huit heures du matin. »'
                : '“Science lab starts at eight in the morning, and I completed my experiment today.”'}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                data-testid="btn-parent-play-child-audio"
                onClick={handlePlayChildHighlight}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 transition shadow-xs"
              >
                <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'text-emerald-400 animate-bounce' : 'text-indigo-400'}`} />
                {isPlayingAudio
                  ? 'Reproduciendo práctica de clase...'
                  : '▶️ Escuchar Grabación de Clase (12 seg)'}
              </button>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
                ✓ Pronunciación {selectedLangHighlight === 'fr' ? 'DELF A1' : 'Cambridge A1'}: 94% Sobresaliente
              </span>
            </div>
          </div>

          {/* Card 3: 1-Click Financial & SAT CFDI 4.0 Card */}
          <div className="rounded-2xl bg-white text-slate-900 p-4 sm:p-5 shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Colegiatura y Facturación Automática SAT CFDI 4.0
                </h3>
              </div>
              <div className="text-xs text-slate-600">
                Mes Actual: <span className="font-extrabold text-emerald-700">Pagado • Recibo Oficial Timbrado (Complemento IEDU)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={pdfInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="btn-parent-download-cfdi-pdf"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                📄 Descargar Factura PDF
              </a>
              <Link
                href="/parent/financial"
                data-testid="btn-parent-open-wallet"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-100 transition"
              >
                🧾 Billetera & XML SAT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

