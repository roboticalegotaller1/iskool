"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Play, 
  Pause,
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ExternalLink,
  Tv,
  Layers,
  Eye,
  Subtitles,
  Maximize2,
  Clock
} from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/components/studio/player/StudioFlowPlayer';

import { HistoricalFigureMoment } from '@/types/studioBlocks';
import { 
  playUniversalIskoolVoice, 
  stopAllIskoolAudio, 
  UniversalAudioController 
} from '@/lib/historicalVoiceEngine';

export interface HistoricalCinematicVideoProps {
  videoUrl?: string;
  durationSeconds?: number;
  title?: string;
  narratorScript?: string;
  characterName: string;
  moments?: HistoricalFigureMoment[];
  avatarImageUrl?: string;
  shortBio?: string;
  className?: string;
}

interface HistoricalCapsule {
  id: string;
  title: string;
  duration: number;
  imageUrl: string;
  script: string;
  cameraMovement: 'zoom_in' | 'pan_slow' | 'gallop_sweep' | 'dawn_ascend';
  youtubeUrl?: string;
}

export const HistoricalCinematicVideo: React.FC<HistoricalCinematicVideoProps> = ({
  videoUrl,
  durationSeconds = 15,
  title = 'Cápsulas Cinematográficas Históricas',
  narratorScript,
  characterName,
  moments,
  avatarImageUrl,
  shortBio,
  className = ''
}) => {
  const [currentCapsuleIndex, setCurrentCapsuleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'cinematic_flow' | 'external_video'>('cinematic_flow');
  const [framingMode, setFramingMode] = useState<'fit' | 'fill'>('fit');
  const [showOnScreenSubtitles, setShowOnScreenSubtitles] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtrlRef = useRef<UniversalAudioController | null>(null);

  // Reiniciar cápsula activa si cambia el personaje
  useEffect(() => {
    setCurrentCapsuleIndex(0);
    setProgress(0);
    setIsPlaying(false);
  }, [characterName]);

  // Generar cápsulas cinematográficas DINÁMICAMENTE acordes al personaje específico
  const capsules: HistoricalCapsule[] = React.useMemo(() => {
    if (moments && moments.length > 0) {
      return moments.map((m, idx) => ({
        id: `cap-${idx + 1}`,
        title: m.title || `${characterName}: Hito ${idx + 1}`,
        duration: idx === 0 ? (durationSeconds || 18) : (16 + (idx * 2)),
        imageUrl: m.imageUrl || avatarImageUrl || '/images/history/francisco_villa_avatar.png',
        script: idx === 0 && narratorScript 
          ? narratorScript 
          : (m.narrativeCaption || m.description || `${characterName}: acontecimiento histórico en ${m.locationName || 'México'}.`),
        cameraMovement: (['zoom_in', 'pan_slow', 'gallop_sweep', 'dawn_ascend'][idx % 4]) as HistoricalCapsule['cameraMovement'],
        youtubeUrl: idx === 0 ? videoUrl : undefined
      }));
    }

    const norm = (characterName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm.includes('villa') || norm.includes('doroteo') || norm.includes('centauro')) {
      return [
        {
          id: 'cap-1',
          title: 'Toma de Ciudad Juárez (1911)',
          duration: 18,
          imageUrl: '/images/history/villa_toma_juarez_comic_1.png',
          script: narratorScript || 'Mayo de 1911. Francisco Villa y las fuerzas revolucionarias asaltan Ciudad Juárez, desmoronando la dictadura de Porfirio Díaz.',
          cameraMovement: 'zoom_in',
          youtubeUrl: videoUrl
        },
        {
          id: 'cap-2',
          title: 'Batalla de Zacatecas (1914)',
          duration: 20,
          imageUrl: '/images/history/villa_batalla_zacatecas_comic_2.png',
          script: '23 de junio de 1914. La legendaria División del Norte toma el Cerro de la Bufa en una épica carga de artillería e infantería, sellando el destino de Victoriano Huerta.',
          cameraMovement: 'pan_slow'
        },
        {
          id: 'cap-3',
          title: 'El Pacto de Xochimilco y Entrada a CDMX (1914)',
          duration: 16,
          imageUrl: '/images/history/villa_pacto_xochimilco_comic_3.png',
          script: 'Diciembre de 1914. Francisco Villa y Emiliano Zapata sellan el pacto de hermandad campesina en Xochimilco y desfilan al frente de sus tropas populares.',
          cameraMovement: 'gallop_sweep'
        },
        {
          id: 'cap-4',
          title: 'Incursión en Columbus y la Punitiva (1916)',
          duration: 18,
          imageUrl: '/images/history/villa_columbus_comic_4.png',
          script: 'Marzo de 1916. En respuesta a las agresiones y embargos, Villa cruza la frontera y ataca Columbus, burlando luego la expedición punitiva de Pershing.',
          cameraMovement: 'dawn_ascend'
        }
      ];
    }

    if (norm.includes('josefa') || norm.includes('corregidora')) {
      return [
        {
          id: 'cap-1',
          title: `${characterName}: La Conspiración Clandestina`,
          duration: durationSeconds || 15,
          imageUrl: '/images/history/josefa_conspiracion_comic_1.png',
          script: narratorScript || 'Santiago de Querétaro, agosto de 1810. Bajo la apariencia de tertulias literarias, en la Casa del Corregimiento se gesta la independencia.',
          cameraMovement: 'zoom_in',
          youtubeUrl: videoUrl
        },
        {
          id: 'cap-2',
          title: 'El Taconeo en la Soledad de la Alcoba',
          duration: 18,
          imageUrl: '/images/history/josefa_taconeo_comic_2.png',
          script: '15 de septiembre de 1810. Encerrada bajo llave por su esposo, Josefa no duda: tres golpes secos de sus zapatillas alertan al alcaide Ignacio Pérez.',
          cameraMovement: 'pan_slow'
        },
        {
          id: 'cap-3',
          title: 'La Cabalgata Nocturna por la Libertad',
          duration: 16,
          imageUrl: '/images/history/josefa_alerta_comic_3.png',
          script: 'Bajo el manto de la noche colonial, Ignacio Pérez cabalga sin tregua hacia San Miguel y Dolores, avisando a los líderes antes del cateo virreinal.',
          cameraMovement: 'gallop_sweep'
        },
        {
          id: 'cap-4',
          title: 'El Grito de Dolores y el Alba de la Patria',
          duration: 20,
          imageUrl: '/images/history/hidalgo_grito_comic_4.png',
          script: 'Madrugada del 16 de septiembre de 1810. Advertido a tiempo por Josefa, el cura Miguel Hidalgo repica la campana parroquial llamando a la libertad.',
          cameraMovement: 'dawn_ascend'
        }
      ];
    }

    if (norm.includes('hidalgo')) {
      return [
        {
          id: 'cap-1',
          title: 'Los Talleres Populares de Dolores',
          duration: 18,
          imageUrl: '/images/history/hidalgo_talleres.jpg',
          script: narratorScript || 'En lugar de limitarse a oficios religiosos, Hidalgo enseña alfarería, cultivo de la vid y telares a indígenas y mestizos para romper la dependencia virreinal.',
          cameraMovement: 'zoom_in',
          youtubeUrl: videoUrl
        },
        {
          id: 'cap-2',
          title: 'El Grito de Independencia en el Atrio',
          duration: 20,
          imageUrl: '/images/history/hidalgo_grito_comic_4.png',
          script: 'Con el repicar de la campana parroquial y el estandarte guadalupano en mano, Hidalgo llama al pueblo a sacudirse trescientos años de tiranía virreinal.',
          cameraMovement: 'dawn_ascend'
        },
        {
          id: 'cap-3',
          title: 'La Toma de la Alhóndiga de Granaditas',
          duration: 18,
          imageUrl: '/images/history/alhondiga_granaditas.jpg',
          script: 'Ante el refugio de las autoridades virreinales en la fortaleza granera, el minero El Pípila quema la puerta principal con una losa en la espalda permitiendo la victoria patriota.',
          cameraMovement: 'pan_slow'
        },
        {
          id: 'cap-4',
          title: 'El Decreto Histórico de Abolición de la Esclavitud',
          duration: 22,
          imageUrl: '/images/history/hidalgo_decreto_abolicion.jpg',
          script: '6 de diciembre de 1810. En Guadalajara, Don Miguel Hidalgo promulga el histórico bando que declara totalmente libres a los esclavos y suprime los tributos de castas en América.',
          cameraMovement: 'gallop_sweep'
        }
      ];
    }

    return [
      {
        id: 'cap-1',
        title: title || `${characterName}: Acontecimiento Clave`,
        duration: durationSeconds || 18,
        imageUrl: avatarImageUrl || '/images/history/francisco_villa_avatar.png',
        script: narratorScript || shortBio || `${characterName} transformó la historia con su liderazgo y convicción patriótica.`,
        cameraMovement: 'zoom_in',
        youtubeUrl: videoUrl
      }
    ];
  }, [moments, characterName, narratorScript, durationSeconds, videoUrl, title, avatarImageUrl, shortBio]);

  const activeCapsule = capsules[currentCapsuleIndex] || capsules[0];
  const activeVideoUrl = activeCapsule?.youtubeUrl || videoUrl || '';
  const embedUrl = activeVideoUrl ? getYouTubeEmbedUrl(activeVideoUrl) : '';

  // Manejo de la locución en primera/tercera persona con motor neural latino y dicción perfecta
  const speakNarrator = () => {
    if (isAudioMuted || typeof window === 'undefined') return;
    audioCtrlRef.current?.stop();
    stopAllIskoolAudio();
    
    playUniversalIskoolVoice({
      text: activeCapsule.script,
      characterName: characterName || 'Narrador Histórico',
      role: 'narrator',
      narratorMode: 'epic_chronist',
      rate: 0.94,
      onStart: () => {},
      onEnd: () => {},
      onError: (err) => console.warn('Error en narración cinematográfica:', err)
    }).then(ctrl => {
      audioCtrlRef.current = ctrl;
    });
  };

  const handleStartPlay = () => {
    setIsPlaying(true);
    setProgress(0);
    // Eliminado el acorde sintetizado para una experiencia acústica limpia y pura con la voz del narrador
    speakNarrator();

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const stepMs = 100;
    const totalMs = activeCapsule.duration * 1000;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + (stepMs / totalMs) * 100;
        if (next >= 100) {
          clearInterval(progressIntervalRef.current!);
          setIsPlaying(false);
          return 100;
        }
        return next;
      });
    }, stepMs);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    audioCtrlRef.current?.stop();
    stopAllIskoolAudio();
  };

  const handleRestart = () => {
    handlePause();
    setProgress(0);
    setTimeout(() => {
      handleStartPlay();
    }, 150);
  };

  // Limpiar timers y locución al desmontar o cambiar cápsula
  useEffect(() => {
    handlePause();
    setProgress(0);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      audioCtrlRef.current?.stop();
      stopAllIskoolAudio();
    };
  }, [currentCapsuleIndex]);

  // Selección de animaciones de cámara Ken Burns
  const getKenBurnsAnimation = () => {
    if (!isPlaying) {
      return { scale: 1, x: 0, y: 0 };
    }
    // En modo 'fit' (100% Texto Visible), movimiento sutil que jamás corta bordes ni textos
    if (framingMode === 'fit') {
      return { scale: [1, 1.03], y: [0, -3] };
    }
    switch (activeCapsule.cameraMovement) {
      case 'zoom_in':
        return { scale: [1, 1.14], x: [0, -8], y: [0, -6] };
      case 'pan_slow':
        return { scale: [1.08, 1.16], x: [-12, 12], y: [4, -4] };
      case 'gallop_sweep':
        return { scale: [1.05, 1.15], x: [15, -15], y: [-5, 5] };
      case 'dawn_ascend':
        return { scale: [1.02, 1.18], y: [10, -12], x: [0, 4] };
      default:
        return { scale: [1, 1.12] };
    }
  };

  return (
    <div className={`flex flex-col gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Cabecera de la Cápsula Cinematográfica */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <Film className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-100 uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-[11px] text-amber-400/70">
              4 Cápsulas narradas con movimiento cinemático (Google Flow / Ken Burns)
            </p>
          </div>
        </div>

        {/* Selector de Modo: Flow Cinemático vs Documental y Opciones de Visualización */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Alternar Encuadre Completo / Sin Cortes de Texto */}
          <button
            type="button"
            onClick={() => setFramingMode(prev => prev === 'fit' ? 'fill' : 'fit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              framingMode === 'fit'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/20'
            }`}
            title={framingMode === 'fit' ? 'Texto 100% visible sin recortes (Activo)' : 'Llenar pantalla completa'}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{framingMode === 'fit' ? 'Texto 100% Visible' : 'Llenar Pantalla'}</span>
          </button>

          {/* Alternar Subtítulos de Alta Visibilidad */}
          <button
            type="button"
            onClick={() => setShowOnScreenSubtitles(!showOnScreenSubtitles)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showOnScreenSubtitles
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/10 hover:bg-white/20 text-white/50 border-white/20'
            }`}
            title="Subtítulos en pantalla"
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Subtítulos</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'cinematic_flow' ? 'external_video' : 'cinematic_flow')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Alternar entre animación interactiva o documental"
          >
            {viewMode === 'cinematic_flow' ? <Tv className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            <span>{viewMode === 'cinematic_flow' ? 'Ver Documental' : 'Ver Flow Cinemático'}</span>
          </button>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{activeCapsule.duration}s</span>
          </span>
        </div>
      </div>

      {/* Visor de Video Cinematográfico */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black aspect-video max-h-[440px] flex items-center justify-center">
        {viewMode === 'external_video' && embedUrl ? (
          <iframe
            src={embedUrl}
            title={activeCapsule.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        ) : (
          /* ================= PLAYER FLOW CINEMÁTICO (KEN BURNS + PARTICULAS) ================= */
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-slate-950 select-none">
            {/* Fondo ambiental desenfocado cinemático (evita bordes muertos en modo fit) */}
            {framingMode === 'fit' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src={activeCapsule.imageUrl}
                  alt=""
                  className="w-full h-full object-cover filter blur-2xl opacity-30 scale-110"
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>
            )}

            {/* Imagen Ilustrada con Cámara Dinámica Ken Burns */}
            <motion.img 
              key={`${activeCapsule.id}-${isPlaying}-${framingMode}`}
              src={activeCapsule.imageUrl} 
              alt={activeCapsule.title}
              animate={getKenBurnsAnimation()}
              transition={{
                duration: activeCapsule.duration,
                ease: 'linear'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (avatarImageUrl && !target.src.includes(avatarImageUrl)) {
                  target.src = avatarImageUrl;
                } else if (!target.src.includes('francisco_villa_avatar.png')) {
                  target.src = '/images/history/francisco_villa_avatar.png';
                }
              }}
              className={`z-10 filter contrast-105 brightness-95 transition-all select-none ${
                framingMode === 'fit' 
                  ? 'w-auto h-auto max-w-full max-h-[420px] object-contain rounded-xl border border-amber-500/25 shadow-2xl p-1' 
                  : 'w-full h-full object-cover'
              }`}
            />

            {/* Viñeta Cinematográfica (Solo en modo fill para no oscurecer textos en modo fit) */}
            {framingMode === 'fill' && (
              <>
                <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/80 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-6 bg-black/90 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/90 pointer-events-none" />
              </>
            )}

            {/* Partículas de Polvo Dorado y Brillo Ambiental (Google Flow) */}
            <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none animate-pulse" />

            {/* Overlay Informativo Superior (Discreto y sin bloquear textos de encabezado) */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/80 border border-amber-500/40 text-[10px] font-black uppercase text-amber-300 tracking-wider backdrop-blur-md shadow-md">
                  Cápsula {currentCapsuleIndex + 1} de {capsules.length}
                </span>
                <span className="text-xs font-bold text-amber-100/90 font-serif drop-shadow-md">
                  {activeCapsule.title}
                </span>
              </div>
            </div>

            {/* Subtítulos Dinámicos de Alta Visibilidad dentro del Player */}
            {showOnScreenSubtitles && activeCapsule.script && (
              <div className="absolute bottom-14 left-4 right-4 z-20 flex justify-center pointer-events-none">
                <div className="max-w-2xl px-3.5 py-1.5 rounded-xl bg-black/85 border border-amber-500/40 backdrop-blur-md shadow-2xl text-center">
                  <p className="text-xs sm:text-sm font-serif font-bold text-amber-100 italic leading-snug drop-shadow-md">
                    "{activeCapsule.script}"
                  </p>
                </div>
              </div>
            )}

            {/* Botón Central Flotante de Play cuando está en Pausa */}
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="button"
                onClick={handleStartPlay}
                className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-2 border-white transform hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Reproducir Cápsula"
              >
                <Play className="w-8 h-8 fill-slate-950 ml-1 text-slate-950" />
              </motion.button>
            )}

            {/* Barra de Progreso Inferior Cinematográfica */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-2">
              <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={isPlaying ? handlePause : handleStartPlay}
                    className="p-1 rounded-lg bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="p-1 rounded-lg bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                    title="Reiniciar cápsula"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className="p-1 rounded-lg bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                    title={isAudioMuted ? 'Activar audio' : 'Silenciar'}
                  >
                    {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="font-mono text-[10px] text-amber-300/80">
                  {Math.round((progress / 100) * activeCapsule.duration)}s / {activeCapsule.duration}s
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtítulo / Guion Narrado de la Cápsula */}
      <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              Guion Narrativo Sincronizado:
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Cápsula {currentCapsuleIndex + 1}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-100/90 font-serif leading-relaxed italic">
            "{activeCapsule.script}"
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isPlaying) {
              handlePause();
            } else {
              handleStartPlay();
            }
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            isPlaying 
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
              : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isPlaying ? 'Pausar Cinemática' : 'Reproducir Cinemática'}</span>
        </button>
      </div>

      {/* Selector de las 4 Cápsulas de Momentos con Miniaturas Responsivas */}
      <div className="space-y-2 pt-1">
        <h5 className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
          4 Cápsulas Cinematográficas Disponibles (Selecciona para Reproducir):
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {capsules.map((cap, idx) => {
            const isSel = idx === currentCapsuleIndex;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => {
                  setCurrentCapsuleIndex(idx);
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSel 
                    ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/10 scale-[1.01]' 
                    : 'bg-black/40 hover:bg-black/60 border-amber-500/20 text-slate-300'
                }`}
              >
                {/* Miniatura Ilustrada de Cada Cápsula */}
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-amber-500/30 bg-slate-950">
                  <img 
                    src={cap.imageUrl} 
                    alt={cap.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (avatarImageUrl && !target.src.includes(avatarImageUrl)) {
                        target.src = avatarImageUrl;
                      } else if (!target.src.includes('francisco_villa_avatar.png')) {
                        target.src = '/images/history/francisco_villa_avatar.png';
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${isSel ? 'text-amber-200' : 'text-slate-200'}`}>
                    {idx + 1}. {cap.title}
                  </p>
                  <p className="text-[10px] text-amber-400/70 font-mono">
                    {cap.duration}s de video flow
                  </p>
                </div>

                <Play className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
