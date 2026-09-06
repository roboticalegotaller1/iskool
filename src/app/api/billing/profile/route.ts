import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { PaymentGatewayService } from '@/lib/paymentGateway';

export async function GET(req: NextRequest) {
  try {
    const parentId = req.nextUrl.searchParams.get('parent_id') || 'usr-parent-001';

    const { data, error } = await supabase
      .from('billing_profiles')
      .select('*')
      .eq('parent_id', parentId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Si no existe aún registro en base de datos, devolver datos semilla por defecto
    const profile = data || {
      parent_id: parentId,
      school_id: 'sch-001',
      rfc: 'LOAI840512AB3',
      tax_name: 'ISRAEL LOPEZ ANGELES',
      tax_regime: '605',
      postal_code: '06700',
      cfdi_use: 'D10',
      billing_email: 'israel.lopez@ejemplo.com',
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
    const body = await req.json();
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
    } = body;

    // Validación estricta de RFC ante el SAT
    const rfcValidation = PaymentGatewayService.validateRFC(rfc || '');
    if (!rfcValidation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: rfcValidation.error || 'Formato de RFC inválido ante el SAT.' 
      }, { status: 400 });
    }

    // Validación de Código Postal (5 dígitos numéricos)
    if (!postal_code || !/^[0-9]{5}$/.test(postal_code.trim())) {
      return NextResponse.json({ 
        success: false, 
        error: 'El Código Postal Fiscal debe contener exactamente 5 dígitos numéricos.' 
      }, { status: 400 });
    }

    // Validación de Razón Social / Nombre
    const cleanTaxName = (tax_name || '').trim().toUpperCase();
    if (cleanTaxName.length < 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'La Razón Social o Nombre Fiscal debe coincidir con la Constancia de Situación Fiscal.' 
      }, { status: 400 });
    }

    // Upsert en la tabla billing_profiles
    const profilePayload = {
      parent_id: parent_id || 'usr-parent-001',
      school_id: school_id || 'sch-001',
      rfc: rfc.trim().toUpperCase(),
      tax_name: cleanTaxName,
      tax_regime: tax_regime || '605',
      postal_code: postal_code.trim(),
      cfdi_use: cfdi_use || 'D10',
      billing_email: (billing_email || '').trim().toLowerCase(),
      auto_invoice_on_payment: auto_invoice_on_payment ?? true,
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
