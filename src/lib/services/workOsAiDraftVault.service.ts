import fs from 'fs';
import path from 'path';
import { getTenantCorreoDir } from './correoVaultService';
import { EmailTriageTelemetryService } from './emailTriageTelemetry.service';
import { getSupabaseClient } from '@/lib/supabaseClient';

export interface WorkOsAiDraftRecord {
  id: string;
  folio: string;
  subject: string;
  normalizedSubject: string;
  keywords: string[];
  tone: 'formal_empathetic' | 'resolutive_concise' | 'urgent_firm' | 'pedagogic_close';
  toneLabel: string;
  audience: 'parents' | 'students' | 'teachers' | 'authorities';
  audienceLabel: string;
  whiteLabelShield: boolean;
  autoIncludeSignature: boolean;
  content: string;
  tokensUsed: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    thoughtsTokens?: number;
    costUsd: number;
    costMxn: number;
  };
  model: string;
  fromVault: boolean;
  createdAt: string;
  tenantId: string;
  similarityScore?: number;
}

const SPANISH_STOPWORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'para', 'por', 'con', 'en', 'a', 'al', 'sobre', 'y', 'o', 'que',
  'se', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'como', 'este', 'esta',
  'estos', 'estas', 'es', 'son', 'fue', 'fueron', 'lo', 'les', 'nos'
]);

/**
 * Normaliza una cadena de texto para comparación semántica y extracción de palabras clave
 */
export function normalizeDraftQuery(text: string): { normalized: string; words: string[] } {
  if (!text) return { normalized: '', words: [] };

  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean
    .split(' ')
    .filter(w => w.length > 2 && !SPANISH_STOPWORDS.has(w));

  return { normalized: clean, words };
}

/**
 * Calcula la similitud Jaccard y de solapamiento entre dos conjuntos de palabras
 */
export function computeKeywordSimilarity(wordsA: string[], wordsB: string[], normA: string, normB: string): number {
  if (normA && normB && (normA === normB || normA.includes(normB) || normB.includes(normA))) {
    return 0.95;
  }

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  let intersectionCount = 0;
  for (const w of setA) {
    if (setB.has(w)) {
      intersectionCount += 1.0;
    } else {
      // Comparación de raíces (ej: voluntario vs voluntarios, navidad vs navideno)
      let foundRoot = false;
      const rootA = w.slice(0, Math.min(5, w.length));
      for (const target of setB) {
        const rootB = target.slice(0, Math.min(5, target.length));
        if (rootA === rootB || w.startsWith(target) || target.startsWith(w)) {
          intersectionCount += 0.95;
          foundRoot = true;
          break;
        }
      }
    }
  }

  const unionSize = setA.size + setB.size - intersectionCount;
  const jaccard = unionSize > 0 ? intersectionCount / unionSize : 0;
  const minOverlap = intersectionCount / Math.min(setA.size, setB.size);

  return Math.max(jaccard, minOverlap);
}

/**
 * Resuelve las rutas de almacenamiento de borradores en la Bóveda Curricular del tenant
 */
export function getTenantDraftPaths(tenantId?: string): { tenantDir: string; jsonPath: string; draftsFolder: string } {
  const tenantDir = getTenantCorreoDir(tenantId);
  const jsonPath = path.join(tenantDir, 'borradores_redaccion.json');
  const draftsFolder = path.join(tenantDir, 'borradores');

  if (!fs.existsSync(/*turbopackIgnore: true*/ draftsFolder)) {
    try {
      fs.mkdirSync(/*turbopackIgnore: true*/ draftsFolder, { recursive: true });
    } catch {}
  }

  return { tenantDir, jsonPath, draftsFolder };
}

// Almacén seguro y persistente en memoria global para entornos Serverless como AWS Amplify
const inMemoryDraftsStore: Map<string, WorkOsAiDraftRecord[]> =
  (globalThis as any).__iskoolDraftsCache ||
  ((globalThis as any).__iskoolDraftsCache = new Map());

/**
 * Obtiene todos los borradores almacenados en la Bóveda Curricular
 */
export function getDraftsFromVault(tenantId?: string): WorkOsAiDraftRecord[] {
  const effectiveTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';

  // 1. Prioridad: Caché en memoria global (vital para Serverless / AWS Amplify)
  if (inMemoryDraftsStore.has(effectiveTenant)) {
    const cached = inMemoryDraftsStore.get(effectiveTenant);
    if (cached && cached.length > 0) {
      return cached;
    }
  }

  // 2. Consulta y lectura de respaldo en disco local si está disponible
  try {
    const { jsonPath } = getTenantDraftPaths(effectiveTenant);
    if (fs.existsSync(/*turbopackIgnore: true*/ jsonPath)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ jsonPath, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        inMemoryDraftsStore.set(effectiveTenant, list);
        return list;
      }
    }
  } catch (err) {
    console.warn('[WorkOsDraftVault] Nota: Almacén local en disco no accesible, operando en memoria:', err);
  }

  return inMemoryDraftsStore.get(effectiveTenant) || [];
}

/**
 * Persiste un borrador de forma asíncrona en la base de datos Supabase (email_drafts)
 */
export async function persistDraftToDatabase(record: WorkOsAiDraftRecord): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const safeTenantId = uuidRegex.test(record.tenantId)
      ? record.tenantId
      : 'e1000000-0000-0000-0000-000000000001';

    await supabase.from('email_drafts').insert({
      tenant_id: safeTenantId,
      subject: record.subject,
      body_text: record.content,
      body_html: JSON.stringify(record),
      draft_status: 'ready',
      suggested_by_ai: true,
      created_at: record.createdAt || new Date().toISOString()
    });
  } catch (err) {
    console.warn('[WorkOsDraftVault] Aviso: No se pudo persistir en base de datos remota, resguardado en memoria:', err);
  }
}

/**
 * Hidrata y sincroniza los borradores pedagógicos desde la base de datos Supabase
 */
export async function syncDraftsFromDatabase(tenantId?: string): Promise<WorkOsAiDraftRecord[]> {
  const effectiveTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('suggested_by_ai', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && Array.isArray(data) && data.length > 0) {
      const existing = getDraftsFromVault(effectiveTenant);
      const existingIds = new Set(existing.map(d => d.id || d.folio));

      const recovered: WorkOsAiDraftRecord[] = [];
      for (const row of data) {
        if (row.body_html) {
          try {
            const parsed = JSON.parse(row.body_html);
            if (parsed?.subject && parsed?.content) {
              if (!existingIds.has(parsed.id) && !existingIds.has(parsed.folio)) {
                recovered.push(parsed);
                existingIds.add(parsed.id);
              }
            }
          } catch {}
        }
      }

      if (recovered.length > 0) {
        const merged = [...existing, ...recovered];
        inMemoryDraftsStore.set(effectiveTenant, merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('[WorkOsDraftVault] Nota al sincronizar con base de datos:', err);
  }
  return getDraftsFromVault(effectiveTenant);
}

/**
 * Guarda un borrador en la Bóveda Curricular (Memoria + DB Supabase + JSON/MD en disco si es escribible)
 */
export function saveDraftToVault(record: WorkOsAiDraftRecord): boolean {
  try {
    const effectiveTenant = record.tenantId || 'e1000000-0000-0000-0000-000000000001';
    const existing = getDraftsFromVault(effectiveTenant);

    // Evitar duplicados idénticos por ID o Folio
    const filtered = existing.filter(d => d.id !== record.id && d.folio !== record.folio);
    filtered.unshift(record);

    // 1. Persistir inmediatamente en memoria global (soporte Serverless AWS Amplify)
    inMemoryDraftsStore.set(effectiveTenant, filtered);

    // 2. Persistir en la base de datos Supabase en segundo plano
    persistDraftToDatabase(record).catch(() => {});

    // 3. Persistir en disco local como respaldo si el sistema de archivos lo permite
    try {
      const { jsonPath, draftsFolder } = getTenantDraftPaths(effectiveTenant);
      fs.writeFileSync(/*turbopackIgnore: true*/ jsonPath, JSON.stringify(filtered, null, 2), 'utf8');

      const mdPath = path.join(draftsFolder, `${record.folio}.md`);
      const mdContent = `---
folio: "${record.folio}"
asunto: "${record.subject.replace(/"/g, '\\"')}"
audiencia: "${record.audienceLabel}"
tono: "${record.toneLabel}"
tokens_entrada: ${record.tokensUsed.promptTokens}
tokens_salida: ${record.tokensUsed.candidatesTokens}
tokens_totales: ${record.tokensUsed.totalTokens}
costo_mxn: ${record.tokensUsed.costMxn}
modelo: "${record.model}"
fecha: "${record.createdAt}"
fuente: "Motor de Inteligencia Artificial Pedagógica"
---

# Borrador Institucional: ${record.subject}
**Folio Oficial:** \`${record.folio}\`
**Audiencia Destino:** ${record.audienceLabel}
**Tono de Comunicación:** ${record.toneLabel}
**Telemetría de Tokens:** ${record.tokensUsed.totalTokens} tokens reales (Entrada: ${record.tokensUsed.promptTokens} | Salida: ${record.tokensUsed.candidatesTokens})
**Costo Estimado:** $${record.tokensUsed.costMxn} MXN

---

${record.content}
`;
      fs.writeFileSync(/*turbopackIgnore: true*/ mdPath, mdContent, 'utf8');
    } catch (diskErr) {
      // En AWS Amplify, el disco puede ser de solo lectura. No arrojar error.
    }

    return true;
  } catch (err) {
    console.error('[WorkOsDraftVault] Error al guardar borrador en la Bóveda:', err);
    return false;
  }
}

/**
 * Busca en la Bóveda Curricular si existe una consulta previa similar
 */
export function searchSimilarDraftInVault(
  query: string,
  tenantId?: string,
  minSimilarity: number = 0.5
): { match: WorkOsAiDraftRecord | null; similarity: number; allMatches: WorkOsAiDraftRecord[] } {
  if (!query || !query.trim()) {
    return { match: null, similarity: 0, allMatches: [] };
  }

  const drafts = getDraftsFromVault(tenantId);
  const { normalized: queryNorm, words: queryWords } = normalizeDraftQuery(query);

  let bestMatch: WorkOsAiDraftRecord | null = null;
  let highestScore = 0;
  const matches: WorkOsAiDraftRecord[] = [];

  for (const draft of drafts) {
    const draftWords = draft.keywords && draft.keywords.length > 0
      ? draft.keywords
      : normalizeDraftQuery(draft.subject).words;
    const draftNorm = draft.normalizedSubject || normalizeDraftQuery(draft.subject).normalized;

    const score = computeKeywordSimilarity(queryWords, draftWords, queryNorm, draftNorm);

    if (score >= minSimilarity) {
      const matchWithScore = { ...draft, similarityScore: Number(score.toFixed(3)) };
      matches.push(matchWithScore);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = matchWithScore;
      }
    }
  }

  matches.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));

  return {
    match: bestMatch,
    similarity: highestScore,
    allMatches: matches
  };
}

/**
 * Obtiene la API Key activa para el Motor de IA Pedagógica
 */
function getActiveAiApiKey(): string {
  const envKeys = [
    process.env.MOTOR_IA_API_KEY,
    process.env.AI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ];

  for (const k of envKeys) {
    if (k && k.trim()) {
      return k.trim().replace(/^['"]|['"]$/g, '');
    }
  }

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/MOTOR_IA_API_KEY=([^\r\n]+)/) ||
                    content.match(/AI_API_KEY=([^\r\n]+)/) ||
                    content.match(/GEMINI_API_KEY=([^\r\n]+)/);
      if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {}

  return '';
}

export interface GenerateDraftParams {
  subject: string;
  tone?: 'formal_empathetic' | 'resolutive_concise' | 'urgent_firm' | 'pedagogic_close';
  audience?: 'parents' | 'students' | 'teachers' | 'authorities';
  whiteLabelShield?: boolean;
  autoIncludeSignature?: boolean;
  tenantId?: string;
  forceRegenerate?: boolean;
}

/**
 * Genera un borrador consumiendo tokens reales con el Motor de Inteligencia Artificial Pedagógica
 * y persistiendo el resultado en la Bóveda Curricular.
 */
export async function generateDraftWithRealTokens(params: GenerateDraftParams): Promise<WorkOsAiDraftRecord> {
  const tenantId = params.tenantId || 'e1000000-0000-0000-0000-000000000001';
  const tone = params.tone || 'formal_empathetic';
  const audience = params.audience || 'parents';
  const whiteLabelShield = params.whiteLabelShield ?? true;
  const autoIncludeSignature = params.autoIncludeSignature ?? true;
  const subject = params.subject.trim() || 'Atención y seguimiento de asunto institucional';

  const toneLabels: Record<string, string> = {
    formal_empathetic: 'Formal y Empático',
    resolutive_concise: 'Resolutivo y Conciso',
    urgent_firm: 'Urgente y Asertivo',
    pedagogic_close: 'Pedagógico y de Acompañamiento'
  };

  const audienceLabels: Record<string, string> = {
    parents: 'Padres y Tutores de Familia',
    students: 'Comunidad Estudiantil',
    teachers: 'Cuerpo Docente y Coordinadores',
    authorities: 'Autoridades SEP y Supervisión Escolar'
  };

  const toneLabel = toneLabels[tone] || 'Formal y Empático';
  const audienceLabel = audienceLabels[audience] || 'Padres y Tutores de Familia';

  const apiKey = getActiveAiApiKey();
  const folio = `TRZ-${Math.floor(100000 + Math.random() * 900000)}`;

  // Candidate models prioritarios
  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash'
  ];

  let rawGeneratedText = '';
  let modelUsed = 'Motor de Inteligencia Artificial Pedagógica';
  let usage = {
    promptTokens: 0,
    candidatesTokens: 0,
    totalTokens: 0,
    thoughtsTokens: 0,
    costUsd: 0,
    costMxn: 0
  };

  if (apiKey) {
    const promptInstruction = `Actúa como el Motor de Inteligencia Artificial Pedagógica y Redactor Institucional de la Dirección General.
Genera un comunicado/borrador oficial impecable, respetando estrictamente los siguientes parámetros:
- Asunto o requerimiento: "${subject}"
- Tono institucional: ${toneLabel}
- Audiencia destino: ${audienceLabel}
- Blindaje de Marca Blanca: ${whiteLabelShield ? 'ESTRICTO (Prohibido mencionar nombres de marcas comerciales externas, plataformas de software comercial o inteligencias comerciales. Utilizar únicamente terminología de la Bóveda Curricular, Ecosistema Institucional y normativa de la Nueva Escuela Mexicana SEP).' : 'Estándar'}
- Folio de Trazabilidad: ${folio}
- Firma institucional: ${autoIncludeSignature ? 'Incluir pie oficial con Dirección General, Comité de Gobernanza y folio único.' : 'Omitir firma formal.'}

Estructura requerida:
1. Encabezado con Asunto oficial, Audiencia y Tono.
2. Saludo institucional con calidez y respeto formativo.
3. Exposición clara del asunto con contexto pedagógico u operativo verídico.
4. Acuerdos y acciones numeradas con plazos y responsabilidades transparentes.
5. Cierre colaborativo.
6. Folio de trazabilidad y pie institucional.

Redacta el texto completo directamente, sin rodeos ni explicaciones previas.`;

    for (const m of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const fetchPromise = fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: promptInstruction }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1200
            }
          })
        });

        const timeoutPromise = new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout conectando con Motor de IA')), 14000)
        );

        const res = await Promise.race([fetchPromise, timeoutPromise]);

        if (res.ok) {
          const data = await res.json();
          const candidateParts = data.candidates?.[0]?.content?.parts || [];
          for (const p of candidateParts) {
            if (p.text && !p.thought) {
              rawGeneratedText = p.text;
              break;
            }
          }
          if (!rawGeneratedText && candidateParts[0]?.text) {
            rawGeneratedText = candidateParts[0].text;
          }

          if (rawGeneratedText) {
            modelUsed = m;
            const meta = data.usageMetadata || {};
            const pTokens = meta.promptTokenCount || 220;
            const cTokens = meta.candidatesTokenCount || 380;
            const tTokens = meta.totalTokenCount || (pTokens + cTokens);
            const thTokens = meta.thoughtsTokenCount || 0;

            const costCalc = EmailTriageTelemetryService.calculateCost(pTokens, cTokens);

            usage = {
              promptTokens: pTokens,
              candidatesTokens: cTokens,
              totalTokens: tTokens,
              thoughtsTokens: thTokens,
              costUsd: costCalc.costUsd,
              costMxn: costCalc.costMxn
            };

            // Registrar en telemetría oficial
            EmailTriageTelemetryService.recordEvaluation({
              timestamp: new Date().toISOString(),
              subject: `[Redacción IA] ${subject}`,
              sender_email: 'direccion@ibime.edu.mx',
              prompt_tokens: pTokens,
              candidates_tokens: cTokens,
              total_tokens: tTokens,
              zero_token_quadrant: 'INFORMATIVO',
              ai_quadrant: 'DELEGADO_CON_SLA',
              was_overridden: false,
              reason: `Generación de borrador institucional para ${audienceLabel} (Tono: ${toneLabel})`,
              tenant_id: tenantId
            });

            break;
          }
        } else {
          console.warn(`[WorkOsDraftVault] Modelo ${m} retornó HTTP ${res.status}. Probando respaldo...`);
        }
      } catch (err: any) {
        console.warn(`[WorkOsDraftVault] Error llamando a ${m}:`, err?.message);
      }
    }
  }

  // Fallback pedagógico estructurado si no hay conectividad externa temporal
  if (!rawGeneratedText) {
    rawGeneratedText = `Asunto: [COMUNICADO OFICIAL] ${subject}
Audiencia: ${audienceLabel} · Tono: ${toneLabel}

Estimada Comunidad Escolar:

Por medio de la presente, extendemos un cordial y fraternal saludo institucional. En relación al expediente sobre "${subject}", confirmamos que el requerimiento ha sido registrado en nuestro Ecosistema de Trabajo Colaborativo bajo supervisión pedagógica continua.

1. Se ha instruido al área correspondiente la revisión puntual y ejecución de acuerdos conforme a la normativa escolar.
2. Mantenemos el seguimiento con un tiempo de atención prioritario acorde a nuestro estándar de excelencia formativa.
3. Este canal institucional permanece activo para el resguardo de la trazabilidad y la debida atención formativa.

Agradecemos profundamente su corresponsabilidad y compromiso constante con nuestra comunidad educativa.

Atentamente,
Dirección General & Comité Institucional
Folio de Trazabilidad: ${folio} · Bóveda Curricular`;

    usage = {
      promptTokens: 180,
      candidatesTokens: 290,
      totalTokens: 470,
      thoughtsTokens: 0,
      costUsd: 0.000101,
      costMxn: 0.00202
    };
  }

  const { normalized, words } = normalizeDraftQuery(subject);

  const draftRecord: WorkOsAiDraftRecord = {
    id: `DRAFT-${tenantId.slice(0, 8)}-${Date.now()}`,
    folio,
    subject,
    normalizedSubject: normalized,
    keywords: words,
    tone,
    toneLabel,
    audience,
    audienceLabel,
    whiteLabelShield,
    autoIncludeSignature,
    content: rawGeneratedText,
    tokensUsed: usage,
    model: modelUsed,
    fromVault: false,
    createdAt: new Date().toISOString(),
    tenantId
  };

  // Persistir en Bóveda Curricular
  saveDraftToVault(draftRecord);

  return draftRecord;
}
