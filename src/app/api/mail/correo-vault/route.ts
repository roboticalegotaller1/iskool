import { NextRequest, NextResponse } from 'next/server';
import {
  getDelegatedMattersFromCorreoVault,
  saveDelegatedMatterToCorreoVault,
  CorreoDelegatedMatter
} from '@/lib/services/correoVaultService';

export async function GET(req: NextRequest) {
  try {
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
