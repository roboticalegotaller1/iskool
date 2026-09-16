/**
 * @file test_simulator_security_handshake.ts
 * @description Suite de Pruebas de Seguridad para el Blindaje Criptográfico de Simuladores y Juegos de ISkool.
 * 
 * Verifica:
 * 1. Generación y Verificación Criptográfica HMAC-SHA256 con Nonce.
 * 2. Rechazo ante manipulaciones de firma (Tampered Token / Spoofing).
 * 3. Rechazo ante tokens expirados.
 * 4. Invalidador de Sesión Única (Prevención de Replay Attacks).
 * 5. Rechazo ante telemetría biológicamente implausible (tiempo < umbral mínimo).
 * 6. Rechazo ante tasa de interacción sobrehumana (> 20 CPS / scripts de consola).
 * 7. Aceptación de telemetría humana plausible.
 * 8. Validación estricta de la lista blanca de orígenes postMessage.
 */

import { 
  createGameSessionToken, 
  verifyGameSessionToken, 
  consumedSessionsCache, 
  validateGameTelemetry, 
  isAllowedSimulatorOrigin,
  getMinimumPlausibleTime
} from '../src/lib/gameSecurity';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function runSecuritySuite() {
  console.log('\n=============================================================');
  console.log('🛡️  SUITE DE PRUEBAS DE SEGURIDAD CRIPTOGRÁFICA PARA JUEGOS  🛡️');
  console.log('=============================================================\n');

  consumedSessionsCache.resetForTesting();

  // -------------------------------------------------------------
  // TEST 1: Handshake Criptográfico Válido
  // -------------------------------------------------------------
  console.log('--- 1. GENERACIÓN Y VERIFICACIÓN DE TOKEN CON HMAC Y NONCE ---');
  const studentId = 'usr_student_test_101';
  const simulatorId = 'phet-forces-motion';
  const difficulty = 'medium';

  const { token, payload } = createGameSessionToken({
    studentId,
    simulatorId,
    difficulty
  });

  assert(Boolean(token && token.includes('.')), 'Token generado con estructura Base64URL separada por punto');
  assert(Boolean(payload.nonce && payload.nonce.length >= 16), 'Nonce criptográfico aleatorio presente y suficiente');
  assert(payload.studentId === studentId, 'studentId coincide en el payload');
  assert(payload.simulatorId === simulatorId, 'simulatorId coincide en el payload');

  const verification = verifyGameSessionToken(token);
  assert(verification.isValid === true, 'Firma HMAC-SHA256 verificada con éxito por el servidor');
  assert(verification.payload?.sessionId === payload.sessionId, 'SessionId preservado íntegramente tras descifrado');

  // -------------------------------------------------------------
  // TEST 2: Rechazo de Token Manipulado (Tampering / Signature Spoofing)
  // -------------------------------------------------------------
  console.log('\n--- 2. DETECCIÓN Y RECHAZO DE FIRMA MANIPULADA ---');
  const [b64Payload, b64Sig] = token.split('.');
  // Modificar un caracter del payload simulando inyección de estudiante o puntaje
  const tamperedPayload = b64Payload.slice(0, -2) + 'XX';
  const tamperedToken = `${tamperedPayload}.${b64Sig}`;

  const tamperedResult = verifyGameSessionToken(tamperedToken);
  assert(tamperedResult.isValid === false, 'Token con payload adulterado es rechazado');
  assert(Boolean(tamperedResult.error?.includes('Firma criptográfica inválida')), 'Mensaje de alerta de firma inválida emitido');

  // -------------------------------------------------------------
  // TEST 3: Rechazo de Token Expirado (TTL Exceeded)
  // -------------------------------------------------------------
  console.log('\n--- 3. DETECCIÓN Y RECHAZO DE TOKEN EXPIRADO ---');
  const expiredSession = createGameSessionToken({
    studentId,
    simulatorId,
    customTtlMs: -5000 // Expiró hace 5 segundos
  });

  const expiredResult = verifyGameSessionToken(expiredSession.token);
  assert(expiredResult.isValid === false, 'Token expirado es rechazado');
  assert(Boolean(expiredResult.error?.includes('ha expirado')), 'Mensaje de token expirado correcto');

  // -------------------------------------------------------------
  // TEST 4: Invalidador de Sesión Única (Anti-Replay Attack)
  // -------------------------------------------------------------
  console.log('\n--- 4. PROTECCIÓN ANTI-REPLAY (INVALIDADOR DE SESIÓN ÚNICA) ---');
  const replaySessionId = payload.sessionId;

  // Primer consumo (debe ser aprobado)
  const firstConsume = consumedSessionsCache.consume(replaySessionId);
  assert(firstConsume === true, 'Primer canje de sesión autorizado exitosamente');

  // Segundo consumo con el mismo sessionId (ataque de repetición)
  const secondConsume = consumedSessionsCache.consume(replaySessionId);
  assert(secondConsume === false, 'Ataque de repetición bloqueado: El segundo canje con el mismo token es revocado');

  // Verificación de estado
  assert(consumedSessionsCache.isConsumed(replaySessionId) === true, 'La sesión permanece registrada como consumida');

  // -------------------------------------------------------------
  // TEST 5: Telemetría Biológicamente Plausible - Tiempo Mínimo
  // -------------------------------------------------------------
  console.log('\n--- 5. VALIDACIÓN DE TIEMPO MÍNIMO BIOLÓGICAMENTE PLAUSIBLE ---');
  const minTimeMedium = getMinimumPlausibleTime('medium'); // 15s

  // Intento de canje a los 2 segundos (imposible para un humano)
  const cheatFastTelemetry = validateGameTelemetry({
    timeSpentSeconds: 2.5,
    interactionCount: 5
  }, 'medium');

  assert(cheatFastTelemetry.isValid === false, 'Telemetría de 2.5s rechazada por tiempo biológicamente imposible');
  assert(cheatFastTelemetry.code === 'INSUFFICIENT_TIME', 'Código de error INSUFFICIENT_TIME emitido');

  // -------------------------------------------------------------
  // TEST 6: Tasa de Clics Sobrehumana (Bot / Console Script)
  // -------------------------------------------------------------
  console.log('\n--- 6. DETECCIÓN DE TASA DE CLICS SOBREHUMANA (BOTS) ---');
  // 300 clics en 10 segundos = 30 CPS (tasa no humana)
  const botTelemetry = validateGameTelemetry({
    timeSpentSeconds: 15,
    interactionCount: 450
  }, 'medium');

  assert(botTelemetry.isValid === false, 'Tasa de 30 CPS rechazada por ser sobrehumana');
  assert(botTelemetry.code === 'INHUMAN_CLICK_RATE', 'Código de error INHUMAN_CLICK_RATE emitido');

  // Falta de interacciones mínimas (0 clics)
  const idleTelemetry = validateGameTelemetry({
    timeSpentSeconds: 60,
    interactionCount: 1
  }, 'medium');
  assert(idleTelemetry.isValid === false, 'Sesión sin interacción activa (1 clic en 60s) rechazada');
  assert(idleTelemetry.code === 'INSUFFICIENT_INTERACTIONS', 'Código INSUFFICIENT_INTERACTIONS emitido');

  // -------------------------------------------------------------
  // TEST 7: Telemetría Humana Plausible Válida
  // -------------------------------------------------------------
  console.log('\n--- 7. VALIDACIÓN DE TELEMETRÍA HUMANA AUTÉNTICA ---');
  const humanTelemetry = validateGameTelemetry({
    timeSpentSeconds: 28.4,
    interactionCount: 18
  }, 'medium');

  assert(humanTelemetry.isValid === true, 'Telemetría de 28.4s con 18 interacciones aceptada como válida');
  assert(humanTelemetry.code === 'VALID', 'Código de validación VALID retornado');

  // -------------------------------------------------------------
  // TEST 8: Validación Estricta de postMessage (Anti-Spoofing de Origen)
  // -------------------------------------------------------------
  console.log('\n--- 8. VALIDACIÓN ESTRICTA DE LISTA BLANCA DE ORIGEN postMessage ---');
  const localHostOrigin = 'http://localhost:3000';

  // Orígenes legítimos
  assert(isAllowedSimulatorOrigin('http://localhost:3000', localHostOrigin) === true, 'Permite origen local de Next.js');
  assert(isAllowedSimulatorOrigin('https://phet.colorado.edu', localHostOrigin) === true, 'Permite dominio oficial PhET Colorado');
  assert(isAllowedSimulatorOrigin('https://www.geogebra.org', localHostOrigin) === true, 'Permite dominio oficial GeoGebra');
  assert(isAllowedSimulatorOrigin('https://falstad.com', localHostOrigin) === true, 'Permite dominio oficial Falstad');
  assert(isAllowedSimulatorOrigin('https://portal.iskool.edu.mx', localHostOrigin) === true, 'Permite subdominio institucional iskool.edu.mx');

  // Orígenes no autorizados o maliciosos
  assert(isAllowedSimulatorOrigin('https://attacker-phishing.com', localHostOrigin) === false, 'Rechaza origen atacante attacker-phishing.com');
  assert(isAllowedSimulatorOrigin('https://phet.colorado.edu.evil.com', localHostOrigin) === false, 'Rechaza intento de spoofing de subdominio malicioso');
  assert(isAllowedSimulatorOrigin('null', localHostOrigin) === false, 'Rechaza origen nulo');
  assert(isAllowedSimulatorOrigin('', localHostOrigin) === false, 'Rechaza origen vacío');

  console.log('\n=============================================================');
  console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('=============================================================\n');

  if (passedTests === totalTests) {
    console.log('🛡️ ¡TODAS LAS POLÍTICAS DE SEGURIDAD CRIPTOGRÁFICA FUERON SUPERADAS AL 100%!');
    process.exit(0);
  } else {
    console.error('⚠️ AL MENOS UNA PRUEBA DE SEGURIDAD FALLÓ.');
    process.exit(1);
  }
}

runSecuritySuite().catch((err) => {
  console.error('Error fatal ejecutando suite de seguridad:', err);
  process.exit(1);
});
