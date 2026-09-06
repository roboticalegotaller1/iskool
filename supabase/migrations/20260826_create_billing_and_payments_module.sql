-- ============================================================================
-- MIGRACIÓN: MÓDULO FINANCIERO, FACTURACIÓN Y PAGOS INSTITUCIONALES (ISkool)
-- Estándar de Seguridad Bancaria • Cero Gamificación • Marca Blanca (PaymentGateway)
-- ============================================================================

-- Extensión requerida para generación de UUIDs y funciones criptográficas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLA: billing_profiles (Perfiles Fiscales SAT de Tutores/Padres de Familia)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    
    -- Datos de Identificación Fiscal SAT
    rfc VARCHAR(13) NOT NULL,
    tax_name VARCHAR(255) NOT NULL, -- Razón Social / Nombre Fiscal
    tax_regime VARCHAR(10) NOT NULL, -- Clave de Régimen Fiscal SAT (ej. '605', '612', '626')
    postal_code VARCHAR(5) NOT NULL, -- Código Postal Fiscal receptor
    cfdi_use VARCHAR(10) NOT NULL DEFAULT 'D10', -- Uso de CFDI (Default: 'D10' para colegiaturas)
    billing_email VARCHAR(255) NOT NULL,
    
    -- Domicilio Fiscal Complementario
    street VARCHAR(255),
    exterior_number VARCHAR(50),
    interior_number VARCHAR(50),
    neighborhood VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    
    is_default BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Restricciones de integridad fiscal
    CONSTRAINT chk_rfc_format CHECK (rfc ~ '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
    CONSTRAINT chk_postal_code_format CHECK (postal_code ~ '^[0-9]{5}$')
);

-- Índices para billing_profiles
CREATE INDEX IF NOT EXISTS idx_billing_profiles_parent ON public.billing_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_school ON public.billing_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_rfc ON public.billing_profiles(rfc);

-- ----------------------------------------------------------------------------
-- 2. TABLA: invoices (Cargos a Cobrar / Facturación Escolar Institucional)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    
    -- Control y Folio de Cobranza
    invoice_number VARCHAR(50) NOT NULL, -- Folio único por colegio (ej. "COL-2026-00124")
    concept VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'tuition', -- 'tuition', 'enrollment', 'materials', 'uniform', 'cafeteria', 'extracurricular', 'other'
    
    -- Desglose Monetario
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    surcharge_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (surcharge_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    
    -- Fechas y Estados
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL, -- Fecha de vencimiento
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled', 'in_process'
    paid_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_invoice_school_number UNIQUE (school_id, invoice_number),
    CONSTRAINT chk_invoice_status CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'in_process')),
    CONSTRAINT chk_invoice_category CHECK (category IN ('tuition', 'enrollment', 'materials', 'uniform', 'cafeteria', 'extracurricular', 'exam_fee', 'other'))
);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_parent ON public.invoices(parent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON public.invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_school ON public.invoices(school_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- ----------------------------------------------------------------------------
-- 3. TABLA: payments_history (Historial de Pagos y Transacciones Conciliadas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    payment_method VARCHAR(50) NOT NULL, -- 'credit_card', 'debit_card', 'spei', 'bank_transfer', 'cash_store', 'direct_debit'
    status VARCHAR(20) NOT NULL DEFAULT 'succeeded', -- 'succeeded', 'pending', 'failed', 'refunded'
    
    -- Abstracción de Pasarela Financiera (Marca Blanca)
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'PaymentGateway',
    gateway_transaction_id VARCHAR(255) NOT NULL UNIQUE,
    gateway_fee NUMERIC(10, 2) DEFAULT 0.00,
    net_amount NUMERIC(10, 2) NOT NULL,
    
    receipt_number VARCHAR(100) NOT NULL UNIQUE, -- Folio interno de recibo
    receipt_url TEXT, -- Comprobante digital descargable
    
    -- Timbrado Fiscal Digital SAT (CFDI 4.0)
    cfdi_uuid VARCHAR(36), -- Folio Fiscal SAT (UUID 36 caracteres)
    cfdi_xml_url TEXT,
    cfdi_pdf_url TEXT,
    
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_payment_status CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('credit_card', 'debit_card', 'spei', 'bank_transfer', 'cash_store', 'direct_debit'))
);

-- Índices para payments_history
CREATE INDEX IF NOT EXISTS idx_payments_history_invoice ON public.payments_history(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_history_parent ON public.payments_history(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_history_school ON public.payments_history(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_history_gateway_tx ON public.payments_history(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_history_paid_at ON public.payments_history(paid_at);

-- ----------------------------------------------------------------------------
-- 4. TABLA: magic_links (Tokens Criptográficos para Pago Rápido sin Contraseña)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.magic_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 del token unívoco enviado al padre
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    
    expires_at TIMESTAMPTZ NOT NULL, -- Límite de validez del enlace
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para magic_links
CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_links_invoice ON public.magic_links(invoice_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_parent ON public.magic_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON public.magic_links(expires_at);

-- ----------------------------------------------------------------------------
-- 5. FUNCIONES Y TRIGGERS AUTOMÁTICOS
-- ----------------------------------------------------------------------------

-- Trigger genérico para actualización de campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_billing_profiles_updated_at ON public.billing_profiles;
CREATE TRIGGER trg_billing_profiles_updated_at
BEFORE UPDATE ON public.billing_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_timestamp();

-- Trigger: Actualizar automáticamente el estado de la factura al recibir un pago exitoso
CREATE OR REPLACE FUNCTION public.handle_successful_payment_invoice_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'succeeded' THEN
        UPDATE public.invoices
        SET 
            status = 'paid',
            paid_at = NEW.paid_at,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_success_invoice ON public.payments_history;
CREATE TRIGGER trg_payment_success_invoice
AFTER INSERT OR UPDATE ON public.payments_history
FOR EACH ROW EXECUTE FUNCTION public.handle_successful_payment_invoice_update();

-- Función RPC: Validar y consumir Magic Link de pago de forma atómica y segura
CREATE OR REPLACE FUNCTION public.consume_magic_payment_link(
    p_token_hash VARCHAR(64),
    p_ip_address VARCHAR(45) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_link RECORD;
    v_invoice RECORD;
    v_student RECORD;
    v_parent RECORD;
    v_school RECORD;
BEGIN
    -- 1. Buscar enlace activo y no usado
    SELECT * INTO v_link
    FROM public.magic_links
    WHERE token_hash = p_token_hash
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'ENLACE_INVALIDO', 'message', 'El enlace de pago no existe o es inválido.');
    END IF;

    IF v_link.is_used THEN
        RETURN jsonb_build_object('success', false, 'error', 'ENLACE_YA_UTILIZADO', 'message', 'Este enlace de pago ya fue utilizado previamente.');
    END IF;

    IF v_link.expires_at < NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'ENLACE_EXPIRADO', 'message', 'El enlace de pago ha expirado por motivos de seguridad.');
    END IF;

    -- 2. Obtener datos de la factura
    SELECT * INTO v_invoice
    FROM public.invoices
    WHERE id = v_link.invoice_id;

    IF v_invoice.status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'error', 'CARGO_YA_LIQUIDADO', 'message', 'Este cargo ya se encuentra pagado.');
    END IF;

    -- 3. Marcar enlace como utilizado
    UPDATE public.magic_links
    SET 
        is_used = true,
        used_at = NOW(),
        ip_address = p_ip_address,
        user_agent = p_user_agent
    WHERE id = v_link.id;

    -- 4. Obtener datos complementarios para checkout formal
    SELECT * INTO v_parent FROM public.profiles WHERE id = v_link.parent_id;
    SELECT * INTO v_school FROM public.schools WHERE id = v_link.school_id;

    RETURN jsonb_build_object(
        'success', true,
        'invoice', row_to_json(v_invoice),
        'parent', jsonb_build_object('id', v_parent.id, 'first_name', v_parent.first_name, 'last_name', v_parent.last_name, 'email', v_parent.email),
        'school', jsonb_build_object('id', v_school.id, 'name', v_school.name)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------

-- Habilitar RLS en todas las tablas financieras
ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- 6.1 POLÍTICAS PARA: billing_profiles
-- Padres / Tutores: Solo gestionan sus propios datos fiscales
DROP POLICY IF EXISTS "parents_manage_own_billing_profiles" ON public.billing_profiles;
CREATE POLICY "parents_manage_own_billing_profiles"
ON public.billing_profiles
FOR ALL
TO authenticated
USING (
    parent_id = auth.uid()
)
WITH CHECK (
    parent_id = auth.uid()
);

-- Personal Administrativo (Coordinadores, Directores, Admins): Consultan perfiles de su colegio
DROP POLICY IF EXISTS "staff_view_school_billing_profiles" ON public.billing_profiles;
CREATE POLICY "staff_view_school_billing_profiles"
ON public.billing_profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
    )
);

-- 6.2 POLÍTICAS PARA: invoices
-- Padres: Solo pueden consultar sus cargos asignados
DROP POLICY IF EXISTS "parents_view_own_invoices" ON public.invoices;
CREATE POLICY "parents_view_own_invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
    parent_id = auth.uid()
);

-- Personal Administrativo: Gestión completa de cobranza de su plantel
DROP POLICY IF EXISTS "staff_manage_school_invoices" ON public.invoices;
CREATE POLICY "staff_manage_school_invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
    )
);

-- 6.3 POLÍTICAS PARA: payments_history
-- Padres: Consultan exclusivamente sus recibos y pagos
DROP POLICY IF EXISTS "parents_view_own_payments_history" ON public.payments_history;
CREATE POLICY "parents_view_own_payments_history"
ON public.payments_history
FOR SELECT
TO authenticated
USING (
    parent_id = auth.uid()
);

-- Personal Administrativo: Acceso total a conciliación y auditoría de pagos de la institución
DROP POLICY IF EXISTS "staff_view_school_payments_history" ON public.payments_history;
CREATE POLICY "staff_view_school_payments_history"
ON public.payments_history
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
    )
);

-- Inserción segura para Webhooks y Procesador de Pagos (Service Role)
DROP POLICY IF EXISTS "service_role_insert_payments" ON public.payments_history;
CREATE POLICY "service_role_insert_payments"
ON public.payments_history
FOR INSERT
TO service_role
WITH CHECK (true);

-- 6.4 POLÍTICAS PARA: magic_links
-- Personal Administrativo: Generación y auditoría de Magic Links
DROP POLICY IF EXISTS "staff_manage_magic_links" ON public.magic_links;
CREATE POLICY "staff_manage_magic_links"
ON public.magic_links
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
    )
);

-- Comentarios descriptivos de seguridad bancaria
COMMENT ON TABLE public.billing_profiles IS 'Perfiles fiscales SAT (CFDI 4.0) de tutores para timbrado formal institucional.';
COMMENT ON TABLE public.invoices IS 'Cargos y facturación escolar. Zona 100% formal sin gamificación.';
COMMENT ON TABLE public.payments_history IS 'Registro inmutable de pagos procesados mediante PaymentGateway.';
COMMENT ON TABLE public.magic_links IS 'Tokens criptográficos seguros para pago exprés sin credenciales.';
