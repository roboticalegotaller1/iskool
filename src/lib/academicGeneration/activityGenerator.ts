/**
 * @file activityGenerator.ts
 * @description Generador especializado en actividades educativas comunicativas (English Activity Generator).
 * Extiende BaseAcademicGenerator y conecta los componentes de parseo estricto y validación curricular.
 */

import { BaseAcademicGenerator } from './baseGenerator';
import { AcademicGenerationRequest } from './request';
import { AcademicGenerationResponseParser } from './responseParser';
import { AcademicGenerationValidator } from './validator';
import { AcademicActivityOutput, AcademicValidationResult } from './types';

export class ActivityGenerator extends BaseAcademicGenerator<AcademicActivityOutput> {
  protected parseOutput(rawResponse: string): AcademicActivityOutput {
    return AcademicGenerationResponseParser.parse(rawResponse);
  }

  protected validateOutput(
    request: AcademicGenerationRequest,
    output: AcademicActivityOutput
  ): AcademicValidationResult {
    return AcademicGenerationValidator.validate(request, output);
  }
}
