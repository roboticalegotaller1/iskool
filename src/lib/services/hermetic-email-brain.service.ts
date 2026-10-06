/**
 * ============================================================================
 * SERVICIO COGNITIVO HERMÉTICO DE TRIAGE Y RAG MULTI-TENANT (iSkool Core & IBIME)
 * Arquitectura de Inferencia en Tiempo Real y Búsqueda Vectorial Aislada
 * ============================================================================
 */

export type EmailQuadrant = 
  | 'ATENCION_CEO'      // 🔴 Asuntos de gobernanza, riesgo legal/normativo, incidencias graves o reincidencia
  | 'DELEGADO_CON_SLA'  // 🟡 Asuntos operativos derivados con tiempo estipulado
  | 'INFORMATIVO'       // 🔵 Circulares, confirmaciones o comunicados que solo se archivan
  | 'SPAM_DESCARTADO';  // ⚪ Correos irrelevantes o publicidad no solicitada

export interface DocumentProvenance {
  document_title: string;
  source_path: string;
  category: string;
  matched_clause: string;
  confidence_score: number;
  tenant_id: string;
}

export interface SuggestedDraft {
  subject: string;
  body: string;
  tone: string;
  can_auto_send: boolean;
}

export interface TriageResult {
  quadrant: EmailQuadrant;
  urgency: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  category: string;
  assigned_department?: string;
  sla_hours?: number;
  why_shown_to_director: string;
  recommended_action: string;
  suggested_draft: SuggestedDraft;
  provenance: DocumentProvenance[];
  telemetry: {
    latency_ms: number;
    vector_search_ms: number;
    inference_ms: number;
    tenant_id: string;
    institution_name: string;
    timestamp: string;
  };
}

export interface InboundEmailDTO {
  sender_email: string;
  sender_name?: string;
  recipient_email?: string;
  subject: string;
  body_text: string;
  received_at?: string;
  reincidence_count?: number;
}

export interface HermeticAuthSession {
  user?: {
    id?: string;
    email?: string;
    app_metadata?: {
      tenant_id?: string;
      role?: string;
      institution_name?: string;
      is_isolated_sandbox?: boolean;
      [key: string]: any;
    };
  };
  app_metadata?: {
    tenant_id?: string;
    role?: string;
    institution_name?: string;
    is_isolated_sandbox?: boolean;
    [key: string]: any;
  };
  tenant_id?: string;
  institution_name?: string;
  role?: string;
  is_isolated_sandbox?: boolean;
}

// BÓVEDA CURRICULAR Y REGLAMENTARIA AISLADA POR TENANT
interface CatalogDoc {
  tenant_id: string;
  document_title: string;
  source_path: string;
  category: string;
  content: string;
  keywords: string[];
}

const ISOLATED_TENANT_KNOWLEDGE: Record<string, CatalogDoc[]> = {
  // TENANT OFICIAL: IBIME
  'e1000000-0000-0000-0000-000000000001': [
    {
      tenant_id: 'e1000000-0000-0000-0000-000000000001',
      document_title: 'Protocolo de Convivencia y Prevención de Violencia Escolar',
      source_path: 'planeaciones/IBIME/Protocolo_Convivencia_y_Acoso.md',
      category: 'Convivencia y Mediación',
      content: 'Cualquier reporte de acoso, violencia física o verbal activa inmediatamente el Protocolo Nivel 3. La Dirección General convoca a reunión presencial con ambas familias dentro de un plazo estricto no mayor a 12 horas. Coordinación emite el informe inicial y se designa tutoría de acompañamiento socioemocional.',
      keywords: ['acoso', 'bullying', 'agresión', 'pelea', 'insulto', 'convivencia', 'reunión', 'demanda', 'violencia']
    },
    {
      tenant_id: 'e1000000-0000-0000-0000-000000000001',
      document_title: 'Reglamento del Servicio de Transporte Escolar Bicultural',
      source_path: 'planeaciones/IBIME/Politica_Transporte_y_Rutas_Escolares.md',
      category: 'Transporte y Prefectura',
      content: 'El servicio de Transporte Escolar de IBIME (Rutas 1 a 6) opera con monitoreo telemático. El tiempo máximo de tolerancia en paradas matutinas es de 5 minutos. Ante retrasos imputables al tránsito vehicular mayores a 15 minutos, la Coordinación de Logística emite aviso vía mensaje institucional a los tutores.',
      keywords: ['transporte', 'ruta 4', 'ruta', 'camión', 'chofer', 'retraso', 'parada', 'demora']
    },
    {
      tenant_id: 'e1000000-0000-0000-0000-000000000001',
      document_title: 'Manual de Cobranza, Facturación y Becas Académicas',
      source_path: 'planeaciones/IBIME/Lineamientos_Cobranza_y_Colegiaturas.md',
      category: 'Administración y Cobranza',
      content: 'Las colegiaturas vencen el día 10 natural de cada mes. Para solicitud de prórroga o factura fiscal CFDI con complemento educativo, el tutor debe remitir solicitud a administracion@ibime.edu.mx. Las solicitudes se resuelven en un plazo de 24 horas hábiles.',
      keywords: ['colegiatura', 'pago', 'factura', 'cfdi', 'recargo', 'adeudo', 'beca', 'cobranza', 'prórroga']
    },
    {
      tenant_id: 'e1000000-0000-0000-0000-000000000001',
      document_title: 'Calendario Oficial Escolar y Evaluaciones Trimestrales',
      source_path: 'planeaciones/IBIME/Calendario_Oficial_Evaluaciones_2025_2026.md',
      category: 'Control Escolar y Secretaría',
      content: 'La entrega de boletas oficiales y kardex SEP se realiza en la tercera semana de noviembre para el primer periodo. Las constancias de estudio con sello oficial se expiden en un periodo de 48 horas tras solicitud formal.',
      keywords: ['boleta', 'kardex', 'constancia', 'calificaciones', 'certificado', 'examen', 'evaluación', 'horario']
    }
  ],

  // TENANT OFICIAL: iSkool Core
  'e2000000-0000-0000-0000-000000000002': [
    {
      tenant_id: 'e2000000-0000-0000-0000-000000000002',
      document_title: 'Lineamientos de Gobernanza y Convivencia Escolar iSkool',
      source_path: 'planeaciones/iSkool/Lineamientos_Gobernanza_iSkool.md',
      category: 'Gobernanza Institucional',
      content: 'Incidencias críticas de convivencia escolar son escaladas a Dirección Ejecutiva. Las mesas de diálogo se programan en menos de 12 horas hábiles con acta firmada por las partes.',
      keywords: ['acoso', 'bullying', 'conflicto', 'legal', 'dirección', 'reunión', 'demanda']
    },
    {
      tenant_id: 'e2000000-0000-0000-0000-000000000002',
      document_title: 'Reglamento de Operaciones, Horarios y Logística',
      source_path: 'planeaciones/iSkool/Calendario_Operativo_iSkool.md',
      category: 'Operaciones',
      content: 'Horario regular de ingreso: 07:45 hrs. Salida ordinaria: 14:15 hrs. En días de festival o asambleas generales, la salida escalonada es a las 13:00 hrs.',
      keywords: ['horario', 'festival', 'salida', 'entrada', 'asamblea', 'evento']
    }
  ]
};

import { supabase } from '@/lib/supabaseClient';

export class HermeticEmailBrainService {
  private static isRealSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !!(url && !url.includes('placeholder'));
  }

  /**
   * Procesa e infiere el cuadrante, procedencia y respuesta de un correo entrante
   * garantizando aislamiento estricto por tenant_id.
   */
  static async processInboundEmail(
    email: InboundEmailDTO,
    session: HermeticAuthSession
  ): Promise<TriageResult> {
    const t0 = performance.now();

    // 1. VALIDACIÓN OBLIGATORIA DE TENANT_ID (REGLA TÉCNICA 1)
    const tenantId = session.user?.app_metadata?.tenant_id || 
                     session.app_metadata?.tenant_id || 
                     session.tenant_id;

    if (!tenantId) {
      throw new Error("Acceso denegado: Sesión sin tenant asignado.");
    }

    const institutionName = session.user?.app_metadata?.institution_name ||
                            session.app_metadata?.institution_name ||
                            session.institution_name ||
                            'Institución Educativa';

    const isIsolatedSandbox = session.user?.app_metadata?.is_isolated_sandbox ??
                             session.app_metadata?.is_isolated_sandbox ??
                             session.is_isolated_sandbox ??
                             false;

    // 2. BÚSQUEDA VECTORIAL / RAG AISLADA ESTRICTAMENTE POR TENANT_ID (WHERE tenant_id = current_tenant_id)
    const tVectorStart = performance.now();
    const provenanceList = await this.queryIsolatedTenantKnowledge(
      tenantId,
      `${email.subject} ${email.body_text}`,
      institutionName,
      isIsolatedSandbox
    );
    const vectorSearchMs = Math.round(performance.now() - tVectorStart);

    // 3. CLASIFICACIÓN EN TIEMPO REAL EN LOS 4 CUADRANTES
    const tInferStart = performance.now();
    const classification = this.classifyQuadrant(email, provenanceList, institutionName);
    const inferenceMs = Math.round(performance.now() - tInferStart);

    // 4. GENERACIÓN DEL BORRADOR EXPLICABLE Y FORMAL
    const draft = this.generateOfficialDraft(
      email,
      classification,
      provenanceList,
      institutionName
    );

    const totalLatencyMs = Math.round(performance.now() - t0);

    return {
      quadrant: classification.quadrant,
      urgency: classification.urgency,
      category: classification.category,
      assigned_department: classification.assigned_department,
      sla_hours: classification.sla_hours,
      why_shown_to_director: classification.why_shown_to_director,
      recommended_action: classification.recommended_action,
      suggested_draft: draft,
      provenance: provenanceList,
      telemetry: {
        latency_ms: totalLatencyMs,
        vector_search_ms: vectorSearchMs,
        inference_ms: inferenceMs,
        tenant_id: tenantId,
        institution_name: institutionName,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Búsqueda RAG de conocimiento institucional garantizando CERO consultas cruzadas.
   * Filtra obligatoriamente por WHERE tenant_id = current_tenant_id.
   */
  private static async queryIsolatedTenantKnowledge(
    currentTenantId: string,
    queryText: string,
    institutionName: string,
    isSandbox: boolean
  ): Promise<DocumentProvenance[]> {
    const lowerQuery = queryText.toLowerCase();
    const results: DocumentProvenance[] = [];

    // Intento de consulta en base de datos PostgreSQL con filtro RLS explícito
    if (this.isRealSupabaseConfigured()) {
      try {
        const { data: dbMemories } = await supabase
          .from('institutional_memory')
          .select('id, tenant_id, topic, subject, academic_cycle, content')
          .eq('tenant_id', currentTenantId) // FILTRO OBLIGATORIO DE TENANT
          .limit(3);

        if (dbMemories && dbMemories.length > 0) {
          for (const mem of dbMemories) {
            results.push({
              document_title: `Memoria Institucional: ${mem.topic}`,
              source_path: `institutional_memory/${mem.id}`,
              category: mem.subject || 'Memoria Histórica',
              matched_clause: mem.content ? mem.content.slice(0, 180) + '...' : 'Precedente registrado en base de datos.',
              confidence_score: 0.95,
              tenant_id: currentTenantId
            });
          }
        }
      } catch {
        // Fallback a bóveda estática aislada por tenant
      }
    }

    // Consulta en Bóveda Curricular propia del tenant autenticado
    let tenantDocs = ISOLATED_TENANT_KNOWLEDGE[currentTenantId];

    // Si es un sandbox dinámico, generar catálogo aislado exclusivo para ese tenant
    if (!tenantDocs && isSandbox) {
      tenantDocs = [
        {
          tenant_id: currentTenantId,
          document_title: `Lineamientos Generales de Operación (${institutionName})`,
          source_path: `sandbox/${currentTenantId}/lineamientos_generales.md`,
          category: 'Normativa General Sandbox',
          content: `Reglamento interno provisional para ${institutionName}. Las consultas son resueltas por la Dirección conforme a criterios de equidad y mediación institucional.`,
          keywords: ['horario', 'salida', 'reunión', 'pago', 'profesor', 'duda']
        },
        {
          tenant_id: currentTenantId,
          document_title: `Protocolo de Convivencia y Casos Críticos (${institutionName})`,
          source_path: `sandbox/${currentTenantId}/protocolo_convivencia.md`,
          category: 'Convivencia Escolar',
          content: 'Cualquier reporte de acoso o conflicto grave se atiende de forma directa por Dirección dentro de las 12 horas siguientes.',
          keywords: ['acoso', 'bullying', 'conflicto', 'demanda', 'urgente']
        }
      ];
    }

    if (tenantDocs) {
      for (const doc of tenantDocs) {
        // Doble verificación inmutable: JAMÁS retornar registros de otro tenant
        if (doc.tenant_id !== currentTenantId) {
          continue;
        }

        const matchScore = doc.keywords.filter(k => lowerQuery.includes(k)).length;
        if (matchScore > 0) {
          results.push({
            document_title: doc.document_title,
            source_path: doc.source_path,
            category: doc.category,
            matched_clause: doc.content,
            confidence_score: Math.min(0.98, 0.70 + matchScore * 0.10),
            tenant_id: currentTenantId
          });
        }
      }
    }

    return results;
  }

  /**
   * Clasificación en los 4 Cuadrantes Canónicos
   */
  private static classifyQuadrant(
    email: InboundEmailDTO,
    provenance: DocumentProvenance[],
    institutionName: string
  ): {
    quadrant: EmailQuadrant;
    urgency: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
    category: string;
    assigned_department?: string;
    sla_hours?: number;
    why_shown_to_director: string;
    recommended_action: string;
  } {
    const text = `${email.subject} ${email.body_text}`.toLowerCase();
    const reincidence = email.reincidence_count || 1;

    // CUADRANTE 4: SPAM / DESCARTADO ⚪
    const spamSignals = [
      'viagra', 'cripto', 'crypto', 'ganaste', 'herencia', 'casino',
      'préstamo inmediato', 'hot singles', 'click here', 'sin buró', 'tarifa promocional no solicitada'
    ];
    if (spamSignals.some(s => text.includes(s))) {
      return {
        quadrant: 'SPAM_DESCARTADO',
        urgency: 'BAJA',
        category: 'Spam / No Deseado',
        why_shown_to_director: 'Correo irrelevante o publicitario. Descartado para proteger el tiempo directivo.',
        recommended_action: 'Archivar y mantener en lista de filtrado automático.'
      };
    }

    // CUADRANTE 1: ATENCION_CEO 🔴
    const ceoEmergencySignals = [
      'acoso', 'bullying', 'demanda', 'abogado', 'urgente dirección', 'golpe',
      'agresión', 'negligencia', 'denuncia', 'rectoría', 'amenaza', 'profeco',
      'queja ante sep', 'denuncia sep', 'inspección sep', 'multa sep'
    ];
    const isCriticalIssue = ceoEmergencySignals.some(s => text.includes(s));
    const isReincidenceExceeded = reincidence >= 3;

    if (isCriticalIssue || isReincidenceExceeded) {
      let why = 'Asunto con implicación de gobernanza o riesgo normativo que requiere criterio ético y resolución directa de Dirección.';
      if (isReincidenceExceeded) {
        why = `Alerta de reincidencia elevada: La familia o remitente acumula ${reincidence} comunicaciones sobre este caso sin resolución conforme.`;
      }

      return {
        quadrant: 'ATENCION_CEO',
        urgency: isCriticalIssue ? 'CRITICA' : 'ALTA',
        category: isCriticalIssue ? 'Riesgo Normativo / Caso Crítico' : 'Reincidencia Directiva',
        assigned_department: 'Dirección General / CEO',
        sla_hours: 12,
        why_shown_to_director: why,
        recommended_action: 'Convocar de inmediato a mesa de mediación presencial y activar el protocolo correspondiente.'
      };
    }

    // CUADRANTE 2: DELEGADO_CON_SLA 🟡
    // Cobranza / Facturación
    if (text.includes('factura') || text.includes('cfdi') || text.includes('colegiatura') || text.includes('recargo') || text.includes('pago')) {
      return {
        quadrant: 'DELEGADO_CON_SLA',
        urgency: 'MEDIA',
        category: 'Cobranza y Facturación',
        assigned_department: 'Departamento Administrativo / Cobranza',
        sla_hours: 24,
        why_shown_to_director: 'Trámite operativo derivado a Cobranza para emisión de factura o resolución de aclaración financiera.',
        recommended_action: 'Derivar a Cobranza con SLA de 24 horas y enviar borrador informativo preventivo.'
      };
    }

    // Control Escolar / Trámites SEP
    if (text.includes('boleta') || text.includes('kardex') || text.includes('constancia') || text.includes('certificado') || text.includes('revalidación')) {
      return {
        quadrant: 'DELEGADO_CON_SLA',
        urgency: 'MEDIA',
        category: 'Control Escolar y Trámites',
        assigned_department: 'Secretaría / Control Escolar',
        sla_hours: 48,
        why_shown_to_director: 'Solicitud documental que compete a los procedimientos oficiales de Control Escolar.',
        recommended_action: 'Canalizar a Secretaría para cotejo de expediente y emisión con sello oficial.'
      };
    }

    // Prefectura / Transporte
    if (text.includes('transporte') || text.includes('ruta 4') || text.includes('ruta') || text.includes('camión') || text.includes('uniforme') || text.includes('inasistencia')) {
      return {
        quadrant: 'DELEGADO_CON_SLA',
        urgency: 'MEDIA',
        category: 'Logística y Transporte',
        assigned_department: 'Coordinación de Logística y Prefectura',
        sla_hours: 24,
        why_shown_to_director: 'Incidencia operativa de logística o servicio de transporte.',
        recommended_action: 'Auditar tiempos de recorrido con el proveedor de transporte y responder con lineamiento oficial.'
      };
    }

    // Coordinación Académica
    if (text.includes('tarea') || text.includes('examen') || text.includes('profesor') || text.includes('temario') || text.includes('materia')) {
      return {
        quadrant: 'DELEGADO_CON_SLA',
        urgency: 'MEDIA',
        category: 'Gestión Académica',
        assigned_department: 'Coordinación Académica',
        sla_hours: 24,
        why_shown_to_director: 'Consulta sobre el desarrollo de clase o contenidos evaluativos derivada a Coordinación.',
        recommended_action: 'Instruir al titular del grupo a brindar retroalimentación puntual.'
      };
    }

    // CUADRANTE 3: INFORMATIVO 🔵
    return {
      quadrant: 'INFORMATIVO',
      urgency: 'BAJA',
      category: 'Comunicación Institucional / Informativo',
      why_shown_to_director: 'Comunicado general, felicitación o notificación que no requiere gestión ejecutiva.',
      recommended_action: 'Archivar con acuse de recibo estandarizado.'
    };
  }

  /**
   * Genera el borrador formal basado estrictamente en la procedencia institucional
   */
  private static generateOfficialDraft(
    email: InboundEmailDTO,
    classification: {
      quadrant: EmailQuadrant;
      urgency: string;
      category: string;
      assigned_department?: string;
      sla_hours?: number;
    },
    provenance: DocumentProvenance[],
    institutionName: string
  ): SuggestedDraft {
    const sender = email.sender_name || 'Estimada Familia';
    const cleanSubject = email.subject.replace(/^(re:|fwd:)\s*/i, '').trim();

    // 1. Borrador para SPAM
    if (classification.quadrant === 'SPAM_DESCARTADO') {
      return {
        subject: `Notificación de Seguridad - ${institutionName}`,
        body: 'El mensaje ha sido clasificado como no prioritario o comercial y no amerita réplica institucional.',
        tone: 'Neutro / Filtrado',
        can_auto_send: false
      };
    }

    // 2. Borrador para ATENCIÓN CEO
    if (classification.quadrant === 'ATENCION_CEO') {
      return {
        subject: `Re: ${cleanSubject} — Atención Prioritaria de Dirección General`,
        body: `Estimada(o) ${sender}:\n\nHe recibido de manera directa y prioritaria su comunicación respecto a "${cleanSubject}". En ${institutionName}, la seguridad, el bienestar y la dignidad de cada integrante de nuestra comunidad constituyen un compromiso irrestrenable.\n\nHe convocado al equipo directivo correspondiente para revisar de inmediato los antecedentes de esta situación. Deseo agendar una reunión presencial en Dirección General mañana a las 08:30 hrs para atender este caso con la formalidad y resolución que merece.\n\nLe reitero mi atención personal.\n\nAtentamente,\nDirección General\n${institutionName}`,
        tone: 'Formal, Empático y Resolutivo',
        can_auto_send: false
      };
    }

    // 3. Borrador para DELEGADO CON SLA
    if (classification.quadrant === 'DELEGADO_CON_SLA') {
      const dept = classification.assigned_department || 'el área correspondiente';
      const sla = classification.sla_hours || 24;
      const citation = provenance.length > 0 ? `\n\nConforme a los lineamientos institucionales vigentes: "${provenance[0].matched_clause}"` : '';

      return {
        subject: `Re: ${cleanSubject} — Folio de Seguimiento Institucional`,
        body: `Estimada(o) ${sender}:\n\nLe confirmamos la recepción de su comunicación sobre "${cleanSubject}". Le informamos que su solicitud ha sido turnada con folio oficial a ${dept}, con un tiempo máximo de respuesta estipulado de ${sla} horas hábiles.${citation}\n\nUn representante del área se pondrá en contacto directo con usted para dar conclusión a su solicitud.\n\nAgradecemos su confianza.\n\nAtentamente,\nAtención Institucional\n${institutionName}`,
        tone: 'Institucional, Claro y Estructurado',
        can_auto_send: true
      };
    }

    // 4. Borrador para INFORMATIVO
    return {
      subject: `Acuse de Recibo: ${cleanSubject}`,
      body: `Estimada(o) ${sender}:\n\nAgradecemos su comunicación en relación con "${cleanSubject}". Hemos tomado debida nota en nuestros registros institucionales.\n\nQuedamos a su disposición para cualquier requerimiento adicional.\n\nAtentamente,\nAdministración Escolar\n${institutionName}`,
      tone: 'Cortés y Protocolario',
      can_auto_send: true
    };
  }
}
