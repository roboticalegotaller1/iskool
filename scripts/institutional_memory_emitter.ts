#!/usr/bin/env tsx
/**
 * @file scripts/institutional_memory_emitter.ts
 * @description Emisor CLI de Telemetría Pedagógica y Generador de Lotes para Memoria Institucional.
 * Emula y ejecuta la exportación consolidada desde el servidor Rails / worker hacia la Bóveda Curricular.
 *
 * Uso:
 *   npx tsx scripts/institutional_memory_emitter.ts [grado] [asignatura] [tema] [cohorte]
 *   bin/rails memory:emit_batch[4,matematicas,fracciones_equivalentes]
 */

import { PedagogicalPiiGuard } from '../src/lib/institutionalMemory/piiGuard';
import { CreateInstitutionalMemoryInput } from '../src/lib/institutionalMemory/types';

interface SyntheticStudentEvaluation {
  score: number;
  timeSpentMinutes: number;
  frictionTags: string[];
}

export class InstitutionalMemoryEmitter {
  static MASTERY_THRESHOLD = 7.0;

  static async emitSyntheticBatch(params?: {
    grade?: number | string;
    subject?: string;
    topic?: string;
    cohort?: string;
    endpoint?: string;
    secret?: string;
  }) {
    const grade = params?.grade ? (isNaN(Number(params.grade)) ? params.grade : Number(params.grade)) : 4;
    const subject = params?.subject || 'matematicas';
    const topic = params?.topic || 'fracciones_equivalentes';
    const cohort = params?.cohort || '4C';
    const endpoint = params?.endpoint || process.env.ISKOOL_VAULT_API_URL || 'http://localhost:3000/api/vault/memory';
    const secret = params?.secret || process.env.RAILS_INGESTION_SECRET || process.env.INTERNAL_API_SECRET || 'iskool_memory_secret_default';

    console.log(`\n🚀 [Emisor de Memoria Institucional] Iniciando consolidación de lote...`);
    console.log(`   • Asignatura: ${subject} | Grado: ${grade} | Tema: ${topic}`);
    console.log(`   • Cohorte: Grupo ${cohort} | Endpoint: ${endpoint}`);

    // 1. Simulación de evaluaciones de alumnos en el aula
    const sampleFrictions = [
      'Confusión entre numerador y denominador al simplificar fracciones',
      'Dificultad para visualizar equivalencia en rectas numéricas',
      'Error de proporcionalidad al duplicar únicamente el denominador',
      'Inseguridad al comparar fracciones con denominadores distintos'
    ];

    const studentCount = Math.floor(Math.random() * 8) + 24; // 24 a 32 alumnos
    const evaluations: SyntheticStudentEvaluation[] = [];

    for (let i = 0; i < studentCount; i++) {
      const score = Math.round((5.0 + Math.random() * 5.0) * 10) / 10;
      const frictions: string[] = [];
      if (score < 8.0) {
        frictions.push(sampleFrictions[Math.floor(Math.random() * sampleFrictions.length)]);
      }
      if (score < 6.5) {
        frictions.push(sampleFrictions[Math.floor(Math.random() * sampleFrictions.length)]);
      }
      evaluations.push({
        score,
        timeSpentMinutes: Math.floor(Math.random() * 20) + 35,
        frictionTags: Array.from(new Set(frictions))
      });
    }

    // 2. Agregación cuantitativa de métricas
    const passedCount = evaluations.filter(e => e.score >= this.MASTERY_THRESHOLD).length;
    const masteryRate = Math.round((passedCount / studentCount) * 100) / 100;

    const frictionCounts = new Map<string, number>();
    for (const ev of evaluations) {
      for (const f of ev.frictionTags) {
        frictionCounts.set(f, (frictionCounts.get(f) || 0) + 1);
      }
    }

    const sortedFrictions = Array.from(frictionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([f]) => f);

    const comprehensionFrictionPoints = sortedFrictions.length > 0
      ? sortedFrictions
      : ['ninguna_detectada'];

    // 3. Montaje del payload Cero PII
    const payload: CreateInstitutionalMemoryInput = {
      institution_id: 'colegio_hidalgo',
      campus: 'Campus Central',
      academic_cycle: '2025-2026',
      phase_nem: typeof grade === 'number' && grade <= 4 ? 'fase_4' : 'fase_5',
      grade: grade,
      subject: subject,
      topic: topic,
      activity_source: `[[planeaciones/${subject}/Planeacion_${topic.replace(/\s+/g, '_')}.md]]`,
      created_by_teacher_ref: 'teacher_titular_04',
      author_display_name: 'Prof. Israel López Ángeles',
      group_cohort: cohort,
      metrics: {
        students_evaluated_count: studentCount,
        mastery_rate: masteryRate,
        comprehension_friction_points: comprehensionFrictionPoints,
        average_session_duration_minutes: 48,
        completion_rate: 1.0
      },
      provenance: {
        rails_activity_id: Math.floor(Math.random() * 9000) + 1000,
        rails_assessment_batch_id: Math.floor(Math.random() * 9000) + 5000,
        ingestion_agent: 'iSkool-Rails-Exporter/1.0',
        school_id: 'colegio_hidalgo'
      },
      sections: {
        contextoDiagnostico: `Evaluación formativa del Grupo ${cohort} en el tema "${topic}". Aplicación de rúbrica analítica y resolución en parejas.`,
        friccionesErrores: comprehensionFrictionPoints,
        adaptacionesExitosas: [
          'Uso de regletas manipulables fraccionarias antes de transitar a la representación numérica abstracta.',
          'Dinámica de comprobación en Lienzo Digital interactivo con retroalimentación instantánea.'
        ],
        recomendacionesProximoCiclo: [
          'Iniciar la sesión dedicando 10 minutos al concepto de entero unitario.',
          'Evitar enseñar el algoritmo de producto cruzado antes de comprobar equivalencia visualmente.'
        ]
      }
    };

    // 4. Verificación rigurosa de Cero PII antes del envío
    PedagogicalPiiGuard.assertZeroPii(payload, 'InstitutionalMemoryEmitter.emitSyntheticBatch');

    console.log(`   📊 Métricas agregadas:`);
    console.log(`      • Total Alumnos: ${studentCount}`);
    console.log(`      • Tasa de Dominio: ${(masteryRate * 100).toFixed(0)}% (${passedCount}/${studentCount} aprobados >= 7.0)`);
    console.log(`      • Fricciones detectadas: ${comprehensionFrictionPoints.length}`);

    // 5. Envío HTTP autenticado
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`,
          'User-Agent': 'iSkool-Rails-Exporter/1.0'
        },
        body: JSON.stringify(payload)
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`❌ [Error de Ingestión] HTTP ${response.status}:`, responseBody);
        return { success: false, status: response.status, error: responseBody };
      }

      console.log(`✅ [Ingestión Exitosa] HTTP ${response.status}`);
      console.log(`   • ID de Documento: ${responseBody.documentId}`);
      console.log(`   • Ruta Física: ${responseBody.filePath}`);
      if (responseBody.remoteGitSynced) {
        console.log(`   • Sincronización Remota GitOps: Certificada (${responseBody.remoteGitCommit || 'OK'})`);
      }
      return { success: true, status: response.status, data: responseBody };
    } catch (err: any) {
      console.error(`❌ [Error de Red]: No se pudo conectar con el endpoint "${endpoint}":`, err.message);
      return { success: false, error: err.message };
    }
  }
}

// Ejecución directa por CLI
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('institutional_memory_emitter'))) {
  const args = process.argv.slice(2);
  let grade: string | number = 4;
  let subject = 'matematicas';
  let topic = 'fracciones_equivalentes';
  let cohort = '4C';

  // Manejar formato bracket: memory:emit_batch[4,matematicas,fracciones]
  const first = args[0] || '';
  if (first.includes('[') && first.endsWith(']')) {
    const inner = first.substring(first.indexOf('[') + 1, first.length - 1);
    const parts = inner.split(',').map(s => s.trim());
    if (parts[0]) grade = isNaN(Number(parts[0])) ? parts[0] : Number(parts[0]);
    if (parts[1]) subject = parts[1];
    if (parts[2]) topic = parts[2];
    if (parts[3]) cohort = parts[3];
  } else {
    if (args[0]) grade = isNaN(Number(args[0])) ? args[0] : Number(args[0]);
    if (args[1]) subject = args[1];
    if (args[2]) topic = args[2];
    if (args[3]) cohort = args[3];
  }

  InstitutionalMemoryEmitter.emitSyntheticBatch({ grade, subject, topic, cohort })
    .then(result => {
      process.exitCode = result.success ? 0 : 1;
    })
    .catch(err => {
      console.error('Fatal error en emitter:', err);
      process.exitCode = 1;
    });
}
