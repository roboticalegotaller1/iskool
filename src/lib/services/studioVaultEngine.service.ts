import fs from 'fs';
import path from 'path';
import type {
  ActivityBuilderMetadata,
  FlowConnection,
  StudioBlock,
} from '@/types/studioBlocks';
import { getVaultPlanningsDir, invalidateVaultCache } from '@/lib/vaultMarkdownEngine';

export interface StudioRelatedResource {
  title: string;
  url: string;
  provider: string;
  description: string;
  category: 'simulador' | 'referencia' | 'ejercicios' | 'boveda';
}

export interface StudioTokenTelemetry {
  fromVault: boolean;
  promptTokens: number;
  outputTokens: number;
  thoughtsTokens: number;
  totalTokens: number;
  costUsd: number;
  costMxn: number;
  fxRateMxnPerUsd: number;
  inputRateUsdPer1M: number;
  outputRateUsdPer1M: number;
  savedTokens?: number;
  savedCostMxn?: number;
  engineLabel: string;
}

export interface StudioMasterClassResult {
  metadata: ActivityBuilderMetadata;
  blocks: StudioBlock[];
  connections: FlowConnection[];
  startNodeId: string;
  relatedResources: StudioRelatedResource[];
  teacherMonitoringRubric: {
    checkpoints: string[];
    alertThresholdPercent: number;
    linkedPlanningTitle: string;
  };
  tokenTelemetry: StudioTokenTelemetry;
  vaultRelativePath: string;
  planeacionViewerUrl: string;
  persistedInVault: boolean;
  gradeLabel: string;
  cleanTopic: string;
}

// Tarifas verificadas (USD por 1 millón de tokens) y tipo de cambio real MXN/USD
const INPUT_USD_PER_1M = 0.50;
const OUTPUT_USD_PER_1M = 3.00;
const FX_MXN_PER_USD = 19.70;

const MANIFEST_START = '<!-- ISKOOL_STUDIO_MANIFEST_START';
const MANIFEST_END = 'ISKOOL_STUDIO_MANIFEST_END -->';

function slugifyKey(raw: string): string {
  return (raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 72);
}

export function parseTopicAndGrade(
  rawTopic: string,
  explicitGrade?: string,
  explicitFase?: string
): {
  cleanTopic: string;
  gradeLabel: string;
  faseNem: 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Fase 6';
  canonicalKey: string;
} {
  let text = (rawTopic || '').trim();
  let gradeLabel = (explicitGrade || '').trim();

  if (!gradeLabel) {
    const gradeRegex =
      /(?:,|\s+en\s+|\s+para\s+|\s+de\s+|\s*-\s*)?\b(1(?:er|ro|º|°)?|2(?:do|º|°)?|3(?:er|ro|º|°)?|4(?:to|º|°)?|5(?:to|º|°)?|6(?:to|º|°)?)\s*(?:grado\s*)?(?:de\s*)?(primaria|secundaria|preparatoria|bachillerato)\b/i;
    const m = text.match(gradeRegex);
    if (m) {
      const num = m[1].replace(/[^1-6]/g, '');
      const levelRaw = m[2].toLowerCase();
      const level =
        levelRaw === 'primaria'
          ? 'Primaria'
          : levelRaw === 'secundaria'
            ? 'Secundaria'
            : 'Preparatoria';
      gradeLabel = `${num}º de ${level}`;
      text = text.replace(m[0], ' ').replace(/[,\s-]+$/g, '').replace(/^[,\s-]+/g, '').trim();
    }
  }

  // Normalizar expresiones como "2do de secundaria" -> "2º de Secundaria"
  if (gradeLabel) {
    const gm = gradeLabel.match(/([1-6])(?:er|ro|do|to|º|°)?\s*(?:de\s*)?(primaria|secundaria|preparatoria|bachillerato)/i);
    if (gm) {
      const levelRaw = gm[2].toLowerCase();
      const level =
        levelRaw === 'primaria'
          ? 'Primaria'
          : levelRaw === 'secundaria'
            ? 'Secundaria'
            : 'Preparatoria';
      gradeLabel = `${gm[1]}º de ${level}`;
    }
  }

  let faseNem: 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Fase 6' = 'Fase 5';
  const gl = gradeLabel.toLowerCase();
  if (gl.includes('secundaria') || gl.includes('preparatoria') || explicitFase === 'Fase 6') {
    faseNem = 'Fase 6';
    if (!gradeLabel) gradeLabel = '2º de Secundaria';
  } else if (gl.includes('1º de primaria') || gl.includes('2º de primaria') || explicitFase === 'Fase 3') {
    faseNem = 'Fase 3';
    if (!gradeLabel) gradeLabel = '2º de Primaria';
  } else if (gl.includes('3º de primaria') || gl.includes('4º de primaria') || explicitFase === 'Fase 4') {
    faseNem = 'Fase 4';
    if (!gradeLabel) gradeLabel = '4º de Primaria';
  } else {
    faseNem = 'Fase 5';
    if (!gradeLabel) gradeLabel = '5º de Primaria';
  }

  const cleanTopic = text || rawTopic.trim();
  const canonicalKey = `${slugifyKey(cleanTopic)}__${slugifyKey(gradeLabel)}`;
  return { cleanTopic, gradeLabel, faseNem, canonicalKey };
}

function getStudioVaultDir(faseNem: string): string {
  const base = getVaultPlanningsDir();
  const safeFase = faseNem.replace(/\s+/g, '_');
  return path.join(base, 'Estudio_Interactivo', safeFase);
}

function buildInlineSvgDiagramDataUri(topic: string, gradeLabel: string, nodes: string[]): string {
  const safeTopic = topic.replace(/[<>&"]/g, '');
  const safeGrade = gradeLabel.replace(/[<>&"]/g, '');
  const labels = (nodes.length >= 4 ? nodes : ['Fundamento', 'Proceso', 'Aplicación', 'Evaluación'])
    .slice(0, 4)
    .map((n) => n.replace(/[<>&"]/g, '').slice(0, 32));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620">
    <rect width="1200" height="620" rx="24" fill="#F8FAFC"/>
    <rect x="32" y="24" width="1136" height="58" rx="16" fill="#0B1B3F"/>
    <text x="56" y="60" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">${safeTopic}</text>
    <text x="1140" y="58" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#93C5FD">${safeGrade} · NEM 2024</text>
    <line x1="250" y1="310" x2="950" y2="310" stroke="#CBD5E1" stroke-width="5" stroke-dasharray="10,8"/>
    <circle cx="600" cy="310" r="95" fill="#1E4FD8"/>
    <text x="600" y="305" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">Núcleo Conceptual</text>
    <text x="600" y="330" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="#DBEAFE">${safeTopic.slice(0, 26)}</text>
    <rect x="64" y="130" width="330" height="106" rx="18" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
    <text x="86" y="172" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="#1E3A8A">1. ${labels[0]}</text>
    <rect x="806" y="130" width="330" height="106" rx="18" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
    <text x="828" y="172" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="#065F46">2. ${labels[1]}</text>
    <rect x="64" y="400" width="330" height="106" rx="18" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2"/>
    <text x="86" y="442" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="#92400E">3. ${labels[2]}</text>
    <rect x="806" y="400" width="330" height="106" rx="18" fill="#F5F3FF" stroke="#8B5CF6" stroke-width="2"/>
    <text x="828" y="442" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" fill="#5B21B6">4. ${labels[3]}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

function resolveCuratedDiagramAndLab(topic: string, gradeLabel: string): {
  diagramImageUrl: string;
  embedUrl: string;
  embedTitle: string;
  embedInstructions: string;
  mathMode: 'quadratic_parabola' | 'linear_function' | 'coordinate_geometry' | 'fractions_visual';
  formulaExpression: string;
  relatedResources: StudioRelatedResource[];
  hotspotsDefault: Array<{ id: string; pinNumber: number; xPercent: number; yPercent: number; correctLabel: string; distractorLabels: string[]; hint: string }>;
} {
  const norm = slugifyKey(topic);
  const isQuadratic =
    norm.includes('segundo_grado') ||
    norm.includes('cuadratic') ||
    norm.includes('parabola');

  if (isQuadratic) {
    return {
      diagramImageUrl: '/images/studio/diagrama_ecuaciones_segundo_grado_2sec.webp',
      embedUrl: 'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_es.html',
      embedTitle: 'Laboratorio Interactivo PhET: Graficando Cuadráticas (Español)',
      embedInstructions:
        'Explora la pestaña "Forma Estándar" y modifica a, b y c para comprobar cómo cambia el vértice, el eje de simetría y las raíces reales en el plano cartesiano.',
      mathMode: 'quadratic_parabola',
      formulaExpression: 'y = x² - 4x + 3',
      relatedResources: [
        {
          title: 'Simulador Interactivo PhET — Graficando Cuadráticas (ES)',
          url: 'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_es.html',
          provider: 'PhET Interactive Simulations (Univ. of Colorado)',
          description: 'Manipulación directa de parábolas, vértice, foco y raíces en español.',
          category: 'simulador',
        },
        {
          title: 'Calculadora Gráfica Interactiva Desmos — Explorador ax² + bx + c',
          url: 'https://www.desmos.com/calculator?lang=es',
          provider: 'Desmos Math Lab',
          description: 'Grafica múltiples ecuaciones cuadráticas simultáneas y compara sus intersecciones.',
          category: 'simulador',
        },
        {
          title: 'GeoGebra — Funciones y Ecuaciones de Segundo Grado',
          url: 'https://www.geogebra.org/graphing?lang=es',
          provider: 'GeoGebra STEM',
          description: 'Construcción geométrica de parábolas, discriminante y tabla de valores.',
          category: 'ejercicios',
        },
        {
          title: 'Khan Academy en Español — Ecuaciones Cuadráticas y Fórmula General',
          url: 'https://es.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations',
          provider: 'Khan Academy ES',
          description: 'Lecciones paso a paso, factorización y ejercicios con comprobación inmediata.',
          category: 'referencia',
        },
      ],
      hotspotsDefault: [
        {
          id: 'hs-quad-1',
          pinNumber: 1,
          xPercent: 19,
          yPercent: 41,
          correctLabel: 'Ordenada al origen c = (0, 3)',
          distractorLabels: ['Vértice mínimo', 'Eje de simetría'],
          hint: 'El término independiente c indica el punto exacto donde la parábola corta al eje vertical Y (cuando x = 0).',
        },
        {
          id: 'hs-quad-2',
          pinNumber: 2,
          xPercent: 26,
          yPercent: 68,
          correctLabel: 'Raíz real x₁ = 1 (1, 0)',
          distractorLabels: ['Ordenada al origen', 'Discriminante nulo'],
          hint: 'Primera solución real de x² - 4x + 3 = 0. Al sustituir x = 1 se obtiene 1 - 4 + 3 = 0.',
        },
        {
          id: 'hs-quad-3',
          pinNumber: 3,
          xPercent: 33,
          yPercent: 77,
          correctLabel: 'Vértice V(2, -1) y Eje x = 2',
          distractorLabels: ['Raíz doble', 'Pendiente constante'],
          hint: 'Punto mínimo de la parábola calculado con h = -b / (2a) = 4 / 2 = 2, y k = f(2) = -1.',
        },
        {
          id: 'hs-quad-4',
          pinNumber: 4,
          xPercent: 39,
          yPercent: 68,
          correctLabel: 'Raíz real x₂ = 3 (3, 0)',
          distractorLabels: ['Vértice máximo', 'Asíntota vertical'],
          hint: 'Segunda solución real: al factorizar (x - 1)(x - 3) = 0, el segundo factor se anula en x = 3.',
        },
        {
          id: 'hs-quad-5',
          pinNumber: 5,
          xPercent: 80,
          yPercent: 64,
          correctLabel: 'Discriminante Δ = b² - 4ac',
          distractorLabels: ['Ecuación lineal', 'Pendiente secante'],
          hint: 'Si Δ > 0 hay 2 raíces reales; si Δ = 0 hay 1 raíz real doble; si Δ < 0 no corta al eje X.',
        },
      ],
    };
  }

  return {
    diagramImageUrl: buildInlineSvgDiagramDataUri(topic, gradeLabel, ['Concepto Clave', 'Procedimiento', 'Ejemplo Aplicado', 'Verificación']),
    embedUrl: 'https://www.geogebra.org/graphing?lang=es',
    embedTitle: `Laboratorio Interactivo STEM: ${topic}`,
    embedInstructions: `Utiliza el simulador interactivo para experimentar con los modelos y propiedades fundamentales de ${topic}.`,
    mathMode: 'linear_function',
    formulaExpression: 'y = 2x + 1',
    relatedResources: [
      {
        title: `Simuladores Interactivos PhET — Exploración de ${topic}`,
        url: 'https://phet.colorado.edu/es/simulations/filter',
        provider: 'PhET Interactive Simulations',
        description: 'Catálogo de laboratorios virtuales científicos y matemáticos en español.',
        category: 'simulador',
      },
      {
        title: `GeoGebra Interactivo — Modelos de ${topic}`,
        url: 'https://www.geogebra.org/graphing?lang=es',
        provider: 'GeoGebra STEM',
        description: 'Herramienta visual de experimentación y verificación paso a paso.',
        category: 'ejercicios',
      },
      {
        title: `Khan Academy en Español — Guías de ${topic}`,
        url: 'https://es.khanacademy.org/',
        provider: 'Khan Academy ES',
        description: 'Explicaciones estructuradas, videos y ejercicios autocorregibles.',
        category: 'referencia',
      },
    ],
    hotspotsDefault: [
      {
        id: 'hs-gen-1',
        pinNumber: 1,
        xPercent: 20,
        yPercent: 28,
        correctLabel: `Fundamento de ${topic}`,
        distractorLabels: ['Dato aislado', 'Error común'],
        hint: `Identifica los elementos esenciales que definen ${topic} en ${gradeLabel}.`,
      },
      {
        id: 'hs-gen-2',
        pinNumber: 2,
        xPercent: 80,
        yPercent: 28,
        correctLabel: 'Procedimiento paso a paso',
        distractorLabels: ['Adivinanza', 'Memorización'],
        hint: 'Aplica el método ordenado verificando cada transformación lógica.',
      },
      {
        id: 'hs-gen-3',
        pinNumber: 3,
        xPercent: 20,
        yPercent: 72,
        correctLabel: 'Aplicación en contexto real',
        distractorLabels: ['Teoría aislada', 'Sin relación'],
        hint: 'Conecta el modelo con problemas cotidianos de ciencia, ingeniería o vida diaria.',
      },
      {
        id: 'hs-gen-4',
        pinNumber: 4,
        xPercent: 80,
        yPercent: 72,
        correctLabel: 'Comprobación y verificación',
        distractorLabels: ['Omisión de prueba', 'Resultado sin validar'],
        hint: 'Sustituye tu respuesta en el planteamiento original para garantizar 100% de exactitud.',
      },
    ],
  };
}

/**
 * Busca primero en la Bóveda Curricular (Vault-First / 0 Tokens)
 */
export function findStudioMasterClassInVault(
  rawTopic: string,
  explicitGrade?: string,
  explicitFase?: string
): StudioMasterClassResult | null {
  const { cleanTopic, gradeLabel, faseNem, canonicalKey } = parseTopicAndGrade(
    rawTopic,
    explicitGrade,
    explicitFase
  );
  const vaultRoot = path.join(getVaultPlanningsDir(), 'Estudio_Interactivo');
  if (!fs.existsSync(vaultRoot)) return null;

  const candidateFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md') && !entry.name.startsWith('MOC_')) {
        candidateFiles.push(full);
      }
    }
  };
  walk(vaultRoot);

  const targetBase = `${canonicalKey}.md`;
  const matchedFile = candidateFiles.find((f) => path.basename(f).toLowerCase() === targetBase.toLowerCase());
  if (!matchedFile) return null;

  try {
    const rawMd = fs.readFileSync(matchedFile, 'utf8');
    const startIdx = rawMd.indexOf(MANIFEST_START);
    const endIdx = rawMd.indexOf(MANIFEST_END);
    if (startIdx === -1 || endIdx === -1) return null;

    const jsonStr = rawMd.slice(startIdx + MANIFEST_START.length, endIdx).trim();
    const manifest = JSON.parse(jsonStr);

    const relFromPlannings = path
      .relative(getVaultPlanningsDir(), matchedFile)
      .replace(/\\/g, '/');
    const viewerSlug = relFromPlannings.replace(/\.md$/i, '');

    const origTokens = Number(manifest.originalTokenTelemetry?.totalTokens || 0);
    const origMxn = Number(manifest.originalTokenTelemetry?.costMxn || 0);

    return {
      metadata: manifest.metadata,
      blocks: manifest.blocks,
      connections: manifest.connections,
      startNodeId: manifest.startNodeId || manifest.blocks?.[0]?.id || '',
      relatedResources: manifest.relatedResources || [],
      teacherMonitoringRubric: manifest.teacherMonitoringRubric || {
        checkpoints: ['Lectura y diagrama', 'Laboratorio interactivo', 'Preguntas formativas', 'Boleto 3-2-1'],
        alertThresholdPercent: 70,
        linkedPlanningTitle: manifest.metadata?.title || cleanTopic,
      },
      tokenTelemetry: {
        fromVault: true,
        promptTokens: 0,
        outputTokens: 0,
        thoughtsTokens: 0,
        totalTokens: 0,
        costUsd: 0,
        costMxn: 0,
        fxRateMxnPerUsd: FX_MXN_PER_USD,
        inputRateUsdPer1M: INPUT_USD_PER_1M,
        outputRateUsdPer1M: OUTPUT_USD_PER_1M,
        savedTokens: origTokens,
        savedCostMxn: origMxn,
        engineLabel: 'Bóveda Curricular (Caché Permanente · 0 Tokens)',
      },
      vaultRelativePath: `planeaciones/${relFromPlannings}`,
      planeacionViewerUrl: `/planeaciones/${viewerSlug}`,
      persistedInVault: true,
      gradeLabel: manifest.gradeLabel || gradeLabel,
      cleanTopic: manifest.cleanTopic || cleanTopic,
    };
  } catch (err) {
    console.warn('No se pudo hidratar clase del Estudio desde Bóveda Curricular:', err);
    return null;
  }
}

/**
 * Persiste la Clase Maestra completa en la Bóveda Curricular (.md con YAML, [[wikilinks]] y manifiesto JSON)
 */
export function saveStudioMasterClassToVault(
  result: Omit<StudioMasterClassResult, 'vaultRelativePath' | 'planeacionViewerUrl' | 'persistedInVault'>
): { vaultRelativePath: string; planeacionViewerUrl: string; persistedInVault: boolean } {
  const { cleanTopic, gradeLabel, faseNem, canonicalKey } = parseTopicAndGrade(
    result.cleanTopic,
    result.gradeLabel,
    result.metadata.faseNem
  );
  const targetDir = getStudioVaultDir(faseNem);
  fs.mkdirSync(targetDir, { recursive: true });

  const filePath = path.join(targetDir, `${canonicalKey}.md`);
  const relFromPlannings = path.relative(getVaultPlanningsDir(), filePath).replace(/\\/g, '/');
  const viewerSlug = relFromPlannings.replace(/\.md$/i, '');

  const narrativeBlock = result.blocks.find((b) => b.type === 'text_narrative') as any;
  const hotspotBlock = result.blocks.find((b) => b.type === 'interactive_hotspot_canvas') as any;
  const labBlock = result.blocks.find((b) => b.type === 'external_embed') as any;
  const quizBlocks = result.blocks.filter((b) => b.type === 'quiz_question') as any[];
  const cornellBlock = result.blocks.find((b) => b.type === 'cornell_smart_notes') as any;

  const nowIso = new Date().toISOString();
  const safeTitle = (result.metadata.title || cleanTopic).replace(/"/g, "'");
  const safePda = (result.metadata.pdaNem || '').replace(/"/g, "'");

  const manifestPayload = {
    cleanTopic,
    gradeLabel,
    faseNem,
    metadata: result.metadata,
    blocks: result.blocks,
    connections: result.connections,
    startNodeId: result.startNodeId,
    relatedResources: result.relatedResources,
    teacherMonitoringRubric: result.teacherMonitoringRubric,
    originalTokenTelemetry: result.tokenTelemetry,
    savedAt: nowIso,
  };

  const mdLines = [
    '---',
    `title: "${safeTitle}"`,
    `tema: "${cleanTopic.replace(/"/g, "'")}"`,
    `grado: "${gradeLabel}"`,
    `fase: "${faseNem}"`,
    `asignatura: "${(result.metadata.subject || 'Matemáticas').replace(/"/g, "'")}"`,
    `campo_formativo: "${(result.metadata.campoFormativo || 'Saberes y Pensamiento Científico').replace(/"/g, "'")}"`,
    `pda: "${safePda}"`,
    `origen: "Estudio ISkool · Clase Interactiva Maestra"`,
    `tokens_generacion_inicial: ${result.tokenTelemetry.totalTokens}`,
    `costo_usd_inicial: ${result.tokenTelemetry.costUsd.toFixed(6)}`,
    `costo_mxn_inicial: ${result.tokenTelemetry.costMxn.toFixed(4)}`,
    `reutilizacion_tokens: 0`,
    `fecha_creacion: "${nowIso.slice(0, 10)}"`,
    `tags:`,
    `  - estudio-interactivo`,
    `  - ${slugifyKey(faseNem)}`,
    `  - ${slugifyKey(gradeLabel)}`,
    `  - nem-2024`,
    '---',
    '',
    `# ${result.metadata.title}`,
    '',
    `> **Grado:** ${gradeLabel} · **${faseNem}** · **Campo Formativo:** ${result.metadata.campoFormativo}  `,
    `> **PDA Oficial (NEM 2024):** ${result.metadata.pdaNem}  `,
    `> **Vínculos Bóveda Curricular:** [[MOC_Estudio_Interactivo]] · [[${result.metadata.campoFormativo}]] · [[${gradeLabel}]]`,
    '',
    '## 1. Explicación de la Clase Maestra',
    '',
    narrativeBlock?.data?.content || result.metadata.description,
    '',
    '## 2. Diagrama Pedagógico y Puntos Clave',
    '',
    hotspotBlock?.data?.diagramImageUrl && !String(hotspotBlock.data.diagramImageUrl).startsWith('data:')
      ? `![${hotspotBlock.data.diagramTitle || cleanTopic}](${hotspotBlock.data.diagramImageUrl})`
      : `_Diagrama interactivo vectorial incrustado en el Estudio ISkool._`,
    '',
    ...((hotspotBlock?.data?.hotspots || []).map(
      (h: any) => `- **#${h.pinNumber} · ${h.correctLabel}:** ${h.hint}`
    )),
    '',
    '## 3. Laboratorios Interactivos y Páginas Relacionadas',
    '',
    labBlock?.data?.embedUrl
      ? `- **Laboratorio Principal:** [${labBlock.data.resourceTitle}](${labBlock.data.embedUrl}) — ${labBlock.data.instructions}`
      : '',
    ...result.relatedResources.map(
      (r) => `- **[${r.title}](${r.url})** (${r.provider}): ${r.description}`
    ),
    '',
    '## 4. Preguntas Formativas y Solucionario Verificado',
    '',
    ...quizBlocks.flatMap((q, i) => [
      `### Reactivo ${i + 1}: ${q.data.question}`,
      ...(q.data.options || []).map(
        (opt: string, oIdx: number) => `- ${oIdx === q.data.correctIndex ? '**[Correcta]** ' : ''}${opt}`
      ),
      `> **Explicación pedagógica:** ${q.data.explanation || ''}`,
      '',
    ]),
    '## 5. Apuntes Cornell y Monitoreo Docente',
    '',
    ...((cornellBlock?.data?.keyCuesPrompts || []).map((p: string) => `- **Pregunta guía:** ${p}`)),
    `- **Indicadores de Monitoreo en Vivo:** ${result.teacherMonitoringRubric.checkpoints.join(' · ')}`,
    `- **Telemetría Inicial:** ${result.tokenTelemetry.totalTokens} tokens (\$${result.tokenTelemetry.costMxn.toFixed(4)} MXN) — **Reutilización futura: 0 tokens (\$0.00 MXN)**.`,
    '',
    MANIFEST_START,
    JSON.stringify(manifestPayload),
    MANIFEST_END,
    '',
  ];

  fs.writeFileSync(filePath, mdLines.join('\n'), 'utf8');

  // Actualizar Índice Maestro (MOC) de Estudio Interactivo
  const mocPath = path.join(getVaultPlanningsDir(), 'Estudio_Interactivo', 'MOC_Estudio_Interactivo.md');
  const mocLink = `- [[${viewerSlug}|${result.metadata.title} (${gradeLabel})]] — ${result.blocks.length} bloques interactivos · 0 tokens en reuso`;
  if (!fs.existsSync(mocPath)) {
    const header = [
      '---',
      'title: "MOC · Estudio Interactivo ISkool (Bóveda Curricular)"',
      'tags: [moc, estudio-interactivo, nem-2024]',
      '---',
      '',
      '# Índice Maestro — Clases Interactivas del Estudio ISkool',
      '',
      mocLink,
      '',
    ].join('\n');
    fs.writeFileSync(mocPath, header, 'utf8');
  } else {
    const existingMoc = fs.readFileSync(mocPath, 'utf8');
    if (!existingMoc.includes(`[[${viewerSlug}|`)) {
      fs.appendFileSync(mocPath, `${mocLink}\n`, 'utf8');
    }
  }

  invalidateVaultCache();

  return {
    vaultRelativePath: `planeaciones/${relFromPlannings}`,
    planeacionViewerUrl: `/planeaciones/${viewerSlug}`,
    persistedInVault: true,
  };
}

/**
 * Genera una Clase Interactiva Maestra completa con Tokens Reales y la resguarda en Bóveda Curricular.
 */
export async function generateOrFetchStudioMasterClass(params: {
  topic: string;
  grade?: string;
  faseNem?: string;
  gamificationStyle?: 'rpg_adventure' | 'escape_room' | 'scientific_expedition' | 'olympic_tournament';
  language?: string;
  forceRegenerate?: boolean;
}): Promise<StudioMasterClassResult> {
  const { cleanTopic, gradeLabel, faseNem } = parseTopicAndGrade(
    params.topic,
    params.grade,
    params.faseNem
  );
  const language = params.language || 'Español';
  const gamificationStyle = params.gamificationStyle || 'rpg_adventure';

  // 1. VAULT-FIRST (0 TOKENS): Si ya existe en Bóveda Curricular y no se fuerza regeneración
  if (!params.forceRegenerate) {
    const cached = findStudioMasterClassInVault(cleanTopic, gradeLabel, faseNem);
    if (cached) {
      return cached;
    }
  }

  const curated = resolveCuratedDiagramAndLab(cleanTopic, gradeLabel);
  const apiKey = process.env.MOTOR_IA_API_KEY || process.env.AI_API_KEY || '';

  const masterPrompt = `Eres un Diseñador Instruccional Senior y Especialista en Pedagogía NEM 2024 (SEP México) de clase mundial.
Debes crear una CLASE INTERACTIVA MAESTRA completa y rigurosa en ${language} para:
- Tema: "${cleanTopic}"
- Grado escolar: "${gradeLabel}" (${faseNem})
- Dinámica: "${gamificationStyle}"

REQUISITOS DE MÁXIMO RIGOR PEDAGÓGICO (ESTÁNDARES INTERNACIONALES):
1. Explicación de clase maestra completa (350–500 palabras bien estructuradas con subtítulos): definición formal exacta, por qué importa en la vida real, ejemplo numérico o práctico resuelto paso a paso, y 2 errores frecuentes que cometen los alumnos y cómo evitarlos.
2. Puntos clave para el diagrama interactivo (4 o 5 conceptos exactos con pistas pedagógicas precisas).
3. Reto para laboratorio interactivo STEM (expresión matemática/modelo exacto, pregunta guía y verificación).
4. Secuencia didáctica lógica de 4 pasos exactos para resolver/aplicar el tema.
5. Emparejamiento conceptual de 4 pares (concepto ↔ definición/fórmula/resultado real).
6. Exactamente 3 preguntas formativas de nivel creciente (Comprensión, Aplicación numérica/práctica, Análisis crítico) con 4 opciones verosímiles cada una y explicación didáctica detallada de por qué la correcta es correcta y qué error representa el distractor principal.
7. Apuntes Cornell (3 preguntas guía, 5 palabras clave verificadas, plantilla de síntesis).
8. Boleto de salida metacognitivo 3-2-1 para monitoreo docente en tiempo real.
9. Duelo de saberes temático (nombre creativo del jefe + 140 HP) y recompensa gamificada (XP, monedas, título de maestría).
10. Marca blanca estricta: no menciones marcas comerciales externas de IA ni software privativo.

Responde EXCLUSIVAMENTE con JSON válido siguiendo este esquema exacto:
{
  "title": "Título atractivo de la clase",
  "description": "Resumen pedagógico en 2 líneas",
  "subject": "Asignatura exacta (ej. Matemáticas)",
  "campoFormativo": "Saberes y Pensamiento Científico | Lenguajes | Ética, Naturaleza y Sociedades | De lo Humano y lo Comunitario",
  "pdaNem": "PDA oficial NEM 2024 redactado formalmente para ${gradeLabel}",
  "masterExplanation": "Explicación magistral completa con estructura clara, ejemplo paso a paso y errores frecuentes",
  "diagramTitle": "Título del diagrama interactivo",
  "diagramInstructions": "Instrucción clara para explorar los puntos del diagrama",
  "hotspots": [
    { "label": "Etiqueta exacta", "hint": "Explicación pedagógica concisa", "distractors": ["Distractor 1", "Distractor 2"] }
  ],
  "mathLabChallengeTitle": "Título del laboratorio interactivo",
  "mathLabFormula": "Expresión principal (ej. y = x² - 4x + 3)",
  "mathLabPrompt": "Consigna concreta para experimentar en el graficador",
  "orderingInstructions": "Instrucción para ordenar el algoritmo o proceso",
  "orderingSteps": ["Paso 1 exacto", "Paso 2 exacto", "Paso 3 exacto", "Paso 4 exacto"],
  "matchingInstructions": "Instrucción para emparejar conceptos",
  "matchingPairs": [
    { "left": "Concepto 1", "right": "Definición o resultado 1" },
    { "left": "Concepto 2", "right": "Definición o resultado 2" },
    { "left": "Concepto 3", "right": "Definición o resultado 3" },
    { "left": "Concepto 4", "right": "Definición o resultado 4" }
  ],
  "questions": [
    {
      "level": "Comprensión",
      "question": "Enunciado riguroso",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0,
      "explanation": "Explicación paso a paso"
    }
  ],
  "cornellCues": ["Pregunta guía 1", "Pregunta guía 2", "Pregunta guía 3"],
  "cornellKeywords": ["Palabra 1", "Palabra 2", "Palabra 3", "Palabra 4", "Palabra 5"],
  "cornellTemplate": "Guía breve para síntesis de libreta",
  "exitTicketPrompt": "Pregunta de cierre 3-2-1 para monitoreo docente",
  "bossName": "Nombre temático del reto final",
  "badgeName": "Insignia de Maestría"
}`;

  const endpoints = [
    {
      url: Buffer.from('aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMy4xLWZsYXNoLWxpdGUtcHJldmlldzpnZW5lcmF0ZUNvbnRlbnQ=', 'base64').toString('ascii'),
      inputRate: 0.25,
      outputRate: 1.50,
    },
    {
      url: Buffer.from('aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMy41LWZsYXNoLWxpdGU6Z2VuZXJhdGVDb250ZW50', 'base64').toString('ascii'),
      inputRate: 0.30,
      outputRate: 2.50,
    },
    {
      url: Buffer.from('aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMy1mbGFzaC1wcmV2aWV3OmdlbmVyYXRlQ29udGVudA==', 'base64').toString('ascii'),
      inputRate: 0.50,
      outputRate: 3.00,
    },
    {
      url: Buffer.from('aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMy4xLWZsYXNoLWxpdGU6Z2VuZXJhdGVDb250ZW50', 'base64').toString('ascii'),
      inputRate: 0.25,
      outputRate: 1.50,
    },
    {
      url: Buffer.from('aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktZmxhc2gtbGF0ZXN0OmdlbmVyYXRlQ29udGVudA==', 'base64').toString('ascii'),
      inputRate: 0.50,
      outputRate: 3.00,
    },
  ];

  let parsedAi: any = null;
  let promptTokens = 0;
  let outputTokens = 0;
  let thoughtsTokens = 0;
  let totalTokens = 0;
  let usedInputRate = INPUT_USD_PER_1M;
  let usedOutputRate = OUTPUT_USD_PER_1M;
  let engineLabel = 'Motor de IA Pedagógica (Tokens Reales)';

  if (apiKey) {
    const raceController = new AbortController();
    const raceTimeout = setTimeout(() => raceController.abort(), 30000);
    try {
      const winner = await Promise.any(
        endpoints.slice(0, 3).map(async (ep) => {
          const res = await fetch(ep.url, {
            method: 'POST',
            signal: raceController.signal,
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: masterPrompt }] }],
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
              },
            }),
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          const usage = data.usageMetadata || {};
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawText = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const firstBrace = rawText.indexOf('{');
          const lastBrace = rawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            rawText = rawText.slice(firstBrace, lastBrace + 1);
          }
          const json = JSON.parse(rawText);
          if (!json || !json.masterExplanation || !Array.isArray(json.questions)) {
            throw new Error('Esquema incompleto');
          }
          return { json, usage, ep };
        })
      );
      raceController.abort();
      parsedAi = winner.json;
      promptTokens = Number(winner.usage.promptTokenCount || 0);
      outputTokens = Number(winner.usage.candidatesTokenCount || 0);
      thoughtsTokens = Number(winner.usage.thoughtsTokenCount || 0);
      totalTokens = Number(winner.usage.totalTokenCount || promptTokens + outputTokens + thoughtsTokens);
      usedInputRate = winner.ep.inputRate;
      usedOutputRate = winner.ep.outputRate;
    } catch (err) {
      console.warn('Motor IA en Studio (carrera hedged):', err instanceof Error ? err.message : err);
    } finally {
      clearTimeout(raceTimeout);
    }
  }

  // Fallback estructurado de alta precisión solo si la red/API no estuviera disponible
  if (!parsedAi) {
    engineLabel = 'Motor Pedagógico Determinista de Respaldo (0 Tokens)';
    parsedAi = {
      title: `Clase Maestra Interactiva: ${cleanTopic} (${gradeLabel})`,
      description: `Secuencia integral NEM 2024 con explicación guiada, diagrama interactivo, laboratorio STEM, preguntas formativas y monitoreo docente sobre ${cleanTopic}.`,
      subject: slugifyKey(cleanTopic).includes('ecuacion') ? 'Matemáticas' : 'Saberes y Pensamiento Científico',
      campoFormativo: 'Saberes y Pensamiento Científico',
      pdaNem: `Resuelve y modela problemas relacionados con ${cleanTopic} en ${gradeLabel}, interpretando sus representaciones algebraicas y gráficas.`,
      masterExplanation: `## ¿Qué es ${cleanTopic}?\nUna ecuación de segundo grado (o cuadrática) tiene la forma general ax² + bx + c = 0 con a ≠ 0. Su gráfica en el plano cartesiano es una parábola.\n\n## Ejemplo resuelto paso a paso\nResolvamos x² - 4x + 3 = 0:\n1. Identificamos coeficientes: a = 1, b = -4, c = 3.\n2. Calculamos el discriminante Δ = (-4)² - 4(1)(3) = 16 - 12 = 4 (> 0, hay 2 soluciones reales).\n3. Aplicamos la fórmula general x = (4 ± √4) / 2 = (4 ± 2) / 2.\n4. Obtenemos x₁ = 1 y x₂ = 3; vértice en V(2, -1).\n\n## Errores frecuentes a evitar\n- Olvidar el signo negativo de -b cuando b ya es negativo.\n- Dividir solo la raíz entre 2a en lugar de toda la expresión (-b ± √Δ).`,
      diagramTitle: `Diagrama Anatómico: ${cleanTopic}`,
      diagramInstructions: 'Haz clic en cada pin numerado sobre el diagrama para inspeccionar vértice, raíces, ordenada al origen y discriminante.',
      hotspots: curated.hotspotsDefault.map((h) => ({ label: h.correctLabel, hint: h.hint, distractors: h.distractorLabels })),
      mathLabChallengeTitle: `Laboratorio Graficador: ${cleanTopic}`,
      mathLabFormula: curated.formulaExpression,
      mathLabPrompt: 'Ajusta los coeficientes a, b y c para observar cómo cambia el discriminante Δ y ubica el vértice y las raíces de y = x² - 4x + 3.',
      orderingInstructions: `Ordena el algoritmo correcto para resolver una ecuación de ${cleanTopic}:`,
      orderingSteps: [
        'Escribir la ecuación en su forma general ax² + bx + c = 0 e identificar a, b y c.',
        'Calcular el discriminante Δ = b² - 4ac para conocer el número de soluciones reales.',
        'Sustituir los coeficientes en la fórmula general x = (-b ± √Δ) / (2a) o factorizar.',
        'Comprobar x₁ y x₂ sustituyendo en la ecuación original y verificar en la gráfica.',
      ],
      matchingInstructions: 'Relaciona cada elemento de la ecuación cuadrática con su significado geométrico o algebraico:',
      matchingPairs: [
        { left: 'Discriminante Δ > 0', right: 'La parábola corta al eje X en 2 raíces reales distintas' },
        { left: 'Vértice V(-b/2a, f(h))', right: 'Punto mínimo o máximo y eje de simetría de la parábola' },
        { left: 'Término independiente c', right: 'Ordenada al origen donde la gráfica cruza el eje Y (0, c)' },
        { left: 'Coeficiente principal a', right: 'Define si la parábola abre hacia arriba (a>0) o abajo (a<0)' },
      ],
      questions: [
        {
          level: 'Comprensión',
          question: 'En la ecuación x² - 4x + 3 = 0, ¿cuál es el valor del discriminante Δ = b² - 4ac y qué indica?',
          options: [
            'Δ = 4; indica que existen 2 soluciones reales distintas',
            'Δ = -4; indica que no tiene soluciones reales',
            'Δ = 0; indica una única raíz doble',
            'Δ = 28; indica una recta lineal',
          ],
          correctIndex: 0,
          explanation: 'Δ = (-4)² - 4(1)(3) = 16 - 12 = 4 > 0, por lo tanto la parábola cruza el eje X en dos puntos (x₁ = 1, x₂ = 3).',
        },
        {
          level: 'Aplicación',
          question: 'Un jardín rectangular mide (x + 2) metros de largo y x metros de ancho. Si su área es 24 m², ¿cuál es el valor positivo de x?',
          options: ['x = 4 metros', 'x = 6 metros', 'x = 3 metros', 'x = 8 metros'],
          correctIndex: 0,
          explanation: 'Planteamos x(x + 2) = 24 ⇒ x² + 2x - 24 = 0 ⇒ (x + 6)(x - 4) = 0. Como una longitud es positiva, x = 4 m.',
        },
        {
          level: 'Análisis',
          question: '¿Qué ocurre con la parábola y = ax² + bx + c cuando cambiamos el signo de "a" de positivo a negativo?',
          options: [
            'Invierte su concavidad y pasa de abrir hacia arriba (mínimo) a abrir hacia abajo (máximo)',
            'Se convierte en una línea recta horizontal',
            'Desaparece su ordenada al origen c',
            'Siempre aumenta el número de soluciones reales a 3',
          ],
          correctIndex: 0,
          explanation: 'El signo de "a" determina la concavidad: si a > 0 abre hacia arriba; si a < 0 abre hacia abajo.',
        },
      ],
      cornellCues: [
        '¿Cómo determina el discriminante Δ el número de soluciones reales?',
        '¿Qué relación existe entre las raíces algebraicas y las intersecciones con el eje X?',
        '¿En qué situaciones de física o arquitectura se modela una trayectoria parabólica?',
      ],
      cornellKeywords: ['Forma general ax²+bx+c=0', 'Discriminante Δ', 'Vértice', 'Fórmula general', 'Factorización'],
      cornellTemplate: 'Resume en 3 líneas cómo identificar a, b y c, calcular Δ y comprobar tus soluciones en la gráfica.',
      exitTicketPrompt: `Boleto de Salida 3-2-1 · ${cleanTopic} (${gradeLabel}): evalúa tu nivel de dominio y escribe una aplicación práctica.`,
      bossName: 'Guardián de la Parábola Cuadrática',
      badgeName: `Maestro en ${cleanTopic}`,
    };
  }

  // Cálculo transparente y exacto en USD y MXN (output incluye reasoning/thoughts tokens)
  const billableOutputTokens = outputTokens + thoughtsTokens;
  const costUsd = (promptTokens * usedInputRate + billableOutputTokens * usedOutputRate) / 1_000_000;
  const costMxn = costUsd * FX_MXN_PER_USD;

  const ts = Date.now();
  const hotspots = curated.hotspotsDefault.map((defPin, idx) => {
    const aiPin = Array.isArray(parsedAi.hotspots) ? parsedAi.hotspots[idx] : null;
    return {
      id: defPin.id,
      pinNumber: idx + 1,
      xPercent: defPin.xPercent,
      yPercent: defPin.yPercent,
      correctLabel: aiPin?.label || defPin.correctLabel,
      distractorLabels: Array.isArray(aiPin?.distractors) && aiPin.distractors.length > 0 ? aiPin.distractors : defPin.distractorLabels,
      hint: aiPin?.hint || defPin.hint,
    };
  });

  const blocks: StudioBlock[] = [
    {
      id: `node-class-${ts}-1`,
      type: 'text_narrative',
      title: `1. Clase Maestra: ${cleanTopic}`,
      badgeLabel: 'EXPLICACIÓN DE CLASE',
      isStartNode: true,
      position: { x: 60, y: 120 },
      data: {
        content: parsedAi.masterExplanation,
        style: 'instruction',
        speakerName: `Guía Docente · ${gradeLabel}`,
      },
    },
    {
      id: `node-diagram-${ts}-2`,
      type: 'interactive_hotspot_canvas',
      title: `2. Diagrama Interactivo: ${cleanTopic}`,
      badgeLabel: 'DIAGRAMA VISUAL',
      position: { x: 390, y: 120 },
      data: {
        diagramTitle: parsedAi.diagramTitle || `Diagrama Pedagógico: ${cleanTopic}`,
        diagramImageUrl: curated.diagramImageUrl,
        instructions: parsedAi.diagramInstructions || 'Explora los puntos numerados del diagrama para dominar cada concepto.',
        hotspots,
      },
    },
    {
      id: `node-mathlab-${ts}-3`,
      type: 'interactive_whiteboard_math',
      title: `3. Laboratorio Graficador STEM`,
      badgeLabel: 'LABORATORIO EN VIVO',
      position: { x: 720, y: 120 },
      data: {
        challengeTitle: parsedAi.mathLabChallengeTitle || `Explorador Interactivo: ${cleanTopic}`,
        mathMode: curated.mathMode,
        formulaExpression: parsedAi.mathLabFormula || curated.formulaExpression,
        targetSlopeM: 2,
        targetInterceptB: 1,
        targetCoordinate: { x: 2, y: -1 },
        promptQuestion: parsedAi.mathLabPrompt || 'Experimenta con los parámetros y verifica las soluciones en el plano.',
        tolerance: 0.5,
      },
    },
    {
      id: `node-sim-${ts}-4`,
      type: 'external_embed',
      title: `4. Simulador Interactivo y Recursos`,
      badgeLabel: 'LABORATORIO EXTERNO',
      position: { x: 1050, y: 120 },
      data: {
        embedUrl: curated.embedUrl,
        resourceTitle: curated.embedTitle,
        instructions: curated.embedInstructions,
      },
    },
    {
      id: `node-order-${ts}-5`,
      type: 'ordering_sequence',
      title: `5. Algoritmo Paso a Paso`,
      badgeLabel: 'SECUENCIA LÓGICA',
      position: { x: 60, y: 380 },
      data: {
        instructions: parsedAi.orderingInstructions || `Ordena los pasos para resolver ${cleanTopic}:`,
        stepsInCorrectOrder:
          Array.isArray(parsedAi.orderingSteps) && parsedAi.orderingSteps.length >= 3
            ? parsedAi.orderingSteps
            : ['Identificar datos', 'Plantear modelo', 'Resolver operación', 'Comprobar resultado'],
        randomizeStart: true,
      },
    },
    {
      id: `node-match-${ts}-6`,
      type: 'drag_drop_match',
      title: `6. Mapa de Conceptos Clave`,
      badgeLabel: 'EMPAREJAMIENTO',
      position: { x: 390, y: 380 },
      data: {
        instructions: parsedAi.matchingInstructions || 'Relaciona cada concepto con su definición exacta.',
        pairs:
          Array.isArray(parsedAi.matchingPairs) && parsedAi.matchingPairs.length >= 3
            ? parsedAi.matchingPairs.slice(0, 4)
            : [
                { left: 'Forma general', right: 'ax² + bx + c = 0' },
                { left: 'Discriminante', right: 'b² - 4ac' },
                { left: 'Vértice', right: 'Punto mínimo o máximo' },
              ],
        timeLimitSeconds: 90,
      },
    },
  ];

  // Agregar las preguntas formativas graduadas (Bloom)
  const aiQuestions = Array.isArray(parsedAi.questions) ? parsedAi.questions.slice(0, 3) : [];
  aiQuestions.forEach((q: any, qIdx: number) => {
    blocks.push({
      id: `node-quiz-${ts}-${7 + qIdx}`,
      type: 'quiz_question',
      title: `${7 + qIdx}. Reactivo ${q.level || 'Formativo'}`,
      badgeLabel: `PREGUNTA ${qIdx + 1}`,
      position: { x: 720 + qIdx * 330, y: 380 },
      data: {
        question: q.question,
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || '',
        timeLimitSeconds: 60,
      },
    });
  });

  // Apuntes Cornell + Boleto de Salida 3-2-1 (Monitoreo Docente) + Boss + Recompensa
  const nextNum = blocks.length + 1;
  blocks.push(
    {
      id: `node-cornell-${ts}-${nextNum}`,
      type: 'cornell_smart_notes',
      title: `${nextNum}. Apuntes Cornell y Páginas Relacionadas`,
      badgeLabel: 'LIBRETA & RECURSOS',
      position: { x: 60, y: 640 },
      data: {
        topicTitle: `${cleanTopic} · ${gradeLabel}`,
        notebookPageNumber: 42,
        keyCuesPrompts: Array.isArray(parsedAi.cornellCues) ? parsedAi.cornellCues : ['¿Cuál es el concepto central?'],
        guidedNotesTemplate: `${parsedAi.cornellTemplate || ''}\n\nRecursos verificados: ${curated.relatedResources.map((r) => `${r.title} (${r.url})`).join(' · ')}`,
        requiredSummaryKeywords: Array.isArray(parsedAi.cornellKeywords) ? parsedAi.cornellKeywords : [cleanTopic],
        autoStampOnCompletion: true,
      },
    },
    {
      id: `node-exit-${ts}-${nextNum + 1}`,
      type: 'exit_ticket_reflection',
      title: `${nextNum + 1}. Boleto 3-2-1 (Monitoreo Docente)`,
      badgeLabel: 'MONITOREO EN VIVO',
      position: { x: 390, y: 640 },
      data: {
        closurePrompt: parsedAi.exitTicketPrompt || `Reflexión 3-2-1 sobre ${cleanTopic} (${gradeLabel})`,
        requireThreeLearnings: true,
        requireTwoQuestions: true,
        requireOneApplication: true,
        expectedCoreConcepts: Array.isArray(parsedAi.cornellKeywords) ? parsedAi.cornellKeywords : [cleanTopic],
        enableTrafficLightSelfCheck: true,
      },
    },
    {
      id: `node-boss-${ts}-${nextNum + 2}`,
      type: 'boss_enemy',
      title: `${nextNum + 2}. Duelo Final de Maestría`,
      badgeLabel: 'EVALUACIÓN GAMIFICADA',
      position: { x: 720, y: 640 },
      data: {
        bossName: parsedAi.bossName || `Desafío Supremo: ${cleanTopic}`,
        spriteKey: 'cyber_brux',
        maxHp: 140,
        attackPower: 25,
        victoryCondition: 'defeat_boss',
        backgroundScene: 'temple',
      },
    },
    {
      id: `node-reward-${ts}-${nextNum + 3}`,
      type: 'reward_chest',
      title: `${nextNum + 3}. Cofre de Maestría Curricular`,
      badgeLabel: 'RECOMPENSA XP',
      position: { x: 1050, y: 640 },
      data: {
        xpAmount: 350,
        coinsAmount: 180,
        badgeUnlockId: `badge-${slugifyKey(cleanTopic)}`,
        badgeName: parsedAi.badgeName || `Dominio: ${cleanTopic}`,
        badgeIcon: '🏆',
        chestRarity: 'legendary',
      },
    }
  );

  const connections: FlowConnection[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    connections.push({
      id: `conn-master-${ts}-${i + 1}`,
      sourceNodeId: blocks[i].id,
      targetNodeId: blocks[i + 1].id,
      label: i === blocks.length - 2 ? 'success' : 'next',
    });
  }

  const metadata: ActivityBuilderMetadata = {
    title: parsedAi.title || `Clase Maestra: ${cleanTopic} (${gradeLabel})`,
    description: parsedAi.description || `Experiencia educativa integral NEM 2024 sobre ${cleanTopic}.`,
    subject: parsedAi.subject || 'Matemáticas',
    targetAge: gradeLabel,
    campoFormativo: parsedAi.campoFormativo || 'Saberes y Pensamiento Científico',
    faseNem,
    pdaNem: parsedAi.pdaNem || `Domina y aplica ${cleanTopic} en ${gradeLabel} conforme a la NEM 2024.`,
    totalTimeLimit: 1800,
    livesCount: 3,
    streakMultiplier: true,
    language,
  };

  const tokenTelemetry: StudioTokenTelemetry = {
    fromVault: false,
    promptTokens,
    outputTokens,
    thoughtsTokens,
    totalTokens,
    costUsd: Number(costUsd.toFixed(6)),
    costMxn: Number(costMxn.toFixed(4)),
    fxRateMxnPerUsd: FX_MXN_PER_USD,
    inputRateUsdPer1M: usedInputRate,
    outputRateUsdPer1M: usedOutputRate,
    engineLabel,
  };

  const teacherMonitoringRubric = {
    checkpoints: [
      'Lectura de Clase Maestra',
      'Exploración de Diagrama Interactivo',
      'Práctica en Laboratorio STEM',
      'Reactivos Formativos (3 niveles Bloom)',
      'Apuntes Cornell + Boleto 3-2-1 en Vivo',
    ],
    alertThresholdPercent: 70,
    linkedPlanningTitle: metadata.title,
  };

  const baseResult = {
    metadata,
    blocks,
    connections,
    startNodeId: blocks[0].id,
    relatedResources: curated.relatedResources,
    teacherMonitoringRubric,
    tokenTelemetry,
    gradeLabel,
    cleanTopic,
  };

  // 2. PERSISTENCIA INMEDIATA EN BÓVEDA CURRICULAR (para que futuras peticiones cuesten 0 tokens)
  const vaultSaved = saveStudioMasterClassToVault(baseResult);

  return {
    ...baseResult,
    ...vaultSaved,
  };
}
