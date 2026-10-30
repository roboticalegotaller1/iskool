import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { validateApiAuth } from '@/lib/authValidator';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para consultar eventos de Google Calendar.' },
        { status: 401 }
      );
    }

    const emailParam = req.nextUrl.searchParams.get('email') || undefined;
    const maxResults = Number(req.nextUrl.searchParams.get('maxResults') || 15);
    const targetEmail = GoogleOAuthService.resolveEffectiveGoogleEmail(emailParam);

    const result = await GoogleOAuthService.listCalendarEvents(targetEmail, maxResults);

    return NextResponse.json({
      success: result.success,
      isLiveApi: result.isLiveApi,
      accountEmail: result.accountEmail,
      events: result.events,
      methodUsed: 'GET',
      endpoint: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      synchronizedAt: new Date().toISOString(),
      error: result.error
    });
  } catch (error: any) {
    console.error('Error en GET API de calendario:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al consultar eventos de Google Calendar' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para sincronizar eventos de calendario.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action = 'sync_event', email, event, googleEventId } = body;
    const targetEmail = GoogleOAuthService.resolveEffectiveGoogleEmail(email);

    if (action === 'list_events') {
      const result = await GoogleOAuthService.listCalendarEvents(targetEmail, 15);
      return NextResponse.json({
        success: result.success,
        isLiveApi: result.isLiveApi,
        accountEmail: result.accountEmail,
        events: result.events,
        methodUsed: 'GET',
        endpoint: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        synchronizedAt: new Date().toISOString(),
        error: result.error
      });
    }

    if (action === 'delete_event') {
      const idToDelete = googleEventId || event?.googleCalendarEventId || event?.id;
      if (!idToDelete) {
        return NextResponse.json(
          { success: false, error: 'Se requiere googleEventId para eliminar el evento.' },
          { status: 400 }
        );
      }

      const result = await GoogleOAuthService.deleteCalendarEvent(targetEmail, idToDelete);
      return NextResponse.json({
        success: result.success,
        deletedEventId: result.deletedEventId,
        isLiveApi: result.isLiveApi,
        accountEmail: result.accountEmail,
        methodUsed: 'DELETE',
        endpoint: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${idToDelete}`,
        synchronizedAt: new Date().toISOString(),
        message: result.isLiveApi
          ? 'Evento eliminado en tiempo real del calendario primario de Google Calendar (DELETE API).'
          : 'Evento eliminado del registro institucional.'
      });
    }

    if (!event || !event.id || !event.date) {
      return NextResponse.json(
        { success: false, error: 'Datos de la cita o evento incompletos (id y fecha requeridos).' },
        { status: 400 }
      );
    }

    if (action === 'sync_event') {
      const result = await GoogleOAuthService.syncCalendarEvent(targetEmail, event);

      return NextResponse.json({
        success: result.success,
        googleEventId: result.googleEventId,
        htmlLink: result.htmlLink,
        isLiveApi: result.isLiveApi,
        accountEmail: result.accountEmail || targetEmail,
        methodUsed: result.methodUsed || (event.googleCalendarEventId ? 'PATCH' : 'POST'),
        synchronizedAt: new Date().toISOString(),
        event: {
          ...event,
          googleCalendarEventId: result.googleEventId,
          htmlLink: result.htmlLink
        },
        message: result.isLiveApi
          ? `Evento ${result.methodUsed === 'PATCH' ? 'actualizado (PATCH)' : 'creado (POST)'} exitosamente en la API oficial de Google Calendar.`
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

