/**
 * ============================================================================
 * ISKOOL EXECUTIVE BI & VOICE ORACLE (ANTIGRAVITY PLUS CORE)
 * ESPECIFICACIÓN TÉCNICA Y ESQUEMA DE FUNCTION CALLING EN TYPESCRIPT
 * ============================================================================
 * Proporciona:
 * 1. Tipos e interfaces de TypeScript estrictos para argumentos y resultados.
 * 2. Validadores de frontera (Boundary Validators): sanitización de SQL,
 *    detección de inyecciones, validación de UUIDs y formatos de periodo.
 * 3. Definición de Function Declarations (schemas JSON) compatibles con
 *    Function Calling de Antigravity Ultra y el Motor de IA.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. TIPOS BASE Y VALIDACIÓN DE FRONTERA
// ----------------------------------------------------------------------------

export type MetricType = 'revenue' | 'payroll' | 'enrollment' | 'ebitda';

export type TransactionCategory = 'colegiatura' | 'inscripcion' | 'servicio';
export type StudentStatus = 'activo' | 'baja' | 'moroso';
export type TransactionStatus = 'cobrado' | 'pendiente' | 'cancelado';

// Patrón UUID v4 estándar
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Patrón de periodo contable (YYYY-MM o 'current')
export const PERIOD_REGEX = /^(current|\d{4}-(0[1-9]|1[0-2]))$/;

/**
 * Validador estricto para consultas analíticas de solo lectura.
 * Solo permite SELECT o WITH (Common Table Expressions) y bloquea cualquier mutación DDL/DML.
 */
export function validateForensicQuery(sql: string): { isValid: boolean; error?: string } {
  const trimmed = sql.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'La consulta SQL analítica no puede estar vacía.' };
  }

  // Debe iniciar estrictamente con SELECT o WITH
  const startsWithRead = /^(WITH|SELECT)\b/i.test(trimmed);
  if (!startsWithRead) {
    return { 
      isValid: false, 
      error: 'Violación de frontera de seguridad: la consulta forense debe iniciar exclusivamente con SELECT o WITH.' 
    };
  }

  // Lista negra de palabras clave DDL, DML destructivo y funciones de administración
  const forbiddenPatterns = [
    /\bDROP\b/i,
    /\bDELETE\b/i,
    /\bUPDATE\b/i,
    /\bINSERT\b/i,
    /\bALTER\b/i,
    /\bTRUNCATE\b/i,
    /\bCREATE\b/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i,
    /\bEXEC\b/i,
    /\bEXECUTE\b/i,
    /--/,
    /\/\*/,
    /;\s*\S+/ // Bloquear consultas encadenadas múltiples
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(trimmed)) {
      return { 
        isValid: false, 
        error: `Violación de frontera de seguridad: se detectó el token o comando no permitido '${pattern.source}'.` 
      };
    }
  }

  return { isValid: true };
}

// ----------------------------------------------------------------------------
// 2. INTERFACES DE ARGUMENTOS Y RESPUESTAS (TYPED CONTRACTS)
// ----------------------------------------------------------------------------

// --- Herramienta 1: get_realtime_metrics ---
export interface GetRealtimeMetricsArgs {
  metric_type: MetricType;
  planteles_ids?: string[];
  periodo?: string; // Formato 'YYYY-MM' o 'current'
}

export interface MetricAggregationItem {
  plantel_id: string;
  plantel_nombre: string;
  plantel_codigo: string;
  periodo: string;
  valor: number;
  moneda: 'MXN';
  unidad: 'monto' | 'alumnos' | 'porcentaje';
  desglose?: Record<string, number>;
}

export interface GetRealtimeMetricsResponse {
  success: boolean;
  metric_type: MetricType;
  periodo_aplicado: string;
  total_consolidado: number;
  planteles_evaluados: number;
  items: MetricAggregationItem[];
  timestamp: string;
  error?: string;
}

// --- Herramienta 2: execute_forensic_query ---
export interface ExecuteForensicQueryArgs {
  sql_query: string;
  explanation: string;
}

export interface ExecuteForensicQueryResponse {
  success: boolean;
  row_count: number;
  columns: string[];
  data: Record<string, unknown>[];
  execution_time_ms: number;
  explanation: string;
  error?: string;
}

// --- Herramienta 3: read_semantic_cache ---
export interface ReadSemanticCacheArgs {
  query_text: string;
  threshold?: number; // Entre 0.85 y 1.0 (default 0.88)
}

export interface ReadSemanticCacheResponse {
  cache_hit: boolean;
  similarity?: number;
  cached_entry?: {
    id: string;
    query_normalized: string;
    sql_template: string;
    metric_snapshot: Record<string, unknown>;
    tables_involved: string[];
    last_accessed_at: string;
  };
  zero_token_response?: boolean;
}

// --- Herramienta 4: upsert_semantic_cache ---
export interface UpsertSemanticCacheArgs {
  query_text: string;
  query_vector: number[];
  sql_template: string;
  metric_snapshot: Record<string, unknown>;
  tables_involved: string[];
}

export interface UpsertSemanticCacheResponse {
  success: boolean;
  cache_id?: string;
  action: 'inserted' | 'updated';
  tables_indexed: string[];
  timestamp: string;
  error?: string;
}

// --- Herramienta 5: verify_data_integrity ---
export interface VerifyDataIntegrityArgs {
  plantel_id: string;
  periodo: string;
}

export interface VerifyDataIntegrityResponse {
  success: boolean;
  plantel_id: string;
  plantel_nombre: string;
  periodo: string;
  matricula_activa: number;
  cuota_promedio_mensual: number;
  ingresos_esperados_teoricos: number;
  ingresos_facturados_caja: number;
  cartera_vencida_morosidad: number;
  discrepancia_absoluta: number;
  porcentaje_cumplimiento: number;
  estado_auditoria: 'conciliado' | 'desviacion_critica' | 'revision_requerida';
  detalles_auditoria: string[];
  timestamp: string;
  error?: string;
}

// ----------------------------------------------------------------------------
// 3. DEFINICIONES JSON SCHEMA FORMALES PARA FUNCTION CALLING
// ----------------------------------------------------------------------------

export interface ToolFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const GET_REALTIME_METRICS_TOOL: ToolFunctionDeclaration = {
  name: 'get_realtime_metrics',
  description:
    'Extrae agregaciones directas de telemetría institucional (MRR/Facturación, Matrícula total activa, Nómina consolidada o Margen EBITDA) sin redactar consultas manuales.',
  parameters: {
    type: 'object',
    properties: {
      metric_type: {
        type: 'string',
        enum: ['revenue', 'payroll', 'enrollment', 'ebitda'],
        description: 'Tipo de indicador clave analítico a computar.'
      },
      planteles_ids: {
        type: 'array',
        items: {
          type: 'string',
          description: 'Identificador UUID de un plantel escolar específico.'
        },
        description: 'Lista opcional de UUIDs de planteles. Si se omite, consolida la red completa de colegios.'
      },
      periodo: {
        type: 'string',
        description: "Periodo fiscal o académico en formato 'YYYY-MM' o la palabra clave 'current' para el mes en curso."
      }
    },
    required: ['metric_type']
  }
};

export const EXECUTE_FORENSIC_QUERY_TOOL: ToolFunctionDeclaration = {
  name: 'execute_forensic_query',
  description:
    'Ejecuta consultas analíticas forenses avanzadas de solo lectura (iniciando estrictamente con SELECT o WITH) en la base analítica de Supabase. Prohíbe mutaciones DDL/DML.',
  parameters: {
    type: 'object',
    properties: {
      sql_query: {
        type: 'string',
        description:
          "Consulta SQL analítica de solo lectura. Debe iniciar con 'SELECT' o 'WITH'. Prohibido DROP, DELETE, UPDATE, INSERT o ALTER."
      },
      explanation: {
        type: 'string',
        description:
          'Justificación forense de la hipótesis analítica, origen de datos cruzados y lógica de correlación matemática.'
      }
    },
    required: ['sql_query', 'explanation']
  }
};

export const READ_SEMANTIC_CACHE_TOOL: ToolFunctionDeclaration = {
  name: 'read_semantic_cache',
  description:
    'Inspecciona el almacén vectorial de caché semántica para verificar si una consulta ejecutiva análoga ya fue resuelta y permanece válida (Zero-Stale-Data), permitiendo responder con 0 tokens.',
  parameters: {
    type: 'object',
    properties: {
      query_text: {
        type: 'string',
        description: 'Texto de la consulta en lenguaje natural, preguntas o comandos ejecutivos formulados por el usuario.'
      },
      threshold: {
        type: 'number',
        description: 'Umbral mínimo de similitud coseno entre 0.85 y 1.0 (predeterminado 0.88).'
      }
    },
    required: ['query_text']
  }
};

export const UPSERT_SEMANTIC_CACHE_TOOL: ToolFunctionDeclaration = {
  name: 'upsert_semantic_cache',
  description:
    'Almacena en el almacén vectorial una consulta analítica validada, su vector de embedding, la plantilla SQL ejecutada, el snapshot de métricas y las tablas dependientes para resoluciones futuras inmediatas.',
  parameters: {
    type: 'object',
    properties: {
      query_text: {
        type: 'string',
        description: 'Texto normalizado de la consulta resuelta.'
      },
      query_vector: {
        type: 'array',
        items: {
          type: 'number'
        },
        description: 'Vector numérico de embedding (dimensión 1536).'
      },
      sql_template: {
        type: 'string',
        description: 'Plantilla de la consulta SQL ejecutada.'
      },
      metric_snapshot: {
        type: 'object',
        description: 'Estructura JSON con los resultados cuantitativos y KPIs calculados.'
      },
      tables_involved: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: "Lista de nombres de tablas de las cuales depende el resultado (ej. ['matricula_alumnos', 'nomina_desglose'])."
      }
    },
    required: ['query_text', 'query_vector', 'sql_template', 'metric_snapshot', 'tables_involved']
  }
};

export const VERIFY_DATA_INTEGRITY_TOOL: ToolFunctionDeclaration = {
  name: 'verify_data_integrity',
  description:
    'Realiza una auditoría y conciliación forense estricta por plantel y periodo, comparando la matrícula activa contra los ingresos proyectados teóricos, cobros registrados en caja y morosidad.',
  parameters: {
    type: 'object',
    properties: {
      plantel_id: {
        type: 'string',
        description: 'UUID del plantel a auditar.'
      },
      periodo: {
        type: 'string',
        description: "Periodo a evaluar en formato 'YYYY-MM' o 'current'."
      }
    },
    required: ['plantel_id', 'periodo']
  }
};

/**
 * Catálogo unificado de herramientas para Function Calling en el motor de IA.
 */
export const EXECUTIVE_ORACLE_TOOLS: ToolFunctionDeclaration[] = [
  GET_REALTIME_METRICS_TOOL,
  EXECUTE_FORENSIC_QUERY_TOOL,
  READ_SEMANTIC_CACHE_TOOL,
  UPSERT_SEMANTIC_CACHE_TOOL,
  VERIFY_DATA_INTEGRITY_TOOL
];
