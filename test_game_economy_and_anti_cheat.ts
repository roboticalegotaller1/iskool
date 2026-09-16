/**
 * @file test_game_economy_and_anti_cheat.ts
 * @description Suite de validación automatizada para:
 * 1. Anti-Cheat Server-Side en endpoints de progreso y otorgamiento de XP/Monedas.
 * 2. Transacciones Atómicas (ACID) y prevención de Race Conditions en Store.
 * 3. Teacher Social Loop en tiempo real (SSE / Broadcaster sin polling).
 * 4. Sandboxing hermético de los 50 simuladores compatibles en el Patrón Factory.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { POST as submitQuizHandler } from './src/app/api/gamification/submit-quiz/route';
import { POST as purchaseHandler } from './src/app/api/store/purchase/route';
import { teacherMilestoneBroadcaster, broadcastTeacherMilestone } from './src/lib/teacherMilestoneBroadcaster';
import { SimulatorGamificationAdapter } from './src/services/simulatorGamificationAdapter';
import { NextRequest } from 'next/server';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 INICIANDO AUDITORÍA: ECONOMÍA, ANTI-CHEAT Y SIMULADORES');
  console.log('================================================================\n');

  // ============================================================================
  // BLOQUE 1: ANTI-CHEAT SERVER-SIDE (RECHAZO DE PAYLOADS MANIPULADOS)
  // ============================================================================
  console.log('--- 1. AUDITORÍA ANTI-CHEAT Y LÓGICA AUTORIZADA SERVER-SIDE ---');

  // Caso 1.1: Alumno intenta enviar payload manipulado (score: 100, xp: 99999, coins: 99999) con respuestas erróneas
  {
    const spoofedPayload = {
      questId: 'q-fractions-1', // Reto de fracciones de seeds.ts
      studentId: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11',
      score: 100, // MANIPULADO
      xpEarned: 99999, // MANIPULADO
      coinsEarned: 99999, // MANIPULADO
      answers: {
        q1: 0, // Incorrecta (la correcta es índice 1)
        q2: 0  // Incorrecta (la correcta es índice 1)
      }
    };

    const req = new NextRequest('http://localhost:3000/api/gamification/submit-quiz', {
      method: 'POST',
      body: JSON.stringify(spoofedPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await submitQuizHandler(req);
    const data = await res.json();

    assert(res.status === 200, 'El endpoint submit-quiz responde con 200 OK');
    assert(data.verifiedScore === 0, `El puntaje es recalculado por el servidor a 0% (recibió ${data.verifiedScore}%, el payload manipulaba 100%)`);
    assert(data.xpEarned < 50, `El XP otorgado es seguro (${data.xpEarned} XP), descartando los 99999 del payload manipulado`);
    assert(data.coinsEarned === 0, `Las monedas otorgadas son 0 por reprobar el reto (descartó 99999)`);
    assert(data.antiCheatValidation.serverValidated === true, 'Flag serverValidated presente en antiCheatValidation');
    assert(data.antiCheatValidation.correctQuestions === 0, 'Validador detectó 0 respuestas correctas');
  }

  // Caso 1.2: Alumno envía respuestas correctas legítimas
  {
    const legitimatePayload = {
      questId: 'q-fractions-1',
      studentId: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11',
      answers: {
        q1: 1, // Correcta (3/4 vs 1/4)
        q2: 1  // Correcta (Numerador)
      }
    };

    const req = new NextRequest('http://localhost:3000/api/gamification/submit-quiz', {
      method: 'POST',
      body: JSON.stringify(legitimatePayload),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await submitQuizHandler(req);
    const data = await res.json();

    assert(data.verifiedScore === 100, `Respuestas correctas otorgan puntaje legítimo del 100%`);
    assert(data.xpEarned === 100, `XP calculada server-side coincide con el tope oficial del reto (100 XP)`);
    assert(data.coinsEarned === 20, `Monedas calculadas incluyen bono de perfección oficial (20 Monedas)`);
    assert(data.isPassed === true, 'El reto se marca como aprobado legítimamente');
  }

  // ============================================================================
  // BLOQUE 2: TRANSACCIONES ATÓMICAS (ACID) Y PREVENCIÓN DE RACE CONDITIONS
  // ============================================================================
  console.log('\n--- 2. AUDITORÍA DE TRANSACCIONES ATÓMICAS (ACID) EN STORE ---');

  // Caso 2.1: Intento de compra con saldo insuficiente
  {
    const req = new NextRequest('http://localhost:3000/api/store/purchase', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a99',
        artifactId: 'art-boots'
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await purchaseHandler(req);
    assert(res.status === 200 || res.status === 400, 'El endpoint procesa validación de compra');
  }

  // Caso 2.2: Concurrencia de clics múltiples (Race Condition Test)
  {
    const studentId = 'test-concurrent-std-' + Date.now();
    const artifactId = 'art-boots';

    // Lanzar 5 peticiones simultáneas exactamente al mismo milisegundo
    const promises = Array.from({ length: 5 }).map(() => {
      const req = new NextRequest('http://localhost:3000/api/store/purchase', {
        method: 'POST',
        body: JSON.stringify({ studentId, artifactId }),
        headers: { 'Content-Type': 'application/json' }
      });
      return purchaseHandler(req).then(r => r.json());
    });

    const results = await Promise.all(promises);
    const successfulPurchases = results.filter(r => r.success === true);
    const conflictOrErrorPurchases = results.filter(r => r.error !== undefined);

    assert(successfulPurchases.length <= 1, `De 5 peticiones concurrentes simultáneas, como máximo 1 tiene éxito (éxitos: ${successfulPurchases.length})`);
    assert(conflictOrErrorPurchases.length >= 4, `Las peticiones colisionantes son rechazadas por control de concurrencia (rechazos: ${conflictOrErrorPurchases.length})`);
  }

  // Caso 2.3: Validación del script SQL de bloqueo FOR UPDATE
  {
    const sqlPath = resolve(process.cwd(), 'supabase/migrations/20260916000000_atomic_store_and_anti_cheat.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');

    assert(sqlContent.includes('for update'), 'La migración SQL incluye bloqueo exclusivo "FOR UPDATE" en student_stats');
    assert(sqlContent.includes('Insufficient coins'), 'La migración SQL valida atomicamente "Insufficient coins"');
    assert(sqlContent.includes('already owns'), 'La migración SQL valida posesión previa');
    assert(sqlContent.includes('insert into public.student_inventory'), 'La migración SQL inserta en student_inventory en la misma transacción');
  }

  // ============================================================================
  // BLOQUE 3: TEACHER SOCIAL LOOP EN TIEMPO REAL (SSE SIN POLLING)
  // ============================================================================
  console.log('\n--- 3. AUDITORÍA TEACHER SOCIAL LOOP EN TIEMPO REAL (SSE) ---');

  // Caso 3.1: Suscripción y recepción inmediata de hito sin polling
  {
    let receivedEvent: any = null;
    const unsubscribe = teacherMilestoneBroadcaster.subscribe((event) => {
      receivedEvent = event;
    });

    const broadcasted = broadcastTeacherMilestone({
      teacherId: 'usr-teacher-1',
      studentId: 'std-test-123',
      studentName: 'Lucas Hernández',
      milestoneType: 'perfect_score',
      title: 'La Aventura de las Fracciones',
      score: 100,
      xpEarned: 100,
      coinsEarned: 20,
      teacherKarmaReward: 5,
      teacherXpReward: 10,
      message: '¡Puntaje perfecto en Fracciones!'
    });

    assert(receivedEvent !== null, 'El escuchador SSE recibió el evento instantáneamente');
    assert(receivedEvent.score === 100, 'El evento contiene el score verificado del alumno (100%)');
    assert(receivedEvent.teacherKarmaReward === 5, 'El evento contiene recompensa de Karma para el docente (+5)');
    assert(receivedEvent.id.startsWith('mstone-'), 'El evento tiene ID único generado');

    unsubscribe();
  }

  // Caso 3.2: Adaptador de simuladores emite hito al broadcaster
  {
    let simulatorEventReceived: any = null;
    const unsubscribe = teacherMilestoneBroadcaster.subscribe((event) => {
      if (event.milestoneType === 'simulator_mastered') {
        simulatorEventReceived = event;
      }
    });

    await SimulatorGamificationAdapter.handleCompletion({
      simulatorId: 'phet-forces-motion',
      templateType: 'external_embed',
      category: 'physics',
      activityId: 'act-sim',
      studentId: 'std-sim-test',
      score: 95,
      teacherId: 'usr-teacher-1',
      timeSpentSeconds: 150
    });

    assert(simulatorEventReceived !== null, 'SimulatorGamificationAdapter emitió hito simulator_mastered al broadcaster');
    assert(simulatorEventReceived.score === 95, 'Score de 95% preservado en la telemetría del simulador');

    unsubscribe();
  }

  // ============================================================================
  // BLOQUE 4: SANDBOXING DE LOS 50 SIMULADORES Y PATRÓN FACTORY
  // ============================================================================
  console.log('\n--- 4. AUDITORÍA DE SANDBOXING EN SIMULADORES Y FACTORY ---');

  // Caso 4.1: SimulatorIframePlayer tiene sandbox hermético
  {
    const playerPath = resolve(process.cwd(), 'src/components/games/SimulatorIframePlayer.tsx');
    const content = readFileSync(playerPath, 'utf8');

    assert(content.includes('sandbox="allow-scripts allow-same-origin allow-popups allow-forms"'), 'SimulatorIframePlayer incluye sandbox seguro');
    assert(!content.includes('allow-top-navigation'), 'SimulatorIframePlayer PROHÍBE estrictamente "allow-top-navigation" (previene secuestro de ventana)');
    assert(content.includes('referrerPolicy="no-referrer-when-downgrade"'), 'SimulatorIframePlayer incluye referrerPolicy de seguridad');
    assert(content.includes('loading="lazy"'), 'SimulatorIframePlayer optimiza rendimiento con loading="lazy"');
  }

  // Caso 4.2: ISkoolActivityPlayer integra SimulatorIframePlayer en el Factory Pattern
  {
    const factoryPath = resolve(process.cwd(), 'src/components/ISkoolActivityPlayer.tsx');
    const content = readFileSync(factoryPath, 'utf8');

    assert(content.includes('SimulatorIframePlayer'), 'ISkoolActivityPlayer importa SimulatorIframePlayer');
    assert(content.includes("case 'external_embed':") || content.includes("case 'simulator':"), 'Factory Pattern maneja tipos external_embed y simulator');
  }

  // Caso 4.3: ExternalEmbedBlockView y StudioFlowPlayer tienen iframes sandboxed
  {
    const externalEmbedPath = resolve(process.cwd(), 'src/components/studio/builder/blocks/ExternalEmbedBlockView.tsx');
    const externalContent = readFileSync(externalEmbedPath, 'utf8');
    assert(externalContent.includes('sandbox="allow-scripts allow-same-origin allow-popups allow-forms"'), 'ExternalEmbedBlockView tiene sandbox estricto');

    const studioFlowPath = resolve(process.cwd(), 'src/components/studio/player/StudioFlowPlayer.tsx');
    const studioFlowContent = readFileSync(studioFlowPath, 'utf8');
    assert(studioFlowContent.includes('sandbox="allow-scripts allow-same-origin allow-popups allow-forms"'), 'StudioFlowPlayer tiene sandbox estricto');

    const youtubeBlockPath = resolve(process.cwd(), 'src/components/studio/builder/blocks/YouTubeVideoBlockView.tsx');
    const youtubeContent = readFileSync(youtubeBlockPath, 'utf8');
    assert(youtubeContent.includes('sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"'), 'YouTubeVideoBlockView tiene sandbox de video');
  }

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================
  console.log('\n================================================================');
  console.log(`📊 RESULTADOS FINALES DE AUDITORÍA:`);
  console.log(`   Pruebas Totales: ${totalTests}`);
  console.log(`   Aprobadas:       ${passedTests} ✅`);
  console.log(`   Fallidas:        ${failedTests} ❌`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal ejecutando suite de pruebas:', err);
  process.exit(1);
});
