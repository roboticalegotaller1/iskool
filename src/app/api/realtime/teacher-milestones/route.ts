import { NextRequest } from 'next/server';
import { teacherMilestoneBroadcaster, TeacherMilestoneEvent } from '@/lib/teacherMilestoneBroadcaster';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Server-Sent Events (SSE) para el Teacher Social Loop en tiempo real.
 * Permite al panel docente recibir hitos, progresos y actividades completadas
 * por los alumnos al instante, con cero latencia y sin sobrecargar la BD con polling.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacherId') || 'usr-teacher-1';
  const schoolId = searchParams.get('schoolId');

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

      // 3. Heartbeat periódico para evitar cierres de conexión por proxies o navegadores
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 15000);
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
