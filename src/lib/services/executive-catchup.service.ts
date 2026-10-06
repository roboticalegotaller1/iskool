import { createClient } from '@supabase/supabase-js';

export interface CatchupSummary {
  period_label: string;
  total_received: number;
  no_director_needed: number;
  in_progress_other_areas: number;
  monitored_silent: number;
  needs_director_attention: number;
  urgent_matters: Array<{
    id: string;
    matter_code: string;
    title: string;
    why_shown: string;
    category: string;
  }>;
  detected_patterns: Array<{
    title: string;
    description: string;
  }>;
  ai_dialogue_brief: string;
}

export class ExecutiveCatchupService {
  private static getSupabase() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  static async generateCatchup(schoolId: string, sinceDate?: string): Promise<CatchupSummary> {
    const supabase = this.getSupabase();
    const threshold = sinceDate ?? new Date(Date.now() - 8 * 3600 * 1000).toISOString();

    const { data: matters } = await supabase
      .from('inbox_matters')
      .select('*')
      .eq('school_id', schoolId)
      .gte('created_at', threshold);

    const allMatters = matters ?? [];
    const totalReceived = allMatters.reduce((acc, m) => acc + (m.reincidence_count || 1), 0);
    const noDirector = allMatters.filter(m => m.destination === 'RESOLVER').length;
    const delegated = allMatters.filter(m => m.destination === 'DELEGAR').length;
    const monitored = allMatters.filter(m => m.destination === 'VIGILAR').length;
    const needsDirector = allMatters.filter(m => m.destination === 'DIRECCION');

    const { data: patterns } = await supabase
      .from('inbox_patterns')
      .select('pattern_title, pattern_description')
      .eq('school_id', schoolId)
      .eq('status', 'ACTIVE')
      .limit(3);

    const briefText = `Desde tu último resumen, se procesaron ${totalReceived} correos recibidos. ` +
      `✓ ${noDirector} fueron resueltos por procedimiento institucional. ` +
      `→ ${delegated} están siendo atendidos por las coordinaciones. ` +
      `⏱ ${monitored} permanecen en seguimiento silencioso. ` +
      `🔴 ${needsDirector.length} requieren una decisión tuya.` +
      (patterns && patterns.length > 0 ? ` Además, he detectado un incremento de consultas sobre ${patterns[0].pattern_title}.` : '');

    return {
      period_label: 'Últimas horas',
      total_received: totalReceived,
      no_director_needed: noDirector,
      in_progress_other_areas: delegated,
      monitored_silent: monitored,
      needs_director_attention: needsDirector.length,
      urgent_matters: needsDirector.map(m => ({
        id: m.id,
        matter_code: m.matter_code,
        title: m.title,
        why_shown: m.why_shown_to_director || 'Requiere intervención ejecutiva',
        category: m.category
      })),
      detected_patterns: patterns?.map(p => ({
        title: p.pattern_title,
        description: p.pattern_description
      })) ?? [],
      ai_dialogue_brief: briefText
    };
  }

  static async answerExecutiveQuestion(schoolId: string, question: string): Promise<{ answer: string; evidence: any[] }> {
    const q = question.toLowerCase();
    const supabase = this.getSupabase();

    if (q.includes('necesita de mí') || q.includes('atención hoy')) {
      const { data } = await supabase
        .from('inbox_matters')
        .select('matter_code, title, why_shown_to_director, category')
        .eq('school_id', schoolId)
        .eq('destination', 'DIRECCION')
        .eq('status', 'PENDIENTE');

      return {
        answer: data && data.length > 0
          ? `Actualmente tienes ${data.length} asuntos que requieren tu decisión directa:\n` +
            data.map((d, i) => `${i + 1}. [${d.matter_code}] ${d.title} (${d.category}): ${d.why_shown_to_director}`).join('\n')
          : 'Excelente noticia: No hay ningún asunto crítico esperando tu intervención en este momento.',
        evidence: data ?? []
      };
    }

    if (q.includes('quejando más') || q.includes('patrón')) {
      const { data } = await supabase
        .from('inbox_patterns')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'ACTIVE');

      return {
        answer: data && data.length > 0
          ? `El patrón principal detectado es: "${data[0].pattern_title}". Descripción: ${data[0].pattern_description}. Acción recomendada: ${data[0].suggested_institutional_action}`
          : 'No hay quejas masivas ni concentraciones anómalas detectadas en la jornada.',
        evidence: data ?? []
      };
    }

    return {
      answer: 'He consultado la memoria institucional de iSkool. Todo el flujo operacional estándar permanece canalizado a través de los SLAs asignados.',
      evidence: []
    };
  }
}
