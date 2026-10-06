import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId') || '938fa492-4ddc-4f6f-80d7-1bd054af8536';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: matters, error: mattersError } = await supabase
    .from('inbox_matters')
    .select('*')
    .eq('school_id', schoolId)
    .order('last_activity_at', { ascending: false });

  if (mattersError) {
    return NextResponse.json({ error: mattersError.message }, { status: 500 });
  }

  const { data: patterns } = await supabase
    .from('inbox_patterns')
    .select('pattern_title, pattern_description')
    .eq('school_id', schoolId)
    .eq('status', 'ACTIVE');

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

  return NextResponse.json({
    matters: mappedMatters,
    patterns: mappedPatterns
  });
}
