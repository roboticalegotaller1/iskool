import { createClient } from '@supabase/supabase-js';

export interface CorrectionPayload {
  school_id: string;
  matter_id: string;
  user_id: string;
  corrected_destination: 'RESOLVER' | 'DELEGAR' | 'VIGILAR' | 'DIRECCION';
  corrected_assigned_role?: string;
  feedback_notes?: string;
}

export class ShadowModeLearningService {
  private static getSupabase() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // 1. REGISTRAR CORRECCIÓN HUMANA
  static async recordHumanCorrection(payload: CorrectionPayload) {
    const supabase = this.getSupabase();

    const { data: matter } = await supabase
      .from('inbox_matters')
      .select('*')
      .eq('id', payload.matter_id)
      .single();

    if (!matter) throw new Error('Asunto no encontrado.');

    // Registrar en auditoría de aprendizaje
    await supabase.from('inbox_director_feedback').insert({
      school_id: payload.school_id,
      matter_id: payload.matter_id,
      user_id: payload.user_id,
      original_destination: matter.destination,
      corrected_destination: payload.corrected_destination,
      original_assigned_role: matter.assigned_role,
      corrected_assigned_role: payload.corrected_assigned_role,
      feedback_notes: payload.feedback_notes,
      rule_proposed: `Derivar categoría "${matter.category}" siempre a ${payload.corrected_assigned_role || payload.corrected_destination}`
    });

    // Actualizar el asunto con la decisión humana
    await supabase.from('inbox_matters').update({
      destination: payload.corrected_destination,
      assigned_role: payload.corrected_assigned_role ?? matter.assigned_role,
      status: payload.corrected_destination === 'DELEGAR' ? 'DELEGADO' : matter.status,
      updated_at: new Date().toISOString()
    }).eq('id', payload.matter_id);

    // Evaluar si corresponde proponer regla automática
    return this.evaluateRuleProposal(payload.school_id, matter.category);
  }

  // 2. SUGERIR REGLA AUTOMÁTICA TRAS EVIDENCIA ACUMULADA
  private static async evaluateRuleProposal(schoolId: string, category: string) {
    const supabase = this.getSupabase();

    const { data: feedbackHistory } = await supabase
      .from('inbox_director_feedback')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!feedbackHistory || feedbackHistory.length < 5) {
      return { proposal_ready: false };
    }

    const sameRoleCount = feedbackHistory.filter(
      f => f.corrected_assigned_role === feedbackHistory[0].corrected_assigned_role
    ).length;

    if (sameRoleCount >= 4) {
      const suggestedRole = feedbackHistory[0].corrected_assigned_role;
      return {
        proposal_ready: true,
        message: `En ${sameRoleCount} de las últimas solicitudes de tipo "${category}" las delegaste a ${suggestedRole}. ¿Quieres que iSkool las envíe ahí automáticamente en adelante?`,
        suggestedRole,
        category,
        promptAcceptanceRule: true
      };
    }

    return { proposal_ready: false };
  }

  // 3. ACEPTAR NUEVA REGLA DE DELEGACIÓN
  static async acceptDelegationRule(schoolId: string, category: string, assignedRole: string, slaHours: number = 24) {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('inbox_delegation_rules')
      .upsert({
        school_id: schoolId,
        category: category,
        assigned_role: assignedRole,
        sla_hours: slaHours,
        escalate_to_director_on_reincidence: true,
        escalate_to_director_on_breach: true,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'school_id, category' })
      .select();

    if (error) throw error;
    return data;
  }
}
