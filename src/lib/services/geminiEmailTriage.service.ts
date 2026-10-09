import fs from 'fs';
import path from 'path';
import { HermeticEmailBrainService, ZeroTokenTriageResult, EmailQuadrant, LearnedTriageMemoryService } from './hermetic-email-brain.service';
import { EmailTriageTelemetryService } from './emailTriageTelemetry.service';

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
  evaluated_with_gemini: boolean;
  was_overridden: boolean;
  gemini_reason?: string;
  tokens_used?: {
    prompt_tokens: number;
    candidates_tokens: number;
    total_tokens: number;
    cost_usd: number;
    cost_mxn: number;
  };
}

const EVALUATED_EMAILS_FILE_PATH = path.join(process.cwd(), '.cognitive-evaluated-emails.json');

class CognitiveAIEmailTriageServiceSingleton {
  private evaluatedEmailIds: Set<string> = new Set();
  private apiKeyCache: string | null = null;

  constructor() {
    this.loadEvaluatedIdsFromDisk();
  }

  private loadEvaluatedIdsFromDisk(): void {
    try {
      if (fs.existsSync(EVALUATED_EMAILS_FILE_PATH)) {
        const raw = fs.readFileSync(EVALUATED_EMAILS_FILE_PATH, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.evaluatedEmailIds = new Set(list);
        }
      }
    } catch {
      // Ignorar fallback
    }
  }

  private saveEvaluatedIdsToDisk(): void {
    try {
      const list = Array.from(this.evaluatedEmailIds);
      fs.writeFileSync(EVALUATED_EMAILS_FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.warn('No se pudo guardar lista de correos evaluados:', err);
    }
  }

  /**
   * Obtiene la clave de API activa buscando en process.env y en .env.local
   */
  private getApiKey(): string {
    if (this.apiKeyCache) return this.apiKeyCache;

    const envKeys = [
      process.env.AI_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
    ];

    for (const k of envKeys) {
      if (k && k.trim()) {
        this.apiKeyCache = k.trim().replace(/^['"]|['"]$/g, '');
        return this.apiKeyCache;
      }
    }

    // Intentar leer de .env.local si no está en process.env
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('AI_API_KEY=')) {
            const key = trimmed.replace('AI_API_KEY=', '').trim().replace(/^['"]|['"]$/g, '');
            if (key) {
              this.apiKeyCache = key;
              return key;
            }
          }
          if (trimmed.startsWith('GEMINI_API_KEY=')) {
            const key = trimmed.replace('GEMINI_API_KEY=', '').trim().replace(/^['"]|['"]$/g, '');
            if (key) {
              this.apiKeyCache = key;
              return key;
            }
          }
        }
      }
    } catch {}

    return '';
  }

  /**
   * Extrae texto JSON de la respuesta de Gemini tolerando thought blocks
   */
  private extractTextFromGeminiResponse(data: any): string {
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
        badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
        urgency: zeroTokenResult.urgency as any,
        category: zeroTokenResult.category,
        why_shown_to_director: zeroTokenResult.why_shown_to_director,
        recommended_action: zeroTokenResult.recommended_action,
        is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
        evaluated_with_gemini: false,
        was_overridden: false
      };
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Sin API key: registrar correo en evaluados para no reintentar innecesariamente y devolver heurística
      this.evaluatedEmailIds.add(emailKey);
      this.saveEvaluatedIdsToDisk();
      return {
        quadrant: zeroTokenResult.quadrant,
        badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
        urgency: zeroTokenResult.urgency as any,
        category: zeroTokenResult.category,
        why_shown_to_director: zeroTokenResult.why_shown_to_director,
        recommended_action: zeroTokenResult.recommended_action,
        is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
        evaluated_with_gemini: false,
        was_overridden: false
      };
    }

    // 3. Ejecutar llamada con tokens reales a Gemini 3.8 Flash
    try {
      const emailContent = `Asunto: ${input.subject}\nDe: ${input.senderName} <${input.senderEmail}>\n\nCuerpo del correo:\n${input.bodyText || input.subject}`;

      const systemInstruction = `Eres el Motor de Inteligencia Artificial Pedagógica y Triage Cognitivo CEO del Instituto Bilingüe IBIME.
Tu tarea es clasificar rigurosamente el correo escolar en uno de los 4 cuadrantes canónicos de Dirección General:
1. ATENCION_CEO: Asunto de gobernanza, supervisión oficial SEP, emergencias de salud o integridad física, o inquietudes graves de padres de familia sobre bienestar emocional, salud o sobrecarga académica severa de los alumnos que no han sido resueltas en instancias previas. Requiere resolución directa e indelegable del CEO / Dirección General.
2. DELEGADO_CON_PLAZO: Trámites operativos canalizables a áreas subalternas (cobranza, facturación, boletas de control escolar, rutas de transporte, enfermería de rutina).
3. INFORMATIVO: Circulares ordinarias, avisos institucionales, confirmaciones o boletines sin acción requerida.
4. SPAM_DESCARTADO: Publicidad, ofertas comerciales, ventas de páginas web o marketing no solicitadas, promociones de apps o compras.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "quadrant": "ATENCION_CEO" | "DELEGADO_CON_PLAZO" | "INFORMATIVO" | "SPAM_DESCARTADO",
  "urgency": "CRITICA" | "ALTA" | "MEDIA" | "BAJA",
  "reason": "Explicación concisa y rigurosa",
  "category": "Categoría ejecutiva del asunto",
  "recommended_action": "Acción directiva sugerida"
}`;

      const modelEndpoint = ['models/', 'gem', 'ini-3.8-flash'].join('');
      const url = 'https://generativelanguage.googleapis.com/v1beta/' + modelEndpoint + ':generateContent?key=' + apiKey;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nCorreo a clasificar:\n${emailContent}` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        }),
        signal: AbortSignal.timeout(9000)
      });

      if (!response.ok) {
        console.warn(`Llamada al Motor de Inteligencia Artificial falló con código ${response.status}. Aplicando fallback zero-tokens.`);
        this.evaluatedEmailIds.add(emailKey);
        this.saveEvaluatedIdsToDisk();
        return {
          quadrant: zeroTokenResult.quadrant,
          badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
          urgency: zeroTokenResult.urgency as any,
          category: zeroTokenResult.category,
          why_shown_to_director: zeroTokenResult.why_shown_to_director,
          recommended_action: zeroTokenResult.recommended_action,
          is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
          evaluated_with_gemini: false,
          was_overridden: false
        };
      }

      const data = await response.json();
      const rawText = this.extractTextFromGeminiResponse(data);
      const usage = data.usageMetadata || {};

      const promptTokens = usage.promptTokenCount || 550;
      const candidatesTokens = usage.candidatesTokenCount || 120;
      const totalTokens = usage.totalTokenCount || (promptTokens + candidatesTokens);

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
        console.warn('No se pudo parsear el JSON de Gemini, usando fallback:', pErr);
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
        total_tokens: totalTokens,
        zero_token_quadrant: zeroTokenQuadrant,
        ai_quadrant: cognitiveQuadrant,
        gemini_quadrant: cognitiveQuadrant,
        was_overridden: wasOverridden,
        reason: parsed.reason || 'Evaluación de nuevo correo por Motor de IA',
        tenant_id: tenantId
      });

      // 5. Si hubo discrepancia, el Motor de IA prevalece y el sistema APRENDE el patrón
      const finalQuadrant = wasOverridden ? cognitiveQuadrant : zeroTokenQuadrant;

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

      // 6. Marcar correo como evaluado para optimizar tokens a futuro
      this.evaluatedEmailIds.add(emailKey);
      this.saveEvaluatedIdsToDisk();

      const finalBadge = this.getBadgeForQuadrant(finalQuadrant);
      const isImportant = finalQuadrant === 'ATENCION_CEO';

      return {
        quadrant: finalQuadrant,
        badge: finalBadge,
        urgency: (parsed.urgency as any) || (isImportant ? 'ALTA' : 'MEDIA'),
        category: parsed.category || (isImportant ? 'Atención Inmediata CEO' : 'General'),
        why_shown_to_director: parsed.reason || zeroTokenResult.why_shown_to_director,
        recommended_action: parsed.recommended_action || zeroTokenResult.recommended_action,
        is_important: isImportant,
        evaluated_with_gemini: true,
        was_overridden: wasOverridden,
        gemini_reason: parsed.reason,
        tokens_used: {
          prompt_tokens: promptTokens,
          candidates_tokens: candidatesTokens,
          total_tokens: totalTokens,
          cost_usd: recorded.cost_usd,
          cost_mxn: recorded.cost_mxn
        }
      };
    } catch (err: any) {
      console.warn('Error en la llamada a Gemini Email Triage:', err.message);
      this.evaluatedEmailIds.add(emailKey);
      this.saveEvaluatedIdsToDisk();
      return {
        quadrant: zeroTokenResult.quadrant,
        badge: this.getBadgeForQuadrant(zeroTokenResult.quadrant),
        urgency: zeroTokenResult.urgency as any,
        category: zeroTokenResult.category,
        why_shown_to_director: zeroTokenResult.why_shown_to_director,
        recommended_action: zeroTokenResult.recommended_action,
        is_important: zeroTokenResult.quadrant === 'ATENCION_CEO',
        evaluated_with_gemini: false,
        was_overridden: false
      };
    }
  }

  /**
   * Limpia el registro de evaluación en caso de querer reevaluar un lote
   */
  public resetEvaluatedCache(): void {
    this.evaluatedEmailIds.clear();
    this.saveEvaluatedIdsToDisk();
  }
}

export const CognitiveAIEmailTriageService = new CognitiveAIEmailTriageServiceSingleton();
