import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabaseServer';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';
import { isSchoolTenantAllowed, resolveCanonicalUserSchoolKey } from '@/lib/security/tenantAccess';

const EXECUTIVE_INBOX_ROLES = new Set(['superadmin', 'admin', 'owner', 'ceo', 'director', 'coordinator']);

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json(
      { error: 'Autenticación requerida para consultar asuntos directivos institucionales.' },
      { status: 401 }
    );
  }

  const roleLower = (auth.user.role || '').toLowerCase();
  if (!EXECUTIVE_INBOX_ROLES.has(roleLower)) {
    return NextResponse.json(
      { error: 'Permisos directivos requeridos para consultar asuntos institucionales.' },
      { status: 403 }
    );
  }

  const isSuperUser = isPlatformSuperUser(auth.user as any);
  const { searchParams } = new URL(req.url);
  const userSchoolId = resolveCanonicalUserSchoolKey(auth.user as any);
  const requestedSchoolId = searchParams.get('schoolId') || userSchoolId || '938fa492-4ddc-4f6f-80d7-1bd054af8536';

  if (!isSchoolTenantAllowed(auth.user as any, requestedSchoolId)) {
    return NextResponse.json(
      { error: 'Acceso denegado: aislamiento multi-colegio activo.' },
      { status: 403 }
    );
  }

  const schoolId = isSuperUser ? requestedSchoolId : (userSchoolId || requestedSchoolId);

  const supabase = getServiceSupabaseClient();

  try {
    const [
      { data: matters, error: mattersError },
      { data: patterns }
    ] = await Promise.all([
      supabase
        .from('inbox_matters')
        .select('id, matter_code, title, summary, category, urgency, destination, why_shown_to_director, reincidence_count, recommended_action, suggested_draft_reply, assigned_role, sla_hours')
        .eq('school_id', schoolId)
        .order('last_activity_at', { ascending: false })
        .limit(100),
      supabase
        .from('inbox_patterns')
        .select('pattern_title, pattern_description')
        .eq('school_id', schoolId)
        .eq('status', 'ACTIVE')
    ]);

    if (mattersError) {
      console.warn('Advertencia al consultar inbox_matters:', mattersError.message);
      return NextResponse.json({ matters: [], patterns: [] });
    }

    const mappedMatters = (matters || []).map((m: any) => ({
      id: m.id,
      matter_code: m.matter_code,
      title: m.title,
      summary: m.summary,
      category: m.category,
      urgency: m.urgency,
      destination: m.destination,
      why_shown: m.why_shown_to_director || 'Derivado de matriz de atención prioritaria.',
      reincidence_count: m.reincidence_count || 1,
      recommended_action: m.recommended_action || 'Revisión por área correspondiente.',
      suggested_draft_reply: m.suggested_draft_reply || '',
      assigned_role: m.assigned_role || 'Dirección General',
      sla_hours: m.sla_hours || 24
    }));

    const mappedPatterns = (patterns || []).map((p: any) => ({
      title: p.pattern_title,
      description: p.pattern_description
    }));

    return NextResponse.json(
      {
        matters: mappedMatters,
        patterns: mappedPatterns
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
          'Vary': 'Cookie, Authorization'
        }
      }
    );
  } catch (error: any) {
    console.error('Error en API inbox matters:', error);
    return NextResponse.json({ matters: [], patterns: [] });
  }
}
