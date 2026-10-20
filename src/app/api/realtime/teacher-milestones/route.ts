import { NextRequest } from 'next/server';
import { teacherMilestoneBroadcaster, TeacherMilestoneEvent } from '@/lib/teacherMilestoneBroadcaster';
import { validateApiAuth } from '@/lib/authValidator';

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

  const isStaff = ['teacher', 'director', 'admin', 'superadmin', 'coordinator', 'owner', 'ceo'].includes(auth.user.role || '');
  if (!isStaff) {
    return new Response(JSON.stringify({ error: 'Acceso denegado: Se requiere rol docente o directivo.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { searchParams } = new URL(req.url);
  const isSuperUser = ['director', 'admin', 'superadmin', 'owner', 'ceo'].includes(auth.user.role || '');
  const teacherId = isSuperUser ? (searchParams.get('teacherId') || auth.user.id) : auth.user.id;
  const schoolId = auth.user.school_id || searchParams.get('schoolId');

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

      // 2. Suscripción a eventos de hitos
      unsubscribe = teacherMilestoneBroadcaster.subscribe((event: TeacherMilestoneEvent) => {
        // Filtrar por colegio o docente si corresponde
        if (schoolId && event.schoolId && event.schoolId !== schoolId) {
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
