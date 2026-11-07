"use client";

import QRCode from 'qrcode';
import type { PocketRemoteCommand } from '@/app/api/languages/pocket-remote/route';

export interface TeacherRemoteIdentity {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherRole: string;
  campusId: string;
  campusName: string;
  schoolName: string;
  pin: string;
  pairingToken: string;
  remoteUrl: string;
}

/**
 * Genera un PIN determinista de 6 dígitos (ej. "482-915") y un Token Único
 * derivado exclusivamente de la cuenta del profesor para aislar su canal de aula.
 */
export function deriveTeacherRemoteCredentials(
  teacherId: string,
  teacherEmail: string,
  campusId: string = 'montes'
): { pin: string; rawPin: string; pairingToken: string } {
  const seed = `${teacherId.toLowerCase().trim()}|${teacherEmail.toLowerCase().trim()}|${campusId.toLowerCase().trim()}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positive = Math.abs(hash);
  const sixDigits = String((positive % 900000) + 100000);
  const formattedPin = `${sixDigits.slice(0, 3)}-${sixDigits.slice(3, 6)}`;
  const hexSuffix = positive.toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
  const cleanIdPrefix = teacherId
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6) || 'DOC';

  return {
    pin: formattedPin,
    rawPin: sixDigits,
    pairingToken: `ISK-QR-${cleanIdPrefix}-${hexSuffix}`,
  };
}

/**
 * Construye la identidad completa y la URL escaneable del Control Remoto Docente
 * personalizada para la cuenta activa del profesor.
 */
export function buildTeacherRemoteIdentity(params: {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherRole?: string;
  campusId?: string;
  campusName?: string;
  schoolName?: string;
  lessonId?: string;
  customOrigin?: string;
}): TeacherRemoteIdentity {
  const teacherId = (params.teacherId || 'tch-ibime-01').trim();
  const teacherEmail = (params.teacherEmail || 'docente.idiomas@ibime.edu.mx').trim();
  const teacherName = (params.teacherName || 'Prof. Titular de Idiomas').trim();
  const teacherRole = params.teacherRole || 'Docente Titular';
  const campusId = params.campusId || 'montes';
  const campusName = params.campusName || 'Campus Montes';
  const schoolName = params.schoolName || 'Instituto Bilingüe IBIME';

  const { pin, rawPin, pairingToken } = deriveTeacherRemoteCredentials(
    teacherId,
    teacherEmail,
    campusId
  );

  const origin =
    params.customOrigin ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://iskool.mx');

  const query = new URLSearchParams({
    teacherId,
    email: teacherEmail,
    name: teacherName,
    campus: campusName,
    pin: rawPin,
    token: pairingToken,
    lessonId: params.lessonId || 'les-en-1',
  });

  const remoteUrl = `${origin}/control-remoto-qr?${query.toString()}`;

  return {
    teacherId,
    teacherName,
    teacherEmail,
    teacherRole,
    campusId,
    campusName,
    schoolName,
    pin,
    pairingToken,
    remoteUrl,
  };
}

/**
 * Genera una imagen QR real (ISO/IEC 18004 con corrección Reed-Solomon Nivel M)
 * lista para escanearse con la cámara de cualquier teléfono iOS o Android.
 */
export async function generateTeacherQrDataUrl(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
  } catch {
    return '';
  }
}

/**
 * Envía un comando desde el Celular del Profesor (o desde el emulador en pantalla)
 * hacia el Pizarrón Inteligente de la cuenta de ese profesor usando Triple Capa:
 * 1) BroadcastChannel (0ms entre pestañas/ventanas locales)
 * 2) localStorage StorageEvent (respaldo local instantáneo)
 * 3) POST /api/languages/pocket-remote (sincronización real entre dispositivos físicos Celular <-> PC)
 */
export async function dispatchPocketRemoteCommand(params: {
  teacherId: string;
  teacherEmail: string;
  teacherName: string;
  pin: string;
  type: PocketRemoteCommand['type'];
  payload?: PocketRemoteCommand['payload'];
  deviceId?: string;
  deviceLabel?: string;
}): Promise<PocketRemoteCommand> {
  const cleanTeacherId = params.teacherId.trim().toLowerCase();
  const cmd: PocketRemoteCommand = {
    id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    teacherId: cleanTeacherId,
    teacherEmail: params.teacherEmail,
    teacherName: params.teacherName,
    pin: params.pin,
    type: params.type,
    payload: params.payload || {},
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      const bc = new BroadcastChannel(`iskool_pocket_remote_${cleanTeacherId}`);
      bc.postMessage(cmd);
      bc.close();
    } catch {
      // BroadcastChannel no soportado en navegadores antiguos
    }

    try {
      localStorage.setItem(
        `iskool_pocket_remote_cmd_${cleanTeacherId}`,
        JSON.stringify(cmd)
      );
    } catch {
      // Ignorar si localStorage está bloqueado
    }
  }

  try {
    await fetch('/api/languages/pocket-remote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...cmd,
        deviceId: params.deviceId,
        deviceLabel: params.deviceLabel,
      }),
    });
  } catch {
    // Continuar con canales locales si el servidor está offline
  }

  return cmd;
}

/**
 * Sincroniza el estado actual de la lección del Pizarrón hacia el servidor
 * para que cualquier celular que escanee el QR reciba de inmediato las frases,
 * el nombre del Avatar 3D y las preguntas CELTA (CCQs) de la clase activa.
 */
export async function syncActiveLessonToPocketServer(params: {
  teacherId: string;
  teacherEmail: string;
  teacherName: string;
  campusName: string;
  pin: string;
  lessonSnapshot: {
    lessonId: string;
    lessonTitle: string;
    avatarName: string;
    avatarSrc: string;
    language: 'en' | 'fr';
    level: string;
    defaultSpeed: number;
    selectedLineIdx: number;
    isPlayingAudio: boolean;
    choralStatus: 'idle' | 'listening' | 'done';
    dialogue: Array<{
      id: string;
      speaker: 'avatar' | 'student';
      text: string;
      translationEs?: string;
    }>;
    ccqQuestions: Array<{
      id: string;
      questionEs: string;
      expectedAnswer: string;
    }>;
    spanishInterference?: {
      phoneme?: string;
      titleEs?: string;
      wrongHabitEs: string;
      correctArticulationEs: string;
    };
  };
}): Promise<void> {
  const cleanTeacherId = params.teacherId.trim().toLowerCase();

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `iskool_pocket_remote_snapshot_${cleanTeacherId}`,
        JSON.stringify(params.lessonSnapshot)
      );
      const bc = new BroadcastChannel(`iskool_pocket_remote_${cleanTeacherId}`);
      bc.postMessage({
        id: `sync-${Date.now()}`,
        teacherId: cleanTeacherId,
        teacherEmail: params.teacherEmail,
        teacherName: params.teacherName,
        pin: params.pin,
        type: 'SYNC_LESSON_STATE',
        payload: params.lessonSnapshot as any,
        timestamp: Date.now(),
      });
      bc.close();
    } catch {
      // Ignorar errores de BroadcastChannel
    }
  }

  try {
    await fetch('/api/languages/pocket-remote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: cleanTeacherId,
        teacherEmail: params.teacherEmail,
        teacherName: params.teacherName,
        campusName: params.campusName,
        pin: params.pin,
        type: 'SYNC_LESSON_STATE',
        lessonSnapshot: params.lessonSnapshot,
      }),
    });
  } catch {
    // Fallback local activo
  }
}
