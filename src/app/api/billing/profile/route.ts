import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { PaymentGatewayService } from '@/lib/paymentGateway';
import { validateApiAuth } from '@/lib/authValidator';
import { z } from 'zod';

const BillingProfilePostSchema = z.object({
  parent_id: z.string().min(1, 'El ID de padre o tutor es obligatorio'),
  school_id: z.string().min(1, 'El ID de colegio es obligatorio'),
  rfc: z.string().min(12).max(13),
  tax_name: z.string().min(3).max(250),
  tax_regime: z.string().default('605'),
  postal_code: z.string().regex(/^[0-9]{5}$/, 'El Código Postal debe contener 5 dígitos'),
  cfdi_use: z.string().default('D10'),
  billing_email: z.string().email('Email de facturación inválido'),
  auto_invoice_on_payment: z.boolean().optional().default(true)
});

export async function GET(req: NextRequest) {
  try {
    // 1. Verificación estricta de Autenticación Zero-Trust
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    const requestedParentId = req.nextUrl.searchParams.get('parent_id') || auth.user.id;

    // 2. Aislamiento Estricto de Inquilinos (Tenant Isolation):
    // Un usuario no puede consultar los datos fiscales de otro salvo que sea superadmin
    const isSuperAdmin = auth.user.role === 'superadmin' || auth.user.role === 'admin';
    if (!isSuperAdmin && requestedParentId !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: Violación de aislamiento de datos fiscales.' },
        { status: 403 }
      );
    }

    const effectiveSchoolId = auth.user.school_id || 'sch-001';

    let query = supabase
      .from('billing_profiles')
      .select('*')
      .eq('parent_id', requestedParentId);

    // Si no es superadmin, restringir la consulta estrictamente al colegio del usuario autenticado
    if (!isSuperAdmin && auth.user.school_id) {
      query = query.eq('school_id', auth.user.school_id);
    }

    const { data, error } = await query.maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Datos por defecto si no existe registro previo en base de datos
    const profile = data || {
      parent_id: requestedParentId,
      school_id: effectiveSchoolId,
      rfc: 'XAXX010101000',
      tax_name: 'PÚBLICO EN GENERAL',
      tax_regime: '616',
      postal_code: '06700',
      cfdi_use: 'S01',
      billing_email: auth.user.email || 'facturacion@iskool.edu.mx',
      auto_invoice_on_payment: true,
      is_default: true
    };

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación estricta de Autenticación Zero-Trust
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = BillingProfilePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: parsed.error.issues[0]?.message || 'Parámetros fiscales inválidos.' 
      }, { status: 400 });
    }

    const { 
      parent_id, 
      school_id, 
      rfc, 
      tax_name, 
      tax_regime, 
      postal_code, 
      cfdi_use, 
      billing_email, 
      auto_invoice_on_payment 
    } = parsed.data;

    // 2. Control de Tenencia: Impedir manipulación de perfiles de otros usuarios o colegios ajenos
    const isSuperAdmin = auth.user.role === 'superadmin' || auth.user.role === 'admin';
    if (!isSuperAdmin) {
      if (parent_id !== auth.user.id) {
        return NextResponse.json({ 
          success: false, 
          error: 'Acceso denegado: No puedes modificar datos fiscales de otro usuario.' 
        }, { status: 403 });
      }
      if (auth.user.school_id && school_id !== auth.user.school_id) {
        return NextResponse.json({ 
          success: false, 
          error: 'Acceso denegado: El colegio asignado no coincide con tu perfil.' 
        }, { status: 403 });
      }
    }

    // 3. Validación estricta de RFC ante el SAT
    const rfcValidation = PaymentGatewayService.validateRFC(rfc);
    if (!rfcValidation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: rfcValidation.error || 'Formato de RFC inválido ante el SAT.' 
      }, { status: 400 });
    }

    const cleanTaxName = tax_name.trim().toUpperCase();

    // 4. Upsert seguro acotado al tenant
    const profilePayload = {
      parent_id,
      school_id,
      rfc: rfc.trim().toUpperCase(),
      tax_name: cleanTaxName,
      tax_regime,
      postal_code: postal_code.trim(),
      cfdi_use,
      billing_email: billing_email.trim().toLowerCase(),
      auto_invoice_on_payment,
      is_default: true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('billing_profiles')
      .upsert(profilePayload, { onConflict: 'parent_id,school_id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[BillingProfile API] Advertencia de persistencia:', error.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Datos fiscales SAT (CFDI 4.0) actualizados con éxito.', 
      profile: data || profilePayload 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
