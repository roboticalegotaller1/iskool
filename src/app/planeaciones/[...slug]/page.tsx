import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  getVaultPlanningBySlug, 
  getAllVaultPlanningSlugs 
} from '@/lib/vaultMarkdownEngine';
import { 
  BookOpen, 
  ArrowLeft, 
  Calendar, 
  User, 
  Layers, 
  Award, 
  Printer, 
  Share2, 
  CheckCircle2,
  FileText
} from 'lucide-react';

// =========================================================================
// INCREMENTAL STATIC REGENERATION (ISR) - REVALIDACIÓN CADA HORA
// Servido directamente desde la caché de HTML estático pre-renderizado
// =========================================================================
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Generación Estática de Rutas (SSG) para todas las planeaciones e índices.
 */
export async function generateStaticParams() {
  const slugs = getAllVaultPlanningSlugs();
  // Retornar los primeros 100 slugs canónicos para optimizar tiempo de build estático
  return slugs.slice(0, 150);
}

/**
 * Metadatos SEO dinámicos y descriptivos.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const doc = getVaultPlanningBySlug(resolvedParams.slug);

  if (!doc) {
    return {
      title: 'Planeación no encontrada | Bóveda Curricular iSkool',
      description: 'El documento curricular solicitado no se encuentra en la bóveda.'
    };
  }

  const subject = doc.frontmatter.asignatura || doc.frontmatter.disciplina || 'Educación';
  const grade = doc.frontmatter.grado || doc.frontmatter.nivel || 'NEM 2024';

  return {
    title: `${doc.title} - ${subject} (${grade}) | Bóveda Curricular iSkool`,
    description: `Planeación didáctica oficial alineada a la Nueva Escuela Mexicana: ${doc.title}. PDA y secuencia didáctica dosificada.`,
    keywords: ['iSkool', 'Bóveda Curricular', 'Planeación Didáctica', 'NEM 2024', subject.toString(), grade.toString()]
  };
}

export default async function PlaneacionDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const doc = getVaultPlanningBySlug(resolvedParams.slug);

  if (!doc) {
    notFound();
  }

  const isIndexPage = doc.filename.startsWith('00_Indice_Maestro');
  const level = doc.frontmatter.nivel || doc.frontmatter.fase || '';
  const grade = doc.frontmatter.grado || '';
  const subject = doc.frontmatter.asignatura || doc.frontmatter.disciplina || doc.frontmatter.materia || '';
  const campo = doc.frontmatter.campo_formativo || '';
  const teacher = doc.frontmatter.docente || 'Prof. Israel López Ángeles';
  const formattedDate = doc.frontmatter.fecha_creacion || doc.frontmatter.created_at || 'Ciclo Escolar 2025-2026';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Institucional y Barra Superior */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/planeaciones" 
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-sm font-medium"
              title="Volver al Catálogo de Planeaciones"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Bóveda Curricular</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              {isIndexPage ? 'Índice Maestro' : 'Planeación Oficial'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/teacher"
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Panel Docente</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Cabecera del Documento Curricular */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {campo && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-600" />
                {String(campo)}
              </span>
            )}
            {subject && (
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-600" />
                {String(subject)}
              </span>
            )}
            {grade && (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-600" />
                {String(grade)}
              </span>
            )}
            {level && !grade && (
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {String(level)}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            {doc.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{teacher}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pre-renderizado desde Bóveda de Conocimiento</span>
            </div>
          </div>
        </div>

        {/* Contenido HTML Pre-renderizado y Sanitizado con DOMPurify */}
        <article className="bg-white rounded-2xl p-6 sm:p-10 shadow-xs border border-slate-200">
          <div 
            className="prose prose-slate max-w-none 
              prose-headings:text-slate-900 prose-headings:font-bold
              prose-h1:text-2xl prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-3 prose-h1:mb-6
              prose-h2:text-xl prose-h2:text-indigo-950 prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-base prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700 prose-blockquote:not-italic
              prose-table:w-full prose-table:text-sm prose-table:border-collapse prose-table:my-6
              prose-th:bg-slate-100 prose-th:text-slate-800 prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-slate-300
              prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-td:text-slate-700
              prose-tr:even:bg-slate-50/60
              prose-a:text-indigo-600 prose-a:font-semibold hover:prose-a:underline
              prose-code:bg-slate-100 prose-code:text-indigo-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5"
            dangerouslySetInnerHTML={{ __html: doc.renderedHtml }}
          />
        </article>

        {/* Pie de Página Institucional */}
        <footer className="mt-8 text-center text-xs text-slate-400 py-6 border-t border-slate-200">
          <p>Bóveda Central de Conocimiento Curricular • Sistema de Gestión Pedagógica iSkool</p>
          <p className="mt-1 text-slate-500">Documento pedagógico estructurado bajo los lineamientos oficiales de la Nueva Escuela Mexicana 2024.</p>
        </footer>
      </main>
    </div>
  );
}
