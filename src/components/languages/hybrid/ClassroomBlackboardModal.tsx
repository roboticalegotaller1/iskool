"use client";

import React, { useState, useEffect } from 'react';
import { LanguageLesson } from '@/store/useLanguagesStore';
import { HumanGesticulatingAvatar } from '@/components/languages/HumanGesticulatingAvatar';
import {
  CONTRASTIVE_PHONETIC_MIRRORS,
  CeltaPocketGuide,
  tokenizeDialogueWithStress,
} from './hybridPedagogicalData';
import {
  Volume2,
  Mic,
  Clock,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lesson: LanguageLesson;
  avatarSrc: string;
  celtaGuide: CeltaPocketGuide;
  isPlayingAudio: boolean;
  onPlayLineAudio: (text: string, customRate?: number) => void;
  initialPairTimerRunning?: boolean;
}

export const ClassroomBlackboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lesson,
  avatarSrc,
  celtaGuide,
  isPlayingAudio,
  onPlayLineAudio,
  initialPairTimerRunning = false,
}) => {
  const [activePairIndex, setActivePairIndex] = useState<number>(0);
  const [pairSecondsLeft, setPairSecondsLeft] = useState<number>(165); // 02:45 default as in mockup
  const [isPairTimerRunning, setIsPairTimerRunning] = useState<boolean>(initialPairTimerRunning);
  const [isChoralListening, setIsChoralListening] = useState<boolean>(false);
  const [choralScore, setChoralScore] = useState<number | null>(null);
  const [showSpanishSubtitle, setShowSpanishSubtitle] = useState<boolean>(true);

  useEffect(() => {
    if (initialPairTimerRunning) {
      setIsPairTimerRunning(true);
    }
  }, [initialPairTimerRunning]);

  useEffect(() => {
    if (!isOpen || !isPairTimerRunning) return;
    const timer = setInterval(() => {
      setPairSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsPairTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPairTimerRunning]);

  // Atajo de teclado Escape para salir del pizarrón
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const avatarLines = lesson.dialogue.filter((d) => d.speaker === 'avatar');
  const studentLines = lesson.dialogue.filter((d) => d.speaker === 'student');

  const currentAvatarLine =
    lesson.dialogue[activePairIndex] ||
    avatarLines[0] || {
      id: 'default-av',
      speaker: 'avatar',
      text: 'Good morning! What would you like to order?',
      translationEs: '¡Buenos días! ¿Qué te gustaría ordenar hoy?',
    };

  const nextLine =
    lesson.dialogue[activePairIndex + 1] ||
    studentLines[0] || {
      id: 'default-st',
      speaker: 'student',
      text: 'I would like a hot chocolate, please.',
      translationEs: 'Me gustaría un chocolate caliente, por favor.',
    };

  const activeMirror =
    CONTRASTIVE_PHONETIC_MIRRORS.find((m) => m.id === celtaGuide.spanishInterference.mirrorId) ||
    CONTRASTIVE_PHONETIC_MIRRORS.find((m) => m.language === lesson.language) ||
    CONTRASTIVE_PHONETIC_MIRRORS[0];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTriggerChoralPractice = () => {
    if (isChoralListening) {
      setIsChoralListening(false);
      setChoralScore(96);
      return;
    }
    setChoralScore(null);
    setIsChoralListening(true);
    setTimeout(() => {
      setIsChoralListening(false);
      setChoralScore(96);
    }, 3400);
  };

  const totalSecs = 180;
  const ringProgress = Math.max(8, Math.round((pairSecondsLeft / totalSecs) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1120] text-white flex flex-col justify-between overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Barra Superior Modo Pizarrón Interactivo */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/90">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-black tracking-tight text-slate-200">
            Instituto Bilingüe IBIME · Centro de Idiomas
          </span>
          <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-extrabold">
            Modo Pizarrón Interactivo · {lesson.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>En Vivo: Salón 2º A · Nivel {lesson.level}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSpanishSubtitle(!showSpanishSubtitle)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer transition-all ${
              showSpanishSubtitle
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {showSpanishSubtitle ? 'Subtítulo Español: VISIBLE' : 'Subtítulo Español: OCULTO'}
          </button>
        </div>
      </div>

      {/* Cuerpo Central del Pizarrón (2 Columnas de Alto Contraste Legibles a 8 Metros) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4">
        {/* COLUMNA IZQUIERDA (5 cols): Avatar 3D 60 FPS + Espejo Articulatorio Contrastivo */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Escenario Avatar 3D con Onda Luminosa */}
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-[#0F172A] to-slate-950 border border-slate-800 p-4 flex flex-col items-center justify-between shadow-2xl min-h-[320px]">
            <div className="w-full flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-xl bg-slate-950/90 border border-slate-700 text-xs font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Prof. {lesson.avatarName} (Avatar 3D · 60 FPS)
              </span>
              <button
                type="button"
                onClick={() => onPlayLineAudio(currentAvatarLine.text, lesson.defaultSpeed)}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar Voz</span>
              </button>
            </div>

            <div className="w-full max-w-[300px] h-[250px] flex items-end justify-center my-1">
              <HumanGesticulatingAvatar
                variant="stage"
                gender={lesson.avatarGender}
                name={lesson.avatarName}
                language={lesson.language}
                voiceId={lesson.avatarVoice}
                avatarImage={avatarSrc}
                historicalFigureId={lesson.historicalFigureId}
                isPlaying={isPlayingAudio}
                currentText={currentAvatarLine.text}
                speechRate={lesson.defaultSpeed}
                isLightMode={false}
                className="w-full h-full"
              />
            </div>

            {/* Onda de Voz Esmeralda 60 FPS */}
            <div className="w-full px-4 pt-2">
              <div className="flex items-center justify-center gap-1 h-8">
                {[28, 55, 80, 45, 95, 70, 100, 60, 85, 40, 90, 75, 50, 95, 65, 80, 45, 70, 35, 60, 85, 50, 30].map(
                  (bar, idx) => (
                    <span
                      key={idx}
                      className="flex-1 rounded-full bg-gradient-to-t from-emerald-500 via-teal-400 to-cyan-300 transition-all duration-150"
                      style={{
                        height:
                          isPlayingAudio || isChoralListening
                            ? `${Math.max(20, Math.min(100, bar * (0.5 + (idx % 3) * 0.25)))}%`
                            : `${Math.max(15, bar * 0.35)}%`,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Espejo Articulatorio Contrastivo (Integrado en Pizarrón) */}
          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>👄 Espejo Articulatorio Contrastivo</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold">
                {activeMirror.phonemeSymbol}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-6 rounded-2xl overflow-hidden border border-slate-700 bg-white p-1">
                <img
                  src={activeMirror.diagramSrc}
                  alt={activeMirror.title}
                  className="w-full h-32 object-contain rounded-xl"
                />
              </div>
              <div className="sm:col-span-6 space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200">
                  <span className="font-black block text-rose-300">{activeMirror.wrongHabitTitle}:</span>
                  <span>{activeMirror.wrongHabitDescription}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200">
                  <span className="font-black block text-emerald-300">{activeMirror.correctPositionTitle}:</span>
                  <span>{activeMirror.correctPositionDescription}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (7 cols): Diálogo Gigante 36pt + Cronómetro CELTA de Parejas */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          {/* Tarjeta Gigante de Diálogo a 36pt con Sílabas Tónicas en Dorado */}
          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
                Diálogo Objetivo de la Clase ({lesson.title})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePairIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activePairIndex === 0}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer"
                  title="Línea anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-300 px-2">
                  Bloque {activePairIndex + 1} de {Math.max(1, lesson.dialogue.length)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActivePairIndex((prev) => Math.min(Math.max(0, lesson.dialogue.length - 1), prev + 1))
                  }
                  disabled={activePairIndex >= lesson.dialogue.length - 1}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer"
                  title="Siguiente línea"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Frase 1: Avatar 3D */}
            <div
              onClick={() => onPlayLineAudio(currentAvatarLine.text, lesson.defaultSpeed)}
              className="space-y-2 cursor-pointer group p-3 rounded-2xl hover:bg-slate-800/50 transition-colors"
              title="Haz clic para escuchar esta línea con la voz del Avatar 3D"
            >
              <div className="text-xl sm:text-3xl lg:text-[34px] font-black leading-tight tracking-tight text-white">
                <span className="text-cyan-400 mr-2">{lesson.avatarName} (Avatar 3D):</span>
                {tokenizeDialogueWithStress(currentAvatarLine.text).map((tok, i) => (
                  <span
                    key={i}
                    className={
                      tok.isStressed
                        ? 'text-amber-400 underline decoration-amber-400/60 decoration-2 underline-offset-4 mr-2 inline-block'
                        : 'mr-2 inline-block'
                    }
                  >
                    {tok.display}
                  </span>
                ))}
              </div>
              {showSpanishSubtitle && currentAvatarLine.translationEs && (
                <p className="text-sm sm:text-lg font-semibold text-slate-300">
                  🇧🇴/🇲🇽 {currentAvatarLine.translationEs}
                </p>
              )}
            </div>

            {/* Frase 2: Estudiante / Salón */}
            {nextLine && nextLine.id !== currentAvatarLine.id && (
              <div
                onClick={() => onPlayLineAudio(nextLine.text, lesson.defaultSpeed)}
                className="space-y-2 cursor-pointer group p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-amber-400/50 transition-colors"
                title="Haz clic para escuchar la respuesta modelo del estudiante"
              >
                <div className="text-xl sm:text-3xl lg:text-[32px] font-black leading-tight tracking-tight text-white">
                  <span className="text-emerald-400 mr-2">Estudiante / Salón:</span>
                  {tokenizeDialogueWithStress(nextLine.text).map((tok, i) => (
                    <span
                      key={i}
                      className={
                        tok.isStressed
                          ? 'text-amber-400 underline decoration-amber-400/60 decoration-2 underline-offset-4 mr-2 inline-block'
                          : 'mr-2 inline-block'
                      }
                    >
                      {tok.display}
                    </span>
                  ))}
                </div>
                {showSpanishSubtitle && nextLine.translationEs && (
                  <p className="text-sm sm:text-lg font-semibold text-slate-300">
                    🗣️ {nextLine.translationEs}
                  </p>
                )}
              </div>
            )}

            {/* Resultado de Práctica Coral Grupal */}
            {(isChoralListening || choralScore !== null) && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm sm:text-base font-extrabold text-emerald-200">
                    {isChoralListening
                      ? '🎙️ Escuchando al salón completo... ¡Repitan en voz alta con ritmo!'
                      : `🎉 ¡Excelente Práctica Coral del Grupo! Precisión Acústica del Salón: ${choralScore}%`}
                  </span>
                </div>
                {choralScore !== null && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
                    Ritmo 98% · Entonación 95%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Cronómetro de Práctica en Parejas (Pair-Work Timer) con Scaffolding */}
          <div className="rounded-3xl bg-gradient-to-r from-[#071F29] via-[#0A2736] to-[#071F29] border-2 border-emerald-400/60 p-5 sm:p-6 shadow-2xl shadow-emerald-950/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Cronómetro de Práctica en Parejas (Pair-Work Timer)</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/90 font-semibold">
                  {celtaGuide.icqInstruction}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPairTimerRunning(!isPairTimerRunning)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isPairTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPairTimerRunning ? 'Pausar' : 'Iniciar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPairTimerRunning(false);
                    setPairSecondsLeft(180);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>3:00</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 py-1">
              {/* Anillo Progreso + Reloj Digital Gigante */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400 transition-all duration-500"
                      strokeDasharray={`${ringProgress}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 absolute" />
                </div>

                <div className="text-5xl sm:text-6xl lg:text-7xl font-black font-mono tracking-wider text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.35)]">
                  {formatTimer(pairSecondsLeft)}
                </div>
              </div>

              {/* Frases de Apoyo (Scaffolding Sentence Starters) */}
              <div className="flex-1 min-w-[240px] bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block">
                  💡 Guía en Pizarrón para Parejas (Sentence Starters):
                </span>
                <div className="flex flex-wrap gap-2">
                  {celtaGuide.pairWorkStarters.map((starter, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-bold text-white"
                    >
                      {starter}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dock Inferior de 4 Macro-Botones Táctiles para el Profesor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-800/90">
        <button
          type="button"
          onClick={() => onPlayLineAudio(currentAvatarLine.text, 0.68)}
          className="py-4 px-5 rounded-2xl bg-emerald-950/90 hover:bg-emerald-900 border-2 border-emerald-500/70 text-emerald-200 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-transform active:scale-98"
        >
          <RotateCcw className="w-5 h-5 text-emerald-400" />
          <span>Repetir Lento 🐢 (0.68x)</span>
        </button>

        <button
          type="button"
          onClick={handleTriggerChoralPractice}
          className={`py-4 px-5 rounded-2xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-all ${
            isChoralListening
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
              : 'bg-blue-950/90 hover:bg-blue-900 border-blue-500/70 text-blue-100'
          }`}
        >
          <Mic className="w-5 h-5 text-cyan-300" />
          <span>
            {isChoralListening ? 'Escuchando al Salón...' : '🗣️ Práctica Coral con Micrófono'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPairSecondsLeft(180);
            setIsPairTimerRunning(true);
          }}
          className="py-4 px-5 rounded-2xl bg-amber-950/90 hover:bg-amber-900 border-2 border-amber-500/70 text-amber-200 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-transform active:scale-98"
        >
          <Clock className="w-5 h-5 text-amber-400" />
          <span>⏱️ Iniciar 3 Min en Parejas</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="py-4 px-5 rounded-2xl bg-rose-950/90 hover:bg-rose-900 border-2 border-rose-500/70 text-rose-200 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-transform active:scale-98"
        >
          <X className="w-5 h-5 text-rose-400" />
          <span>Salir del Pizarrón</span>
        </button>
      </div>
    </div>
  );
};

