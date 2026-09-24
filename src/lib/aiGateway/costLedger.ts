/**
 * @file costLedger.ts
 * @description Libro Mayor de Costos y Control Presupuestal de IA (Ítems #13, #14, #15, #16, #84 y #85).
 * Registra cada transacción de inferencia, calcula costos acumulados por escuela, feature y periodo,
 * y emite alertas tempranas al alcanzar el 80% y 100% del presupuesto mensual institucional.
 */

import { AICostLedgerEntry, SchoolAIBudgetEntity, BudgetStatus, AIFeatureType } from './types';
import { supabase } from '../supabaseClient';

export class AIGatewayCostLedger {
  private static ledgers: AICostLedgerEntry[] = [];
  private static budgets = new Map<string, SchoolAIBudgetEntity>();

  /**
   * Registra una transacción de uso de IA y actualiza el presupuesto de la escuela.
   */
  static async recordUsage(entry: AICostLedgerEntry): Promise<void> {
    this.ledgers.push(entry);

    // 1. Persistencia opcional en Supabase
    try {
      if (supabase) {
        await supabase.from('ai_cost_ledgers').insert({
          id: entry.id,
          school_id: entry.school_id,
          user_id: entry.user_id,
          user_role: entry.user_role,
          request_id: entry.request_id,
          feature: entry.feature,
          model_identifier: entry.model_identifier,
          input_tokens: entry.input_tokens,
          output_tokens: entry.output_tokens,
          latency_ms: entry.latency_ms,
          estimated_cost_usd: entry.estimated_cost_usd,
          status: entry.status,
          cache_hit: entry.cache_hit,
          error_message: entry.error_message,
          created_at: entry.created_at
        });
      }
    } catch {
      // Degradar a memoria
    }

    // 2. Actualizar presupuesto escolar si la llamada incurrió en costo
    if (entry.estimated_cost_usd > 0) {
      await this.updateBudgetSpend(entry.school_id, entry.estimated_cost_usd);
    }
  }

  /**
   * Configura o actualiza el presupuesto mensual de una escuela.
   */
  static setBudget(budget: SchoolAIBudgetEntity): void {
    this.budgets.set(budget.school_id, budget);
  }

  /**
   * Obtiene o inicializa el presupuesto para una escuela.
   */
  static getBudget(schoolId: string): SchoolAIBudgetEntity {
    if (!this.budgets.has(schoolId)) {
      const now = new Date();
      const billingMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      this.budgets.set(schoolId, {
        school_id: schoolId,
        billing_month: billingMonth,
        monthly_budget_usd: 500.00, // $500 USD por defecto
        current_spend_usd: 0.00,
        alert_threshold_percent: 80,
        status: 'normal',
        allow_overage: false,
        notifications_sent: [],
        updated_at: now.toISOString()
      });
    }
    return this.budgets.get(schoolId)!;
  }

  /**
   * Alias de conveniencia institucional para obtener el presupuesto escolar.
   */
  static getSchoolBudget(schoolId: string): SchoolAIBudgetEntity {
    return this.getBudget(schoolId);
  }

  /**
   * Retorna el gasto acumulado mensual para la escuela dada.
   */
  static getMonthlySpend(schoolId: string, _month?: string): number {
    return this.getBudget(schoolId).current_spend_usd;
  }

  /**
   * Verifica si la escuela tiene presupuesto disponible para ejecutar peticiones.
   */
  static checkBudgetAvailability(schoolId: string): { allowed: boolean; status: BudgetStatus; reason?: string } {
    const budget = this.getBudget(schoolId);

    if (budget.status === 'restricted' && !budget.allow_overage) {
      return {
        allowed: false,
        status: 'restricted',
        reason: `Límite presupuestal de IA alcanzado para este mes ($${budget.current_spend_usd.toFixed(2)} / $${budget.monthly_budget_usd.toFixed(2)} USD). Comuníquese con la administración para ampliar la cuota.`
      };
    }

    return { allowed: true, status: budget.status };
  }

  /**
   * Incrementa el gasto acumulado y evalúa umbrales de alerta (80% y 100%).
   */
  private static async updateBudgetSpend(schoolId: string, costUsd: number): Promise<void> {
    const budget = this.getBudget(schoolId);
    budget.current_spend_usd = parseFloat((budget.current_spend_usd + costUsd).toFixed(6));
    budget.updated_at = new Date().toISOString();

    const spendRatio = (budget.current_spend_usd / budget.monthly_budget_usd) * 100;

    if (spendRatio >= 100) {
      budget.status = budget.allow_overage ? 'warning' : 'restricted';
      if (!budget.notifications_sent.some(n => n.threshold === 100)) {
        budget.notifications_sent.push({ threshold: 100, sent_at: new Date().toISOString() });
      }
    } else if (spendRatio >= 95) {
      budget.status = 'limit_approaching';
    } else if (spendRatio >= budget.alert_threshold_percent) {
      budget.status = 'warning';
      if (!budget.notifications_sent.some(n => n.threshold === budget.alert_threshold_percent)) {
        budget.notifications_sent.push({ threshold: budget.alert_threshold_percent, sent_at: new Date().toISOString() });
      }
    } else {
      budget.status = 'normal';
    }

    this.budgets.set(schoolId, budget);
  }

  /**
   * Desglose de costos por funcionalidad pedagógica (Ítem #84).
   */
  static getCostByFeature(schoolId?: string): Record<AIFeatureType, { cost_usd: number; calls_count: number }> {
    const result: Record<string, { cost_usd: number; calls_count: number }> = {
      academic_generation: { cost_usd: 0, calls_count: 0 },
      ai_tutor: { cost_usd: 0, calls_count: 0 },
      teacher_copilot: { cost_usd: 0, calls_count: 0 },
      coordinator_copilot: { cost_usd: 0, calls_count: 0 },
      insight_service: { cost_usd: 0, calls_count: 0 },
      activity_generator: { cost_usd: 0, calls_count: 0 }
    };

    const records = schoolId ? this.ledgers.filter(l => l.school_id === schoolId) : this.ledgers;

    for (const r of records) {
      if (result[r.feature]) {
        result[r.feature].cost_usd = parseFloat((result[r.feature].cost_usd + r.estimated_cost_usd).toFixed(6));
        result[r.feature].calls_count++;
      }
    }

    return result as Record<AIFeatureType, { cost_usd: number; calls_count: number }>;
  }

  /**
   * Resumen de transacciones registradas.
   */
  static getLedgerEntries(schoolId?: string): AICostLedgerEntry[] {
    if (schoolId) {
      return this.ledgers.filter(l => l.school_id === schoolId);
    }
    return this.ledgers;
  }

  static clear(): void {
    this.ledgers = [];
    this.budgets.clear();
  }
}
