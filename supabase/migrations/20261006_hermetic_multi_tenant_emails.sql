-- =========================================================================
-- ISkool Zero-Trust Architecture: Aislamiento Hermético Multi-Tenant (RLS)
-- Archivo: supabase/migrations/20261006_hermetic_multi_tenant_emails.sql
-- Nivel de Seguridad: Grado Bancario / Datos Médicos Institucionales
-- Descripción:
--   Implementa particionamiento lógico estricto por tenant_id (UUID NOT NULL)
--   en toda la suite de comunicaciones por correo electrónico y memoria
--   institucional. Prohíbe de forma inviolable cualquier consulta cruzada
--   o filtración entre diferentes colegios e instituciones federadas.
-- =========================================================================

-- 1. EXTENSIONES CRIPTOGRÁFICAS Y DE IDENTIFICADORES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 2. TABLA 1: tenant_institutions (Registro Maestro de Instituciones/Tenants)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.tenant_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE,
    institution_code VARCHAR(100) NOT NULL UNIQUE,
    institution_name VARCHAR(255) NOT NULL,
    cct VARCHAR(50),
    domain VARCHAR(255),
    branding JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 3. TABLA 2: email_messages (Mensajes de Correo Electrónico Ingestados)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID,
    email_account_id UUID,
    gmail_message_id VARCHAR(100) UNIQUE,
    gmail_thread_id VARCHAR(100),
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    recipient_emails TEXT[] NOT NULL DEFAULT '{}',
    subject TEXT NOT NULL,
    snippet TEXT,
    body_text TEXT,
    body_html TEXT,
    labels TEXT[] NOT NULL DEFAULT '{}',
    attachments_metadata JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_spam BOOLEAN NOT NULL DEFAULT FALSE,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Retrocompatibilidad e Idempotencia: Si email_messages ya existía previamente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'email_messages' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.email_messages ADD COLUMN tenant_id UUID;
        
        -- Si existe school_id y tenant_id es NULL, sincronizar con school_id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'email_messages' AND column_name = 'school_id'
        ) THEN
            UPDATE public.email_messages SET tenant_id = school_id WHERE tenant_id IS NULL;
        END IF;

        -- Relleno defensivo en caso de registros huérfanos antes de fijar restricción
        UPDATE public.email_messages SET tenant_id = gen_random_uuid() WHERE tenant_id IS NULL;

        -- Exigir restricción NOT NULL de forma mandatoria
        ALTER TABLE public.email_messages ALTER COLUMN tenant_id SET NOT NULL;
    END IF;
END $$;

-- =========================================================================
-- 4. TABLA 3: email_issues (Asuntos e Incidencias Consolidadas de Correo)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.email_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID,
    issue_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    related_entity_type VARCHAR(100), -- 'alumno', 'familia', 'docente', 'grupo', 'transporte'
    related_entity_id VARCHAR(255),
    urgency VARCHAR(50) NOT NULL DEFAULT 'MEDIA',
    destination VARCHAR(50) NOT NULL DEFAULT 'DIRECCION',
    assigned_role VARCHAR(100),
    assigned_user_id UUID,
    sla_hours INT NOT NULL DEFAULT 48,
    sla_deadline TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    reincidence_count INT NOT NULL DEFAULT 1,
    reincidence_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    why_shown_to_director TEXT,
    recommended_action TEXT,
    suggested_draft_reply TEXT,
    confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    epistemic_classification VARCHAR(50) NOT NULL DEFAULT 'HECHO',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_without_director BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si existía inbox_matters del módulo de inbox, asegurar coherencia de tenant_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'inbox_matters'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'inbox_matters' AND column_name = 'tenant_id'
        ) THEN
            ALTER TABLE public.inbox_matters ADD COLUMN tenant_id UUID;
            UPDATE public.inbox_matters SET tenant_id = school_id WHERE tenant_id IS NULL;
            UPDATE public.inbox_matters SET tenant_id = gen_random_uuid() WHERE tenant_id IS NULL;
            ALTER TABLE public.inbox_matters ALTER COLUMN tenant_id SET NOT NULL;
        END IF;
    END IF;
END $$;

-- =========================================================================
-- 5. TABLA 4: email_drafts (Borradores y Respuestas Institucionales Proactivas)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.email_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    school_id UUID,
    email_message_id UUID REFERENCES public.email_messages(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES public.email_issues(id) ON DELETE SET NULL,
    recipient_emails TEXT[] NOT NULL DEFAULT '{}',
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    draft_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'REVIEWED', 'APPROVED', 'SENT'
    suggested_by_ai BOOLEAN NOT NULL DEFAULT TRUE,
    approved_by_user_id UUID,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 6. TABLA 5: institutional_memory (Memoria Institucional y Procedencia)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.institutional_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    institution_id VARCHAR(100) NOT NULL,
    campus VARCHAR(255) DEFAULT 'Campus Central',
    academic_cycle VARCHAR(50) NOT NULL,
    phase_nem VARCHAR(50),
    grade VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    group_cohort VARCHAR(50),
    author_display_name VARCHAR(255) NOT NULL,
    created_by_teacher_ref VARCHAR(255),
    adaptation_of VARCHAR(255),
    activity_source TEXT,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Retrocompatibilidad: Si institutional_memory ya existía
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'institutional_memory' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.institutional_memory ADD COLUMN tenant_id UUID;
        UPDATE public.institutional_memory SET tenant_id = gen_random_uuid() WHERE tenant_id IS NULL;
        ALTER TABLE public.institutional_memory ALTER COLUMN tenant_id SET NOT NULL;
    END IF;
END $$;

-- =========================================================================
-- 7. ÍNDICES DE RENDIMIENTO B-TREE PARA FILTRADO RLS MULTI-TENANT
--    Garantiza búsquedas indexadas O(log N) sin escaneo secuencial
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_tenant_institutions_tenant_id ON public.tenant_institutions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_tenant_id ON public.email_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_tenant_received ON public.email_messages(tenant_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_tenant_thread ON public.email_messages(tenant_id, gmail_thread_id);

CREATE INDEX IF NOT EXISTS idx_email_issues_tenant_id ON public.email_issues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_issues_tenant_status ON public.email_issues(tenant_id, status, urgency);

CREATE INDEX IF NOT EXISTS idx_email_drafts_tenant_id ON public.email_drafts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_drafts_tenant_status ON public.email_drafts(tenant_id, draft_status);

CREATE INDEX IF NOT EXISTS idx_institutional_memory_tenant_id ON public.institutional_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_institutional_memory_tenant_cycle ON public.institutional_memory(tenant_id, academic_cycle, subject);

-- =========================================================================
-- 8. ENDURECIMIENTO DE SEGURIDAD: ROW LEVEL SECURITY (RLS) INFRANQUEABLE
-- =========================================================================

-- Habilitar RLS estricto en las 5 entidades
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_institutions ENABLE ROW LEVEL SECURITY;

-- Blindaje FORCE RLS: Bloquea bypass inadvertido incluso para propietarios de tablas
ALTER TABLE public.email_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.email_issues FORCE ROW LEVEL SECURITY;
ALTER TABLE public.email_drafts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_memory FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_institutions FORCE ROW LEVEL SECURITY;

-- Limpieza preventiva de políticas obsoletas o permisivas que utilicen lógica previa
DROP POLICY IF EXISTS "CEO and School Admins can access own emails" ON public.email_messages;
DROP POLICY IF EXISTS email_messages_tenant_isolation ON public.email_messages;
DROP POLICY IF EXISTS email_issues_tenant_isolation ON public.email_issues;
DROP POLICY IF EXISTS email_drafts_tenant_isolation ON public.email_drafts;
DROP POLICY IF EXISTS institutional_memory_tenant_isolation ON public.institutional_memory;
DROP POLICY IF EXISTS tenant_institutions_tenant_isolation ON public.tenant_institutions;

-- =========================================================================
-- 9. POLÍTICAS RLS: ACCESO EXCLUSIVO AL TENANT EXTRAÍDO DEL TOKEN JWT
-- =========================================================================

-- Política: email_messages
CREATE POLICY email_messages_tenant_isolation ON public.email_messages
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Política: email_issues
CREATE POLICY email_issues_tenant_isolation ON public.email_issues
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Política: email_drafts
CREATE POLICY email_drafts_tenant_isolation ON public.email_drafts
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Política: institutional_memory
CREATE POLICY institutional_memory_tenant_isolation ON public.institutional_memory
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Política: tenant_institutions
CREATE POLICY tenant_institutions_tenant_isolation ON public.tenant_institutions
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- =========================================================================
-- 10. REGLA INVIOLABLE CONTRA ACCESO ANÓNIMO O NO AUTENTICADO
-- =========================================================================
REVOKE ALL ON public.email_messages FROM anon;
REVOKE ALL ON public.email_issues FROM anon;
REVOKE ALL ON public.email_drafts FROM anon;
REVOKE ALL ON public.institutional_memory FROM anon;
REVOKE ALL ON public.tenant_institutions FROM anon;
