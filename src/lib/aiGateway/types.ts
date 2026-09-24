/**
 * @file types.ts
 * @description Contratos de datos, tipos y modelos de la Puerta de Enlace de IA (AI Gateway / Fase 12).
 * Centraliza la contabilidad de tokens, enrutamiento de modelos, presupuestos escolares, circuit breaker y control de costos.
 */

import { UserRole } from '@/types';

export type AIFeatureType =
  | 'academic_generation'
  | 'ai_tutor'
  | 'teacher_copilot'
  | 'coordinator_copilot'
  | 'insight_service'
  | 'activity_generator';

export type ComplexityTier = 'lightweight' | 'standard' | 'complex_reasoning';

export type CircuitBreakerStatus = 'closed' | 'open' | 'half_open';

export type BudgetStatus = 'normal' | 'warning' | 'limit_approaching' | 'restricted';

export interface AIGatewayRequest<T = any> {
  request_id: string;
  school_id: string;
  user_id: string;
  user_role: UserRole | string;
  feature: AIFeatureType;
  prompt: string;
  system_instructions?: string;
  complexity_tier?: ComplexityTier;
  target_model?: string; // Opcional para forzar modelo
  temperature?: number;
  timeout_ms?: number;
  idempotency_key?: string;
  cacheable?: boolean;
  schema_validator?: (output: any) => { valid: boolean; errors?: string[] };
  custom_mock_response?: string; // Para pruebas automatizadas offline
}

export interface AIGatewayResponse<T = any> {
  request_id: string;
  output: T;
  raw_text: string;
  model_used: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  estimated_cost_usd: number;
  cached: boolean;
  status: 'success' | 'fallback' | 'cached';
  error_message?: string;
}

export interface AICostLedgerEntry {
  id: string;
  school_id: string;
  user_id: string;
  user_role: string;
  request_id: string;
  feature: AIFeatureType;
  model_identifier: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  estimated_cost_usd: number;
  status: 'success' | 'failed' | 'circuit_broken' | 'rate_limited' | 'cached';
  cache_hit: boolean;
  error_message?: string;
  created_at: string;
}

export interface SchoolAIBudgetEntity {
  school_id: string;
  billing_month: string; // ej: '2026-09'
  monthly_budget_usd: number;
  current_spend_usd: number;
  alert_threshold_percent: number; // Default: 80%
  status: BudgetStatus;
  allow_overage: boolean;
  notifications_sent: {
    threshold: number;
    sent_at: string;
  }[];
  updated_at: string;
}

export interface ModelPricingConfig {
  identifier: string;
  input_cost_per_million_usd: number;
  output_cost_per_million_usd: number;
  context_window: number;
}
