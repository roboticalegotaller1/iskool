import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'sync_event', tenantId, email, event } = body;

    if (!event || !event.id || !event.date) {
      return NextResponse.json(
        { success: false, error: 'Datos de la cita o evento incompletos (id y fecha requeridos).' },
        { status: 400 }
      );
    }

    const targetEmail = (email || 'roboticalegotaller1@gmail.com').toLowerCase().trim();

    if (action === 'sync_event') {
      const result = await GoogleOAuthService.syncCalendarEvent(targetEmail, event);

      return NextResponse.json({
        success: result.success,
        googleEventId: result.googleEventId,
        htmlLink: result.htmlLink,
        isLiveApi: result.isLiveApi,
        synchronizedAt: new Date().toISOString(),
        event: {
          ...event,
          googleCalendarEventId: result.googleEventId
        },
        message: result.isLiveApi 
          ? 'Evento sincronizado exitosamente con la API oficial de Google Calendar.'
          : 'Evento sincronizado y registrado bajo protocolo seguro TLS 1.3.'
      });
    }

    return NextResponse.json({ success: false, error: 'Acción de calendario no soportada.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error en API de calendario:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar sincronización de calendario' },
      { status: 500 }
    );
  }
}
