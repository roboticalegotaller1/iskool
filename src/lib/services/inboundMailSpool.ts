import { InboundEmailDTO } from './hermetic-email-brain.service';

/**
 * ============================================================================
 * SPOOL Y PASARELA DE CORREO ENTRANTE MULTI-TENANT (iSkool Autonomous Mail Gateway)
 * Almacena y despacha correos entrantes en tiempo real para ejecución de Triage.
 * Persistido en globalThis para sobrevivir a hot-reloads en desarrollo y producción.
 * ============================================================================
 */

export interface QueuedInboundEmail extends InboundEmailDTO {
  id: string;
  tenant_id: string;
  enqueued_at: string;
  is_processed: boolean;
}

// Búfer global adjunto a globalThis para persistencia entre invocaciones
const globalMailSpool: Map<string, QueuedInboundEmail[]> =
  (globalThis as any).__iSkoolGlobalMailSpool ||
  ((globalThis as any).__iSkoolGlobalMailSpool = new Map());

// Registro de mensajes ya procesados por hash/título para evitar duplicidad absoluta
const processedTitleSet: Set<string> =
  (globalThis as any).__iSkoolProcessedMailSet ||
  ((globalThis as any).__iSkoolProcessedMailSet = new Set());

function normalizeSubject(subject: string): string {
  return (subject || '')
    .trim()
    .toLowerCase()
    .replace(/^(re:|fwd:)\s*/i, '')
    .trim();
}

export const InboundMailSpoolService = {
  /**
   * Encolar un correo entrante para un tenant específico con deduplicación estricta
   */
  enqueueEmail(tenantId: string, email: InboundEmailDTO): QueuedInboundEmail | null {
    const queue = globalMailSpool.get(tenantId) || [];
    const normSub = normalizeSubject(email.subject);

    // Si ya existe en la cola pendiente o procesada con el mismo asunto normalizado, no duplicar
    const alreadyExists = queue.some(
      (item) => normalizeSubject(item.subject) === normSub
    );
    if (alreadyExists) {
      return null;
    }

    const queuedItem: QueuedInboundEmail = {
      ...email,
      id: `inb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenant_id: tenantId,
      enqueued_at: new Date().toISOString(),
      is_processed: false
    };

    queue.push(queuedItem);
    globalMailSpool.set(tenantId, queue);
    return queuedItem;
  },

  /**
   * Obtener correos pendientes de triage para un tenant
   */
  getPendingEmails(tenantId: string, filterRecipientEmail?: string): QueuedInboundEmail[] {
    const queue = globalMailSpool.get(tenantId) || [];
    return queue.filter((item) => {
      if (item.is_processed) return false;
      if (filterRecipientEmail) {
        const target = filterRecipientEmail.toLowerCase().trim();
        const recipient = (item.recipient_email || '').toLowerCase().trim();
        const sender = (item.sender_email || '').toLowerCase().trim();
        return recipient.includes(target) || sender.includes(target) || !item.recipient_email;
      }
      return true;
    });
  },

  /**
   * Marcar correos como procesados tras el triage
   */
  markAsProcessed(tenantId: string, emailIds: string[]): void {
    const queue = globalMailSpool.get(tenantId) || [];
    const idSet = new Set(emailIds);
    for (const item of queue) {
      if (idSet.has(item.id)) {
        item.is_processed = true;
        processedTitleSet.add(`${tenantId}:${normalizeSubject(item.subject)}`);
      }
    }
    globalMailSpool.set(tenantId, queue);
  },

  /**
   * Sincroniza el buzón activo y asegura la ingesta de los correos reales
   * recibidos en la cuenta de Gmail / servidor del usuario (ej. "Alumno herido", "CTE urgente").
   * Aplica deduplicación estricta contra existingTitles para jamás duplicar asuntos.
   */
  syncLiveInboxForAccount(
    tenantId: string,
    accountEmail: string,
    existingTitles: string[] = [],
    externalEmails: InboundEmailDTO[] = []
  ): QueuedInboundEmail[] {
    const normExisting = new Set(existingTitles.map(t => normalizeSubject(t)));
    if (!externalEmails || externalEmails.length === 0) {
      return [];
    }

    const newlyEnqueued: QueuedInboundEmail[] = [];

    for (const realEmail of externalEmails) {
      const normSub = normalizeSubject(realEmail.subject);
      // Si el cliente ya tiene este asunto en su dashboard, NO encolarlo de nuevo
      if (normExisting.has(normSub)) {
        continue;
      }
      // Si ya fue procesado previamente en este tenant, NO encolarlo de nuevo
      if (processedTitleSet.has(`${tenantId}:${normSub}`)) {
        continue;
      }

      const enqueued = this.enqueueEmail(tenantId, realEmail);
      if (enqueued) {
        newlyEnqueued.push(enqueued);
      }
    }

    return newlyEnqueued;
  },

  /**
   * Limpiar la cola de un tenant (para pruebas y depuración)
   */
  clearQueue(tenantId: string): void {
    globalMailSpool.delete(tenantId);
    for (const key of Array.from(processedTitleSet.keys())) {
      if (key.startsWith(`${tenantId}:`)) {
        processedTitleSet.delete(key);
      }
    }
  }
};
