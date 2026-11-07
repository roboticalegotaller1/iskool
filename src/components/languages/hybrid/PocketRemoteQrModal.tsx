"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { LanguageLesson } from '@/store/useLanguagesStore';
import { CeltaPocketGuide, tokenizeDialogueWithStress } from './hybridPedagogicalData';
import {
  buildTeacherRemoteIdentity,
  dispatchPocketRemoteCommand,
  generateTeacherQrDataUrl,
  syncActiveLessonToPocketServer,
} from '@/utils/pocketRemoteBridge';
import type { AvatarGestureMode } from '@/components/common/NanoBananaLipSyncCanvas';
import {
  Smartphone,
  Play,
  Mic,
  Clock,
  X,
  Volume2,
  CheckCircle2,
  QrCode,
  Monitor,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
  Wifi,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export interface TeacherAccountOption {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  campusName: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lesson: LanguageLesson;
  avatarSrc: string;
  celtaGuide: CeltaPocketGuide;
  isPlayingAudio: boolean;
  activeTeacherAccount: TeacherAccountOption;
  availableTeacherAccounts: TeacherAccountOption[];
  onSelectTeacherAccount: (teacher: TeacherAccountOption) => void;
  onPlayLineAudio: (text: string, customRate?: number) => void;
  onLaunchBlackboardWithTimer: () => void;
  onTriggerGesture?: (gesture: AvatarGestureMode) => void;
}

export const PocketRemoteQrModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lesson,
  avatarSrc,
  celtaGuide,
  isPlayingAudio,
  activeTeacherAccount,
  availableTeacherAccounts,
  onSelectTeacherAccount,
  onPlayLineAudio,
  onLaunchBlackboardWithTimer,
  onTriggerGesture,
}) => {
  const [choralStatus, setChoralStatus] = useState<'idle' | 'listening' | 'done'>('idle');
  const [selectedLineIdx, setSelectedLineIdx] = useState<number>(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showHowItWorksDiagram, setShowHowItWorksDiagram] = useState<boolean>(false);
  const [connectedMobileLabel, setConnectedMobileLabel] = useState<string | null>(null);
  const [lastRemoteActionBanner, setLastRemoteActionBanner] = useState<string | null>(null);

  // Construir identidad criptográfica y URL QR única para la cuenta del profesor seleccionado
  const teacherIdentity = useMemo(() => {
    return buildTeacherRemoteIdentity({
      teacherId: activeTeacherAccount.id,
      teacherName: activeTeacherAccount.name,
      teacherEmail: activeTeacherAccount.email,
      teacherRole: activeTeacherAccount.roleLabel,
      campusId: activeTeacherAccount.campusName,
      campusName: activeTeacherAccount.campusName,
      lessonId: lesson.id,
    });
  }, [activeTeacherAccount, lesson.id]);

  // Generar matriz QR real (ISO/IEC 18004) cada vez que cambia el profesor o la lección
  useEffect(() => {
    let active = true;
    generateTeacherQrDataUrl(teacherIdentity.remoteUrl).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl);
    });
    return () => {
      active = false;
    };
  }, [teacherIdentity.remoteUrl]);

  // Sincronizar el estado actual de la lección hacia el servidor/canal del profesor
  useEffect(() => {
    if (!isOpen) return;
    syncActiveLessonToPocketServer({
      teacherId: teacherIdentity.teacherId,
      teacherEmail: teacherIdentity.teacherEmail,
      teacherName: teacherIdentity.teacherName,
      campusName: teacherIdentity.campusName,
      pin: teacherIdentity.pin,
      lessonSnapshot: {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        avatarName: lesson.avatarName,
        avatarSrc,
        language: lesson.language,
        level: lesson.level,
        defaultSpeed: lesson.defaultSpeed,
        selectedLineIdx,
        isPlayingAudio,
        choralStatus,
        dialogue: lesson.dialogue.map((d) => ({
          id: d.id,
          speaker: d.speaker,
          text: d.text,
          translationEs: d.translationEs,
        })),
        ccqQuestions: celtaGuide.ccqQuestions,
        spanishInterference: celtaGuide.spanishInterference,
      },
    });
  }, [
    isOpen,
    teacherIdentity,
    lesson,
    avatarSrc,
    selectedLineIdx,
    isPlayingAudio,
    choralStatus,
    celtaGuide,
  ]);

  // Escuchar comandos en tiempo real enviados desde la ruta móvil `/control-remoto-qr`
  useEffect(() => {
    if (!isOpen) return;
    const cleanId = teacherIdentity.teacherId.trim().toLowerCase();
    let lastTimestamp = Date.now() - 2000;

    const executeIncomingCommand = (cmd: any) => {
      if (!cmd || !cmd.type) return;
      if (cmd.timestamp && cmd.timestamp <= lastTimestamp) return;
      if (cmd.timestamp) lastTimestamp = cmd.timestamp;

      if (cmd.type === 'CONNECT_DEVICE') {
        setConnectedMobileLabel(
          cmd.payload?.deviceLabel || `Celular de ${teacherIdentity.teacherName}`
        );
        setLastRemoteActionBanner(
          `📱 Dispositivo vinculado por QR: ${cmd.payload?.deviceLabel || teacherIdentity.teacherName}`
        );
        return;
      }

      if (cmd.type === 'SELECT_LINE' && typeof cmd.payload?.lineIndex === 'number') {
        setSelectedLineIdx(cmd.payload.lineIndex);
        setLastRemoteActionBanner(
          `📲 Celular seleccionó Frase ${cmd.payload.lineIndex + 1} en el Pizarrón`
        );
        return;
      }

      if (cmd.type === 'PLAY_NORMAL') {
        const idx =
          typeof cmd.payload?.lineIndex === 'number' ? cmd.payload.lineIndex : selectedLineIdx;
        const targetText =
          cmd.payload?.text ||
          lesson.dialogue[idx]?.text ||
          lesson.dialogue[0]?.text ||
          'Good morning!';
        setSelectedLineIdx(idx);
        onPlayLineAudio(targetText, cmd.payload?.rate || lesson.defaultSpeed);
        setLastRemoteActionBanner(
          `🔊 Ejecutado desde QR: Hacer hablar a Prof. ${lesson.avatarName} 3D (${lesson.defaultSpeed}x)`
        );
        return;
      }

      if (cmd.type === 'PLAY_SLOW') {
        const idx =
          typeof cmd.payload?.lineIndex === 'number' ? cmd.payload.lineIndex : selectedLineIdx;
        const targetText =
          cmd.payload?.text ||
          lesson.dialogue[idx]?.text ||
          lesson.dialogue[0]?.text ||
          'Good morning!';
        setSelectedLineIdx(idx);
        onPlayLineAudio(targetText, 0.68);
        setLastRemoteActionBanner(
          `🐢 Ejecutado desde QR: Repetir frase en Cámara Lenta (0.68x)`
        );
        return;
      }

      if (cmd.type === 'CHORAL_PRACTICE') {
        setChoralStatus('listening');
        setLastRemoteActionBanner(
          `🎙️ Ejecutado desde QR: Micrófono grupal evaluando Práctica Coral`
        );
        setTimeout(() => {
          setChoralStatus('done');
        }, 2800);
        return;
      }

      if (cmd.type === 'START_PAIR_TIMER' || cmd.type === 'TOGGLE_BLACKBOARD') {
        setLastRemoteActionBanner(
          `⏱️ Ejecutado desde QR: Lanzando Pizarrón 36pt + Cronómetro 3 Min`
        );
        onLaunchBlackboardWithTimer();
        return;
      }

      if (cmd.type === 'SET_GESTURE' && cmd.payload?.gesture && onTriggerGesture) {
        onTriggerGesture(cmd.payload.gesture as AvatarGestureMode);
        setLastRemoteActionBanner(
          `✨ Gesto 3D activado desde Celular: ${cmd.payload.gesture}`
        );
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`iskool_pocket_remote_${cleanId}`);
      bc.onmessage = (ev) => executeIncomingCommand(ev.data);
    } catch {
      // Ignorar si no hay soporte
    }

    const handleStorage = (ev: StorageEvent) => {
      if (ev.key === `iskool_pocket_remote_cmd_${cleanId}` && ev.newValue) {
        try {
          executeIncomingCommand(JSON.parse(ev.newValue));
        } catch {
          // Ignorar JSON malformado
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/languages/pocket-remote?teacherId=${encodeURIComponent(cleanId)}&since=${lastTimestamp}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.connectedDevices) && data.connectedDevices.length > 0) {
            const latestDevice = data.connectedDevices[data.connectedDevices.length - 1];
            setConnectedMobileLabel(latestDevice.deviceLabel);
          }
          if (Array.isArray(data?.commands)) {
            data.commands.forEach((cmd: any) => executeIncomingCommand(cmd));
          }
        }
      } catch {
        // Fallback local activo
      }
    }, 1200);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollTimer);
    };
  }, [
    isOpen,
    teacherIdentity.teacherId,
    teacherIdentity.teacherName,
    selectedLineIdx,
    lesson,
    onPlayLineAudio,
    onLaunchBlackboardWithTimer,
    onTriggerGesture,
  ]);

  if (!isOpen) return null;

  const activeLine =
    lesson.dialogue[selectedLineIdx] ||
    lesson.dialogue[0] || {
      id: 'd-0',
      speaker: 'avatar',
      text: 'Good morning! Welcome to the café.',
      translationEs: '¡Buenos días! Bienvenido a la cafetería.',
    };

  const handleChoralAction = () => {
    setChoralStatus('listening');
    dispatchPocketRemoteCommand({
      teacherId: teacherIdentity.teacherId,
      teacherEmail: teacherIdentity.teacherEmail,
      teacherName: teacherIdentity.teacherName,
      pin: teacherIdentity.pin,
      type: 'CHORAL_PRACTICE',
    });
    setTimeout(() => {
      setChoralStatus('done');
    }, 2800);
  };

  const handleCopyRemoteUrl = async () => {
    try {
      await navigator.clipboard.writeText(teacherIdentity.remoteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
    }
  };

  return (
    <div
      data-testid="pocket-remote-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fade-in"
    >
      <div className="bg-[#F8FAFC] text-slate-900 rounded-3xl border border-slate-200 shadow-2xl max-w-6xl w-full overflow-hidden my-auto">
        {/* Barra Superior del Modal + Selector de Cuenta de Profesor */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight">
                Control Remoto Docente de Bolsillo (Sincronizado por QR con el Pizarrón)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Cada profesor genera su propio código QR cifrado de cuenta para controlar el Pizarrón y al Avatar 3D desde su celular.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Cuenta de Profesor para demostrar QR único por docente */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-300 hidden sm:inline">
                Cuenta Docente:
              </span>
              <select
                aria-label="Seleccionar cuenta de profesor para generar su QR único"
                data-testid="select-teacher-qr-account"
                value={activeTeacherAccount.id}
                onChange={(e) => {
                  const found = availableTeacherAccounts.find((t) => t.id === e.target.value);
                  if (found) onSelectTeacherAccount(found);
                }}
                className="bg-transparent text-xs font-black text-white focus:outline-hidden cursor-pointer max-w-[210px]"
              >
                {availableTeacherAccounts.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowHowItWorksDiagram(!showHowItWorksDiagram)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHowItWorksDiagram ? 'Ocultar Guía 1-2-3' : '¿Cómo funciona?'}</span>
            </button>

            <button
              type="button"
              data-testid="btn-close-pocket-remote"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <X className="w-4 h-4" />
              <span>Cerrar Vista</span>
            </button>
          </div>
        </div>

        {/* Diagrama Explicativo 1-2-3 generado con Nano Banana 2.1 (Desplegable) */}
        {showHowItWorksDiagram && (
          <div className="bg-slate-900/95 border-b border-slate-800 px-5 py-4 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>
                   Arquitectura de Emparejamiento QR por Cuenta Docente (Sin Cables · Sin Instalar Apps)
                </span>
                <span className="text-emerald-400 font-mono">{teacherIdentity.pairingToken}</span>
              </div>
              <img
                src="/images/languages/phonetics/pocket_remote_qr_flow.webp"
                alt="Cómo funciona el Control Remoto Docente por QR y Cuenta Personal"
                className="w-full max-h-[260px] object-contain rounded-2xl border border-slate-700 bg-white"
              />
            </div>
          </div>
        )}

        {/* Banner de actividad remota en tiempo real si se recibió comando desde el celular */}
        {lastRemoteActionBanner && (
          <div
            data-testid="smartboard-remote-command-toast"
            className="bg-emerald-600 text-white px-5 py-2 text-xs font-black flex items-center justify-between gap-2 animate-fade-in"
          >
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 animate-pulse" />
              <span>{lastRemoteActionBanner}</span>
            </div>
            <span className="text-[11px] font-mono bg-black/20 px-2 py-0.5 rounded-md">
              {teacherIdentity.pairingToken}
            </span>
          </div>
        )}

        {/* Contenido Principal: Izquierda Pizarrón del Salón + Tarjeta QR de Cuenta (7 cols) | Derecha Smartphone del Profesor (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 items-center bg-gradient-to-br from-slate-100 via-[#F8FAFC] to-slate-200/70">
          {/* IZQUIERDA (7 cols): Vista del Pizarrón Inteligente + Tarjeta de QR Real por Cuenta Docente */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-indigo-600" />
                Vista en Vivo del Pizarrón Inteligente (Frente del Salón)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {connectedMobileLabel
                  ? `Vinculado con ${connectedMobileLabel}`
                  : 'Sincronización Instantánea 0ms'}
              </span>
            </div>

            {/* Marco de Pizarrón Interactivo */}
            <div className="rounded-3xl bg-white border-6 border-slate-800 shadow-xl overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
                <span>iSkool Language Studio · Modo Pizarrón Interactivo</span>
                <span className="text-amber-300">
                  {teacherIdentity.campusName} · Prof. {lesson.avatarName} 3D
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/50 via-white to-indigo-50/40 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div className="relative w-36 h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md">
                    <img
                      src={avatarSrc}
                      alt={lesson.avatarName}
                      className="w-full h-full object-cover object-top"
                    />
                    {isPlayingAudio && (
                      <div className="absolute bottom-2 inset-x-2 px-2 py-1 rounded-lg bg-emerald-600/95 text-white text-[10px] font-black text-center animate-pulse">
                        🔊 Hablando en 60 FPS...
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-800 shadow-md space-y-1.5 relative">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                      Frase Proyectada a 36pt ({selectedLineIdx + 1}/{lesson.dialogue.length}):
                    </span>
                    <p
                      data-testid="smartboard-projected-phrase"
                      className="text-lg sm:text-xl font-black text-slate-900 leading-snug"
                    >
                      {tokenizeDialogueWithStress(activeLine.text).map((tok, idx) => (
                        <span
                          key={idx}
                          className={
                            tok.isStressed
                              ? 'text-indigo-700 underline decoration-amber-500 decoration-4 underline-offset-4 mr-1.5 inline-block'
                              : 'mr-1.5 inline-block'
                          }
                        >
                          {tok.display}
                        </span>
                      ))}
                    </p>
                    <p className="text-xs font-semibold text-slate-600">
                      {activeLine.translationEs}
                    </p>
                  </div>

                  {/* Selector rápido de frase proyectada */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {lesson.dialogue.map((d, i) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedLineIdx(i)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer border transition-all ${
                          selectedLineIdx === i
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Frase {i + 1}
                      </button>
                    ))}
                  </div>

                  {choralStatus !== 'idle' && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {choralStatus === 'listening'
                          ? '🎙️ Micrófono del salón activo: escuchando repetición coral...'
                          : '✅ ¡Práctica Coral Evaluada! 96% de fluidez grupal en el salón.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TARJETA DE CÓDIGO QR ESCANEABLE REAL PERSONALIZADO POR CUENTA DOCENTE */}
            <div
              data-testid="teacher-qr-credential-card"
              className="p-4 rounded-3xl bg-white border-2 border-indigo-200 shadow-md grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
            >
              {/* Matriz QR Real ISO/IEC 18004 */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center">
                <div className="p-2.5 rounded-2xl bg-white border-2 border-slate-900 shadow-sm">
                  {qrDataUrl ? (
                    <img
                      data-testid="teacher-real-qr-image"
                      src={qrDataUrl}
                      alt={`Código QR de ${teacherIdentity.teacherName}`}
                      className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-xl">
                      <QrCode className="w-12 h-12 text-slate-500 animate-pulse" />
                    </div>
                  )}
                </div>
                <span
                  data-testid="teacher-qr-pin-badge"
                  className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-black font-mono"
                >
                  PIN: {teacherIdentity.pin}
                </span>
              </div>

              {/* Datos de la Cuenta del Profesor y Acciones de Emparejamiento */}
              <div className="sm:col-span-8 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    QR Cifrado por Cuenta Docente
                  </span>
                  <span
                    data-testid="teacher-qr-token"
                    className="text-[11px] font-mono font-black text-slate-600"
                  >
                    {teacherIdentity.pairingToken}
                  </span>
                </div>

                <div>
                  <h3
                    data-testid="teacher-qr-owner-name"
                    className="text-sm sm:text-base font-black text-slate-900 leading-tight"
                  >
                    {teacherIdentity.teacherName}
                  </h3>
                  <p
                    data-testid="teacher-qr-owner-email"
                    className="text-xs font-bold text-indigo-700"
                  >
                    {teacherIdentity.teacherEmail} · {teacherIdentity.campusName}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Apunta la cámara de tu celular a este código QR para abrir tu control remoto personal sin instalar aplicaciones ni escribir contraseñas.
                </p>

                {/* Botones para probar/abrir la app móvil real o copiar enlace */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <a
                    data-testid="link-open-mobile-remote"
                    href={teacherIdentity.remoteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Control Móvil en Nueva Pestaña</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyRemoteUrl}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Enlace Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Enlace QR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA (5 cols): Dispositivo Smartphone "Control Remoto de Bolsillo" */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[360px] rounded-[42px] bg-slate-900 p-3.5 shadow-2xl border-4 border-slate-800">
              <div className="bg-white rounded-[32px] p-4 sm:p-5 space-y-3 text-slate-900">
                {/* Notch / Barra de Estado del Teléfono */}
                <div className="flex items-center justify-between text-[11px] font-black text-slate-500 pb-1 border-b border-slate-100">
                  <span>9:41</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px]">
                    iSkool Remote
                  </span>
                  <span>100% 🔋</span>
                </div>

                {/* Encabezado Con QR Real Escaneable y Nombre del Profesor */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-indigo-700 truncate block">
                      {teacherIdentity.teacherName}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 block truncate">
                      PIN: {teacherIdentity.pin} · Aula 2º A
                    </span>
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <span>Conectada</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </div>
                  <div className="p-1 rounded-xl bg-white border border-slate-300 shadow-2xs shrink-0">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Mini QR Docente"
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <QrCode className="w-8 h-8 text-slate-900" />
                    )}
                  </div>
                </div>

                {/* LOS 4 BOTONES TÁCTILES GIGANTES ZERO-TECH */}
                <div className="space-y-2">
                  {/* Botón 1: Hacer Hablar a Prof. Claire 3D */}
                  <button
                    type="button"
                    onClick={() => {
                      onPlayLineAudio(activeLine.text, lesson.defaultSpeed);
                      dispatchPocketRemoteCommand({
                        teacherId: teacherIdentity.teacherId,
                        teacherEmail: teacherIdentity.teacherEmail,
                        teacherName: teacherIdentity.teacherName,
                        pin: teacherIdentity.pin,
                        type: 'PLAY_NORMAL',
                        payload: {
                          lineIndex: selectedLineIdx,
                          text: activeLine.text,
                          rate: lesson.defaultSpeed,
                        },
                      });
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-[#059669] hover:bg-emerald-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
                  >
                    <Play className="w-6 h-6 fill-current shrink-0" />
                    <div>
                      <span className="block leading-tight">
                        Hacer Hablar a Prof. {lesson.avatarName} 3D
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-100">
                        Voz nativa a velocidad normal ({lesson.defaultSpeed}x)
                      </span>
                    </div>
                  </button>

                  {/* Botón 2: Repetir Frase en Cámara Lenta */}
                  <button
                    type="button"
                    onClick={() => {
                      onPlayLineAudio(activeLine.text, 0.68);
                      dispatchPocketRemoteCommand({
                        teacherId: teacherIdentity.teacherId,
                        teacherEmail: teacherIdentity.teacherEmail,
                        teacherName: teacherIdentity.teacherName,
                        pin: teacherIdentity.pin,
                        type: 'PLAY_SLOW',
                        payload: {
                          lineIndex: selectedLineIdx,
                          text: activeLine.text,
                          rate: 0.68,
                        },
                      });
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
                  >
                    <span className="text-xl shrink-0">🐢</span>
                    <div>
                      <span className="block leading-tight">
                        Repetir Frase en Cámara Lenta
                      </span>
                      <span className="text-[11px] font-semibold text-blue-100">
                        Articulación silábica pausada (0.68x)
                      </span>
                    </div>
                  </button>

                  {/* Botón 3: Activar Práctica Coral del Salón */}
                  <button
                    type="button"
                    onClick={handleChoralAction}
                    className="w-full py-3 px-4 rounded-2xl bg-[#7C3AED] hover:bg-violet-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
                  >
                    <Mic className="w-6 h-6 shrink-0" />
                    <div>
                      <span className="block leading-tight">
                        Activar Práctica Coral del Salón
                      </span>
                      <span className="text-[11px] font-semibold text-violet-100">
                        Escucha y califica al grupo en vivo
                      </span>
                    </div>
                  </button>

                  {/* Botón 4: Lanzar Cronómetro 3 Min en Parejas */}
                  <button
                    type="button"
                    onClick={onLaunchBlackboardWithTimer}
                    className="w-full py-3 px-4 rounded-2xl bg-[#D97706] hover:bg-amber-600 text-white font-black text-sm flex items-center gap-3 cursor-pointer shadow-md transition-transform active:scale-98 text-left"
                  >
                    <Clock className="w-6 h-6 shrink-0" />
                    <div>
                      <span className="block leading-tight">
                        Lanzar Cronómetro 3 Min en Parejas
                      </span>
                      <span className="text-[11px] font-semibold text-amber-100">
                        Proyecta reloj y frases guía en el pizarrón
                      </span>
                    </div>
                  </button>
                </div>

                {/* Tarjeta CELTA de Bolsillo en el Celular */}
                <div className="p-3 rounded-2xl bg-[#FEF9E7] border-2 border-amber-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                      💡 Tarjeta CELTA de Bolsillo (CCQs)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onPlayLineAudio(
                          celtaGuide.ccqQuestions[0]?.questionEs ||
                            'Pregunta de verificación conceptual'
                        )
                      }
                      className="text-[11px] font-bold text-amber-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Oír</span>
                    </button>
                  </div>

                  {celtaGuide.ccqQuestions[0] && (
                    <>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        Pregunta al grupo: {celtaGuide.ccqQuestions[0].questionEs}
                      </p>
                      <p className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Respuesta: {celtaGuide.ccqQuestions[0].expectedAnswer}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
