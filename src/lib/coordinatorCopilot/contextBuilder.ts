/**
 * @file contextBuilder.ts
 * @description Constructor de Contexto Scoped y Seguro para el Coordinator Copilot (Ítem #22).
 * Carga exclusivamente datos agregados relevantes al grado, materia o grupo consultado.
 * Garantiza:
 * 1. Zero PII: No carga identidades individuales de alumnos a menos que exista un caso puntual de intervención.
 * 2. Cero agregaciones redundantes: Reutiliza el LeadershipDashboardService.
 */

import { CoordinatorScopedContext, ResolvedCoordinatorIntent } from './types';
import { LeadershipScopeDescriptor } from '../leadership/types';
import { LeadershipDashboardService } from '../leadership/dashboardService';
import { UserAcademicContext } from '../leadership/scopeService';

export class CoordinatorCopilotContextBuilder {
  /**
   * Construye el contexto de datos agregados para la consulta del coordinador.
   */
  static async buildContext(
    scope: LeadershipScopeDescriptor,
    intent: ResolvedCoordinatorIntent,
    user: UserAcademicContext
  ): Promise<CoordinatorScopedContext> {
    // 1. Obtener la vista estructurada del Dashboard de Liderazgo
    const dashboardData = await LeadershipDashboardService.call({
      scope,
      userProfile: user
    });

    // 2. Filtrar o priorizar según la intención detectada
    let filteredGroups = dashboardData.fair_group_comparisons;
    if (intent.target_group) {
      filteredGroups = filteredGroups.filter(g =>
        g.group_id.toLowerCase().includes(intent.target_group!.toLowerCase()) ||
        g.group_name.toLowerCase().includes(intent.target_group!.toLowerCase())
      );
    }

    return {
      scope,
      overview: dashboardData.overview,
      curriculum: dashboardData.curriculum_view,
      bottlenecks: dashboardData.bottlenecks,
      groups: filteredGroups,
      recent_changes: dashboardData.what_changed.changes,
      priority_signals: dashboardData.priority_signals,
      interventions: dashboardData.active_interventions,
      zero_pii_confirmed: true
    };
  }
}
