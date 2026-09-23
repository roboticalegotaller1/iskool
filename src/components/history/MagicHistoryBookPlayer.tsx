"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Minimize2, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  MapPin, 
  Film, 
  MessageSquare, 
  HelpCircle, 
  X,
  Volume2,
  Compass,
  Bookmark,
  Send,
  Award,
  Layers
} from 'lucide-react';
import { 
  HistoricalFigureBlockData, 
  BookSpineStyle,
  HistoricalVerificationQuestion,
  HistoricalFigureMoment 
} from '@/types/studioBlocks';
import { HistoricalLivingAvatar } from './HistoricalLivingAvatar';
import { HistoricalInteractiveMap } from './HistoricalInteractiveMap';
import { HistoricalTimelineComic } from './HistoricalTimelineComic';
import { HistoricalCinematicVideo } from './HistoricalCinematicVideo';

export interface MagicHistoryBookPlayerProps {
  data: HistoricalFigureBlockData;
  onClose?: () => void;
  onComplete?: (score: number) => void;
  isProjectorModeInitially?: boolean;
}

// Estilos visuales de los 5 lomos de libros mágicos
export const BOOK_SPINE_THEMES: Record<BookSpineStyle, {
  name: string;
  badge: string;
  coverGradient: string;
  spineGradient: string;
  borderDecor: string;
  accentColor: string;
  pageBackground: string;
  textColor: string;
  fontFamily: string;
  coverTexture: string;
}> = {
  codice_antiguo: {
    name: 'Códice Antiguo',
    badge: '📜 Pergamino & Glifos',
    coverGradient: 'from-amber-950 via-stone-900 to-amber-950',
    spineGradient: 'from-amber-900 via-amber-950 to-stone-950',
    borderDecor: 'border-amber-600/60 shadow-amber-900/50',
    accentColor: 'text-amber-400',
    pageBackground: 'bg-[#f7f2e7] text-stone-900',
    textColor: 'text-stone-900',
    fontFamily: 'font-serif',
    coverTexture: 'bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]'
  },
  tomo_imperial: {
    name: 'Tomo Imperial',
    badge: '👑 Terciopelo Púrpura & Oro',
    coverGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    spineGradient: 'from-purple-900 via-purple-950 to-indigo-950',
    borderDecor: 'border-purple-400/50 shadow-purple-950/60',
    accentColor: 'text-yellow-400',
    pageBackground: 'bg-[#faf8f5] text-slate-900',
    textColor: 'text-slate-900',
    fontFamily: 'font-serif',
    coverTexture: 'bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:20px_20px]'
  },
  diario_republicano: {
    name: 'Diario Republicano',
    badge: '🇲🇽 Verde Insurgente 1810',
    coverGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    spineGradient: 'from-emerald-900 via-teal-950 to-stone-950',
    borderDecor: 'border-emerald-500/50 shadow-emerald-950/50',
    accentColor: 'text-emerald-300',
    pageBackground: 'bg-[#fcfbf9] text-zinc-900',
    textColor: 'text-zinc-900',
    fontFamily: 'font-serif',
    coverTexture: 'bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:18px_18px]'
  },
  grimorio_dorado: {
    name: 'Grimorio Dorado',
    badge: '✨ Oro Místico & Runas',
    coverGradient: 'from-amber-900 via-yellow-950 to-stone-950',
    spineGradient: 'from-yellow-700 via-amber-800 to-stone-900',
    borderDecor: 'border-yellow-400/70 shadow-yellow-600/40',
    accentColor: 'text-amber-300',
    pageBackground: 'bg-[#fffdfa] text-stone-900',
    textColor: 'text-stone-900',
    fontFamily: 'font-serif',
    coverTexture: 'bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:14px_14px]'
  },
  cuaderno_cronista: {
    name: 'Cuaderno del Cronista',
    badge: '🖋️ Crónica Revolucionaria (1910)',
    coverGradient: 'from-stone-900 via-stone-950 to-stone-900',
    spineGradient: 'from-stone-800 via-stone-900 to-black',
    borderDecor: 'border-rose-600/50 shadow-rose-950/40',
    accentColor: 'text-rose-400',
    pageBackground: 'bg-[#f4efe6] text-stone-950',
    textColor: 'text-stone-950',
    fontFamily: 'font-serif',
    coverTexture: 'bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:22px_22px]'
  }
};

export const MagicHistoryBookPlayer: React.FC<MagicHistoryBookPlayerProps> = ({
  data,
  onClose,
  onComplete,
  isProjectorModeInitially = false
}) => {
  // Estados del Libro Mágico
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // 0: Portada interior, 1: Cómic, 2: Mapa, 3: Video, 4: Avatar Chat, 5: Preguntas
  const [isProjectorMode, setIsProjectorMode] = useState(isProjectorModeInitially);
  const [assignedToHeroPath, setAssignedToHeroPath] = useState(false);
  const [sharedToCommunity, setSharedToCommunity] = useState(false);

  // Estados de Preguntas Clave
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const spineTheme = BOOK_SPINE_THEMES[data.bookSpineStyle || 'diario_republicano'] || BOOK_SPINE_THEMES.diario_republicano;

  const totalPages = 6;
  const pageTitles = [
    'Portada & Semblanza',
    'Timelapse: Novela Gráfica (4 Momentos)',
    'Cartografía Satelital de Hitos',
    'Cápsula Cinematográfica Narrada',
    'Entrevista en Vivo con el Personaje',
    '5 Preguntas Clave de Verificación'
  ];

  // Sonido de pasar página con Web Audio
  const playPageTurnSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Ignorar si falla audio
    }
  };

  const handleOpenBook = () => {
    playPageTurnSound();
    setIsOpen(true);
    setIsClosing(false);
  };

  const handleCloseBook = () => {
    playPageTurnSound();
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setCurrentPage(0);
    }, 600);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      playPageTurnSound();
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      playPageTurnSound();
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleAnswerQuizQuestion = (qIdx: number, optIdx: number) => {
    if (quizAnswers[qIdx] !== undefined) return;

    const newAnswers = { ...quizAnswers, [qIdx]: optIdx };
    setQuizAnswers(newAnswers);

    // Si respondió todas las 5 preguntas
    if (Object.keys(newAnswers).length === data.verificationQuestions.length) {
      let correctCount = 0;
      data.verificationQuestions.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctIndex) correctCount++;
      });
      const score = Math.round((correctCount / data.verificationQuestions.length) * 100);
      setQuizScore(score);
      setQuizCompleted(true);
      if (onComplete) onComplete(score);
    }
  };

  return (
    <div className={`relative w-full ${isProjectorMode ? 'fixed inset-0 z-50 bg-black/95 p-2 sm:p-6 flex flex-col justify-between overflow-y-auto' : 'min-h-[640px] flex flex-col justify-between'}`}>
      {/* ================= BARRA SUPERIOR DE ACCIONES PEDAGÓGICAS ================= */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-white backdrop-blur-xl shadow-xl z-20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-amber-100 uppercase tracking-wide">
              {data.characterName} — Libro Mágico Interactivo
            </h2>
            <p className="text-[10px] text-amber-400/80 font-serif">
              Lomo: {spineTheme.name} ({spineTheme.badge})
            </p>
          </div>
        </div>

        {/* Botones de Modo Proyector, Camino del Héroe y Comunidad */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Asignar al Camino del Héroe */}
          <button
            type="button"
            onClick={() => {
              setAssignedToHeroPath(true);
              setTimeout(() => setAssignedToHeroPath(false), 3000);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              assignedToHeroPath 
                ? 'bg-emerald-600 text-white border-emerald-400' 
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-500/30'
            }`}
            title="Asignar al mapa de aventuras del grupo de alumnos"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{assignedToHeroPath ? '¡Asignado al Camino!' : 'Asignar al Camino del Héroe'}</span>
          </button>

          {/* Guardar en Comunidad de Profesores */}
          <button
            type="button"
            onClick={() => {
              setSharedToCommunity(true);
              setTimeout(() => setSharedToCommunity(false), 3000);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              sharedToCommunity 
                ? 'bg-blue-600 text-white border-blue-400' 
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-500/30'
            }`}
            title="Publicar en el repositorio comunitario de docentes"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{sharedToCommunity ? '¡Publicado en Comunidad!' : 'Compartir en Comunidad'}</span>
          </button>

          {/* Alternar Modo Proyector */}
          <button
            type="button"
            onClick={() => setIsProjectorMode(!isProjectorMode)}
            className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
            title={isProjectorMode ? 'Salir de pantalla completa' : 'Modo Proyector de Aula'}
          >
            {isProjectorMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
              title="Cerrar módulo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ================= LIBRO MÁGICO 3D (PORTADA CERRADA O PÁGINAS ABIERTAS) ================= */}
      <div className="flex-1 flex items-center justify-center relative my-2">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* ================= PORTADA DEL LIBRO CERRADO ================= */
            <motion.div
              key="closed-book"
              initial={{ scale: 0.9, opacity: 0, rotateY: -15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 1.05, opacity: 0, rotateY: -80 }}
              transition={{ duration: 0.5 }}
              onClick={handleOpenBook}
              className={`w-full max-w-lg aspect-[3/4] max-h-[580px] rounded-3xl p-8 flex flex-col justify-between items-center text-center cursor-pointer select-none shadow-2xl relative overflow-hidden bg-gradient-to-tr ${spineTheme.coverGradient} border-4 ${spineTheme.borderDecor} ${spineTheme.coverTexture} transform hover:scale-[1.02] transition-transform`}
            >
              {/* Lomo Grueso 3D del Libro a la Izquierda */}
              <div className={`absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r ${spineTheme.spineGradient} border-r-2 border-amber-500/40 shadow-2xl`} />

              {/* Marco Dorado Ornamentado */}
              <div className="absolute inset-4 rounded-2xl border-2 border-amber-500/40 pointer-events-none" />

              {/* Emblema Superior */}
              <div className="z-10 space-y-2 pt-4">
                <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black/40 text-amber-300 border border-amber-500/40">
                  {spineTheme.badge}
                </span>
                <p className="text-xs font-serif text-amber-400/80 italic">
                  {data.historicalEra || 'Crónica Histórica'}
                </p>
              </div>

              {/* Título Principal y Retrato */}
              <div className="z-10 space-y-4 my-auto">
                <div className="w-32 h-32 rounded-full border-4 border-amber-400/60 p-1 shadow-2xl mx-auto overflow-hidden bg-black/60">
                  <img 
                    src={data.avatarImageUrl || '/images/history/francisco_villa_avatar.png'} 
                    alt={data.characterName} 
                    onError={(e) => {
                      if (data.avatarImageUrl) {
                        (e.target as HTMLImageElement).src = data.avatarImageUrl;
                      }
                    }}
                    className="w-full h-full object-cover filter contrast-105"
                  />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-wide font-serif drop-shadow-lg">
                  {data.characterName}
                </h1>

                <p className="text-xs sm:text-sm text-amber-200/80 font-serif max-w-xs mx-auto line-clamp-3">
                  {data.shortBio}
                </p>
              </div>

              {/* Botón de Apertura Mágica */}
              <div className="z-10 pb-4">
                <button
                  type="button"
                  onClick={handleOpenBook}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2 border border-amber-300 transform active:scale-95 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Abrir Libro Mágico</span>
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* ================= PÁGINAS ABIERTAS DEL LIBRO MÁGICO ================= */
            <motion.div
              key="opened-book"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/40 bg-slate-950 flex flex-col"
            >
              {/* Cinta de Paginación Superior del Libro */}
              <div className="w-full p-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-white">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase text-amber-200">
                    Página {currentPage + 1} de {totalPages}: {pageTitles[currentPage]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={handlePrevPage}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Pág. Anterior</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentPage === totalPages - 1}
                    onClick={handleNextPage}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 disabled:opacity-30 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-md"
                  >
                    <span>Pág. Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseBook}
                    className="ml-2 px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-xs font-bold border border-rose-500/40 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Cerrar Libro</span>
                  </button>
                </div>
              </div>

              {/* Contenido Dinámico según la Página Activa */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
                <AnimatePresence mode="wait">
                  {/* PÁGINA 1: PORTADA INTERIOR & AVATAR VIVO INTRODUCTORIO */}
                  {currentPage === 0 && (
                    <motion.div
                      key="page-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-black/80 border border-amber-500/30">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                          <div className="lg:col-span-4 text-center">
                            <div className="w-44 h-44 rounded-full border-4 border-amber-500/40 p-1 shadow-2xl mx-auto overflow-hidden bg-slate-950">
                              <img 
                                src={data.avatarImageUrl || '/images/history/francisco_villa_avatar.png'} 
                                alt={data.characterName} 
                                onError={(e) => {
                                  if (data.avatarImageUrl) {
                                    (e.target as HTMLImageElement).src = data.avatarImageUrl;
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="text-xl font-black text-amber-200 mt-3 font-serif">
                              {data.characterName}
                            </h3>
                            <p className="text-xs text-amber-400/80 font-mono">
                              {data.birthDeathDates || 'Época Histórica Clave'}
                            </p>
                          </div>

                          <div className="lg:col-span-8 space-y-4 text-white">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Semblanza & Relevancia Curricular
                            </span>
                            <h4 className="text-base sm:text-lg font-bold text-amber-100 leading-relaxed font-serif">
                              "{data.shortBio}"
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif">
                              {data.detailedContext}
                            </p>

                            <div className="pt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setCurrentPage(1)}
                                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
                              >
                                <span>Explorar Novela Gráfica (4 Momentos)</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurrentPage(4)}
                                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-xs flex items-center gap-2 border border-amber-500/30 cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4 text-amber-400" />
                                <span>Hablar con el Personaje</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PÁGINA 2: CÓMIC HISTÓRICO (4 MOMENTOS NOVELA GRÁFICA) */}
                  {currentPage === 1 && (
                    <motion.div
                      key="page-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HistoricalTimelineComic 
                        moments={data.moments || []} 
                        characterName={data.characterName}
                        avatarImageUrl={data.avatarImageUrl}
                        onSelectMomentOnMap={() => setCurrentPage(2)}
                      />
                    </motion.div>
                  )}

                  {/* PÁGINA 3: MAPA CARTOGRÁFICO SATELITAL DE HITOS */}
                  {currentPage === 2 && (
                    <motion.div
                      key="page-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HistoricalInteractiveMap 
                        locations={data.keyLocations || []} 
                        characterName={data.characterName}
                      />
                    </motion.div>
                  )}

                  {/* PÁGINA 4: CÁPSULA CINEMATOGRÁFICA NARRADA */}
                  {currentPage === 3 && (
                    <motion.div
                      key="page-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HistoricalCinematicVideo 
                        videoUrl={data.videoClip?.videoUrl}
                        durationSeconds={data.videoClip?.durationSeconds}
                        title={data.videoClip?.title}
                        narratorScript={data.videoClip?.narratorScript}
                        characterName={data.characterName}
                        moments={data.moments}
                        avatarImageUrl={data.avatarImageUrl}
                        shortBio={data.shortBio}
                      />
                    </motion.div>
                  )}

                  {/* PÁGINA 5: ENTREVISTA EN VIVO CON EL AVATAR HISTÓRICO */}
                  {currentPage === 4 && (
                    <motion.div
                      key="page-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HistoricalLivingAvatar 
                        characterName={data.characterName}
                        slug={data.vaultNodeSlug}
                        avatarImageUrl={data.avatarImageUrl}
                        isGeographicSite={data.isGeographicSite}
                        birthDeathDates={data.birthDeathDates}
                        voiceId={data.voiceId}
                        voiceRate={data.voiceRate}
                        voicePitch={data.voicePitch}
                        oratoricalTone={data.oratoricalTone}
                      />
                    </motion.div>
                  )}

                  {/* PÁGINA 6: 5 PREGUNTAS CLAVE DE VERIFICACIÓN FORMATIVA */}
                  {currentPage === 5 && (
                    <motion.div
                      key="page-5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-white"
                    >
                      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/30">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
                          <div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Evaluación Formativa & NEM
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-amber-100 mt-1">
                              5 Preguntas Clave para el Estudiante
                            </h3>
                          </div>

                          {quizCompleted && (
                            <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-200 font-bold text-xs flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-amber-400" />
                              <span>Puntuación: {quizScore}% (+50 XP)</span>
                            </div>
                          )}
                        </div>

                        {/* Listado de las 5 Preguntas */}
                        <div className="space-y-6 pt-4">
                          {(data.verificationQuestions || []).map((q, qIdx) => {
                            const selectedOpt = quizAnswers[qIdx];
                            const isAnswered = selectedOpt !== undefined;

                            return (
                              <div 
                                key={q.id || qIdx}
                                className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-3"
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    {qIdx + 1}
                                  </span>
                                  <h4 className="text-sm font-bold text-amber-100 leading-snug">
                                    {q.question}
                                  </h4>
                                </div>

                                {/* Opciones */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                                  {q.options.map((opt, optIdx) => {
                                    const isChosen = selectedOpt === optIdx;
                                    const isCorrect = optIdx === q.correctIndex;

                                    let btnStyle = 'bg-slate-950/70 border-amber-500/20 hover:border-amber-400 text-slate-200';
                                    if (isAnswered) {
                                      if (isCorrect) {
                                        btnStyle = 'bg-emerald-600/40 text-emerald-200 border-emerald-500 shadow-md';
                                      } else if (isChosen) {
                                        btnStyle = 'bg-rose-600/40 text-rose-200 border-rose-500';
                                      } else {
                                        btnStyle = 'opacity-40 border-slate-800';
                                      }
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={isAnswered}
                                        onClick={() => handleAnswerQuizQuestion(qIdx, optIdx)}
                                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                                      >
                                        <span>{opt}</span>
                                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                        {isAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Explicación Formativa */}
                                {isAnswered && (
                                  <div className="mt-2 ml-8 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-serif leading-relaxed">
                                    <span className="font-bold text-amber-300">Retroalimentación Didáctica: </span>
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Botón Final de Conclusión y Cierre */}
                        <div className="pt-6 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={handleCloseBook}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
                          >
                            <Trophy className="w-4 h-4 text-slate-950" />
                            <span>Concluir Misión y Cerrar Libro Mágico (+50 XP)</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
