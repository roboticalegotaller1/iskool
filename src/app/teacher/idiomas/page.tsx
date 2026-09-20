"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { 
  useLanguagesStore, 
  LanguageLesson, 
  LanguageCode, 
  AvatarGender,
  DialogueLine,
  KaraokePhrase 
} from '@/store/useLanguagesStore';
import { HumanGesticulatingAvatar } from '@/components/languages/HumanGesticulatingAvatar';
import { LanguageKaraokePlayer } from '@/components/languages/LanguageKaraokePlayer';
import { 
  Languages, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  MessageSquare, 
  Mic, 
  Flame, 
  Trophy, 
  BookOpen, 
  Save, 
  Gauge, 
  Users, 
  Clock, 
  Search,
  CheckCheck
} from 'lucide-react';

export default function TeacherIdiomasPage() {
  const { 
    lessons, 
    activeLessonId, 
    setActiveLessonId, 
    addLesson, 
    updateLesson, 
    deleteLesson, 
    studentReports,
    markReportAsReviewed 
  } = useLanguagesStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'reports'>('editor');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [selectedKaraokeIndex, setSelectedKaraokeIndex] = useState<number>(0);
  const [reportFilter, setReportFilter] = useState<'all' | 'unreviewed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeLesson = useMemo(() => {
    return lessons.find(l => l.id === activeLessonId) || lessons[0];
  }, [lessons, activeLessonId]);

  // Voces disponibles según género e idioma
  const availableVoices = useMemo(() => {
    if (activeLesson.language === 'en') {
      return activeLesson.avatarGender === 'female'
        ? [
            { id: 'en-US-JennyNeural', label: 'Claire (EE.UU.) · Femenina Suave' },
            { id: 'en-GB-SoniaNeural', label: 'Sonia (Reino Unido) · Femenina Clásica' }
          ]
        : [
            { id: 'en-US-GuyNeural', label: 'Arthur (EE.UU.) · Masculina Académica' },
            { id: 'en-GB-RyanNeural', label: 'Ryan (Reino Unido) · Masculina Oxford' }
          ];
    } else {
      return activeLesson.avatarGender === 'female'
        ? [
            { id: 'fr-FR-DeniseNeural', label: 'Sophie (Francia) · Parisina Femenina' },
            { id: 'fr-CA-SylvieNeural', label: 'Sylvie (Canadá) · Femenina Suave' }
          ]
        : [
            { id: 'fr-FR-HenriNeural', label: 'Henri (Francia) · Profesor Masculino' },
            { id: 'fr-CA-JeanNeural', label: 'Jean (Canadá) · Masculina Quebequense' }
          ];
    }
  }, [activeLesson.language, activeLesson.avatarGender]);

  // Crear nueva lección rápida
  const handleCreateNewLesson = () => {
    const id = addLesson({
      title: 'Nueva Conversación Guiada',
      topic: 'Comunicación Esencial',
      language: 'en',
      level: 'A1',
      avatarGender: 'female',
      avatarName: 'Claire',
      avatarVoice: 'en-US-JennyNeural',
      defaultSpeed: 0.85,
      dialogue: [
        {
          id: `d-${Date.now()}-1`,
          speaker: 'avatar',
          text: 'Hello! How are you feeling today?',
          translationEs: '¡Hola! ¿Cómo te sientes hoy?',
          phoneticTip: 'Pronuncia la "H" suavemente aspirada'
        },
        {
          id: `d-${Date.now()}-2`,
          speaker: 'student',
          text: 'I am excited to learn and practice my pronunciation!',
          translationEs: '¡Estoy emocionado por aprender y practicar mi pronunciación!'
        }
      ],
      karaokePhrases: [
        {
          id: `k-${Date.now()}-1`,
          targetText: 'I am excited to learn and practice my pronunciation',
          translationEs: 'Estoy emocionado por aprender y practicar mi pronunciación',
          difficulty: 'beginner',
          phoneticGuide: 'ai æm ɪkˈsaɪtɪd tuː lɜːrn ænd ˈpræktɪs maɪ prəˌnʌnsiˈeɪʃn'
        }
      ]
    });
    setActiveLessonId(id);
    setIsPreviewMode(false);
  };

  // Añadir línea de diálogo
  const handleAddDialogueLine = () => {
    const newLine: DialogueLine = {
      id: `d-${Date.now()}`,
      speaker: 'avatar',
      text: '',
      translationEs: ''
    };
    updateLesson(activeLesson.id, {
      dialogue: [...activeLesson.dialogue, newLine]
    });
  };

  // Actualizar línea de diálogo
  const handleUpdateDialogueLine = (index: number, updates: Partial<DialogueLine>) => {
    const updated = [...activeLesson.dialogue];
    updated[index] = { ...updated[index], ...updates };
    updateLesson(activeLesson.id, { dialogue: updated });
  };

  // Eliminar línea de diálogo
  const handleDeleteDialogueLine = (index: number) => {
    const updated = activeLesson.dialogue.filter((_, i) => i !== index);
    updateLesson(activeLesson.id, { dialogue: updated });
  };

  // Añadir frase de karaoke
  const handleAddKaraokePhrase = () => {
    const newPhrase: KaraokePhrase = {
      id: `k-${Date.now()}`,
      targetText: 'Practice makes perfect in every language',
      translationEs: 'La práctica hace al maestro en cada idioma',
      difficulty: 'beginner'
    };
    updateLesson(activeLesson.id, {
      karaokePhrases: [...activeLesson.karaokePhrases, newPhrase]
    });
  };

  // Filtrado de reportes de alumnos
  const filteredReports = useMemo(() => {
    return studentReports.filter(rep => {
      const matchesSearch = rep.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.targetPhrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.mispronouncedWords.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()));

      if (reportFilter === 'unreviewed') {
        return matchesSearch && !rep.reviewedByTeacher;
      }
      return matchesSearch;
    });
  }, [studentReports, reportFilter, searchQuery]);

  // Estadísticas grupales
  const stats = useMemo(() => {
    const total = studentReports.length;
    if (total === 0) return { total: 0, avgAccuracy: 0, commonErrors: [] };

    const sumAcc = studentReports.reduce((acc, r) => acc + r.overallAccuracy, 0);
    const avgAccuracy = Math.round(sumAcc / total);

    // Conteo de palabras con error más frecuentes
    const errorMap: Record<string, number> = {};
    studentReports.forEach(r => {
      r.mispronouncedWords.forEach(w => {
        const clean = w.toLowerCase();
        errorMap[clean] = (errorMap[clean] || 0) + 1;
      });
    });

    const commonErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return { total, avgAccuracy, commonErrors };
  }, [studentReports]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* ENCABEZADO DEL MÓDULO DE IDIOMAS */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-400">
              <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/40 text-teal-300">
                Módulo Académico de Idiomas
              </span>
              <span>·</span>
              <span className="text-cyan-300">Avatar Humano & Karaoke Fonético (0 Tokens)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <Languages className="w-8 h-8 text-cyan-400" />
              <span>Estudio Docente de Idiomas & Fonética</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Diseña conversaciones inmersivas con avatares gesticulantes en <strong>Inglés y Francés</strong>, entrena la pronunciación guiada tipo karaoke y recibe en tiempo real las palabras que cada alumno necesita reforzar.
            </p>
          </div>

          {/* Selector de Pestañas Superiores */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-indigo-700/50 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Taller de Conversación</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Bitácora de Alumnos</span>
              {studentReports.filter(r => !r.reviewedByTeacher).length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            PESTAÑA 1: TALLER DE CONVERSACIÓN & PREVISUALIZACIÓN INMEDIATA
            ========================================================================= */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            
            {/* Barra de Gestión de Lecciones y Modo Vista Previa */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              
              {/* Selector de Lección Activa */}
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Lección:
                </span>
                {lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setActiveLessonId(lesson.id);
                      setIsPreviewMode(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      lesson.id === activeLesson.id
                        ? 'bg-indigo-600 text-white shadow-md border border-indigo-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <span>{lesson.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                    <span>{lesson.title}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCreateNewLesson}
                  className="px-3 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Lección</span>
                </button>
              </div>

              {/* Interruptor de Vista Previa del Alumno */}
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isPreviewMode
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black scale-105'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isPreviewMode ? '✏️ Volver a Edición' : '👁️ Vista Previa del Alumno'}</span>
              </button>
            </div>

            {/* MODO VISTA PREVIA INTERACTIVA (EXACTAMENTE LO QUE VIVE EL ALUMNO) */}
            {isPreviewMode ? (
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Modo Vista Previa Alumno · Simulador de Fonética Activo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Frase a practicar:</span>
                    <select
                      value={selectedKaraokeIndex}
                      onChange={(e) => setSelectedKaraokeIndex(Number(e.target.value))}
                      className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700"
                    >
                      {activeLesson.karaokePhrases.map((phrase, idx) => (
                        <option key={phrase.id} value={idx}>
                          Frase {idx + 1}: &ldquo;{phrase.targetText.substring(0, 35)}...&rdquo;
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeLesson.karaokePhrases[selectedKaraokeIndex] && (
                  <LanguageKaraokePlayer
                    phrase={activeLesson.karaokePhrases[selectedKaraokeIndex]}
                    language={activeLesson.language}
                    avatarGender={activeLesson.avatarGender}
                    avatarVoice={activeLesson.avatarVoice}
                    avatarName={activeLesson.avatarName}
                    lessonId={activeLesson.id}
                    lessonTitle={activeLesson.title}
                    studentName="Profesor (Modo Demostración)"
                  />
                )}
              </div>
            ) : (
              /* MODO EDITOR DOCENTE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Lado Izquierdo: Configuración del Avatar & Voz */}
                <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Configuración del Avatar</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Paso 1
                    </span>
                  </div>

                  {/* Selector de Idioma */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Idioma Objetivo:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newVoice = activeLesson.avatarGender === 'female' 
                            ? 'en-US-JennyNeural' 
                            : 'en-US-GuyNeural';
                          updateLesson(activeLesson.id, { 
                            language: 'en', 
                            avatarVoice: newVoice,
                            avatarName: activeLesson.avatarGender === 'female' ? 'Claire' : 'Arthur'
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeLesson.language === 'en'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-base">🇬🇧</span>
                        <span>Inglés</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newVoice = activeLesson.avatarGender === 'female' 
                            ? 'fr-FR-DeniseNeural' 
                            : 'fr-FR-HenriNeural';
                          updateLesson(activeLesson.id, { 
                            language: 'fr', 
                            avatarVoice: newVoice,
                            avatarName: activeLesson.avatarGender === 'female' ? 'Sophie' : 'Henri'
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeLesson.language === 'fr'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-base">🇫🇷</span>
                        <span>Francés</span>
                      </button>
                    </div>
                  </div>

                  {/* Selector de Género del Avatar */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Género del Avatar:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newVoice = activeLesson.language === 'en' ? 'en-US-JennyNeural' : 'fr-FR-DeniseNeural';
                          const newName = activeLesson.language === 'en' ? 'Claire' : 'Sophie';
                          updateLesson(activeLesson.id, { 
                            avatarGender: 'female', 
                            avatarVoice: newVoice,
                            avatarName: newName
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeLesson.avatarGender === 'female'
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>👩‍🏫</span>
                        <span>Mujer ({activeLesson.language === 'en' ? 'Claire' : 'Sophie'})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newVoice = activeLesson.language === 'en' ? 'en-US-GuyNeural' : 'fr-FR-HenriNeural';
                          const newName = activeLesson.language === 'en' ? 'Arthur' : 'Henri';
                          updateLesson(activeLesson.id, { 
                            avatarGender: 'male', 
                            avatarVoice: newVoice,
                            avatarName: newName
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeLesson.avatarGender === 'male'
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>👨‍🏫</span>
                        <span>Hombre ({activeLesson.language === 'en' ? 'Arthur' : 'Henri'})</span>
                      </button>
                    </div>
                  </div>

                  {/* Selector de Voz Neural */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Voz Humana de Estudio:</label>
                    <select
                      value={activeLesson.avatarVoice}
                      onChange={(e) => updateLesson(activeLesson.id, { avatarVoice: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white"
                    >
                      {availableVoices.map(v => (
                        <option key={v.id} value={v.id}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Velocidad Predeterminada para Rezagados */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Velocidad Base:</span>
                      <span className="text-cyan-400 font-mono">{activeLesson.defaultSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.2"
                      step="0.05"
                      value={activeLesson.defaultSpeed}
                      onChange={(e) => updateLesson(activeLesson.id, { defaultSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>0.6x (Rezagados)</span>
                      <span>1.0x (Nativo)</span>
                      <span>1.2x (Avanzado)</span>
                    </div>
                  </div>

                  {/* Vista en Miniatura del Avatar Configurado */}
                  <div className="pt-2 flex justify-center">
                    <HumanGesticulatingAvatar
                      gender={activeLesson.avatarGender}
                      name={activeLesson.avatarName}
                      language={activeLesson.language}
                      voiceId={activeLesson.avatarVoice}
                      speechRate={activeLesson.defaultSpeed}
                      currentText="Listo para enseñar con la mejor fonética."
                      className="scale-90"
                    />
                  </div>
                </div>

                {/* Lado Derecho: Editor de Diálogos & Frases para Karaoke */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* SECCIÓN 1: LÍNEAS DE DIÁLOGO DE LA CONVERSACIÓN */}
                  <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                          <span>Diálogo de la Conversación</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Redacta la interacción entre el avatar y el estudiante. El avatar pronunciará sus líneas con gesticulación real.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDialogueLine}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Línea</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeLesson.dialogue.map((line, idx) => (
                        <div key={line.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                                {idx + 1}
                              </span>
                              <select
                                value={line.speaker}
                                onChange={(e) => handleUpdateDialogueLine(idx, { speaker: e.target.value as any })}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-bold text-white border border-slate-700"
                              >
                                <option value="avatar">Avatar ({activeLesson.avatarName})</option>
                                <option value="student">Alumno (Respuesta)</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteDialogueLine(idx)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                              title="Eliminar línea"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={line.text}
                              onChange={(e) => handleUpdateDialogueLine(idx, { text: e.target.value })}
                              placeholder={`Texto en ${activeLesson.language === 'en' ? 'Inglés' : 'Francés'}...`}
                              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={line.translationEs}
                              onChange={(e) => handleUpdateDialogueLine(idx, { translationEs: e.target.value })}
                              placeholder="Traducción al Español para soporte del alumno..."
                              className="w-full p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECCIÓN 2: FRASES DE RETO PARA EL KARAOKE FONÉTICO */}
                  <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <Mic className="w-4 h-4 text-teal-400" />
                          <span>Frases Guiadas para Karaoke de Pronunciación</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          El alumno grabará estas oraciones. El sistema marcará las palabras en verde y rojo en tiempo real (0 Tokens).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddKaraokePhrase}
                        className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Frase Karaoke</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeLesson.karaokePhrases.map((phrase, idx) => (
                        <div key={phrase.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-teal-400">
                              Frase {idx + 1} ({phrase.difficulty})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = activeLesson.karaokePhrases.filter((_, i) => i !== idx);
                                updateLesson(activeLesson.id, { karaokePhrases: updated });
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={phrase.targetText}
                            onChange={(e) => {
                              const updated = [...activeLesson.karaokePhrases];
                              updated[idx].targetText = e.target.value;
                              updateLesson(activeLesson.id, { karaokePhrases: updated });
                            }}
                            placeholder="Oración exacta que el alumno pronunciará..."
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:border-teal-400 focus:outline-hidden"
                          />

                          <input
                            type="text"
                            value={phrase.translationEs}
                            onChange={(e) => {
                              const updated = [...activeLesson.karaokePhrases];
                              updated[idx].translationEs = e.target.value;
                              updateLesson(activeLesson.id, { karaokePhrases: updated });
                            }}
                            placeholder="Significado en español..."
                            className="w-full p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            PESTAÑA 2: BITÁCORA EN TIEMPO REAL & NOTAS DE ALUMNOS (DIAGNÓSTICO)
            ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Tarjetas de Resumen General */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Prácticas Evaluadas</span>
                <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <span>{stats.total}</span>
                </div>
                <p className="text-[11px] text-slate-400">Enviadas en tiempo real desde el karaoke</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Precisión Promedio Grupal</span>
                <div className="text-2xl sm:text-3xl font-black text-teal-300 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>{stats.avgAccuracy}%</span>
                </div>
                <p className="text-[11px] text-slate-400">Porcentaje de palabras acertadas</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Palabras Más Complejas</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stats.commonErrors.length > 0 ? (
                    stats.commonErrors.map(([word, count]) => (
                      <span key={word} className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-700 text-rose-300 font-mono text-[11px] font-bold">
                        {word} ({count})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-normal">Sin errores registrados</span>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Búsqueda y Filtros de Reporte */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar alumno, palabra con error o frase..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    reportFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Todas ({studentReports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReportFilter('unreviewed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    reportFilter === 'unreviewed' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Pendientes ({studentReports.filter(r => !r.reviewedByTeacher).length})
                </button>
              </div>
            </div>

            {/* Lista Detallada de Reportes de Alumnos en Tiempo Real */}
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                  No hay reportes de pronunciación con los filtros seleccionados.
                </div>
              ) : (
                filteredReports.map(report => (
                  <div 
                    key={report.id}
                    className={`p-5 rounded-3xl border transition-all space-y-3 ${
                      report.reviewedByTeacher
                        ? 'bg-slate-900/60 border-slate-800 opacity-80'
                        : 'bg-slate-900 border-indigo-700/60 shadow-xl'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      
                      {/* Alumno y Datos */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm text-cyan-300">
                          {report.studentAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={report.studentAvatar} alt={report.studentName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{report.studentName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-2">
                            <span>{report.studentName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {report.language === 'fr' ? '🇫🇷 Francés' : '🇬🇧 Inglés'}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Lección: {report.lessonTitle}
                          </span>
                        </div>
                      </div>

                      {/* Calificación y Estado de Revisión */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Precisión Fonética</span>
                          <span className={`text-base font-black font-mono ${
                            report.overallAccuracy >= 85 
                              ? 'text-emerald-400' 
                              : report.overallAccuracy >= 70 
                                ? 'text-amber-400' 
                                : 'text-rose-400'
                          }`}>
                            {report.overallAccuracy}%
                          </span>
                        </div>

                        {!report.reviewedByTeacher && (
                          <button
                            type="button"
                            onClick={() => markReportAsReviewed(report.id)}
                            className="px-3 py-1.5 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                            title="Marcar como revisado"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Marcar Revisado</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Frase Evaluada */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Frase Asignada:</span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        &ldquo;{report.targetPhrase}&rdquo;
                      </p>
                    </div>

                    {/* DESGLOSE EN TIEMPO REAL: PALABRAS CON ERROR */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="font-bold text-slate-400 text-[11px]">
                        Diagnóstico para el docente:
                      </span>
                      {report.mispronouncedWords.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-rose-400 font-bold">Palabras a reforzar en clase:</span>
                          {report.mispronouncedWords.map((word, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/60 text-rose-300 font-bold font-mono text-[11px]"
                            >
                              ❌ {word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Excelente entonación y dicción completada.
                        </span>
                      )}
                    </div>

                    {/* Recomendación Pedagógica Entregada al Alumno */}
                    {report.pedagogicalAdvice && (
                      <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-xs text-amber-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
                          <span>💡 Recomendación asignada al alumno:</span>
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          {report.pedagogicalAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
