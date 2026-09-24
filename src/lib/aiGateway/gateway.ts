/**
 * @file gateway.ts
 * @description Puerta de Enlace Centralizada de Inteligencia Artificial Pedagógica (AI::Gateway / Ítems #9 y #10).
 * Centraliza autenticación, timeouts, reintentos con backoff exponencial, limitación de frecuencia,
 * circuit breaker, contabilidad de tokens, control presupuestal, caché determinista y validación de salidas estructuradas.
 */

import { AIGatewayRequest, AIGatewayResponse } from './types';
import { AIGatewayModelRouter } from './modelRouter';
import { AIGatewayCircuitBreaker } from './circuitBreaker';
import { AIGatewayRateLimiter } from './rateLimiter';
import { AIGatewayCache } from './cache';
import { safeJsonParse } from '../security';
import { AIGatewayCostLedger } from './costLedger';

export class AIGateway {
  public static readonly DEFAULT_TIMEOUT_MS = 8_000;
  public static readonly MAX_RETRIES = 2;

  /**
   * Ejecuta una petición de IA a través de la Puerta de Enlace central.
   */
  static async execute<T = any>(request: AIGatewayRequest<T>): Promise<AIGatewayResponse<T>> {
    const startTime = Date.now();
    const model = request.target_model || AIGatewayModelRouter.resolveModel(request.feature, request.complexity_tier);

    // 1. Verificación de Límite de Frecuencia (Rate Limiting)
    const rateCheck = AIGatewayRateLimiter.checkRateLimit(request.user_id, request.school_id);
    if (!rateCheck.allowed) {
      await AIGatewayCostLedger.recordUsage({
        id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        school_id: request.school_id,
        user_id: request.user_id,
        user_role: request.user_role,
        request_id: request.request_id,
        feature: request.feature,
        model_identifier: model,
        input_tokens: 0,
        output_tokens: 0,
        latency_ms: Date.now() - startTime,
        estimated_cost_usd: 0,
        status: 'rate_limited',
        cache_hit: false,
        error_message: rateCheck.reason,
        created_at: new Date().toISOString()
      });
      throw new Error(rateCheck.reason);
    }

    // 2. Verificación de Presupuesto Institucional
    const budgetCheck = AIGatewayCostLedger.checkBudgetAvailability(request.school_id);
    if (!budgetCheck.allowed) {
      throw new Error(budgetCheck.reason);
    }

    // 3. Verificación de Caché Determinista Reutilizable (L1 Memoria / L2 Supabase)
    if (request.cacheable) {
      const cacheKey = AIGatewayCache.generateKey(request.feature, request.prompt, model);
      const cached = await AIGatewayCache.get(cacheKey);
      if (cached) {
        await AIGatewayCostLedger.recordUsage({
          id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          school_id: request.school_id,
          user_id: request.user_id,
          user_role: request.user_role,
          request_id: request.request_id,
          feature: request.feature,
          model_identifier: model,
          input_tokens: 0,
          output_tokens: 0,
          latency_ms: Date.now() - startTime,
          estimated_cost_usd: 0,
          status: 'cached',
          cache_hit: true,
          created_at: new Date().toISOString()
        });

        return {
          request_id: request.request_id,
          output: cached.output as T,
          raw_text: cached.raw_text,
          model_used: model,
          input_tokens: 0,
          output_tokens: 0,
          latency_ms: Date.now() - startTime,
          estimated_cost_usd: 0,
          cached: true,
          status: 'cached'
        };
      }
    }

    // 4. Verificación de Circuit Breaker
    const circuitCheck = AIGatewayCircuitBreaker.canExecute();
    if (!circuitCheck.allowed) {
      await AIGatewayCostLedger.recordUsage({
        id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        school_id: request.school_id,
        user_id: request.user_id,
        user_role: request.user_role,
        request_id: request.request_id,
        feature: request.feature,
        model_identifier: model,
        input_tokens: 0,
        output_tokens: 0,
        latency_ms: Date.now() - startTime,
        estimated_cost_usd: 0,
        status: 'circuit_broken',
        cache_hit: false,
        error_message: circuitCheck.reason,
        created_at: new Date().toISOString()
      });
      throw new Error(circuitCheck.reason);
    }

    // 5. Inferencia con Reintentos y Timeout
    let rawText = '';
    let success = false;
    let lastError: Error | null = null;
    const timeoutMs = request.timeout_ms || this.DEFAULT_TIMEOUT_MS;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        if (request.custom_mock_response) {
          rawText = request.custom_mock_response;
          success = true;
          break;
        }

        // Llamada a la API oficial mediante timeout
        rawText = await this.performInference(request.prompt, model, timeoutMs);
        success = true;
        break;
      } catch (err: any) {
        lastError = err;
        if (attempt < this.MAX_RETRIES) {
          // Backoff exponencial: 200ms, 400ms
          await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
        }
      }
    }

    const latencyMs = Date.now() - startTime;

    if (!success) {
      AIGatewayCircuitBreaker.recordFailure();
      await AIGatewayCostLedger.recordUsage({
        id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        school_id: request.school_id,
        user_id: request.user_id,
        user_role: request.user_role,
        request_id: request.request_id,
        feature: request.feature,
        model_identifier: model,
        input_tokens: 0,
        output_tokens: 0,
        latency_ms: latencyMs,
        estimated_cost_usd: 0,
        status: 'failed',
        cache_hit: false,
        error_message: lastError?.message || 'Error de inferencia',
        created_at: new Date().toISOString()
      });
      throw new Error(`AIGateway: Falló la inferencia tras ${this.MAX_RETRIES + 1} intentos. ${lastError?.message}`);
    }

    // Éxito: notificar al Circuit Breaker
    AIGatewayCircuitBreaker.recordSuccess();

    // 6. Contabilidad de Tokens y Costos
    const inputTokens = Math.ceil(request.prompt.length / 4);
    const outputTokens = Math.ceil(rawText.length / 4);
    const estimatedCostUsd = AIGatewayModelRouter.calculateCost(model, inputTokens, outputTokens);

    await AIGatewayCostLedger.recordUsage({
      id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      school_id: request.school_id,
      user_id: request.user_id,
      user_role: request.user_role,
      request_id: request.request_id,
      feature: request.feature,
      model_identifier: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      latency_ms: latencyMs,
      estimated_cost_usd: estimatedCostUsd,
      status: 'success',
      cache_hit: false,
      created_at: new Date().toISOString()
    });

    // 7. Parseo y Validación de Salida Estructurada con Blindaje Defensivo
    let parsedOutput: any = rawText;
    const safeResult = safeJsonParse(rawText);
    if (safeResult.success && safeResult.data !== undefined) {
      parsedOutput = safeResult.data;
    }

    if (request.schema_validator) {
      const validation = request.schema_validator(parsedOutput);
      if (!validation.valid) {
        throw new Error(`AIGateway: Salida de IA inválida contra esquema requerido: ${validation.errors?.join(', ')}`);
      }
    }

    // 8. Guardar en Caché si aplica (L1 Memoria + L2 Supabase)
    if (request.cacheable) {
      const cacheKey = AIGatewayCache.generateKey(request.feature, request.prompt, model);
      await AIGatewayCache.set(cacheKey, {
        output: parsedOutput,
        raw_text: rawText,
        model,
        tokens_saved: inputTokens + outputTokens
      }, {
        feature: request.feature,
        schoolId: request.school_id
      });
    }

    return {
      request_id: request.request_id,
      output: parsedOutput,
      raw_text: rawText,
      model_used: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      latency_ms: latencyMs,
      estimated_cost_usd: estimatedCostUsd,
      cached: false,
      status: 'success'
    };
  }

  /**
   * Ejecuta la llamada HTTP con control de timeout.
   */
  private static async performInference(prompt: string, model: string, timeoutMs: number): Promise<string> {
    const apiKey = process.env.AI_ENGINE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // Modo offline simulado si no hay llave en entorno local
      return JSON.stringify({
        status: 'simulated_offline',
        message: 'Respuesta pedagógica offline simulada por el Motor de IA.',
        timestamp: new Date().toISOString()
      });
    }

    const cleanModel = model.replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}
