import { createClient } from '@supabase/supabase-js';
import { InstitutionalBrainService } from './institutional-brain.service';

export interface EmailIngestDTO {
  school_id: string;
  email_account_id: string;
  gmail_message_id: string;
  gmail_thread_id: string;
  received_at: string;
  sender_email: string;
  sender_name?: string;
  recipient_emails: string[];
  subject: string;
  snippet?: string;
  body_text: string;
  labels?: string[];
}

export class CognitiveTriageService {
  private static getSupabase() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  static async ingestEmail(dto: EmailIngestDTO) {
    const supabase = this.getSupabase();

    const isSpam = this.detectSpam(dto.subject, dto.body_text, dto.sender_email);

    const { data: savedEmail, error: emailError } = await supabase
      .from('email_messages')
      .upsert({
        school_id: dto.school_id,
        email_account_id: dto.email_account_id,
        gmail_message_id: dto.gmail_message_id,
        gmail_thread_id: dto.gmail_thread_id,
        received_at: dto.received_at,
        sender_email: dto.sender_email,
        sender_name: dto.sender_name ?? dto.sender_email.split('@')[0],
        recipient_emails: dto.recipient_emails,
        subject: dto.subject,
        snippet: dto.snippet ?? dto.body_text.slice(0, 150),
        body_text: dto.body_text,
        labels: dto.labels ?? [],
        is_spam: isSpam,
        is_processed: false
      }, { onConflict: 'gmail_message_id' })
      .select()
      .single();

    if (emailError) throw emailError;

    if (isSpam) {
      await supabase.from('email_messages').update({ is_processed: true }).eq('id', savedEmail.id);
      return { status: 'SPAM_ISOLATED', message_id: savedEmail.id };
    }

    const matter = await this.clusterOrAssignMatter(savedEmail);
    return { status: 'PROCESSED', matter_id: matter.id, email_id: savedEmail.id };
  }

  private static detectSpam(subject: string, body: string, sender: string): boolean {
    const text = `${subject} ${body} ${sender}`.toLowerCase();
    const spamKeywords = [
      'viagra', 'crypto', 'ganaste un premio', 'herencia millonaria',
      'préstamo inmediato sin buró', 'casino online', 'hot singles', 'click here now'
    ];
    return spamKeywords.some(keyword => text.includes(keyword));
  }

  private static async clusterOrAssignMatter(email: any) {
    const supabase = this.getSupabase();
    const cleanSubject = email.subject.replace(/^(re:|fwd:)\s*/i, '').trim().toLowerCase();

    // 1. Revisar si pertenece a un Asunto ya abierto (Mismo patrón o hilo dentro de 48h)
    const { data: existingMatters } = await supabase
      .from('inbox_matters')
      .select('*, matter_email_links(email_message_id)')
      .eq('school_id', email.school_id)
      .eq('is_archived', false)
      .ilike('title', `%${cleanSubject.slice(0, 30)}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    let targetMatter = existingMatters?.[0];

    if (targetMatter) {
      // Agrupar en el mismo ASUNTO (Ej: 17 correos -> 1 asunto)
      await supabase.from('matter_email_links').insert({
        matter_id: targetMatter.id,
        email_message_id: email.id
      });

      const updatedCount = (targetMatter.reincidence_count || 1) + 1;
      await supabase.from('inbox_matters').update({
        reincidence_count: updatedCount,
        last_activity_at: new Date().toISOString(),
        why_shown_to_director: updatedCount >= 3 
          ? `Reincidencia elevada: ${updatedCount} comunicaciones acumuladas en torno a este mismo asunto.`
          : targetMatter.why_shown_to_director,
        urgency: updatedCount >= 5 ? 'ALTA' : targetMatter.urgency
      }).eq('id', targetMatter.id);

      await supabase.from('email_messages').update({ is_processed: true, processed_at: new Date().toISOString() }).eq('id', email.id);
      return targetMatter;
    }

    // 2. Si es un nuevo Asunto, clasificar intención y destino
    const classification = await this.classifyNewEmail(email);

    const draft = await InstitutionalBrainService.generateSuggestedReply(
      email.school_id,
      email.sender_name,
      email.subject,
      email.body_text
    );

    const matterCode = `MAT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

    const { data: newMatter, error } = await supabase
      .from('inbox_matters')
      .insert({
        school_id: email.school_id,
        matter_code: matterCode,
        title: email.subject,
        summary: email.snippet,
        category: classification.category,
        related_entity_type: classification.entityType,
        related_entity_id: classification.entityId,
        urgency: classification.urgency,
        destination: classification.destination,
        assigned_role: classification.assignedRole,
        sla_hours: classification.slaHours,
        sla_deadline: new Date(Date.now() + classification.slaHours * 3600 * 1000).toISOString(),
        why_shown_to_director: classification.whyShown,
        recommended_action: classification.recommendedAction,
        suggested_draft_reply: draft.proposed_body,
        knowledge_provenance: draft.provenance,
        confidence_score: classification.confidence,
        epistemic_classification: 'HECHO',
        resolved_without_director: classification.destination !== 'DIRECCION'
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('matter_email_links').insert({
      matter_id: newMatter.id,
      email_message_id: email.id
    });

    await supabase.from('email_messages').update({ is_processed: true, processed_at: new Date().toISOString() }).eq('id', email.id);
    return newMatter;
  }

  private static async classifyNewEmail(email: any) {
    const text = `${email.subject} ${email.body_text}`.toLowerCase();

    // REGLA OBLIGATORIA: Si en alguna parte del correo dice "supervision", "supervisión", "SEP", "sep" o "CTE", debe asignarse a Dirección/CEO
    const isMandatoryCeo = /\b(supervision|supervisión|sep|cte)\b/i.test(text) || text.includes('supervisi') || text.includes('supervisió');
    if (isMandatoryCeo) {
      return {
        category: text.includes('cte') ? 'Gobernanza / Consejo Técnico Escolar (CTE)' : 'Supervisión Oficial SEP / Asunto Regulatorio',
        entityType: 'autoridad',
        entityId: 'sep-supervision',
        urgency: 'ALTA' as const,
        destination: 'DIRECCION' as const,
        assignedRole: 'Dirección General / CEO',
        slaHours: 12,
        whyShown: 'Mención prioritaria de Supervisión / SEP / CTE: Requiere atención ejecutiva inmediata del CEO.',
        recommendedAction: 'Revisión y atención directa por Dirección General.',
        confidence: 0.99
      };
    }

    // Detección de casos que necesitan obligatoriamente Dirección
    if (text.includes('acoso') || text.includes('bullying') || text.includes('demanda') || text.includes('urgente dirección') || text.includes('reunión con dirección')) {
      return {
        category: 'Convivencia / Caso Crítico',
        entityType: 'grupo',
        entityId: '5º B',
        urgency: 'CRITICA' as const,
        destination: 'DIRECCION' as const,
        assignedRole: 'Dirección General',
        slaHours: 12,
        whyShown: 'Alerta de severidad alta: Requiere criterio ético y resolución directa de Dirección.',
        recommendedAction: 'Revisión prioritaria y convocatoria de protocolo de mediación escolar.',
        confidence: 0.98
      };
    }

    // Consultas resolubles automáticamente por procedimiento
    if (text.includes('horario') || text.includes('festival') || text.includes('calendario') || text.includes('profesores')) {
      return {
        category: 'Procedimiento / Información General',
        entityType: 'institucional',
        entityId: 'general',
        urgency: 'BAJA' as const,
        destination: 'RESOLVER' as const,
        assignedRole: 'Atención Escolar Automatizada',
        slaHours: 24,
        whyShown: 'Procedimiento conocido: iSkool preparó el borrador basado en las planeaciones institucionales.',
        recommendedAction: 'Aprobar borrador o permitir envío programado.',
        confidence: 0.95
      };
    }

    // Consultas delegables a Administración o Transporte
    if (text.includes('factura') || text.includes('colegiatura') || text.includes('pago')) {
      return {
        category: 'Facturación y Cobranza',
        entityType: 'familia',
        entityId: email.sender_email,
        urgency: 'MEDIA' as const,
        destination: 'DELEGAR' as const,
        assignedRole: 'Administración y Finanzas',
        slaHours: 48,
        whyShown: 'Delegable: Asunto operativo estándar de cobranza.',
        recommendedAction: 'Delegado a Administración. Se notificará si vence plazo de 48h.',
        confidence: 0.93
      };
    }

    if (text.includes('transporte') || text.includes('ruta 4') || text.includes('chofer') || text.includes('retraso')) {
      return {
        category: 'Transporte Escolar',
        entityType: 'ruta',
        entityId: 'Ruta 4',
        urgency: 'MEDIA' as const,
        destination: 'DELEGAR' as const,
        assignedRole: 'Coordinación de Logística y Transporte',
        slaHours: 24,
        whyShown: 'Monitoreo de operación de transporte. Escala a Dirección si es reincidente.',
        recommendedAction: 'Derivar reporte a supervisión de ruta.',
        confidence: 0.91
      };
    }

    // Default Vigilancia / Informativo
    return {
      category: 'Informativo',
      entityType: 'general',
      entityId: 'noticias',
      urgency: 'BAJA' as const,
      destination: 'VIGILAR' as const,
      assignedRole: 'Archivo Operativo',
      slaHours: 72,
      whyShown: 'Correo informativo sin acción urgente requerida.',
      recommendedAction: 'Mantener en seguimiento silencioso.',
      confidence: 0.88
    };
  }
}
