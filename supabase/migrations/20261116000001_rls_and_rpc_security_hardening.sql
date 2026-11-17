-- ============================================================================
-- MIGRACIÓN CORRECTIVA DE SEGURIDAD RLS, AISLAMIENTO MULTI-COLEGIO Y RPCS
-- Arquitectura Confianza Cero Institucional ISkool
-- ============================================================================

-- 1. Endurecer políticas administrativas de BI Ejecutivo (eliminar USING (TRUE) en tablas sensibles)
DO $$
DECLARE
  v_table TEXT;
  v_policy TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'planteles',
    'matricula_alumnos',
    'nomina_desglose',
    'transacciones_caja',
    'bi_semantic_cache',
    'bi_executive_snapshots',
    'bi_campus_metrics_cache'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = v_table
    ) THEN
      FOR v_policy IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = v_table
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', v_policy, v_table);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY "bi_executive_role_only_%s" ON public.%I FOR ALL TO authenticated ' ||
        'USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN (''admin'', ''director'', ''coordinator'', ''ceo'', ''owner'', ''superadmin''))) ' ||
        'WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN (''admin'', ''director'', ''coordinator'', ''ceo'', ''owner'', ''superadmin'')))',
        v_table, v_table
      );
    END IF;
  END LOOP;
END $$;

-- 2. Reforzar aislamiento estricto por school_id en tablas financieras y de cobranza
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_profiles') THEN
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
          AND (p.role = 'superadmin' OR p.school_id = billing_profiles.school_id)
      )
    );
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
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
          AND (p.role = 'superadmin' OR p.school_id = invoices.school_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
          AND (p.role = 'superadmin' OR p.school_id = invoices.school_id)
      )
    );
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments_history') THEN
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
          AND (p.role = 'superadmin' OR p.school_id = payments_history.school_id)
      )
    );
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'magic_links') THEN
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
          AND (p.role = 'superadmin' OR p.school_id = magic_links.school_id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'director', 'coordinator', 'superadmin')
          AND (p.role = 'superadmin' OR p.school_id = magic_links.school_id)
      )
    );
  END IF;
END $$;

-- 3. Fijar search_path seguro y revocar ejecución anónima de RPCs SECURITY DEFINER sensibles
DO $$
DECLARE
  v_sig TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'match_bi_cache'
  ) THEN
    SELECT p.oid::regprocedure::text INTO v_sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'match_bi_cache'
    LIMIT 1;
    IF v_sig IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog, pg_temp', v_sig);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', v_sig);
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'consume_magic_payment_link'
  ) THEN
    SELECT p.oid::regprocedure::text INTO v_sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'consume_magic_payment_link'
    LIMIT 1;
    IF v_sig IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog, pg_temp', v_sig);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', v_sig);
    END IF;
  END IF;
END $$;
