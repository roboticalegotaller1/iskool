// @vitest-environment node
/**
 * @file vault-lifecycle.e2e.test.ts
 * @description Suite de Pruebas de Integración E2E y Recuperación ante Desastres (Fase 10).
 * Verifica el ciclo de vida completo de la Bóveda Curricular:
 * 1. Ingestión y persistencia de Memoria Institucional desde planeación (Cero PII).
 * 2. Inserción atómica y control de concurrencia optimista en manifest.json.
 * 3. Simulación de colisión/desfase y auto-reconciliación GitOps.
 * 4. Recuperación ante Desastres: restauración íntegra tras borrado total del manifest.
 * 5. Garantía de idempotencia: ejecuciones consecutivas con cero diffs ni commits redundantes.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import matter from 'gray-matter';
import { InstitutionalMemoryService } from '../src/lib/institutionalMemory/memoryService';
import {
  InstitutionalMemoryReconcileService,
  identifyMissingGitMemories
} from '../src/lib/institutionalMemory/reconcileService';
import { rebuildVaultManifest } from '../scripts/rebuild-vault-manifest';
import {
  InstitutionalMemoryFrontmatterSchema,
  type MemoryManifestEntry,
  type CreateInstitutionalMemoryInput
} from '../src/lib/institutionalMemory/types';
import { PedagogicalPiiGuard, PedagogicalPrivacyViolationError } from '../src/lib/institutionalMemory/piiGuard';

describe('Bóveda Curricular - Ciclo de Vida y Recuperación ante Desastres (Fase 10 E2E)', () => {
  const repoRootDir = process.cwd();
  const vaultDir = path.join(repoRootDir, 'planeaciones', 'Memorias_Institucionales');
  const manifestPath = path.join(vaultDir, 'manifest.json');
  
  // Archivo temporal de prueba para ciclo de vida
  const testCycle = '2025-2026';
  const testCohort = '4Z_E2E';
  const testFilename = `Memoria_${testCycle}_G4_matematicas_fracciones_proporciones_${testCohort}.md`;
  const testFilePath = path.join(vaultDir, testCycle, testFilename);

  let initialManifestBackup: string | null = null;

  beforeAll(() => {
    // Respaldar manifest existente si lo hay
    if (fs.existsSync(manifestPath)) {
      initialManifestBackup = fs.readFileSync(manifestPath, 'utf8');
    }
  });

  afterAll(() => {
    // Limpieza de archivos temporales creados para la prueba
    if (fs.existsSync(testFilePath)) {
      try {
        fs.unlinkSync(testFilePath);
      } catch {}
    }

    // Restaurar manifest a estado limpio
    if (initialManifestBackup) {
      try {
        fs.writeFileSync(manifestPath, initialManifestBackup, 'utf8');
      } catch {}
    } else if (fs.existsSync(manifestPath)) {
      // Reconstruir manifest limpio sin el archivo de test
      rebuildVaultManifest({ skipCommit: true, silent: true });
    }
  });

  // =========================================================================
  // FASE 10.1: Ciclo de Ingestión y Persistencia (Planeación -> Memoria)
  // =========================================================================
  describe('1. Ingestión y Persistencia Canónica de Memoria Institucional', () => {
    it('debe persistir una nueva memoria con frontmatter YAML válido y Cero PII', async () => {
      const input: CreateInstitutionalMemoryInput = {
        institution_id: 'IBIME',
        campus: 'Campus Central',
        academic_cycle: testCycle,
        phase_nem: 'fase_4',
        grade: 4,
        subject: 'matematicas',
        topic: 'fracciones_proporciones',
        activity_source: '[[planeaciones/Primaria_Fase_4/4to_Grado/Matematicas/Planeacion_Test_E2E.md]]',
        created_by_teacher_ref: 'teacher_e2e_lead',
        author_display_name: 'Prof. Integración Continua',
        group_cohort: testCohort,
        customFilename: testFilename,
        metrics: {
          students_evaluated_count: 28,
          mastery_rate: 0.88,
          comprehension_friction_points: ['conversion_impropia_mixta', 'denominadores_desiguales'],
          average_session_duration_minutes: 50,
          completion_rate: 0.95
        },
        provenance: {
          rails_activity_id: 8899,
          rails_assessment_batch_id: 19920,
          ingestion_agent: 'iSkool-E2E-Lifecycle/1.0',
          school_id: 'school_ibime_01'
        },
        sections: {
          contextoDiagnostico: 'Diagnóstico formativo E2E de ciclo cerrado. Los alumnos demuestran dominio en cálculo visual.',
          friccionesErrores: [
            'Fricción en denominadores primos (séptimos y onceavos)',
            'Confusión con fracciones mixtas en recta numérica'
          ],
          adaptacionesExitosas: [
            'Taller con tiras fraccionarias manipulables de 1 metro',
            'Comprobación interactiva en Lienzo Digital'
          ],
          recomendacionesProximoCiclo: [
            'Dedicar 15 minutos iniciales a fracciones unitarias',
            'Mantener el cronometraje de sesiones didácticas'
          ],
          procedenciaTrazabilidad: 'Telemetría generada en suite de pruebas de confiabilidad E2E.'
        }
      };

      const result = await InstitutionalMemoryService.saveMemory(input, { deferGitSync: true });
      expect(result.success).toBe(true);
      expect(fs.existsSync(testFilePath)).toBe(true);

      // Validar contenido y frontmatter con gray-matter y Zod
      const fileRaw = fs.readFileSync(testFilePath, 'utf8');
      const parsedMatter = matter(fileRaw);
      const zodValidation = InstitutionalMemoryFrontmatterSchema.safeParse(parsedMatter.data);
      expect(zodValidation.success).toBe(true);

      // Verificar que se incluyeron las secciones obligatorias
      expect(parsedMatter.content).toContain('## 📍 Contexto Pedagógico y Diagnóstico Inicial');
      expect(parsedMatter.content).toContain('## ⚠️ Fricciones y Errores Conceptuales Frecuentes');
      expect(parsedMatter.content).toContain('## 💡 Adaptaciones e Intervenciones Exitosas');
      expect(parsedMatter.content).toContain('## 🔮 Recomendaciones para el Próximo Ciclo Escolar');
      expect(parsedMatter.content).toContain('## 🔗 Procedencia y Trazabilidad Institucional');
    });

    it('debe rechazar estrictamente cualquier intento de inyección de PII (CURP o email)', () => {
      const contaminatedInput = {
        institution_id: 'IBIME',
        academic_cycle: testCycle,
        grade: 4,
        subject: 'matematicas',
        topic: 'fracciones_proporciones',
        created_by_teacher_ref: 'teacher_e2e_lead',
        author_display_name: 'Prof. Integración Continua',
        group_cohort: testCohort,
        metrics: {
          students_evaluated_count: 28,
          mastery_rate: 0.88,
          comprehension_friction_points: ['alumno_curp_ABCD120304HDFRRN01_con_dificultad']
        },
        provenance: { rails_activity_id: 8899 },
        sections: {
          contextoDiagnostico: 'Reporte para el alumno con CURP ABCD120304HDFRRN01',
          friccionesErrores: [],
          adaptacionesExitosas: [],
          recomendacionesProximoCiclo: []
        }
      };

      expect(() => {
        PedagogicalPiiGuard.assertZeroPii(contaminatedInput, 'E2E.PII.Test');
      }).toThrowError(PedagogicalPrivacyViolationError);
    });
  });

  // =========================================================================
  // FASE 10.2: Inserción Atómica y Concurrencia Optimista en manifest.json
  // =========================================================================
  describe('2. Inserción Atómica y Control de Concurrencia Optimista', () => {
    it('debe fusionar atómicamente y ordenar cronológicamente las entradas en manifest.json', () => {
      const existingEntries: MemoryManifestEntry[] = [
        {
          id: 'memoria-antigua-1',
          fileName: 'Memoria_2024-2025_G4_matematicas_fracciones_4B.md',
          filePath: 'planeaciones/Memorias_Institucionales/2024-2025/Memoria_2024-2025_G4_matematicas_fracciones_4B.md',
          ciclo: '2024-2025',
          grado: '4',
          asignatura: 'matematicas',
          tema: 'fracciones',
          fecha: '2025-01-15T10:00:00Z',
          palabras_clave: ['matematicas', 'fracciones']
        }
      ];

      const newEntry: MemoryManifestEntry = {
        id: 'memoria-reciente-2',
        fileName: 'Memoria_2025-2026_G4_ciencias_materia_4C.md',
        filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_2025-2026_G4_ciencias_materia_4C.md',
        ciclo: '2025-2026',
        grado: '4',
        asignatura: 'ciencias',
        tema: 'estados_de_la_materia',
        fecha: '2026-02-20T12:00:00Z',
        palabras_clave: ['ciencias', 'materia']
      };

      const merged = InstitutionalMemoryService.mergeAndSortManifestEntries(existingEntries, newEntry);

      expect(merged.length).toBe(2);
      // El ciclo más reciente (2025-2026) debe quedar en la primera posición
      expect(merged[0].ciclo).toBe('2025-2026');
      expect(merged[0].id).toBe('memoria-reciente-2');
      expect(merged[1].ciclo).toBe('2024-2025');
    });

    it('debe deduplicar y actualizar versiones obsoletas preservando la versión más reciente', () => {
      const initial: MemoryManifestEntry[] = [
        {
          id: 'memoria-conflictiva',
          fileName: 'Memoria_2025-2026_G4_matematicas_fracciones_4A.md',
          filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_4A.md',
          ciclo: '2025-2026',
          grado: '4',
          asignatura: 'matematicas',
          tema: 'fracciones_v1_inicial',
          fecha: '2026-03-01T10:00:00Z',
          palabras_clave: []
        }
      ];

      const updatedVersion: MemoryManifestEntry = {
        id: 'memoria-conflictiva',
        fileName: 'Memoria_2025-2026_G4_matematicas_fracciones_4A.md',
        filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_4A.md',
        ciclo: '2025-2026',
        grado: '4',
        asignatura: 'matematicas',
        tema: 'fracciones_v2_optimizada',
        fecha: '2026-03-05T15:00:00Z',
        palabras_clave: ['optimizada']
      };

      const resolved = InstitutionalMemoryService.mergeAndSortManifestEntries(initial, updatedVersion);
      expect(resolved.length).toBe(1);
      expect(resolved[0].tema).toBe('fracciones_v2_optimizada');
      expect(resolved[0].fecha).toBe('2026-03-05T15:00:00Z');
    });
  });

  // =========================================================================
  // FASE 10.3: Simulación de Desfase / Colisión y Auto-Reconciliación GitOps
  // =========================================================================
  describe('3. Simulación de Desfase / Colisión y Auto-Reconciliación GitOps', () => {
    it('debe detectar memorias presentes en el manifest pero ausentes o con hash divergente en Git', () => {
      const manifestList: MemoryManifestEntry[] = [
        {
          id: 'memoria-ok',
          fileName: 'Memoria_OK.md',
          filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_OK.md',
          ciclo: '2025-2026',
          grado: '4',
          asignatura: 'matematicas',
          tema: 'tema_ok',
          fecha: '2026-01-01T00:00:00Z',
          sha: 'sha_coincidente_123',
          palabras_clave: []
        },
        {
          id: 'memoria-desincronizada',
          fileName: 'Memoria_Desfase.md',
          filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_Desfase.md',
          ciclo: '2025-2026',
          grado: '4',
          asignatura: 'ciencias',
          tema: 'tema_desfase',
          fecha: '2026-01-02T00:00:00Z',
          sha: 'sha_nuevo_manifest',
          palabras_clave: []
        },
        {
          id: 'memoria-ausente',
          fileName: 'Memoria_Ausente.md',
          filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_Ausente.md',
          ciclo: '2025-2026',
          grado: '4',
          asignatura: 'historia',
          tema: 'tema_ausente',
          fecha: '2026-01-03T00:00:00Z',
          palabras_clave: []
        }
      ];

      const gitBlobs = [
        { path: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_OK.md', sha: 'sha_coincidente_123' },
        { path: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_Desfase.md', sha: 'sha_antiguo_git' }
        // 'Memoria_Ausente.md' no existe en Git
      ];

      const missing = identifyMissingGitMemories(manifestList, gitBlobs);
      expect(missing.length).toBe(2);
      expect(missing.some(m => m.id === 'memoria-desincronizada')).toBe(true);
      expect(missing.some(m => m.id === 'memoria-ausente')).toBe(true);
      expect(missing.some(m => m.id === 'memoria-ok')).toBe(false);
    });

    it('debe ejecutar reconciliación GitOps simulada y registrar telemetría completa', async () => {
      const mockManifest: MemoryManifestEntry[] = [
        {
          id: 'memoria-sync-test',
          fileName: testFilename,
          filePath: path.relative(repoRootDir, testFilePath).replace(/\\/g, '/'),
          ciclo: testCycle,
          grado: '4',
          asignatura: 'matematicas',
          tema: 'fracciones_proporciones',
          fecha: '2026-03-01T00:00:00Z',
          sha: 'sha_divergente',
          palabras_clave: []
        }
      ];

      const reconcileResult = await InstitutionalMemoryReconcileService.reconcileGitOpsMemories({
        dryRun: true,
        manifestEntriesOverride: mockManifest,
        gitBlobsOverride: [] // Git vacío: debe forzar detección como faltante
      });

      expect(reconcileResult.totalManifestEntries).toBe(1);
      expect(reconcileResult.missingCount).toBe(1);
      expect(reconcileResult.reconciledCount).toBe(1);
      expect(reconcileResult.reconciledFiles.length).toBe(1);
      expect(reconcileResult.success).toBe(true);
    });
  });

  // =========================================================================
  // FASE 10.4: Recuperación ante Desastres (Borrado Total y Reconstrucción CLI)
  // =========================================================================
  describe('4. Herramienta de Recuperación ante Desastres (CLI de Reindexación Total)', () => {
    it('debe reconstruir deterministamente manifest.json desde cero tras simular un borrado total', async () => {
      // 1. Simulación de Desastre: Eliminar por completo el archivo manifest.json
      if (fs.existsSync(manifestPath)) {
        fs.unlinkSync(manifestPath);
      }
      expect(fs.existsSync(manifestPath)).toBe(false);

      // 2. Ejecutar Reconstrucción Total vía CLI programático
      const rebuildResult = await rebuildVaultManifest({
        skipCommit: true,
        silent: true,
        syncCloudStorage: false
      });

      expect(rebuildResult.success).toBe(true);
      expect(rebuildResult.modified).toBe(true);
      expect(rebuildResult.validMemories).toBeGreaterThanOrEqual(5);
      expect(rebuildResult.invalidFiles.length).toBe(0);
      expect(rebuildResult.versionHash).toBeDefined();
      expect(rebuildResult.versionHash.length).toBe(64); // SHA-256 hex string

      // 3. Verificar que el archivo manifest.json físico fue restaurado en disco
      expect(fs.existsSync(manifestPath)).toBe(true);
      const restoredContent = fs.readFileSync(manifestPath, 'utf8');
      const restoredEntries = JSON.parse(restoredContent) as MemoryManifestEntry[];

      expect(Array.isArray(restoredEntries)).toBe(true);
      expect(restoredEntries.length).toBe(rebuildResult.validMemories);

      // 4. Verificar integridad criptográfica de cada entrada individual
      for (const entry of restoredEntries) {
        expect(entry.sha).toBeDefined();
        expect(entry.sha?.length).toBe(64);

        const realFilePath = path.join(repoRootDir, entry.filePath);
        expect(fs.existsSync(realFilePath)).toBe(true);

        const realFileContent = fs.readFileSync(realFilePath, 'utf8');
        const computedSha = crypto.createHash('sha256').update(realFileContent, 'utf8').digest('hex');
        expect(entry.sha).toBe(computedSha);
      }

      // 5. Verificar ordenamiento cronológico estricto
      for (let i = 1; i < restoredEntries.length; i++) {
        const prev = restoredEntries[i - 1];
        const curr = restoredEntries[i];
        const cicloComp = prev.ciclo.localeCompare(curr.ciclo);
        expect(cicloComp >= 0).toBe(true);
        if (cicloComp === 0) {
          expect(prev.fecha.localeCompare(curr.fecha) >= 0).toBe(true);
        }
      }
    });

    // =========================================================================
    // FASE 10.5: Garantía Estricta de Idempotencia
    // =========================================================================
    it('debe ser estrictamente idempotente: una segunda ejecución consecutiva no genera cambios ni commits', async () => {
      // Primera ejecución previa ya dejó el manifest restaurado en disco.
      const firstRunRaw = fs.readFileSync(manifestPath, 'utf8');
      const firstRunHash = crypto.createHash('sha256').update(firstRunRaw, 'utf8').digest('hex');

      // Segunda ejecución consecutiva
      const secondRunResult = await rebuildVaultManifest({
        skipCommit: true,
        silent: true,
        syncCloudStorage: false
      });

      expect(secondRunResult.success).toBe(true);
      expect(secondRunResult.modified).toBe(false); // IDEMPOTENCIA: sin modificaciones
      expect(secondRunResult.commitCreated).toBe(false); // Cero commits redundantes
      expect(secondRunResult.versionHash).toBe(firstRunHash);

      // Verificar que el contenido del archivo es byte-a-byte idéntico
      const secondRunRaw = fs.readFileSync(manifestPath, 'utf8');
      expect(secondRunRaw).toBe(firstRunRaw);
    });
  });
});
