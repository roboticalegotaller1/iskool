import { NextRequest, NextResponse } from 'next/server';
import { magicLinkService } from '@/lib/magicLinkService';
import { formatWhatsAppPaymentNotification, formatEmailPaymentNotification } from '@/lib/notificationFormatter';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

/**
 * Generador y Despachador de Recordatorios de Cobro con Magic Links
 * POST /api/billing/magic-link/send
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado. Se requiere sesión activa para emitir enlaces de cobro.'
      }, { status: 401 });
    }

    const allowedRoles = ['admin', 'superadmin', 'director', 'coordinator', 'billing', 'owner', 'ceo'];
    if (!auth.user.role || !allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Prohibido: Rol no autorizado para generar enlaces de pago.'
      }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Cuerpo JSON inválido o malformado.'
      }, { status: 400 });
    }
    const { 
      invoiceId, 
      parentId, 
      schoolId, 
      parentName, 
      studentName, 
      concept, 
      invoiceNumber, 
      amount, 
      dueDate, 
      schoolName 
    } = body;

    const isSuper = isPlatformSuperUser(auth.user);
    const resolvedSchoolId = isSuper
      ? (schoolId || auth.user.school_id || 'sch-001')
      : (auth.user.school_id || 'sch-001');

    if (!isSuper && schoolId && auth.user.school_id && schoolId !== auth.user.school_id) {
      return NextResponse.json({
        success: false,
        error: 'Acceso denegado: no puedes emitir enlaces de cobro para otro colegio.'
      }, { status: 403 });
    }

    // URL canónica sin lectura manipulable de cabecera Host
    const canonicalOrigin = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://iskool.mx')
    ).replace(/\/$/, '');

    // 1. Generar token criptográfico seguro y URL unívoca con origen canónico
    const linkResult = await magicLinkService.createMagicLink({
      invoiceId: invoiceId || 'inv-001',
      parentId: parentId || 'usr-parent-001',
      schoolId: resolvedSchoolId,
      hoursValid: 48,
      baseUrl: canonicalOrigin,
      metadata: { 
        requestedBy: 'coordinator', 
        timestamp: new Date().toISOString(),
        invoiceNumber: invoiceNumber || 'COL-2026-00452',
        concept: concept || 'Colegiatura Escolar',
        studentName: studentName || 'Alumno',
        parentName: parentName || 'Tutor Responsable',
        amount: Number(amount) || 3450.00,
        dueDate: dueDate || '14 de Diciembre de 2026'
      }
    });

    // 2. Formatear mensaje para WhatsApp y Correo
    const notificationData = {
      parentName: parentName || 'Tutor Responsable',
      studentName: studentName || 'Alumno',
      concept: concept || 'Colegiatura Escolar',
      invoiceNumber: invoiceNumber || 'COL-2026-00000',
      amount: Number(amount) || 3450.00,
      currency: 'MXN',
      dueDate: dueDate || '14 de Diciembre de 2026',
      magicPaymentUrl: linkResult.paymentUrl,
      schoolName: schoolName || 'Colegio ISkool México',
      schoolEmail: 'cobranza@iskool.edu.mx'
    };

    const whatsAppMessage = formatWhatsAppPaymentNotification(notificationData);
    const emailData = formatEmailPaymentNotification(notificationData);

    return NextResponse.json({
      success: true,
      message: 'Recordatorio y Magic Link generados exitosamente.',
      paymentUrl: linkResult.paymentUrl,
      expiresAt: linkResult.expiresAt,
      whatsAppMessage,
      emailSubject: emailData.subject,
      emailPlainText: emailData.plainText
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al generar enlace de pago.',
        ...(process.env.NODE_ENV !== 'production' ? { details: error?.message } : {})
      },
      { status: 500 }
    );
  }
}
