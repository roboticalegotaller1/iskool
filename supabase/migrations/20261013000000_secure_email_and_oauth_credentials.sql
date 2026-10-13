-- =========================================================================
-- ISkool Zero-Trust Architecture: Blindaje de Secretos y Credenciales OAuth
-- Archivo: supabase/migrations/20261013000000_secure_email_and_oauth_credentials.sql
-- Nivel de Seguridad: Restricción Absoluta de Secretos a Nivel Servidor (service_role)
-- Propósito:
--   Cierra el acceso público y anónimo a las tablas de secretos OAuth,
--   tokens de buzón y mensajería del CEO, garantizando que NINGÚN cliente
--   web con la clave anónima (anon key) pueda inspeccionar credenciales.
--   PRESERVA AL 100% las tablas de alumnos, catálogo demo, gamificación y tienda.
-- =========================================================================

-- 1. BLINDAJE DE TABLA oauth_credentials
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'oauth_credentials'
    ) THEN
        -- Activar Row Level Security
        ALTER TABLE public.oauth_credentials ENABLE ROW LEVEL SECURITY;

        -- Revocar permisos de lectura/escritura a anon y authenticated
        REVOKE ALL ON public.oauth_credentials FROM anon;
        REVOKE ALL ON public.oauth_credentials FROM authenticated;

        -- Conceder control exclusivo a service_role (Servidor Backend)
        GRANT ALL ON public.oauth_credentials TO service_role;

        -- Eliminar políticas permisivas heredadas
        DROP POLICY IF EXISTS "Allow all for public" ON public.oauth_credentials;
        DROP POLICY IF EXISTS "Public access" ON public.oauth_credentials;
        DROP POLICY IF EXISTS "service_role_full_access_oauth_credentials" ON public.oauth_credentials;

        -- Crear política estricta para service_role
        CREATE POLICY "service_role_full_access_oauth_credentials"
            ON public.oauth_credentials
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 2. BLINDAJE DE TABLA email_accounts (Tokens y Contraseñas de Buzones)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'email_accounts'
    ) THEN
        -- Activar Row Level Security
        ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;

        -- Revocar permisos a anon
        REVOKE ALL ON public.email_accounts FROM anon;

        -- Conceder control exclusivo a service_role
        GRANT ALL ON public.email_accounts TO service_role;

        -- Eliminar políticas públicas
        DROP POLICY IF EXISTS "Allow all for public" ON public.email_accounts;
        DROP POLICY IF EXISTS "Public access" ON public.email_accounts;
        DROP POLICY IF EXISTS "service_role_full_access_email_accounts" ON public.email_accounts;

        -- Crear política estricta para service_role
        CREATE POLICY "service_role_full_access_email_accounts"
            ON public.email_accounts
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 3. BLINDAJE DE TABLA email_messages
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'email_messages'
    ) THEN
        -- Activar Row Level Security
        ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

        -- Conceder control a service_role
        GRANT ALL ON public.email_messages TO service_role;

        -- Eliminar políticas públicas
        DROP POLICY IF EXISTS "Allow all for public" ON public.email_messages;
        DROP POLICY IF EXISTS "Public access" ON public.email_messages;
        DROP POLICY IF EXISTS "service_role_full_access_email_messages" ON public.email_messages;

        -- Política para service_role
        CREATE POLICY "service_role_full_access_email_messages"
            ON public.email_messages
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
