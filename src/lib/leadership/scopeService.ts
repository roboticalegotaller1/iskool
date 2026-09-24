/**
 * @file scopeService.ts
 * @description Servicio de Resolución de Scopes y Control de Acceso Basado en Roles (Ítems #2, #3, #36, #37 y #38).
 * Valida que los directores, coordinadores y docentes únicamente accedan a la información pedagógica
 * para la cual tienen permisos explícitos dentro de su plantel escolar, asegurando Zero PII en vistas ejecutivas.
 */

import { LeadershipScopeDescriptor, LeadershipScopeType } from './types';
import { UserRole } from '@/types';

export interface UserAcademicContext {
  userId: string;
  role: UserRole;
  schoolId: string;
  assignedCampusIds?: string[];
  assignedGrades?: string[]; // e.g. ['high_school_1', 'high_school_2', 'high_school_3']
  assignedGroupIds?: string[]; // e.g. ['group_hs1_a', 'group_hs1_b']
  assignedCourseIds?: string[];
}

export class LeadershipScopeService {
  /**
   * Resuelve y valida si un usuario tiene autorización para consultar un scope determinado.
   */
  static authorizeScope(
    user: UserAcademicContext,
    targetScope: LeadershipScopeDescriptor
  ): { authorized: boolean; reason?: string } {
    // 1. Superadmin / Admin global tienen acceso transversal
    if (user.role === 'superadmin' || user.role === 'admin') {
      return { authorized: true };
    }

    // 2. Aislamiento estricto multi-colegio
    if (user.schoolId !== targetScope.school_id) {
      return {
        authorized: false,
        reason: 'Violación de Aislamiento: No está autorizado a consultar información de otro colegio.'
      };
    }

    // 3. Dueño de escuela y Director de Plantel tienen acceso a nivel escuela/campus/grados
    if (user.role === 'owner' || user.role === 'director') {
      return { authorized: true };
    }

    // 4. Coordinador Académico: restringido a sus grados o campus asignados
    if (user.role === 'coordinator') {
      if (targetScope.grade && user.assignedGrades && !user.assignedGrades.includes(targetScope.grade)) {
        return {
          authorized: false,
          reason: `Acceso denegado: El coordinador no tiene asignado el grado ${targetScope.grade}.`
        };
      }
      return { authorized: true };
    }

    // 5. Docente: restringido estrictamente a sus grupos y cursos asignados
    if (user.role === 'teacher') {
      if (targetScope.scope_type === 'school' || targetScope.scope_type === 'school_stage') {
        return {
          authorized: false,
          reason: 'Acceso denegado: Un docente no tiene permisos para consultar la vista institucional agregada.'
        };
      }

      if (targetScope.group_id && user.assignedGroupIds && !user.assignedGroupIds.includes(targetScope.group_id)) {
        return {
          authorized: false,
          reason: `Acceso denegado: El docente no tiene asignado el grupo ${targetScope.group_id}.`
        };
      }

      if (targetScope.course_id && user.assignedCourseIds && !user.assignedCourseIds.includes(targetScope.course_id)) {
        return {
          authorized: false,
          reason: `Acceso denegado: El docente no tiene asignado el curso ${targetScope.course_id}.`
        };
      }

      return { authorized: true };
    }

    // 6. Alumnos o padres no tienen acceso al Leadership Dashboard
    return {
      authorized: false,
      reason: 'Acceso denegado: Rol no autorizado para el panel de liderazgo y coordinación académica.'
    };
  }

  /**
   * Determina si la consulta debe forzar anonimización agregada (Zero PII).
   * Para coordinación y dirección, las métricas son obligatoriamente agregadas salvo que sea
   * un caso puntual de intervención pedagógica individual.
   */
  static shouldAggregatePrivacy(user: UserAcademicContext, scopeType: LeadershipScopeType): boolean {
    if (user.role === 'superadmin' || user.role === 'admin') return false;
    // Nivel dirección o coordinación general trabaja por defecto con datos agregados
    if (scopeType === 'school' || scopeType === 'school_stage' || scopeType === 'grade') {
      return true;
    }
    return false;
  }
}
