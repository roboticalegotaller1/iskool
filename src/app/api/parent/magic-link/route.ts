import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface MagicLinkRecord {
  token: string;
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

function readMagicLinksStore(): MagicLinkRecord[] {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ CACHE_DIR)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ CACHE_DIR, { recursive: true });
    }
    if (!fs.existsSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE)) {
      fs.writeFileSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE, JSON.stringify(DEFAULT_SEED_LINKS, null, 2), 'utf-8');
      return [...DEFAULT_SEED_LINKS];
    }
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...DEFAULT_SEED_LINKS];
  } catch {
    return [...DEFAULT_SEED_LINKS];
  }
}

function writeMagicLinksStore(records: MagicLinkRecord[]): void {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ CACHE_DIR)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ MAGIC_LINKS_FILE, JSON.stringify(records.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('[MagicLinkStore] Error writing store:', err);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const studentId = searchParams.get('student_id');

  const records = readMagicLinksStore();

  if (token) {
    const found = records.find((r) => r.token === token);
    if (found) {
      return NextResponse.json({ ok: true, record: found });
    }
    // Si es un token generado al vuelo en cliente que aún no estaba en disco, buscamos el más reciente del alumno
    if (studentId) {
      const byStudent = records.find((r) => r.studentId === studentId);
      if (byStudent) {
        return NextResponse.json({ ok: true, record: { ...byStudent, token } });
      }
    }
    return NextResponse.json({ ok: false, error: 'Token no encontrado' }, { status: 404 });
  }

  if (studentId) {
    const filtered = records.filter((r) => r.studentId === studentId);
    return NextResponse.json({ ok: true, records: filtered });
  }

  return NextResponse.json({ ok: true, records });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const records = readMagicLinksStore();

    const now = new Date();
    const timeLabel =
      body.timeLabel ||
      now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).toUpperCase();

    const token = body.token || `ml_${body.studentId || 'stu'}_${Date.now().toString(36)}`;
    const studentId = String(body.studentId || 's1');

    const newRecord: MagicLinkRecord = {
      token,
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

    return NextResponse.json({ ok: true, record: newRecord, records: updated });
  } catch (error) {
    console.error('[MagicLink API POST]', error);
    return NextResponse.json({ ok: false, error: 'Error al registrar Magic Link' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, status, signedBy, parentReply, studentId } = body;

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 400 });
    }

    const records = readMagicLinksStore();
    let updatedRecord: MagicLinkRecord | null = null;

    const updated = records.map((rec) => {
      if (rec.token === token) {
        updatedRecord = {
          ...rec,
          status: status || 'signed',
          signedAt: status === 'signed' ? new Date().toISOString() : rec.signedAt,
          signedBy: signedBy || rec.tutorName,
          parentReply: parentReply !== undefined ? parentReply : rec.parentReply,
        };
        return updatedRecord;
      }
      return rec;
    });

    // Si el token se creó de forma efímera por URL directa y no existía en el archivo, lo registramos firmado
    if (!updatedRecord) {
      const now = new Date();
      updatedRecord = {
        token,
        studentId: String(studentId || 's1'),
        studentName: String(body.studentName || 'Alumno Verificado'),
        groupLabel: '1°A Secundaria',
        tutorName: String(signedBy || 'Tutor Familiar'),
        phone: '525548298921',
        channel: 'whatsapp',
        incidentType: 'asistencia',
        incidentLabel: 'Reporte Diario de Asistencia y Libreta Física',
        customMessage: 'Reporte verificado y firmado digitalmente desde el enlace mágico institucional.',
        attendanceStatus: 'present',
        stampPage: 'Pág. 48',
        isStamped: true,
        xpAwarded: 0,
        teacherName: 'Docente Titular ISkool',
        subjectName: 'Historia & Ciencias',
        createdAt: now.toISOString(),
        timeLabel: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase(),
        status: status || 'signed',
        signedAt: now.toISOString(),
        signedBy: String(signedBy || 'Tutor Familiar'),
        parentReply: parentReply ? String(parentReply) : undefined,
        magicUrl: `/parent?student_id=${encodeURIComponent(String(studentId || 's1'))}&token=${encodeURIComponent(token)}&auth=magic`,
      };
      updated.unshift(updatedRecord);
    }

    writeMagicLinksStore(updated);
    return NextResponse.json({ ok: true, record: updatedRecord, records: updated });
  } catch (error) {
    console.error('[MagicLink API PATCH]', error);
    return NextResponse.json({ ok: false, error: 'Error al actualizar Magic Link' }, { status: 500 });
  }
}

