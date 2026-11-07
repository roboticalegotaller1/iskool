"use client";

import React, { useState } from 'react';
import {
  LanguageLesson,
  StudentPronunciationReport,
} from '@/store/useLanguagesStore';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';
import {
  Rocket,
  FileText,
  Volume2,
  CheckCheck,
  Sparkles,
  QrCode,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  lesson: LanguageLesson;
  campusName: string;
  cenniLabel: string;
  studentReports: StudentPronunciationReport[];
  onMarkReviewed: (id: string) => void;
  onPlayAudio: (text: string, customRate?: number) => void;
  onTriggerToast: (msg: string) => void;
  isLightMode: boolean;
}

export const TrafficLightDifferentiatedView: React.FC<Props> = ({
  lesson,
  campusName,
  cenniLabel,
  studentReports,
  onMarkReviewed,
  onPlayAudio,
  onTriggerToast,
  isLightMode,
}) => {
  const [selectedBandFilter, setSelectedBandFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [homeworkSent, setHomeworkSent] = useState<boolean>(false);
  const [selectedStudentForBoleta, setSelectedStudentForBoleta] = useState<string>(
    'Sofía Ramírez Morales · 2º A'
  );

  const handleSendDifferentiatedTriad = () => {
    setHomeworkSent(true);
    onTriggerToast(
      '🚀 Triada Pedagógica enviada: 3 alumnos recibieron Refuerzo Lento, 5 Práctica Estándar y 18 Reto Avanzado'
    );
  };

  const handleDownloadBoletasPdf = () => {
    onTriggerToast(
      `📄 Boletas Oficiales SEP CENNI / CEFR (${lesson.level}) generadas para ${campusName}`
    );
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const reportsByLanguage = studentReports.filter((rep) => rep.language === lesson.language);
  const baseReports = reportsByLanguage.length > 0 ? reportsByLanguage : studentReports;

  const filteredStudentReports = baseReports.filter((rep) => {
    if (selectedBandFilter === 'green') return rep.overallAccuracy >= 85;
    if (selectedBandFilter === 'amber')
      return rep.overallAccuracy >= 75 && rep.overallAccuracy < 85;
    if (selectedBandFilter === 'red') return rep.overallAccuracy < 75;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECCIÓN 1: Semáforo Pedagógico de la Sesión (Grupo 2º A · 26 Alumnos) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
          isLightMode
            ? 'bg-white border-slate-200/90 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Semáforo Pedagógico de la Sesión (Grupo 2º A · 26 Alumnos)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Diagnóstico instantáneo sin gráficas complejas. Pulsa cualquier tarjeta del semáforo para filtrar alumnos.
            </p>
          </div>
          {selectedBandFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedBandFilter('all')}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
            >
              Ver Todos los Alumnos
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Verde: 18 Alumnos Dominaron */}
          <div
            onClick={() =>
              setSelectedBandFilter(selectedBandFilter === 'green' ? 'all' : 'green')
            }
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
              selectedBandFilter === 'green'
                ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400/40 shadow-md'
                : 'bg-white hover:bg-emerald-50/40 border-emerald-500/70 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-xs shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                18 Alumnos Dominaron (90%–100%)
              </h3>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Pronunciación fluida y comprensión completa del diálogo en cafetería.
            </p>
          </div>

          {/* Amarillo: 5 Alumnos en Práctica */}
          <div
            onClick={() =>
              setSelectedBandFilter(selectedBandFilter === 'amber' ? 'all' : 'amber')
            }
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
              selectedBandFilter === 'amber'
                ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-400/40 shadow-md'
                : 'bg-white hover:bg-amber-50/40 border-amber-500/70 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 shadow-xs shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                5 Alumnos en Práctica (75%–89%)
              </h3>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Buena comprensión; pulir entonación en preguntas y fluidez rítmica.
            </p>
          </div>

          {/* Rojo: 3 Alumnos Requieren Apoyo */}
          <div
            onClick={() =>
              setSelectedBandFilter(selectedBandFilter === 'red' ? 'all' : 'red')
            }
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
              selectedBandFilter === 'red'
                ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-400/40 shadow-md'
                : 'bg-white hover:bg-rose-50/40 border-rose-500/70 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-rose-600 shadow-xs shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                3 Alumnos Requieren Apoyo (&lt;75%)
              </h3>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {lesson.language === 'fr'
                ? 'Dificultad específica con el sonido /v/ y vocales nasales ("voudrais", "croissant").'
                : 'Dificultad específica con el sonido /θ/ ("three", "thank you") y "would".'}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Asignación Diferenciada Automática en 1 Clic (62%) + Boleta Oficial SEP CENNI (38%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* IZQUIERDA (7 cols): Asignación Diferenciada Automática en 1 Clic (Triada Pedagógica) */}
        <div
          className={`lg:col-span-7 p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 ${
            isLightMode
              ? 'bg-white border-slate-200/90 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                Asignación Diferenciada Automática en 1 Clic (Triada Pedagógica)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-black">
                Cero Configuración Manual
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Asignación multinivel generada automáticamente para cada grupo del semáforo:
            </p>
          </div>

          <div className="space-y-3.5 divide-y divide-slate-100">
            {/* Nivel Rojo */}
            <div className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-xs font-black shrink-0 inline-flex items-center gap-1.5 w-fit">
                <span>🔴 Para los 3 Alumnos en Apoyo:</span>
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800">
                Práctica guiada lenta (🐢 0.68x) de 3 frases con{' '}
                <strong>Prof. {lesson.avatarName} 3D</strong> + Espejo Bucal.
              </p>
            </div>

            {/* Nivel Amarillo */}
            <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-600 text-white text-xs font-black shrink-0 inline-flex items-center gap-1.5 w-fit">
                <span>🟡 Para los 5 Alumnos en Práctica:</span>
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800">
                Diálogo completo en la cafetería a velocidad normal ({lesson.defaultSpeed}x) con Karaoke.
              </p>
            </div>

            {/* Nivel Verde */}
            <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black shrink-0 inline-flex items-center gap-1.5 w-fit">
                <span>🟢 Para los 18 Alumnos Avanzados:</span>
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800">
                Reto Extra: Pedir un menú especial sin subtítulos con{' '}
                <strong>{lesson.language === 'fr' ? 'Prof. Henri 3D' : 'Prof. Arthur 3D'}</strong>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendDifferentiatedTriad}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-all ${
              homeworkSent
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1D4ED8] hover:bg-blue-600 text-white'
            }`}
          >
            <Rocket className="w-5 h-5" />
            <span>
              {homeworkSent
                ? '✓ Tarea Nivelada Enviada a los 26 Alumnos (Triada Activa)'
                : '🚀 Enviar Tarea Nivelada a los 3 Grupos del Semáforo en 1 Clic'}
            </span>
          </button>
        </div>

        {/* DERECHA (5 cols): Boleta Oficial SEP CENNI / CEFR Lista para Padres */}
        <div
          className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 ${
            isLightMode
              ? 'bg-white border-slate-200/90 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Boleta Oficial SEP CENNI / CEFR Lista para Padres
            </h3>
            <select
              value={selectedStudentForBoleta}
              onChange={(e) => setSelectedStudentForBoleta(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
            >
              <option value="Sofía Ramírez Morales · 2º A">Sofía Ramírez · 2º A</option>
              <option value="Mateo Hernández · 2º A">Mateo Hernández · 2º A</option>
              <option value="Camila Regina Villaseñor · 2º A">Camila Villaseñor · 2º A</option>
            </select>
          </div>

          {/* Tarjeta Certificada de Boleta */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <IbimeOfficialLogo variant="shield_only" size={28} />
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Boleta de Progreso Bilingüe · SEP CENNI / CEFR
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{campusName}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {selectedStudentForBoleta}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black">
                Nivel CEFR {lesson.level} · {cenniLabel.split('(')[0].trim()}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-8 space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-0.5">
                    <span>Speaking & Fonética</span>
                    <span>94%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-0.5">
                    <span>Listening & Diálogo</span>
                    <span>96%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-0.5">
                    <span>Writing & Gramática</span>
                    <span>90%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[9px] font-bold text-slate-500 mb-0.5">Official QR</span>
                <QrCode className="w-12 h-12 text-slate-900" />
                <span className="text-[9px] font-black text-emerald-700 mt-0.5 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verificación
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadBoletasPdf}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-700" />
            <span>📄 Descargar Boletas del Grupo en PDF</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 3: Tarjetas Individuales por Alumno (Bitácora de Pronunciación en Vivo) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
          isLightMode
            ? 'bg-white border-slate-200/90 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black">
            Resultados Individuales por Alumno ({filteredStudentReports.length})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Escucha la oración modelo o envía un ejercicio de refuerzo individual en 1 clic
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStudentReports.map((rep) => {
            const isGreen = rep.overallAccuracy >= 85;
            const isAmber = rep.overallAccuracy >= 75 && rep.overallAccuracy < 85;
            return (
              <div
                key={rep.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-300 bg-indigo-100 flex items-center justify-center font-black text-indigo-800 shrink-0">
                      {rep.studentAvatar ? (
                        <img
                          src={rep.studentAvatar}
                          alt={rep.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{rep.studentName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {rep.studentName}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isGreen
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isAmber
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        <span>{isGreen ? '🟢' : isAmber ? '🟡' : '🔴'}</span>
                        <span>
                          {rep.overallAccuracy}%{' '}
                          {isGreen ? 'Excelente' : isAmber ? 'En Práctica' : 'Requiere Apoyo'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Palabras a pulir */}
                  <div className="text-xs space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Palabras a pulir:
                    </span>
                    {rep.mispronouncedWords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {rep.mispronouncedWords.map((w, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onPlayAudio(w, 0.72)}
                            className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-mono text-[11px] font-bold cursor-pointer flex items-center gap-1"
                            title="Pulsa para escuchar pronunciación lenta"
                          >
                            <span>&ldquo;{w}&rdquo;</span>
                            <Volume2 className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        Ninguna (¡Pronunciación nativa!)
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de Acción Individual */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => onPlayAudio(rep.targetPhrase, 0.88)}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Escuchar Frase Evaluada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onMarkReviewed(rep.id);
                      onTriggerToast(
                        isGreen
                          ? `⭐ Felicitación enviada a ${rep.studentName}`
                          : `✨ Ejercicio de refuerzo enviado a ${rep.studentName}`
                      );
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isGreen ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>⭐ Enviar Felicitación</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>✨ Enviar Ejercicio de Refuerzo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

