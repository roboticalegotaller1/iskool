/**
 * @file tutor_cli.ts
 * @description CLI de gestión, inspección y prueba del AI Tutor conversacional (Fase 8).
 * Comandos:
 *   start <student_id> [unit_id]
 *   inspect <session_id>
 *   summary <session_id>
 *   pilot
 */

import {
  AITutorEngine,
  AITutorStore,
  TutorSessionEntity
} from '../src/lib/aiTutor';
import { AdaptiveLearningStore } from '../src/lib/adaptiveLearning/adaptiveStore';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const param1 = args[1] || '';
  const param2 = args[2] || '';

  if (command === 'start') {
    const studentId = param1 || 'student_carlos_a2';
    const targetUnit = param2 || 'speaking_b1_secondary_expressing_opinions';

    console.log(`\n================================================================`);
    console.log(`  INICIANDO SESIÓN DE AI TUTOR: ${studentId.toUpperCase()}`);
    console.log(`  Unidad Curricular: ${targetUnit}`);
    console.log(`================================================================`);

    const profile = await AdaptiveLearningStore.getProfile(studentId);
    const comps = await AdaptiveLearningStore.getCompetencies(studentId);

    const session = AITutorEngine.startSession({
      studentId,
      primaryLearningOutcome: 'Express personal viewpoints and justify claims with reasons.',
      knowledgeTargetIds: [targetUnit],
      scaffoldingLevel: profile.speaking.status === 'needs_support' ? 'high' : 'medium',
      languagePolicy: 'mostly_target_language'
    });
    await AITutorStore.saveSession(session);

    console.log(`ID de Sesión: ${session.id}`);
    console.log(`Nivel de Andamiaje Inicial: ${session.scaffolding_level.toUpperCase()}`);
    console.log(`Objetivo: ${session.primary_learning_outcome}`);

    // Procesar turno inicial de bienvenida
    const initialTurn = await AITutorEngine.processTurn(
      session,
      'Hello teacher, I want to practice expressing my opinions.',
      profile,
      comps
    );

    console.log(`\n[TUTOR]: ${initialTurn.output.student_message}`);
    console.log(`Acción ejecutada: ${initialTurn.output.tutor_action} | Siguiente paso: ${initialTurn.output.next_step}`);
    console.log(`================================================================\n`);
  } else if (command === 'inspect') {
    const sessionId = param1;
    if (!sessionId) {
      console.log('Error: Debe especificar un session_id.');
      process.exit(1);
    }
    const session = await AITutorStore.getSession(sessionId);
    if (!session) {
      console.log(`Sesión "${sessionId}" no encontrada.`);
      process.exit(1);
    }

    console.log(`\n================================================================`);
    console.log(`  INSPECCIÓN DE SESIÓN DEL AI TUTOR: ${session.id}`);
    console.log(`================================================================`);
    console.log(`Estudiante: ${session.student_id} | Status: ${session.status.toUpperCase()}`);
    console.log(`Andamiaje: ${session.scaffolding_level.toUpperCase()} | Modo: ${session.tutor_mode}`);
    console.log(`Preguntas Intentadas: ${session.conversation_state.questions_attempted}`);
    console.log(`Aciertos Autónomos:   ${session.conversation_state.successful_attempts}`);
    console.log(`Pistas Utilizadas:    ${session.conversation_state.hints_used_count} (Nivel Actual: ${session.conversation_state.current_hint_level})`);
    console.log(`Errores Observados:   ${session.conversation_state.observed_errors.join('; ') || 'Ninguno'}`);
    console.log(`Exit Check:           ${session.conversation_state.is_exit_check ? (session.conversation_state.exit_check_passed ? 'APROBADO' : 'PENDIENTE') : 'NO INICIADO'}`);

    console.log(`\n--- HISTORIAL DE MENSAJES (${session.messages.length}) ---`);
    for (const msg of session.messages) {
      console.log(`[${msg.role.toUpperCase()}] ${msg.content.slice(0, 100)}... ${msg.tutor_action ? `(Acción: ${msg.tutor_action})` : ''}`);
    }
    console.log(`================================================================\n`);
  } else if (command === 'pilot') {
    // Redirige al script de test del piloto
    const { spawn } = await import('child_process');
    const path = await import('path');
    const tsxCli = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const pilotPath = path.join(__dirname, 'test_fase8_tutor_pilot.ts');
    const child = spawn(process.execPath, [tsxCli, pilotPath], { stdio: 'inherit' });
    child.on('exit', code => process.exit(code || 0));
  } else {
    console.log(`\nUso del CLI AI Tutor:`);
    console.log(`  bin/rails tutor:start <student_id> [unit_id]`);
    console.log(`  bin/rails tutor:inspect <session_id>`);
    console.log(`  bin/rails tutor:summary <session_id>`);
    console.log(`  bin/rails tutor:pilot\n`);
  }
}

main().catch(err => {
  console.error('Error en tutor_cli:', err);
  process.exit(1);
});
