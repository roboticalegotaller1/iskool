/**
 * @file baseGenerator.ts
 * @description Clase base abstracta para generadores académicos del ecosistema iSchool.
 * Desacopla la orquestación del flujo pedagógico (Request -> Context -> Prompt -> Inferencia -> Parseo -> Validación -> Trazabilidad)
 * permitiendo la extensión futura a LessonGenerator, AssessmentGenerator, WorksheetGenerator, RubricGenerator, etc.
 */

import crypto from 'crypto';
import { AcademicGenerationRequest } from './request';
import { AcademicGenerationContextService, RetrievedAcademicContext } from './contextService';
import { AcademicGenerationPromptBuilder } from './promptBuilder';
import { AcademicValidationResult, TraceabilityRecord } from './types';
import { AcademicGenerationTraceabilityStore } from './traceabilityStore';

export type InferenceProvider = (prompt: string, modelName: string) => Promise<string>;

export interface ModelCallOptions {
  maxOutputTokens?: number;
  systemInstruction?: string;
  temperature?: number;
}

export interface GeneratorExecutionOptions extends ModelCallOptions {
  model?: string;
  customInference?: InferenceProvider;
  skipTraceabilityPersistence?: boolean;
}

// Caché por proceso para evitar lecturas repetitivas de .env.local en disco
let cachedEnvLocalApiKey: string | null | undefined = undefined;

// Base de transporte y sufijo de respaldo decodificados internamente (Marca Blanca Institucional)
const AI_TRANSPORT_BASE = Buffer.from(
  'aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy8=',
  'base64'
).toString('ascii');
const LEGACY_KEY_ENV = Buffer.from('R0VNSU5JX0FQSV9LRVk=', 'base64').toString('ascii');
const ACTIVE_PRIMARY_MODEL = Buffer.from('Z2VtaW5pLTMuMS1mbGFzaC1saXRl', 'base64').toString('ascii');
const ACTIVE_FALLBACK_MODEL = Buffer.from('Z2VtaW5pLTMuNS1mbGFzaC1saXRl', 'base64').toString('ascii');

function resolveCachedEngineApiKey(): string | undefined {
  const fromEnv =
    process.env.MOTOR_IA_API_KEY ||
    process.env.AI_API_KEY ||
    process.env[LEGACY_KEY_ENV];
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.trim();
  }

  if (cachedEnvLocalApiKey !== undefined) {
    return cachedEnvLocalApiKey || undefined;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const legacyPattern = new RegExp(`^${LEGACY_KEY_ENV}=([^\\r\\n]+)`, 'm');
      const match =
        content.match(/^MOTOR_IA_API_KEY=([^\r\n]+)/m) ||
        content.match(/^AI_API_KEY=([^\r\n]+)/m) ||
        content.match(legacyPattern);
      if (match && match[1]) {
        cachedEnvLocalApiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
        return cachedEnvLocalApiKey;
      }
    }
  } catch {
    // Fallback silencioso si el entorno de ejecución es solo lectura o restringido
  }

  cachedEnvLocalApiKey = null;
  return undefined;
}

export abstract class BaseAcademicGenerator<TOutput> {
  protected static globalMockProvider: InferenceProvider | null = null;
  public static readonly DEFAULT_MODEL = ACTIVE_PRIMARY_MODEL;
  public static readonly FALLBACK_MODEL = ACTIVE_FALLBACK_MODEL;

  /**
   * Permite inyectar un proveedor de inferencia simulado (mock) para pruebas automatizadas offline.
   */
  static setMockProvider(provider: InferenceProvider | null): void {
    this.globalMockProvider = provider;
  }

  /**
   * Método plantilla que ejecuta el ciclo pedagógico completo.
   */
  async generate(
    request: AcademicGenerationRequest,
    options: GeneratorExecutionOptions = {}
  ): Promise<{
    output: TOutput;
    raw: string;
    prompt: string;
    retrieved: RetrievedAcademicContext;
    validation: AcademicValidationResult;
    traceability: TraceabilityRecord;
  }> {
    // 1. Recuperar contexto pedagógico oficial desde el Knowledge Vault
    const retrieved = await AcademicGenerationContextService.call(request);

    // 2. Construir prompt estructurado versionado
    const prompt = this.buildPrompt(request, retrieved);

    // 3. Ejecutar inferencia a través del Motor de IA Pedagógica
    const modelName = options.model || BaseAcademicGenerator.DEFAULT_MODEL;
    const rawResponse = await this.callModel(prompt, modelName, options.customInference, {
      maxOutputTokens: options.maxOutputTokens,
      systemInstruction: options.systemInstruction,
      temperature: options.temperature,
    });

    // 4. Parsear respuesta estructurada
    const parsedOutput = this.parseOutput(rawResponse);

    // 5. Validar contra alucinaciones y taxonomía
    const validation = this.validateOutput(request, parsedOutput);

    // 6. Generar registro de trazabilidad curricular
    const generation_id = `gen_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const traceability: TraceabilityRecord = {
      generation_id,
      request: typeof (request as any).toParams === 'function' ? (request as any).toParams() : (request as any),
      knowledge_document_ids: retrieved.knowledge_document_ids,
      knowledge_versions: retrieved.knowledge_versions,
      prompt_version: AcademicGenerationPromptBuilder.PROMPT_VERSION,
      model: modelName,
      prompt_sent: prompt,
      raw_output: rawResponse,
      generated_output: parsedOutput as unknown as TraceabilityRecord['generated_output'],
      validation,
      created_at: new Date().toISOString()
    };

    // 7. Persistir trazabilidad
    if (!options.skipTraceabilityPersistence) {
      await AcademicGenerationTraceabilityStore.save(traceability);
    }

    return {
      output: parsedOutput,
      raw: rawResponse,
      prompt,
      retrieved,
      validation,
      traceability
    };
  }

  /**
   * Construye el prompt (personalizable por generadores derivados).
   */
  protected buildPrompt(request: AcademicGenerationRequest, retrieved: RetrievedAcademicContext): string {
    return AcademicGenerationPromptBuilder.build(request, retrieved);
  }

  /**
   * Invocación al Motor de IA Pedagógica con soporte de Marca Blanca, timeout acotado,
   * prefijo de instrucciones de sistema y respaldo único ante errores transitorios (429/5xx).
   */
  protected async callModel(
    prompt: string,
    modelName: string,
    customInference?: InferenceProvider,
    callOptions?: ModelCallOptions
  ): Promise<string> {
    const mockPrompt = callOptions?.systemInstruction
      ? `${callOptions.systemInstruction}\n\n${prompt}`
      : prompt;

    // Si hay un proveedor mockeado registrado (para tests offline)
    if (customInference) {
      return customInference(mockPrompt, modelName);
    }
    if (BaseAcademicGenerator.globalMockProvider) {
      return BaseAcademicGenerator.globalMockProvider(mockPrompt, modelName);
    }

    const apiKey = resolveCachedEngineApiKey();
    if (!apiKey) {
      throw new Error(
        'BaseAcademicGenerator: No se encontró la credencial de autenticación del Motor de IA (MOTOR_IA_API_KEY) en las variables de entorno.'
      );
    }

    // Cascada limpia de 2 niveles: nivel ligero activo -> único respaldo ligero en 429/5xx
    const primaryClean = (modelName || BaseAcademicGenerator.DEFAULT_MODEL).replace(/^models\//, '');
    const candidateModels = [primaryClean, BaseAcademicGenerator.FALLBACK_MODEL].filter(
      (m, i, arr) => Boolean(m) && arr.indexOf(m) === i
    );

    const baseGenerationConfig: Record<string, unknown> = {
      responseMimeType: 'application/json',
      temperature: typeof callOptions?.temperature === 'number' ? callOptions.temperature : 0.3,
    };
    if (typeof callOptions?.maxOutputTokens === 'number' && callOptions.maxOutputTokens > 0) {
      baseGenerationConfig.maxOutputTokens = callOptions.maxOutputTokens;
    }

    const basePayload: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
    };

    if (callOptions?.systemInstruction && callOptions.systemInstruction.trim().length > 0) {
      basePayload.systemInstruction = {
        parts: [{ text: callOptions.systemInstruction }]
      };
    }

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let idx = 0; idx < candidateModels.length; idx++) {
      const cleanModel = candidateModels[idx];
      const tierLabel = idx === 0 ? 'perfil principal' : 'perfil de respaldo';
      const url = `${AI_TRANSPORT_BASE}${cleanModel}:generateContent`;
      const thinkingConfig = cleanModel.includes('3.5-')
        ? { thinkingLevel: 'MINIMAL' }
        : { thinkingBudget: 0 };
      const serializedPayload = JSON.stringify({
        ...basePayload,
        generationConfig: {
          ...baseGenerationConfig,
          thinkingConfig,
        },
      });

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            signal: AbortSignal.timeout(15000),
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: serializedPayload,
          });

          if (response.ok) {
            const json = await response.json();
            const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && typeof candidateText === 'string') {
              return candidateText;
            }
            throw new Error('BaseAcademicGenerator: La respuesta recibida del Motor de IA no contiene texto válido.');
          }

          const status = response.status;
          const errText = await response.text();

          // Fast-fail inmediato en errores de cliente/autenticación (400/401/403): no reintentar ni escalar
          if (status === 400 || status === 401 || status === 403) {
            throw new Error(
              `BaseAcademicGenerator: Solicitud rechazada por el Motor de IA (${tierLabel}, HTTP ${status}): ${errText.slice(0, 200)}`
            );
          }

          const isRetryable = status === 429 || status >= 500;
          lastError = new Error(
            `BaseAcademicGenerator: El Motor de IA (${tierLabel}) devolvió HTTP ${status}: ${errText.slice(0, 200)}`
          );

          if (isRetryable && attempt < maxRetries) {
            const jitterMs = 350 + Math.floor(Math.random() * 450);
            await new Promise((resolve) => setTimeout(resolve, jitterMs));
            continue;
          }

          // Si no es error transitorio 429/5xx, no pasar al respaldo
          if (!isRetryable) {
            throw lastError;
          }

          break; // Agotó reintentos en este perfil -> pasar al respaldo único
        } catch (err: unknown) {
          const fetchMsg = err instanceof Error ? err.message : String(err);
          // Propagar fast-fail de errores 400/401/403 sin reintentar ni cascadear
          if (fetchMsg.includes('Solicitud rechazada por el Motor de IA')) {
            throw err;
          }
          lastError = new Error(`BaseAcademicGenerator: Error de conexión con el Motor de IA (${tierLabel}): ${fetchMsg}`);
          if (attempt < maxRetries) {
            const jitterMs = 350 + Math.floor(Math.random() * 450);
            await new Promise((resolve) => setTimeout(resolve, jitterMs));
            continue;
          }
          break;
        }
      }
    }

    throw lastError || new Error('BaseAcademicGenerator: No fue posible completar la inferencia con el Motor de IA Pedagógica.');
  }

  /**
   * Métodos abstractos que cada generador especializado debe implementar.
   */
  protected abstract parseOutput(rawResponse: string): TOutput;
  protected abstract validateOutput(request: AcademicGenerationRequest, output: TOutput): AcademicValidationResult;
}
