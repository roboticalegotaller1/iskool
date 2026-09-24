/**
 * @file validator.ts
 * @description Validador de taxonomía y esquemas pedagógicos para la Bóveda Curricular.
 * Comprueba de forma taxativa que los metadatos cumplan las reglas institucionales.
 * Ejemplo: cefr: B7 debe fallar obligatoriamente; cefr: B2 debe pasar.
 */

import { KnowledgeTaxonomy } from './taxonomy';
import {
  ParsedKnowledgeDocument,
  DocumentValidationResult,
  KnowledgeVaultValidationReport,
  ValidationErrorItem
} from './types';

export class KnowledgeVaultValidator {
  /**
   * Valida exhaustivamente un documento individual parseado.
   */
  static validate(doc: ParsedKnowledgeDocument): DocumentValidationResult {
    const errors: ValidationErrorItem[] = [];
    const warnings: string[] = [];
    const fm = doc.frontmatter;

    const baseName = doc.filePath ? doc.filePath.split(/[/\\]/).pop()?.toLowerCase() : '';
    const isSystemDoc = 
      doc.relativePath.includes('00_SYSTEM') ||
      baseName === 'readme.md' ||
      fm.type === 'system_documentation' ||
      fm.type === 'system_index';

    const isSourceDoc =
      doc.relativePath.includes('99_SOURCES') ||
      fm.type === 'source_spec' ||
      fm.type === 'source_framework' ||
      fm.type === 'framework_source';

    // 1. Verificación de presencia de Frontmatter
    if (fm._has_frontmatter === false) {
      if (isSystemDoc) {
        warnings.push('Documento de sistema o índice sin frontmatter YAML; clasificado como documentación estructural.');
        return {
          valid: true,
          filePath: doc.filePath,
          documentId: doc.documentId,
          errors: [],
          warnings
        };
      } else {
        errors.push({
          field: 'frontmatter',
          message: 'El documento carece del bloque obligatorio de metadatos YAML frontmatter (--- ... ---).'
        });
        return {
          valid: false,
          filePath: doc.filePath,
          documentId: doc.documentId,
          errors,
          warnings
        };
      }
    }

    // 2. Validación de Identificador y Título
    if (!fm.id || typeof fm.id !== 'string' || !fm.id.trim()) {
      errors.push({ field: 'id', message: 'El campo "id" es obligatorio y debe ser un texto identificador válido.' });
    } else if (!/^[a-z0-9_-]+$/i.test(fm.id)) {
      warnings.push(`El identificador "${fm.id}" debería usar preferentemente convención snake_case o kebab_case.`);
    }

    if (!fm.title || typeof fm.title !== 'string' || !fm.title.trim()) {
      errors.push({ field: 'title', message: 'El campo "title" es obligatorio y no puede estar vacío.' });
    }

    if (!fm.type || typeof fm.type !== 'string' || !fm.type.trim()) {
      errors.push({ field: 'type', message: 'El campo "type" es obligatorio.' });
    }

    // Si es documentación de sistema con frontmatter, no requiere atributos de clase (cefr, grades, skills)
    if (isSystemDoc) {
      if (fm.status && !KnowledgeTaxonomy.isStatusValid(fm.status)) {
        errors.push({
          field: 'status',
          value: fm.status,
          message: `Estado no válido: "${fm.status}".`
        });
      }
      return {
        valid: errors.length === 0,
        filePath: doc.filePath,
        documentId: doc.documentId,
        errors,
        warnings
      };
    }

    // Si es un documento de registro de fuentes (99_SOURCES), valida estado y estructura de fuente
    if (isSourceDoc) {
      if (fm.status && !KnowledgeTaxonomy.isStatusValid(fm.status)) {
        errors.push({
          field: 'status',
          value: fm.status,
          message: `Estado no válido: "${fm.status}".`
        });
      }
      return {
        valid: errors.length === 0,
        filePath: doc.filePath,
        documentId: doc.documentId,
        errors,
        warnings
      };
    }

    // 3. Validación de CEFR (Crítico: niveles estrictamente permitidos)
    if (!fm.cefr || !Array.isArray(fm.cefr) || fm.cefr.length === 0) {
      errors.push({
        field: 'cefr',
        message: 'El campo "cefr" es obligatorio y debe contener al menos un nivel válido (ej. A1, B2).'
      });
    } else {
      for (const level of fm.cefr) {
        if (!KnowledgeTaxonomy.isCefrLevelValid(level)) {
          errors.push({
            field: 'cefr',
            value: level,
            message: `Nivel CEFR no reconocido: "${level}". Niveles válidos: Foundation, Pre-A1, A1, A2, B1, B2, C1, C2.`
          });
        }
      }
    }

    // 4. Validación de Etapa Escolar (school_stage)
    if (!fm.school_stage || !Array.isArray(fm.school_stage) || fm.school_stage.length === 0) {
      errors.push({
        field: 'school_stage',
        message: 'El campo "school_stage" es obligatorio (ej. primary, secondary, high_school).'
      });
    } else {
      for (const stage of fm.school_stage) {
        if (!KnowledgeTaxonomy.isSchoolStageValid(stage)) {
          errors.push({
            field: 'school_stage',
            value: stage,
            message: `Etapa escolar no válida: "${stage}". Etapas válidas: preschool, primary, secondary, high_school, advanced.`
          });
        }
      }
    }

    // 5. Validación de Grados Escolares (grades)
    if (!fm.grades || !Array.isArray(fm.grades) || fm.grades.length === 0) {
      errors.push({
        field: 'grades',
        message: 'El campo "grades" es obligatorio y debe contener al menos un grado escolar.'
      });
    } else {
      for (const grade of fm.grades) {
        if (!KnowledgeTaxonomy.isGradeValid(grade)) {
          errors.push({
            field: 'grades',
            value: grade,
            message: `Grado escolar no reconocido: "${grade}". Ejemplo de grados válidos: primary_1, secondary_3, high_school_2.`
          });
        }
      }
    }

    // 6. Validación de Habilidades Lingüísticas (skills)
    if (!fm.skills || !Array.isArray(fm.skills) || fm.skills.length === 0) {
      errors.push({
        field: 'skills',
        message: 'El campo "skills" es obligatorio y debe contener al menos una habilidad (ej. speaking, reading).'
      });
    } else {
      for (const skill of fm.skills) {
        if (!KnowledgeTaxonomy.isSkillValid(skill)) {
          errors.push({
            field: 'skills',
            value: skill,
            message: `Habilidad lingüística no válida: "${skill}". Habilidades válidas: listening, speaking, reading, writing, grammar, vocabulary, pronunciation.`
          });
        }
      }
    }

    // 7. Validación de Estado del Documento (status)
    if (!fm.status) {
      errors.push({
        field: 'status',
        message: 'El campo "status" es obligatorio (draft, review, approved, deprecated).'
      });
    } else if (!KnowledgeTaxonomy.isStatusValid(fm.status)) {
      errors.push({
        field: 'status',
        value: fm.status,
        message: `Estado de documento no válido: "${fm.status}". Estados válidos: draft, review, approved, deprecated.`
      });
    }

    // 8. Validación de Fuentes (source_ids)
    if (!fm.source_ids || !Array.isArray(fm.source_ids) || fm.source_ids.length === 0) {
      errors.push({
        field: 'source_ids',
        message: 'El campo "source_ids" es obligatorio para acreditar procedencia pedagógica.'
      });
    }

    // 9. Validación de Versión
    if (typeof fm.version !== 'number' || fm.version < 1) {
      errors.push({
        field: 'version',
        value: fm.version,
        message: 'El campo "version" debe ser un número entero mayor o igual a 1.'
      });
    }

    // 10. Validaciones de Campos Opcionales si se encuentran presentes
    if (fm.cambridge_alignment && Array.isArray(fm.cambridge_alignment)) {
      for (const ca of fm.cambridge_alignment) {
        if (!KnowledgeTaxonomy.isCambridgeAlignmentValid(ca)) {
          warnings.push(`Alineación Cambridge no estándar: "${ca}".`);
        }
      }
    }

    if (fm.difficulty && !KnowledgeTaxonomy.isDifficultyValid(fm.difficulty)) {
      errors.push({
        field: 'difficulty',
        value: fm.difficulty,
        message: `Dificultad no válida: "${fm.difficulty}". Dificultades válidas: beginner, elementary, pre_intermediate, intermediate, upper_intermediate, advanced, mastery.`
      });
    }

    if (fm.duration_minutes !== undefined && (typeof fm.duration_minutes !== 'number' || fm.duration_minutes <= 0)) {
      warnings.push(`Duración en minutos inválida o no positiva: ${fm.duration_minutes}`);
    }

    // 11. Validación de progresión curricular (grade_progression)
    if (fm.grade_progression && typeof fm.grade_progression === 'object') {
      for (const [gradeKey, item] of Object.entries(fm.grade_progression)) {
        if (!KnowledgeTaxonomy.isGradeValid(gradeKey)) {
          errors.push({
            field: 'grade_progression',
            value: gradeKey,
            message: `Grado inválido en grade_progression: "${gradeKey}".`
          });
        }
        if (typeof item === 'string') {
          if (!item.trim()) {
            errors.push({
              field: 'grade_progression',
              value: gradeKey,
              message: `Descripción o rol vacío en grade_progression para ${gradeKey}.`
            });
          }
        } else if (!item || typeof item !== 'object' || !KnowledgeTaxonomy.isProgressionRoleValid((item as { role?: string }).role || '')) {
          errors.push({
            field: 'grade_progression',
            value: JSON.stringify(item),
            message: `Rol inválido en grade_progression para ${gradeKey}. Roles válidos: introduce, develop, consolidate, extend, review, mastery.`
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      filePath: doc.filePath,
      documentId: doc.documentId,
      errors,
      warnings
    };
  }

  /**
   * Valida un lote completo de documentos y genera un reporte consolidado.
   */
  static validateBatch(docs: ParsedKnowledgeDocument[]): KnowledgeVaultValidationReport {
    // 1. Validar cada documento de forma individual
    const results = docs.map(doc => this.validate(doc));
    const resultsMap = new Map<string, DocumentValidationResult>();
    for (const res of results) {
      resultsMap.set(res.filePath, res);
    }

    // 2. Regla institucional: Detección de identificadores (id) duplicados
    const idOccurrences = new Map<string, ParsedKnowledgeDocument[]>();
    for (const doc of docs) {
      if (!doc.documentId) continue;
      const baseName = doc.filePath ? doc.filePath.split(/[/\\]/).pop()?.toLowerCase() : '';
      const isSystemDoc = 
        doc.relativePath.includes('00_SYSTEM') ||
        baseName === 'readme.md' ||
        doc.frontmatter.type === 'system_documentation' ||
        doc.frontmatter.type === 'system_index';
      if (isSystemDoc && doc.frontmatter._has_frontmatter === false) continue;

      const list = idOccurrences.get(doc.documentId) || [];
      list.push(doc);
      idOccurrences.set(doc.documentId, list);
    }

    for (const [id, list] of idOccurrences.entries()) {
      if (list.length > 1) {
        for (const doc of list) {
          const res = resultsMap.get(doc.filePath);
          if (res) {
            res.valid = false;
            res.errors.push({
              field: 'id',
              value: id,
              message: `Identificador duplicado detectado: "${id}". Coincide en ${list.length} archivos distintos dentro de la Bóveda Curricular.`
            });
          }
        }
      }
    }

    // 3. Regla institucional: Validación de fuentes registradas (source_ids deben existir en 99_SOURCES o catálogo)
    const registeredSourceIds = new Set<string>();
    for (const doc of docs) {
      const isSource = doc.relativePath.includes('99_SOURCES') || doc.frontmatter.type === 'source_spec';
      if (isSource && doc.documentId) {
        registeredSourceIds.add(doc.documentId);
      }
    }
    const allKnownIds = new Set<string>(docs.map(d => d.documentId).filter(Boolean));

    for (const doc of docs) {
      const isSource = doc.relativePath.includes('99_SOURCES') || doc.frontmatter.type === 'source_spec';
      const isSystem = doc.relativePath.includes('00_SYSTEM') || doc.frontmatter.type?.startsWith('system_');
      if (isSource || isSystem) continue;

      const sourceIds = doc.frontmatter.source_ids;
      if (Array.isArray(sourceIds)) {
        for (const sid of sourceIds) {
          if (!registeredSourceIds.has(sid) && !allKnownIds.has(sid)) {
            const res = resultsMap.get(doc.filePath);
            if (res) {
              res.valid = false;
              res.errors.push({
                field: 'source_ids',
                value: sid,
                message: `El identificador de fuente "${sid}" no existe en el catálogo registrado de 99_SOURCES.`
              });
            }
          }
        }
      }
    }

    // 4. Regla institucional: Validación de referencias bidireccionales ([[...]])
    for (const doc of docs) {
      if (doc.wikiLinks && doc.wikiLinks.length > 0) {
        for (const link of doc.wikiLinks) {
          const target = link.split(/[|#]/)[0].trim().toLowerCase();
          const targetExists = allKnownIds.has(target) || docs.some(d => {
            const base = d.filePath.split(/[/\\]/).pop()?.replace(/\.md$/i, '').toLowerCase();
            return base === target;
          });
          if (!targetExists) {
            const res = resultsMap.get(doc.filePath);
            if (res) {
              res.warnings.push(`Referencia bidireccional no resuelta: [[${link}]].`);
            }
          }
        }
      }
    }

    // 5. Regla institucional: Validación de aristas del Grafo Académico (prerequisites, builds_on, extends)
    for (const doc of docs) {
      const res = resultsMap.get(doc.filePath);
      if (!res) continue;
      const fm = doc.frontmatter;

      // Validar prerequisites (estricto)
      if (Array.isArray(fm.prerequisites)) {
        for (const prereqId of fm.prerequisites) {
          if (!allKnownIds.has(prereqId)) {
            res.valid = false;
            res.errors.push({
              field: 'prerequisites',
              value: prereqId,
              message: `El prerrequisito "${prereqId}" referenciado en este documento no existe en la Bóveda Curricular.`
            });
          }
        }
      }

      // Validar builds_on (estricto)
      if (Array.isArray(fm.builds_on)) {
        for (const boId of fm.builds_on) {
          if (!allKnownIds.has(boId)) {
            res.valid = false;
            res.errors.push({
              field: 'builds_on',
              value: boId,
              message: `El antecedente conceptual (builds_on) "${boId}" no existe en la Bóveda Curricular.`
            });
          }
        }
      }

      // Validar extends (estricto)
      if (Array.isArray(fm.extends)) {
        for (const extId of fm.extends) {
          if (!allKnownIds.has(extId)) {
            res.valid = false;
            res.errors.push({
              field: 'extends',
              value: extId,
              message: `El concepto extendido "${extId}" no existe en la Bóveda Curricular.`
            });
          }
        }
      }

      // Validar related_to (advertencia si falta)
      if (Array.isArray(fm.related_to)) {
        for (const relId of fm.related_to) {
          if (!allKnownIds.has(relId)) {
            res.warnings.push(`El concepto relacionado (related_to) "${relId}" no se encuentra indexado.`);
          }
        }
      }

      // Validar assessed_by (advertencia si falta)
      if (Array.isArray(fm.assessed_by)) {
        for (const assId of fm.assessed_by) {
          if (!allKnownIds.has(assId)) {
            res.warnings.push(`El instrumento de evaluación (assessed_by) "${assId}" no se encuentra indexado.`);
          }
        }
      }
    }

    const validFiles = results.filter(r => r.valid).length;
    const invalidFiles = results.length - validFiles;

    return {
      totalFiles: docs.length,
      validFiles,
      invalidFiles,
      results
    };
  }
}
