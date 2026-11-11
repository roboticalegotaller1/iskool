"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  deriveTeacherRemoteCredentials,
  dispatchPocketRemoteCommand,
} from '@/utils/pocketRemoteBridge';
import {
  Smartphone,
  Play,
  Mic,
  Clock,
  Volume2,
  CheckCircle2,
  Monitor,
  ShieldCheck,
  Sparkles,
  Wifi,
  UserCheck,
} from 'lucide-react';

interface RemoteDialogueLine {
  id: string;
  speaker: 'avatar' | 'student';
  text: string;
  translationEs?: string;
}

interface RemoteCcqQuestion {
  id: string;
  questionEs: string;
  expectedAnswer: string;
}

function MobileRemoteContent() {
  const searchParams = useSearchParams();

  const teacherId = searchParams.get('teacherId') || 'tch-ibime-01';
  const teacherEmail = searchParams.get('email') || 'docente.idiomas@ibime.edu.mx';
  const teacherName = searchParams.get('name') || 'Prof. Titular de Idiomas';
  const campusName = searchParams.get('campus') || 'Campus Montes';
  const urlPin = searchParams.get('pin') || '';
  const urlToken = searchParams.get('token') || '';

  const derived = deriveTeacherRemoteCredentials(teacherId, teacherEmail, campusName);
  const effectivePin = urlPin
    ? urlPin.length === 6 && !urlPin.includes('-')
      ? `${urlPin.slice(0, 3)}-${urlPin.slice(3, 6)}`
      : urlPin
    : derived.pin;
  const effectiveToken = urlToken || derived.pairingToken;

  const [deviceId] = useState<string>(
    () => `mob-${teacherId.slice(0, 6)}-${Math.random().toString(36).slice(2, 6)}`
  );
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastCommandSent, setLastCommandSent] = useState<string>('Vinculado por QR con Pizarrón');
  const [selectedLineIdx, setSelectedLineIdx] = useState<number>(0);
  const [activeGesture, setActiveGesture] = useState<string>('welcome');
  const [activeCcqIdx, setActiveCcqIdx] = useState<number>(0);

  // Estado sincronizado de la lección activa en el Pizarrón
  const [lessonTitle, setLessonTitle] = useState<string>('Ordering at a Café & Pleasantries');
  const [avatarName, setAvatarName] = useState<string>('Claire');
  const [avatarSrc, setAvatarSrc] = useState<string>('/images/languages/3d/mentor_female_3d.webp');
  const [defaultSpeed, setDefaultSpeed] = useState<number>(0.85);
  const [dialogue, setDialogue] = useState<RemoteDialogueLine[]>([
    {
      id: 'd-1',
      speaker: 'avatar',
      text: 'Good morning! Welcome to the Royal Orchard Café. What would you like today?',
      translationEs: '¡Buenos días! Bienvenido al Café Royal Orchard. ¿Qué le gustaría hoy?',
    },
    {
      id: 'd-2',
      speaker: 'student',
      text: 'Hello! I would like a warm cappuccino and a fresh blueberry muffin, please.',
      translationEs: '¡Hola! Me gustaría un capuchino caliente y un panqué fresco de arándanos, por favor.',
    },
    {
      id: 'd-3',
      speaker: 'avatar',
      text: 'Excellent choice! Would you prefer oat milk or regular whole milk for your beverage?',
      translationEs: '¡Excelente elección! ¿Prefiere leche de avena o leche entera normal para su bebida?',
    },
  ]);

  const [ccqQuestions, setCcqQuestions] = useState<RemoteCcqQuestion[]>([
    {
      id: 'ccq-1',
      questionEs: '1. ¿"I would like" es formal/cortés o demasiado informal?',
      expectedAnswer: 'Formal y cortés (mucho más educado que decir "I want").',
    },
    {
      id: 'ccq-2',
      questionEs: '2. ¿Estamos pidiendo ahora mismo en el café o en el pasado?',
      expectedAnswer: 'Ahora mismo (presente conversacional de cortesía).',
    },
  ]);

  // 1. Handshake automático al abrir el QR desde el celular + sincronización continua
  useEffect(() => {
    const cleanId = teacherId.trim().toLowerCase();

    // Leer snapshot local inmediato si existe
    try {
      const localSnapRaw = localStorage.getItem(`iskool_pocket_remote_snapshot_${cleanId}`);
      if (localSnapRaw) {
        const snap = JSON.parse(localSnapRaw);
        if (snap.lessonTitle) setLessonTitle(snap.lessonTitle);
        if (snap.avatarName) setAvatarName(snap.avatarName);
        if (snap.avatarSrc) setAvatarSrc(snap.avatarSrc);
        if (snap.defaultSpeed) setDefaultSpeed(snap.defaultSpeed);
        if (Array.isArray(snap.dialogue) && snap.dialogue.length > 0) setDialogue(snap.dialogue);
        if (Array.isArray(snap.ccqQuestions) && snap.ccqQuestions.length > 0)
          setCcqQuestions(snap.ccqQuestions);
        if (typeof snap.selectedLineIdx === 'number') setSelectedLineIdx(snap.selectedLineIdx);
      }
    } catch {
      // Ignorar si no hay snapshot local
    }

    // Enviar handshake CONNECT_DEVICE
    dispatchPocketRemoteCommand({
      teacherId,
      teacherEmail,
      teacherName,
      pin: effectivePin,
      type: 'CONNECT_DEVICE',
      deviceId,
      deviceLabel: `Celular de ${teacherName}`,
      payload: {
        deviceLabel: `Celular de ${teacherName}`,
      },
    }).then(() => setIsConnected(true));

    // Escuchar actualizaciones del pizarrón por BroadcastChannel y polling ligero
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`iskool_pocket_remote_${cleanId}`);
      bc.onmessage = (ev) => {
        const msg = ev.data;
        if (msg?.type === 'SYNC_LESSON_STATE' && msg.payload) {
          const snap = msg.payload;
          if (snap.lessonTitle) setLessonTitle(snap.lessonTitle);
          if (snap.avatarName) setAvatarName(snap.avatarName);
          if (snap.avatarSrc) setAvatarSrc(snap.avatarSrc);
          if (Array.isArray(snap.dialogue) && snap.dialogue.length > 0) setDialogue(snap.dialogue);
          if (Array.isArray(snap.ccqQuestions) && snap.ccqQuestions.length > 0)
            setCcqQuestions(snap.ccqQuestions);
        }
      };
    } catch {
      // Ignorar si no soporta BroadcastChannel
    }

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/languages/pocket-remote?teacherId=${encodeURIComponent(cleanId)}&since=0`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.activeLessonSnapshot) {
            const snap = data.activeLessonSnapshot;
            if (snap.lessonTitle) setLessonTitle(snap.lessonTitle);
            if (snap.avatarName) setAvatarName(snap.avatarName);
            if (snap.avatarSrc) setAvatarSrc(snap.avatarSrc);
            if (Array.isArray(snap.dialogue) && snap.dialogue.length > 0)
              setDialogue(snap.dialogue);
            if (Array.isArray(snap.ccqQuestions) && snap.ccqQuestions.length > 0)
              setCcqQuestions(snap.ccqQuestions);
          }
        }
      } catch {
        // Seguir operando con estado local
      }
    }, 2000);

    return () => {
      if (bc) bc.close();
      clearInterval(pollInterval);
    };
  }, [teacherId, teacherEmail, teacherName, effectivePin, deviceId]);

  const activeLine = dialogue[selectedLineIdx] || dialogue[0];
  const activeCcq = ccqQuestions[activeCcqIdx] || ccqQuestions[0];

  const handleSendCommand = async (
    type:
      | 'PLAY_NORMAL'
      | 'PLAY_SLOW'
      | 'CHORAL_PRACTICE'
      | 'START_PAIR_TIMER'
      | 'SELECT_LINE'
      | 'SET_GESTURE'
      | 'TOGGLE_PIZARRA',
    label: string,
    extraPayload?: Record<string, any>
  ) => {
    setLastCommandSent(label);
    await dispatchPocketRemoteCommand({
      teacherId,
      teacherEmail,
      teacherName,
      pin: effectivePin,
      type,
      deviceId,
      deviceLabel: `Celular de ${teacherName}`,
      payload: {
        lineIndex: selectedLineIdx,
        text: activeLine?.text,
        ...extraPayload,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-900 flex flex-col items-center justify-start py-4 px-3 sm:py-8">
      <div className="w-full max-w-[430px] rounded-[38px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 space-y-3">
        <div className="bg-white rounded-[30px] p-4 sm:p-5 space-y-4">
          {/* Barra de Estado Móvil */}
          <div className="flex items-center justify-between text-[11px] font-black text-slate-500 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1 text-emerald-700">
              <Wifi className="w-3.5 h-3.5" />
              <span>Canal Docente Cifrado</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px]">
              iSkool Remote QR
            </span>
            <span>PIN: {effectivePin}</span>
          </div>

          {/* Tarjeta de Cuenta del Profesor Vinculada */}
          <div
            data-testid="mobile-remote-teacher-badge"
            className="p-3 rounded-2xl bg-slate-900 text-white space-y-1.5 shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black truncate">{teacherName}</p>
                  <p className="text-[11px] text-slate-300 truncate">{teacherEmail}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isConnected ? 'Conectada' : 'Vinculando'}
              </span>
            </div>

            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>Sede: {campusName}</span>
              <span className="text-amber-300 font-mono">{effectiveToken}</span>
            </div>
          </div>

          {/* Vista Compacta de la Frase Activa en el Pizarrón */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={avatarSrc}
                  alt={avatarName}
                  className="w-9 h-9 rounded-xl object-cover object-top border border-slate-300"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                    Proyectado en Pizarrón ({selectedLineIdx + 1}/{dialogue.length})
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 block truncate max-w-[210px]">
                    {lessonTitle}
                  </span>
                </div>
              </div>
            </div>

            <p
              data-testid="mobile-remote-active-phrase"
              className="text-sm font-black text-slate-900 leading-snug bg-white p-2.5 rounded-xl border border-slate-200"
            >
              “{activeLine?.text}”
            </p>

            {/* Selector Táctil de Frase */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {dialogue.map((d, idx) => (
                <button
                  key={d.id || idx}
                  type="button"
                  data-testid={`mobile-remote-phrase-${idx + 1}`}
                  onClick={() => {
                    setSelectedLineIdx(idx);
                    handleSendCommand(
                      'SELECT_LINE',
                      `Frase ${idx + 1} seleccionada en el Pizarrón`,
                      { lineIndex: idx, text: d.text }
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer border transition-all ${
                    selectedLineIdx === idx
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Frase {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* LOS 4 BOTONES TÁCTILES GIGANTES ZERO-TECH */}
          <div className="space-y-2.5">
            {/* Botón 1: Hacer Hablar a Prof. 3D */}
            <button
              type="button"
              data-testid="mobile-btn-play-normal"
              onClick={() =>
                handleSendCommand(
                  'PLAY_NORMAL',
                  `🔊 Hablando en Pizarrón: Prof. ${avatarName} 3D (${defaultSpeed}x)`,
                  { rate: defaultSpeed }
                )
              }
              className="w-full py-3.5 px-4 rounded-2xl bg-[#059669] hover:bg-emerald-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
            >
              <Play className="w-6 h-6 fill-current shrink-0" />
              <div>
                <span className="block leading-tight">
                  Hacer Hablar a Prof. {avatarName} 3D
                </span>
                <span className="text-[11px] font-semibold text-emerald-100">
                  Voz nativa a velocidad normal ({defaultSpeed}x)
                </span>
              </div>
            </button>

            {/* Botón 2: Repetir Frase en Cámara Lenta */}
            <button
              type="button"
              data-testid="mobile-btn-play-slow"
              onClick={() =>
                handleSendCommand(
                  'PLAY_SLOW',
                  `🐢 Repitiendo en Cámara Lenta (0.68x) en el Pizarrón`,
                  { rate: 0.68 }
                )
              }
              className="w-full py-3.5 px-4 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
            >
              <span className="text-xl shrink-0">🐢</span>
              <div>
                <span className="block leading-tight">Repetir Frase en Cámara Lenta</span>
                <span className="text-[11px] font-semibold text-blue-100">
                  Articulación silábica pausada (0.68x)
                </span>
              </div>
            </button>

            {/* Botón 3: Activar Práctica Coral del Salón */}
            <button
              type="button"
              data-testid="mobile-btn-choral"
              onClick={() =>
                handleSendCommand(
                  'CHORAL_PRACTICE',
                  '🎙️ Práctica Coral del Salón activada en el Pizarrón'
                )
              }
              className="w-full py-3.5 px-4 rounded-2xl bg-[#7C3AED] hover:bg-violet-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
            >
              <Mic className="w-6 h-6 shrink-0" />
              <div>
                <span className="block leading-tight">Activar Práctica Coral del Salón</span>
                <span className="text-[11px] font-semibold text-violet-100">
                  Escucha y califica al grupo en vivo
                </span>
              </div>
            </button>

            {/* Botón 4: Lanzar Cronómetro 3 Min en Parejas */}
            <button
              type="button"
              data-testid="mobile-btn-pair-timer"
              onClick={() =>
                handleSendCommand(
                  'START_PAIR_TIMER',
                  '⏱️ Pizarrón 36pt + Cronómetro 3 Min en Parejas activado'
                )
              }
              className="w-full py-3.5 px-4 rounded-2xl bg-[#D97706] hover:bg-amber-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
            >
              <Clock className="w-6 h-6 shrink-0" />
              <div>
                <span className="block leading-tight">
                  Lanzar Cronómetro 3 Min en Parejas
                </span>
                <span className="text-[11px] font-semibold text-amber-100">
                  Proyecta reloj y frases guía a 36pt en el pizarrón
                </span>
              </div>
            </button>
          </div>

          {/* Disparadores Rápidos de Gestos 3D (60 FPS) + Pantalla Completa */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <span>Gestos en Vivo del Avatar 3D:</span>
              <button
                type="button"
                data-testid="mobile-btn-toggle-pizarra"
                onClick={() =>
                  handleSendCommand(
                    'TOGGLE_PIZARRA',
                    '📺 Conmutando Modo Pizarrón Gigante 36pt'
                  )
                }
                className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Pizarrón 36pt</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'welcome', icon: '👋', label: 'Saludo' },
                { id: 'explain', icon: '☝️', label: 'Explicar' },
                { id: 'exclaim', icon: '🎉', label: '¡Éxito!' },
                { id: 'inquire', icon: '🤔', label: 'Pregunta' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setActiveGesture(g.id);
                    handleSendCommand(
                      'SET_GESTURE',
                      `Gesto 3D enviado: ${g.icon} ${g.label}`,
                      { gesture: g.id }
                    );
                  }}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                    activeGesture === g.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Confirmación en Vivo del Último Comando Ejecutado */}
          <div
            data-testid="mobile-remote-status-banner"
            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{lastCommandSent}</span>
          </div>

          {/* Tarjeta CELTA de Bolsillo en el Celular */}
          {activeCcq && (
            <div className="p-3.5 rounded-2xl bg-[#FEF9E7] border-2 border-amber-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                  💡 Tarjeta CELTA de Bolsillo (CCQs)
                </span>
                {ccqQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveCcqIdx((prev) => (prev + 1) % ccqQuestions.length)}
                    className="text-[11px] font-black text-amber-800 underline cursor-pointer"
                  >
                    Siguiente CCQ ({activeCcqIdx + 1}/{ccqQuestions.length})
                  </button>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Pregunta al grupo: {activeCcq.questionEs}
              </p>
              <p className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Respuesta: {activeCcq.expectedAnswer}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ControlRemotoQrPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-6 text-sm font-black">
          Vinculando Control Remoto Docente por QR...
        </div>
      }
    >
      <MobileRemoteContent />
    </Suspense>
  );
}

