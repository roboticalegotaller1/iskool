import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

const PatchMagicLinkStatusSchema = z.enum(['opened', 'signed']);

export interface MagicLinkRecord {
  token: string;
  schoolId?: string;
  studentId: string;
  studentName: string;
  groupLabel: string;
  tutorName: string;
  phone: string;
  channel: 'whatsapp' | 'sms' | 'direct';
  incidentType: 'conducta' | 'tarea' | 'merito' | 'citatorio' | 'asistencia';
  incidentLabel: string;
  customMessage: string;
  attendanceStatus: 'present' | 'late' | 'absent';
  stampPage: string;
  isStamped: boolean;
  xpAwarded: number;
  teacherName: string;
  subjectName: string;
  createdAt: string;
  timeLabel: string;
  status: 'sent' | 'opened' | 'signed';
  signedAt?: string;
  signedBy?: string;
  parentReply?: string;
  magicUrl: string;
}

const CACHE_DIR = path.join(process.cwd(), '.cache');
const MAGIC_LINKS_FILE = path.join(CACHE_DIR, 'magic_links.json');

const DEFAULT_SEED_LINKS: MagicLinkRecord[] = [
  {
    token: 'ml_s3_seed_diego',
    studentId: 's3',
    studentName: 'Diego Ramírez',
    groupLabel: '1°A Secundaria',
    tutorName: 'Jorge Ramírez (Padre de Familia)',
    phone: '525548298921',
    channel: 'whatsapp',
    incidentType: 'asistencia',
    incidentLabel: 'Reporte de Asistencia & Sello Pág. 48',
    customMessage: 'Estimado tutor: Se informa que Diego Ramírez registró asistencia puntual el día de hoy y cuenta con el sello de libreta verificado en la Pág. 48 (Ecuaciones Lineales).',
    attendanceStatus: 'present',
    stampPage: 'Pág. 48',
    isStamped: true,
    xpAwarded: 0,
    teacherName: 'Docente Titular ISkool',
    subjectName: 'Historia & Ciencias',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    timeLabel: '09:15 AM',
    status: 'signed',
    signedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    signedBy: 'Jorge Ramírez',
    parentReply: 'Enterado profesor, muchas gracias por el seguimiento.',
    magicUrl: '/parent?student_id=s3&token=ml_s3_seed_diego&auth=magic',
  },
  {
    token: 'ml_s2_seed_mateo',
    studentId: 's2',
    studentName: 'Mateo Morales',
    groupLabel: '1°A Secundaria',
    tutorName: ' Claudia Morales (Madre de Familia)',
    phone: '525539104412',
    channel: 'whatsapp',
    incidentType: 'conducta',
    incidentLabel: 'Alerta de Retardo (08:08 AM) & Tarea Sellada',
    customMessage: 'Estimada tutora: Se notifica que Mateo Morales ingresó con retardo menor (08:08 AM), pero cumplió satisfactoriamente con la actividad en libreta física (Pág. 48 sellada).',
    attendanceStatus: 'late',
    stampPage: 'Pág. 48',
    isStamped: true,
    xpAwarded: 0,
    teacherName: 'Docente Titular ISkool',
    subjectName: 'Historia & Ciencias',
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    timeLabel: '08:20 AM',
    status: 'signed',
    signedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    signedBy: 'Claudia Morales',
    parentReply: 'Gracias maestro, mañana saldremos más temprano sin falta.',
    magicUrl: '/parent?student_id=s2&token=ml_s2_seed_mateo&auth=magic',
  },
  {
    token: 'ml_s1_seed_sofia',
    studentId: 's1',
    studentName: 'Sofía Hernández',
    groupLabel: '1°A Secundaria',
    tutorName: 'Roberto Hernández (Padre de Familia)',
    phone: '525571829034',
    channel: 'whatsapp',
    incidentType: 'merito',
    incidentLabel: 'Felicitación Mérito Formativo (+50 XP)',
    customMessage: 'Estimado tutor: Reconocemos a Sofía Hernández con +50 XP de Mérito Académico por su destacada participación y resolución impecable de ejercicios en la Pág. 48.',
    attendanceStatus: 'present',
    stampPage: 'Pág. 48',
    isStamped: true,
    xpAwarded: 50,
    teacherName: 'Docente Titular ISkool',
    subjectName: 'Historia & Ciencias',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timeLabel: '09:40 AM',
    status: 'sent',
    magicUrl: '/parent?student_id=s1&token=ml_s1_seed_sofia&auth=magic',
  },
];

let magicLinksStoreCache: { mtimeMs: number; records: MagicLinkRecord[] } | null = null;

function readMagicLinksStore(): MagicLinkRecord[] {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE)) {
      if (!fs.existsSync(/*turbopackIgnore: true*/ CACHE_DIR)) {
        fs.mkdirSync(/*turbopackIgnore: true*/ CACHE_DIR, { recursive: true });
      }
      fs.writeFileSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE, JSON.stringify(DEFAULT_SEED_LINKS, null, 2), 'utf-8');
      const seededStat = fs.statSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE);
      magicLinksStoreCache = { mtimeMs: seededStat.mtimeMs, records: [...DEFAULT_SEED_LINKS] };
      return [...DEFAULT_SEED_LINKS];
    }

    const stat = fs.statSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE);
    if (magicLinksStoreCache && magicLinksStoreCache.mtimeMs === stat.mtimeMs) {
      return [...magicLinksStoreCache.records];
    }

    const raw = fs.readFileSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      magicLinksStoreCache = { mtimeMs: stat.mtimeMs, records: parsed };
      return [...parsed];
    }
    magicLinksStoreCache = { mtimeMs: stat.mtimeMs, records: [...DEFAULT_SEED_LINKS] };
    return [...DEFAULT_SEED_LINKS];
  } catch {
    return [...DEFAULT_SEED_LINKS];
  }
}

function writeMagicLinksStore(records: MagicLinkRecord[]): void {
  magicLinksStoreCache = null;
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ CACHE_DIR)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE, JSON.stringify(records.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('[MagicLinkStore] Error writing store:', err);
  }
}

const STAFF_ROLES = new Set(['superadmin', 'admin', 'director', 'owner', 'ceo', 'coordinator', 'teacher', 'billing']);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const studentId = searchParams.get('student_id');

  // Acceso directo por token firmado/secreto específico (público, sin fallback enumerador por student_id)
  if (token) {
    const records = readMagicLinksStore();
    const found = records.find((r) => r.token === token);
    if (found) {
      return NextResponse.json({ ok: true, record: found });
    }
    return NextResponse.json({ ok: false, error: 'Token no encontrado o expirado' }, { status: 404 });
  }

  // Consulta administrativa de listado: requiere sesión autenticada de personal autorizado
  const auth = await validateApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json(
      { ok: false, error: 'Autenticación o token de enlace requerido' },
      { status: 401 }
    );
  }
  const roleLower = (auth.user.role || '').toLowerCase();
  if (!STAFF_ROLES.has(roleLower)) {
    return NextResponse.json(
      { ok: false, error: 'Permisos insuficientes para listar enlaces familiares.' },
      { status: 403 }
    );
  }

  const allRecords = readMagicLinksStore();
  const isSuper = isPlatformSuperUser(auth.user);
  const records = isSuper
    ? allRecords
    : allRecords.filter((r) => Boolean(auth.user?.school_id && r.schoolId === auth.user.school_id));
  if (studentId) {
    const filtered = records.filter((r) => r.studentId === studentId);
    return NextResponse.json({ ok: true, records: filtered });
  }

  return NextResponse.json({ ok: true, records });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { ok: false, error: 'Autenticación docente requerida para emitir Magic Link' },
        { status: 401 }
      );
    }
    const roleLower = (auth.user.role || '').toLowerCase();
    if (!STAFF_ROLES.has(roleLower)) {
      return NextResponse.json(
        { ok: false, error: 'Solo docentes o personal autorizado pueden emitir enlaces mágicos.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Cuerpo JSON inválido o malformado.' },
        { status: 400 }
      );
    }
    const records = readMagicLinksStore();

    const now = new Date();
    const timeLabel =
      body.timeLabel ||
      now.toLocaleTimeString('es-MX', {
        timeZone: 'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).toUpperCase();

    // Token criptográfico generado estrictamente en el servidor (mínimo 192 bits de entropía)
    const token = `ml_${crypto.randomBytes(24).toString('base64url')}`;
    const studentId = String(body.studentId || 's1');
    const isSuper = isPlatformSuperUser(auth.user);
    const resolvedSchoolId = isSuper
      ? (typeof body.schoolId === 'string' && body.schoolId.trim() ? body.schoolId.trim() : auth.user.school_id)
      : auth.user.school_id;

    const newRecord: MagicLinkRecord = {
      token,
      schoolId: resolvedSchoolId,
      studentId,
      studentName: String(body.studentName || 'Alumno ISkool'),
      groupLabel: String(body.groupLabel || '1°A Secundaria'),
      tutorName: String(body.tutorName || 'Tutor Familiar Registrado'),
      phone: String(body.phone || '525548298921'),
      channel: body.channel === 'sms' ? 'sms' : body.channel === 'direct' ? 'direct' : 'whatsapp',
      incidentType: body.incidentType || 'conducta',
      incidentLabel: String(body.incidentLabel || 'Reporte de Seguimiento Pedagógico'),
      customMessage: String(
        body.customMessage ||
          'Se comparte reporte de asistencia, revisión de libreta física y seguimiento académico del día de hoy.'
      ),
      attendanceStatus: body.attendanceStatus || 'present',
      stampPage: String(body.stampPage || 'Pág. 48'),
      isStamped: Boolean(body.isStamped ?? true),
      xpAwarded: Number(body.xpAwarded || 0),
      teacherName: String(body.teacherName || 'Docente Titular ISkool'),
      subjectName: String(body.subjectName || 'Historia & Ciencias'),
      createdAt: now.toISOString(),
      timeLabel,
      status: 'sent',
      magicUrl: `/parent?student_id=${encodeURIComponent(studentId)}&token=${encodeURIComponent(token)}&auth=magic`,
    };

    const updated = [newRecord, ...records.filter((r) => r.token !== token)];
    writeMagicLinksStore(updated);

    const visibleRecords = isSuper
      ? updated
      : updated.filter((r) => Boolean(auth.user?.school_id && r.schoolId === auth.user.school_id));

    return NextResponse.json({ ok: true, record: newRecord, records: visibleRecords });
  } catch (error) {
    console.error('[MagicLink API POST]', error);
    return NextResponse.json({ ok: false, error: 'Error al registrar Magic Link' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Cuerpo JSON inválido o malformado.' }, { status: 400 });
    }
    const { token, status, signedBy, parentReply } = body;

    if (!token || typeof token !== 'string' || token.trim().length < 12) {
      return NextResponse.json({ ok: false, error: 'Token válido requerido' }, { status: 400 });
    }

    const parsedStatus =
      status === undefined
        ? { success: true as const, data: 'signed' as const }
        : PatchMagicLinkStatusSchema.safeParse(status);

    if (!parsedStatus.success) {
      return NextResponse.json(
        { ok: false, error: 'Estado inválido. Solo se permite "opened" o "signed".' },
        { status: 400 }
      );
    }

    const validatedStatus = parsedStatus.data;
    const records = readMagicLinksStore();
    let updatedRecord: MagicLinkRecord | null = null;

    const updated = records.map((rec) => {
      if (rec.token === token.trim()) {
        updatedRecord = {
          ...rec,
          status: validatedStatus,
          signedAt: validatedStatus === 'signed' ? new Date().toISOString() : rec.signedAt,
          signedBy: signedBy ? String(signedBy).slice(0, 120) : rec.tutorName,
          parentReply: parentReply !== undefined ? String(parentReply).slice(0, 500) : rec.parentReply,
        };
        return updatedRecord;
      }
      return rec;
    });

    if (!updatedRecord) {
      return NextResponse.json({ ok: false, error: 'Enlace mágico no encontrado o revocado' }, { status: 404 });
    }

    writeMagicLinksStore(updated);
    return NextResponse.json({ ok: true, record: updatedRecord });
  } catch (error) {
    console.error('[MagicLink API PATCH]', error);
    return NextResponse.json({ ok: false, error: 'Error al actualizar Magic Link' }, { status: 500 });
  }
}

