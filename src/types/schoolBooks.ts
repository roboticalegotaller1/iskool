export interface BookExercise {
  id: string;
  numero: number;
  instruccion: string;
  tipo: 'practica' | 'proyecto' | 'investigacion' | 'reflexion';
  paginaReferencia: number;
}

export interface BookChapter {
  id: string;
  numero: number;
  titulo: string;
  rangoPaginas: string; // ej. "14-25"
  paginaInicio: number;
  paginaFin: number;
  resumenTematico: string;
  conceptosClave: string[];
  preguntasDetonadoras: string[];
  pdaRelacionados: string[]; // Códigos o textos de PDA NEM
  campoFormativo: string;
  ejerciciosPropuestos: BookExercise[];
}

export interface SchoolDigitalBook {
  id: string;
  schoolId: string; // Aislamiento estricto por colegio
  schoolName: string;
  titulo: string;
  autorEditorial: string;
  materia: string; // ej. "Inglés", "Matemáticas", "Ciencias", etc.
  nivelEducativo: 'primaria_baja' | 'primaria_alta' | 'secundaria' | 'preparatoria';
  faseNEM: string; // "Fase 3", "Fase 4", "Fase 5", "Fase 6"
  grado: string; // "1º", "2º", "3º", etc.
  isbn?: string;
  cicloEscolar: string; // "2025-2026"
  totalPaginas: number;
  portadaColor: string; // Clases Tailwind para gradiente de portada
  archivoUrl?: string;
  archivoNombre?: string;
  archivoTamanoMb?: number;
  fechaCarga: string;
  capitulos: BookChapter[];
  palabrasClaveIndice: string[];
  estadoMapeo: 'completo' | 'procesando' | 'error';
}

export interface BookCitation {
  libroId: string;
  libroTitulo: string;
  autorEditorial: string;
  capituloNumero: number;
  capituloTitulo: string;
  rangoPaginas: string;
  paginaExacta?: number;
  textoReferencia: string;
}

export interface BookVoiceQueryResponse {
  query: string;
  respuestaNatural: string;
  citas: BookCitation[];
  conceptosRelacionados: string[];
  sugerenciaActividad?: string;
  confianza: number; // 0 a 1
}

export interface VerifiedCompendiumItem {
  tema: string;
  sintesisVerificada: string;
  librosConsultados: {
    libroTitulo: string;
    schoolName: string;
    grado: string;
    materia: string;
    capitulo: string;
    paginas: string;
  }[];
  preguntasClave: string[];
  propuestaPedagogicaTransversal: string;
}

export interface VerifiedCompendium {
  id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  creadoPor: string; // Super Usuario
  librosIds: string[];
  temas: VerifiedCompendiumItem[];
  conclusionesAcademicas: string;
}
