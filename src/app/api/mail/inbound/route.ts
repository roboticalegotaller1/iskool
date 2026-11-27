import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateApiAuth } from '@/lib/authValidator';
import { InboundMailSpoolService } from '@/lib/services/inboundMailSpool';
import { HermeticEmailBrainService, InboundEmailDTO, HermeticAuthSession } from '@/lib/services/hermetic-email-brain.service';
import { formatCdmxTime, formatCdmxDate, formatCdmxSmartBadge } from '@/utils/timeZoneUtils';
import { isSchoolTenantAllowed, resolveCanonicalUserSchoolKey } from '@/lib/security/tenantAccess';

export const runtime = 'nodejs';

const EXECUTIVE_MAIL_ROLES = new Set(['superadmin', 'ceo', 'owner', 'director', 'admin', 'coordinator']);

function isValidInboundWebhookSecret(req: NextRequest): boolean {
  const configured = process.env.INBOUND_WEBHOOK_SECRET?.trim();
  const supplied = (req.headers.get('x-inbound-webhook-secret') || '').trim();
  if (!configured || !supplied || configured.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(configured), Buffer.from(supplied));
}

/**
 * ============================================================================
 * ENDPOINT DE INGESTA DE CORREO ENTRANTE (WEBHOOK & GATEWAY EN TIEMPO REAL)
 * POST /api/mail/inbound
 * ============================================================================
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiAuth(req, { allowSuperAdminBypass: true });
    const hasWebhookSecret = isValidInboundWebhookSecret(req);
    const hasStaffAuth =
      authResult.authenticated &&
      authResult.user &&
      EXECUTIVE_MAIL_ROLES.has((authResult.user.role || '').toLowerCase());

    if (!hasStaffAuth && !hasWebhookSecret) {
      return NextResponse.json(
        { success: false, error: 'Autenticación ejecutiva o firma webhook requerida para ingesta de correo.' },
        { status: authResult.authenticated ? 403 : 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Cuerpo JSON inválido.' },
        { status: 400 }
      );
    }

    const defaultTenant = hasStaffAuth && authResult.user
      ? resolveCanonicalUserSchoolKey(authResult.user as any)
      : '';
    const {
      sender_name,
      sender_email,
      recipient_email,
      subject,
      body_text,
      tenantId = defaultTenant || 'sch-test-case',
      institutionName = 'Instituto Educativo',
      schoolSlug = 'TEST',
      immediateTriage = false
    } = body;

    if (hasStaffAuth && !hasWebhookSecret && !isSchoolTenantAllowed(authResult.user as any, tenantId)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: aislamiento multi-colegio activo.' },
        { status: 403 }
      );
    }

    if (!subject || !body_text) {
      return NextResponse.json(
        { success: false, error: 'Asunto y cuerpo del correo son requeridos.' },
        { status: 400 }
      );
    }

    const emailDto: InboundEmailDTO = {
      sender_name: sender_name || 'Remitente Institucional',
      sender_email: sender_email || 'contacto@gmail.com',
      recipient_email: recipient_email || 'direccion@iskool.edu.mx',
      subject,
      body_text,
      reincidence_count: body.reincidence_count || 1
    };

    // 1. Encolar en el spool de correo entrante
    const queuedItem = InboundMailSpoolService.enqueueEmail(tenantId, emailDto);

    // 2. Si se solicitó triage inmediato:
    let triageResult = null;
    let matterItem = null;

    if (immediateTriage) {
      const authSession: HermeticAuthSession = {
        user: {
          id: `usr-${tenantId}`,
          email: recipient_email || 'direccion@iskool.edu.mx',
          app_metadata: {
            tenant_id: tenantId,
            role: 'CEO',
            institution_name: institutionName,
            is_isolated_sandbox: false
          }
        },
        tenant_id: tenantId,
        institution_name: institutionName,
        role: 'CEO',
        is_isolated_sandbox: false
      };

      triageResult = await HermeticEmailBrainService.processInboundEmail(emailDto, authSession);
      const prefix = (schoolSlug || tenantId.replace(/^sch-/, '') || 'INST').toUpperCase().slice(0, 5);

      if (triageResult.quadrant === 'ATENCION_CEO') {
        const prefix = (schoolSlug || tenantId.replace(/^sch-/, '') || 'INST').toUpperCase().slice(0, 5);
        matterItem = {
          id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          matter_code: `MAT-${prefix}-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
          title: emailDto.subject,
          summary: triageResult.why_shown_to_director || emailDto.body_text.slice(0, 140) + '...',
          category: triageResult.category || 'Atención Inmediata CEO',
          urgency: triageResult.urgency,
          destination: 'ATENCION_CEO',
          why_shown: triageResult.why_shown_to_director,
          reincidence_count: emailDto.reincidence_count || 1,
          recommended_action: triageResult.recommended_action,
          suggested_draft_reply: triageResult.suggested_draft?.body || '',
          assigned_role: triageResult.assigned_department || 'Dirección General',
          sla_hours: triageResult.sla_hours || 12,
          sla_remaining_text: `⏱️ ${triageResult.sla_hours || 12}h restantes`,
          sender_name: emailDto.sender_name,
          sender_email: emailDto.sender_email,
          provenance_doc: triageResult.provenance?.[0]?.source_path || `planeaciones/${tenantId}/Protocolo_Convivencia.md`,
          received_at: 'Justo ahora',
          campus: body.campus || 'Campus Central'
        };
      } else {
        matterItem = null;
      }

      // Marcar como procesado en el spool
      if (queuedItem) {
        InboundMailSpoolService.markAsProcessed(tenantId, [queuedItem.id]);
      }
    }

    // Inyectar en la bandeja cruda (raw-inbox) para disponibilidad instantánea
    try {
      const { injectEmailIntoCache } = await import('@/lib/services/imapClientService');
      const isCeo = triageResult ? triageResult.quadrant === 'ATENCION_CEO' : false;
      const isSpam = triageResult ? triageResult.quadrant === 'SPAM_DESCARTADO' : false;
      const rawCategory = isSpam ? 'promociones' : 'principal';

      const nowMs = Date.now();
      const rawItem = {
        id: queuedItem?.id || `inb-${nowMs}`,
        sender_name: emailDto.sender_name || 'Remitente Institucional',
        sender_email: emailDto.sender_email,
        recipient_email: emailDto.recipient_email || 'direccion@iskool.edu.mx',
        subject: emailDto.subject,
        snippet: emailDto.body_text.slice(0, 110) + '...',
        body_text: emailDto.body_text,
        date_ms: nowMs,
        date_iso: new Date(nowMs).toISOString(),
        received_at: formatCdmxDate(nowMs),
        timestamp: formatCdmxSmartBadge(nowMs),
        is_unread: true,
        is_starred: false,
        is_important: isCeo,
        category: rawCategory as any,
        triage_badge: triageResult ? {
          quadrant: (triageResult.quadrant === 'DELEGADO_CON_SLA' ? 'DELEGADO_CON_PLAZO' : triageResult.quadrant) as any,
          label: isCeo ? '🔴 ATENCIÓN INMEDIATA CEO' : isSpam ? '🟣 SPAM / PROMOCIÓN' : '🟢 INFORMATIVO',
          color: isCeo ? 'bg-red-50 text-red-700 border-red-200' : isSpam ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        } : undefined
      };
      injectEmailIntoCache(tenantId, rawItem);
    } catch (e) {
      console.warn('Could not inject into raw inbox cache:', e);
    }

    return NextResponse.json({
      success: true,
      message: queuedItem
        ? '✓ Correo recibido e ingresado a la cola de triage en tiempo real.'
        : '✓ Correo ya existente en cola/procesado.',
      queuedId: queuedItem?.id || 'existing',
      matterItem,
      triage: triageResult
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error procesando correo entrante.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const authResult = await validateApiAuth(req, { allowSuperAdminBypass: true });
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json(
      { success: false, error: 'Autenticación requerida para consultar la cola de correos.' },
      { status: 401 }
    );
  }
  if (!EXECUTIVE_MAIL_ROLES.has((authResult.user.role || '').toLowerCase())) {
    return NextResponse.json(
      { success: false, error: 'Permisos insuficientes para consultar correos entrantes.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const userSchoolId = resolveCanonicalUserSchoolKey(authResult.user as any);
  const tenantId = searchParams.get('tenantId') || userSchoolId || 'sch-test-case';
  if (!isSchoolTenantAllowed(authResult.user as any, tenantId)) {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado: aislamiento multi-colegio activo.' },
      { status: 403 }
    );
  }
  const email = searchParams.get('email') || undefined;

  const pending = InboundMailSpoolService.getPendingEmails(tenantId, email);

  return NextResponse.json({
    success: true,
    count: pending.length,
    pending
  });
}
