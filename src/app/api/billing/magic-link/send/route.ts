import { NextRequest, NextResponse } from 'next/server';
import { magicLinkService } from '@/lib/magicLinkService';
import { formatWhatsAppPaymentNotification, formatEmailPaymentNotification } from '@/lib/notificationFormatter';

/**
 * Generador y Despachador de Recordatorios de Cobro con Magic Links
 * POST /api/billing/magic-link/send
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = `${protocol}://${host}`;

    // 1. Generar token criptográfico seguro y URL unívoca con baseUrl dinámico
    const linkResult = await magicLinkService.createMagicLink({
      invoiceId: invoiceId || 'inv-001',
      parentId: parentId || 'usr-parent-001',
      schoolId: schoolId || 'sch-001',
      hoursValid: 48,
      baseUrl: origin,
      metadata: { 
        requestedBy: 'coordinator', 
        timestamp: new Date().toISOString(),
        invoiceNumber: invoiceNumber || 'COL-2026-00452',
        concept: concept || 'Colegiatura Escolar',
        studentName: studentName || 'Alumno',
        parentName: parentName || 'Tutor Responsable',
        amount: Number(amount) || 3450.00,
        dueDate: dueDate || '10 de Septiembre de 2026'
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
      dueDate: dueDate || '10 de Septiembre de 2026',
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
