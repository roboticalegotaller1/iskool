-- 1. EXTENSIONES Y ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE email_destination_type AS ENUM ('RESOLVER', 'DELEGAR', 'VIGILAR', 'DIRECCION');
CREATE TYPE matter_urgency_type AS ENUM ('CRITICA', 'ALTA', 'MEDIA', 'BAJA');
CREATE TYPE matter_status_type AS ENUM ('PENDIENTE', 'DELEGADO', 'EN_SEGUIMIENTO', 'RESUELTO', 'CERRADO', 'ESCALADO');
CREATE TYPE epistemic_type AS ENUM ('HECHO', 'OBSERVACION', 'INFERENCIA', 'DECISION', 'RESULTADO');
CREATE TYPE sync_status_type AS ENUM ('IDLE', 'SYNCING', 'ERROR', 'PAUSED');

-- 2. TABLA DE CUENTAS DE CORREO CONECTADAS (OAUTH WORKSPACE)
CREATE TABLE IF NOT EXISTS public.email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    user_id UUID NOT NULL,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL DEFAULT 'google_workspace',
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.compose'],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    shadow_mode BOOLEAN NOT NULL DEFAULT TRUE,
    sync_status sync_status_type NOT NULL DEFAULT 'IDLE',
    last_sync_at TIMESTAMPTZ,
    last_history_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE MENSAJES DE CORREO CRUDOS (INGESTA CON IDEMPOTENCIA)
CREATE TABLE IF NOT EXISTS public.email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    email_account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
    gmail_message_id VARCHAR(100) NOT NULL UNIQUE,
    gmail_thread_id VARCHAR(100) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL,
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

-- 4. TABLA DE ASUNTOS CONSOLIDADOS (NÚCLEO EJECUTIVO DE DIRECCIÓN)
CREATE TABLE IF NOT EXISTS public.inbox_matters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    matter_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    related_entity_type VARCHAR(100), -- 'alumno', 'familia', 'docente', 'grupo', 'transporte', etc.
    related_entity_id VARCHAR(255),
    urgency matter_urgency_type NOT NULL DEFAULT 'MEDIA',
    destination email_destination_type NOT NULL DEFAULT 'DIRECCION',
    assigned_role VARCHAR(100),
    assigned_user_id UUID,
    sla_hours INT NOT NULL DEFAULT 48,
    sla_deadline TIMESTAMPTZ,
    status matter_status_type NOT NULL DEFAULT 'PENDIENTE',
    reincidence_count INT NOT NULL DEFAULT 1,
    reincidence_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    why_shown_to_director TEXT,
    recommended_action TEXT,
    suggested_draft_reply TEXT,
    knowledge_provenance JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    epistemic_classification epistemic_type NOT NULL DEFAULT 'HECHO',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_without_director BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RELACIÓN MUCHOS A MUCHOS: CORREOS <-> ASUNTOS
CREATE TABLE IF NOT EXISTS public.matter_email_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES public.inbox_matters(id) ON DELETE CASCADE,
    email_message_id UUID NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(matter_id, email_message_id)
);

-- 6. MATRIZ DE DELEGACIÓN Y SLAs CONFIGURABLES
CREATE TABLE IF NOT EXISTS public.inbox_delegation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    educational_level VARCHAR(50), -- 'preescolar', 'primaria', 'secundaria', 'preparatoria', 'general'
    assigned_role VARCHAR(100) NOT NULL,
    sla_hours INT NOT NULL DEFAULT 24,
    escalate_to_director_on_reincidence BOOLEAN NOT NULL DEFAULT TRUE,
    escalate_to_director_on_breach BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, category)
);

-- 7. AUDITORÍA DE RETROALIMENTACIÓN HUMANA (APRENDIZAJE ACTIVO DE DIRECCIÓN)
CREATE TABLE IF NOT EXISTS public.inbox_director_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    matter_id UUID NOT NULL REFERENCES public.inbox_matters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    original_destination email_destination_type NOT NULL,
    corrected_destination email_destination_type NOT NULL,
    original_assigned_role VARCHAR(100),
    corrected_assigned_role VARCHAR(100),
    feedback_notes TEXT,
    rule_proposed VARCHAR(255),
    rule_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PATRONES PROACTIVOS DETECTADOS (PIEZA WOW)
CREATE TABLE IF NOT EXISTS public.inbox_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    pattern_title VARCHAR(255) NOT NULL,
    pattern_description TEXT NOT NULL,
    detected_count INT NOT NULL,
    timeframe_hours INT NOT NULL,
    entity_key VARCHAR(100),
    suggested_institutional_action TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    dismissed_at TIMESTAMPTZ,
    promoted_to_memory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, entity_key)
);

-- 9. CONFIGURACIÓN DE BRANDING INSTITUCIONAL (WHITE-LABEL HERRAMIENTAS)
CREATE TABLE IF NOT EXISTS public.school_brand_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL UNIQUE,
    school_name VARCHAR(255) NOT NULL DEFAULT 'Colegio Horizonte',
    primary_color VARCHAR(10) NOT NULL DEFAULT '#1e293b',
    secondary_color VARCHAR(10) NOT NULL DEFAULT '#0284c7',
    accent_color VARCHAR(10) NOT NULL DEFAULT '#059669',
    background_color VARCHAR(10) NOT NULL DEFAULT '#f8fafc',
    surface_color VARCHAR(10) NOT NULL DEFAULT '#ffffff',
    text_primary_color VARCHAR(10) NOT NULL DEFAULT '#0f172a',
    logo_url TEXT,
    favicon_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_email_messages_account ON public.email_messages(email_account_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread ON public.email_messages(gmail_thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_received ON public.email_messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_matters_school_dest ON public.inbox_matters(school_id, destination, status);
CREATE INDEX IF NOT EXISTS idx_inbox_matters_urgency ON public.inbox_matters(urgency, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_matter_links_matter ON public.matter_email_links(matter_id);
CREATE INDEX IF NOT EXISTS idx_patterns_school_status ON public.inbox_patterns(school_id, status);

-- 11. POLÍTICAS RLS (SEGURIDAD Y MULTI-TENANT)
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_email_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_delegation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_director_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_brand_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CEO and School Admins can view own school matters"
    ON public.inbox_matters FOR ALL
    USING (auth.jwt() ->> 'school_id' = school_id::text);

CREATE POLICY "CEO and School Admins can access own emails"
    ON public.email_messages FOR ALL
    USING (auth.jwt() ->> 'school_id' = school_id::text);

CREATE POLICY "Brand settings readable by school users"
    ON public.school_brand_settings FOR SELECT
    USING (auth.jwt() ->> 'school_id' = school_id::text);

CREATE POLICY "Brand settings manageable by CEO"
    ON public.school_brand_settings FOR ALL
    USING (auth.jwt() ->> 'role' = 'CEO' AND auth.jwt() ->> 'school_id' = school_id::text);
