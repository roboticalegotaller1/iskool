import { createClient } from '@supabase/supabase-js';
import { CognitiveTriageService } from '../src/lib/services/cognitive-triage.service';
import { PatternMemoryBridgeService } from '../src/lib/services/pattern-memory-bridge.service';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno locales si no están presentes
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const DEMO_SCHOOL_ID = '938fa492-4ddc-4f6f-80d7-1bd054af8536';
const DEMO_CEO_USER_ID = 'ceo-israel-lopez';
const DEMO_ACCOUNT_EMAIL = 'direccion@colegiohorizonte.edu.mx';

async function seedDemoData() {
  console.log('🚀 Iniciando siembra sintética para Demo de Dirección (Colegio Horizonte)...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Asegurar cuenta demo
  const { data: account, error: accError } = await supabase
    .from('email_accounts')
    .upsert({
      school_id: DEMO_SCHOOL_ID,
      user_id: DEMO_CEO_USER_ID,
      email_address: DEMO_ACCOUNT_EMAIL,
      provider: 'google_workspace',
      is_active: true,
      shadow_mode: true,
      sync_status: 'IDLE'
    }, { onConflict: 'email_address' })
    .select()
    .single();

  if (accError || !account) {
    console.warn('Nota: Si no hay conexión activa a Supabase o tabla no migrada, simulamos ID de cuenta para pruebas.');
  }

  const accountId = account?.id || 'demo-email-account-id';
  console.log(`✓ Cuenta de correo vinculada: ${DEMO_ACCOUNT_EMAIL}`);

  const emailsBatch = [];

  // PATRÓN 1: 17 correos sobre el horario del festival del viernes
  for (let i = 1; i <= 17; i++) {
    emailsBatch.push({
      school_id: DEMO_SCHOOL_ID,
      email_account_id: accountId,
      gmail_message_id: `msg_fest_${i}_${Date.now()}`,
      gmail_thread_id: `th_fest_${i}`,
      received_at: new Date(Date.now() - (i * 12 * 60 * 1000)).toISOString(),
      sender_email: `familia.alumno${i}@gmail.com`,
      sender_name: `Familia Ramírez ${i}`,
      recipient_emails: [DEMO_ACCOUNT_EMAIL],
      subject: i % 2 === 0 ? 'Duda sobre hora de salida del festival de primavera' : 'Horario del festival del viernes',
      body_text: 'Buenos días Directora, quisiéramos saber con exactitud a qué hora termina el festival del viernes para organizar el transporte de nuestro hijo.'
    });
  }

  // PATRÓN 2: 23 correos sobre retrasos en la Ruta 4 de transporte
  for (let i = 1; i <= 23; i++) {
    emailsBatch.push({
      school_id: DEMO_SCHOOL_ID,
      email_account_id: accountId,
      gmail_message_id: `msg_transp_${i}_${Date.now()}`,
      gmail_thread_id: `th_transp_${i}`,
      received_at: new Date(Date.now() - (i * 4 * 3600 * 1000)).toISOString(),
      sender_email: `padre.transporte${i}@outlook.com`,
      sender_name: `Padre de Familia Ruta 4 #${i}`,
      recipient_emails: [DEMO_ACCOUNT_EMAIL],
      subject: 'Retraso continuo con el camión escolar de la Ruta 4',
      body_text: 'Estimada Dirección: nuevamente el camión de la ruta 4 llegó con más de 25 minutos de demora por la mañana en la parada de Valle Real.'
    });
  }

  // REINCIDENCIA CRÍTICA: 5 correos de la misma familia de 5º B (Convivencia)
  for (let i = 1; i <= 5; i++) {
    emailsBatch.push({
      school_id: DEMO_SCHOOL_ID,
      email_account_id: accountId,
      gmail_message_id: `msg_convivencia_${i}_${Date.now()}`,
      gmail_thread_id: 'th_convivencia_5b_reincidente',
      received_at: new Date(Date.now() - ((6 - i) * 2 * 24 * 3600 * 1000)).toISOString(),
      sender_email: 'familia.mendoza.5b@gmail.com',
      sender_name: 'Sra. Patricia Mendoza (5º B)',
      recipient_emails: [DEMO_ACCOUNT_EMAIL],
      subject: 'Reincidencia: situación de acoso y convivencia en 5º B',
      body_text: 'Directora Angélica: es la tercera ocasión en dos semanas que le escribo. La Coordinación intervino pero la situación de agresión verbal contra mi hijo continúa en el recreo. Solicitamos su intervención directa.'
    });
  }

  // 23 CASOS ADICIONALES PARA DIRECCIÓN (Total 28 que requieren atención de Angélica)
  for (let i = 1; i <= 23; i++) {
    emailsBatch.push({
      school_id: DEMO_SCHOOL_ID,
      email_account_id: accountId,
      gmail_message_id: `msg_dir_urg_${i}_${Date.now()}`,
      gmail_thread_id: `th_dir_urg_${i}`,
      received_at: new Date(Date.now() - (i * 3600 * 1000)).toISOString(),
      sender_email: `autoridad.educativa${i}@sep.gob.mx`,
      sender_name: `Inspección Escolar Zona ${i}`,
      recipient_emails: [DEMO_ACCOUNT_EMAIL],
      subject: `Notificación Oficial Urgente de Dirección - Oficio ${i}/2026`,
      body_text: 'Por medio del presente se requiere la comparecencia y firma de la Directora General para la validación de la matrícula escolar.'
    });
  }

  // DELEGABLES ADMINISTRACIÓN / FACTURACIÓN (90 correos)
  for (let i = 1; i <= 90; i++) {
    emailsBatch.push({
      school_id: DEMO_SCHOOL_ID,
      email_account_id: accountId,
      gmail_message_id: `msg_factura_${i}_${Date.now()}`,
      gmail_thread_id: `th_factura_${i}`,
      received_at: new Date(Date.now() - (i * 1800 * 1000)).toISOString(),
      sender_email: `pagos.tutor${i}@empresa.com`,
      sender_name: `Tutor Factura ${i}`,
      recipient_emails: [DEMO_ACCOUNT_EMAIL],
      subject: `Comprobante de pago y solicitud de factura folio ${1000 + i}`,
      body_text: 'Adjunto el comprobante de pago de la colegiatura correspondiente al mes en curso. Solicito la factura a nombre de mi razón social.'
    });
  }

  // INFORMATIVOS / BOLETINES / NORMAL (120 correos)
  for (let i = 1; i <= 120; i++) {
    emailsBatch.push({
      school_id: DEMO_SCHOOL_ID,
      email_account_id: accountId,
      gmail_message_id: `msg_info_${i}_${Date.now()}`,
      gmail_thread_id: `th_info_${i}`,
      received_at: new Date(Date.now() - (i * 1200 * 1000)).toISOString(),
      sender_email: `newsletter${i}@santillana.com.mx`,
      sender_name: `Boletín Pedagógico ${i}`,
      recipient_emails: [DEMO_ACCOUNT_EMAIL],
      subject: `Actualización pedagógica y catálogo editorial volumen ${i}`,
      body_text: 'Estimada comunidad escolar, ponemos a su disposición los nuevos recursos didácticos disponibles para el ciclo escolar.'
    });
  }

  // SPAM AISLADO (19 correos)
  for (let i = 1; i <= 19; i++) {
    emailsBatch.push({
      school_id: DEMO_SCHOOL_ID,
      email_account_id: accountId,
      gmail_message_id: `msg_spam_${i}_${Date.now()}`,
      gmail_thread_id: `th_spam_${i}`,
      received_at: new Date(Date.now() - (i * 600 * 1000)).toISOString(),
      sender_email: `promocion.ganador${i}@spamserver.net`,
      sender_name: 'Premios Inmediatos',
      recipient_emails: [DEMO_ACCOUNT_EMAIL],
      subject: '¡Ganaste un premio millonario en casino online, click here now!',
      body_text: 'Felicidades, tu cuenta fue seleccionada para recibir criptomonedas y un préstamo inmediato sin buró de crédito.'
    });
  }

  console.log(`Total de correos sintéticos estructurados: ${emailsBatch.length}`);

  let processedCount = 0;
  for (const email of emailsBatch) {
    try {
      await CognitiveTriageService.ingestEmail(email);
    } catch (e: any) {
      console.warn(`Error procesando correo ${email.gmail_message_id}:`, e.message);
    }
    processedCount++;
    if (processedCount % 50 === 0) {
      console.log(`Procesados ${processedCount} / ${emailsBatch.length} correos...`);
    }
  }

  console.log('Evaluando patrones proactivos post-siembra...');
  try {
    await PatternMemoryBridgeService.evaluateGlobalPatterns(DEMO_SCHOOL_ID);
  } catch (e: any) {
    console.warn('Nota en evaluación de patrones:', e.message);
  }

  console.log('✅ Siembra completada con éxito. Listo para demostración a Dirección.');
}

seedDemoData().catch(console.error);
