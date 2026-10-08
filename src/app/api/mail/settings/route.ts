import { NextRequest, NextResponse } from 'next/server';
import { CeoEmailSettingsService } from '@/lib/services/ceoEmailSettingsService';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';

    const settings = CeoEmailSettingsService.getSettings(tenantId);
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener ajustes ejecutivos de correo' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tenantId = 'e1000000-0000-0000-0000-000000000001' } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Acción no especificada' }, { status: 400 });
    }

    switch (action) {
      case 'add_vip': {
        const { email, contactName, organization, reason } = body;
        if (!email) {
          return NextResponse.json({ success: false, error: 'El correo electrónico es obligatorio' }, { status: 400 });
        }
        const created = CeoEmailSettingsService.addVipEmail(tenantId, {
          email,
          contactName: contactName || email.split('@')[0],
          organization: organization || 'Entidad Prioritaria',
          reason: reason || 'Atención prioritaria solicitada por Dirección General',
          enabled: true
        });
        return NextResponse.json({ success: true, created, settings: CeoEmailSettingsService.getSettings(tenantId) });
      }

      case 'remove_vip': {
        const { ruleId } = body;
        if (!ruleId) {
          return NextResponse.json({ success: false, error: 'ID de regla no especificado' }, { status: 400 });
        }
        const removed = CeoEmailSettingsService.removeVipEmail(tenantId, ruleId);
        return NextResponse.json({ success: removed, settings: CeoEmailSettingsService.getSettings(tenantId) });
      }

      case 'toggle_vip': {
        const { ruleId, enabled } = body;
        const current = CeoEmailSettingsService.getSettings(tenantId);
        const rule = current.vipEmails.find(r => r.id === ruleId);
        if (rule) {
          rule.enabled = enabled ?? !rule.enabled;
          CeoEmailSettingsService.updateSettings(tenantId, { vipEmails: current.vipEmails });
        }
        return NextResponse.json({ success: true, settings: CeoEmailSettingsService.getSettings(tenantId) });
      }

      case 'update_delegate': {
        const { sectionKey, delegateName, delegateEmail, slaHours, autoNotify } = body;
        if (!sectionKey) {
          return NextResponse.json({ success: false, error: 'Clave de sección no especificada' }, { status: 400 });
        }
        const updated = CeoEmailSettingsService.updateDelegate(tenantId, sectionKey, {
          delegateName,
          delegateEmail,
          slaHours: Number(slaHours) || 24,
          autoNotify: autoNotify !== undefined ? Boolean(autoNotify) : true
        });
        return NextResponse.json({ success: !!updated, updated, settings: CeoEmailSettingsService.getSettings(tenantId) });
      }

      case 'save_template_default': {
        const { templateId, subject, body: templateBody } = body;
        if (!templateId || !subject || !templateBody) {
          return NextResponse.json({ success: false, error: 'Datos de plantilla incompletos' }, { status: 400 });
        }
        const updated = CeoEmailSettingsService.saveCustomDefaultTemplate(tenantId, templateId, subject, templateBody);
        return NextResponse.json({ success: !!updated, updated, settings: CeoEmailSettingsService.getSettings(tenantId) });
      }

      case 'reset_template': {
        const { templateId } = body;
        if (!templateId) {
          return NextResponse.json({ success: false, error: 'ID de plantilla requerido' }, { status: 400 });
        }
        const reset = CeoEmailSettingsService.resetTemplateToDefault(tenantId, templateId);
        return NextResponse.json({ success: !!reset, reset, settings: CeoEmailSettingsService.getSettings(tenantId) });
      }

      case 'save_all': {
        const { settings } = body;
        if (!settings) {
          return NextResponse.json({ success: false, error: 'Configuración no provista' }, { status: 400 });
        }
        const updated = CeoEmailSettingsService.updateSettings(tenantId, settings);
        return NextResponse.json({ success: true, settings: updated });
      }

      default:
        return NextResponse.json({ success: false, error: `Acción '${action}' no reconocida` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar acción de ajustes de correo' },
      { status: 500 }
    );
  }
}
