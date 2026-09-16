import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Sparkles, 
  FolderTree, 
  Compass, 
  Search, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Bóveda Curricular iSkool | Catálogo Maestro de Planeaciones NEM',
  description: 'Acceso directo a los índices maestros y planeaciones didácticas de Preescolar, Primaria, Secundaria y Preparatoria en formato pre-renderizado de alto rendimiento.'
};

const MASTER_INDICES = [
  {
    title: 'Secundaria (Fase 6: 1º a 3º Grado)',
    slug: '00_Indice_Maestro_Secundaria_Fase_6_NEM2024',
    badge: 'Fase 6',
    count: '348 Planeaciones',
    desc: 'Catálogo exhaustivo de Español, Matemáticas, Ciencias (Biología, Física, Química), Historia, Geografía, Formación Cívica y Ética, Inglés y Tecnología.',
    color: 'border-indigo-200 bg-indigo-50/50 hover:border-indigo-400'
  },
  {
    title: 'Primaria Fase 5 (5º y 6º Grado)',
    slug: '00_Indice_Maestro_Primaria_Fase_5',
    badge: 'Fase 5',
    count: 'Primaria Alta',
    desc: 'Proyectos integradores comunitarios, de aula y escolares orientados a Saberes y Pensamiento Científico, Lenguajes y Ética.',
    color: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
  },
  {
    title: 'Primaria Fase 4 (3º y 4º Grado)',
    slug: '00_Indice_Maestro_Primaria_Fase_4',
    badge: 'Fase 4',
    count: 'Primaria Media',
    desc: 'Secuencias didácticas con preguntas detonadoras, rúbricas analíticas y vinculación con libros de texto gratuitos de la SEP.',
    color: 'border-amber-200 bg-amber-50/50 hover:border-amber-400'
  },
  {
    title: 'Primaria Fase 3 (1º y 2º Grado)',
    slug: '00_Indice_Maestro_Primaria_Fase_3',
    badge: 'Fase 3',
    count: 'Primaria Baja',
    desc: 'Alfabetización inicial, conteo con material concreto, cuidado del entorno y exploración sensible de los lenguajes artísticos.',
    color: 'border-rose-200 bg-rose-50/50 hover:border-rose-400'
  },
  {
    title: 'Bóveda Curricular General (MOC)',
    slug: '00_Indice_Maestro_Boveda_Curricular',
    badge: 'MOC Central',
    count: 'Todos los Grados',
    desc: 'Mapa de contenidos general de la Bóveda Central de Conocimiento que articula todos los niveles escolares.',
    color: 'border-purple-200 bg-purple-50/50 hover:border-purple-400'
  },
  {
    title: 'Preparatoria / Bachillerato (MCCEMS)',
    slug: '00_Indice_Maestro_Preparatoria_MCCEMS',
    badge: 'MCCEMS',
    count: 'Medio Superior',
    desc: 'Progresiones de aprendizaje del Marco Curricular Común de la Educación Media Superior.',
    color: 'border-cyan-200 bg-cyan-50/50 hover:border-cyan-400'
  }
];

export default function PlaneacionesIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header Institucional */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-600" />
                  SSG & ISR Activado
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Sanitizado contra XSS
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Bóveda Curricular Institucional
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Repositorio de planeaciones didácticas de la Nueva Escuela Mexicana pre-renderizadas en HTML estático con regeneración incremental para máxima velocidad.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/teacher"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Panel Docente</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Catálogo de Índices Maestros */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-600" />
            Índices Maestros de la Bóveda Curricular
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Respuestas pre-renderizadas en caché (&lt; 2ms)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MASTER_INDICES.map((idx) => (
            <Link
              key={idx.slug}
              href={`/planeaciones/${idx.slug}`}
              className={`p-6 rounded-2xl bg-white border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group ${idx.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                    {idx.badge}
                  </span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {idx.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {idx.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {idx.desc}
                </p>
              </div>

              <div className="flex items-center text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 pt-3 border-t border-slate-100">
                <span>Explorar Índice Maestro</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
