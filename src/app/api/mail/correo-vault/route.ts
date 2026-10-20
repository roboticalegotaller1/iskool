import { NextRequest, NextResponse } from 'next/server';
import {
  getDelegatedMattersFromCorreoVault,
  saveDelegatedMatterToCorreoVault,
  CorreoDelegatedMatter
} from '@/lib/services/correoVaultService';
import { validateApiAuth } from '@/lib/authValidator';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: 'Autenticación requerida para consultar asuntos delegados.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'IBIME';
    const matters = getDelegatedMattersFromCorreoVault(tenantId);
    return NextResponse.json({ success: true, count: matters.length, matters });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: 'Autenticación requerida para delegar asuntos.' }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId = 'IBIME', matter } = body as { tenantId: string; matter: CorreoDelegatedMatter };

    if (!matter || !matter.id) {
      return NextResponse.json({ success: false, error: 'Faltan datos del asunto a delegar' }, { status: 400 });
    }

    const result = saveDelegatedMatterToCorreoVault(tenantId, matter);
    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
