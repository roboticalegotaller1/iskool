/**
 * @file tenantScoping.ts
 * @description Enforcer de Aislamiento Multi-Tenant Estricto y Protección Anti-IDOR (Ítems #1, #2 y #3).
 * Garantiza que ninguna escuela, docente o alumno acceda accidental o maliciosamente a datos de otra institución
 * o recursos fuera de su ámbito autorizado.
 */

import { UserRole } from '@/types';

export interface SecurityUserContext {
  userId: string;
  role: UserRole | string;
  schoolId: string;
  assignedGrades?: string[];
  assignedGroupIds?: string[];
}

export class TenantSecurityEnforcer {
  /**
   * Valida el acceso a un recurso delimitado por institución (School Scoping).
   */
  static enforceSchoolScope(
    user: SecurityUserContext,
    targetSchoolId: string,
    operationName: string = 'query'
  ): { allowed: boolean; violationReason?: string } {
    // Superadmin de plataforma puede consultar multi-colegio
    if (user.role === 'superadmin' || user.role === 'admin') {
      return { allowed: true };
    }

    if (!user.schoolId || user.schoolId !== targetSchoolId) {
      return {
        allowed: false,
        violationReason: `Violación de Seguridad Multi-Tenant [${operationName}]: El usuario de la escuela "${user.schoolId}" intentó acceder a datos de la escuela "${targetSchoolId}".`
      };
    }

    return { allowed: true };
  }

  /**
   * Valida el acceso de un estudiante a sus propios recursos exclusivamente.
   */
  static enforceStudentSelfAccess(
    user: SecurityUserContext,
    targetStudentId: string
  ): { allowed: boolean; violationReason?: string } {
    if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'director' || user.role === 'coordinator' || user.role === 'teacher') {
      return { allowed: true };
    }

    if (user.role === 'student' && user.userId !== targetStudentId) {
      return {
        allowed: false,
        violationReason: `Violación de Privacidad Estudiantil: El alumno "${user.userId}" intentó consultar el expediente del alumno "${targetStudentId}".`
      };
    }

    return { allowed: true };
  }

  /**
   * Valida que un docente únicamente acceda a grupos asignados a su carga académica.
   */
  static enforceTeacherGroupAccess(
    user: SecurityUserContext,
    targetGroupId: string
  ): { allowed: boolean; violationReason?: string } {
    if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'director' || user.role === 'coordinator') {
      return { allowed: true };
    }

    if (user.role === 'teacher') {
      if (!user.assignedGroupIds || !user.assignedGroupIds.includes(targetGroupId)) {
        return {
          allowed: false,
          violationReason: `Acceso No Autorizado: El docente "${user.userId}" no tiene asignado el grupo "${targetGroupId}".`
        };
      }
    }

    return { allowed: true };
  }
}
