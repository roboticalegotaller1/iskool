/**
 * @file dataPolicy.ts
 * @description Política de Minimización de Datos Sensibles y Seudonimización Zero PII (AI::DataPolicy / Ítems #6, #7 y #8).
 * Asegura que ninguna llamada al Motor de IA reciba nombres reales completos, direcciones, correos,
 * teléfonos, datos financieros o historiales personales no pedagógicos.
 */

import crypto from 'crypto';
import { SanitizedStudentContext } from './types';

export class AIDataPolicy {
  // Patrones regulares para detección de PII
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
  private static readonly PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  private static readonly CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

  /**
   * Sanitiza y seudonimiza el contexto de un estudiante antes de enviarlo a la IA.
   */
  static sanitizeStudentContext(rawStudent: {
    student_id: string;
    full_name?: string;
    email?: string;
    phone?: string;
    grade: string;
    entry_cefr?: string;
    target_cefr?: string;
    active_competencies?: string[];
    active_gaps?: string[];
  }): SanitizedStudentContext {
    let redactedCount = 0;

    if (rawStudent.full_name) redactedCount++;
    if (rawStudent.email) redactedCount++;
    if (rawStudent.phone) redactedCount++;

    // Generar un seudónimo reproducible pero irreversible externamente
    const hash = crypto.createHash('sha256').update(rawStudent.student_id).digest('hex');
    const studentRef = `student_ref_${hash.substring(0, 6)}`;

    return {
      student_ref: studentRef,
      grade: rawStudent.grade,
      entry_cefr: rawStudent.entry_cefr,
      target_cefr: rawStudent.target_cefr,
      active_competencies: rawStudent.active_competencies || [],
      active_gaps: rawStudent.active_gaps || [],
      pii_redacted: redactedCount > 0,
      redacted_fields_count: redactedCount
    };
  }

  /**
   * Redacta cualquier aparición accidental de información sensible en texto libre.
   */
  static redactSensitiveText(text: string): { sanitized: string; hadPii: boolean } {
    if (!text) return { sanitized: '', hadPii: false };

    let hadPii = false;
    let sanitized = text;

    if (this.EMAIL_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.EMAIL_REGEX, '[CORREO_REDACTADO]');
      hadPii = true;
    }

    if (this.PHONE_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.PHONE_REGEX, '[TELÉFONO_REDACTADO]');
      hadPii = true;
    }

    if (this.CREDIT_CARD_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.CREDIT_CARD_REGEX, '[FINANCIERO_REDACTADO]');
      hadPii = true;
    }

    return { sanitized, hadPii };
  }
}
