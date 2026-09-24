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

export interface GeneratorExecutionOptions {
  model?: string;
  customInference?: InferenceProvider;
  skipTraceabilityPersistence?: boolean;
}

export abstract class BaseAcademicGenerator<TOutput> {
  protected static globalMockProvider: InferenceProvider | null = null;
  public static readonly DEFAULT_MODEL = 'models/gemini-3.5-flash';

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
    const rawResponse = await this.callModel(prompt, modelName, options.customInference);

    // 4. Parsear respuesta estructurada
    const parsedOutput = this.parseOutput(rawResponse);

    // 5. Validar contra alucinaciones y taxonomía
    const validation = this.validateOutput(request, parsedOutput);

    // 6. Generar registro de trazabilidad curricular
    const generation_id = `gen_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const traceability: TraceabilityRecord = {
      generation_id,
      request: request.toParams(),
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
   * Invocación al Motor de IA Pedagógica con soporte de Marca Blanca y control de errores.
   */
  protected async callModel(prompt: string, modelName: string, customInference?: InferenceProvider): Promise<string> {
    // Si hay un proveedor mockeado registrado (para tests offline)
    if (customInference) {
      return customInference(prompt, modelName);
    }
    if (BaseAcademicGenerator.globalMockProvider) {
      return BaseAcademicGenerator.globalMockProvider(prompt, modelName);
    }

    let apiKey = process.env.MOTOR_IA_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const envLocalPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envLocalPath)) {
          const content = fs.readFileSync(envLocalPath, 'utf8');
          const match = content.match(/MOTOR_IA_API_KEY=([^\r\n]+)/) || content.match(/GEMINI_API_KEY=([^\r\n]+)/);
          if (match) {
            apiKey = match[1].trim();
          }
        }
      } catch {
        // Fallback silencioso si no se encuentra
      }
    }

    if (!apiKey) {
      throw new Error(
        'BaseAcademicGenerator: No se encontró la credencial de autenticación del Motor de IA (MOTOR_IA_API_KEY) en las variables de entorno.'
      );
    }

    // Lista de modelos ordenada por preferencia con tolerancia a picos temporales (503 / 429)
    const candidateModels = [
      modelName,
      'models/gemini-3.5-flash-lite',
      'models/gemini-flash-lite-latest',
      'models/gemini-flash-latest'
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError: Error | null = null;

    for (const currentModel of candidateModels) {
      const cleanModel = currentModel.replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      };

      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const json = await response.json();
            const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && typeof candidateText === 'string') {
              return candidateText;
            }
            throw new Error('BaseAcademicGenerator: La respuesta recibida no contiene texto válido.');
          }

          const status = response.status;
          const errText = await response.text();

          // Si es 503 (alta demanda) o 429 (límite transitorio), esperar y reintentar
          if ((status === 503 || status === 429) && attempt < maxRetries) {
            const waitMs = attempt * 1500;
            await new Promise(resolve => setTimeout(resolve, waitMs));
            continue;
          }

          lastError = new Error(`El modelo ${currentModel} devolvió código HTTP ${status}: ${errText.slice(0, 250)}`);
          break; // Pasar al siguiente modelo si agotó intentos
        } catch (err: unknown) {
          const fetchMsg = err instanceof Error ? err.message : String(err);
          lastError = new Error(`Error de conexión con ${currentModel}: ${fetchMsg}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
          break;
        }
      }
    }

    throw lastError || new Error('BaseAcademicGenerator: No fue posible completar la inferencia con ninguno de los modelos disponibles.');
  }

  /**
   * Métodos abstractos que cada generador especializado debe implementar.
   */
  protected abstract parseOutput(rawResponse: string): TOutput;
  protected abstract validateOutput(request: AcademicGenerationRequest, output: TOutput): AcademicValidationResult;
}
