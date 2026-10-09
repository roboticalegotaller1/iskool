import fs from 'fs';
import path from 'path';

export interface EmailTriageRecord {
  id: string;
  timestamp: string;
  subject: string;
  sender_email: string;
  prompt_tokens: number;
  candidates_tokens: number;
  total_tokens: number;
  cost_usd: number;
  cost_mxn: number;
  zero_token_quadrant: string;
  ai_quadrant: string;
  gemini_quadrant?: string;
  was_overridden: boolean;
  reason: string;
  tenant_id: string;
}

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

// Tarifas oficiales del Motor de Inteligencia Artificial Flash (por millón de tokens)
const AI_ENGINE_INPUT_RATE_PER_MILLION = 0.075;
const AI_ENGINE_OUTPUT_RATE_PER_MILLION = 0.30;

class EmailTriageTelemetryServiceSingleton {
  private inMemorySummary: TriageTelemetrySummary;

  constructor() {
    this.inMemorySummary = this.loadFromDisk();
  }

  private loadFromDisk(): TriageTelemetrySummary {
    try {
      if (fs.existsSync(TELEMETRY_FILE_PATH)) {
        const raw = fs.readFileSync(TELEMETRY_FILE_PATH, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // Ignorar fallback
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
    try {
      fs.writeFileSync(TELEMETRY_FILE_PATH, JSON.stringify(this.inMemorySummary, null, 2), 'utf8');
    } catch (err) {
      console.warn('No se pudo guardar la telemetría en disco:', err);
    }
  }

  /**
   * Calcula el costo en USD y MXN a partir de tokens de entrada y salida
   */
  public calculateCost(promptTokens: number, candidatesTokens: number): { costUsd: number; costMxn: number } {
    const costUsd =
      (promptTokens * AI_ENGINE_INPUT_RATE_PER_MILLION) / 1_000_000 +
      (candidatesTokens * AI_ENGINE_OUTPUT_RATE_PER_MILLION) / 1_000_000;
    const costMxn = costUsd * USD_TO_MXN_RATE;
    return {
      costUsd: Number(costUsd.toFixed(8)),
      costMxn: Number(costMxn.toFixed(6))
    };
  }

  /**
   * Registra una evaluación real realizada con tokens del Motor de IA
   */
  public recordEvaluation(record: Omit<EmailTriageRecord, 'id' | 'cost_usd' | 'cost_mxn'>): EmailTriageRecord {
    const { costUsd, costMxn } = this.calculateCost(record.prompt_tokens, record.candidates_tokens);

    const fullRecord: EmailTriageRecord = {
      ...record,
      id: `tel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cost_usd: costUsd,
      cost_mxn: costMxn
    };

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
   * Obtiene el resumen consolidado de telemetría y costos
   */
  public getSummary(): TriageTelemetrySummary {
    return { ...this.inMemorySummary };
  }

  /**
   * Genera el informe textual formateado en Markdown para Antigravity cuando se solicita "costo de email"
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

*Tarifas oficiales aplicadas (Motor de Inteligencia Artificial Flash): $0.075 USD / 1M tokens prompt | $0.30 USD / 1M tokens respuesta.*`;
  }
}

export const EmailTriageTelemetryService = new EmailTriageTelemetryServiceSingleton();
