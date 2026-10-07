import { NextRequest, NextResponse } from 'next/server';
import { InboundMailSpoolService } from '@/lib/services/inboundMailSpool';

export const runtime = 'nodejs';

export interface RawGmailItem {
  id: string;
  sender_name: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  snippet: string;
  body_text: string;
  received_at: string;
  timestamp: string;
  is_unread: boolean;
  is_starred: boolean;
  is_important: boolean;
  category: 'principal' | 'actualizaciones' | 'promociones' | 'spam';
  triage_badge?: {
    quadrant: 'ATENCION_CEO' | 'DELEGADO_CON_SLA' | 'INFORMATIVO' | 'SPAM_DESCARTADO';
    label: string;
    color: string;
    linkedMatterId?: string;
  };
}

// Semilla canónica de correos recibidos en el buzón de la institución y Google Workspace
function getCanonicalRawEmails(accountEmail: string, tenantId: string): RawGmailItem[] {
  const targetEmail = accountEmail || 'israell35mac@gmail.com';
  
  return [
    {
      id: 'raw-msg-01',
      sender_name: 'israel LopezAngeles',
      sender_email: targetEmail,
      recipient_email: targetEmail,
      subject: 'Alumno herido',
      snippet: 'El alumno Patricio estrella fue herido ayer en las canchas de futball durante el horario de receso...',
      body_text: 'El alumno Patricio estrella fue herido ayer en las canchas de futball durante el horario de receso. Solicito saber qué protocolo médico se aplicó y si el colegio cuenta con seguro de gastos médicos mayores vigente para la atención inmediata.',
      received_at: 'Hoy, 16:42 hrs',
      timestamp: '16:42',
      is_unread: true,
      is_starred: true,
      is_important: true,
      category: 'principal',
      triage_badge: {
        quadrant: 'ATENCION_CEO',
        label: '🔴 ATENCIÓN INMEDIATA CEO',
        color: 'bg-red-50 text-red-700 border-red-200'
      }
    },
    {
      id: 'raw-msg-02',
      sender_name: 'Israel Lopez',
      sender_email: targetEmail,
      recipient_email: targetEmail,
      subject: 'CTE urgente',
      snippet: 'Se notifica que tendrá cte urgente mañana a las 3 pm ,confirme asistencia por favor...',
      body_text: 'Se notifica que tendrá cte urgente mañana a las 3 pm ,confirme asistencia por favor para preparar la sala de juntas de Dirección General y el orden del día curricular.',
      received_at: 'Hoy, 15:30 hrs',
      timestamp: '15:30',
      is_unread: true,
      is_starred: false,
      is_important: true,
      category: 'principal',
      triage_badge: {
        quadrant: 'DELEGADO_CON_SLA',
        label: '🟡 DELEGADO CON SLA',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    },
    {
      id: 'raw-msg-03',
      sender_name: 'Lic. Fernando Mendoza',
      sender_email: 'familia.mendoza@gmail.com',
      recipient_email: targetEmail,
      subject: 'Reincidencia: Queja formal por presunto acoso y convivencia en 5º B Campus Montes',
      snippet: 'La familia Mendoza reporta por 3ra ocasión agresiones verbales continuas en el recreo tras intervención inicial de Coordinación...',
      body_text: 'Estimada Dirección General:\n\nNos dirigimos a usted por tercera ocasión en 12 días porque a pesar de la intervención de Coordinación, nuestro hijo sigue sufriendo agresiones verbales constantes en el recreo por parte de dos compañeros. Exigimos una reunión presencial urgente con ambas familias antes de escalar el caso como queja formal ante la supervisión escolar de la SEP.\n\nAtentamente,\nLic. Fernando Mendoza Peña',
      received_at: 'Hoy, 08:14 hrs',
      timestamp: '08:14',
      is_unread: false,
      is_starred: true,
      is_important: true,
      category: 'principal',
      triage_badge: {
        quadrant: 'ATENCION_CEO',
        label: '🔴 ATENCIÓN INMEDIATA CEO',
        color: 'bg-red-50 text-red-700 border-red-200',
        linkedMatterId: 'mat-ibime-01'
      }
    },
    {
      id: 'raw-msg-04',
      sender_name: 'Ing. Carlos Ramírez',
      sender_email: 'carlos.ramirez@empresa.com',
      recipient_email: targetEmail,
      subject: 'Aclaración de facturación CFDI 4.0 y aplicación de descuento de hermanos en Campus Lagos',
      snippet: 'Padre de familia solicita actualización de factura electrónica correspondiente a octubre y corrección del descuento de hermanos...',
      body_text: 'Buen día Dirección y Administración:\n\nSolicito atentamente la reemisión de mi comprobante fiscal digital CFDI 4.0 del mes en curso con el complemento de colegiaturas IEDU corregido, así como la bonificación del descuento del 10% por segundo hermano en Campus Lagos.\n\nQuedo a la espera de su amable confirmación.',
      received_at: 'Hoy, 09:30 hrs',
      timestamp: '09:30',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'DELEGADO_CON_SLA',
        label: '🟡 DELEGADO TESORERÍA',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        linkedMatterId: 'mat-ibime-02'
      }
    },
    {
      id: 'raw-msg-05',
      sender_name: 'Comité de Padres Ruta 4',
      sender_email: 'padres.ruta4@ibime.edu.mx',
      recipient_email: targetEmail,
      subject: 'Demoras recurrentes en Ruta 4 de Transporte Escolar (Sede San Cristóbal)',
      snippet: '6 familias reportan demoras promedio de 22 minutos en la parada de la mañana durante los últimos tres días por obras en vía pública...',
      body_text: 'Estimada Dirección General:\n\nNos dirigimos a ustedes en representación de las familias usuarias de la Ruta 4 de transporte escolar. En los últimos tres días el autobús ha llegado con un retraso promedio de 22 minutos debido a obras viales en Av. Central. Solicitamos ajustar el horario de salida matutino 15 minutos antes.\n\nAtentamente,\nComité de Padres de Familia de Transporte',
      received_at: 'Ayer, 18:45 hrs',
      timestamp: 'Ayer',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'DELEGADO_CON_SLA',
        label: '🟡 DELEGADO LOGÍSTICA',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        linkedMatterId: 'mat-ibime-03'
      }
    },
    {
      id: 'raw-msg-06',
      sender_name: 'Supervisión Escolar Zona 14',
      sender_email: 'supervision.zona14@edomex.gob.mx',
      recipient_email: targetEmail,
      subject: 'Recepción y acuse oficial de Folio de Matrícula ante Supervisión de Zona SEP',
      snippet: 'Oficio de la Supervisión de Zona 14 confirmando la recepción y validación de las listas de matrícula del ciclo escolar 2026-2027 sin observaciones...',
      body_text: 'Por medio del presente oficio notificamos a la Dirección General de la Institución que el trámite de entrega de listas de matrícula para el ciclo escolar 2026-2027 ha sido recibido y cotejado satisfactoriamente, otorgando el sello y folio oficial de validación sin observaciones.',
      received_at: '04 Oct 2026',
      timestamp: '4 oct',
      is_unread: false,
      is_starred: true,
      is_important: true,
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'INFORMATIVO',
        label: '🟢 INFORMATIVO SEP',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        linkedMatterId: 'mat-ibime-04'
      }
    },
    {
      id: 'raw-msg-07',
      sender_name: 'ASM Careers Team',
      sender_email: 'no-reply@asm-careers.global',
      recipient_email: targetEmail,
      subject: 'ASM Careers: Oportunidades docentes internacionales y certificaciones',
      snippet: 'Conoce las nuevas convocatorias de capacitación y programas de vinculación docente internacional para colegios bilingües...',
      body_text: 'Estimada comunidad directiva:\n\nLes extendemos la cordial invitación a conocer las convocatorias de contratación y certificaciones docentes internacionales del ciclo 2026.\n\nPueden postular o consultar las bases en nuestro portal institucional.',
      received_at: 'Ayer, 14:10 hrs',
      timestamp: 'Ayer',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'promociones',
      triage_badge: {
        quadrant: 'SPAM_DESCARTADO',
        label: '⚪ PROMOCIÓN EXTERNA',
        color: 'bg-slate-100 text-slate-600 border-slate-200'
      }
    },
    {
      id: 'raw-msg-08',
      sender_name: 'Agencia Digital WebPro',
      sender_email: 'ventas@webpro-servicios.com',
      recipient_email: targetEmail,
      subject: 'Diseño para su web escolar y optimización de hosting con IA',
      snippet: 'Hola, visitamos su portal escolar y detectamos oportunidades para mejorar su velocidad de carga y posicionamiento orgánico...',
      body_text: 'Estimada Dirección General:\n\nNos ponemos en contacto para ofrecerles nuestra auditoría gratuita de velocidad y rediseño para portales de colegios privados.\n\nQuedamos a sus órdenes para una demostración virtual.',
      received_at: '05 Oct 2026',
      timestamp: '5 oct',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'promociones',
      triage_badge: {
        quadrant: 'SPAM_DESCARTADO',
        label: '⚪ PROSPECCIÓN COMERCIAL',
        color: 'bg-slate-100 text-slate-600 border-slate-200'
      }
    },
    {
      id: 'raw-msg-09',
      sender_name: 'Ventas Nacionales Mobiliario',
      sender_email: 'ofertas@muebles-escolares-mx.com',
      recipient_email: targetEmail,
      subject: 'Gran liquidación de bancas y pizarrones inteligentes 50% de descuento',
      snippet: 'Remate especial de mobiliario escolar para renovación de aulas. Entrega inmediata en todo el país...',
      body_text: 'Estimada Institución Educativa:\n\nAproveche nuestros precios de remate en bancas ergonómicas y pizarrones interactivos para su institución con entrega sin costo.',
      received_at: 'Hoy, 06:45 hrs',
      timestamp: '06:45',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'promociones',
      triage_badge: {
        quadrant: 'SPAM_DESCARTADO',
        label: '⚪ SPAM COMERCIAL',
        color: 'bg-slate-100 text-slate-600 border-slate-200'
      }
    },
    {
      id: 'raw-msg-10',
      sender_name: 'Invitaciones VIP Marketing',
      sender_email: 'invitaciones@marketing-digital-latam.org',
      recipient_email: targetEmail,
      subject: 'Invitación VIP al Simposio de Tendencias en Captación de Alumnos',
      snippet: 'Boletín de prospección externa con accesos preferenciales para directores de colegios privados...',
      body_text: 'Le invitamos a participar en el Simposio Iberoamericano de Captación de Matrícula para instituciones educativas particulares.',
      received_at: 'Hoy, 07:12 hrs',
      timestamp: '07:12',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'promociones',
      triage_badge: {
        quadrant: 'SPAM_DESCARTADO',
        label: '⚪ PUBLICIDAD EXTERNA',
        color: 'bg-slate-100 text-slate-600 border-slate-200'
      }
    },
    {
      id: 'raw-msg-11',
      sender_name: 'Encuestas y Premios Express',
      sender_email: 'reward-alert@global-surveys-win.xyz',
      recipient_email: targetEmail,
      subject: 'Has sido seleccionado para reclamar un bono de regalo en línea',
      snippet: 'Haz clic aquí para confirmar tu participación y recibir una tarjeta de regalo por valor de $500...',
      body_text: 'Felicidades, tu cuenta de correo ha sido elegida al azar para reclamar un incentivo digital inmediato completando 3 preguntas.',
      received_at: 'Ayer, 23:18 hrs',
      timestamp: 'Ayer',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'spam',
      triage_badge: {
        quadrant: 'SPAM_DESCARTADO',
        label: '⛔ SPAM MALICIOSO / PHISHING',
        color: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'sch-ibime';
    const email = searchParams.get('email') || 'israell35mac@gmail.com';

    const baseEmails = getCanonicalRawEmails(email, tenantId);

    // Incorporar cualquier correo que esté en el spool dinámico de entrada
    const spoolEmails = InboundMailSpoolService.getPendingEmails(tenantId);
    const additionalFromSpool: RawGmailItem[] = [];

    for (const item of spoolEmails) {
      const alreadyInList = baseEmails.some(
        e => e.subject.trim().toLowerCase() === item.subject.trim().toLowerCase()
      );
      if (!alreadyInList) {
        additionalFromSpool.push({
          id: item.id,
          sender_name: item.sender_name || 'Remitente Institucional',
          sender_email: item.sender_email || email,
          recipient_email: item.recipient_email || email,
          subject: item.subject,
          snippet: (item.body_text || item.subject || '').slice(0, 110) + '...',
          body_text: item.body_text || 'Sin contenido de mensaje',
          received_at: 'Justo ahora',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_unread: true,
          is_starred: false,
          is_important: true,
          category: 'principal',
          triage_badge: {
            quadrant: 'ATENCION_CEO',
            label: '🔴 ATENCIÓN INMEDIATA CEO',
            color: 'bg-red-50 text-red-700 border-red-200'
          }
        });
      }
    }

    const allEmails = [...additionalFromSpool, ...baseEmails];

    return NextResponse.json({
      success: true,
      emails: allEmails,
      total: allEmails.length,
      unreadCount: allEmails.filter(e => e.is_unread).length,
      connectedEmail: email,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al obtener correos en tiempo real'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'sch-ibime';
    const email = body.email || 'israell35mac@gmail.com';

    const baseEmails = getCanonicalRawEmails(email, tenantId);

    return NextResponse.json({
      success: true,
      emails: baseEmails,
      total: baseEmails.length,
      unreadCount: baseEmails.filter(e => e.is_unread).length,
      connectedEmail: email,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al sincronizar bandeja de entrada'
    }, { status: 500 });
  }
}
