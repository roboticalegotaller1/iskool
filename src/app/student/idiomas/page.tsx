"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { 
  useLanguagesStore, 
  LanguageLesson, 
  KaraokePhrase 
} from '@/store/useLanguagesStore';
import { HumanGesticulatingAvatar } from '@/components/languages/HumanGesticulatingAvatar';
import { LanguageKaraokePlayer } from '@/components/languages/LanguageKaraokePlayer';
import { 
  Languages, 
  Sparkles, 
  Trophy, 
  Flame, 
  Award, 
  CheckCircle2, 
  ArrowLeft, 
  Volume2, 
  Mic, 
  BookOpen, 
  Zap,
  Play,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function StudentIdiomasPage() {
  const { lessons, activeLessonId, setActiveLessonId } = useLanguagesStore();

  const [currentMode, setCurrentMode] = useState<'hub' | 'dialogue' | 'karaoke'>('hub');
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState<number>(0);
  const [dialogueStep, setDialogueStep] = useState<number>(0);
  const [xpEarned, setXpEarned] = useState<number>(140);
  const [coinsEarned, setCoinsEarned] = useState<number>(45);
  const [fluencyStreak, setFluencyStreak] = useState<number>(3);

  const activeLesson = useMemo(() => {
    return lessons.find(l => l.id === activeLessonId) || lessons[0];
  }, [lessons, activeLessonId]);

  const currentDialogueLine = activeLesson.dialogue[dialogueStep] || activeLesson.dialogue[0];

  const handleCompleteKaraoke = (stats: { accuracy: number; correctCount: number; errorWords: string[] }) => {
    const xpBonus = stats.accuracy >= 80 ? 60 : 30;
    const coinsBonus = stats.accuracy >= 80 ? 15 : 5;
    setXpEarned(prev => prev + xpBonus);
    setCoinsEarned(prev => prev + coinsBonus);
    if (stats.accuracy >= 80) {
      setFluencyStreak(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* BARRA SUPERIOR GAMIFICADA DEL ALUMNO */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <Languages className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Academia Lingüística ISkool
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Racha: {fluencyStreak} Días
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Módulo de Idiomas: Inglés & Francés
              </h1>
            </div>
          </div>

          {/* Recompensas & Recursos Gamificados */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">XP Total</span>
                <span className="text-sm font-black font-mono text-amber-300">{xpEarned} XP</span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Monedas</span>
                <span className="text-sm font-black font-mono text-cyan-300">{coinsEarned} 🪙</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            VISTA 1: HUB PRINCIPAL DE LECCIONES Y MISIONES DE IDIOMA
            ========================================================================= */}
        {currentMode === 'hub' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-400" />
                  <span>Misiones de Pronunciación & Diálogo Disponible</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Elige una lección para conversar con tu mentor o ingresar al karaoke de precisión fonética.
                </p>
              </div>
            </div>

            {/* Cuadrícula de Lecciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lessons.map(lesson => {
                const isEnglish = lesson.language === 'en';
                const flag = isEnglish ? '🇬🇧' : '🇫🇷';
                const langName = isEnglish ? 'Inglés' : 'Francés';

                return (
                  <div
                    key={lesson.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border-2 border-slate-800 hover:border-cyan-500/60 transition-all shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-black flex items-center gap-1.5">
                          <span>{flag}</span>
                          <span>{langName}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                          Nivel {lesson.level}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Tema: {lesson.topic}
                      </p>

                      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-lg">
                          {lesson.avatarGender === 'female' ? '👩‍🏫' : '👨‍🏫'}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-white block">Mentor: {lesson.avatarName}</span>
                          <span className="text-[10px] text-slate-400">Gesticulación humana en vivo</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLessonId(lesson.id);
                          setDialogueStep(0);
                          setCurrentMode('dialogue');
                        }}
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Conversar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLessonId(lesson.id);
                          setSelectedPhraseIndex(0);
                          setCurrentMode('karaoke');
                        }}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Karaoke</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VISTA 2: CONVERSACIÓN INTERACTIVA CON EL AVATAR GESTICULANTE
            ========================================================================= */}
        {currentMode === 'dialogue' && (
          <div className="space-y-6">
            
            <button
              type="button"
              onClick={() => setCurrentMode('hub')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Misiones</span>
            </button>

            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-600/40 shadow-2xl flex flex-col items-center space-y-6">
              
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  Paso {dialogueStep + 1} de {activeLesson.dialogue.length}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {activeLesson.title}
                </h2>
              </div>

              {/* AVATAR GESTICULANTE EN ACCIÓN */}
              <HumanGesticulatingAvatar
                gender={activeLesson.avatarGender}
                name={activeLesson.avatarName}
                language={activeLesson.language}
                voiceId={activeLesson.avatarVoice}
                speechRate={activeLesson.defaultSpeed}
                currentText={currentDialogueLine.text}
                translationText={currentDialogueLine.translationEs}
                phoneticTip={currentDialogueLine.phoneticTip}
              />

              {/* Botones de Navegación del Diálogo */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={dialogueStep === 0}
                  onClick={() => setDialogueStep(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-xs font-bold cursor-pointer"
                >
                  Línea Anterior
                </button>

                {dialogueStep < activeLesson.dialogue.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setDialogueStep(prev => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-md"
                  >
                    Siguiente Línea
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhraseIndex(0);
                      setCurrentMode('karaoke');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black cursor-pointer shadow-lg"
                  >
                    ¡Ir al Reto Karaoke de Pronunciación! 🎤
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            VISTA 3: SUBMÓDULO KARAOKE DE PRONUNCIACIÓN (0 TOKENS)
            ========================================================================= */}
        {currentMode === 'karaoke' && activeLesson.karaokePhrases[selectedPhraseIndex] && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentMode('hub')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Misiones</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Frase:</span>
                {activeLesson.karaokePhrases.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPhraseIndex(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      i === selectedPhraseIndex
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <LanguageKaraokePlayer
              phrase={activeLesson.karaokePhrases[selectedPhraseIndex]}
              language={activeLesson.language}
              avatarGender={activeLesson.avatarGender}
              avatarVoice={activeLesson.avatarVoice}
              avatarName={activeLesson.avatarName}
              studentName="Alumno Activo"
              lessonId={activeLesson.id}
              lessonTitle={activeLesson.title}
              onComplete={handleCompleteKaraoke}
            />

          </div>
        )}

      </main>
    </div>
  );
}
