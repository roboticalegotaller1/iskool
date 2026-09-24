/**
 * @file permissionMatrix.ts
 * @description Matriz Canónica de Permisos y Autorizaciones del Backend (Ítems #4 y #5).
 * Define taxativamente los permisos de lectura, creación, edición, aprobación, publicación, borrado
 * y exportación, separando explícitamente las atribuciones normales de las operaciones con IA.
 */

import { UserRole } from '@/types';

export type AcademicResource =
  | 'curriculum_vault'
  | 'curriculum_release'
  | 'course_planning'
  | 'lesson'
  | 'student_profile'
  | 'student_evidence'
  | 'academic_analytics'
  | 'leadership_dashboard'
  | 'ai_tutor'
  | 'teacher_copilot'
  | 'coordinator_copilot'
  | 'budget_and_costs';

export type AcademicAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'publish'
  | 'export'
  | 'ai_generate'
  | 'ai_approve_generation'
  | 'ai_publish_generation'
  | 'view_ai_evidence'
  | 'manual_mastery_override';

export class AIPermissionMatrix {
  /**
   * Evalúa si un rol tiene autorización formal para ejecutar una acción sobre un recurso.
   */
  static can(role: UserRole | string, action: AcademicAction, resource: AcademicResource): boolean {
    // 1. Superadmin y Admin tienen acceso irrestricto
    if (role === 'superadmin' || role === 'admin') {
      return true;
    }

    // 2. Dueño de Escuela (Owner) y Director de Plantel
    if (role === 'owner' || role === 'director') {
      if (action === 'delete' && resource === 'curriculum_release') return false; // Inmutabilidad
      return true;
    }

    // 3. Coordinador Académico
    if (role === 'coordinator') {
      if (resource === 'budget_and_costs' && (action === 'update' || action === 'delete')) return false;
      if (action === 'delete' && (resource === 'curriculum_vault' || resource === 'curriculum_release')) return false;
      return true; // Puede aprobar, publicar, consultar analítica y usar Copilot
    }

    // 4. Docente (Teacher)
    if (role === 'teacher') {
      switch (resource) {
        case 'curriculum_vault':
        case 'curriculum_release':
          return action === 'read';
        case 'course_planning':
        case 'lesson':
          return action === 'read' || action === 'create' || action === 'update' || action === 'ai_generate';
        case 'student_profile':
        case 'student_evidence':
          return action === 'read' || action === 'create' || action === 'update' || action === 'view_ai_evidence' || action === 'manual_mastery_override';
        case 'academic_analytics':
          return action === 'read'; // Sus propios grupos
        case 'leadership_dashboard':
        case 'budget_and_costs':
        case 'coordinator_copilot':
          return false; // Prohibido para docentes
        case 'teacher_copilot':
          return action === 'read' || action === 'create' || action === 'ai_generate' || action === 'ai_approve_generation';
        case 'ai_tutor':
          return action === 'read' || action === 'view_ai_evidence';
        default:
          return false;
      }
    }

    // 5. Alumno (Student)
    if (role === 'student') {
      switch (resource) {
        case 'curriculum_vault':
        case 'course_planning':
        case 'lesson':
          return action === 'read';
        case 'student_profile':
          return action === 'read'; // Su propio perfil
        case 'student_evidence':
          return action === 'read'; // Sus propias evidencias
        case 'ai_tutor':
          return action === 'read' || action === 'create'; // Interactuar en sesión
        case 'academic_analytics':
        case 'leadership_dashboard':
        case 'teacher_copilot':
        case 'coordinator_copilot':
        case 'budget_and_costs':
          return false; // Estrictamente prohibido
        default:
          return false;
      }
    }

    // 6. Padres y Tutores
    if (role === 'parent' || role === 'tutor') {
      return action === 'read' && (resource === 'student_profile' || resource === 'lesson');
    }

    return false;
  }
}
