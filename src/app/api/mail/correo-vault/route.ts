import { NextRequest, NextResponse } from 'next/server';
import {
  getDelegatedMattersFromCorreoVault,
  saveDelegatedMatterToCorreoVault,
  CorreoDelegatedMatter
} from '@/lib/services/correoVaultService';
import { validateApiAuth } from '@/lib/authValidator';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';
import { isSchoolTenantAllowed, resolveCanonicalUserSchoolKey } from '@/lib/security/tenantAccess';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'Autenticación requerida para consultar asuntos delegados.' }, { status: 401 });
    }
    const roleLower = (auth.user.role || '').toLowerCase();
    if (!['superadmin', 'ceo', 'owner', 'director', 'admin', 'coordinator'].includes(roleLower)) {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes para acceder a la bóveda de correo.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const defaultTenant = resolveCanonicalUserSchoolKey(auth.user as any) || 'IBIME';
    const requestedTenant = searchParams.get('tenantId') || defaultTenant;
    if (!isSchoolTenantAllowed(auth.user as any, requestedTenant)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado: aislamiento multi-colegio.' }, { status: 403 });
    }
    const matters = getDelegatedMattersFromCorreoVault(requestedTenant);
    return NextResponse.json({ success: true, count: matters.length, matters });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'Autenticación requerida para delegar asuntos.' }, { status: 401 });
    }
    const postRoleLower = (auth.user.role || '').toLowerCase();
    if (!['superadmin', 'ceo', 'owner', 'director', 'admin', 'coordinator'].includes(postRoleLower)) {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes para delegar asuntos ejecutivos.' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Cuerpo JSON inválido.' }, { status: 400 });
    }
    const defaultTenant = resolveCanonicalUserSchoolKey(auth.user as any) || 'IBIME';
    const { tenantId = defaultTenant, matter } = body as { tenantId?: string; matter?: CorreoDelegatedMatter };
    if (!isSchoolTenantAllowed(auth.user as any, tenantId)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado: no puedes escribir asuntos en otro colegio.' }, { status: 403 });
    }

    if (!matter || !matter.id) {
      return NextResponse.json({ success: false, error: 'Faltan datos del asunto a delegar' }, { status: 400 });
    }

    if (
      isDemoSandboxContext({
        email: auth.user?.email,
        schoolId: auth.user?.school_id,
        userId: auth.user?.id,
        tenantId: auth.user?.tenant_id || tenantId,
      })
    ) {
      recordEphemeralVaultItem('mail', {
        actorEmail: auth.user?.email,
        title: matter.title || matter.id,
        payload: { tenantId, matterId: matter.id },
      });
      return NextResponse.json({
        success: true,
        demoSandbox: true,
        persistedInVault: false,
        matter,
        message: 'Modo Cuentas Demo: Asunto delegado en memoria temporal sin escribir en Bóveda Curricular.',
      });
    }

    const result = saveDelegatedMatterToCorreoVault(tenantId, matter);
    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
