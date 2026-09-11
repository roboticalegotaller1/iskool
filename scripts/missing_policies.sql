DO $$ BEGIN
  IF to_regclass('public.student_avatars') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_avatars' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.student_avatars TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.profiles TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.schools') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.schools TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.academic_years') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'academic_years' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.academic_years TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.academic_periods') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'academic_periods' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.academic_periods TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.levels_grades') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'levels_grades' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.levels_grades TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.groups') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'groups' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.groups TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.subjects') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subjects' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.subjects TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.students') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'students' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.students TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.enrollments') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'enrollments' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.enrollments TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.teacher_assignments') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teacher_assignments' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.teacher_assignments TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.guild_bosses') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'guild_bosses' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.guild_bosses TO public USING (true) ;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.attendance') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'attendance' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.attendance TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.grades') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grades' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.grades TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.pdas') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pdas' AND policyname = 'Permitir lectura de pdas a usuarios autenticados') THEN
      CREATE POLICY "Permitir lectura de pdas a usuarios autenticados" ON public.pdas FOR SELECT TO authenticated USING (true) ;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.badges') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'badges' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.badges TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.student_badges') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_badges' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.student_badges TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.nem_pdas') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'nem_pdas' AND policyname = 'Permitir lectura de pdas a usuarios autenticados') THEN
      CREATE POLICY "Permitir lectura de pdas a usuarios autenticados" ON public.nem_pdas FOR SELECT TO authenticated USING (true) ;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.quests') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quests' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.quests TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.missions') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'missions' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.missions TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.quest_attempts') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quest_attempts' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.quest_attempts TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.student_stats') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_stats' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.student_stats TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.portfolio_items') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_items' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.portfolio_items TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.portfolio_feedback') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_feedback' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.portfolio_feedback TO public USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.school_settings') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'school_settings' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.school_settings TO public USING (true) ;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.class_schedules') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'class_schedules' AND policyname = 'Allow all for public') THEN
      CREATE POLICY "Allow all for public" ON public.class_schedules TO public USING (true) ;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.community_activities') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_activities' AND policyname = 'Allow all insert community activities') THEN
      CREATE POLICY "Allow all insert community activities" ON public.community_activities FOR INSERT TO anon,authenticated WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.community_activities') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_activities' AND policyname = 'Allow all update community activities') THEN
      CREATE POLICY "Allow all update community activities" ON public.community_activities FOR UPDATE TO anon,authenticated USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.community_activities') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_activities' AND policyname = 'Anyone can view community activities') THEN
      CREATE POLICY "Anyone can view community activities" ON public.community_activities FOR SELECT TO anon,authenticated USING (true) ;
    END IF;
  END IF;
END $$;

