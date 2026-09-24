/**
 * @file inputSanitizer.ts
 * @description Sanitizador perimetral de entradas de texto para prevenir ataques XSS,
 * inyección de código y comandos maliciosos en chats estudiantiles y formularios de copilot.
 */

export interface SanitizationResult {
  cleanText: string;
  hadThreats: boolean;
  threatTypes: string[];
  hasInjectionAttempt: boolean;
}

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:[^"']*/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous\s+)?instructions/gi,
  /olvida\s+(?:todas\s+)?(?:las\s+)?instrucciones/gi,
  /bypass\s+(?:safety|rules|filters)/gi,
  /system\s+prompt\s+override/gi,
  /dame\s+100\s+(?:de\s+calificaci[oó]n|autom[aá]tico)/gi,
  /give\s+(?:me\s+)?automatic\s+100/gi
];

export class InputSanitizer {
  /**
   * Sanitiza una cadena de texto eliminando etiquetas HTML peligrosas y secuencias de script.
   */
  static sanitizeText(input: string): SanitizationResult {
    if (!input || typeof input !== 'string') {
      return { cleanText: '', hadThreats: false, threatTypes: [], hasInjectionAttempt: false };
    }

    let clean = input;
    const threatTypes: string[] = [];

    // 1. Detectar y eliminar XSS
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(clean)) {
        threatTypes.push('xss_attempt');
        clean = clean.replace(pattern, '');
      }
    }

    // 2. Eliminar tags HTML generales si no están permitidos
    const strippedHtml = clean.replace(/<[^>]*>/g, '');
    if (strippedHtml !== clean) {
      threatTypes.push('html_tags_stripped');
      clean = strippedHtml;
    }

    // 3. Detectar intentos de inyección de prompt
    let hasPromptInjection = false;
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(clean)) {
        hasPromptInjection = true;
        threatTypes.push('prompt_injection_heuristic');
        break;
      }
    }

    return {
      cleanText: clean.trim(),
      hadThreats: threatTypes.length > 0 || hasPromptInjection,
      threatTypes,
      hasInjectionAttempt: hasPromptInjection
    };
  }

  /**
   * Escapa caracteres HTML para renderizado seguro en frontend.
   */
  static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
