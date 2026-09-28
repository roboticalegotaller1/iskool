import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { validateApiAuth } from '@/lib/authValidator';
import {
  InstitutionalMemoryService,
  PedagogicalPiiGuard,
  PedagogicalPrivacyViolationError,
  CreateInstitutionalMemoryInput
} from '@/lib/institutionalMemory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

/**
 * Valida la autenticación para la ingestión segura.
 * Admite tanto el secreto de servidor a servidor (Rails Webhook Secret) como sesión autenticada de docente/admin.
 */
async function validateIngestionSecurity(request: NextRequest): Promise<{ authorized: boolean; reason?: string }> {
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

  // 2. Verificación por Sesión de Usuario (Docente o Coordinador autenticado en iSkool)
  const authResult = await validateApiAuth(request);
  if (authResult.authenticated) {
    return { authorized: true };
  }

  // Si no hay secreto configurado en desarrollo local, permitir con advertencia en consola
  if (!configuredSecret && process.env.NODE_ENV !== 'production') {
    console.warn('[Ingestión Segura]: Sin RAILS_INGESTION_SECRET configurado; admitiendo petición en modo desarrollo.');
    return { authorized: true };
  }

  return { authorized: false, reason: 'No autorizado' };
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
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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

    // 5. Persistencia mediante el servicio de Memoria Institucional
    const memoryInput: CreateInstitutionalMemoryInput = parsed.data;
    const saveResult = await InstitutionalMemoryService.saveMemory(memoryInput);

    return NextResponse.json(
      {
        success: true,
        message: 'Memoria institucional persistida exitosamente en la Bóveda Curricular',
        documentId: saveResult.documentId,
        filePath: saveResult.filePath,
        remoteGitSynced: saveResult.remoteGitSynced || false,
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
 * Consulta y síntesis de memorias institucionales para el planificador docente y Teacher Copilot.
 */
export async function GET(request: NextRequest) {
  try {
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
        filePath: m.filePath,
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
