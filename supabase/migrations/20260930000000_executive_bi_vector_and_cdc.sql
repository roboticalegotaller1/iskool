-- ============================================================================
-- ISKOOL EXECUTIVE BI & VOICE ORACLE (ANTIGRAVITY PLUS CORE)
-- MIGRACIÓN DDL / DML: CAPA ANALÍTICA, ÍNDICES VECTORIALES & MOTOR CDC
-- ============================================================================
-- Arquitectura de Datos:
-- 1. Extensiones: uuid-ossp y vector (pgvector).
-- 2. Tablas Maestras Analíticas: planteles, matricula_alumnos, nomina_desglose, transacciones_caja.
-- 3. Motor de Caché Semántico: bi_semantic_cache con vector(1536).
-- 4. Indexación Forense: HNSW (vector_cosine_ops) e Índices B-Tree Compuestos.
-- 5. Change Data Capture (CDC): Invalidation Trigger (Zero-Stale-Data).
-- 6. RPC Transaccional: match_bi_cache para búsqueda semántica e inferencia en 0 tokens.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONES DEL SISTEMA
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ----------------------------------------------------------------------------
-- 2. TABLAS MAESTRAS ANALÍTICAS (IDEMPOTENTES)
-- ----------------------------------------------------------------------------

-- Tabla: planteles
CREATE TABLE IF NOT EXISTS public.planteles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    estado_operativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabla: matricula_alumnos
CREATE TABLE IF NOT EXISTS public.matricula_alumnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plantel_id UUID NOT NULL REFERENCES public.planteles(id) ON DELETE CASCADE,
    estatus VARCHAR(20) NOT NULL CHECK (estatus IN ('activo', 'baja', 'moroso')),
    ciclo_escolar VARCHAR(20) NOT NULL,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Tabla: nomina_desglose
CREATE TABLE IF NOT EXISTS public.nomina_desglose (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plantel_id UUID NOT NULL REFERENCES public.planteles(id) ON DELETE CASCADE,
    periodo VARCHAR(50) NOT NULL,
    total_sueldos NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total_sueldos >= 0),
    total_prestaciones NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total_prestaciones >= 0),
    dispersado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_dispersion TIMESTAMPTZ
);

-- Tabla: transacciones_caja
CREATE TABLE IF NOT EXISTS public.transacciones_caja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plantel_id UUID NOT NULL REFERENCES public.planteles(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('colegiatura', 'inscripcion', 'servicio')),
    monto NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (monto >= 0),
    estatus VARCHAR(20) NOT NULL CHECK (estatus IN ('cobrado', 'pendiente', 'cancelado')),
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. MOTOR DE CACHÉ SEMÁNTICO (BI SEMANTIC CACHE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bi_semantic_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_normalized TEXT NOT NULL,
    query_vector VECTOR(1536) NOT NULL,
    sql_template TEXT NOT NULL,
    metric_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    tables_involved TEXT[] NOT NULL DEFAULT '{}'::text[],
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ----------------------------------------------------------------------------
-- 4. ÍNDICES DE BÚSQUEDA FORENSE Y ALTO RENDIMIENTO
-- ----------------------------------------------------------------------------

-- Índice Vectorial HNSW en bi_semantic_cache con métrica de distancia coseno
CREATE INDEX IF NOT EXISTS idx_bi_semantic_cache_vector_hnsw 
ON public.bi_semantic_cache 
USING hnsw (query_vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índice auxiliar para acelerar el filtrado de validez en caché
CREATE INDEX IF NOT EXISTS idx_bi_semantic_cache_is_valid 
ON public.bi_semantic_cache (is_valid) 
WHERE is_valid = TRUE;

-- Índices B-Tree Compuestos para analítica forense instantánea
CREATE INDEX IF NOT EXISTS idx_matricula_plantel_estatus 
ON public.matricula_alumnos (plantel_id, estatus);

CREATE INDEX IF NOT EXISTS idx_transacciones_plantel_estatus_fecha 
ON public.transacciones_caja (plantel_id, estatus, fecha_pago DESC);

CREATE INDEX IF NOT EXISTS idx_nomina_plantel_periodo 
ON public.nomina_desglose (plantel_id, periodo);

-- ----------------------------------------------------------------------------
-- 5. MOTOR CDC DE INVALIDACIÓN REACTIVA (ZERO-STALE-DATA)
-- ----------------------------------------------------------------------------

-- Función del disparador para invalidar consultas que dependan de la tabla mutada
CREATE OR REPLACE FUNCTION public.invalidate_bi_cache_by_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_table TEXT;
BEGIN
    target_table := TG_TABLE_NAME::text;

    -- Invalida de forma reactiva cualquier caché activa que involucre a la tabla modificada
    UPDATE public.bi_semantic_cache
    SET is_valid = FALSE
    WHERE is_valid = TRUE
      AND target_table = ANY(tables_involved);

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Disparador en cascada: matricula_alumnos
DROP TRIGGER IF EXISTS trg_cdc_invalidate_bi_matricula ON public.matricula_alumnos;
CREATE TRIGGER trg_cdc_invalidate_bi_matricula
AFTER INSERT OR UPDATE OR DELETE ON public.matricula_alumnos
FOR EACH ROW EXECUTE FUNCTION public.invalidate_bi_cache_by_trigger();

-- Disparador en cascada: nomina_desglose
DROP TRIGGER IF EXISTS trg_cdc_invalidate_bi_nomina ON public.nomina_desglose;
CREATE TRIGGER trg_cdc_invalidate_bi_nomina
AFTER INSERT OR UPDATE OR DELETE ON public.nomina_desglose
FOR EACH ROW EXECUTE FUNCTION public.invalidate_bi_cache_by_trigger();

-- Disparador en cascada: transacciones_caja
DROP TRIGGER IF EXISTS trg_cdc_invalidate_bi_transacciones ON public.transacciones_caja;
CREATE TRIGGER trg_cdc_invalidate_bi_transacciones
AFTER INSERT OR UPDATE OR DELETE ON public.transacciones_caja
FOR EACH ROW EXECUTE FUNCTION public.invalidate_bi_cache_by_trigger();

-- Disparador opcional de integridad para cambios estructurales en planteles
DROP TRIGGER IF EXISTS trg_cdc_invalidate_bi_planteles ON public.planteles;
CREATE TRIGGER trg_cdc_invalidate_bi_planteles
AFTER UPDATE OR DELETE ON public.planteles
FOR EACH ROW EXECUTE FUNCTION public.invalidate_bi_cache_by_trigger();

-- ----------------------------------------------------------------------------
-- 6. FUNCIÓN RPC ALMACENADA: MATCH_BI_CACHE
-- ----------------------------------------------------------------------------
-- Permite resolución semántica con vector de entrada, evalúa umbral de similitud
-- y actualiza en tiempo real 'last_accessed_at' sin incurrir en consumo de tokens.
CREATE OR REPLACE FUNCTION public.match_bi_cache(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.88,
    match_count INT DEFAULT 1
)
RETURNS TABLE (
    id UUID,
    query_normalized TEXT,
    sql_template TEXT,
    metric_snapshot JSONB,
    tables_involved TEXT[],
    similarity FLOAT,
    last_accessed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH matched_entries AS (
        SELECT 
            c.id AS entry_id,
            c.query_normalized,
            c.sql_template,
            c.metric_snapshot,
            c.tables_involved,
            (1 - (c.query_vector <=> query_embedding))::FLOAT AS sim,
            clock_timestamp() AS access_time
        FROM public.bi_semantic_cache c
        WHERE c.is_valid = TRUE
          AND (1 - (c.query_vector <=> query_embedding)) >= match_threshold
        ORDER BY c.query_vector <=> query_embedding ASC
        LIMIT match_count
    ),
    touch_cache AS (
        UPDATE public.bi_semantic_cache u
        SET last_accessed_at = m.access_time
        FROM matched_entries m
        WHERE u.id = m.entry_id
        RETURNING u.id
    )
    SELECT 
        m.entry_id AS id,
        m.query_normalized,
        m.sql_template,
        m.metric_snapshot,
        m.tables_involved,
        m.sim AS similarity,
        m.access_time AS last_accessed_at
    FROM matched_entries m;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.planteles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matricula_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nomina_desglose ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_semantic_cache ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para roles del sistema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'planteles' 
          AND policyname = 'bi_admin_all_planteles'
    ) THEN
        CREATE POLICY "bi_admin_all_planteles" ON public.planteles
            FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'matricula_alumnos' 
          AND policyname = 'bi_admin_all_matricula'
    ) THEN
        CREATE POLICY "bi_admin_all_matricula" ON public.matricula_alumnos
            FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'nomina_desglose' 
          AND policyname = 'bi_admin_all_nomina'
    ) THEN
        CREATE POLICY "bi_admin_all_nomina" ON public.nomina_desglose
            FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'transacciones_caja' 
          AND policyname = 'bi_admin_all_transacciones'
    ) THEN
        CREATE POLICY "bi_admin_all_transacciones" ON public.transacciones_caja
            FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'bi_semantic_cache' 
          AND policyname = 'bi_admin_all_cache'
    ) THEN
        CREATE POLICY "bi_admin_all_cache" ON public.bi_semantic_cache
            FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;
END
$$;

-- Otorgar permisos de ejecución para la función RPC
GRANT EXECUTE ON FUNCTION public.match_bi_cache(VECTOR(1536), FLOAT, INT) TO authenticated, service_role, anon;
