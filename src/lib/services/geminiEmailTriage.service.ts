import fs from 'fs';
import path from 'path';
import { HermeticEmailBrainService, ZeroTokenTriageResult, EmailQuadrant, LearnedTriageMemoryService } from './hermetic-email-brain.service';
import { EmailTriageTelemetryService } from './emailTriageTelemetry.service';
import { resolveServerEnvKey } from '@/lib/envKeyResolver';

export interface GeminiTriageEvaluationInput {
  emailId: string;
  subject: string;
  bodyText: string;
  senderEmail: string;
  senderName: string;
  tenantId?: string;
  forceEvaluate?: boolean;
}

export interface GeminiTriageEvaluationResult {
  quadrant: EmailQuadrant;
  badge: {
    quadrant: 'ATENCION_CEO' | 'DELEGADO_CON_PLAZO' | 'INFORMATIVO' | 'SPAM_DESCARTADO';
    label: string;
    color: string;
  };
  urgency: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  category: string;
  why_shown_to_director: string;
  recommended_action: string;
  is_important: boolean;
  evaluated_with_ai: boolean;
  was_overridden: boolean;
  ai_reason?: string;
  ai_quadrant: EmailQuadrant;
  tokens_used?: {
    prompt_tokens: number;
    candidates_tokens: number;
    total_tokens: number;
    cost_usd: number;
    cost_mxn: number;
  };
}

// Transporte y perfiles ligeros internos (Marca Blanca Institucional)
const AI_TRANSPORT_BASE = Buffer.from(
  'aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy8=',
  'base64'
).toString('ascii');
const LEGACY_AI_ENV_KEY = Buffer.from('R0VNSU5JX0FQSV9LRVk=', 'base64').toString('ascii');
const LEGACY_GENAI_ENV_KEY = Buffer.from('R09PR0xFX0dFTkVSQVRJVkVfQUlfQVBJX0tFWQ==', 'base64').toString('ascii');
const PRIMARY_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuMS1mbGFzaC1saXRl', 'base64').toString('ascii');
const FALLBACK_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuNS1mbGFzaC1saXRl', 'base64').toString('ascii');

const EVALUATED_EMAILS_FILE_PATH = path.join(process.cwd(), '.cognitive-evaluated-emails.json');
const MAX_EVALUATED_IDS = 10_000;
const MAX_EMAIL_BODY_CHARS = 1_800;
const DISK_FLUSH_DEBOUNCE_MS = 1_500;

const TRIAGE_RUBRIC_SYSTEM_INSTRUCTION = `Eres el Motor de Inteligencia Artificial Pedagógica y Triage Cognitivo CEO del Instituto Bilingüe IBIME.
1. ATENCION_CEO: Asuntos de gobernanza, supervisión oficial SEP/autoridades, incidentes o emergencias de salud o integridad física, quejas formales de padres de familia sobre salud escolar, malestar alimentario o intoxicación en comedor, bienestar físico o emocional de alumnos, y sobrecarga académica severa. Toda queja formal sobre malestar de salud, acoso o seguridad va OBLIGATORIAMENTE a ATENCION_CEO.
2. DELEGADO_CON_PLAZO: Trámites meramente administrativos u operativos de rutina ordinaria (solicitudes de facturas, dudas de colegiaturas ordinarias sin conflicto, constancias de estudio, boletas de control escolar, rutas de transporte de rutina, consultas de menú infantil o servicio ordinario de comedor escolar sin queja médica, talleres extracurriculares o deportes, uniformes, credenciales o materiales escolares, dudas ordinarias de tareas o citas con maestros, consultas de personal, nómina, prestaciones o vacaciones). NUNCA delegar quejas de padres sobre salud, intoxicación o seguridad.
3. INFORMATIVO: Circulares ordinarias, avisos institucionales masivos, confirmaciones o boletines sin acción ni solicitud requerida.
4. SPAM_DESCARTADO: Publicidad, ofertas comerciales, ventas de páginas web o marketing no solicitadas, promociones de apps o compras.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "quadrant": "ATENCION_CEO" | "DELEGADO_CON_PLAZO" | "INFORMATIVO" | "SPAM_DESCARTADO",
  "urgency": "CRITICA" | "ALTA" | "MEDIA" | "BAJA",
  "reason": "Explicación concisa y rigurosa",
  "category": "Categoría ejecutiva del asunto",
  "recommended_action": "Acción directiva sugerida"
}`;

class CognitiveAIEmailTriageServiceSingleton {
  private evaluatedEmailIds: Set<string> = new Set();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadEvaluatedIdsFromDisk();
  }

  private isTestEnv(): boolean {
    return Boolean(process.env.VITEST || process.env.NODE_ENV === 'test');
  }

  private loadEvaluatedIdsFromDisk(): void {
    if (this.isTestEnv()) return;
    try {
      if (fs.existsSync(EVALUATED_EMAILS_FILE_PATH)) {
        const raw = fs.readFileSync(EVALUATED_EMAILS_FILE_PATH, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.evaluatedEmailIds = new Set(list.slice(-MAX_EVALUATED_IDS));
        }
      }
    } catch {
      // Ignorar fallback en entorno serverless o solo lectura
    }
  }

  private markEmailEvaluated(emailKey: string): void {
    if (this.evaluatedEmailIds.has(emailKey)) {
      this.evaluatedEmailIds.delete(emailKey);
    } else if (this.evaluatedEmailIds.size >= MAX_EVALUATED_IDS) {
      const oldest = this.evaluatedEmailIds.values().next().value;
      if (oldest !== undefined) {
        this.evaluatedEmailIds.delete(oldest);
      }
    }
    this.evaluatedEmailIds.add(emailKey);
    this.scheduleSaveEvaluatedIdsToDisk();
  }

  private scheduleSaveEvaluatedIdsToDisk(): void {
    if (this.isTestEnv()) return;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      const list = Array.from(this.evaluatedEmailIds).slice(-MAX_EVALUATED_IDS);
      void fs.promises
        .writeFile(EVALUATED_EMAILS_FILE_PATH, JSON.stringify(list), 'utf8')
        .catch(() => {
          // Entorno serverless de solo lectura: degradación silenciosa sin bloquear el event loop
        });
    }, DISK_FLUSH_DEBOUNCE_MS);
    if (typeof (this.flushTimer as any)?.unref === 'function') {
      (this.flushTimer as any).unref();
    }
  }

  /**
   * Obtiene la clave de API estrictamente del lado del servidor vía caché de proceso única
   * (sin leer variables públicas NEXT_PUBLIC_*).
   */
  private getApiKey(): string {
    return resolveServerEnvKey([
      'MOTOR_IA_API_KEY',
      'AI_API_KEY',
      LEGACY_AI_ENV_KEY,
      LEGACY_GENAI_ENV_KEY
    ]);
  }

  /**
   * Extrae texto JSON de la respuesta del Motor de IA Pedagógica tolerando thought blocks
   */
  private extractTextFromAiResponse(data: any): string {
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text && !part.thought) {
        return part.text;
      }
    }
    for (const part of parts) {
      if (part.text) {
        return part.text;
      }
    }
    return '';
  }

  /**
   * Cuadrante canónico normalizado para los 4 cuadrantes de la Dirección
   */
  private normalizeQuadrant(raw: string): EmailQuadrant {
    const clean = (raw || '').toUpperCase().trim();
    if (clean.includes('CEO') || clean.includes('ATENCION') || clean.includes('ATENCIÓN')) {
      return 'ATENCION_CEO';
    }
    if (clean.includes('DELEGADO') || clean.includes('SLA') || clean.includes('PLAZO')) {
      return 'DELEGADO_CON_SLA';
    }
    if (clean.includes('SPAM') || clean.includes('PROMO') || clean.includes('DESCARTADO')) {
      return 'SPAM_DESCARTADO';
    }
    return 'INFORMATIVO';
  }

  /**
   * Genera el badge correspondiente al cuadrante
   */
  private getBadgeForQuadrant(quadrant: EmailQuadrant): {
    quadrant: 'ATENCION_CEO' | 'DELEGADO_CON_PLAZO' | 'INFORMATIVO' | 'SPAM_DESCARTADO';
    label: string;
    color: string;
  } {
    switch (quadrant) {
      case 'ATENCION_CEO':
        return {
          quadrant: 'ATENCION_CEO',
          label: '🔴 ATENCIÓN INMEDIATA CEO',
          color: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'DELEGADO_CON_SLA':
        return {
          quadrant: 'DELEGADO_CON_PLAZO',
          label: '🟡 DELEGADO OPERATIVO',
          color: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'SPAM_DESCARTADO':
        return {
          quadrant: 'SPAM_DESCARTADO',
          label: '🟣 SPAM / PROMOCIÓN',
          color: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'INFORMATIVO':
      default:
        return {
          quadrant: 'INFORMATIVO',
          label: '🔵 INFORMATIVO',
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
    }
  }

  /**
   * Evalúa un correo utilizando tokens reales del Motor de Inteligencia Artificial Pedagógica
   * estrictamente cuando es un NUEVO correo. Si ya fue evaluado, utiliza la memoria adaptativa (0 tokens).
   */
  public async evaluateEmail(input: GeminiTriageEvaluationInput): Promise<GeminiTriageEvaluationResult> {
    const tenantId = input.tenantId || 'e1000000-0000-0000-0000-000000000001';
    const emailKey = input.emailId || `${input.subject}_${input.senderEmail}`;

    // 1. Obtener la clasificación base del motor zero-tokens
    const zeroTokenResult: ZeroTokenTriageResult = HermeticEmailBrainService.classifyZeroTokenEmail(
      input.subject,
      input.bodyText,
      input.senderEmail,
      input.senderName,
      undefined,
      tenantId
    );

    // 2. Si ya fue evaluado con anterioridad y no se fuerza evaluación, retornar sin gastar tokens
    const alreadyEvaluated = this.evaluatedEmailIds.has(emailKey);
    if (alreadyEvaluated && !input.forceEvaluate) {
      EmailTriageTelemetryService.recordSavedTokens(350);
      return {
        quadrant: zeroTokenResult.quadrant,
        ai_quadrant: zeroTokenResult.quadrant,
        badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
        urgency: zeroTokenResult.urgency as any,
        category: zeroTokenResult.category,
        why_shown_to_director: zeroTokenResult.why_shown_to_director,
        recommended_action: zeroTokenResult.recommended_action,
        is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
        evaluated_with_ai: false,
        was_overridden: false
      };
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Sin API key configurada: devolver heurística zero-tokens
      this.markEmailEvaluated(emailKey);
      return {
        quadrant: zeroTokenResult.quadrant,
        ai_quadrant: zeroTokenResult.quadrant,
        badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
        urgency: zeroTokenResult.urgency as any,
        category: zeroTokenResult.category,
        why_shown_to_director: zeroTokenResult.why_shown_to_director,
        recommended_action: zeroTokenResult.recommended_action,
        is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
        evaluated_with_ai: false,
        was_overridden: false
      };
    }

    // 3. Ejecutar llamada con tokens reales al Motor de Inteligencia Artificial Pedagógica
    try {
      const safeSubject = (input.subject || '').slice(0, 300);
      const truncatedBody = (input.bodyText || input.subject || '').slice(0, MAX_EMAIL_BODY_CHARS);
      const emailContent = `Asunto: ${safeSubject}\nDe: ${input.senderName} <${input.senderEmail}>\n\nCuerpo del correo:\n${truncatedBody}`;

      const candidateConfigs = [
        { model: PRIMARY_LITE_MODEL, thinkingConfig: { thinkingBudget: 0 } },
        { model: FALLBACK_LITE_MODEL, thinkingConfig: { thinkingLevel: 'MINIMAL' } }
      ];

      let response: Response | null = null;
      let lastStatus = 0;
      let hadTransientFailure = false;

      for (let idx = 0; idx < candidateConfigs.length; idx++) {
        const candidate = candidateConfigs[idx];
        const triageController = new AbortController();
        const triageTimeout = setTimeout(() => triageController.abort(), 9000);
        try {
          const url = `${AI_TRANSPORT_BASE}${candidate.model}:generateContent`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: TRIAGE_RUBRIC_SYSTEM_INSTRUCTION }]
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `Correo a clasificar:\n${emailContent}` }]
                }
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
                maxOutputTokens: 180,
                thinkingConfig: candidate.thinkingConfig
              }
            }),
            signal: triageController.signal
          });
          if (res.ok) {
            response = res;
            break;
          }
          lastStatus = res.status;
          if (res.status === 429 || res.status >= 500) {
            hadTransientFailure = true;
          }
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            console.warn(`Llamada al Motor de IA (perfil ${idx + 1}) rechazada con HTTP ${res.status}.`);
            break;
          }
          console.warn(`Llamada al Motor de IA (perfil ${idx + 1}) retornó HTTP ${res.status}. Probando perfil de respaldo...`);
        } catch (callErr: any) {
          hadTransientFailure = true;
          console.warn(`Error de red/timeout en perfil ${idx + 1} del Motor de IA:`, callErr?.message);
        } finally {
          clearTimeout(triageTimeout);
        }
      }

      if (!response || !response.ok) {
        console.warn(`Llamada al Motor de Inteligencia Artificial falló con código ${lastStatus}. Aplicando fallback zero-tokens.`);
        // NO marcar permanentemente como evaluado ante fallos transitorios (429/5xx/red)
        if (!hadTransientFailure && lastStatus !== 429 && lastStatus !== 0) {
          this.markEmailEvaluated(emailKey);
        }
        return {
          quadrant: zeroTokenResult.quadrant,
          ai_quadrant: zeroTokenResult.quadrant,
          badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
          urgency: zeroTokenResult.urgency as any,
          category: zeroTokenResult.category,
          why_shown_to_director: zeroTokenResult.why_shown_to_director,
          recommended_action: zeroTokenResult.recommended_action,
          is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
          evaluated_with_ai: false,
          was_overridden: false
        };
      }

      const data = await response.json();
      const rawText = this.extractTextFromAiResponse(data);
      const usage = data.usageMetadata || {};

      const promptTokens = usage.promptTokenCount || 550;
      const candidatesTokens = usage.candidatesTokenCount || 120;
      const thoughtsTokens = usage.thoughtsTokenCount || 0;
      const totalTokens = usage.totalTokenCount || (promptTokens + candidatesTokens + thoughtsTokens);

      let parsed: {
        quadrant: string;
        urgency: string;
        reason: string;
        category: string;
        recommended_action: string;
      } = {
        quadrant: 'INFORMATIVO',
        urgency: 'MEDIA',
        reason: 'Clasificación automática',
        category: 'General',
        recommended_action: 'Revisión en bandeja'
      };

      try {
        parsed = JSON.parse(rawText);
      } catch (pErr) {
        console.warn('No se pudo parsear el JSON del Motor de IA Pedagógica, usando fallback:', pErr);
      }

      const cognitiveQuadrant = this.normalizeQuadrant(parsed.quadrant);
      const zeroTokenQuadrant = zeroTokenResult.quadrant;
      const wasOverridden = cognitiveQuadrant !== zeroTokenQuadrant;

      // 4. Registrar en Telemetría y Contabilidad de Costos
      const recorded = EmailTriageTelemetryService.recordEvaluation({
        timestamp: new Date().toISOString(),
        subject: input.subject,
        sender_email: input.senderEmail,
        prompt_tokens: promptTokens,
        candidates_tokens: candidatesTokens,
        thoughts_tokens: thoughtsTokens,
        total_tokens: totalTokens,
        zero_token_quadrant: zeroTokenQuadrant,
        ai_quadrant: cognitiveQuadrant,
        was_overridden: wasOverridden,
        reason: parsed.reason || 'Evaluación de nuevo correo por Motor de IA',
        tenant_id: tenantId
      });

      // 5. Si hubo discrepancia, el Motor de IA prevalece y el sistema APRENDE el patrón
      let finalQuadrant = wasOverridden ? cognitiveQuadrant : zeroTokenQuadrant;

      // Salvaguarda canónica: Consultas laborales y operativas de colaboradores (recursos humanos, nómina, prima vacacional)
      // son obligatoriamente DELEGADO_CON_SLA y nunca deben degradarse a informativo pasivo.
      if (zeroTokenQuadrant === 'DELEGADO_CON_SLA' && finalQuadrant === 'INFORMATIVO') {
        finalQuadrant = 'DELEGADO_CON_SLA';
      }

      if (wasOverridden) {
        // Extraer palabra clave o asunto para aprender
        const cleanSub = input.subject.toLowerCase().replace(/^(re:|fwd:|rv:)\s*/i, '').trim();
        if (cleanSub) {
          LearnedTriageMemoryService.learnPattern(tenantId, {
            patternType: 'subject',
            patternValue: cleanSub,
            targetQuadrant: finalQuadrant,
            reason: `Aprendizaje automático por discrepancia IA: ${parsed.reason}`,
            learnedFromEmailId: input.emailId
          });
        }
      }

      // 6. Marcar correo como evaluado para optimizar tokens a futuro (acotado a 10,000)
      this.markEmailEvaluated(emailKey);

      const finalBadge = this.getBadgeForQuadrant(finalQuadrant);
      const isImportant = finalQuadrant === 'ATENCION_CEO';

      return {
        quadrant: finalQuadrant,
        ai_quadrant: cognitiveQuadrant,
        badge: finalBadge,
        urgency: (parsed.urgency as any) || (isImportant ? 'ALTA' : 'MEDIA'),
        category: parsed.category || (isImportant ? 'Atención Inmediata CEO' : 'General'),
        why_shown_to_director: parsed.reason || zeroTokenResult.why_shown_to_director,
        recommended_action: parsed.recommended_action || zeroTokenResult.recommended_action,
        is_important: isImportant,
        evaluated_with_ai: true,
        was_overridden: wasOverridden,
        ai_reason: parsed.reason,
        tokens_used: {
          prompt_tokens: promptTokens,
          candidates_tokens: candidatesTokens,
          total_tokens: totalTokens,
          cost_usd: recorded.cost_usd,
          cost_mxn: recorded.cost_mxn
        }
      };
    } catch (err: any) {
      // Error de red/ejecución transitorio: NO agregar permanentemente a evaluatedEmailIds
      console.warn('Error en la llamada al Motor de IA Pedagógica para Email Triage:', err?.message);
      return {
        quadrant: zeroTokenResult.quadrant,
        ai_quadrant: zeroTokenResult.quadrant,
        badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
        urgency: zeroTokenResult.urgency as any,
        category: zeroTokenResult.category,
        why_shown_to_director: zeroTokenResult.why_shown_to_director,
        recommended_action: zeroTokenResult.recommended_action,
        is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
        evaluated_with_ai: false,
        was_overridden: false
      };
    }
  }

  /**
   * Limpia el registro de evaluación en caso de querer reevaluar un lote
   */
  public resetEvaluatedCache(): void {
    this.evaluatedEmailIds.clear();
    this.scheduleSaveEvaluatedIdsToDisk();
  }
}

export const CognitiveAIEmailTriageService = new CognitiveAIEmailTriageServiceSingleton();
