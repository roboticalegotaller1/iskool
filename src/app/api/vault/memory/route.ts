import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { validateApiAuth, AuthValidationResult } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';
import {
  InstitutionalMemoryService,
  PedagogicalPiiGuard,
  PedagogicalPrivacyViolationError,
  CreateInstitutionalMemoryInput
} from '@/lib/institutionalMemory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Comparación segura de tiempo constante para prevenir ataques de temporización (timing attacks).
 * Valida la cabecera Authorization: Bearer <RAILS_INGESTION_SECRET> con crypto.timingSafeEqual.
 */
export function timingSafeTokenCheck(provided: string, expected: string): boolean {
  if (!provided || !expected || typeof provided !== 'string' || typeof expected !== 'string') {
    return false;
  }
  const bufProvided = Buffer.from(provided);
  const bufExpected = Buffer.from(expected);

  if (bufProvided.length !== bufExpected.length) {
    // Si las longitudes difieren, ejecutamos timingSafeEqual sobre buffers idénticos para tiempo constante
    crypto.timingSafeEqual(bufProvided, bufProvided);
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

// Esquema de entrada para la Ingestión Segura desde Rails / Webhooks
const MemoryIngestionRequestSchema = z.object({
  institution_id: z.string().trim().min(1, 'institution_id es obligatorio'),
  campus: z.string().trim().optional().default('Campus Central'),
  academic_cycle: z.string().trim().regex(/^\d{4}-\d{4}$/, 'academic_cycle debe tener formato AAAA-AAAA'),
  phase_nem: z.string().trim().optional(),
  grade: z.union([z.number(), z.string().trim()]),
  subject: z.string().trim().min(1, 'subject es obligatorio'),
  topic: z.string().trim().min(1, 'topic es obligatorio'),
  activity_source: z.string().trim().optional(),
  created_by_teacher_ref: z.string().trim().min(1, 'created_by_teacher_ref es obligatorio'),
  author_display_name: z.string().trim().min(1, 'author_display_name es obligatorio'),
  adaptation_of: z.string().trim().nullable().optional(),
  group_cohort: z.string().trim().min(1, 'group_cohort es obligatorio (ej. 4A)'),
  metrics: z.object({
    students_evaluated_count: z.number().int().min(1, 'students_evaluated_count debe ser al menos 1'),
    mastery_rate: z.number().min(0).max(1, 'mastery_rate debe estar entre 0.0 y 1.0'),
    comprehension_friction_points: z.array(z.string().trim()).default([]),
    average_session_duration_minutes: z.number().positive().optional(),
    completion_rate: z.number().min(0).max(1).optional()
  }),
  provenance: z.object({
    rails_activity_id: z.union([z.number(), z.string().trim()]),
    rails_assessment_batch_id: z.union([z.number(), z.string().trim()]).optional(),
    ingestion_agent: z.string().trim().optional().default('iSkool-Memory-Worker/1.0'),
    school_id: z.string().trim().optional()
  }),
  sections: z.object({
    contextoDiagnostico: z.string().trim().min(5, 'contextoDiagnostico es obligatorio'),
    friccionesErrores: z.array(z.string().trim()).default([]),
    adaptacionesExitosas: z.array(z.string().trim()).default([]),
    recomendacionesProximoCiclo: z.array(z.string().trim()).default([]),
    procedenciaTrazabilidad: z.string().trim().optional()
  }),
  customFilename: z.string().trim().optional()
});

const MEMORY_STAFF_ROLES = new Set(['teacher', 'director', 'coordinator', 'admin', 'superadmin', 'owner', 'ceo', 'billing', 'control_escolar', 'staff']);

/**
 * Valida la autenticación para la ingestión segura.
 * Admite tanto el secreto de servidor a servidor (Rails Webhook Secret) como sesión autenticada de docente/admin.
 */
async function validateIngestionSecurity(
  request: NextRequest
): Promise<{ authorized: boolean; status?: number; reason?: string; user?: AuthValidationResult['user'] }> {
  const authHeader = request.headers.get('authorization') || '';
  const ingestionKeyHeader = request.headers.get('x-ingestion-key') || '';

  const configuredSecret = process.env.RAILS_INGESTION_SECRET || process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;

  // 1. Verificación por Secreto de Ingestión entre Servidores (Rails -> Next.js) con crypto.timingSafeEqual
  if (configuredSecret) {
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
    if (
      (bearerToken && timingSafeTokenCheck(bearerToken, configuredSecret)) ||
      (ingestionKeyHeader && timingSafeTokenCheck(ingestionKeyHeader, configuredSecret))
    ) {
      return { authorized: true };
    }
  }

  // 2. Verificación por Sesión de Usuario (Docente o Directivo autenticado)
  const authResult = await validateApiAuth(request);
  if (authResult.authenticated && authResult.user) {
    const roleLower = (authResult.user.role || '').toLowerCase();
    if (MEMORY_STAFF_ROLES.has(roleLower)) {
      return { authorized: true, user: authResult.user };
    }
    return { authorized: false, status: 403, reason: 'Permisos insuficientes para escribir en la Bóveda Curricular.' };
  }

  return { authorized: false, status: 401, reason: 'No autorizado' };
}

/**
 * POST /api/vault/memory
 * Ruta segura de ingestión para persistir telemetría pedagógica consolidada de Rails en la Bóveda Curricular.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Control de acceso
    const security = await validateIngestionSecurity(request);
    if (!security.authorized) {
      return NextResponse.json(
        { error: security.reason || 'No autorizado' },
        { status: security.status || 401 }
      );
    }

    // 2. Extracción y parsing del body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido o vacío' }, { status: 400 });
    }

    // 3. BLINDAJE DE PRIVACIDAD ABSOLUTA (Regla No Negociable Cero PII)
    try {
      PedagogicalPiiGuard.assertZeroPii(body, 'Ingestión Rails -> API Bóveda Curricular');
    } catch (err: any) {
      if (err instanceof PedagogicalPrivacyViolationError) {
        console.error('🚨 Violación de privacidad interceptada:', err.message, err.detectedPatterns);
        return NextResponse.json(
          {
            error: err.message,
            detectedPatterns: err.detectedPatterns,
            remediation: 'Elimine nombres individuales de alumnos, CURP o calificaciones antes de registrar en la Bóveda.'
          },
          { status: 422 }
        );
      }
      throw err;
    }

    // 4. Validación de esquema con Zod
    const parsed = MemoryIngestionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Estructura de memoria institucional no conforme',
          issues: parsed.error.issues
        },
        { status: 400 }
      );
    }

    // 5. Verificación de propiedad institucional (institution_id / school_id) para usuarios no superadmin
    const memoryInput: CreateInstitutionalMemoryInput = parsed.data;
    if (security.user && !isPlatformSuperUser(security.user)) {
      const allowedInstitutions = new Set(
        [security.user.school_id, security.user.tenant_id]
          .filter((v): v is string => Boolean(v && v.trim()))
          .map((v) => v.trim().toLowerCase())
      );
      const reqInst = memoryInput.institution_id.trim().toLowerCase();
      const reqProvSchool = memoryInput.provenance?.school_id?.trim().toLowerCase();
      const userSchoolLower = security.user.school_id?.trim().toLowerCase();

      if (
        allowedInstitutions.size === 0 ||
        !allowedInstitutions.has(reqInst) ||
        (reqProvSchool && userSchoolLower && reqProvSchool !== userSchoolLower) ||
        (reqProvSchool && !userSchoolLower)
      ) {
        return NextResponse.json(
          { error: 'Prohibido: No puedes registrar memorias curriculares para otra institución o plantel.' },
          { status: 403 }
        );
      }

      if (security.user.school_id && !memoryInput.provenance.school_id) {
        memoryInput.provenance.school_id = security.user.school_id;
      }
    }

    // 6. Interceptar cuentas demo antes de tocar la Bóveda Curricular
    if (
      isDemoSandboxContext({
        email: security.user?.email,
        schoolId: security.user?.school_id || memoryInput.provenance?.school_id || memoryInput.institution_id,
        userId: security.user?.id,
        tenantId: security.user?.tenant_id,
      })
    ) {
      const eph = recordEphemeralVaultItem('memory', {
        actorEmail: security.user?.email,
        title: memoryInput.topic,
        payload: { subject: memoryInput.subject, grade: memoryInput.grade },
      });
      return NextResponse.json(
        {
          success: true,
          demoSandbox: true,
          persistedInVault: false,
          message: 'Modo Cuentas Demo: Memoria institucional simulada en sesión sin escribir en Bóveda Curricular.',
          documentId: eph.id,
          filePath: `sandbox-ephemeral/${eph.id}.md`,
          remoteGitSynced: false,
          storageSynced: false,
        },
        { status: 201 }
      );
    }

    const saveResult = await InstitutionalMemoryService.saveMemory(memoryInput, { deferGitSync: true });

    // Sincronización GitOps desacoplada mediante after de Next.js 16
    if (saveResult.repoRelativePath && saveResult.fileContent) {
      const gitPayload = {
        relativeRepoPath: saveResult.repoRelativePath,
        fileContent: saveResult.fileContent,
        commitMessage: saveResult.commitMessage
      };

      const executeGitSync = async () => {
        try {
          await InstitutionalMemoryService.syncToCentralRepository(gitPayload);
        } catch (err: any) {
          console.warn('[GitOps:DeferredSync] Advertencia en sincronización en segundo plano:', err?.message || err);
        }
      };

      if (typeof after === 'function') {
        after(executeGitSync);
      } else {
        executeGitSync();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Memoria institucional persistida exitosamente en la Bóveda Curricular',
        documentId: saveResult.documentId,
        filePath: saveResult.repoRelativePath,
        remoteGitSynced: saveResult.remoteGitSynced ?? true,
        remoteGitCommit: saveResult.remoteGitCommit,
        storageSynced: saveResult.storageSynced || false,
        syncWarning: saveResult.syncWarning
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/vault/memory:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al persistir memoria institucional' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vault/memory
 * Consulta y síntesis de memorias institucionales para el planificador docente y Copiloto.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateApiAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Autenticación institucional requerida para consultar memorias curriculares.' },
        { status: 401 }
      );
    }

    const roleLower = (authResult.user.role || '').toLowerCase();
    if (!MEMORY_STAFF_ROLES.has(roleLower)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Solo personal docente o directivo puede consultar memorias curriculares.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const topic = searchParams.get('topic') || searchParams.get('q') || undefined;
    const cycle = searchParams.get('cycle') || undefined;
    const wantSynthesis = searchParams.get('synthesis') === 'true' || searchParams.get('synthesis') === '1';

    const memories = await InstitutionalMemoryService.queryMemoriesAsync({
      grade,
      subject,
      topic,
      cycle
    });

    if (wantSynthesis) {
      const synthesis = InstitutionalMemoryService.synthesizePriorCycleLearnings(memories, topic || 'General');
      return NextResponse.json({
        found: memories.length > 0,
        synthesis
      });
    }

    return NextResponse.json({
      found: memories.length > 0,
      count: memories.length,
      memories: memories.map(m => ({
        id: m.id,
        filePath: m.filePath?.includes('planeaciones')
          ? m.filePath.slice(m.filePath.indexOf('planeaciones')).replace(/\\/g, '/')
          : m.id,
        frontmatter: m.frontmatter,
        sections: m.sections,
        wikiLinks: m.wikiLinks,
        createdAt: m.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error en GET /api/vault/memory:', error);
    return NextResponse.json(
      { error: error.message || 'Error al consultar memorias institucionales' },
      { status: 500 }
    );
  }
}
