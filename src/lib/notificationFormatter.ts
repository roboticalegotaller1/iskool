/**
 * Formateador de Notificaciones Institucionales de Cobranza y Magic Links (ISkool)
 * Tono: Sumamente formal, educado, institucional y corporativo.
 * Canales: Mensajería Instantánea (WhatsApp) y Correo Electrónico (HTML / Texto).
 * Cero Gamificación • Seguridad Bancaria
 */

export interface InvoiceNotificationData {
  parentName: string;
  studentName: string;
  concept: string; // e.g. "Colegiatura Septiembre 2026"
  invoiceNumber: string; // e.g. "COL-2026-00124"
  amount: number; // e.g. 3450.00
  currency?: string; // "MXN"
  dueDate: string; // e.g. "10 de Septiembre de 2026" o "YYYY-MM-DD"
  magicPaymentUrl: string; // URL unívoca del Magic Link
  schoolName?: string; // e.g. "Colegio ISkool México"
  schoolPhone?: string; // e.g. "55 1234 5678"
  schoolEmail?: string; // e.g. "cobranza@iskool.edu.mx"
}

/**
 * Formateador de moneda en pesos mexicanos
 */
function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Formatear mensaje para envío por WhatsApp
 */
export function formatWhatsAppPaymentNotification(data: InvoiceNotificationData): string {
  const school = data.schoolName || 'ISkool Educación';
  const formattedAmount = formatCurrency(data.amount, data.currency || 'MXN');

  return `🏛️ *${school}*
*Departamento de Administración y Finanzas*

Estimado(a) *${data.parentName}*,

Le saludamos cordialmente. A través del presente medio institucional, le informamos que se encuentra disponible el estado de cuenta y ficha digital de pago correspondiente a su hijo(a) *${data.studentName}*.

📋 *Detalle del Cargo:*
• *Concepto:* ${data.concept}
• *Folio de Control:* ${data.invoiceNumber}
• *Monto a Liquidar:* ${formattedAmount}
• *Fecha Límite de Pago:* ${data.dueDate}

🔒 *Acceso Seguro a Pasarela de Pagos (Sin Contraseña):*
Puede consultar su desglose y realizar su pago en línea con tarjeta bancaria o transferencia electrónica SPEI inmediata ingresando al siguiente enlace seguro:

👉 ${data.magicPaymentUrl}

_Nota de Seguridad: Este enlace es personal, confidencial y cuenta con una vigencia de 48 horas. Al ingresar no se le solicitarán contraseñas de acceso._

En caso de requerir aclaraciones o asistencia con su comprobante fiscal, ponemos a su disposición nuestro canal de atención:
📧 ${data.schoolEmail || 'administracion@iskool.edu.mx'}
📞 ${data.schoolPhone || 'Atención a Padres de Familia'}

Agradecemos su puntual compromiso con la formación académica de su hijo(a).

Atentamente,
*Dirección Administrativa — ${school}*`;
}

/**
 * Formatear asunto y cuerpo de correo electrónico institucional (HTML y Texto Plano)
 */
export function formatEmailPaymentNotification(data: InvoiceNotificationData): {
  subject: string;
  plainText: string;
  htmlContent: string;
} {
  const school = data.schoolName || 'ISkool Educación';
  const formattedAmount = formatCurrency(data.amount, data.currency || 'MXN');
  const subject = `[${school}] Notificación de Estado de Cuenta y Pago Digital — Folio ${data.invoiceNumber}`;

  const plainText = `ESTADO DE CUENTA Y PAGO DIGITAL
${school} — Dirección Administrativa y Cobranza

Estimado(a) ${data.parentName},

Le informamos que se ha generado la ficha digital de pago correspondiente al alumno(a) ${data.studentName}.

DETALLE DEL CARGO:
----------------------------------------
Concepto: ${data.concept}
Folio de Control: ${data.invoiceNumber}
Monto Total: ${formattedAmount}
Fecha Límite: ${data.dueDate}
----------------------------------------

Para realizar su pago de forma segura y sin necesidad de ingresar contraseñas, por favor utilice el siguiente enlace institucional:
${data.magicPaymentUrl}

(Vigencia del enlace: 48 horas. Válido para pago con Tarjeta de Crédito, Débito o SPEI con confirmación automática).

Si requiere factura electrónica (CFDI), podrá actualizar sus datos fiscales directamente en el portal antes de confirmar la transacción.

Atentamente,
Departamento de Cobranza y Facturación
${school}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación Institucional de Pago</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Encabezado Institucional -->
    <tr>
      <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
        <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.025em;">${school}</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">Coordinación Administrativa y Financiera</p>
      </td>
    </tr>

    <!-- Cuerpo del Mensaje -->
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
          Estimado(a) <strong>${data.parentName}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
          Le informamos que se encuentra disponible la ficha de cobro digital correspondiente al ciclo académico de su hijo(a) <strong>${data.studentName}</strong>.
        </p>

        <!-- Tarjeta de Resumen Financiero -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
          <tr>
            <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Concepto:</td>
            <td style="font-size: 14px; font-weight: 600; color: #0f172a; text-align: right; padding-bottom: 6px;">${data.concept}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Folio de Control:</td>
            <td style="font-size: 14px; font-weight: 600; color: #0f172a; text-align: right; padding-bottom: 6px;">${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Fecha de Vencimiento:</td>
            <td style="font-size: 14px; font-weight: 600; color: #b91c1c; text-align: right; padding-bottom: 6px;">${data.dueDate}</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1;">
            <td style="font-size: 15px; font-weight: 700; color: #0f172a; padding-top: 10px;">Total a Pagar:</td>
            <td style="font-size: 18px; font-weight: 800; color: #0f172a; text-align: right; padding-top: 10px;">${formattedAmount}</td>
          </tr>
        </table>

        <!-- Botón de Acción Principal (Magic Link) -->
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${data.magicPaymentUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
            Pagar en Línea con Enlace Seguro
          </a>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0; text-align: center;">
          🔒 Este botón le dirige de forma directa a la pasarela bancaria cifrada sin requerir contraseña. Válido por 48 horas.
        </p>
      </td>
    </tr>

    <!-- Pie de Página -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          ${school} • Departamento de Cobranza y Finanzas<br>
          Para asistencia comuníquese a <a href="mailto:${data.schoolEmail || 'cobranza@iskool.edu.mx'}" style="color: #64748b;">${data.schoolEmail || 'cobranza@iskool.edu.mx'}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return {
    subject,
    plainText,
    htmlContent
  };
}
