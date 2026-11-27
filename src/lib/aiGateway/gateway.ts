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
import { resolveServerEnvKey } from '@/lib/envKeyResolver';

// Transporte y mapeo interno de perfiles (Marca Blanca Institucional)
const AI_TRANSPORT_BASE = Buffer.from(
  'aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy8=',
  'base64'
).toString('ascii');
const LEGACY_AI_ENV_KEY = Buffer.from('R0VNSU5JX0FQSV9LRVk=', 'base64').toString('ascii');
const LEGACY_GOOGLE_API_KEY = Buffer.from('R09PR0xFX0FQSV9LRVk=', 'base64').toString('ascii');
const PRIMARY_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuMS1mbGFzaC1saXRl', 'base64').toString('ascii');
const MID_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuNS1mbGFzaC1saXRl', 'base64').toString('ascii');
const PRO_MODEL = Buffer.from('Z2VtaW5pLTMuOC1mbGFzaA==', 'base64').toString('ascii');

interface GatewayInferenceOutcome {
  rawText: string;
  isOfflineFallback: boolean;
  inputTokens?: number;
  outputTokens?: number;
}

class NonRetryableGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableGatewayError';
  }
}

export class AIGateway {
  public static readonly DEFAULT_TIMEOUT_MS = 8_000;
  public static readonly DEFAULT_MAX_OUTPUT_TOKENS = 1_500;
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
    let outcome: GatewayInferenceOutcome = {
      rawText: '',
      isOfflineFallback: false
    };
    let success = false;
    let lastError: Error | null = null;
    const timeoutMs = request.timeout_ms || this.DEFAULT_TIMEOUT_MS;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        if (request.custom_mock_response) {
          outcome = {
            rawText: request.custom_mock_response,
            isOfflineFallback: false
          };
          success = true;
          break;
        }

        // Llamada a la API oficial mediante timeout
        outcome = await this.performInference(
          request.prompt,
          model,
          timeoutMs,
          request.system_instructions,
          request.temperature
        );
        success = true;
        break;
      } catch (err: any) {
        lastError = err;
        if (err instanceof NonRetryableGatewayError) {
          break;
        }
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

    const rawText = outcome.rawText;
    const isOfflineFallback = outcome.isOfflineFallback;

    // 6. Contabilidad real de Tokens y Costos (0 en fallback offline)
    const inputTokens = isOfflineFallback
      ? 0
      : (outcome.inputTokens ?? Math.ceil(request.prompt.length / 4));
    const outputTokens = isOfflineFallback
      ? 0
      : (outcome.outputTokens ?? Math.ceil(rawText.length / 4));
    const estimatedCostUsd = isOfflineFallback
      ? 0
      : AIGatewayModelRouter.calculateCost(model, inputTokens, outputTokens);

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

    // 8. Guardar en Caché si aplica (NUNCA cachear respuestas offline simuladas para evitar envenenamiento)
    if (request.cacheable && !isOfflineFallback) {
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
      status: isOfflineFallback ? 'fallback' : 'success'
    };
  }

  /**
   * Ejecuta la llamada HTTP con control de timeout, cabecera x-goog-api-key y telemetría real.
   */
  private static async performInference(
    prompt: string,
    model: string,
    timeoutMs: number,
    systemInstructions?: string,
    temperature?: number
  ): Promise<GatewayInferenceOutcome> {
    const apiKey = resolveServerEnvKey([
      'MOTOR_IA_API_KEY',
      'AI_API_KEY',
      'AI_ENGINE_API_KEY',
      LEGACY_AI_ENV_KEY,
      LEGACY_GOOGLE_API_KEY
    ]);

    if (!apiKey) {
      // Modo offline simulado si no hay llave en entorno local (marcado para NO persistir en caché)
      return {
        rawText: JSON.stringify({
          status: 'simulated_offline',
          message: 'Respuesta pedagógica offline simulada por el Motor de IA.',
          timestamp: new Date().toISOString()
        }),
        isOfflineFallback: true,
        inputTokens: 0,
        outputTokens: 0
      };
    }

    const cleanModel = model.replace(/^models\//, '');
    const realModelMap: Record<string, string> = {
      'pedagogical-ai-flash-lite': PRIMARY_LITE_MODEL,
      'pedagogical-ai-core': MID_LITE_MODEL,
      'pedagogical-ai-pro': PRO_MODEL
    };
    const targetModel = realModelMap[cleanModel] || cleanModel;
    const url = `${AI_TRANSPORT_BASE}${targetModel}:generateContent`;
    const thinkingConfig =
      targetModel === MID_LITE_MODEL
        ? { thinkingLevel: 'MINIMAL' }
        : targetModel === PRO_MODEL
        ? { thinkingLevel: 'LOW' }
        : { thinkingBudget: 0 };

    const payload: Record<string, unknown> = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: typeof temperature === 'number' ? temperature : 0.3,
        maxOutputTokens: this.DEFAULT_MAX_OUTPUT_TOKENS,
        thinkingConfig
      }
    };
    if (systemInstructions && systemInstructions.trim().length > 0) {
      payload.systemInstruction = {
        parts: [{ text: systemInstructions }]
      };
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          throw new NonRetryableGatewayError(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const parts = json.candidates?.[0]?.content?.parts || [];
      const validPart = parts.find((p: any) => !p.thought && typeof p.text === 'string') || parts[0];
      const rawText = validPart?.text || '';

      const usage = json.usageMetadata;
      const inputTokens = typeof usage?.promptTokenCount === 'number' ? usage.promptTokenCount : undefined;
      const outputTokens =
        typeof usage?.candidatesTokenCount === 'number'
          ? usage.candidatesTokenCount + (typeof usage?.thoughtsTokenCount === 'number' ? usage.thoughtsTokenCount : 0)
          : undefined;

      return {
        rawText,
        isOfflineFallback: false,
        inputTokens,
        outputTokens
      };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}
