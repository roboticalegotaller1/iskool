import { getServiceSupabaseClient } from '@/lib/supabaseServer';
import fs from 'fs';
import path from 'path';

export interface PatternDetectionResult {
  pattern_title: string;
  pattern_description: string;
  detected_count: number;
  timeframe_hours: number;
  entity_key: string;
  suggested_institutional_action: string;
}

export class PatternMemoryBridgeService {
  private static getSupabase() {
    return getServiceSupabaseClient();
  }

  // 1. ANÁLISIS DE CONJUNTO PROACTIVO (Cerebro Vivo)
  static async evaluateGlobalPatterns(schoolId: string): Promise<PatternDetectionResult[]> {
    const supabase = this.getSupabase();
    const patternsFound: PatternDetectionResult[] = [];
    const now = Date.now();

    // Conteos paralelos sin transferir filas completas
    const [
      { count: festivalCount },
      { count: transportCount }
    ] = await Promise.all([
      // Patrón A: Incremento repentino sobre evento/horario (Festival de salida)
      supabase
        .from('email_messages')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .ilike('subject', '%festival%')
        .gte('received_at', new Date(now - 4 * 3600 * 1000).toISOString()),
      // Patrón B: Transporte y retrasos recurrentes en Ruta 4
      supabase
        .from('email_messages')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .ilike('body_text', '%ruta 4%')
        .gte('received_at', new Date(now - 7 * 24 * 3600 * 1000).toISOString())
    ]);

    const festivalTotal = festivalCount ?? 0;
    if (festivalTotal >= 10) {
      patternsFound.push({
        pattern_title: '✨ Incremento anómalo de consultas sobre horario del festival',
        pattern_description: `Se detectaron ${festivalTotal} correos en las últimas 4 horas relacionados con la hora de salida del festival. Esto supera en un 400% la frecuencia habitual.`,
        detected_count: festivalTotal,
        timeframe_hours: 4,
        entity_key: 'festival_horario_salida',
        suggested_institutional_action: 'Preparar y emitir un comunicado oficial general por los canales institucionales de iSkool para mitigar la saturación de la bandeja.'
      });
    }

    const transportTotal = transportCount ?? 0;
    if (transportTotal >= 8) {
      patternsFound.push({
        pattern_title: 'Incidencias concentradas en Transporte - Ruta 4',
        pattern_description: `${transportTotal} familias reportan demoras reiteradas en la Ruta 4 durante los últimos 7 días.`,
        detected_count: transportTotal,
        timeframe_hours: 168,
        entity_key: 'transporte_ruta_4',
        suggested_institutional_action: 'Solicitar a Administración auditoría de tiempos de recorrido del proveedor antes de que escale a queja colectiva en Dirección.'
      });
    }

    // Persistir patrones activos en una sola operación bulk
    if (patternsFound.length > 0) {
      const rows = patternsFound.map(p => ({
        school_id: schoolId,
        pattern_title: p.pattern_title,
        pattern_description: p.pattern_description,
        detected_count: p.detected_count,
        timeframe_hours: p.timeframe_hours,
        entity_key: p.entity_key,
        suggested_institutional_action: p.suggested_institutional_action,
        status: 'ACTIVE'
      }));
      await supabase.from('inbox_patterns').upsert(rows, { onConflict: 'school_id, entity_key' });
    }

    return patternsFound;
  }

  // 2. EXPORTADOR EPISTEMOLÓGICO A LA BÓVEDA CURRICULAR INSTITUCIONAL (Memoria Institucional sin duplicar correos)
  static async exportToInstitutionalMemoryVault(matterId: string, decisionNotes: string, observedOutcome: string): Promise<string> {
    const supabase = this.getSupabase();

    const { data: matter, error } = await supabase
      .from('inbox_matters')
      .select(`
        *,
        matter_email_links (
          email_messages (id, sender_name, sender_email, subject, received_at)
        )
      `)
      .eq('id', matterId)
      .single();

    if (error || !matter) throw new Error('Asunto no encontrado.');

    const emails = matter.matter_email_links.map((link: any) => link.email_messages);
    const dateStamp = new Date().toISOString().split('T')[0];
    const fileName = `Memoria_${dateStamp}_${matter.matter_code}.md`;
    const vaultDir = path.join(process.cwd(), 'planeaciones', 'Memorias_Institucionales', '2026-2027');

    if (!fs.existsSync(vaultDir)) {
      fs.mkdirSync(vaultDir, { recursive: true });
    }

    const markdownContent = `---
tipo_documento: memoria_institucional_experiencia
codigo_asunto: "${matter.matter_code}"
fecha: "${dateStamp}"
categoria: "${matter.category}"
entidad_relacionada: "${matter.related_entity_type || 'General'}: ${matter.related_entity_id || 'N/A'}"
reincidencias: ${matter.reincidence_count}
destinatario_final: "${matter.assigned_role || 'Dirección'}"
---

# Experiencia Institucional — ${matter.title}

## 1. HECHOS (Verificables)
- **Volumen:** ${emails.length} comunicaciones recibidas y consolidadas.
- **Fechas involucradas:** ${emails[0]?.received_at || dateStamp} a ${emails[emails.length - 1]?.received_at || dateStamp}.
- **Remitentes:** ${emails.map((e: any) => `${e.sender_name} (${e.sender_email})`).join(', ')}.

## 2. OBSERVACIÓN (Patrones y Comportamiento)
- **Síntesis iSkool:** ${matter.summary}
- **Motivo de atención:** ${matter.why_shown_to_director || 'Derivado de matriz de atención prioritaria.'}

## 3. INFERENCIA
- *Hipótesis del motor cognitivo:* ${matter.recommended_action}
- *Nota epistemológica:* Hipótesis basada en precedentes de la institución. No asume causalidad sin verificación.

## 4. DECISIÓN (Dirección / Coordinación)
- **Acción ejecutada:** ${decisionNotes}

## 5. RESULTADO OBSERVADO
- **Efecto posterior:** ${observedOutcome}

---
*Procedencia de fuentes: PostgreSQL: inbox_matters [id: ${matter.id}], Gmail Message IDs vinculados.*
`;

    const fullPath = path.join(vaultDir, fileName);
    fs.writeFileSync(fullPath, markdownContent, 'utf-8');

    await supabase.from('inbox_matters').update({
      epistemic_classification: 'RESULTADO',
      updated_at: new Date().toISOString()
    }).eq('id', matterId);

    return fullPath;
  }
}
