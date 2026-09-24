/**
 * @file rails_console.ts
 * @description Modo de inspección interactivo estilo Rails Console para iSchool.
 * Pre-carga el entorno de la Bóveda Curricular y la Capa de Generación Académica en el scope global.
 *
 * Permite ejecutar en la consola interactiva:
 *   AcademicGeneration.Generator.call({ ... })
 *   KnowledgeVault.ContextBuilder.call({ ... })
 */

import repl from 'repl';
import fs from 'fs';
import path from 'path';

function loadEnvFile(file: string) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { AcademicGenerationRequest } from '../src/lib/academicGeneration/request';
import { AcademicGenerationPromptBuilder } from '../src/lib/academicGeneration/promptBuilder';
import { AcademicGenerationValidator } from '../src/lib/academicGeneration/validator';
import { AcademicGenerationTraceabilityStore } from '../src/lib/academicGeneration/traceabilityStore';
import { KnowledgeVaultContextBuilder } from '../src/lib/knowledgeVault/contextBuilder';
import { KnowledgeVaultQueryService } from '../src/lib/knowledgeVault/queryService';
import { KnowledgeTaxonomy } from '../src/lib/knowledgeVault/taxonomy';

console.log('================================================================');
console.log('💎 iSchool Rails Console — Academic Generation & Knowledge Vault');
console.log('================================================================');
console.log('Módulos disponibles en el contexto global:');
console.log('  • AcademicGeneration (Generator, Request, PromptBuilder, Validator, TraceabilityStore)');
console.log('  • KnowledgeVault (ContextBuilder, QueryService, Taxonomy)');
console.log('  • AcademicGenerationGenerator, AcademicGenerationRequest');
console.log('Ejemplo de uso:');
console.log('  await AcademicGeneration.Generator.call({');
console.log('    grade: "high_school_1", cefr: "B1", skill: "speaking",');
console.log('    topic: "technology", language_function: "expressing_opinions",');
console.log('    activity_type: "guided_discussion", duration_minutes: 20');
console.log('  })');
console.log('================================================================\n');

const r = repl.start({
  prompt: 'iSchool(dev)> '
});

// Registrar alias Rails-like y estándar
const AcademicGenerationNamespace = {
  Generator: AcademicGenerationGenerator,
  Request: AcademicGenerationRequest,
  PromptBuilder: AcademicGenerationPromptBuilder,
  Validator: AcademicGenerationValidator,
  TraceabilityStore: AcademicGenerationTraceabilityStore
};

const KnowledgeVaultNamespace = {
  ContextBuilder: KnowledgeVaultContextBuilder,
  QueryService: KnowledgeVaultQueryService,
  Taxonomy: KnowledgeTaxonomy
};

r.context.AcademicGeneration = AcademicGenerationNamespace;
r.context.KnowledgeVault = KnowledgeVaultNamespace;
r.context.AcademicGenerationGenerator = AcademicGenerationGenerator;
r.context.AcademicGenerationRequest = AcademicGenerationRequest;
r.context.KnowledgeVaultContextBuilder = KnowledgeVaultContextBuilder;
r.context.KnowledgeVaultQueryService = KnowledgeVaultQueryService;
