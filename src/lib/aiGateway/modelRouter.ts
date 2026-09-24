/**
 * @file modelRouter.ts
 * @description Enrutador Inteligente de Modelos de IA por Tarea y Calculador de Costos (Ítems #11, #12, #13 y #14).
 * Desacopla la selección de modelos de los servicios de aplicación y centraliza las tarifas por millón de tokens.
 */

import { AIFeatureType, ComplexityTier, ModelPricingConfig } from './types';

export class AIGatewayModelRouter {
  // Modelos oficiales institucionales (sin nombres comerciales expuestos)
  public static readonly MODEL_FLASH_LITE = 'models/pedagogical-ai-flash-lite';
  public static readonly MODEL_CORE = 'models/pedagogical-ai-core';
  public static readonly MODEL_PRO = 'models/pedagogical-ai-pro';

  // Tarifas de facturación por millón de tokens (USD)
  private static readonly PRICING: Record<string, ModelPricingConfig> = {
    [AIGatewayModelRouter.MODEL_FLASH_LITE]: {
      identifier: AIGatewayModelRouter.MODEL_FLASH_LITE,
      input_cost_per_million_usd: 0.10,  // $0.0001 por 1K
      output_cost_per_million_usd: 0.40, // $0.0004 por 1K
      context_window: 1000000
    },
    [AIGatewayModelRouter.MODEL_CORE]: {
      identifier: AIGatewayModelRouter.MODEL_CORE,
      input_cost_per_million_usd: 0.30,  // $0.0003 por 1K
      output_cost_per_million_usd: 1.20, // $0.0012 por 1K
      context_window: 1000000
    },
    [AIGatewayModelRouter.MODEL_PRO]: {
      identifier: AIGatewayModelRouter.MODEL_PRO,
      input_cost_per_million_usd: 1.50,  // $0.0015 por 1K
      output_cost_per_million_usd: 6.00, // $0.0060 por 1K
      context_window: 2000000
    }
  };

  /**
   * Resuelve el modelo más eficiente y económico según la naturaleza de la tarea pedagógica.
   */
  static resolveModel(feature: AIFeatureType, tier?: ComplexityTier): string {
    if (tier === 'lightweight') {
      return this.MODEL_FLASH_LITE;
    }
    if (tier === 'complex_reasoning') {
      return this.MODEL_PRO;
    }

    // Enrutamiento por característica predeterminada
    switch (feature) {
      case 'insight_service':
      case 'coordinator_copilot':
        return this.MODEL_CORE;
      case 'academic_generation':
        return this.MODEL_CORE;
      case 'ai_tutor':
        return this.MODEL_FLASH_LITE; // Prioriza baja latencia y bajo costo para chat estudiantil
      case 'teacher_copilot':
        return this.MODEL_CORE;
      case 'activity_generator':
      default:
        return this.MODEL_CORE;
    }
  }

  /**
   * Calcula el costo exacto en dólares estadounidenses a partir de los tokens procesados.
   */
  static calculateCost(modelIdentifier: string, inputTokens: number, outputTokens: number): number {
    const pricing = this.PRICING[modelIdentifier] || this.PRICING[this.MODEL_CORE];
    const inputCost = (inputTokens / 1_000_000) * pricing.input_cost_per_million_usd;
    const outputCost = (outputTokens / 1_000_000) * pricing.output_cost_per_million_usd;
    return parseFloat((inputCost + outputCost).toFixed(6));
  }
}
