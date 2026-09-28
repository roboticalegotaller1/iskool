/**
 * @file piiGuard.ts
 * @description Filtro y guardián cripto-pedagógico para la Regla No Negociable de Privacidad de Menores.
 * Bloquea estrictamente cualquier intento de persistir Información de Identificación Personal (PII),
 * CURP, correos, teléfonos o calificaciones individuales de estudiantes en la Bóveda Curricular.
 */

export class PedagogicalPrivacyViolationError extends Error {
  constructor(message: string, public readonly detectedPatterns: string[]) {
    super(`[VIOLACIÓN DE PRIVACIDAD DE MENORES]: ${message}`);
    this.name = 'PedagogicalPrivacyViolationError';
  }
}

export interface PiiScanResult {
  hasPii: boolean;
  violations: string[];
  sanitizedText: string;
}

export class PedagogicalPiiGuard {
  // Expresión regular oficial para CURP mexicana (18 caracteres)
  private static CURP_REGEX = /[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d/gi;

  // Correo electrónico
  private static EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

  // Teléfonos (10 dígitos con o sin separadores comunes)
  private static PHONE_REGEX = /(?:\+?52\s?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/g;

  // Matrículas o IDs de estudiantes individuales en contextos evaluativos
  private static STUDENT_PII_PATTERNS = [
    /"(?:student_name|nombre_estudiante|nombre_alumno|matricula|student_id|curp)"\s*:\s*"?[^",}]+/gi,
    /\b(?:alumno|alumna|estudiante|niño|niña|student_name)\s*:\s*[A-ZÁÉÍÓÚÑa-záéíóúñ]{3,}\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]{3,}/gi,
    /\bmatricula\s*:\s*\d{6,}/gi,
    /\bcurp\s*:\s*[A-Za-z0-9]{16,18}\b/gi,
    /\b(?:calificación|calif|nota)\s+individual\s*:\s*\d+/gi
  ];

  /**
   * Escanea minuciosamente cualquier texto o estructura de datos.
   * Si detecta PII, devuelve el listado de violaciones.
   */
  static scan(text: string): PiiScanResult {
    const violations: string[] = [];

    // 1. Detección de CURP
    const curpMatches = text.match(this.CURP_REGEX);
    if (curpMatches && curpMatches.length > 0) {
      violations.push(`Se detectó CURP oficial de menor o usuario: ${curpMatches.length} ocurrencia(s).`);
    }

    // 2. Detección de correos
    const emailMatches = text.match(this.EMAIL_REGEX);
    if (emailMatches && emailMatches.length > 0) {
      violations.push(`Se detectaron direcciones de correo electrónico personales: ${emailMatches.length} ocurrencia(s).`);
    }

    // 3. Detección de teléfonos
    const phoneMatches = text.match(this.PHONE_REGEX);
    if (phoneMatches && phoneMatches.length > 0) {
      // Filtrar números comunes de 4 dígitos que no sean teléfonos
      const truePhones = phoneMatches.filter(p => p.replace(/\D/g, '').length >= 10);
      if (truePhones.length > 0) {
        violations.push(`Se detectaron números telefónicos personales: ${truePhones.length} ocurrencia(s).`);
      }
    }

    // 4. Patrones de expediente nominativo de menor
    for (const pattern of this.STUDENT_PII_PATTERNS) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        violations.push(`Se detectó referencia nominal directa a expediente de menor: "${matches[0]}"`);
      }
    }

    const hasPii = violations.length > 0;
    let sanitizedText = text;

    if (hasPii) {
      sanitizedText = sanitizedText
        .replace(this.CURP_REGEX, '[CURP_ANONIMIZADA_PROTEGIDA]')
        .replace(this.EMAIL_REGEX, '[EMAIL_REMITIDO_PROTEGIDO]');
    }

    return {
      hasPii,
      violations,
      sanitizedText
    };
  }

  /**
   * Valida estrictamente un objeto antes de persistirlo en la Bóveda Curricular.
   * Lanza PedagogicalPrivacyViolationError si no cumple con la regla de Cero PII.
   */
  static assertZeroPii(data: unknown, contextName: string = 'Documento de Memoria'): void {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    const result = this.scan(serialized);

    if (result.hasPii) {
      throw new PedagogicalPrivacyViolationError(
        `El contenido destinado a la Bóveda Curricular en "${contextName}" contiene información personal identificable (PII) prohibida. Rails/PostgreSQL es la única fuente autorizada para alumnos y calificaciones individuales.`,
        result.violations
      );
    }
  }
}
