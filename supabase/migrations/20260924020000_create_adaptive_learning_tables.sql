-- ============================================================================
-- MIGRACIÓN: CREACIÓN DE TABLAS PARA ADAPTIVE LEARNING LAYER (FASE 7)
-- Perfiles Académicos de Alumnos, Micro-Competencias y Evidencias de Aprendizaje
-- ============================================================================

-- 1. Tabla de Perfiles Académicos del Estudiante (Student Academic Profiles)
-- Resume el nivel competencial del alumno por habilidad lingüística y general.
CREATE TABLE IF NOT EXISTS public.student_academic_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  
  subject TEXT NOT NULL DEFAULT 'english',
  grade TEXT NOT NULL, -- e.g., 'high_school_1'
  overall_estimated_level TEXT NOT NULL DEFAULT 'A1', -- e.g., 'B1'
  
  -- Granularidad por habilidad lingüística (CEFR + Confianza + Recuento)
  reading_level TEXT NOT NULL DEFAULT 'A1',
  reading_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (reading_confidence >= 0.0 AND reading_confidence <= 1.0),
  reading_evidence_count INT NOT NULL DEFAULT 0,
  
  listening_level TEXT NOT NULL DEFAULT 'A1',
  listening_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (listening_confidence >= 0.0 AND listening_confidence <= 1.0),
  listening_evidence_count INT NOT NULL DEFAULT 0,
  
  speaking_level TEXT NOT NULL DEFAULT 'A1',
  speaking_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (speaking_confidence >= 0.0 AND speaking_confidence <= 1.0),
  speaking_evidence_count INT NOT NULL DEFAULT 0,
  
  writing_level TEXT NOT NULL DEFAULT 'A1',
  writing_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (writing_confidence >= 0.0 AND writing_confidence <= 1.0),
  writing_evidence_count INT NOT NULL DEFAULT 0,
  
  grammar_level TEXT NOT NULL DEFAULT 'A1',
  grammar_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (grammar_confidence >= 0.0 AND grammar_confidence <= 1.0),
  grammar_evidence_count INT NOT NULL DEFAULT 0,
  
  vocabulary_level TEXT NOT NULL DEFAULT 'A1',
  vocabulary_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (vocabulary_confidence >= 0.0 AND vocabulary_confidence <= 1.0),
  vocabulary_evidence_count INT NOT NULL DEFAULT 0,
  
  profile_version INT NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT uq_student_subject_profile UNIQUE (student_id, subject)
);

-- 2. Tabla de Micro-Competencias del Estudiante (Student Competencies)
-- Rastrea el estado de maestría de cada concepto granular del Grafo Curricular.
CREATE TABLE IF NOT EXISTS public.student_competencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  knowledge_unit_id TEXT NOT NULL, -- ID canónico del nodo en la Bóveda Curricular (ej: 'speaking_expressing_opinions_b1')
  
  subject TEXT NOT NULL DEFAULT 'english',
  domain TEXT NOT NULL DEFAULT 'Skills', -- 'Skills', 'Grammar', 'Vocabulary', etc.
  skill TEXT NOT NULL, -- 'speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary'
  subskill TEXT,
  
  estimated_level TEXT NOT NULL DEFAULT 'A1', -- 'Foundation', 'Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'
  mastery_state TEXT NOT NULL DEFAULT 'not_assessed' CHECK (mastery_state IN ('not_assessed', 'introduced', 'developing', 'secure', 'mastered', 'needs_review')),
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  confidence_level TEXT NOT NULL DEFAULT 'low' CHECK (confidence_level IN ('low', 'medium', 'strong')),
  
  evidence_count INT NOT NULL DEFAULT 0,
  last_evidence_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'automatic' CHECK (source IN ('automatic', 'teacher_confirmed', 'diagnostic', 'assessment', 'manual')),
  
  -- Autoridad y control docente
  teacher_override BOOLEAN NOT NULL DEFAULT false,
  teacher_notes TEXT,
  locked BOOLEAN NOT NULL DEFAULT false,
  
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT uq_student_knowledge_unit UNIQUE (student_id, knowledge_unit_id)
);

-- 3. Tabla de Evidencias de Aprendizaje (Learning Evidences)
-- Registro auditable e inmutable de desempeños que alimentan al MasteryEngine.
CREATE TABLE IF NOT EXISTS public.learning_evidences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'quiz', 'exam', 'teacher_observation', 'class_activity', 'homework',
    'project', 'speaking_performance', 'writing_sample', 'diagnostic'
  )),
  
  skill TEXT NOT NULL,
  knowledge_targets TEXT[] NOT NULL DEFAULT '{}', -- IDs de la Bóveda Curricular evaluados
  learning_outcome TEXT,
  assessment_id UUID REFERENCES public.course_assessments(id) ON DELETE SET NULL,
  
  difficulty NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (difficulty >= 0.0 AND difficulty <= 1.0),
  score NUMERIC(5, 2) NOT NULL CHECK (score >= 0.0 AND score <= 100.0),
  rubric_level TEXT CHECK (rubric_level IN ('not_met', 'developing', 'secure', 'mastered')),
  attempts_count INT NOT NULL DEFAULT 1,
  
  result_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_student_profiles_student ON public.student_academic_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_school ON public.student_academic_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_student_competencies_student ON public.student_competencies(student_id);
CREATE INDEX IF NOT EXISTS idx_student_competencies_unit ON public.student_competencies(knowledge_unit_id);
CREATE INDEX IF NOT EXISTS idx_student_competencies_skill ON public.student_competencies(skill, mastery_state);
CREATE INDEX IF NOT EXISTS idx_learning_evidences_student ON public.learning_evidences(student_id, skill);
CREATE INDEX IF NOT EXISTS idx_learning_evidences_created ON public.learning_evidences(created_at DESC);

-- ============================================================================
-- SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.student_academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_evidences ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento escolar para perfiles
DROP POLICY IF EXISTS "student_profiles_isolation" ON public.student_academic_profiles;
CREATE POLICY "student_profiles_isolation"
  ON public.student_academic_profiles FOR ALL
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'coordinator', 'admin', 'director', 'superadmin')
    )
  );

-- Políticas de aislamiento escolar para competencias
DROP POLICY IF EXISTS "student_competencies_isolation" ON public.student_competencies;
CREATE POLICY "student_competencies_isolation"
  ON public.student_competencies FOR ALL
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'coordinator', 'admin', 'director', 'superadmin')
    )
  );

-- Políticas de aislamiento escolar para evidencias
DROP POLICY IF EXISTS "learning_evidences_isolation" ON public.learning_evidences;
CREATE POLICY "learning_evidences_isolation"
  ON public.learning_evidences FOR ALL
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'coordinator', 'admin', 'director', 'superadmin')
    )
  );
