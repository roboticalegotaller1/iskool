-- ============================================================================
-- MIGRACIÓN: CREACIÓN DE LA TABLA KNOWLEDGE_DOCUMENTS (BÓVEDA CURRICULAR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  school_stage TEXT[] DEFAULT '{}',
  grades TEXT[] DEFAULT '{}',
  cefr TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  content TEXT NOT NULL,
  source_ids TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'approved', 'deprecated')),
  version INT DEFAULT 1,
  checksum TEXT NOT NULL,
  indexed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Política de lectura: Contenido aprobado consultable por todos los usuarios autenticados
CREATE POLICY "knowledge_docs_approved_read"
  ON public.knowledge_documents FOR SELECT
  TO authenticated, anon
  USING (status = 'approved');

-- Política de lectura administrativa: Superadmin y Docentes pueden ver borradores y revisiones
CREATE POLICY "knowledge_docs_staff_read_all"
  ON public.knowledge_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('superadmin', 'admin', 'coordinator', 'teacher')
    )
  );

-- Política de gestión: Solo superadministradores pueden insertar o modificar
CREATE POLICY "knowledge_docs_admin_manage"
  ON public.knowledge_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('superadmin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('superadmin', 'admin')
    )
  );

-- Índices de alto rendimiento para búsquedas pedagógicas compuestas
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status ON public.knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_type ON public.knowledge_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_cefr ON public.knowledge_documents USING GIN(cefr);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_grades ON public.knowledge_documents USING GIN(grades);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_skills ON public.knowledge_documents USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_stage ON public.knowledge_documents USING GIN(school_stage);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_metadata ON public.knowledge_documents USING GIN(metadata);
