-- ============================================================================
-- MIGRACIÓN: CREACIÓN DE TABLAS PARA COURSE PLANNING LAYER (FASE 6)
-- Cursos, Unidades Curriculares, Lecciones, Slots de Actividad y Evaluaciones
-- ============================================================================

-- 1. Tabla de Cursos (Courses)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  level_grade_id UUID REFERENCES public.levels_grades(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'english',
  school_stage TEXT NOT NULL CHECK (school_stage IN ('early_childhood', 'primary', 'secondary', 'high_school', 'higher_ed')),
  grade TEXT NOT NULL, -- e.g., 'high_school_1'
  academic_year TEXT NOT NULL DEFAULT '2025-2026',
  
  entry_cefr TEXT NOT NULL, -- e.g., 'B1'
  target_cefr TEXT NOT NULL, -- e.g., 'B1_plus_to_B2'
  
  total_weeks INT NOT NULL DEFAULT 40,
  sessions_per_week INT NOT NULL DEFAULT 4,
  minutes_per_session INT NOT NULL DEFAULT 50,
  instructional_allocation_percent INT NOT NULL DEFAULT 85,
  buffer_allocation_percent INT NOT NULL DEFAULT 15,
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  version INT NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Unidades Curriculares (Course Units)
CREATE TABLE IF NOT EXISTS public.course_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  duration_weeks INT NOT NULL DEFAULT 5,
  
  knowledge_targets TEXT[] NOT NULL DEFAULT '{}',
  learning_outcomes TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  
  grammar_targets TEXT[] NOT NULL DEFAULT '{}',
  vocabulary_domains TEXT[] NOT NULL DEFAULT '{}',
  language_functions TEXT[] NOT NULL DEFAULT '{}',
  
  assessment_targets TEXT[] NOT NULL DEFAULT '{}',
  prerequisite_unit_ids UUID[] DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved')),
  version INT NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(course_id, position)
);

-- 3. Tabla de Lecciones Semanales (Course Lessons)
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.course_units(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL,
  week_number INT NOT NULL,
  session_number INT NOT NULL,
  
  title TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 50,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('introduction', 'development', 'practice', 'integration', 'review', 'assessment', 'project')),
  pedagogical_model TEXT NOT NULL DEFAULT 'PPP',
  
  primary_learning_outcome TEXT NOT NULL,
  secondary_learning_outcomes TEXT[] NOT NULL DEFAULT '{}',
  
  knowledge_targets TEXT[] NOT NULL DEFAULT '{}',
  activity_patterns TEXT[] NOT NULL DEFAULT '{}',
  assessment_evidence TEXT,
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(unit_id, position)
);

-- 4. Tabla de Ranuras de Actividad Didáctica (Lesson Activity Slots)
CREATE TABLE IF NOT EXISTS public.lesson_activity_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('opening', 'activation', 'input', 'guided_practice', 'independent_practice', 'collaborative_production', 'reflection', 'assessment', 'wrap_up')),
  duration_minutes INT NOT NULL,
  activity_pattern TEXT,
  instructions_brief TEXT,
  
  generated_activity_id TEXT,
  generated_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'customized', 'reviewed')),
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(lesson_id, position)
);

-- 5. Tabla de Evaluaciones y Blueprints del Curso (Course Assessments)
CREATE TABLE IF NOT EXISTS public.course_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.course_units(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('diagnostic', 'formative', 'summative', 'performance', 'project', 'quiz', 'exam', 'portfolio')),
  week_scheduled INT NOT NULL,
  
  blueprint JSONB NOT NULL,
  rubric_id TEXT,
  learning_outcomes TEXT[] NOT NULL DEFAULT '{}',
  knowledge_targets TEXT[] NOT NULL DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_activity_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Lectura para usuarios autenticados
CREATE POLICY "courses_read_policy" ON public.courses FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "units_read_policy" ON public.course_units FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "lessons_read_policy" ON public.course_lessons FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "slots_read_policy" ON public.lesson_activity_slots FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "assessments_read_policy" ON public.course_assessments FOR SELECT TO authenticated, anon USING (true);

-- Políticas RLS: Gestión para staff académico (superadmin, admin, director, coordinator, teacher)
CREATE POLICY "courses_manage_policy" ON public.courses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'coordinator', 'director', 'teacher')));
CREATE POLICY "units_manage_policy" ON public.course_units FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'coordinator', 'director', 'teacher')));
CREATE POLICY "lessons_manage_policy" ON public.course_lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'coordinator', 'director', 'teacher')));
CREATE POLICY "slots_manage_policy" ON public.lesson_activity_slots FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'coordinator', 'director', 'teacher')));
CREATE POLICY "assessments_manage_policy" ON public.course_assessments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'coordinator', 'director', 'teacher')));

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_grade ON public.courses(grade);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_course_units_course_id ON public.course_units(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_unit_id ON public.course_lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_week ON public.course_lessons(week_number);
CREATE INDEX IF NOT EXISTS idx_activity_slots_lesson_id ON public.lesson_activity_slots(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_assessments_course_id ON public.course_assessments(course_id);
