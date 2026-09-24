/**
 * @file safeJson.ts
 * @description Utilidad de parseo defensivo de JSON con protección contra Prototype Pollution,
 * eliminación de fences de Markdown y manejo robusto de respuestas truncadas o malformadas.
 */

export interface SafeJsonOptions<T> {
  fallback?: T;
  validator?: (data: unknown) => data is T;
  removeDangerousKeys?: boolean;
}

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Sanitiza un objeto eliminando recursivamente claves peligrosas que puedan
 * causar polución de prototipos en tiempo de ejecución.
 */
export function sanitizeObject<T>(obj: unknown): T {
  if (obj === null || typeof obj !== 'object') {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  const cleanObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }
    cleanObj[key] = sanitizeObject(value);
  }

  return cleanObj as T;
}

/**
 * Limpia y normaliza texto crudo para extraer bloques JSON válidos.
 */
export function extractJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Eliminar delimitadores de Markdown: ```json ... ``` o ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Si hay texto antes o después del JSON, localizar el primer '{' o '[' y el último '}' o ']'
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;

  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  let endIdx = -1;

  if (lastBrace !== -1 && lastBracket !== -1) {
    endIdx = Math.max(lastBrace, lastBracket);
  } else if (lastBrace !== -1) {
    endIdx = lastBrace;
  } else if (lastBracket !== -1) {
    endIdx = lastBracket;
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  return cleaned;
}

/**
 * Parsea de forma segura cualquier cadena JSON, aplicando protección contra prototype pollution
 * y garantizando que una respuesta malformada o truncada no detenga el proceso del servidor.
 */
export function safeJsonParse<T = unknown>(
  raw: string | undefined | null,
  options: SafeJsonOptions<T> = {}
): { success: boolean; data: T; error?: string } {
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return {
      success: false,
      data: options.fallback as T,
      error: 'Entrada vacía o nula proporcionada para safeJsonParse.'
    };
  }

  try {
    const cleanedString = extractJsonString(raw);
    const parsed = JSON.parse(cleanedString);

    const sanitized = options.removeDangerousKeys !== false
      ? sanitizeObject<T>(parsed)
      : (parsed as T);

    if (options.validator && !options.validator(sanitized)) {
      return {
        success: false,
        data: options.fallback as T,
        error: 'El JSON parseado no cumplió con el validador de esquema requerido.'
      };
    }

    return {
      success: true,
      data: sanitized
    };
  } catch (err: any) {
    return {
      success: false,
      data: options.fallback as T,
      error: `Error de sintaxis JSON: ${err.message}`
    };
  }
}
