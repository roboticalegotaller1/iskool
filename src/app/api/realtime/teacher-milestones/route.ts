import { NextRequest } from 'next/server';
import { teacherMilestoneBroadcaster, TeacherMilestoneEvent } from '@/lib/teacherMilestoneBroadcaster';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Server-Sent Events (SSE) para el Teacher Social Loop en tiempo real.
 * Permite al panel docente recibir hitos, progresos y actividades completadas
 * por los alumnos al instante, con cero latencia y sin sobrecargar la BD con polling.
 */
export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
  if (!auth.authenticated || !auth.user) {
    return new Response(JSON.stringify({ error: 'Autenticación requerida para acceder al flujo de hitos en tiempo real.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const roleLower = (auth.user.role || '').toLowerCase();
  const isStaff = ['teacher', 'director', 'admin', 'superadmin', 'coordinator', 'owner', 'ceo'].includes(roleLower);
  if (!isStaff) {
    return new Response(JSON.stringify({ error: 'Acceso denegado: Se requiere rol docente o directivo.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { searchParams } = new URL(req.url);
  const isSuperUser = isPlatformSuperUser(auth.user);
  const isSchoolLeader = isSuperUser || ['director', 'coordinator', 'owner', 'ceo'].includes(roleLower);
  const teacherId = isSchoolLeader ? (searchParams.get('teacherId') || auth.user.id) : auth.user.id;
  const schoolId = isSuperUser ? (searchParams.get('schoolId') || auth.user.school_id) : auth.user.school_id;

  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Mensaje inicial de conexión exitosa
      const welcomeData = JSON.stringify({
        type: 'connected',
        teacherId,
        message: 'Conectado al Teacher Social Loop en tiempo real (SSE Activo)',
        timestamp: new Date().toISOString()
      });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${welcomeData}\n\n`));

      // 2. Suscripción a eventos de hitos con aislamiento estricto por escuela
      unsubscribe = teacherMilestoneBroadcaster.subscribe((event: TeacherMilestoneEvent) => {
        // Para no superusuarios, descartar eventos sin schoolId o pertenecientes a otra escuela
        if (!isSuperUser) {
          if (!schoolId || !event.schoolId || event.schoolId !== schoolId) {
            return;
          }
        } else if (schoolId && event.schoolId && event.schoolId !== schoolId) {
          return;
        }
        if (event.teacherId && event.teacherId !== teacherId && teacherId !== 'all') {
          return;
        }

        try {
          const payload = JSON.stringify(event);
          controller.enqueue(encoder.encode(`event: milestone\ndata: ${payload}\n\n`));
        } catch (err) {
          console.error('Error enviando evento SSE:', err);
        }
      });

      // 3. Heartbeat formal periódico (Ping/Pong cada 25-30s) para monitoreo de liveness
      heartbeatInterval = setInterval(() => {
        try {
          const pingData = JSON.stringify({
            type: 'ping',
            timestamp: Date.now(),
            status: 'alive'
          });
          controller.enqueue(encoder.encode(`event: ping\ndata: ${pingData}\n\n`));
          controller.enqueue(encoder.encode(`: keep-alive ${Date.now()}\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 25000);
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Para proxies reversos como Nginx
    }
  });
}
