/**
 * @file validator.ts
 * @description Validador estricto anti-alucinaciones y fidelidad curricular para el Motor de Generación Académica.
 * Comprueba que el modelo no haya cambiado arbitrariamente el nivel CEFR (ej. B1 -> B2), el grado,
 * la habilidad comunicativa ni la duración solicitada, y verifica la presencia íntegra de campos obligatorios.
 */

import { AcademicGenerationRequest } from './request';
import { AcademicActivityOutput, AcademicValidationResult, FieldMismatch } from './types';

export class AcademicGenerationValidator {
  /**
   * Valida la salida generada contra los parámetros de la solicitud académica original.
   */
  static validate(request: AcademicGenerationRequest, output: AcademicActivityOutput): AcademicValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const mismatches: FieldMismatch[] = [];

    if (!output || typeof output !== 'object') {
      return {
        valid: false,
        errors: ['La salida a validar es nula o no es un objeto.'],
        warnings: [],
        mismatches: []
      };
    }

    // 1. Verificación de Campos Obligatorios Estructurales
    const requiredFields: (keyof AcademicActivityOutput)[] = [
      'title',
      'grade',
      'cefr',
      'skill',
      'topic',
      'language_function',
      'duration_minutes',
      'learning_objective',
      'student_instructions',
      'teacher_instructions',
      'activity_steps',
      'assessment'
    ];

    for (const field of requiredFields) {
      if (output[field] === undefined || output[field] === null || output[field] === '') {
        errors.push(`Campo obligatorio faltante o vacío: "${field}".`);
      }
    }

    // 2. Control Anti-Alucinación: Nivel CEFR (B1 vs B2, etc.)
    if (output.cefr) {
      const outCefr = String(output.cefr).trim().toUpperCase();
      const reqCefr = String(request.cefr).trim().toUpperCase();
      if (outCefr !== reqCefr) {
        errors.push(
          `Alucinación de Nivel CEFR detectada: la solicitud especificó "${reqCefr}", pero el modelo devolvió "${outCefr}".`
        );
        mismatches.push({
          field: 'cefr',
          expected: reqCefr,
          received: outCefr
        });
      }
    }

    // 3. Control Anti-Alucinación: Grado Escolar (High School 1 vs High School 3, etc.)
    if (output.grade) {
      const outGrade = String(output.grade).trim().toLowerCase();
      const reqGrade = String(request.grade).trim().toLowerCase();
      if (outGrade !== reqGrade) {
        errors.push(
          `Alucinación de Grado Escolar detectada: la solicitud especificó "${reqGrade}", pero el modelo devolvió "${outGrade}".`
        );
        mismatches.push({
          field: 'grade',
          expected: reqGrade,
          received: outGrade
        });
      }
    }

    // 4. Control Anti-Alucinación: Habilidad Primaria (Speaking vs Writing, etc.)
    if (output.skill) {
      const outSkill = String(output.skill).trim().toLowerCase();
      const reqSkill = String(request.skill).trim().toLowerCase();
      if (outSkill !== reqSkill) {
        errors.push(
          `Alucinación de Habilidad detectada: la solicitud especificó "${reqSkill}", pero el modelo devolvió "${outSkill}".`
        );
        mismatches.push({
          field: 'skill',
          expected: reqSkill,
          received: outSkill
        });
      }
    }

    // 5. Control de Función de Lenguaje
    if (output.language_function) {
      const outLf = String(output.language_function).trim().toLowerCase().replace(/[\s-]/g, '_');
      const reqLf = String(request.language_function).trim().toLowerCase().replace(/[\s-]/g, '_');
      if (outLf !== reqLf && !outLf.includes(reqLf) && !reqLf.includes(outLf)) {
        warnings.push(
          `Posible divergencia en función de lenguaje: esperado "${request.language_function}", recibido "${output.language_function}".`
        );
      }
    }

    // 6. Verificación de Duración de Actividad y Fases
    if (typeof output.duration_minutes === 'number') {
      if (output.duration_minutes <= 0) {
        errors.push(`Duración inválida (${output.duration_minutes} min). Debe ser un entero positivo.`);
      } else if (output.duration_minutes !== request.duration_minutes) {
        warnings.push(
          `Discrepancia en duración global: solicitado ${request.duration_minutes} min, devuelto ${output.duration_minutes} min.`
        );
      }
    }

    // 7. Verificación de Pasos de la Actividad (Activity Steps)
    if (Array.isArray(output.activity_steps)) {
      if (output.activity_steps.length === 0) {
        errors.push('La actividad no contiene ningún paso en "activity_steps".');
      } else {
        let totalStepMinutes = 0;
        output.activity_steps.forEach((step, idx) => {
          if (!step.phase) warnings.push(`Paso ${idx + 1} no define la fase pedagógica.`);
          if (typeof step.duration_minutes === 'number') totalStepMinutes += step.duration_minutes;
        });

        // Tolerancia de 5 minutos en la sumatoria de fases
        if (totalStepMinutes > 0 && Math.abs(totalStepMinutes - request.duration_minutes) > 5) {
          warnings.push(
            `La sumatoria de pasos (${totalStepMinutes} min) discrepa significativamente de la duración solicitada (${request.duration_minutes} min).`
          );
        }
      }
    } else if (output.activity_steps !== undefined) {
      errors.push('"activity_steps" debe ser un arreglo de fases pedagógicas.');
    }

    // 8. Verificación de Andamiaje Lingüístico (Language Support)
    if (output.language_support) {
      if (!Array.isArray(output.language_support.useful_phrases) || output.language_support.useful_phrases.length === 0) {
        warnings.push('La actividad no incluyó frases útiles ("useful_phrases") de andamiaje.');
      }
    } else {
      warnings.push('Falta el objeto "language_support" para soporte lingüístico.');
    }

    // 9. Verificación de Criterios de Evaluación (Assessment)
    if (output.assessment) {
      if (!Array.isArray(output.assessment.criteria) || output.assessment.criteria.length === 0) {
        errors.push('El bloque "assessment" debe contener al menos un criterio observable en "criteria".');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      mismatches
    };
  }
}
