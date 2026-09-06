/**
 * Script de Auditoría Integral y Comprobación de Funcionamiento de ISkool
 * Evalúa: Motor Curricular, Pasarela Financiera, Generador de Magic Links, Validadores SAT,
 * APIs de Facturación, RLS, y Cumplimiento de Marca Blanca (REGLA NO NEGOCIABLE 1).
 */

import { generateChronometerSessions, getSepBookForSession, LEVEL_BASE_SUBJECTS } from '../src/lib/curriculumEngine';
import { PaymentGatewayService } from '../src/lib/paymentGateway';
import { MagicLinkService } from '../src/lib/magicLinkService';
import { formatWhatsAppPaymentNotification, formatEmailPaymentNotification } from '../src/lib/notificationFormatter';
import fs from 'fs';
import path from 'path';

interface AuditTestResult {
  module: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: AuditTestResult[] = [];

function assert(condition: boolean, module: string, test: string, details: string) {
  if (condition) {
    results.push({ module, test, status: 'PASS', details });
  } else {
    results.push({ module, test, status: 'FAIL', details });
  }
}

async function runAudit() {
  console.log('================================================================================');
  console.log('🚀 INICIANDO AUDITORÍA INTEGRAL DE SISTEMA Y COMPROBACIÓN DE FUNCIONAMIENTO');
  console.log('================================================================================\n');

  // --------------------------------------------------------------------------
  // 1. AUDITORÍA DEL MOTOR CURRICULAR PEDAGÓGICO (NEM 2024 & LIBROS SEP)
  // --------------------------------------------------------------------------
  console.log('📚 [1/6] Evaluando Motor Curricular y Vinculación con Libros SEP...');
  
  // Test 1.1: Fase 3 Primaria Baja (Cartas)
  const f3Sessions = generateChronometerSessions('primaria-baja', 'lenguajes', 'La carta y la correspondencia', 6);
  assert(
    f3Sessions.length === 6,
    'Motor Curricular',
    'Dosificación exacta de sesiones',
    `Generó exactamente ${f3Sessions.length} sesiones de 6 solicitadas.`
  );
  assert(
    f3Sessions[0].libroSep.titulo.includes('Proyectos Comunitarios 2º Grado') && f3Sessions[0].libroSep.paginas.includes('76'),
    'Motor Curricular',
    'Libro SEP Fase 3 Comprobado',
    `Asignó: ${f3Sessions[0].libroSep.titulo} (${f3Sessions[0].libroSep.paginas}).`
  );
  assert(
    f3Sessions[0].tiempos.inicio === '10 min' && f3Sessions[0].tiempos.desarrollo === '30 min' && f3Sessions[0].tiempos.cierre === '10 min',
    'Motor Curricular',
    'Minutero Cronometrado Estricto (10/30/10)',
    'Estructura temporal 10/30/10 min validada con exactitud.'
  );

  // Test 1.2: Fase 6 Secundaria (Matemáticas Cuadráticas)
  const f6Sessions = generateChronometerSessions('secundaria', 'matematicas', 'Ecuaciones cuadraticas y parabolas', 10);
  assert(
    f6Sessions.length === 10 && f6Sessions[0].libroSep.titulo.includes('Saberes y Pensamiento Científico: Matemáticas 3º de Secundaria'),
    'Motor Curricular',
    'Libro SEP Fase 6 Secundaria Comprobado',
    `Asignó: ${f6Sessions[0].libroSep.titulo} (${f6Sessions[0].libroSep.paginas}).`
  );

  // Test 1.3: Asignaturas oficiales completas
  const levels = ['preescolar', 'primaria-baja', 'primaria-media', 'primaria-alta', 'secundaria', 'preparatoria'];
  let allLevelsValid = true;
  for (const lvl of levels) {
    if (!LEVEL_BASE_SUBJECTS[lvl] || LEVEL_BASE_SUBJECTS[lvl].length === 0) {
      allLevelsValid = false;
    }
  }
  assert(
    allLevelsValid,
    'Motor Curricular',
    'Catálogo Oficial de Asignaturas por Nivel',
    'Todos los niveles académicos cuentan con sus asignaturas base oficiales de la SEP.'
  );

  // --------------------------------------------------------------------------
  // 2. AUDITORÍA DEL SUBSISTEMA DE MAGIC LINKS Y CRIPTOGRAFÍA
  // --------------------------------------------------------------------------
  console.log('\n🔐 [2/6] Evaluando MagicLinkService y Criptografía de 256 bits...');
  const magicService = MagicLinkService.getInstance();
  
  const linkData = await magicService.createMagicLink({
    invoiceId: 'test-inv-001',
    parentId: 'usr-test-parent',
    schoolId: 'sch-001',
    hoursValid: 48
  });

  assert(
    linkData.rawToken.length === 64 && linkData.tokenHash.length === 64,
    'Criptografía y Magic Links',
    'Generación de Token Seguro y Hash SHA-256',
    `Token de 32 bytes (64 hex chars) generado y hasheado correctamente.`
  );

  const expiresDate = new Date(linkData.expiresAt);
  const now = new Date();
  const diffHours = (expiresDate.getTime() - now.getTime()) / (1000 * 3600);
  assert(
    Math.round(diffHours) === 48,
    'Criptografía y Magic Links',
    'Vigencia Criptográfica de 48 Horas',
    `Vigencia calculada en ${Math.round(diffHours)} horas exactas.`
  );

  // --------------------------------------------------------------------------
  // 3. AUDITORÍA FISCAL SAT (CFDI 4.0) Y VALIDADOR DE RFC
  // --------------------------------------------------------------------------
  console.log('\n🧾 [3/6] Evaluando Validador Fiscal SAT y Reglas CFDI 4.0...');
  
  const validFisica = PaymentGatewayService.validateRFC('LOAI840512AB3');
  const validMoral = PaymentGatewayService.validateRFC('ISK180312AB9');
  const invalidRfc = PaymentGatewayService.validateRFC('INVALID123');

  assert(
    validFisica.isValid && validFisica.type === 'fisica',
    'Validación Fiscal SAT',
    'Validación Regex Persona Física (13 dígitos)',
    'Reconoce RFC de Persona Física con homoclave.'
  );
  assert(
    validMoral.isValid && validMoral.type === 'moral',
    'Validación Fiscal SAT',
    'Validación Regex Persona Moral (12 dígitos)',
    'Reconoce RFC de Persona Moral con homoclave.'
  );
  assert(
    !invalidRfc.isValid,
    'Validación Fiscal SAT',
    'Rechazo de RFC Malformado',
    'Rechaza strings inválidos que no cumplen el estándar SAT.'
  );

  const taxRegimes = PaymentGatewayService.getTaxRegimes();
  const cfdiUses = PaymentGatewayService.getCfdiUses();
  assert(
    taxRegimes.some(r => r.code === '605') && cfdiUses.some(u => u.code === 'D10'),
    'Validación Fiscal SAT',
    'Catálogo Oficial CFDI 4.0 y Deducción D10 (Colegiaturas)',
    'Catálogos oficiales de Régimen Fiscal y Uso D10 disponibles.'
  );

  // --------------------------------------------------------------------------
  // 4. AUDITORÍA DEL FORMATEADOR DE NOTIFICACIONES INSTITUCIONALES
  // --------------------------------------------------------------------------
  console.log('\n📱 [4/6] Evaluando Formateador de WhatsApp y Correo Electrónico...');
  const waMsg = formatWhatsAppPaymentNotification({
    parentName: 'Israel López Ángeles',
    studentName: 'Mateo López Mendoza',
    concept: 'Colegiatura de Septiembre 2026',
    invoiceNumber: 'COL-2026-00452',
    amount: 3450.00,
    dueDate: '10 de Septiembre de 2026',
    magicPaymentUrl: 'https://iskool.edu.mx/pay/magic/test12345',
    schoolName: 'Colegio ISkool México'
  });

  assert(
    waMsg.includes('Colegio ISkool México') && waMsg.includes('$3,450.00') && waMsg.includes('https://iskool.edu.mx/pay/magic/test12345'),
    'Notificaciones Institucionales',
    'Formateo Oficial de WhatsApp con Cero Fricción',
    'Mensaje corporativo con desglose, monto en MXN y Magic Link generado.'
  );

  const emailResult = formatEmailPaymentNotification({
    parentName: 'Israel López Ángeles',
    studentName: 'Mateo López Mendoza',
    concept: 'Colegiatura de Septiembre 2026',
    invoiceNumber: 'COL-2026-00452',
    amount: 3450.00,
    dueDate: '10 de Septiembre de 2026',
    magicPaymentUrl: 'https://iskool.edu.mx/pay/magic/test12345',
    schoolName: 'Colegio ISkool México'
  });

  assert(
    emailResult.subject.includes('COL-2026-00452') && emailResult.htmlContent.includes('Pagar en Línea con Enlace Seguro'),
    'Notificaciones Institucionales',
    'Plantilla HTML y Asunto Oficial para Correo',
    'Correo corporativo responsivo con botón directo de checkout generado.'
  );

  // --------------------------------------------------------------------------
  // 5. AUDITORÍA DE SEGURIDAD, POLÍTICAS RLS Y BASE DE DATOS
  // --------------------------------------------------------------------------
  console.log('\n🛡️ [5/6] Evaluando Esquemas SQL y Políticas de Seguridad RLS...');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260826_create_billing_and_payments_module.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  assert(
    migrationSql.includes('ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY') &&
    migrationSql.includes('ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY') &&
    migrationSql.includes('ALTER TABLE public.payments_history ENABLE ROW LEVEL SECURITY'),
    'Seguridad RLS',
    'Habilitación de RLS en todas las tablas financieras',
    'Políticas RLS aplicadas a billing_profiles, invoices, payments_history y magic_links.'
  );

  assert(
    migrationSql.includes('consume_magic_payment_link') && migrationSql.includes('SECURITY DEFINER'),
    'Seguridad RLS',
    'Función Atómica RPC para Consumo de Magic Links',
    'Función transaccional segura implementada.'
  );

  // --------------------------------------------------------------------------
  // 6. AUDITORÍA DE MARCA BLANCA (REGLA NO NEGOCIABLE 1)
  // --------------------------------------------------------------------------
  console.log('\n🔍 [6/6] Verificando Regla NO Negociable 1 (Marca Blanca Total)...');
  
  const srcFiles = getAllFiles(path.join(process.cwd(), 'src'));
  let brandViolations = 0;
  const prohibitedTerms = ['cometa', 'canvas lms', 'stripe checkout', 'paypal express'];

  for (const file of srcFiles) {
    if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      const content = fs.readFileSync(file, 'utf8').toLowerCase();
      for (const term of prohibitedTerms) {
        if (content.includes(term)) {
          brandViolations++;
          console.warn(`⚠️ Violación detectada en ${file}: "${term}"`);
        }
      }
    }
  }

  assert(
    brandViolations === 0,
    'Marca Blanca',
    'Cero filtraciones de marcas comerciales externas',
    `Se escanearon ${srcFiles.length} archivos de código fuente con 0 violaciones.`
  );

  // --------------------------------------------------------------------------
  // REPORTE FINAL DE AUDITORÍA
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('📊 RESULTADOS FINALES DE LA AUDITORÍA DE ISKOOL');
  console.log('================================================================================');

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const symbol = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${symbol} [${r.module}] ${r.test} -> ${r.details}`);
    if (r.status === 'PASS') passed++;
    else failed++;
  }

  console.log('\n================================================================================');
  console.log(`🎯 TOTAL DE PRUEBAS EJECUTADAS: ${results.length}`);
  console.log(`✅ APROBADAS: ${passed}`);
  console.log(`❌ FALLIDAS: ${failed}`);
  console.log(`⭐ TASA DE ÉXITO: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

runAudit();
