/**
 * @file generator.ts
 * @description Punto de entrada unificado y Service Object principal del módulo de Generación Académica.
 * Sigue el patrón estándar de arquitectura limpia:
 *   AcademicGenerationGenerator.call(params)
 * Orquesta la validación de solicitud, la recuperación del Knowledge Vault, la inferencia por IA,
 * la validación anti-alucinaciones y la trazabilidad institucional.
 */

import { AcademicGenerationRequest } from './request';
import { ActivityGenerator } from './activityGenerator';
import { AcademicGenerationParams, AcademicGenerationResult } from './types';
import { GeneratorExecutionOptions } from './baseGenerator';

export class AcademicGenerationGenerator {
  /**
   * Punto de entrada principal (equivalente conceptual a AcademicGeneration::Generator.call(...)).
   */
  static async call(
    params: AcademicGenerationParams,
    options: GeneratorExecutionOptions = {}
  ): Promise<AcademicGenerationResult> {
    // 1. Validar parámetros estrictamente con AcademicGenerationRequest
    const request = new AcademicGenerationRequest(params);

    // 2. Por defecto en Fase 3 delegamos en ActivityGenerator
    const generator = new ActivityGenerator();
    const result = await generator.generate(request, options);

    return {
      success: result.validation.valid,
      activity: result.output,
      traceability: result.traceability,
      validation: result.validation
    };
  }

  /**
   * Método de factoría alternativo.
   */
  static new(): AcademicGenerationGenerator {
    return new AcademicGenerationGenerator();
  }
}
