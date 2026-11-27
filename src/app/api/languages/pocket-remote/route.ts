import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

const REMOTE_STAFF_ROLES = new Set(['teacher', 'coordinator', 'director', 'admin', 'superadmin', 'owner', 'ceo']);

const PIN_RATE_LIMIT_MAX_ATTEMPTS = 15;
const PIN_RATE_LIMIT_WINDOW_MS = 60_000;
const PIN_RATE_LIMIT_MAX_IPS = 1000;
const pinAttemptBuckets = new Map<string, { count: number; resetAt: number }>();

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  return realIp || 'local-client';
}

function checkPinRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (pinAttemptBuckets.size >= PIN_RATE_LIMIT_MAX_IPS && !pinAttemptBuckets.has(ip)) {
    for (const [k, v] of pinAttemptBuckets) {
      if (v.resetAt <= now) pinAttemptBuckets.delete(k);
    }
    while (pinAttemptBuckets.size >= PIN_RATE_LIMIT_MAX_IPS) {
      const oldestKey = pinAttemptBuckets.keys().next().value;
      if (!oldestKey) break;
      pinAttemptBuckets.delete(oldestKey);
    }
  }
  const existing = pinAttemptBuckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    pinAttemptBuckets.set(ip, { count: 1, resetAt: now + PIN_RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= PIN_RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

function isRemoteSessionOwner(
  user: { id?: string; email?: string; role?: string } | undefined,
  teacherId: string
): boolean {
  if (!user) return false;
  if (isPlatformSuperUser(user)) return true;
  const target = teacherId.trim().toLowerCase();
  const userId = (user.id || '').trim().toLowerCase();
  const userEmail = (user.email || '').trim().toLowerCase();
  return Boolean((userId && target === userId) || (userEmail && target === userEmail));
}

function generateRandomPin(): string {
  return String(crypto.randomInt(100000, 1000000));
}

function timingSafePinEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

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
    | 'TOGGLE_PIZARRA'
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
const SESSION_IDLE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas de inactividad máxima
const MAX_POCKET_REMOTE_SESSIONS = 500;

function pruneSessions(now: number = Date.now(), reserveSlot = false): void {
  for (const [key, session] of sessionsMap) {
    if (now - session.updatedAt > SESSION_IDLE_TTL_MS) {
      sessionsMap.delete(key);
    }
  }
  const limit = reserveSlot ? MAX_POCKET_REMOTE_SESSIONS - 1 : MAX_POCKET_REMOTE_SESSIONS;
  while (sessionsMap.size > limit) {
    let oldestKey: string | undefined;
    let oldestUpdatedAt = Infinity;
    for (const [key, session] of sessionsMap) {
      if (session.updatedAt < oldestUpdatedAt) {
        oldestUpdatedAt = session.updatedAt;
        oldestKey = key;
      }
    }
    if (oldestKey === undefined) break;
    sessionsMap.delete(oldestKey);
  }
}

function getOrCreateSession(
  teacherId: string,
  teacherEmail = 'docente@iskool.edu.mx',
  teacherName = 'Docente Titular',
  campusName = 'Campus Central',
  pin?: string
): TeacherRemoteSessionState {
  const now = Date.now();
  const key = teacherId.trim().toLowerCase() || 'default-teacher';
  let existing = sessionsMap.get(key);
  if (existing && now - existing.updatedAt > SESSION_IDLE_TTL_MS) {
    sessionsMap.delete(key);
    existing = undefined;
  }
  if (!existing) {
    pruneSessions(now, true);
    existing = {
      teacherId: key,
      teacherEmail,
      teacherName,
      campusName,
      pin: pin || generateRandomPin(),
      connectedDevices: [],
      commands: [],
      updatedAt: now,
    };
    sessionsMap.set(key, existing);
  }
  return existing;
}

export async function GET(req: NextRequest) {
  pruneSessions();
  const { searchParams } = new URL(req.url);
  const teacherId = (searchParams.get('teacherId') || 'default-teacher').trim().toLowerCase();
  const providedPin = (searchParams.get('pin') || '').trim();
  const since = Number(searchParams.get('since') || '0');

  const auth = await validateApiAuth(req);
  const isStaff = Boolean(auth.authenticated && auth.user && REMOTE_STAFF_ROLES.has((auth.user.role || '').toLowerCase()));
  const isOwner = isStaff && isRemoteSessionOwner(auth.user, teacherId);
  const existingSession = sessionsMap.get(teacherId);

  if (!isOwner) {
    const rateCheck = checkPinRateLimit(extractClientIp(req));
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Demasiados intentos de vinculación por PIN. Intenta nuevamente en unos segundos.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSec) } }
      );
    }

    if (!existingSession || !timingSafePinEqual(providedPin, existingSession.pin)) {
      return NextResponse.json(
        { ok: false, error: 'PIN de vinculación QR o sesión docente titular requerida para consultar el control remoto.' },
        { status: auth.authenticated ? 403 : 401 }
      );
    }
  }

  const session = existingSession || getOrCreateSession(teacherId);
  session.updatedAt = Date.now();

  // Filtrar comandos recientes posteriores a `since` sin exponer PIN
  const recentCommands = session.commands
    .filter((cmd) => cmd.timestamp > since)
    .map(({ pin: _pin, ...sanitized }) => sanitized);

  return NextResponse.json({
    ok: true,
    teacherId: session.teacherId,
    teacherEmail: session.teacherEmail,
    teacherName: session.teacherName,
    campusName: session.campusName,
    ...(isOwner ? { pin: session.pin } : {}),
    pinProtected: true,
    connectedDevices: session.connectedDevices,
    activeLessonSnapshot: session.activeLessonSnapshot || null,
    commands: recentCommands,
    serverTimestamp: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    pruneSessions();
    const auth = await validateApiAuth(req);
    const isStaff = Boolean(auth.authenticated && auth.user && REMOTE_STAFF_ROLES.has((auth.user.role || '').toLowerCase()));
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Cuerpo JSON inválido o malformado.' },
        { status: 400 }
      );
    }

    const teacherId = String(body.teacherId || 'default-teacher').trim().toLowerCase();
    const teacherEmail = String(body.teacherEmail || 'docente@iskool.edu.mx');
    const teacherName = String(body.teacherName || 'Docente Titular');
    const campusName = String(body.campusName || 'Campus Central');
    const pin = String(body.pin || '').trim();
    const actionType = body.type as PocketRemoteCommand['type'];
    const isOwner = isStaff && isRemoteSessionOwner(auth.user, teacherId);

    if (actionType === 'SYNC_LESSON_STATE' && !isOwner) {
      return NextResponse.json(
        { ok: false, error: 'Autenticación del docente titular requerida para sincronizar el estado de la clase.' },
        { status: auth.authenticated ? 403 : 401 }
      );
    }

    const existingSession = sessionsMap.get(teacherId);
    if (!isOwner) {
      const rateCheck = checkPinRateLimit(extractClientIp(req));
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { ok: false, error: 'Demasiados intentos de vinculación por PIN. Intenta nuevamente en unos segundos.' },
          { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSec) } }
        );
      }
      if (!existingSession || !timingSafePinEqual(pin, existingSession.pin)) {
        return NextResponse.json(
          { ok: false, error: 'PIN de vinculación QR requerido o inválido para esta sesión docente.' },
          { status: 403 }
        );
      }
    }

    const session = getOrCreateSession(teacherId, teacherEmail, teacherName, campusName, pin || undefined);
    session.teacherEmail = teacherEmail || session.teacherEmail;
    session.teacherName = teacherName || session.teacherName;
    session.campusName = campusName || session.campusName;
    if (actionType === 'SYNC_LESSON_STATE' && pin && isOwner) {
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

    const { pin: _omittedPin, ...sanitizedCommand } = command;

    return NextResponse.json({
      ok: true,
      command: isOwner ? command : sanitizedCommand,
      connectedDevices: session.connectedDevices,
      serverTimestamp: command.timestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Error procesando comando remoto',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status: 400 }
    );
  }
}
