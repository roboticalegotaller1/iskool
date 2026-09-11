"use client";

import React, { useState } from 'react';
import { useSchoolBooksStore } from '@/store/useSchoolBooksStore';
import { 
  VerifiedCompendium, 
  SchoolDigitalBook 
} from '@/types/schoolBooks';
import { SmartBookNotebookModal } from './SmartBookNotebookModal';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Square, 
  Download, 
  Printer, 
  Trash2, 
  Plus, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Search,
  ChevronRight,
  Bookmark,
  Share2,
  CheckCircle2,
  Brain
} from 'lucide-react';

export const SuperUserCompendiumStudio: React.FC = () => {
  const allBooks = useSchoolBooksStore(state => state.books);
  const compendiums = useSchoolBooksStore(state => state.compendiums);
  const createCompendium = useSchoolBooksStore(state => state.createSuperUserCompendium);
  const deleteCompendium = useSchoolBooksStore(state => state.deleteCompendium);

  // Estados de selección y filtros
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [activeCompendiumId, setActiveCompendiumId] = useState<string | null>(
    compendiums[0]?.id || null
  );
  const [compendiumTitle, setCompendiumTitle] = useState('');
  const [compendiumDesc, setCompendiumDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [notebookBook, setNotebookBook] = useState<SchoolDigitalBook | null>(null);

  const toggleBookSelection = (id: string) => {
    setSelectedBookIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookIds.length < 1) {
      alert("Por favor selecciona al menos un libro institucional para generar el compendio.");
      return;
    }

    const newComp = createCompendium(
      compendiumTitle || `Compendio Temático Intercolegial (${selectedBookIds.length} Obras)`,
      compendiumDesc || `Consolidación transversal de contenidos curriculares analizados a 0 tokens.`,
      selectedBookIds
    );

    setActiveCompendiumId(newComp.id);
    setIsCreating(false);
    setCompendiumTitle('');
    setCompendiumDesc('');
    setSelectedBookIds([]);
  };

  const activeCompendium = compendiums.find(c => c.id === activeCompendiumId);

  const filteredBooks = allBooks.filter(b => 
    !searchFilter || 
    b.titulo.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.schoolName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.materia.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner de Super Usuario */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white border-2 border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-400/30">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Exclusivo: Super Usuario Institucional • Motor Multi-Colegio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Estudio de Compendios de Información Verificada
          </h2>
          <p className="text-xs text-purple-200 leading-relaxed">
            Consolida y cruza la información de todos los libros digitales registrados en el sistema. Genera compendios temáticos de información verificada a 0 tokens con citas cruzadas, análisis interdisciplinario y proyectos transversales.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Compendio Multi-Libro</span>
        </button>
      </div>

      {/* Modal / Panel de Creación de Compendio */}
      {isCreating && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-purple-500/30 shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Configurar Nuevo Compendio Temático
              </h3>
              <p className="text-xs text-slate-500">Selecciona los libros que deseas unificar y validar</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Título del Compendio:
                </label>
                <input
                  type="text"
                  required
                  value={compendiumTitle}
                  onChange={(e) => setCompendiumTitle(e.target.value)}
                  placeholder="ej. Compendio Integral de Ciencias y Matemáticas NEM 2026"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Descripción o Enfoque Pedagógico:
                </label>
                <input
                  type="text"
                  value={compendiumDesc}
                  onChange={(e) => setCompendiumDesc(e.target.value)}
                  placeholder="ej. Análisis transversal para juntas de academia y planeaciones colegiadas"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Selector de Libros Multi-Colegio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Selecciona los Libros a Integrar ({selectedBookIds.length} seleccionados):
                </label>
                <div className="w-60">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por colegio o materia..."
                    className="w-full px-3 py-1 text-[11px] rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-750">
                {filteredBooks.map((book) => {
                  const isChecked = selectedBookIds.includes(book.id);
                  return (
                    <div
                      key={book.id}
                      onClick={() => toggleBookSelection(book.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isChecked 
                          ? 'bg-purple-100/70 dark:bg-purple-950/60 border-purple-500 shadow-xs' 
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="mt-0.5 text-purple-600">
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-[11px] text-slate-900 dark:text-white block truncate">
                          {book.titulo}
                        </span>
                        <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold block truncate">
                          🏛️ {book.schoolName}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          {book.materia} • {book.grado} ({book.faseNEM})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={selectedBookIds.length === 0}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                Consolidar Compendio ({selectedBookIds.length} Libros)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Visor de Compendios Generados */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista Lateral de Compendios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Compendios Generados ({compendiums.length})
            </span>
          </div>

          {compendiums.length === 0 ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 space-y-2">
              <Layers className="w-6 h-6 text-purple-400 mx-auto" />
              <p>Aún no has generado ningún compendio intercolegial.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {compendiums.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setActiveCompendiumId(comp.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    activeCompendiumId === comp.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 border-purple-600'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-purple-300 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold opacity-80">
                      {new Date(comp.fechaCreacion).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/20">
                      {comp.librosIds.length} Libros
                    </span>
                  </div>
                  <h4 className="font-black text-xs line-clamp-1">
                    {comp.titulo}
                  </h4>
                  <p className="text-[10px] opacity-80 line-clamp-2">
                    {comp.descripcion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle del Compendio Activo */}
        <div className="lg:col-span-3">
          {activeCompendium ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      ✓ Información Curricular Verificada
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ID: {activeCompendium.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {activeCompendium.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {activeCompendium.descripcion}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    title="Imprimir o Guardar PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("¿Deseas eliminar este compendio institucional?")) {
                        deleteCompendium(activeCompendium.id);
                        setActiveCompendiumId(null);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                    title="Eliminar Compendio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Temas Consolidados */}
              <div className="space-y-4">
                <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider block">
                  Articulación Temática y Sustento Cruzado:
                </span>

                <div className="space-y-4">
                  {activeCompendium.temas.map((item, tIdx) => (
                    <div 
                      key={tIdx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-700 pb-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          Tema {tIdx + 1}: {item.tema}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.librosConsultados.length} fuentes consultadas
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                        {item.sintesisVerificada}
                      </p>

                      {/* Tabla de Libros Consultados */}
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                        <span className="font-bold text-[10px] text-slate-500 uppercase block">
                          📖 Fuentes Institucionales y Páginas de Referencia:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {item.librosConsultados.map((src, sIdx) => (
                            <div key={sIdx} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-750">
                              <strong className="text-slate-900 dark:text-white block font-bold truncate">
                                {src.libroTitulo}
                              </strong>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                                {src.schoolName} ({src.grado} • {src.materia})
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {src.capitulo} • <strong>Págs. {src.paginas}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Propuesta Pedagógica Transversal */}
                      <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                        <strong className="font-bold block text-purple-800 dark:text-purple-300">
                          💡 Propuesta de Proyecto Transversal Colegiado:
                        </strong>
                        <p className="text-[11px]">
                          {item.propuestaPedagogicaTransversal}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dictamen Académico Final */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <strong className="font-bold block text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Conclusiones de Auditoría Curricular:
                </strong>
                <p className="text-[11px] leading-relaxed">
                  {activeCompendium.conclusionesAcademicas}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-purple-400 mx-auto" />
              <p>Selecciona un compendio de la lista izquierda para visualizar su análisis o crea uno nuevo arriba.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cuaderno Inteligente si se requiere inspección */}
      {notebookBook && (
        <SmartBookNotebookModal
          book={notebookBook}
          isOpen={!!notebookBook}
          onClose={() => setNotebookBook(null)}
        />
      )}
    </div>
  );
};
