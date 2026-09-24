/**
 * @file responseParser.ts
 * @description Parsea y sanitiza la respuesta devuelta por el Motor de IA Pedagógica.
 * Limpia delimitadores markdown (```json ... ```), analiza la sintaxis JSON y normaliza estructuras.
 */

import { AcademicActivityOutput } from './types';

export class AcademicGenerationResponseParser {
  /**
   * Parsea la respuesta en texto plano devuelta por el modelo a un objeto AcademicActivityOutput tipado.
   */
  static parse(rawResponse: string): AcademicActivityOutput {
    if (!rawResponse || typeof rawResponse !== 'string' || rawResponse.trim().length === 0) {
      throw new Error('AcademicGenerationResponseParser: La respuesta del modelo está vacía.');
    }

    const cleaned = this.cleanJsonString(rawResponse);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err: unknown) {
      const parseError = err instanceof Error ? err.message : String(err);
      throw new Error(
        `AcademicGenerationResponseParser: Error al parsear JSON devuelto por el modelo: ${parseError}\nRespuesta cruda:\n${rawResponse.slice(0, 500)}`
      );
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('AcademicGenerationResponseParser: La salida del modelo no es un objeto JSON válido.');
    }

    return parsed as AcademicActivityOutput;
  }

  /**
   * Elimina bloques de formato markdown y espacios laterales.
   */
  static cleanJsonString(raw: string): string {
    let text = raw.trim();

    // Eliminar ```json ... ``` o ``` ... ```
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '');
      text = text.replace(/\s*```$/, '');
      text = text.trim();
    }

    // Si aún tiene comillas o caracteres raros al inicio/final
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    return text;
  }
}
