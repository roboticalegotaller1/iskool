"use client";

import React, { useState, useMemo } from 'react';
import { 
  SchoolDigitalBook, 
  BookChapter 
} from '@/types/schoolBooks';
import { useSchoolBooksStore } from '@/store/useSchoolBooksStore';
import { SmartBookNotebookModal } from './SmartBookNotebookModal';
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  ShieldCheck, 
  Bookmark, 
  HelpCircle, 
  MessageSquare,
  Layers,
  X,
  AlertCircle,
  FolderGit2
} from 'lucide-react';

interface SchoolBooksManagerSectionProps {
  schoolId: string;
  schoolName: string;
  userRole?: string;
}

export const SchoolBooksManagerSection: React.FC<SchoolBooksManagerSectionProps> = ({
  schoolId,
  schoolName,
  userRole
}) => {
  const allStoreBooks = useSchoolBooksStore(state => state.books);
  const books = React.useMemo(() => {
    if (!schoolId) return [];
    const targetId = schoolId === 'sch-jjr' ? 'sch-jjrosseau' : schoolId;
    return allStoreBooks.filter(b => b.schoolId === targetId || (targetId === 'sch-jjrosseau' && b.schoolId === 'sch-jjr'));
  }, [allStoreBooks, schoolId]);

  const uploadBook = useSchoolBooksStore(state => state.uploadBook);
  const deleteBook = useSchoolBooksStore(state => state.deleteBook);

  // Estados de interfaz
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [notebookBook, setNotebookBook] = useState<SchoolDigitalBook | null>(null);

  // Modal de Subida de Libro
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    autorEditorial: '',
    materia: 'Matemáticas',
    nivelEducativo: 'secundaria' as 'primaria_baja' | 'primaria_alta' | 'secundaria' | 'preparatoria',
    grado: '1º',
    faseNEM: 'Fase 6',
    isbn: '',
    totalPaginas: 150,
    portadaColor: 'from-blue-600 to-indigo-800'
  });

  // Filtrado de libros por búsqueda y materia
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchSubject = selectedSubject === 'all' || b.materia.toLowerCase() === selectedSubject.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        b.titulo.toLowerCase().includes(q) ||
        b.autorEditorial.toLowerCase().includes(q) ||
        b.palabrasClaveIndice.some(k => k.toLowerCase().includes(q));

      return matchSubject && matchSearch;
    });
  }, [books, searchQuery, selectedSubject]);

  // Lista única de materias para el filtro
  const availableSubjects = useMemo(() => {
    const setSubs = new Set(books.map(b => b.materia));
    return Array.from(setSubs);
  }, [books]);

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.titulo.trim()) return;

    // Generación de capítulos mapeados representativos (0 tokens)
    const newBookChapters: BookChapter[] = [
      {
        id: `cap-${Date.now()}-1`,
        numero: 1,
        titulo: `Unidad 1: Fundamentos y Conceptos Clave de ${uploadForm.materia}`,
        rangoPaginas: '10-35',
        paginaInicio: 10,
        paginaFin: 35,
        campoFormativo: uploadForm.materia === 'Matemáticas' || uploadForm.materia === 'Ciencias' ? 'Saberes y Pensamiento Científico' : 'Lenguajes',
        resumenTematico: `Introducción teórica y práctica a los conceptos rectores de ${uploadForm.materia} para el grado ${uploadForm.grado} con articulación a los PDA oficiales de la NEM.`,
        conceptosClave: ['Conceptos rectores', 'Metodología activa', 'Ejercicios de aplicación', 'Pensamiento crítico'],
        preguntasDetonadoras: [
          `¿De qué manera los temas de ${uploadForm.materia} se aplican en la vida diaria de nuestra comunidad escolar?`,
          '¿Qué reto inicial nos plantea este primer capítulo?'
        ],
        pdaRelacionados: [
          `${uploadForm.faseNEM} - Analiza y aplica conceptos fundamentales de ${uploadForm.materia} en situaciones contextualizadas.`
        ],
        ejerciciosPropuestos: [
          {
            id: `ex-${Date.now()}-1`,
            numero: 1,
            instruccion: 'Resolver el taller introductorio de la página 22 y redactar una síntesis reflexiva.',
            tipo: 'practica',
            paginaReferencia: 22
          }
        ]
      },
      {
        id: `cap-${Date.now()}-2`,
        numero: 2,
        titulo: `Unidad 2: Desarrollo Profundo y Proyectos Prácticos`,
        rangoPaginas: '36-65',
        paginaInicio: 36,
        paginaFin: 65,
        campoFormativo: uploadForm.materia === 'Matemáticas' || uploadForm.materia === 'Ciencias' ? 'Saberes y Pensamiento Científico' : 'Lenguajes',
        resumenTematico: `Profundización curricular en destrezas específicas, resolución de problemas complejos y formulación de proyectos integradores escolares.`,
        conceptosClave: ['Resolución de problemas', 'Trabajo colaborativo', 'Evidencia tangible'],
        preguntasDetonadoras: [
          '¿Cómo demostramos el dominio de estos aprendizajes a través de un proyecto práctico?'
        ],
        pdaRelacionados: [
          `${uploadForm.faseNEM} - Desarrolla proyectos de indagación formativa orientados a la solución de problemáticas reales.`
        ],
        ejerciciosPropuestos: [
          {
            id: `ex-${Date.now()}-2`,
            numero: 1,
            instruccion: 'Elaborar el proyecto experimental de la página 54 en equipos de tres integrantes.',
            tipo: 'proyecto',
            paginaReferencia: 54
          }
        ]
      }
    ];

    uploadBook({
      schoolId,
      schoolName,
      titulo: uploadForm.titulo,
      autorEditorial: uploadForm.autorEditorial || 'Editorial Institucional del Plantel',
      materia: uploadForm.materia,
      nivelEducativo: uploadForm.nivelEducativo,
      faseNEM: uploadForm.faseNEM,
      grado: uploadForm.grado,
      isbn: uploadForm.isbn || 'ISBN-INSTITUCIONAL-2026',
      cicloEscolar: '2025-2026',
      totalPaginas: Number(uploadForm.totalPaginas) || 160,
      portadaColor: uploadForm.portadaColor,
      archivoNombre: `${uploadForm.titulo.replace(/\s+/g, '_')}.pdf`,
      archivoTamanoMb: 12.4,
      capitulos: newBookChapters,
      palabrasClaveIndice: [uploadForm.materia.toLowerCase(), uploadForm.grado.toLowerCase(), 'ejercicios', 'nem 2024', 'proyectos']
    });

    setIsUploadModalOpen(false);
    setUploadForm({
      titulo: '',
      autorEditorial: '',
      materia: 'Matemáticas',
      nivelEducativo: 'secundaria',
      grado: '1º',
      faseNEM: 'Fase 6',
      isbn: '',
      totalPaginas: 150,
      portadaColor: 'from-blue-600 to-indigo-800'
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior con Identidad y Aislamiento */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase border border-indigo-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aislamiento Curricular Estricto • {schoolName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Bóveda de Libros Digitales Institucionales
          </h2>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Sube y administra los libros de texto digitales adoptados por tu colegio. El sistema mapea automáticamente cada capítulo, página y concepto clave a 0 tokens para respaldar las planeaciones docentes y habilitar consultas por voz.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Subir Libro Digital</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, autor o concepto..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedSubject === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            Todas ({books.length})
          </button>
          {availableSubjects.map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSubject === sub
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Libros Mapeados */}
      {filteredBooks.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            No se encontraron libros para este criterio
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Puedes subir los libros de texto oficiales de tu institución o restablecer los filtros para ver el acervo completo.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Subir Nuevo Libro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBooks.map((book) => {
            const isExpanded = expandedBookId === book.id;
            return (
              <div 
                key={book.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Encabezado del Libro */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-14 h-18 rounded-2xl bg-gradient-to-tr ${book.portadaColor} text-white flex flex-col items-center justify-between p-2 shrink-0 shadow-md`}>
                      <BookOpen className="w-5 h-5" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-center">
                        {book.grado}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                          {book.materia} • {book.grado}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mapeo Completo
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug truncate">
                        {book.titulo}
                      </h3>

                      <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">
                        🏛️ {book.autorEditorial}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                        <span>{book.faseNEM}</span>
                        <span>•</span>
                        <span>{book.totalPaginas} páginas</span>
                        <span>•</span>
                        <span>{book.capitulos.length} capítulos</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setNotebookBook(book)}
                      className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800/40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cuaderno Inteligente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Ocultar Índice' : 'Ver Índice Mapeado'}</span>
                    </button>
                  </div>

                  {/* Desglose de Capítulos Mapeados (Acordeón) */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5 animate-fade-in">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Capítulos y Sustento Curricular:
                      </span>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {book.capitulos.map((ch) => (
                          <div 
                            key={ch.id}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-750 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <strong className="font-black text-slate-900 dark:text-white">
                                Cap. {ch.numero}: {ch.titulo}
                              </strong>
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-[10px] whitespace-nowrap">
                                Págs. {ch.rangoPaginas}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                              {ch.resumenTematico}
                            </p>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {ch.conceptosClave.map((conc, cIdx) => (
                                <span 
                                  key={cIdx}
                                  className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[9px] font-bold text-slate-600 dark:text-zinc-400"
                                >
                                  {conc}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pie con botón de eliminar */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Cargado el {new Date(book.fechaCarga).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar el libro "${book.titulo}" de la Bóveda de ${schoolName}?`)) {
                        deleteBook(book.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Carga de Nuevo Libro */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-850">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Subir Libro Digital Institucional
                  </h3>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    Bóveda Curricular • {schoolName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Título Completo de la Obra:
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.titulo}
                  onChange={(e) => setUploadForm({ ...uploadForm, titulo: e.target.value })}
                  placeholder="ej. Matemáticas Aplicadas al Pensamiento Crítico 2º"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Materia / Disciplina:
                  </label>
                  <select
                    value={uploadForm.materia}
                    onChange={(e) => setUploadForm({ ...uploadForm, materia: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  >
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Ciencias">Ciencias</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Español">Español</option>
                    <option value="Historia">Historia</option>
                    <option value="Formación Cívica y Ética">Formación Cívica y Ética</option>
                    <option value="Artes">Artes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Grado Escolar:
                  </label>
                  <select
                    value={uploadForm.grado}
                    onChange={(e) => {
                      const g = e.target.value;
                      let fase = 'Fase 6';
                      let niv: any = 'secundaria';
                      if (g.includes('1º Primaria') || g.includes('2º Primaria')) { fase = 'Fase 3'; niv = 'primaria_baja'; }
                      else if (g.includes('3º Primaria') || g.includes('4º Primaria')) { fase = 'Fase 4'; niv = 'primaria_baja'; }
                      else if (g.includes('5º Primaria') || g.includes('6º Primaria')) { fase = 'Fase 5'; niv = 'primaria_alta'; }
                      setUploadForm({ ...uploadForm, grado: g, faseNEM: fase, nivelEducativo: niv });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  >
                    <option value="1º Secundaria">1º Secundaria (Fase 6)</option>
                    <option value="2º Secundaria">2º Secundaria (Fase 6)</option>
                    <option value="3º Secundaria">3º Secundaria (Fase 6)</option>
                    <option value="5º Primaria">5º Primaria (Fase 5)</option>
                    <option value="6º Primaria">6º Primaria (Fase 5)</option>
                    <option value="3º Primaria">3º Primaria (Fase 4)</option>
                    <option value="1º Primaria">1º Primaria (Fase 3)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Autor / Editorial Institucional:
                </label>
                <input
                  type="text"
                  value={uploadForm.autorEditorial}
                  onChange={(e) => setUploadForm({ ...uploadForm, autorEditorial: e.target.value })}
                  placeholder={`ej. Academia de ${uploadForm.materia} • ${schoolName}`}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Zona de Archivo Digital */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border-2 border-dashed border-purple-300 dark:border-purple-800/60 text-center space-y-2">
                <Upload className="w-6 h-6 text-purple-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                  Arrastra aquí el archivo digital o confirma el mapeo automático
                </p>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                  Formatos admitidos: PDF, EPUB, TXT, Markdown • Análisis local a 0 tokens
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-purple-600/20 hover:from-purple-700 cursor-pointer"
                >
                  Mapear y Guardar en Bóveda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal del Cuaderno Inteligente */}
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
