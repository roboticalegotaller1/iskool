import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyLaboratorioSession } from '@/app/api/auth/laboratorio-session/route';
import { 
  HermeticEmailBrainService, 
  InboundEmailDTO, 
  HermeticAuthSession 
} from '@/lib/services/hermetic-email-brain.service';

/**
 * ============================================================================
 * ENDPOINT DE INFERENCIA Y TRIAGE DE CORREOS EN TIEMPO REAL (RAG HERMÉTICO)
 * POST /api/portal/ceo/laboratorio/process-email
 * ============================================================================
 */

const InboundEmailSchema = z.object({
  sender_email: z.string().email('Email del remitente inválido'),
  sender_name: z.string().optional(),
  recipient_email: z.string().email().optional(),
  subject: z.string().min(1, 'El asunto es obligatorio'),
  body_text: z.string().min(1, 'El cuerpo del correo es obligatorio'),
  received_at: z.string().optional(),
  reincidence_count: z.number().int().min(1).default(1)
});

export async function POST(req: NextRequest) {
  try {
    // 1. VERIFICACIÓN CRIPTOGRÁFICA DE SESIÓN (AUTH GATE)
    const cookieToken = req.cookies.get('laboratorio_session')?.value;
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Acceso denegado: Se requiere autenticación hermética para interactuar con el laboratorio.',
          code: 'UNAUTHENTICATED'
        },
        { status: 401 }
      );
    }

    const verifiedSession = await verifyLaboratorioSession(token);

    if (!verifiedSession) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Firma de sesión inválida o caducada.',
          code: 'INVALID_SIGNATURE'
        },
        { status: 401 }
      );
    }

    // 2. CONSTRUCCIÓN DE LA SESIÓN DE SEGURIDAD HERMÉTICA
    const authSession: HermeticAuthSession = {
      user: {
        id: verifiedSession.user_id,
        email: verifiedSession.email,
        app_metadata: {
          tenant_id: verifiedSession.tenant_id,
          role: verifiedSession.role,
          institution_name: verifiedSession.institution_name,
          is_isolated_sandbox: verifiedSession.is_isolated_sandbox
        }
      },
      app_metadata: {
        tenant_id: verifiedSession.tenant_id,
        role: verifiedSession.role,
        institution_name: verifiedSession.institution_name,
        is_isolated_sandbox: verifiedSession.is_isolated_sandbox
      },
      tenant_id: verifiedSession.tenant_id,
      institution_name: verifiedSession.institution_name,
      role: verifiedSession.role,
      is_isolated_sandbox: verifiedSession.is_isolated_sandbox
    };

    // 3. PARSEO Y VALIDACIÓN DEL CORREO ENTRANTE
    const body = await req.json().catch(() => ({}));
    const parseResult = InboundEmailSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Estructura del correo entrante inválida.',
          details: parseResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const emailData: InboundEmailDTO = parseResult.data;

    // 4. EJECUCIÓN DEL MOTOR COGNITIVO HERMÉTICO (<800ms)
    const triageResult = await HermeticEmailBrainService.processInboundEmail(
      emailData,
      authSession
    );

    // 5. RESPUESTA ESTRUCTURADA CON TELEMETRÍA Y CABECERAS DE AUDITORÍA
    const response = NextResponse.json({
      success: true,
      triage: triageResult
    });

    response.headers.set('x-resolved-tenant-id', verifiedSession.tenant_id);
    response.headers.set('x-quadrant', triageResult.quadrant);
    response.headers.set('x-latency-ms', String(triageResult.telemetry.latency_ms));
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;

  } catch (err: any) {
    const isTenantError = err.message?.includes('Acceso denegado: Sesión sin tenant asignado');
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error procesando el triage de correo en el laboratorio.',
        code: isTenantError ? 'TENANT_DENIED' : 'INTERNAL_INFERENCE_ERROR'
      },
      { status: isTenantError ? 403 : 500 }
    );
  }
}
