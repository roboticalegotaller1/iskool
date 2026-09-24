/**
 * @file copilot_cli.ts
 * @description CLI de interacción y prueba para el Teacher Copilot de iSchool (Fase 9).
 */

import { TeacherCopilotEngine, TeacherCopilotStore } from '../src/lib/teacherCopilot';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'request': {
      const rawRequest = args[1] || 'Prepárame la clase de mañana.';
      const sessionId = args[2] || `session_cli_${Date.now()}`;

      console.log(`\n================================================================================`);
      console.log(`  iSchool — TEACHER COPILOT INTERACTION`);
      console.log(`================================================================================`);
      console.log(`[Sesión]: ${sessionId}`);
      console.log(`[Solicitud]: "${rawRequest}"\n`);

      const result = await TeacherCopilotEngine.processRequest(sessionId, rawRequest);

      console.log(`--- INTENCIÓN DETECTADA ---`);
      console.log(`Intent: ${result.response.intent}`);
      console.log(`\n--- RESUMEN PEDAGÓGICO ---`);
      console.log(result.response.summary);

      if (result.response.recommendations?.length > 0) {
        console.log(`\n--- RECOMENDACIONES CLAVE ---`);
        result.response.recommendations.forEach((r, idx) => console.log(`  ${idx + 1}. ${r}`));
      }

      if (result.response.student_groups && result.response.student_groups.length > 0) {
        console.log(`\n--- AGRUPAMIENTOS DIDÁCTICOS ---`);
        result.response.student_groups.forEach(g => {
          console.log(`  [Mesa ${g.group_number}] ${g.label} (${g.student_aliases.length} alumnos)`);
          console.log(`    Enfoque: ${g.target_focus}`);
          console.log(`    Justificación: ${g.rationale}`);
        });
      }

      if (result.response.resources && result.response.resources.length > 0) {
        console.log(`\n--- RECURSOS GENERADOS (ESTADO: DRAFT) ---`);
        result.response.resources.forEach(res => {
          console.log(`  - [${res.type}] ${res.title}: ${res.description}`);
        });
      }

      if (result.response.warnings?.length > 0) {
        console.log(`\n--- AVISOS Y SALVAGUARDAS ---`);
        result.response.warnings.forEach(w => console.log(`  ⚠ ${w}`));
      }

      console.log(`\n--- CONTEXTO CURRICULAR AUTORITATIVO ---`);
      console.log(`Curso: ${result.response.source_context.course}`);
      console.log(`Unidad: ${result.response.source_context.unit || 'N/A'}`);
      console.log(`Lección: ${result.response.source_context.lesson || 'N/A'}`);
      console.log(`Metas: ${result.response.source_context.targets.join(', ')}`);

      console.log(`\n[ID de Auditoría]: ${result.interaction_id}`);
      console.log(`[Artefactos Guardados]: ${result.generated_artifacts.length} borrador(es) registrado(s).`);
      console.log(`================================================================================\n`);
      break;
    }

    case 'inspect': {
      const sessionId = args[1];
      if (!sessionId) {
        console.error('Error: Debe proporcionar un session_id.');
        process.exit(1);
      }
      const session = await TeacherCopilotStore.getSession(sessionId);
      const interactions = await TeacherCopilotStore.getInteractionsBySession(sessionId);
      const artifacts = await TeacherCopilotStore.getArtifactsBySession(sessionId);

      console.log(`\n--- INSPECCIÓN DE SESIÓN COPILOT: ${sessionId} ---`);
      console.log(`Título: ${session?.title || 'Sin registrar'}`);
      console.log(`Estado: ${session?.status || 'N/A'}`);
      console.log(`Total de Interacciones: ${interactions.length}`);
      console.log(`Artefactos Generados: ${artifacts.length}`);
      artifacts.forEach(a => {
        console.log(`  - [${a.status.toUpperCase()}] ${a.title} (v${a.version}, ${a.artifact_type})`);
      });
      break;
    }

    case 'pilot': {
      console.log(`Ejecutando script de certificación del piloto Fase 9...`);
      const { spawn } = require('child_process');
      const path = require('path');
      const tsxCli = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
      const pilotScript = path.join(__dirname, '..', 'scripts', 'test_fase9_copilot_pilot.ts');
      const child = spawn(process.execPath, [tsxCli, pilotScript], { stdio: 'inherit' });
      child.on('exit', (code: number) => process.exit(code || 0));
      break;
    }

    default:
      console.log(`Teacher Copilot CLI:`);
      console.log(`  request "<pregunta>" [session_id]   # Realizar solicitud en lenguaje natural`);
      console.log(`  inspect <session_id>                # Inspeccionar historial y artefactos`);
      console.log(`  pilot                               # Ejecutar piloto de certificación`);
      break;
  }
}

main().catch(err => {
  console.error('Error fatal en copilot_cli:', err);
  process.exit(1);
});
