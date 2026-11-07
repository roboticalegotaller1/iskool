"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LanguageLesson } from '@/store/useLanguagesStore';
import { LanguageKaraokePlayer } from '@/components/languages/LanguageKaraokePlayer';
import { CONTRASTIVE_PHONETIC_MIRRORS } from './hybridPedagogicalData';
import {
  Volume2,
  Mic,
  Users,
  User,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface Props {
  lesson: LanguageLesson;
  avatarSrc: string;
  initialMirrorId?: string;
  isLightMode: boolean;
  onPlayAudio: (text: string, customRate?: number) => void;
  onBackToStudio?: () => void;
}

export const ContrastivePhoneticsMirrorView: React.FC<Props> = ({
  lesson,
  avatarSrc,
  initialMirrorId,
  isLightMode,
  onPlayAudio,
  onBackToStudio,
}) => {
  const mirrorsForLang = useMemo(() => {
    const filtered = CONTRASTIVE_PHONETIC_MIRRORS.filter(
      (m) => m.language === lesson.language
    );
    return filtered.length > 0 ? filtered : CONTRASTIVE_PHONETIC_MIRRORS;
  }, [lesson.language]);

  const [selectedMirrorId, setSelectedMirrorId] = useState<string>(
    initialMirrorId || mirrorsForLang[0].id
  );
  const [practiceMode, setPracticeMode] = useState<'group' | 'individual'>('group');
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState<number>(0);
  const [isGroupListening, setIsGroupListening] = useState<boolean>(false);
  const [groupAccuracy, setGroupAccuracy] = useState<number>(95);

  useEffect(() => {
    setSelectedPhraseIndex(0);
  }, [lesson.id]);

  useEffect(() => {
    if (initialMirrorId && mirrorsForLang.some((m) => m.id === initialMirrorId)) {
      setSelectedMirrorId(initialMirrorId);
    } else {
      setSelectedMirrorId(mirrorsForLang[0].id);
    }
  }, [initialMirrorId, lesson.language, mirrorsForLang]);

  const activeMirror =
    mirrorsForLang.find((m) => m.id === selectedMirrorId) || mirrorsForLang[0];

  const handleGroupChoralPractice = () => {
    if (isGroupListening) {
      setIsGroupListening(false);
      setGroupAccuracy(96);
      return;
    }
    setIsGroupListening(true);
    setTimeout(() => {
      setIsGroupListening(false);
      setGroupAccuracy(96);
    }, 3200);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Breadcrumb & Selector Rápido de Espejos Fonéticos por Idioma y Nivel */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isLightMode
            ? 'bg-white border-slate-200/90 shadow-xs text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-wrap text-xs font-bold">
          {onBackToStudio && (
            <button
              type="button"
              onClick={onBackToStudio}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Diálogo 3D</span>
            </button>
          )}
          <span className="text-slate-400">Centro de Idiomas</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-500">
            {lesson.language === 'fr' ? '🇫🇷 Francés FLE' : '🇬🇧 Inglés ESL'} · Nivel {lesson.level}
          </span>
          <span className="text-slate-300">&gt;</span>
          <span className="font-black text-indigo-600">
            👄 Espejo Articulatorio Contrastivo y Karaoke Grupal
          </span>
        </div>

        {/* Píldoras de Sonidos Meta L1 -> L2 (Filtradas por el Idioma Activo) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {mirrorsForLang.map((m) => {
            const active = m.id === activeMirror.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMirrorId(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : isLightMode
                      ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {m.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Principal de 2 Columnas (Exacto a Pantalla Híbrida 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* COLUMNA IZQUIERDA (5 cols): Espejo Articulatorio Contrastivo (Español -> Inglés/Francés) */}
        <div
          className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 ${
            isLightMode
              ? 'bg-[#FFFDF9] border-amber-200/80 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 block">
                  Guía Visual de Pronunciación ({activeMirror.levelTag})
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                  Espejo Articulatorio Contrastivo (
                  {lesson.language === 'fr' ? 'Español → Francés FLE' : 'Español → Inglés ESL'})
                </h3>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono font-black text-xs shrink-0">
                {activeMirror.phonemeSymbol}
              </span>
            </div>

            {/* Diagrama Anatómico Comprimido en WebP */}
            <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-xs">
              <img
                src={activeMirror.diagramSrc}
                alt={activeMirror.title}
                className="w-full h-56 sm:h-64 object-contain"
              />
            </div>

            {/* Comparativa Directa: Hábito en Español vs Posición Correcta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 space-y-1">
                <span className="font-black text-rose-700 block">{activeMirror.wrongHabitTitle}</span>
                <p className="leading-relaxed font-medium">{activeMirror.wrongHabitDescription}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 space-y-1">
                <span className="font-black text-emerald-800 block">
                  {activeMirror.correctPositionTitle}
                </span>
                <p className="leading-relaxed font-medium">{activeMirror.correctPositionDescription}</p>
              </div>
            </div>

            {/* Palabras Clave Interactivas */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Pulsa una palabra para escuchar su articulación modelo:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {activeMirror.targetWords.map((tw) => (
                  <button
                    key={tw.word}
                    type="button"
                    onClick={() => onPlayAudio(tw.word, 0.78)}
                    className="p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between text-left shadow-2xs"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{tw.word}</span>
                      <span className="text-[10px] font-mono text-indigo-600">{tw.ipa}</span>
                    </div>
                    <Volume2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botón Gigante Inferior: Escuchar Comparación Lenta */}
          <button
            type="button"
            onClick={() => onPlayAudio(activeMirror.demoSentence, 0.68)}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-transform active:scale-98"
          >
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <span>[🔊 Escuchar Comparación Lenta (🐢 0.68x)]</span>
          </button>
        </div>

        {/* COLUMNA DERECHA (7 cols): Karaoke de Pronunciación en Vivo */}
        <div
          className={`lg:col-span-7 p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 ${
            isLightMode
              ? 'bg-white border-slate-200/90 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Cabecera + Conmutador Modo Grupo Completo | Alumno Individual */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                Karaoke de Pronunciación en Vivo ({lesson.language === 'fr' ? 'Francés FLE' : 'Inglés ESL'})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Las palabras bien pronunciadas se iluminan en verde esmeralda; las palabras a pulir muestran un consejo amigable.
              </p>
            </div>

            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-black">
              <button
                type="button"
                onClick={() => setPracticeMode('group')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  practiceMode === 'group'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Modo Grupo Completo</span>
              </button>
              <button
                type="button"
                onClick={() => setPracticeMode('individual')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  practiceMode === 'individual'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alumno Individual</span>
              </button>
            </div>
          </div>

          {practiceMode === 'group' ? (
            /* VISTA DE CORO GRUPAL (Exacta a Pantalla Híbrida 4) */
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Oración Gigante con Palabras Iluminadas y Tooltip Pedagógico */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50/90 border border-slate-200/90 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5 text-2xl sm:text-3xl lg:text-4xl font-black leading-relaxed">
                  {activeMirror.demoSentence.split(' ').map((word, idx) => {
                    const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, '').toLowerCase();
                    const isAmberWord =
                      clean === 'three' ||
                      clean === 'would' ||
                      clean === 'very' ||
                      clean === 'voudrais' ||
                      clean === 'huit' ||
                      clean === 'laboratoire' ||
                      clean === 'beaucoup';
                    const isGreenWord = idx < 5 && !isAmberWord;

                    if (isAmberWord) {
                      return (
                        <span key={idx} className="relative inline-flex items-center group">
                          <span className="px-3 py-1 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-900 shadow-sm">
                            {word}
                          </span>
                          <span className="ml-2 px-3 py-1.5 rounded-xl bg-white border border-amber-300 shadow-md text-xs font-bold text-slate-800 inline-flex items-center gap-1.5">
                            <span>💡</span>
                            <span>
                              {lesson.language === 'fr'
                                ? clean === 'huit'
                                  ? 'Enlaza huit_heures [ɥit‿œʁ]'
                                  : clean === 'laboratoire'
                                    ? 'Suaviza la R gutural /ʁ/ en Laboratoire'
                                    : clean === 'beaucoup'
                                      ? 'La P final es muda en Beaucoup [boku]'
                                      : 'Recuerda vibrar /v/ en Voudrais'
                                : clean === 'three'
                                  ? 'Recuerda sacar la punta de la lengua en TH'
                                  : 'Recuerda no pronunciar la L en Would'}
                            </span>
                          </span>
                        </span>
                      );
                    }

                    return (
                      <span
                        key={idx}
                        className={
                          isGreenWord
                            ? 'px-2.5 py-0.5 rounded-2xl bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-2xs inline-flex items-center gap-1'
                            : 'text-slate-900'
                        }
                      >
                        <span>{word}</span>
                        {isGreenWord && idx === 2 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                        )}
                      </span>
                    );
                  })}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600 pt-2 border-t border-slate-200/80">
                  Significado en español: &ldquo;{activeMirror.demoSentenceEs}&rdquo;
                </p>
              </div>

              {/* Tacómetro Circular Amigable (95% ¡Excelente Fluidez!) */}
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
                    <div className="w-36 h-36 rounded-full border-[12px] border-emerald-500 border-b-transparent border-r-transparent rotate-45" />
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">
                      {groupAccuracy}%
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-emerald-800 mt-1">
                    ¡Excelente Fluidez!
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    Ritmo: 97% · Claridad: 94%
                  </span>
                </div>

                <div className="space-y-2 max-w-xs text-xs">
                  <div className="flex items-center gap-2 font-black text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Diagnóstico Pedagógico Instantáneo</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    El grupo mantiene excelente entonación coral en{' '}
                    {lesson.language === 'fr' ? 'francés (DELF)' : 'inglés (Cambridge)'}. Repite una vez más en cámara lenta la palabra resaltada en ámbar.
                  </p>
                </div>
              </div>

              {/* Botón Primario Gigante: Escuchar al Salón Completo */}
              <button
                type="button"
                onClick={handleGroupChoralPractice}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer shadow-lg transition-all ${
                  isGroupListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[#2563EB] hover:bg-blue-600 text-white'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>
                  {isGroupListening
                    ? '🎙️ Escuchando al Salón Completo... (Pulsa para finalizar)'
                    : '[🎤 Escuchar al Salón Completo (Práctica Coral)]'}
                </span>
              </button>
            </div>
          ) : (
            /* VISTA DE ALUMNO INDIVIDUAL (Conecta con LanguageKaraokePlayer real) */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600">
                  Selecciona la frase de práctica individual ({lesson.title}):
                </span>
                <select
                  value={selectedPhraseIndex}
                  onChange={(e) => setSelectedPhraseIndex(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-slate-50 text-slate-900"
                >
                  {lesson.karaokePhrases.map((kp, i) => (
                    <option key={kp.id} value={i}>
                      Frase {i + 1}: {kp.targetText.substring(0, 42)}...
                    </option>
                  ))}
                </select>
              </div>

              {(lesson.karaokePhrases[selectedPhraseIndex] || lesson.karaokePhrases[0]) && (
                <LanguageKaraokePlayer
                  phrase={lesson.karaokePhrases[selectedPhraseIndex] || lesson.karaokePhrases[0]}
                  language={lesson.language}
                  avatarGender={lesson.avatarGender}
                  avatarVoice={lesson.avatarVoice}
                  avatarName={lesson.avatarName}
                  avatarImage={avatarSrc}
                  historicalFigureId={lesson.historicalFigureId}
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                  studentName="Alumno en Aula (Práctica Individual)"
                  isLightMode={isLightMode}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
