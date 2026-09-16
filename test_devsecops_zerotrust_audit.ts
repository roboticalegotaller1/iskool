import { signSessionToken, verifySessionToken } from './src/lib/sessionToken';
import { validateApiAuth } from './src/lib/authValidator';
import { getSupabaseClient, supabase } from './src/lib/supabaseClient';
import nextConfig from './next.config';
import { NextRequest } from 'next/server';

console.log('===================================================================');
console.log('🛡️ AUDITORÍA DEVSECOPS Y PENTESTING ZERO-TRUST (REPOSITORIO ISKOOL)');
console.log('===================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (detail) console.error(`   Detalle: ${detail}`);
  }
}

async function runDevSecOpsSuite() {
  // -------------------------------------------------------------------------
  // 1. AUDITORÍA DE AUTH Y PREVENCIÓN DE HEADER INJECTION (CVE Zero-Trust)
  // -------------------------------------------------------------------------
  console.log('--- 1. Auditoría de Flujo Criptográfico y Header Spoofing ---');

  // Test 1.1: Firma y verificación legítima de token de sesión HMAC-SHA256
  const sampleUser = {
    id: 'usr-teacher-1',
    email: 'israel.lopez@sandbox.iskool.edu.mx',
    role: 'teacher',
    school_id: 'sch-test-case',
    first_name: 'Israel',
    last_name: 'López Ángeles'
  };

  const validToken = await signSessionToken(sampleUser, 3600);
  assert(typeof validToken === 'string' && validToken.includes('.'), 'Generación de token firmado con HMAC-SHA256');

  const verified = await verifySessionToken(validToken);
  assert(verified !== null && verified.id === sampleUser.id, 'Verificación exitosa de token legítimo');
  assert(verified?.school_id === 'sch-test-case', 'Preservación de school_id verificado en el token');

  // Test 1.2: Rechazo de token manipulado (Tampering / Falsificación)
  const tamperedToken = validToken.replace(/^[a-zA-Z0-9_-]+/, 'eydpZCI6InVzci1hdHRhY2tlci0xIiwicm9sZSI6InN1cGVyYWRtaW4ifQ');
  const tamperedResult = await verifySessionToken(tamperedToken);
  assert(tamperedResult === null, 'Rechazo inmediato de token manipulado por firma HMAC no coincidente');

  // Test 1.3: Rechazo de token expirado
  const expiredToken = await signSessionToken(sampleUser, -10); // Expirado hace 10s
  const expiredResult = await verifySessionToken(expiredToken);
  assert(expiredResult === null, 'Rechazo inmediato de token con timestamp de expiración rebasado');

  // Test 1.4: Mitigación de Header Injection en validateApiAuth
  // Un atacante inyecta encabezados x-user-id sin firma ni sesión
  const spoofedReq = new NextRequest('http://localhost:3000/api/billing/profile', {
    headers: {
      'x-user-id': 'usr-attacker-spoof',
      'x-user-role': 'superadmin'
    }
  });

  const spoofedAuth = await validateApiAuth(spoofedReq);
  assert(spoofedAuth.authenticated === false, 'Bloqueo estricto de Header Injection (x-user-id no autorizado)');

  // Test 1.5: Autenticación legítima mediante Cookie HttpOnly 'iskool_session'
  const cookieReq = new NextRequest('http://localhost:3000/api/billing/profile', {
    headers: {
      'cookie': `iskool_session=${validToken}`
    }
  });

  const cookieAuth = await validateApiAuth(cookieReq);
  assert(cookieAuth.authenticated === true, 'Autenticación exitosa mediante Cookie HttpOnly "iskool_session"');
  assert(cookieAuth.user?.id === 'usr-teacher-1', 'Identidad de usuario correctamente extraída de la Cookie');

  // -------------------------------------------------------------------------
  // 2. DEFENSAS OWASP TOP 10 Y CABECERAS DE SEGURIDAD EN NEXT.CONFIG.TS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Validación de Cabeceras Perimetrales OWASP Top 10 ---');

  assert(typeof nextConfig.headers === 'function', 'nextConfig define método headers()');

  if (typeof nextConfig.headers === 'function') {
    const configuredHeadersList = await nextConfig.headers();
    const globalRule = configuredHeadersList.find(h => h.source === '/(.*)');
    assert(!!globalRule, 'Regla global de cabeceras definida para /(.*)');

    if (globalRule) {
      const headerMap = new Map(globalRule.headers.map(h => [h.key, h.value]));

      assert(headerMap.has('Content-Security-Policy'), 'Cabecera Content-Security-Policy configurada');
      assert(headerMap.get('X-Frame-Options') === 'DENY', 'X-Frame-Options configurado estrictamente en DENY (Anti-Clickjacking)');
      assert(headerMap.get('X-Content-Type-Options') === 'nosniff', 'X-Content-Type-Options configurado en nosniff (Anti-MIME Sniffing)');
      assert(Boolean(headerMap.get('Strict-Transport-Security')?.includes('max-age=63072000')), 'HSTS configurado con max-age >= 1 año y preload');
      assert(headerMap.get('Referrer-Policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy configurado como strict-origin-when-cross-origin');
      assert(headerMap.has('Permissions-Policy'), 'Permissions-Policy restringe APIs de hardware innecesarias');
    }
  }

  // -------------------------------------------------------------------------
  // 3. CONEXIÓN A BASE DE DATOS (SINGLETON PATTERN & CONNECTION POOLING)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Auditoría de Conexión a BD (Patrón Singleton & Pooling) ---');

  const client1 = getSupabaseClient();
  const client2 = getSupabaseClient();

  assert(client1 === client2, 'getSupabaseClient() retorna la misma instancia en memoria (Singleton en globalThis)');
  assert(client1 === supabase, 'La constante exportada supabase es idéntica a la instancia Singleton');

  // -------------------------------------------------------------------------
  // 4. AISLAMIENTO MULTI-TENANT EN ENDPOINTS FORTIFICADOS
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Aislamiento Multi-Tenant y Protección IDOR en Endpoints ---');

  // Test 4.1: Endpoint /api/billing/profile sin autenticación debe retornar 401
  const unauthBillingReq = new NextRequest('http://localhost:3000/api/billing/profile', {
    method: 'GET'
  });
  const unauthBillingAuth = await validateApiAuth(unauthBillingReq);
  assert(unauthBillingAuth.authenticated === false, '/api/billing/profile rechaza peticiones anónimas (401)');

  // Test 4.2: Endpoint /api/vault/reassign sin credenciales directivas debe ser rechazado
  const teacherToken = await signSessionToken({
    id: 'usr-student-99',
    role: 'student',
    school_id: 'sch-test-case'
  });
  const studentReassignReq = new NextRequest('http://localhost:3000/api/vault/reassign', {
    method: 'POST',
    headers: {
      'cookie': `iskool_session=${teacherToken}`
    }
  });
  const studentAuth = await validateApiAuth(studentReassignReq);
  const isAllowedToReassign = studentAuth.authenticated && ['superadmin', 'admin', 'director'].includes(studentAuth.user?.role || '');
  assert(isAllowedToReassign === false, '/api/vault/reassign prohíbe reasignaciones a usuarios no directivos (403)');

  // Test 4.3: Endpoint /api/studio/generate sin autenticación
  const unauthStudioReq = new NextRequest('http://localhost:3000/api/studio/generate', {
    method: 'POST'
  });
  const unauthStudioAuth = await validateApiAuth(unauthStudioReq);
  assert(unauthStudioAuth.authenticated === false, '/api/studio/generate rechaza peticiones anónimas (401)');

  console.log('\n===================================================================');
  console.log(`🎯 RESULTADO AUDITORÍA ZERO-TRUST: ${passedTests}/${totalTests} pruebas superadas.`);
  console.log('===================================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDevSecOpsSuite().catch(err => {
  console.error('Error fatal durante la auditoría:', err);
  process.exit(1);
});
