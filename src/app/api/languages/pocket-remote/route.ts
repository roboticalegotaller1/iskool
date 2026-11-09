import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';

export interface PocketRemoteCommand {
  id: string;
  teacherId: string;
  teacherEmail: string;
  teacherName: string;
  pin: string;
  type:
    | 'CONNECT_DEVICE'
    | 'PLAY_NORMAL'
    | 'PLAY_SLOW'
    | 'CHORAL_PRACTICE'
    | 'START_PAIR_TIMER'
    | 'SELECT_LINE'
    | 'SET_GESTURE'
    | 'TOGGLE_BLACKBOARD'
    | 'SYNC_LESSON_STATE';
  payload?: {
    lineIndex?: number;
    text?: string;
    rate?: number;
    gesture?: string;
    deviceLabel?: string;
    lessonId?: string;
    lessonTitle?: string;
    avatarName?: string;
    avatarSrc?: string;
    language?: 'en' | 'fr';
    level?: string;
    dialogue?: Array<{
      id: string;
      speaker: 'avatar' | 'student';
      text: string;
      translationEs?: string;
    }>;
    ccqQuestions?: Array<{
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
  timestamp: number;
}

interface TeacherRemoteSessionState {
  teacherId: string;
  teacherEmail: string;
  teacherName: string;
  campusName: string;
  pin: string;
  connectedDevices: Array<{
    deviceId: string;
    deviceLabel: string;
    connectedAt: number;
    lastSeenAt: number;
  }>;
  activeLessonSnapshot?: {
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
  commands: PocketRemoteCommand[];
  updatedAt: number;
}

// Almacén en memoria global persistente durante la ejecución del servidor Next.js
const globalForRemote = globalThis as unknown as {
  __iskoolPocketRemoteSessions?: Map<string, TeacherRemoteSessionState>;
};

if (!globalForRemote.__iskoolPocketRemoteSessions) {
  globalForRemote.__iskoolPocketRemoteSessions = new Map<string, TeacherRemoteSessionState>();
}

const sessionsMap = globalForRemote.__iskoolPocketRemoteSessions;

function getOrCreateSession(
  teacherId: string,
  teacherEmail = 'docente@iskool.edu.mx',
  teacherName = 'Docente Titular',
  campusName = 'Campus Central',
  pin = '482915'
): TeacherRemoteSessionState {
  const key = teacherId.trim().toLowerCase() || 'default-teacher';
  let existing = sessionsMap.get(key);
  if (!existing) {
    existing = {
      teacherId: key,
      teacherEmail,
      teacherName,
      campusName,
      pin,
      connectedDevices: [],
      commands: [],
      updatedAt: Date.now(),
    };
    sessionsMap.set(key, existing);
  }
  return existing;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teacherId = (searchParams.get('teacherId') || 'default-teacher').trim().toLowerCase();
  const providedPin = (searchParams.get('pin') || '').trim();
  const since = Number(searchParams.get('since') || '0');

  const auth = await validateApiAuth(req);
  const session = getOrCreateSession(teacherId);
  const isAuthorizedForPin = auth.authenticated || (providedPin && providedPin === session.pin);

  // Filtrar comandos recientes posteriores a `since`
  const recentCommands = session.commands.filter((cmd) => cmd.timestamp > since);

  return NextResponse.json({
    ok: true,
    teacherId: session.teacherId,
    teacherEmail: session.teacherEmail,
    teacherName: session.teacherName,
    campusName: session.campusName,
    pin: isAuthorizedForPin ? session.pin : '******',
    pinProtected: true,
    connectedDevices: session.connectedDevices,
    activeLessonSnapshot: session.activeLessonSnapshot || null,
    commands: recentCommands,
    serverTimestamp: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    const body = await req.json();
    const teacherId = String(body.teacherId || 'default-teacher').trim().toLowerCase();
    const teacherEmail = String(body.teacherEmail || 'docente@iskool.edu.mx');
    const teacherName = String(body.teacherName || 'Docente Titular');
    const campusName = String(body.campusName || 'Campus Central');
    const pin = String(body.pin || '').trim();
    const actionType = body.type as PocketRemoteCommand['type'];

    const existingSession = sessionsMap.get(teacherId);
    if (
      existingSession &&
      actionType !== 'SYNC_LESSON_STATE' &&
      !auth.authenticated &&
      pin &&
      existingSession.pin &&
      pin !== existingSession.pin
    ) {
      return NextResponse.json(
        { ok: false, error: 'PIN de vinculación QR no válido para esta sesión docente.' },
        { status: 403 }
      );
    }

    const session = getOrCreateSession(teacherId, teacherEmail, teacherName, campusName, pin || '482915');
    session.teacherEmail = teacherEmail || session.teacherEmail;
    session.teacherName = teacherName || session.teacherName;
    session.campusName = campusName || session.campusName;
    if (actionType === 'SYNC_LESSON_STATE' && pin) {
      session.pin = pin;
    }
    session.updatedAt = Date.now();

    if (actionType === 'SYNC_LESSON_STATE' && body.lessonSnapshot) {
      session.activeLessonSnapshot = body.lessonSnapshot;
      return NextResponse.json({
        ok: true,
        session,
      });
    }

    if (actionType === 'CONNECT_DEVICE') {
      const deviceId = String(body.deviceId || `mob-${Date.now()}`);
      const deviceLabel = String(body.deviceLabel || 'Smartphone Docente (QR Vinculado)');
      const existingIdx = session.connectedDevices.findIndex((d) => d.deviceId === deviceId);
      if (existingIdx >= 0) {
        session.connectedDevices[existingIdx].lastSeenAt = Date.now();
        session.connectedDevices[existingIdx].deviceLabel = deviceLabel;
      } else {
        session.connectedDevices.push({
          deviceId,
          deviceLabel,
          connectedAt: Date.now(),
          lastSeenAt: Date.now(),
        });
      }
    }

    const command: PocketRemoteCommand = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      teacherId,
      teacherEmail: session.teacherEmail,
      teacherName: session.teacherName,
      pin: session.pin,
      type: actionType,
      payload: body.payload || {},
      timestamp: Date.now(),
    };

    session.commands.push(command);
    // Mantener solo los últimos 40 comandos en memoria para ligereza
    if (session.commands.length > 40) {
      session.commands = session.commands.slice(-40);
    }

    if (
      actionType === 'SELECT_LINE' &&
      session.activeLessonSnapshot &&
      typeof body.payload?.lineIndex === 'number'
    ) {
      session.activeLessonSnapshot.selectedLineIdx = body.payload.lineIndex;
    }

    return NextResponse.json({
      ok: true,
      command,
      connectedDevices: session.connectedDevices,
      serverTimestamp: command.timestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Error procesando comando remoto' },
      { status: 400 }
    );
  }
}
