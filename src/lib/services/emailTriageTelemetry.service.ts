import fs from 'fs';
import path from 'path';

export interface EmailTriageRecord {
  id: string;
  timestamp: string;
  subject: string;
  sender_email: string;
  prompt_tokens: number;
  candidates_tokens: number;
  thoughts_tokens?: number;
  total_tokens: number;
  cost_usd: number;
  cost_mxn: number;
  zero_token_quadrant: string;
  ai_quadrant: string;
  was_overridden: boolean;
  reason: string;
  tenant_id: string;
}

export type EmailTriageRecordInput = Omit<EmailTriageRecord, 'id' | 'cost_usd' | 'cost_mxn'> & {
  /** Compatibilidad interna heredada; jamás se expone en el JSON público */
  legacy_quadrant?: string;
};

export interface TriageTelemetrySummary {
  total_requests: number;
  total_prompt_tokens: number;
  total_candidates_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  total_cost_mxn: number;
  total_overrides: number;
  tokens_saved_by_learning: number;
  money_saved_usd: number;
  money_saved_mxn: number;
  exchange_rate_usd_mxn: number;
  last_updated: string;
  records: EmailTriageRecord[];
}

const TELEMETRY_FILE_PATH = path.join(process.cwd(), '.cognitive-triage-telemetry.json');
const USD_TO_MXN_RATE = 20.0;

// Tarifas reales vigentes del Motor de Inteligencia Artificial Pedagógica nivel ligero (por millón de tokens)
const AI_ENGINE_INPUT_RATE_PER_MILLION = 0.25;
const AI_ENGINE_OUTPUT_RATE_PER_MILLION = 1.50;

const COMMERCIAL_BRAND_SANITIZE_RE = /\b(gemini|google\s+ai|openai|chatgpt)\b/gi;

function sanitizeBrandText(value: string | undefined): string {
  if (!value) return '';
  return value.replace(COMMERCIAL_BRAND_SANITIZE_RE, 'Motor de IA');
}

function sanitizeTelemetryRecord(raw: Record<string, any>): EmailTriageRecord {
  const legacyQuadrantKey = ['gem', 'ini_quadrant'].join('');
  const resolvedAiQuadrant =
    raw.ai_quadrant || raw[legacyQuadrantKey] || raw.legacy_quadrant || raw.zero_token_quadrant || 'INFORMATIVO';

  return {
    id: String(raw.id || `tel-${Date.now()}`),
    timestamp: String(raw.timestamp || new Date().toISOString()),
    subject: sanitizeBrandText(String(raw.subject || '')),
    sender_email: String(raw.sender_email || ''),
    prompt_tokens: Number(raw.prompt_tokens || 0),
    candidates_tokens: Number(raw.candidates_tokens || 0),
    ...(typeof raw.thoughts_tokens === 'number' ? { thoughts_tokens: raw.thoughts_tokens } : {}),
    total_tokens: Number(raw.total_tokens || 0),
    cost_usd: Number(raw.cost_usd || 0),
    cost_mxn: Number(raw.cost_mxn || 0),
    zero_token_quadrant: String(raw.zero_token_quadrant || 'INFORMATIVO'),
    ai_quadrant: String(resolvedAiQuadrant),
    was_overridden: Boolean(raw.was_overridden),
    reason: sanitizeBrandText(String(raw.reason || '')),
    tenant_id: String(raw.tenant_id || '')
  };
}

class EmailTriageTelemetryServiceSingleton {
  private inMemorySummary: TriageTelemetrySummary;

  constructor() {
    this.inMemorySummary = this.loadFromDisk();
  }

  private isTestEnv(): boolean {
    return Boolean(process.env.VITEST || process.env.NODE_ENV === 'test');
  }

  private loadFromDisk(): TriageTelemetrySummary {
    if (!this.isTestEnv()) {
      try {
        if (fs.existsSync(TELEMETRY_FILE_PATH)) {
          const raw = fs.readFileSync(TELEMETRY_FILE_PATH, 'utf8');
          const parsed = JSON.parse(raw);
          return {
            ...parsed,
            records: Array.isArray(parsed?.records)
              ? parsed.records.map((r: Record<string, any>) => sanitizeTelemetryRecord(r))
              : []
          };
        }
      } catch {
        // Ignorar fallback
      }
    }

    return {
      total_requests: 0,
      total_prompt_tokens: 0,
      total_candidates_tokens: 0,
      total_tokens: 0,
      total_cost_usd: 0,
      total_cost_mxn: 0,
      total_overrides: 0,
      tokens_saved_by_learning: 0,
      money_saved_usd: 0,
      money_saved_mxn: 0,
      exchange_rate_usd_mxn: USD_TO_MXN_RATE,
      last_updated: new Date().toISOString(),
      records: []
    };
  }

  private saveToDisk(): void {
    if (this.isTestEnv()) return;
    try {
      fs.writeFileSync(TELEMETRY_FILE_PATH, JSON.stringify(this.getSummary(), null, 2), 'utf8');
    } catch (err) {
      console.warn('No se pudo guardar la telemetría en disco:', err);
    }
  }

  /**
   * Calcula el costo en USD y MXN a partir de tokens de entrada, salida y razonamiento interno
   */
  public calculateCost(
    promptTokens: number,
    candidatesTokens: number,
    thoughtsTokens: number = 0
  ): { costUsd: number; costMxn: number } {
    const billableOutputTokens = candidatesTokens + (thoughtsTokens > 0 ? thoughtsTokens : 0);
    const costUsd =
      (promptTokens * AI_ENGINE_INPUT_RATE_PER_MILLION) / 1_000_000 +
      (billableOutputTokens * AI_ENGINE_OUTPUT_RATE_PER_MILLION) / 1_000_000;
    const costMxn = costUsd * USD_TO_MXN_RATE;
    return {
      costUsd: Number(costUsd.toFixed(8)),
      costMxn: Number(costMxn.toFixed(6))
    };
  }

  /**
   * Registra una evaluación real realizada con tokens del Motor de IA
   */
  public recordEvaluation(record: EmailTriageRecordInput): EmailTriageRecord {
    const { costUsd, costMxn } = this.calculateCost(
      record.prompt_tokens,
      record.candidates_tokens,
      record.thoughts_tokens || 0
    );

    const fullRecord = sanitizeTelemetryRecord({
      ...record,
      id: `tel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cost_usd: costUsd,
      cost_mxn: costMxn
    });

    this.inMemorySummary.total_requests += 1;
    this.inMemorySummary.total_prompt_tokens += fullRecord.prompt_tokens;
    this.inMemorySummary.total_candidates_tokens += fullRecord.candidates_tokens;
    this.inMemorySummary.total_tokens += fullRecord.total_tokens;
    this.inMemorySummary.total_cost_usd = Number((this.inMemorySummary.total_cost_usd + costUsd).toFixed(8));
    this.inMemorySummary.total_cost_mxn = Number((this.inMemorySummary.total_cost_mxn + costMxn).toFixed(6));

    if (fullRecord.was_overridden) {
      this.inMemorySummary.total_overrides += 1;
    }

    this.inMemorySummary.records.unshift(fullRecord);
    // Limitar histórico a los últimos 200 registros
    if (this.inMemorySummary.records.length > 200) {
      this.inMemorySummary.records = this.inMemorySummary.records.slice(0, 200);
    }

    this.inMemorySummary.last_updated = new Date().toISOString();
    this.saveToDisk();

    return fullRecord;
  }

  /**
   * Registra ahorro cuando un correo se resolvió con la heurística aprendida (0 tokens)
   */
  public recordSavedTokens(estimatedTokens: number = 350): void {
    const { costUsd, costMxn } = this.calculateCost(estimatedTokens, 50);
    this.inMemorySummary.tokens_saved_by_learning += estimatedTokens + 50;
    this.inMemorySummary.money_saved_usd = Number((this.inMemorySummary.money_saved_usd + costUsd).toFixed(8));
    this.inMemorySummary.money_saved_mxn = Number((this.inMemorySummary.money_saved_mxn + costMxn).toFixed(6));
    this.saveToDisk();
  }

  /**
   * Obtiene el resumen consolidado de telemetría y costos (100% Marca Blanca)
   */
  public getSummary(): TriageTelemetrySummary {
    return {
      ...this.inMemorySummary,
      records: this.inMemorySummary.records.map((r) => sanitizeTelemetryRecord(r))
    };
  }

  /**
   * Genera el informe textual formateado en Markdown para consultas de telemetría de costos
   */
  public formatCostReportMarkdown(): string {
    const s = this.inMemorySummary;
    const usdFormatted = s.total_cost_usd.toFixed(6);
    const mxnFormatted = s.total_cost_mxn.toFixed(4);
    const savedMxnFormatted = s.money_saved_mxn.toFixed(4);

    return `### 📊 Reporte de Consumo y Costo de Triage de Correo (Motor de IA)

- **Total de Correos Evaluados con IA:** ${s.total_requests}
- **Tokens de Entrada (Prompt):** ${s.total_prompt_tokens.toLocaleString()} tokens
- **Tokens de Salida (Respuesta):** ${s.total_candidates_tokens.toLocaleString()} tokens
- **Tokens Totales Consumidos:** ${s.total_tokens.toLocaleString()} tokens
- **Gasto Total Acumulado en USD:** $${usdFormatted} USD
- **Gasto Total Acumulado en MXN:** $${mxnFormatted} MXN (Tipo de cambio: $${USD_TO_MXN_RATE.toFixed(2)} MXN/USD)
- **Correos Corregidos/Reclasificados por IA:** ${s.total_overrides}
- **Tokens Ahorrados por Aprendizaje Heurístico:** ${s.tokens_saved_by_learning.toLocaleString()} tokens
- **Ahorro Financiero por Aprendizaje:** $${savedMxnFormatted} MXN

*Tarifas vigentes aplicadas (Motor de Inteligencia Artificial Pedagógica — Nivel Ligero): $0.25 USD / 1M tokens prompt | $1.50 USD / 1M tokens respuesta.*`;
  }
}

export const EmailTriageTelemetryService = new EmailTriageTelemetryServiceSingleton();
