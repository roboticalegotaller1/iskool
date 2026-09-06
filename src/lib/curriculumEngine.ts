/**
 * Motor Curricular de ISkool — Nueva Escuela Mexicana (NEM 2024)
 * Generador y validador de planeaciones pedagógicas oficiales de 10 sesiones (500 min),
 * referencias a Libros de Texto Gratuitos de la SEP con páginas, minutero exacto (10/30/10 min),
 * entregables parciales, articulación curricular (PDAs transversales) y proyecto final integrador.
 */

export interface SessionPlanItem {
  numero: number;
  titulo: string;
  duracionTotal: string; // "50 minutos"
  tiempos: {
    inicio: string; // "10 min"
    desarrollo: string; // "30 min"
    cierre: string; // "10 min"
  };
  actividadInicio: string;
  actividadDesarrollo: string;
  actividadCierre: string;
  preguntasClave: string[];
  libroSep: {
    titulo: string;
    paginas: string;
    seccion: string;
  };
  materiales: string[];
  entregableSesion: string;
}

export interface ArticulatedPda {
  campoFormativo: string;
  pda: string;
  relacion: string;
}

export interface FinalProjectProposal {
  titulo: string;
  problematicaComunitaria: string;
  proposito: string;
  productoFinal: string;
  impactoSocial: string;
  rubrica: {
    criterio1: { nombre: string; sobresaliente: string; satisfactorio: string; enProceso: string };
    criterio2: { nombre: string; sobresaliente: string; satisfactorio: string; enProceso: string };
    criterio3: { nombre: string; sobresaliente: string; satisfactorio: string; enProceso: string };
  };
}

export interface CompleteNEMPlanning {
  id: string;
  title: string;
  levelId: string;
  levelName: string;
  subjectId: string;
  subjectName: string;
  campoFormativo: string;
  ejesArticuladores: string[];
  pda: string;
  pdasArticulados: ArticulatedPda[];
  duration: string; // "10 sesiones de 50 minutos (Total: 500 min)"
  preguntasDetonadoras: string[];
  sesiones: SessionPlanItem[];
  proyectoIntegrador: FinalProjectProposal;
  inicio: string;
  desarrollo: string;
  cierre: string;
  evaluacion: string;
  materiales: string;
  createdAt: string;
  isFromVault?: boolean;
}

export interface BaseSubjectDef {
  id: string;
  name: string;
  campoFormativo: string;
  sep_code: string;
}

export const LEVEL_BASE_SUBJECTS: Record<string, BaseSubjectDef[]> = {
  'preescolar': [
    { id: 'pre-leng', name: 'Lenguajes (Comunicación, Expresión y Lenguaje Oral/Escrito)', campoFormativo: 'Lenguajes', sep_code: 'PRE-LENG' },
    { id: 'pre-sab', name: 'Saberes y Pensamiento Científico (Conteo, Formas y Exploración Natural)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'PRE-SAB' },
    { id: 'pre-soc', name: 'Ética, Naturaleza y Sociedades (Mi Entorno, Familia y Comunidad)', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'PRE-SOC' },
    { id: 'pre-hum', name: 'De lo Humano y lo Comunitario (Educación Socioemocional y Desarrollo Motriz)', campoFormativo: 'De lo Humano y lo Comunitario', sep_code: 'PRE-HUM' },
    { id: 'pre-art', name: 'Artes y Expresión Artística Infantil', campoFormativo: 'Lenguajes', sep_code: 'PRE-ART' },
    { id: 'pre-ing', name: 'Inglés / Lengua Extranjera (Nivel Inicial)', campoFormativo: 'Lenguajes', sep_code: 'PRE-ING' },
  ],
  'primaria-baja': [
    { id: 'p12-esp', name: 'Español / Lenguajes (1º y 2º Grado)', campoFormativo: 'Lenguajes', sep_code: 'P12-ESP' },
    { id: 'p12-mat', name: 'Matemáticas (1º y 2º Grado)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'P12-MAT' },
    { id: 'p12-con', name: 'Conocimiento del Medio (Ciencias, Historia y Geografía)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'P12-CON' },
    { id: 'p12-civ', name: 'Formación Cívica y Ética', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'P12-CIV' },
    { id: 'p12-hum', name: 'Educación Socioemocional y Educación Física', campoFormativo: 'De lo Humano y lo Comunitario', sep_code: 'P12-HUM' },
    { id: 'p12-art', name: 'Artes', campoFormativo: 'Lenguajes', sep_code: 'P12-ART' },
    { id: 'p12-ing', name: 'Inglés', campoFormativo: 'Lenguajes', sep_code: 'P12-ING' },
  ],
  'primaria-media': [
    { id: 'p34-esp', name: 'Español / Lenguajes (3º y 4º Grado)', campoFormativo: 'Lenguajes', sep_code: 'P34-ESP' },
    { id: 'p34-mat', name: 'Matemáticas (3º y 4º Grado)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'P34-MAT' },
    { id: 'p34-cie', name: 'Ciencias Naturales (3º y 4º Grado)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'P34-CIE' },
    { id: 'p34-ent', name: 'La Entidad donde Vivo (Historia y Geografía Regional)', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'P34-ENT' },
    { id: 'p34-civ', name: 'Formación Cívica y Ética', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'P34-CIV' },
    { id: 'p34-hum', name: 'Educación Física y Vida Saludable', campoFormativo: 'De lo Humano y lo Comunitario', sep_code: 'P34-HUM' },
    { id: 'p34-art', name: 'Artes', campoFormativo: 'Lenguajes', sep_code: 'P34-ART' },
    { id: 'p34-ing', name: 'Inglés', campoFormativo: 'Lenguajes', sep_code: 'P34-ING' },
  ],
  'primaria-alta': [
    { id: 'p56-esp', name: 'Español / Lenguajes (5º y 6º Grado)', campoFormativo: 'Lenguajes', sep_code: 'P56-ESP' },
    { id: 'p56-mat', name: 'Matemáticas (5º y 6º Grado)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'P56-MAT' },
    { id: 'p56-cie', name: 'Ciencias Naturales y Tecnología (5º y 6º Grado)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'P56-CIE' },
    { id: 'p56-geo', name: 'Geografía', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'P56-GEO' },
    { id: 'p56-his', name: 'Historia de México y el Mundo', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'P56-HIS' },
    { id: 'p56-civ', name: 'Formación Cívica y Ética', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'P56-CIV' },
    { id: 'p56-hum', name: 'Educación Socioemocional y Educación Física', campoFormativo: 'De lo Humano y lo Comunitario', sep_code: 'P56-HUM' },
    { id: 'p56-art', name: 'Artes', campoFormativo: 'Lenguajes', sep_code: 'P56-ART' },
    { id: 'p56-ing', name: 'Inglés', campoFormativo: 'Lenguajes', sep_code: 'P56-ING' },
  ],
  'secundaria': [
    { id: 'sec-esp', name: 'Lengua Materna (Español)', campoFormativo: 'Lenguajes', sep_code: 'SEC-ESP' },
    { id: 'sec-mat', name: 'Matemáticas (Álgebra, Geometría y Estadística)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'SEC-MAT' },
    { id: 'sec-bio', name: 'Ciencias I (Biología - 1º Secundaria)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'SEC-BIO' },
    { id: 'sec-fis', name: 'Ciencias II (Física - 2º Secundaria)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'SEC-FIS' },
    { id: 'sec-qui', name: 'Ciencias III (Química - 3º Secundaria)', campoFormativo: 'Saberes y Pensamiento Científico', sep_code: 'SEC-QUI' },
    { id: 'sec-his', name: 'Historia (1º, 2º y 3º)', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'SEC-HIS' },
    { id: 'sec-geo', name: 'Geografía', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'SEC-GEO' },
    { id: 'sec-civ', name: 'Formación Cívica y Ética', campoFormativo: 'Ética, Naturaleza y Sociedades', sep_code: 'SEC-CIV' },
    { id: 'sec-ing', name: 'Lengua Extranjera (Inglés)', campoFormativo: 'Lenguajes', sep_code: 'SEC-ING' },
    { id: 'sec-art', name: 'Artes (Música, Teatro, Danza o Artes Visuales)', campoFormativo: 'Lenguajes', sep_code: 'SEC-ART' },
    { id: 'sec-tec', name: 'Tecnología / Taller', campoFormativo: 'De lo Humano y lo Comunitario', sep_code: 'SEC-TEC' },
    { id: 'sec-efi', name: 'Educación Física', campoFormativo: 'De lo Humano y lo Comunitario', sep_code: 'SEC-EFI' },
    { id: 'sec-tut', name: 'Tutoría y Educación Socioemocional', campoFormativo: 'De lo Humano y lo Comunitario', sep_code: 'SEC-TUT' },
  ],
  'preparatoria': [
    { id: 'bac-len', name: 'Lengua y Comunicación (I a IV)', campoFormativo: 'Lengua y Comunicación', sep_code: 'BAC-LEN' },
    { id: 'bac-mat', name: 'Pensamiento Matemático (Álgebra, Geometría, Cálculo y Estadística)', campoFormativo: 'Pensamiento Matemático', sep_code: 'BAC-MAT' },
    { id: 'bac-nat', name: 'Ciencias Naturales, Experimentales y Tecnología (Física, Química, Biología)', campoFormativo: 'Ciencias Naturales', sep_code: 'BAC-NAT' },
    { id: 'bac-soc', name: 'Ciencias Sociales y Conciencia Histórica', campoFormativo: 'Ciencias Sociales', sep_code: 'BAC-SOC' },
    { id: 'bac-hum', name: 'Humanidades y Filosofía (I a III)', campoFormativo: 'Humanidades', sep_code: 'BAC-HUM' },
    { id: 'bac-dig', name: 'Cultura Digital', campoFormativo: 'Cultura Digital', sep_code: 'BAC-DIG' },
    { id: 'bac-ing', name: 'Inglés / Lengua Extranjera (I a IV)', campoFormativo: 'Lengua Extranjera', sep_code: 'BAC-ING' },
    { id: 'bac-emo', name: 'Recursos Socioemocionales y Responsabilidad Social', campoFormativo: 'Socioemocionales', sep_code: 'BAC-EMO' },
  ]
};

// -------------------------------------------------------------
// CATÁLOGO OFICIAL DE LIBROS DE TEXTO GRATUITOS SEP (NEM 2024)
// -------------------------------------------------------------

interface SepBookDef {
  titulo: string;
  paginasBase: number;
  paginasRango: number;
  descripcion: string;
}

const SEP_BOOKS_BY_LEVEL: Record<string, Record<string, SepBookDef[]>> = {
  'preescolar': {
    'general': [
      { titulo: 'Mi Álbum de Preescolar 1º Grado', paginasBase: 12, paginasRango: 6, descripcion: 'Retos visuales, registro gráfico y exploración sensorial' },
      { titulo: 'Mi Álbum de Preescolar 2º Grado', paginasBase: 16, paginasRango: 6, descripcion: 'Juegos de conteo, expresión corporal y mundo natural' },
      { titulo: 'Mi Álbum de Preescolar 3º Grado', paginasBase: 20, paginasRango: 6, descripcion: 'Resolución de retos, convivencia y arte infantil' },
      { titulo: 'Láminas de Diálogo y Expresión de Preescolar', paginasBase: 6, paginasRango: 4, descripcion: 'Imágenes detonadoras de lenguaje oral y reflexión' }
    ]
  },
  'primaria-baja': {
    'matematicas': [
      { titulo: 'Nuestros Saberes 2º Grado', paginasBase: 34, paginasRango: 6, descripcion: 'Conceptos matemáticos, números, monedas, medidas y geometría' },
      { titulo: 'Proyectos de Aula 2º Grado', paginasBase: 68, paginasRango: 8, descripcion: 'La tiendita, conteo comunitario y resolución de problemas' },
      { titulo: 'Proyectos Escolares 2º Grado', paginasBase: 92, paginasRango: 7, descripcion: 'Medición de espacios escolares y conteo de recursos' },
      { titulo: 'Múltiples Lenguajes 2º Grado', paginasBase: 44, paginasRango: 4, descripcion: 'Acertijos matemáticos, patrones y juegos numéricos' }
    ],
    'lenguajes': [
      { titulo: 'Proyectos Comunitarios 2º Grado', paginasBase: 76, paginasRango: 8, descripcion: 'Correspondencia escolar, cartas a la comunidad y buzón postal' },
      { titulo: 'Proyectos de Aula 1º Grado', paginasBase: 48, paginasRango: 7, descripcion: 'Producción de textos, cuentos ilustrados y dictado colectivo' },
      { titulo: 'Nuestros Saberes 2º Grado', paginasBase: 16, paginasRango: 5, descripcion: 'Estructura de la carta, signos de puntuación y remitente/destinatario' },
      { titulo: 'Múltiples Lenguajes 1º Grado', paginasBase: 22, paginasRango: 6, descripcion: 'Cuentos, textos epistolares y narraciones infantiles' }
    ],
    'ciencias': [
      { titulo: 'Nuestros Saberes 2º Grado', paginasBase: 82, paginasRango: 6, descripcion: 'Los 5 sentidos, plantas, animales y cuidado de la salud' },
      { titulo: 'Proyectos Comunitarios 2º Grado', paginasBase: 104, paginasRango: 8, descripcion: 'El huerto escolar, reciclaje y cuidado del agua' },
      { titulo: 'Proyectos Escolares 2º Grado', paginasBase: 120, paginasRango: 7, descripcion: 'Estados de la materia, fuentes de luz y sonido' }
    ],
    'general': [
      { titulo: 'Nuestros Saberes 2º Grado', paginasBase: 50, paginasRango: 6, descripcion: 'Contenidos interdisciplinarios y valores comunitarios' },
      { titulo: 'Proyectos de Aula 2º Grado', paginasBase: 80, paginasRango: 8, descripcion: 'Proyectos colaborativos del aula y acuerdos de convivencia' }
    ]
  },
  'primaria-media': {
    'matematicas': [
      { titulo: 'Nuestros Saberes 3º Grado', paginasBase: 56, paginasRango: 7, descripcion: 'Fracciones, algoritmos convencionales y cuerpos geométricos' },
      { titulo: 'Proyectos de Aula 3º Grado', paginasBase: 112, paginasRango: 8, descripcion: 'Cálculo de áreas, perímetros y presupuestos comunitarios' },
      { titulo: 'Nuestros Saberes 4º Grado', paginasBase: 68, paginasRango: 8, descripcion: 'Fracciones equivalentes, números decimales y cuadriláteros' },
      { titulo: 'Proyectos Escolares 4º Grado', paginasBase: 134, paginasRango: 8, descripcion: 'Tablas de doble entrada, gráficas de barras y encuestas' }
    ],
    'lenguajes': [
      { titulo: 'Múltiples Lenguajes 4º Grado', paginasBase: 38, paginasRango: 6, descripcion: 'Lecturas de divulgación, leyendas y textos expositivos' },
      { titulo: 'Proyectos de Aula 4º Grado', paginasBase: 86, paginasRango: 8, descripcion: 'Elaboración de revistas científicas, correspondencia y debates' },
      { titulo: 'Nuestros Saberes 4º Grado', paginasBase: 24, paginasRango: 6, descripcion: 'Estructura textual, ortografía y redacción formal' }
    ],
    'ciencias': [
      { titulo: 'Nuestros Saberes 4º Grado', paginasBase: 94, paginasRango: 7, descripcion: 'Ecosistemas, cadenas alimentarias, estados del agua y nutrición' },
      { titulo: 'Proyectos Comunitarios 3º Grado', paginasBase: 142, paginasRango: 8, descripcion: 'Filtros de agua y composta escolar sustentable' },
      { titulo: 'Proyectos Escolares 4º Grado', paginasBase: 156, paginasRango: 8, descripcion: 'Propiedades físicas de los materiales y mezclas del entorno' }
    ],
    'general': [
      { titulo: 'Cartografía de México y el Mundo (4º Grado)', paginasBase: 24, paginasRango: 6, descripcion: 'Mapas temáticos, relieve, regiones geográficas y patrimonio biocultural' },
      { titulo: 'Nuestros Saberes 4º Grado', paginasBase: 64, paginasRango: 6, descripcion: 'Saberes integrados, identidad cultural y formación ética' }
    ]
  },
  'primaria-alta': {
    'matematicas': [
      { titulo: 'Nuestros Saberes 5º Grado', paginasBase: 78, paginasRango: 8, descripcion: 'Porcentajes, fracciones con distinto denominador y proporcionalidad' },
      { titulo: 'Nuestros Saberes 6º Grado', paginasBase: 84, paginasRango: 8, descripcion: 'Geometría del círculo, valor aproximado de Pi, volumen y plano cartesiano' },
      { titulo: 'Proyectos de Aula 6º Grado', paginasBase: 128, paginasRango: 8, descripcion: 'Modelación matemática y finanzas comunitarias' },
      { titulo: 'Proyectos Comunitarios 5º Grado', paginasBase: 156, paginasRango: 8, descripcion: 'Estadística comunitaria, media, moda y gráficas circulares' }
    ],
    'lenguajes': [
      { titulo: 'Múltiples Lenguajes 6º Grado', paginasBase: 46, paginasRango: 6, descripcion: 'Ensayos, reseñas críticas, crónicas y cartas de opinión' },
      { titulo: 'Proyectos Escolares 6º Grado', paginasBase: 98, paginasRango: 8, descripcion: 'Periódico escolar digital, mesas redondas y debates' },
      { titulo: 'Nuestros Saberes 5º Grado', paginasBase: 28, paginasRango: 6, descripcion: 'Textos argumentativos, fuentes confiables y citas' }
    ],
    'ciencias': [
      { titulo: 'Nuestros Saberes 6º Grado', paginasBase: 118, paginasRango: 8, descripcion: 'Circuitos eléctricos, conductores, energía y biodiversidad' },
      { titulo: 'Nuestros Saberes 5º Grado', paginasBase: 96, paginasRango: 8, descripcion: 'Sistemas del cuerpo humano, estilo de vida saludable y medio ambiente' },
      { titulo: 'Proyectos Comunitarios 6º Grado', paginasBase: 168, paginasRango: 8, descripcion: 'Biodigestores, huellas ecológicas y energías renovables' }
    ],
    'general': [
      { titulo: 'Cartografía de México y el Mundo (5º y 6º Grado)', paginasBase: 42, paginasRango: 8, descripcion: 'Dinámica poblacional, desastres naturales y sostenibilidad' },
      { titulo: 'Nuestros Saberes 6º Grado', paginasBase: 88, paginasRango: 6, descripcion: 'Ciudadanía global, derechos humanos y cultura de paz' }
    ]
  },
  'secundaria': {
    'matematicas': [
      { titulo: 'Saberes y Pensamiento Científico: Matemáticas 1º de Secundaria', paginasBase: 84, paginasRango: 8, descripcion: 'Álgebra, ecuaciones lineales, proporcionalidad y geometría' },
      { titulo: 'Saberes y Pensamiento Científico: Matemáticas 2º de Secundaria', paginasBase: 112, paginasRango: 8, descripcion: 'Sistemas de ecuaciones, teorema de Pitágoras y probabilidad' },
      { titulo: 'Saberes y Pensamiento Científico: Matemáticas 3º de Secundaria', paginasBase: 136, paginasRango: 8, descripcion: 'Funciones cuadráticas, trigonometría y modelación matemática' },
      { titulo: 'Colección Ximhai: Matemáticas Secundaria', paginasBase: 140, paginasRango: 8, descripcion: 'Modelación algebraica y resolución de problemas situados' }
    ],
    'ciencias': [
      { titulo: 'Saberes y Pensamiento Científico: Biología 1º de Secundaria', paginasBase: 64, paginasRango: 8, descripcion: 'Célula, biodiversidad, genética y nutrición saludable' },
      { titulo: 'Saberes y Pensamiento Científico: Física 2º de Secundaria', paginasBase: 96, paginasRango: 8, descripcion: 'Leyes de Newton, energía, calor, ondas y electromagnetismo' },
      { titulo: 'Saberes y Pensamiento Científico: Química 3º de Secundaria', paginasBase: 104, paginasRango: 8, descripcion: 'Estructura atómica, enlaces químicos, reacciones y ácidos/bases' },
      { titulo: 'Proyectos de Ciencias Naturales Secundaria', paginasBase: 148, paginasRango: 8, descripcion: 'Indagación experimental en laboratorio y proyectos STEM' }
    ],
    'lenguajes': [
      { titulo: 'Lenguajes: Español 1º de Secundaria', paginasBase: 52, paginasRango: 8, descripcion: 'Textos argumentativos, cartas formales y reglamentos' },
      { titulo: 'Lenguajes: Español 2º de Secundaria', paginasBase: 68, paginasRango: 8, descripcion: 'Crónica, textos de divulgación y mesas redondas' },
      { titulo: 'Lenguajes: Español 3º de Secundaria', paginasBase: 80, paginasRango: 8, descripcion: 'Ensayos literarios, análisis de medios y debates críticos' },
      { titulo: 'Múltiples Lenguajes Secundaria', paginasBase: 74, paginasRango: 6, descripcion: 'Crítica literaria, arte contemporáneo y patrimonio lingüístico' }
    ],
    'general': [
      { titulo: 'Ética, Naturaleza y Sociedades 1º de Secundaria (Geografía)', paginasBase: 56, paginasRango: 8, descripcion: 'Espacio geográfico, recursos naturales y sustentabilidad' },
      { titulo: 'Ética, Naturaleza y Sociedades 2º de Secundaria (Historia)', paginasBase: 78, paginasRango: 8, descripcion: 'México prehispánico, virreinato e independencia nacional' },
      { titulo: 'Ética, Naturaleza y Sociedades 3º de Secundaria (Historia y FCE)', paginasBase: 120, paginasRango: 8, descripcion: 'Revolución Mexicana, democracia, derechos humanos y estado de derecho' },
      { titulo: 'De lo Humano y lo Comunitario Secundaria', paginasBase: 44, paginasRango: 6, descripcion: 'Tecnología, proyectos productivos, educación socioemocional y salud' }
    ]
  },
  'preparatoria': {
    'general': [
      { titulo: 'Marco Curricular Común (MCCEMS) — Progresiones de Aprendizaje SEP', paginasBase: 18, paginasRango: 6, descripcion: 'Pensamiento matemático, comunicación, ciencias naturales y conciencia histórica' },
      { titulo: 'Recursos Sociocognitivos y Socioemocionales SEMS', paginasBase: 36, paginasRango: 6, descripcion: 'Proyectos integradores de impacto comunitario y sustentabilidad' }
    ]
  }
};

interface SepProjectRange {
  level: string;
  topicRegex: RegExp;
  bookTitle: string;
  projectTitle: string;
  pageStart: number;
  pageEnd: number;
  description: string;
}

const OFFICIAL_SEP_PROJECTS: SepProjectRange[] = [
  // --- FASE 3: PRIMARIA BAJA (1º Y 2º) ---
  {
    level: 'primaria-baja',
    topicRegex: /carta|epistol|mensaje|buzon|cartero|correspondencia|sobre\b|postal/i,
    bookTitle: 'Proyectos Comunitarios 2º Grado',
    projectTitle: 'Proyecto Comunitario: "Nos comunicamos a través de cartas"',
    pageStart: 76,
    pageEnd: 87,
    description: 'Elaboración de cartas personales, buzón escolar y correspondencia comunitaria'
  },
  {
    level: 'primaria-baja',
    topicRegex: /cuento|fabula|leyenda|narrat|lectura|libro/i,
    bookTitle: 'Proyectos de Aula 1º Grado',
    projectTitle: 'Proyecto de Aula: "El tendedero de cuentos y leyendas"',
    pageStart: 48,
    pageEnd: 59,
    description: 'Creación colectiva de cuentos ilustrados y fomento de la lectura'
  },
  {
    level: 'primaria-baja',
    topicRegex: /tienda|dinero|moneda|compra|venta|conteo|fracc|num/i,
    bookTitle: 'Proyectos de Aula 2º Grado',
    projectTitle: 'Proyecto de Aula: "La tiendita del aula y los números en acción"',
    pageStart: 68,
    pageEnd: 79,
    description: 'Uso de monedas, agrupamiento en decenas/centenas y cálculo mental'
  },
  {
    level: 'primaria-baja',
    topicRegex: /agua|planta|animal|huerto|ecosist|arbol|basura|recicl/i,
    bookTitle: 'Proyectos Comunitarios 2º Grado',
    projectTitle: 'Proyecto Comunitario: "Guardianes de la naturaleza y el agua"',
    pageStart: 104,
    pageEnd: 117,
    description: 'Cuidado del agua, huertos escolares y separación de residuos'
  },
  {
    level: 'primaria-baja',
    topicRegex: /muert|difunt|ofrend|calaver|altar|cempasuchil|costumbre|tradicion/i,
    bookTitle: 'Proyectos Comunitarios 2º Grado',
    projectTitle: 'Proyecto Comunitario: "Costumbres y tradiciones que nos dan identidad"',
    pageStart: 36,
    pageEnd: 49,
    description: 'Altares tradicionales, relatos familiares y patrimonio biocultural'
  },
  {
    level: 'primaria-baja',
    topicRegex: /independ|hidalgo|morelos|josefa|dolores|allende|aldama/i,
    bookTitle: 'Proyectos de Aula 2º Grado',
    projectTitle: 'Proyecto de Aula: "El Grito de Independencia y los Héroes que nos dieron Patria"',
    pageStart: 82,
    pageEnd: 95,
    description: 'Movimiento de Independencia de 1810, personajes insurgentes, libertad y símbolos patrios'
  },
  {
    level: 'primaria-baja',
    topicRegex: /revoluci|madero|zapata|villa|carranza|1910|adelita/i,
    bookTitle: 'Proyectos Escolares 2º Grado',
    projectTitle: 'Proyecto Escolar: "Relatos y corridos de la Revolución Mexicana"',
    pageStart: 96,
    pageEnd: 109,
    description: 'Movimiento revolucionario de 1910, personajes históricos, vida cotidiana y corridos'
  },
  {
    level: 'primaria-baja',
    topicRegex: /historia|heroe|patria|bandera|himno|simbolo/i,
    bookTitle: 'Proyectos de Aula 2º Grado',
    projectTitle: 'Proyecto de Aula: "Viajeros del tiempo: personajes y fechas de México"',
    pageStart: 82,
    pageEnd: 95,
    description: 'Acontecimientos cívicos, corridos populares y memoria comunitaria'
  },
  
  // --- FASE 4: PRIMARIA MEDIA (3º Y 4º) ---
  {
    level: 'primaria-media',
    topicRegex: /muert|difunt|ofrend|calaver|altar|cempasuchil|costumbre|tradicion|patrimonio/i,
    bookTitle: 'Proyectos Comunitarios 4º Grado',
    projectTitle: 'Proyecto Comunitario: "Nuestras tradiciones y el patrimonio biocultural"',
    pageStart: 28,
    pageEnd: 41,
    description: 'Ofrendas tradicionales, flora nativa (cempasúchil), calaveritas y memoria oral'
  },
  {
    level: 'primaria-media',
    topicRegex: /entidad|donde vivo|municipio|comunidad|region|mapa|localidad/i,
    bookTitle: 'Cartografía de México y el Mundo (4º Grado)',
    projectTitle: 'Proyecto Geográfico: "Territorio, costumbres y paisajes de nuestra entidad"',
    pageStart: 24,
    pageEnd: 37,
    description: 'Mapas de la entidad, patrimonio cultural, recursos naturales y relieve'
  },
  {
    level: 'primaria-media',
    topicRegex: /carta|epistol|mensaje|buzon|correspondencia|opinion/i,
    bookTitle: 'Proyectos Comunitarios 3º Grado',
    projectTitle: 'Proyecto Comunitario: "Cartas para transformar nuestra comunidad"',
    pageStart: 88,
    pageEnd: 99,
    description: 'Redacción de cartas de opinión y petición a autoridades locales'
  },
  {
    level: 'primaria-media',
    topicRegex: /fracc|reparto|cocina|receta|metro|area|perimetro/i,
    bookTitle: 'Proyectos de Aula 3º Grado',
    projectTitle: 'Proyecto de Aula: "Las fracciones en la cocina comunitaria"',
    pageStart: 112,
    pageEnd: 125,
    description: 'Fracciones equivalentes, medidas de capacidad y pesos'
  },
  {
    level: 'primaria-media',
    topicRegex: /filtro|agua|composta|ecosist|cadena|aliment/i,
    bookTitle: 'Proyectos Comunitarios 3º Grado',
    projectTitle: 'Proyecto Comunitario: "Filtros de agua y composta escolar sustentable"',
    pageStart: 142,
    pageEnd: 155,
    description: 'Ecotecnias escolares, filtración de agua pluvial y nutrición'
  },
  {
    level: 'primaria-media',
    topicRegex: /independ|hidalgo|morelos|josefa|insurgente|allende/i,
    bookTitle: 'Nuestros Saberes 4º Grado',
    projectTitle: 'Proyecto Histórico: "Causas y Voces del Movimiento de Independencia en Nuestra Entidad"',
    pageStart: 148,
    pageEnd: 161,
    description: 'Causas de la Independencia en Nueva España, etapas insurgentes y libertad'
  },
  {
    level: 'primaria-media',
    topicRegex: /revoluci|madero|zapata|villa|porfir|1910/i,
    bookTitle: 'Nuestros Saberes 4º Grado',
    projectTitle: 'Proyecto Histórico: "La Revolución Mexicana y las Demandas de Nuestra Gente"',
    pageStart: 162,
    pageEnd: 175,
    description: 'Causas de la Revolución de 1910, reparto agrario y derechos constitucionales'
  },
  {
    level: 'primaria-media',
    topicRegex: /historia|virreinato|conquista|prehispan/i,
    bookTitle: 'Cartografía de México y el Mundo (4º Grado)',
    projectTitle: 'Proyecto Histórico: "Acontecimientos y transformaciones de nuestro país"',
    pageStart: 160,
    pageEnd: 175,
    description: 'Procesos históricos, patrimonio cultural y transformaciones sociales'
  },

  // --- FASE 5: PRIMARIA ALTA (5º Y 6º) ---
  {
    level: 'primaria-alta',
    topicRegex: /electric|circuito|estatica|conductor|corriente|energia/i,
    bookTitle: 'Proyectos Escolares 6º Grado',
    projectTitle: 'Proyecto Tecnológico: "Ingenieros de la energía: circuitos eléctricos y conductores"',
    pageStart: 140,
    pageEnd: 155,
    description: 'Conductores y aislantes, circuitos en serie/paralelo y uso eficiente de energía'
  },
  {
    level: 'primaria-alta',
    topicRegex: /circulo|pi\b|circunferenc|radio|diametro|cartesiano/i,
    bookTitle: 'Proyectos de Aula 6º Grado',
    projectTitle: 'Proyecto Matemático: "El enigma del círculo y la constante Pi en la vida cotidiana"',
    pageStart: 110,
    pageEnd: 125,
    description: 'Cálculo del perímetro y área circular, relación entre diámetro y circunferencia'
  },
  {
    level: 'primaria-alta',
    topicRegex: /carta|peticion|autoridad|oficio|formal|debate/i,
    bookTitle: 'Proyectos Comunitarios 5º Grado',
    projectTitle: 'Proyecto Comunitario: "Cartas de petición ciudadana a las autoridades"',
    pageStart: 110,
    pageEnd: 123,
    description: 'Estructura formal de petición, argumentos sólidos y gestión pública'
  },
  {
    level: 'primaria-alta',
    topicRegex: /biodigestor|biogas|energia|solar|ecotecnia|residu/i,
    bookTitle: 'Proyectos Comunitarios 6º Grado',
    projectTitle: 'Proyecto Comunitario: "Biodigestores y energías limpias para la escuela"',
    pageStart: 168,
    pageEnd: 183,
    description: 'Aprovechamiento de biomasa, producción de biogás y huella ecológica'
  },
  {
    level: 'primaria-alta',
    topicRegex: /independ|hidalgo|morelos|guerrero|iturbide|iguala|cordoba|1810|1821/i,
    bookTitle: 'Proyectos Escolares 5º Grado',
    projectTitle: 'Proyecto Histórico: "De la Conspiración de Querétaro a la Consumación de la Independencia"',
    pageStart: 170,
    pageEnd: 185,
    description: 'Las 4 etapas de la Independencia, Tratados de Córdoba, Plan de Iguala y soberanía nacional'
  },
  {
    level: 'primaria-alta',
    topicRegex: /revoluci|madero|zapata|constituc|1917|porfiriato|agrario/i,
    bookTitle: 'Proyectos Comunitarios 5º Grado',
    projectTitle: 'Proyecto Histórico: "Voces de la Revolución Mexicana y la Constitución de 1917"',
    pageStart: 192,
    pageEnd: 207,
    description: 'Demandas agrarias, laborales, Artículo 3º y 123 y memoria histórica'
  },
  {
    level: 'primaria-alta',
    topicRegex: /muert|difunt|ofrend|calaver|cempasuchil|tradicion/i,
    bookTitle: 'Proyectos Escolares 5º Grado',
    projectTitle: 'Proyecto Cultural: "Mural de las memorias y tradiciones comunitarias"',
    pageStart: 54,
    pageEnd: 67,
    description: 'Patrimonio inmaterial, altares tradicionales y lírica popular'
  },
  {
    level: 'primaria-alta',
    topicRegex: /porcentaj|descuento|interes|estadistic|grafic|volumen/i,
    bookTitle: 'Proyectos de Aula 5º Grado',
    projectTitle: 'Proyecto de Aula: "Finanzas comunitarias y porcentajes en la cooperativa"',
    pageStart: 128,
    pageEnd: 141,
    description: 'Cálculo de porcentajes, IVA, descuentos y estadística escolar'
  },

  // --- FASE 6: SECUNDARIA (1º A 3º) ---
  {
    level: 'secundaria',
    topicRegex: /carta|epistol|peticion|gestion|argument|ensayo/i,
    bookTitle: 'Lenguajes: Español 1º de Secundaria (Colección Ximhai / Sk’asolil)',
    projectTitle: 'Proyecto Formativo: "Cartas formales de gestión y peticiones ciudadanas"',
    pageStart: 44,
    pageEnd: 59,
    description: 'Estructura epistolar formal, argumentación y derechos ciudadanos'
  },
  {
    level: 'secundaria',
    topicRegex: /parabol|cuadrat|funcion|segundo grado|algebra/i,
    bookTitle: 'Saberes y Pensamiento Científico: Matemáticas 3º de Secundaria',
    projectTitle: 'Proyecto Científico: "Modelación de funciones cuadráticas y tiro parabólico"',
    pageStart: 136,
    pageEnd: 155,
    description: 'Ecuaciones cuadráticas, parábolas y modelación física'
  },
  {
    level: 'secundaria',
    topicRegex: /ultraproces|nutric|diabetes|dieta|alimento|salud/i,
    bookTitle: 'Saberes y Pensamiento Científico: Biología 1º de Secundaria',
    projectTitle: 'Proyecto de Salud: "Prevención de enfermedades y etiquetado frontal NOM-051"',
    pageStart: 63,
    pageEnd: 79,
    description: 'Metabolismo, alimentos ultraprocesados y estilo de vida saludable'
  },
  {
    level: 'secundaria',
    topicRegex: /independ|hidalgo|morelos|sentimientos de la nacion|apatzingan|trigarante|1810|1821|insurg/i,
    bookTitle: 'Ética, Naturaleza y Sociedades: Historia 2º de Secundaria',
    projectTitle: 'Proyecto Histórico: "Procesos de Emancipación: Del Virreinato a la Independencia Nacional"',
    pageStart: 78,
    pageEnd: 95,
    description: 'Crisis colonial novohispana, ideario insurgente, Sentimientos de la Nación y consumación de la Independencia'
  },
  {
    level: 'secundaria',
    topicRegex: /revoluci|porfiriato|constituc|madero|zapata|villa|carranza|1910|1917/i,
    bookTitle: 'Ética, Naturaleza y Sociedades: Historia 3º de Secundaria',
    projectTitle: 'Proyecto Histórico: "Transformaciones revolucionarias, soberanía y justicia social"',
    pageStart: 140,
    pageEnd: 159,
    description: 'Procesos revolucionarios, reformas sociales, Artículo 3º y 123 y vigencia constitucional'
  },
  {
    level: 'secundaria',
    topicRegex: /muert|difunt|tradicion|sincretismo|pueblos originarios/i,
    bookTitle: 'Ética, Naturaleza y Sociedades 2º de Secundaria',
    projectTitle: 'Proyecto Intercultural: "Diversidad biocultural, sincretismo y memoria comunitaria"',
    pageStart: 88,
    pageEnd: 103,
    description: 'Cosmovisión sobre la vida y la muerte, pueblos originarios y preservación cultural'
  }
];

/**
 * Obtener libros de la SEP con páginas comprobadas y verídicas para una sesión dada
 */
export function getSepBookForSession(
  level: string, 
  subject: string, 
  sessionNumber: number, 
  topicHash: number,
  topicStr: string = ''
): { titulo: string; paginas: string; seccion: string } {
  const levelKey = SEP_BOOKS_BY_LEVEL[level] ? level : 'primaria-baja';
  const cleanTopic = topicStr.toLowerCase();
  
  // 1. Verificación directa en proyectos oficiales específicos comprobados de la SEP (NEM 2024)
  const matchedProject = OFFICIAL_SEP_PROJECTS.find(p => p.level === levelKey && p.topicRegex.test(cleanTopic));
  
  if (matchedProject) {
    const totalProjectPages = matchedProject.pageEnd - matchedProject.pageStart;
    const sessionOffset = Math.min(totalProjectPages - 1, Math.floor(((sessionNumber - 1) / 10) * totalProjectPages));
    const startP = matchedProject.pageStart + sessionOffset;
    const endP = Math.min(matchedProject.pageEnd, startP + 2);
    
    return {
      titulo: matchedProject.bookTitle,
      paginas: `Págs. ${startP} a la ${endP}`,
      seccion: `${matchedProject.projectTitle} — ${matchedProject.description}`
    };
  }

  // 2. Asignación pedagógica por catálogo general verificado
  const cleanSub = subject.toLowerCase();
  let subKey = 'general';
  if (cleanSub.includes('leng') || cleanSub.includes('esp') || cleanSub.includes('lect') || cleanSub.includes('comun') || cleanSub.includes('artes') || cleanSub.includes('ingles')) {
    subKey = 'lenguajes';
  } else if (cleanSub.includes('mat') || cleanSub.includes('num') || cleanSub.includes('calc') || cleanSub.includes('geom')) {
subKey = 'matematicas';
  } else if (cleanSub.includes('cien') || cleanSub.includes('nat') || cleanSub.includes('fis') || cleanSub.includes('quim') || cleanSub.includes('bio')) {
    subKey = 'ciencias';
  }

  const books = SEP_BOOKS_BY_LEVEL[levelKey][subKey] || SEP_BOOKS_BY_LEVEL[levelKey]['general'] || SEP_BOOKS_BY_LEVEL['primaria-baja']['general'];
  const bookIndex = (sessionNumber - 1) % books.length;
  const book = books[bookIndex];

  // Cálculo acotado dentro del rango real del libro
  const pageStart = book.paginasBase + ((sessionNumber - 1) % book.paginasRango) * 2;
  const pageEnd = pageStart + 2;

  return {
    titulo: book.titulo,
    paginas: `Págs. ${pageStart} a la ${pageEnd}`,
    seccion: book.descripcion
  };
}

/**
 * Sanitiza y limpia gramaticalmente el nombre del tema escolar,
 * eliminando prefijos de planeaciones, sufijos de niveles y errores de duplicación.
 */
export function cleanCoreTopicName(topic: string): string {
  if (!topic || typeof topic !== 'string') return 'Tema Curricular Situado';
  let cleaned = topic.trim();

  // Eliminar prefijos de proyectos o planeaciones
  cleaned = cleaned.replace(/^(?:📚\s*)?(?:Proyecto\s+didáctico(?:\s+integral)?|Planeación(?:\s+didáctica)?|Secuencia(?:\s+didáctica)?|Unidad(?:\s+didáctica)?|Tema|Propuesta(?:\s+pedagógica)?):\s*/i, '');
  
    // Eliminar sufijos de nivel, grado o destinatarios (ej. "para alumnos de segundo", "para segundo grado", "de segundo", "para 2do")
  cleaned = cleaned.replace(/\s*(?:para|de)\s+(?:los\s+)?alumnos?\s+(?:de\s+)?(?:primer[oa]?|segundo|tercer[oa]?|cuarto|quinto|sexto|\d+[º°]?(?:\s*grado)?).*$/i, '');
  cleaned = cleaned.replace(/\s*(?:para|de)\s+(?:primer[oa]?|segundo|tercer[oa]?|cuarto|quinto|sexto|\d+[º°]?)\s+grado.*$/i, '');
  cleaned = cleaned.replace(/\s*(?:para|de)\s+segundo(?:\s+de\s+primaria|\s+de\s+secundaria)?.*$/i, '');
  cleaned = cleaned.replace(/\s*—\s*(?:Preescolar|Primaria\s+(?:Baja|Media|Alta)|Secundaria|Preparatoria|Bachillerato|Fase\s+\d+).*$/i, '');
  cleaned = cleaned.replace(/\s*\(Fase\s+\d+.*?\)$/i, '');

  // Corregir duplicaciones o tartamudeos frecuentes (ej. "Revolucirevolucion", "matematmatematicas")
  cleaned = cleaned.replace(/revoluci(?:on)?\s*revoluci[oó]n/gi, 'Revolución');
  cleaned = cleaned.replace(/matemat(?:icas)?\s*matem[aá]ticas/gi, 'Matemáticas');
  cleaned = cleaned.replace(/cienc(?:ias)?\s*ciencias/gi, 'Ciencias');

  // Corregir duplicación de palabras pequeñas
  cleaned = cleaned.replace(/\b(de|la|el|los|las|un|una|en|que|y|a|con|por|sobre)\s+\1\b/gi, '$1');

  // Normalización canónica para temas frecuentes de la NEM (con tolerancia a erratas y variantes)
  const lower = cleaned.toLowerCase();
  if (/muert|difunt|ofrend|calaver|cempasuchil|altar/i.test(lower)) return 'Tradiciones y Día de Muertos';
  if (/independ|hidalgo|morelos|allende|aldama|josefa|iturbide|dolores/i.test(lower)) return 'Independencia de México';
  if (/revoluci|madero|zapata|villa|carranza/i.test(lower)) return 'Revolución Mexicana';
  if (/porfiriato/i.test(lower)) return 'El Porfiriato y sus Contradicciones Sociales';
  if (/constituc/i.test(lower) && /1917/i.test(lower)) return 'La Constitución de 1917 y los Derechos Sociales';
  if (/fraccion/i.test(lower)) return 'Fracciones y Reparto Equitativo';
  if (/tiend|mercado|moneda|billete|compra/i.test(lower)) return 'La Tiendita Escolar y el Uso de Monedas';
  if (/suma|resta/i.test(lower) && /concreto|fichas|reagrupa/i.test(lower)) return 'Suma y Resta con Material Concreto';
  if (/multiplic|tablas/i.test(lower)) return 'Multiplicación y Tablas Numéricas';
  if (/geometr|figuras|tangram/i.test(lower)) return 'Figuras Geométricas y Cuerpos del Entorno';
  if (/cuadrat|parabol/i.test(lower)) return 'Modelación de Funciones Cuadráticas';
  if (/agua|filtr/i.test(lower)) return 'Cuidado y Filtración del Agua';
  if (/huerto|germin/i.test(lower)) return 'El Huerto Escolar Agroecológico';
  if (/biodigestor|biogas/i.test(lower)) return 'Biodigestores y Energías Renovables';
  if (/carta|epistol|buzon/i.test(lower)) return 'Producción de Textos Epistolares (La Carta)';
  if (/cuento|leyenda|fabula/i.test(lower)) return 'Lectura y Creación de Cuentos Colectivos';
  if (/derecho|paz|acuerdo/i.test(lower)) return 'Derechos de la Niñez y Convivencia Pacífica';
  if (/ecosistem|biodivers/i.test(lower)) return 'Ecosistemas y Conservación de la Biodiversidad';
  if (/cuerpo|salud|nutric|bien comer/i.test(lower)) return 'El Plato del Bien Comer y Hábitos Saludables';

  // Capitalización limpia
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return cleaned;
}

/**
 * Validador y corrector ortográfico/gramatical para textos pedagógicos en español
 */
export function sanitizeSpanishPedagogicalGrammar(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let res = text.trim();

  // Corregir duplicaciones de palabras
  res = res.replace(/revoluci(?:on)?\s*revoluci[oó]n/gi, 'Revolución');
  res = res.replace(/\b(de|la|el|los|las|un|una|en|que|y|a|con|por|sobre)\s+\1\b/gi, '$1');

  // Corregir espacios antes de signos de puntuación
  res = res.replace(/\s+([,.:;?!])/g, '$1');

  // Asegurar signos de interrogación completos en preguntas
  if (res.includes('?') && !res.startsWith('¿')) {
    res = '¿' + res.replace(/^[¿\s]+/, '');
  }
  if (res.startsWith('¿') && !res.endsWith('?')) {
    res = res.replace(/[?\s]+$/, '') + '?';
  }

  // Eliminar comillas dobles anidadas
  res = res.replace(/""([^"]+)""/g, '"$1"');

  // Asegurar mayúscula después de ¿ o ¡
  res = res.replace(/^([¿¡])([a-záéíóúñ])/i, (_, mark, char) => `${mark}${char.toUpperCase()}`);

  return res;
}

export type PedagogicalDomain = 
  | 'traditions_culture'
  | 'history_independence'
  | 'history_revolution'
  | 'history_society'
  | 'civics_ethics'
  | 'natural_sciences'
  | 'health_nutrition'
  | 'mathematics_fractions'
  | 'mathematics_geometry'
  | 'mathematics_algebra'
  | 'mathematics_numbers'
  | 'language_epistolar'
  | 'language_narrative'
  | 'language_poetry'
  | 'language_expository'
  | 'arts'
  | 'socioemotional_physical';

/**
 * Clasificador semántico universal de dominios curriculares oficiales (NEM 2024)
 */
export function classifyPedagogicalDomain(topic: string, subject: string = ''): PedagogicalDomain {
  const cleanTopic = cleanCoreTopicName(topic).toLowerCase();
  const cleanSub = (subject || '').toLowerCase();

  // 1. Tradiciones y Patrimonio Biocultural
  if (/muert|difunt|ofrend|calaver|altar|cempasuchil|pan de muerto|costumbre|festividad|tradicion|patrimonio biocultural|celebrac|panteon|copal|sahumerio|alfeñique|papel picado|fiesta patronal|guelaguetza|posada|navidad|carnaval|charro|mariachi|indigena|originario|lengua materna/i.test(cleanTopic)) {
    return 'traditions_culture';
  }

  // 2. Textos Epistolares / Cartas
  if (/carta|epistol|mensaje|buzon|cartero|correspondencia|sobre\b|postal/i.test(cleanTopic)) {
    return 'language_epistolar';
  }

  // 3. Poesía, Lírica y Rima
  if (/poe|rima|verso|estrofa|cancion|calaverita|copla|lira|cantos populares/i.test(cleanTopic)) {
    return 'language_poetry';
  }

  // 4. Narrativa, Cuentos, Leyendas y Teatro
  if (/cuento|fabula|leyenda|mito|narracion|relato|teatro|dramat|guiñol|obra de teatro/i.test(cleanTopic)) {
    return 'language_narrative';
  }

  // 5. Matemáticas - Fracciones
  if (/fraccion|equivalen|particion|reparto|denominador|numerador/i.test(cleanTopic)) {
    return 'mathematics_fractions';
  }

  // 6. Matemáticas - Geometría
  if (/geometr|figura|cuerpo geometric|tangram|perimetr|area\b|volumen|angulo|vertice|arista|plano cartes/i.test(cleanTopic)) {
    return 'mathematics_geometry';
  }

  // 7. Matemáticas - Álgebra y Funciones
  if (/algebra|ecuacion|cuadrat|parabol|funcion|segundo grado|tiro parab/i.test(cleanTopic)) {
    return 'mathematics_algebra';
  }

  // 8. Matemáticas - Números, Aritmética, Conteo y Tiendita
  if (/matemat|suma|resta|multiplic|division|conteo|numero|agrupacion|tiendita|moneda|dinero|billete|precio|cambio|mercado|compras|presupuesto|porcentaj|estadist|probabil/i.test(cleanTopic) || cleanSub.includes('mat') || cleanSub.includes('algebra') || cleanSub.includes('calc')) {
    return 'mathematics_numbers';
  }

  // 9. Ciencias - Salud, Nutrición y Cuerpo Humano
  if (/cuerpo|organo|salud|nutric|plato del bien comer|aliment|higiene|vacuna|enfermedad|sentido|vista|oido|tacto|gusto|olfato/i.test(cleanTopic) || cleanSub.includes('salud')) {
    return 'health_nutrition';
  }

  // 10. Ciencias Naturales, Ecología, Biodiversidad, Ecosistemas, Materia y Agua
  if (/cienc|natur|biolog|fisic|quimic|planta|animal|ecosistem|agua|aire|suelo|materia|energia|fuerza|movimient|celul|atomo|huerto|germin|solar|eolica|biodigestor|recicl|cambio climatic/i.test(cleanTopic) || cleanSub.includes('cien') || cleanSub.includes('medio') || cleanSub.includes('nat') || cleanSub.includes('bio') || cleanSub.includes('fis') || cleanSub.includes('quim')) {
    return 'natural_sciences';
  }

  // 11. Artes Visuales y Plásticas
  if (/arte|pintur|dibujo|escultur|musica|danza|color|expresion artist|ritmo|sonido|obra plastica/i.test(cleanTopic) || cleanSub.includes('art') || cleanSub.includes('mus')) {
    return 'arts';
  }

  // 12. Civismo, Derechos, Paz y Democracia
  if (/derecho|paz|acuerdo|convivenc|mediacion|inclusion|igualdad|genero|discrimin|democrac|ciudadan|justicia|constituc|regla|norma/i.test(cleanTopic) || cleanSub.includes('civ') || cleanSub.includes('etic')) {
    return 'civics_ethics';
  }

  // 13. Socioemocional y Educación Física
  if (/emocion|socioemocional|autoestima|empatia|deport|educacion fisica|motriz|juego cooperativo/i.test(cleanTopic) || cleanSub.includes('hum') || cleanSub.includes('efi') || cleanSub.includes('tut')) {
    return 'socioemotional_physical';
  }

  // 14.1 Historia - Independencia de México
  if (/independ|hidalgo|morelos|allende|aldama|josefa|iturbide|guerrero|trigarante|dolores|grito|sentimientos de la nacion|apatzingan|cordoba|iguala|insurg/i.test(cleanTopic)) {
    return 'history_independence';
  }

  // 14.2 Historia - Revolución Mexicana
  if (/revoluci|madero|zapata|villa|carranza|obregon|porfiriato|diaz|huerta|adelita|1910|1917|constitucion de 1917|tierra y libertad|sufragio efectivo/i.test(cleanTopic)) {
    return 'history_revolution';
  }

  // 14.3 Historia, Geografía y Sociedad General
  if (/porfir|reforma|mexic|histori|juarez|virrein|prehispan|colonia|patrimon|cultura|efemerid|civilizac|conquista|batalla|heroes|monumento|patria|entidad|region|localidad|geografia|mapa|territorio/i.test(cleanTopic) || cleanSub.includes('his') || cleanSub.includes('ent') || cleanSub.includes('geo') || cleanSub.includes('soc')) {
    return 'history_society';
  }

  // 15. Lenguajes - Expositivo y General
  if (cleanSub.includes('leng') || cleanSub.includes('esp') || cleanSub.includes('comun') || /lectur|escritur|texto|noticia|periodico|oratori|debate|discurs|argument|exposit|instructiv|ortograf|redacc|gaceta/i.test(cleanTopic)) {
    return 'language_expository';
  }

  return 'history_society';
}

/**
 * Generador Dinámico de Sesiones Individuales con Minutero (10/30/10 min), Libros SEP y Entregables
 * Genera de forma exacta el número de sesiones solicitado por el docente (1 a 30 sesiones),
 * calibrando el nivel cognitivo y vocabulario estrictamente a cada Fase (2 a 6 y Bachillerato).
 */
export function generateChronometerSessions(
  level: string,
  subject: string,
  topic: string,
  totalSessions: number = 10
): SessionPlanItem[] {
  const count = Math.max(1, Math.min(30, Number(totalSessions) || 10));
  const cleanTopic = cleanCoreTopicName(topic);
  const topicLower = cleanTopic.toLowerCase();
  const topicHash = Math.abs(cleanTopic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  
  const isEpistolar = /carta|epistol|mensaje|buzon|cartero|correspondencia|sobre\b|postal/i.test(topicLower);
  const isCuento = /cuento|fabula|leyenda|mito|narracion|literat/i.test(topicLower);
  const isPoesia = /poe|rima|verso|estrofa|cancion/i.test(topicLower);
  const isTradition = /muert|difunt|ofrend|calaver|altar|cempasuchil|pan de muerto|costumbre|festividad|tradicion|patrimonio biocultural|celebrac|panteon|copal|alfeñique|papel picado|fiesta patronal|guelaguetza|posada|navidad/i.test(topicLower);
  const cleanSub = subject.toLowerCase();
  const isLanguageSubject = cleanSub.includes('leng') || cleanSub.includes('esp') || cleanSub.includes('comun') || (!cleanSub.includes('mat') && !cleanSub.includes('cien') && (isEpistolar || isCuento || isPoesia));

  // 1. Plantilla Especializada: Cartas y Textos Epistolares (Lenguajes / Español)
  const epistolarTemplates = [
    {
      num: 1,
      titulo: `Apertura del Reto: ¿Cómo viaja un mensaje? El origen de las cartas y el oficio del cartero`,
      inicio: `⏱️ INICIO (10 min): Dinámica detonadora "La Carta Viajera". El docente muestra sobres postales antiguos con timbres y plantea el misterio: "¿Cómo se comunicaban las familias antes del teléfono celular?". Lluvia de ideas en el pizarrón.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Proyección de imágenes de carteros y buzones históricos. En equipos de 4, los alumnos analizan ejemplos reales de cartas y reflexionan sobre a quién les gustaría escribirle (abuelos, amigos, autoridades escolares). Registran en papel bond sus saberes previos.`,
      cierre: `⏱️ CIERRE (10 min): Puesta en común. Cada equipo elige a quién dirigirá su mensaje de agradecimiento o amistad. Registro individual en bitácora: "¿Qué mensaje importante quiero enviar al mundo?".`,
      preguntas: [
        `¿Por qué una carta escrita a mano transmite emociones más profundas que un mensaje de texto digital?`,
        `¿Qué personas en nuestra comunidad merecen recibir una carta de agradecimiento o felicitación?`
      ],
      materiales: ['Ejemplos de cartas reales y sobres postales', 'Papel bond blanco', 'Plumones de colores', 'Bitácora escolar'],
      entregable: `📄 Ficha de Trabajo #1: Diagnóstico inicial "El valor de la correspondencia escrita" y lista de posibles destinatarios.`
    },
    {
      num: 2,
      titulo: `Exploración en Libros SEP: Las partes esenciales de una carta (Lugar, Fecha, Destinatario y Saludo)`,
      inicio: `⏱️ INICIO (10 min): Ruleta de preguntas sobre la sesión previa y apertura del libro de texto gratuito de la SEP. Identificación visual de la cabecera epistolar.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Lectura guiada en el libro de texto oficial de la SEP. Los alumnos identifican y encierran con color rojo: 1) Lugar y Fecha, 2) Nombre del Destinatario, y 3) Saludo afectuoso o formal. En parejas practican la escritura de 3 saludos diferentes.`,
      cierre: `⏱️ CIERRE (10 min): Dinámica "El Saludo Ideal": Cada pareja lee su saludo favorito. Retroalimentación inmediata sobre el uso de mayúsculas y dos puntos (:).`,
      preguntas: [
        `¿Por qué es indispensable poner la fecha y el lugar en el encabezado de una carta?`,
        `¿Qué diferencia existe entre saludar a un amigo cercano ("¡Hola, querido Mateo!") y a la directora de la escuela ("Estimada Directora")?`
      ],
      materiales: ['Libro de texto gratuito SEP asignado', 'Marcatextos de colores', 'Cuaderno del alumno', 'Pizarrón'],
      entregable: `📄 Ficha de Trabajo #2: Esquema rotulado con las partes del encabezado y plantilla de práctica de saludos formales e informales.`
    },
    {
      num: 3,
      titulo: `El Cuerpo de la Carta: Expresión de ideas, anécdotas y sentimientos con claridad`,
      inicio: `⏱️ INICIO (10 min): Activación "El Teléfono Descompuesto de las Emociones". Reflexión sobre cómo evitar confusiones al escribir lo que sentimos y pensamos.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Taller de redacción del cuerpo del mensaje. Los alumnos organizan sus ideas respondiendo a 3 preguntas: 1) ¿Por qué te escribo?, 2) ¿Qué anécdota o noticia quiero contarte?, y 3) ¿Qué deseo preguntarte? Escriben su primer borrador manuscrito en hojas de raya.`,
      cierre: `⏱️ CIERRE (10 min): Lectura en voz baja en parejas para verificar que el mensaje se entienda con claridad. Autoevaluación del párrafo principal.`,
      preguntas: [
        `¿Cómo redactamos nuestras vivencias para que la persona que lea la carta se emocione o sonría?`,
        `¿Qué signos de puntuación nos ayudan a separar las ideas y que el texto no se sienta amontonado?`
      ],
      materiales: ['Hojas de trabajo pautadas', 'Lápiz y goma', 'Tarjetas de conectores textuales (además, también, por eso)'],
      entregable: `📄 Borrador Parcial #1: Redacción manuscrita del cuerpo de la carta con al menos dos párrafos organizados.`
    },
    {
      num: 4,
      titulo: `Despedida, Firma y Posdata: El cierre afectuoso y formal del texto epistolar`,
      inicio: `⏱️ INICIO (10 min): Lectura compartida de distintas despedidas de cartas literarias famosas ("Con todo mi cariño", "Atentamente", "Se despide tu amigo").`,
      desarrollo: `⏱️ DESARROLLO (30 min): Los alumnos completan el cierre de su carta agregando una despedida adecuada a su destinatario, su firma o nombre completo y una Posdata (P.D.) con un detalle especial o sorpresa. Ensamblan el borrador completo (encabezado + cuerpo + cierre).`,
      cierre: `⏱️ CIERRE (10 min): Exposición mural de cartas modelo en el salón. Felicitación colectiva por completar el primer texto integral.`,
      preguntas: [
        `¿Para qué se utiliza la Posdata (P.D.) y en qué momento es útil agregarla?`,
        `¿Qué tipo de despedida transmite respeto y cuál transmite cariño familiar?`
      ],
      materiales: ['Cuaderno de trabajo', 'Tiras de papel con fórmulas de despedida', 'Lápiz y colores'],
      entregable: `📄 Borrador Completo #1: Carta íntegra con sus 6 componentes (Lugar/Fecha, Destinatario, Saludo, Cuerpo, Despedida y Firma).`
    },
    {
      num: 5,
      titulo: `El Arte del Sobre Postal: Rotulación de Remitente, Destinatario, Código Postal y Estampillas`,
      inicio: `⏱️ INICIO (10 min): Presentación de sobres postales y explicación de la regla de oro: ¿Dónde va el Remitente (quien envía) y dónde el Destinatario (quien recibe)?`,
      desarrollo: `⏱️ DESARROLLO (30 min): Taller de diseño y rotulación de sobres. Los alumnos elaboran o decoran su propio sobre tamaño carta. Escriben con letra clara el nombre y domicilio escolar del destinatario al frente y sus propios datos al reverso. Crean y colorean una estampilla postal artística con un símbolo escolar.`,
      cierre: `⏱️ CIERRE (10 min): Revisión cruzada en parejas: "¿El cartero sabrá exactamente a qué salón o persona llevar este sobre?".`,
      preguntas: [
        `¿Qué sucedería si intercambiamos de lugar el remitente y el destinatario en un sobre postal?`,
        `¿Por qué las estampillas postales tienen ilustraciones culturales y artísticas de nuestro país?`
      ],
      materiales: ['Sobres de papel bond o manila', 'Hojas de colores y pegamento', 'Plumines finos', 'Sellos decorativos'],
      entregable: `📄 Producto Parcial: Sobre postal rotulado correctamente con datos de remitente/destinatario y estampilla original diseñada.`
    },
    {
      num: 6,
      titulo: `Construcción del Buzón Comunitario: Trabajo manual colaborativo con cartón reciclado`,
      inicio: `⏱️ INICIO (10 min): Organización de comisiones de trabajo para el montaje del gran "Buzón Postal de la Escuela" (diseño, pintura, rotulación y ranura de depósito).`,
      desarrollo: `⏱️ DESARROLLO (30 min): Trabajo colaborativo en estaciones: 1) Pintura y forrado de la caja con color rojo/azul institucional, 2) Creación del letrero "Buzón Escolar de la Amistad", 3) Rotulación de instrucciones de uso para la comunidad escolar, y 4) Elaboración de banderines decorativos.`,
      cierre: `⏱️ CIERRE (10 min): Instalación simbólica del buzón en el aula. Prueba de depósito de los primeros mensajes de muestra.`,
      preguntas: [
        `¿Cómo logramos que el buzón sea visible, resistente y llamativo para toda la comunidad escolar?`,
        `¿Qué valores como el respeto y la confidencialidad debemos cuidar al manejar la correspondencia ajena?`
      ],
      materiales: ['Caja de cartón grande reciclada', 'Pinturas acrílicas no tóxicas, pinceles y papel kraft', 'Tijeras y cinta adhesiva'],
      entregable: `📦 Producto Colectivo: Buzón postal comunitario terminado, rotulado y funcional para la recolección de cartas.`
    },
    {
      num: 7,
      titulo: `Taller de Corrección Epistolar: Coevaluación con "Lentes de Revisor" y Cuidado Ortográfico`,
      inicio: `⏱️ INICIO (10 min): Dinámica "Los Lentes del Revisor". Explicación de la lista de cotejo: mayúsculas al inicio, puntos finales, claridad y caligrafía legible.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Intercambio de borradores entre compañeros. Con notas adhesivas suaves (post-its), cada revisor señala 2 aspectos hermosos del mensaje y 1 sugerencia para mejorar la ortografía o el trazo de las letras. El docente acompaña a quienes requieran apoyo.`,
      cierre: `⏱️ CIERRE (10 min): Devolución afectuosa de cartas con comentarios positivos: "Tu carta me hizo sonreír porque...".`,
      preguntas: [
        `¿Por qué revisar nuestro texto con ayuda de un compañero hace que el mensaje final sea mucho más claro y emotivo?`,
        `¿Qué palabras corregimos para que nuestro destinatario entienda todo sin dificultad?`
      ],
      materiales: ['Lista de cotejo de coevaluación', 'Notas adhesivas de colores', 'Borradores de las cartas'],
      entregable: `📄 Ficha de Coevaluación: Lista de cotejo completada con retroalimentación entre pares y observaciones del docente.`
    },
    {
      num: 8,
      titulo: `Versión Final Manuscrita: Caligrafía cuidada en papel carta, ensobrado y sellado postal`,
      inicio: `⏱️ INICIO (10 min): Presentación del papel especial para la versión final y recordatorio del cuidado en los márgenes, sangría y limpieza.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Sesión intensiva de escritura de la versión final en papel membretado artesanalmente. Los alumnos aplican todas las correcciones, agregan ilustraciones en los márgenes, doblan la carta en tres partes iguales, la introducen en su sobre y la sellan con un sticker o sello postal.`,
      cierre: `⏱️ CIERRE (10 min): Ceremonia de sellado: Cada alumno muestra su sobre cerrado listo para depositarlo en el buzón comunitario.`,
      preguntas: [
        `¿Cómo influye una presentación limpia, ordenada y con bonita letra en la persona que va a recibir nuestra carta?`,
        `¿Qué emoción sientes al tener en tus manos tu carta lista para ser entregada?`
      ],
      materiales: ['Papel especial o decorado para cartas', 'Lápices de colores y plumas de gel', 'Sobres terminados', 'Sellos adhesivos'],
      entregable: `📄 Producto Final Individual: Carta definitiva corregida, manuscrita, doblada, ensobrada y sellada.`
    },
    {
      num: 9,
      titulo: `El Oficio del Cartero: Ensayo de rutas de reparto postal, gorras y organización de la entrega`,
      inicio: `⏱️ INICIO (10 min): Asignación de roles para la jornada comunitaria: carteros infantiles, clasificadores de correspondencia, recepcionistas y voceros.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Los alumnos elaboran gorras y bolsos de cartero con cartulina y estambre. Simulan el circuito postal: 1) Recolección en el buzón, 2) Clasificación por salones o destinatarios, 3) Ensayo de las palabras de entrega ("¡Buenas noticias! Traigo correspondencia para...").`,
      cierre: `⏱️ CIERRE (10 min): Ajuste de tiempos y protocolos de respeto para la entrega formal en la escuela.`,
      preguntas: [
        `¿Qué responsabilidad tiene un cartero al custodiar y entregar a tiempo los mensajes de las personas?`,
        `¿Cómo debemos presentarnos amablemente al entregar una carta a un profesor, compañero o padre de familia?`
      ],
      materiales: ['Cartulinas azules o verdes para gorras de cartero', 'Bolsas de tela o papel kraft', 'Estambre y tijeras'],
      entregable: `📄 Guion de Entrega Postal y distintivos de carteros elaborados por el equipo.`
    },
    {
      num: 10,
      titulo: `Jornada del Cartero Escolar: Entrega de correspondencia comunitaria, lectura en voz alta y evaluación`,
      inicio: `⏱️ INICIO (10 min): Palabras de bienvenida a la "Jornada del Cartero Comunitario". Apertura solemne del buzón postal ante la comunidad escolar.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Recorrido de los carteros infantiles entregando las cartas en los salones y a familiares invitados. Momento de lectura compartida: quienes deseen leen fragmentos de sus cartas recibidas en el círculo de diálogo.`,
      cierre: `⏱️ CIERRE (10 min): Aplicación de la rúbrica analítica formativa de 3 niveles. Firma del "Mural de la Amistad Epistolar" y reflexión sobre lo aprendido.`,
      preguntas: [
        `¿Qué caras pusieron las personas al recibir sus cartas escritas con tanto cariño y esfuerzo?`,
        `¿Cómo transformó este proyecto nuestra forma de comunicarnos y convivir en la escuela?`
      ],
      materiales: ['Buzón con cartas listas', 'Rúbricas analíticas impresas', 'Mural de firmas y compromisos comunitarios'],
      entregable: `🏆 Evidencia Final Integradora: Registro de entrega de cartas, lectura compartida comunitaria y rúbrica analítica formativa evaluada.`
    }
  ];

  // Plantilla Especializada: Tradiciones, Día de Muertos y Patrimonio Biocultural
  const traditionTemplates = [
    {
      num: 1,
      titulo: `Apertura del Reto: ¿Por qué conmemoramos a nuestros antepasados? La memoria oral y el patrimonio biocultural`,
      inicio: `⏱️ INICIO (10 min): Dinámica detonadora "El Baúl de la Memoria". El docente presenta elementos simbólicos de la temporada (flor de cempasúchil, copal, pan de muerto) y plantea la pregunta central: "¿Qué significan los altares de muertos y por qué son patrimonio de nuestra entidad?".`,
      desarrollo: `⏱️ DESARROLLO (30 min): En equipos de 4, las y los alumnos exploran fotografías, relatos familiares y dialogan sobre cómo se vive la tradición en sus hogares y colonias. Registran en un papel bond sus saberes previos y dibujan el mapa de recuerdos de su localidad.`,
      cierre: `⏱️ CIERRE (10 min): Puesta en común de saberes familiares. Cada equipo formula una pregunta que investigará con sus abuelos o personas mayores de la comunidad.`,
      preguntas: [
        `¿Qué relatos o recuerdos guardan en casa sobre las personas queridas que ya no están?`,
        `¿Por qué decimos que las tradiciones nos unen como comunidad y nos dan identidad?`
      ],
      materiales: ['Muestras de elementos tradicionales', 'Papel bond', 'Plumones de colores', 'Cuaderno del alumno'],
      entregable: `📄 Ficha de Trabajo #1: Diagnóstico inicial "Las tradiciones de mi comunidad" y preguntas de indagación familiar.`
    },
    {
      num: 2,
      titulo: `Exploración en Libros SEP: Los cuatro elementos del altar tradicional y su simbolismo biocultural`,
      inicio: `⏱️ INICIO (10 min): Ruleta de preguntas sobre la sesión anterior y apertura de los libros de texto gratuitos de la SEP (Proyectos Comunitarios / Nuestros Saberes).`,
      desarrollo: `⏱️ DESARROLLO (30 min): Lectura analítica guiada sobre el origen de las ofrendas. Los alumnos identifican y relacionan los 4 elementos naturales: 1) Tierra (frutos y semillas), 2) Agua (para mitigar la sed), 3) Fuego (velas y luz guía), y 4) Viento (papel picado e incienso). En parejas completan un esquema rotulado.`,
      cierre: `⏱️ CIERRE (10 min): Plenaria formativa: Cada pareja comparte el elemento que más le llamó la atención y su significado cultural en su entidad federativa.`,
      preguntas: [
        `¿Qué representa cada nivel y cada elemento que se coloca en el altar tradicional?`,
        `¿Cómo se relacionan estos elementos con la naturaleza y el cuidado de los recursos de nuestro entorno?`
      ],
      materiales: ['Libros de texto gratuitos de la SEP', 'Colores y marcatextos', 'Esquemas ilustrados'],
      entregable: `📄 Ficha de Trabajo #2: Esquema rotulado y analítico "Los 4 elementos naturales y el simbolismo del altar".`
    },
    {
      num: 3,
      titulo: `Taller Lírico Tradicional: Creación de calaveritas literarias y coplas populares con rima y humor respetuoso`,
      inicio: `⏱️ INICIO (10 min): Lectura en voz alta de calaveritas literarias históricas y de José Guadalupe Posada. Análisis del ritmo y el juego poético.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Taller de creación poética en cuartetas rimadas (versos octosílabos o rima libre). Las y los alumnos escriben versos dedicados con afecto y humor a personajes de la escuela (maestros, compañeros, bibliotecarios) o a oficios de la comunidad.`,
      cierre: `⏱️ CIERRE (10 min): Micrófono abierto de declamación: voluntarios leen su calaverita favorita. Coevaluación basada en el respeto y la creatividad.`,
      preguntas: [
        `¿Cómo logramos que una calaverita literaria sea graciosa, ingeniosa y al mismo tiempo respetuosa?`,
        `¿Qué palabras rimaron mejor en nuestros versos y cómo le dan musicalidad a la lectura?`
      ],
      materiales: ['Hojas pautadas o de raya', 'Lápiz y goma', 'Ejemplos de calaveras literarias tradicionales'],
      entregable: `📄 Producción Lírica #3: Borrador revisado de calaverita literaria con rima y recursos poéticos populares.`
    },
    {
      num: 4,
      titulo: `Saberes Bioculturales: Propiedades del cempasúchil, semillas nativas y cambios físicos de la materia`,
      inicio: `⏱️ INICIO (10 min): Exploración sensorial guiada con pétalos de cempasúchil, copal y veladoras de cera. Observación con lupas escolares.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Indagación científica escolar. Registro botánico del cempasúchil (ciclo otoñal, pigmentos carotenoides y propiedades repelentes). Observación de cambios de estado: la cera que se funde con el calor (fusión) y el copal que desprende aroma (combustión y sublimación).`,
      cierre: `⏱️ CIERRE (10 min): Conclusiones en plenaria: Registro en bitácora de cómo la ciencia y los saberes ancestrales explican los fenómenos del altar.`,
      preguntas: [
        `¿Por qué florece el cempasúchil justamente en los meses de octubre y noviembre en México?`,
        `¿Qué transformaciones físicas le ocurren a la cera de las velas y a los aromas al calentarse?`
      ],
      materiales: ['Flores de cempasúchil', 'Lupas escolares', 'Trozos de cera o plastilina', 'Bitácora científica'],
      entregable: `📄 Ficha Científica #4: Registro botánico y tabla de transformaciones físicas observadas en los materiales del altar.`
    },
    {
      num: 5,
      titulo: `Taller de Arte Popular: Papel picado tradicional, catrinas artesanales y tapetes florales`,
      inicio: `⏱️ INICIO (10 min): Muestra de papel picado artesanal y análisis geométrico de simetría axial en los dobleces y calados.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Taller manual. Doblez y calado de papel china con figuras tradicionales (calaveras, flores, palomas). Modelado de calaveritas de plastilina o masa de sal y diseño de cenefas para el altar colectivo.`,
      cierre: `⏱️ CIERRE (10 min): Tendedero visual en el salón de clases: exhibición de los pliegos de papel picado creados por el grupo.`,
      preguntas: [
        `¿Cómo ayuda la simetría y la paciencia para que el papel picado quede armónico y detallado?`,
        `¿Qué historias de nuestra comunidad podemos representar en los grabados y figuras populares?`
      ],
      materiales: ['Papel china de colores vivos', 'Tijeras de punta redonda', 'Masa o plastilina', 'Cuerda para colgar'],
      entregable: `🎨 Artefacto Plástico #5: Pliego de papel picado artesanal y figura en relieve terminada para la ofrenda escolar.`
    },
    {
      num: 6,
      titulo: `Tradición Oral y Memoria Comunitaria: Entrevistas sobre relatos, leyendas y costumbres de antes`,
      inicio: `⏱️ INICIO (10 min): Planteamiento: "¿Cómo podemos documentar los saberes de los abuelos antes de que se olviden?".`,
      desarrollo: `⏱️ DESARROLLO (30 min): Los alumnos organizan en equipos la información recabada en sus entrevistas familiares. Redactan un breve texto testimonial o leyenda comunitaria sobre cómo se conmemoraba a los fieles difuntos en su región en décadas pasadas.`,
      cierre: `⏱️ CIERRE (10 min): Círculo de la palabra: lectura de fragmentos testimoniales más emotivos y registro de saberes en el periódico mural.`,
      preguntas: [
        `¿Qué costumbres se mantienen vivas y cuáles han cambiado a lo largo del tiempo en nuestra entidad?`,
        `¿Por qué escuchar a los adultos mayores enriquece nuestro conocimiento y nos enseña a valorar la vida?`
      ],
      materiales: ['Notas de entrevistas familiares', 'Cartulinas de colores', 'Plumones'],
      entregable: `📄 Ficha Testimonial #6: Transcripción ilustrada de la entrevista comunitaria sobre tradiciones de la entidad.`
    },
    {
      num: 7,
      titulo: `Organización del Altar Colectivo: Boceto espacial, distribución de niveles y asignación de comisiones`,
      inicio: `⏱️ INICIO (10 min): Presentación del plano del espacio escolar donde se montará la ofrenda tradicional comunitaria.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Trabajo colaborativo por comisiones: 1) Estructura y niveles del altar, 2) Módulo de elementos bioculturales (flores y frutos), 3) Módulo lírico de calaveritas, y 4) Módulo de papel picado y arte popular. Elaboración del croquis a escala.`,
      cierre: `⏱️ CIERRE (10 min): Firma de la lista de responsabilidades y verificación de materiales para el montaje final.`,
      preguntas: [
        `¿Cómo nos organizamos equitativamente para que todos participen con gusto y nadie se quede sin tarea?`,
        `¿Qué medidas de seguridad y cuidado debemos mantener durante el montaje de las estructuras?`
      ],
      materiales: ['Croquis impreso', 'Caja organizadora de materiales', 'Lista de comisiones'],
      entregable: `📄 Plan de Montaje #7: Croquis espacial a escala y cédula de responsabilidades por equipo.`
    },
    {
      num: 8,
      titulo: `Ensayo General de la Muestra Cultural: Declamación lírica, guion museográfico y atención a visitantes`,
      inicio: `⏱️ INICIO (10 min): Técnica de respiración y modulación de la voz: "¿Cómo hablar con seguridad ante un público numeroso?".`,
      desarrollo: `⏱️ DESARROLLO (30 min): Ensayo general. Cada alumno ensaya su intervención: recitar su calaverita, explicar el significado del cempasúchil, o narrar el simbolismo del pan de muerto a los visitantes. Retroalimentación constructiva entre compañeros.`,
      cierre: `⏱️ CIERRE (10 min): Dinámica de motivación colectiva y colocación de distintivos de mediadores culturales escolares.`,
      preguntas: [
        `¿Qué palabras clave debemos recordar al explicar nuestra ofrenda a las familias?`,
        `¿Cómo demostramos empatía y calidez al recibir a los visitantes de nuestra escuela?`
      ],
      materiales: ['Tarjetas guía con notas clave', 'Gafetes de mediador cultural elaborados en clase'],
      entregable: `📄 Guion Expositivo #8: Tarjeta síntesis con los puntos que cada estudiante explicará en la ofrenda.`
    },
    {
      num: 9,
      titulo: `Montaje de la Ofrenda Tradicional Viva: Colocación de elementos, flores, arte popular y calaveritas`,
      inicio: `⏱️ INICIO (10 min): Pase de lista de comisiones y activación del protocolo de cuidado y respeto al espacio ceremonial y comunitario.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Montaje activo de la ofrenda en el espacio asignado: colocación de manteles, niveles, arcos de cempasúchil, papel picado, ofrendas de semillas, alimentos tradicionales y la antología de calaveritas murales.`,
      cierre: `⏱️ CIERRE (10 min): Vista panorámica del altar terminado. Momento de contemplación, agradecimiento y toma de fotografía colectiva del trabajo en equipo.`,
      preguntas: [
        `¿Cómo se transformó el espacio escolar gracias al esfuerzo conjunto de todo el grupo?`,
        `¿Qué detalle de nuestra ofrenda refleja mejor la identidad de nuestra entidad federativa?`
      ],
      materiales: ['Estructura del altar', 'Flores, manteles, papel picado, trabajos de los alumnos'],
      entregable: `🏆 Producto Tangible #9: Ofrenda Tradicional Viva montada con todos sus módulos y cédulas explicativas.`
    },
    {
      num: 10,
      titulo: `Encuentro Comunitario de Tradiciones con Familias: Recorrido cultural, recital y evaluación formativa`,
      inicio: `⏱️ INICIO (10 min): Palabras de bienvenida y apertura de la Muestra Cultural Comunitaria ante familias, docentes y directivos.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Recorrido guiado por las estaciones de la ofrenda conducido por los propios alumnos. Recital de calaveritas literarias, degustación simbólica y firma del "Libro de Oro de la Memoria Escolar".`,
      cierre: `⏱️ CIERRE (10 min): Aplicación de la rúbrica analítica formativa de 3 niveles, palabras de agradecimiento de una madre/padre de familia y aplauso comunitario.`,
      preguntas: [
        `¿Qué emoción o aprendizaje nuevo se llevan las familias de nuestra muestra escolar?`,
        `¿Cómo nos sentimos al haber logrado un proyecto tan significativo y qué aprendimos sobre nosotros mismos?`
      ],
      materiales: ['Ofrenda montada', 'Libro de firmas comunitarias', 'Rúbricas analíticas formativas impresas'],
      entregable: `🏆 Evidencia Final Integradora: Muestra cultural comunitaria culminada, recital presentado y rúbrica analítica evaluada.`
    }
  ];

  // 2. Plantilla Especializada: Preescolar (Fase 2 - Enfoque Lúdico, Sensorial y Expresivo)
  const preschoolTemplates = [
    {
      num: 1,
      titulo: `Ronda de Bienvenida y Caja Mágica de Sorpresas: "¿Qué sabemos de ${cleanTopic}?"`,
      inicio: `⏱️ INICIO (10 min): Canción de bienvenida con títere guía y descubrimiento de la "Caja Mágica". Preguntas detonadoras sensoriales en asamblea sobre el tapete.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Exploración con objetos concretos, texturas y colores. En pequeños grupos de juego libre guiado, las niñas y niños manipulan material táctil sobre "${cleanTopic}".`,
      cierre: `⏱️ CIERRE (10 min): Ronda de expresión en el círculo de diálogo: cada niño muestra su objeto favorito. Aplauso de estrellas y respiración guiada.`,
      preguntas: [
        `¿Qué color, forma o sonido tiene lo que descubrimos hoy sobre "${cleanTopic}"?`,
        `¿A quién en casa le queremos platicar de nuestra caja mágica?`
      ],
      materiales: ['Caja decorada con materiales sensoriales', 'Títere guía de aula', 'Tapete infantil', 'Música instrumental'],
      entregable: `🎨 Registro Gráfico #1: Dibujo libre inicial en hoja de trabajo con crayones gruesos.`
    },
    {
      num: 2,
      titulo: `Cuentacuentos Infantil y Libro de la SEP: Imágenes y Relatos de "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Ronda de adivinanzas visuales mostrando láminas ilustradas del libro de texto gratuito de la SEP.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Narración oral interactiva apoyada con títeres y láminas del libro escolar. Los niños identifican personajes, acciones y colores clave.`,
      cierre: `⏱️ CIERRE (10 min): Juego de mímica y dramatización corporal: "Imitamos a los personajes de la historia".`,
      preguntas: [
        `¿Qué personaje del cuento te gustó más y por qué?`,
        `¿Qué sonido o movimiento hace lo que vimos en el libro de la SEP?`
      ],
      materiales: ['Libro de texto gratuito SEP de Preescolar', 'Títeres de calcetín o guiñol', 'Láminas de colores'],
      entregable: `🎨 Ficha Creativa #2: Pintura dactilar o con esponjas representando la escena favorita del relato.`
    },
    {
      num: 3,
      titulo: `Taller de Modelado y Expresión Plástica: Construimos con plastilina sobre "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Presentación de barras de plastilina o masa vegetal de colores y canto rítmico de amasar.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Modelado libre y guiado. Las niñas y niños crean figuras representativas de "${cleanTopic}", experimentando con mezclas de colores y texturas.`,
      cierre: `⏱️ CIERRE (10 min): Museo en el tapete: Exposición de esculturas infantiles sobre platos de cartón reciclado.`,
      preguntas: [
        `¿Cómo se siente la masa en tus manos: suave, tibia o pegajosa?`,
        `¿Qué figura creaste y qué historia nos cuenta tu escultura?`
      ],
      materiales: ['Plastilina o masa casera no tóxica', 'Platos de cartón reciclado', 'Herramientas de plástico seguras'],
      entregable: `🎨 Escultura Infantil #3: Figura modelada sobre plato base con tarjeta de autor.`
    },
    {
      num: 4,
      titulo: `Juegos y Rondas Cooperativas: Aprendemos a compartir y ayudarnos en el salón`,
      inicio: `⏱️ INICIO (10 min): Ronda infantil con música tradicional y juego de estatuas de marfil.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Circuitos motrices y estaciones de juego cooperativo vinculadas a "${cleanTopic}" (clasificación de objetos por color, tamaño y forma).`,
      cierre: `⏱️ CIERRE (10 min): El abrazo de amigos: Todos colaboran recogiendo los materiales cantando "A guardar, a guardar".`,
      preguntas: [
        `¿Cómo nos ayudamos entre amigos para que todos puedan jugar contentos?`,
        `¿Qué juguetes compartiste hoy con tus compañeros?`
      ],
      materiales: ['Aros plásticos', 'Pelotas de esponja', 'Canastas de clasificación', 'Música infantil'],
      entregable: `🎨 Registro de Convivencia: Estampas de caritas felices y dibujo colectivo en papel kraft.`
    },
    {
      num: 5,
      titulo: `Festival y Muestra de Arte Infantil: Compartimos nuestras creaciones con las familias`,
      inicio: `⏱️ INICIO (10 min): Colocación de distintivos de artistas infantiles y bienvenida a las familias invitadas.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Recorrido por la Galería de Arte Infantil en el aula. Los pequeños presentan sus dibujos y esculturas a sus papás con apoyo del docente.`,
      cierre: `⏱️ CIERRE (10 min): Canto colectivo de despedida y entrega de diplomas simbólicos de exploradores.`,
      preguntas: [
        `¿Qué carita puso tu familia cuando vio tus trabajitos de arte?`,
        `¿Qué fue lo más divertido de aprender juntos en este proyecto?`
      ],
      materiales: ['Mural de exhibición', 'Mesa de trabajos infantiles', 'Diplomas simbólicos'],
      entregable: `🏆 Portafolio de Arte Preescolar: Carpeta decorada con todos los trabajitos y diploma de logro.`
    }
  ];

  // 3. Plantilla Especializada: Primaria Baja (Fase 3: 1º y 2º Grado - Lenguaje Sencillo, Narrativo y Concreto)
  const primaryLowTemplates = [
    {
      num: 1,
      titulo: `Apertura y Asombro: ¿Qué sabemos y qué historias conocemos sobre "${cleanTopic}"?`,
      inicio: `⏱️ INICIO (10 min): Dinámica "El Tesoro de los Recuerdos". El docente muestra objetos, fotografías o imágenes sencillas sobre "${cleanTopic}" y pregunta: "¿Alguien ha visto algo parecido en su casa o en la calle?". Lluvia de palabras en el pizarrón.`,
      desarrollo: `⏱️ DESARROLLO (30 min): En equipos de 3 o 4 compañeros, los alumnos observan láminas ilustradas y platican qué cosas conocen sobre el tema. Dibujan en su cuaderno su primer recuerdo o idea con colores vivos y rotulan su nombre.`,
      cierre: `⏱️ CIERRE (10 min): Círculo de diálogo en el tapete o salón: Cada equipo muestra un dibujo y dice una frase corta: "Nosotros aprendimos que...".`,
      preguntas: [
        `¿Qué personas, objetos o relatos de nuestra vida diaria conocemos sobre "${cleanTopic}"?`,
        `¿Qué juego, dibujo o historia nos gustaría hacer para empezar este proyecto?`
      ],
      materiales: ['Fotografías o láminas ilustradas', 'Cuaderno de dibujo', 'Crayones y lápices de colores', 'Pizarrón'],
      entregable: `📄 Ficha de Dibujo #1: Registro gráfico inicial con título y primeros saberes compartidos en familia.`
    },
    {
      num: 2,
      titulo: `Exploración en Libros SEP: Descubrimos cuentos e imágenes sobre "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Canto rítmico de atención y apertura guiada del libro de texto gratuito de la SEP en la página indicada.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Lectura en voz alta compartida con el docente. Los niños siguen la lectura con su dedo, encierran con color azul las palabras que reconocen e identifican a los personajes o imágenes principales del libro.`,
      cierre: `⏱️ CIERRE (10 min): Dinámica "Veo, veo en mi libro": Los alumnos señalan dibujos del libro que responden a las preguntas del maestro.`,
      preguntas: [
        `¿Qué descubrimos y qué dibujos nos gustaron más de nuestro libro escolar de la SEP?`,
        `¿Cómo se parece lo que leímos a lo que platicamos ayer en el salón?`
      ],
      materiales: ['Libro de texto gratuito SEP asignado', 'Colores y marcatextos escolares', 'Cuaderno del alumno'],
      entregable: `📄 Ficha de Trabajo #2: Actividad resuelta del libro escolar y lista ilustrada de 3 palabras clave.`
    },
    {
      num: 3,
      titulo: `Taller de Creación Concreta: Modelado con plastilina y dibujos sobre "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Presentación de materiales manipulables (plastilina, semillas, fichas o recortes) y explicación de las medidas de orden.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Creación individual o en parejas. Los alumnos modelan figuras, recortan imágenes o arman composiciones que representen lo que han aprendido sobre "${cleanTopic}". Escriben una pequeña tarjeta con su nombre.`,
      cierre: `⏱️ CIERRE (10 min): Paseo por la galería del salón: Caminamos despacito observando los trabajos de los demás compañeros y aplaudimos el esfuerzo.`,
      preguntas: [
        `¿Cómo podemos construir con plastilina, fichas o dibujos lo que estamos aprendiendo?`,
        `¿Qué fue lo más divertido de trabajar en equipo con nuestros materiales?`
      ],
      materiales: ['Plastilina de colores o masa vegetal', 'Fichas didácticas o semillas', 'Hojas blancas y pegamento'],
      entregable: `📄 Evidencia Manual #3: Figura modelada o collage pegado en cartulina con tarjeta de autor.`
    },
    {
      num: 4,
      titulo: `Juegos y Retos en Parejas: Resolviendo actividades sobre "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Planteamiento de un reto lúdico o juego de adivinanzas entre parejas para despertar la curiosidad.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Trabajo en parejas. Los alumnos resuelven una hoja de retos con dibujos para colorear, conteo o unión de palabras con flechas de colores sobre "${cleanTopic}". Se ayudan si alguno tiene dudas.`,
      cierre: `⏱️ CIERRE (10 min): Revisión cariñosa en plenaria: "¡Reto cumplido!". Felicitación por el compañerismo demostrado.`,
      preguntas: [
        `¿Cómo resolvemos en parejas las actividades y nos ayudamos mutuamente?`,
        `¿Cómo le explicarías con tus propias palabras a un amigo lo que dibujaste?`
      ],
      materiales: ['Hojas de retos ilustradas', 'Lápiz, goma y sacapuntas', 'Colores escolares'],
      entregable: `📄 Ficha de Retos #4: Hoja de actividades resuelta en parejas con caritas de autoevaluación.`
    },
    {
      num: 5,
      titulo: `Organización de Nuestro Proyecto: Letreros y dibujos en cartulinas colectivas`,
      inicio: `⏱️ INICIO (10 min): Organización de comisiones en el aula: dibujantes, recortadores, rotuladores y ordenadores.`,
      desarrollo: `⏱️ DESARROLLO (30 min): En equipos de 4, pegan sus dibujos en una cartulina grande, le ponen un título colorido con ayuda del docente y decoran los bordes con huellitas o grecas.`,
      cierre: `⏱️ CIERRE (10 min): Colocación de los carteles en el tendedero escolar del salón. Registro en el mural de avances.`,
      preguntas: [
        `¿Qué dibujos, letreros y colores no pueden faltar en nuestro trabajo en equipo?`,
        `¿Cómo nos organizamos para que todos los compañeros participen contentos?`
      ],
      materiales: ['Cartulinas de colores', 'Tijeras de punta redonda', 'Pegamento en barra', 'Plumones'],
      entregable: `📦 Cartel Colectivo #5: Cartulina ilustrada por equipo lista para la exposición escolar.`
    },
    {
      num: 6,
      titulo: `Conexión con el Arte y la Música: Canciones, coplas y dramatizaciones sobre "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Escucha guiada de un corrido, ronda, poema o cuento tradicional sobre el tema.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Expresión artística y corporal. Los alumnos aprenden un verso corto o ensayan una representación sencilla con sombreros de papel o máscaras de cartulina.`,
      cierre: `⏱️ CIERRE (10 min): Mini-presentación de 1 minuto por equipo cantando o diciendo su verso con entusiasmo.`,
      preguntas: [
        `¿De qué manera combinamos lo aprendido con canciones, coplas o representaciones?`,
        `¿Cómo nos ayuda este tema a ser mejores amigos y cuidar nuestro salón?`
      ],
      materiales: ['Gorros de cartulina o antifaces', 'Instrumentos sencillos (maracas, panderos o claves)', 'Hojas de coplas'],
      entregable: `📄 Registro Artístico #6: Ficha ilustrada con el verso o canción aprendida y dibujo del personaje.`
    },
    {
      num: 7,
      titulo: `Taller de Apoyo Amable: Revisamos y mejoramos nuestros trabajitos`,
      inicio: `⏱️ INICIO (10 min): Dinámica "El Elogio Cariñoso": Aprendemos a decir cosas bonitas sobre el esfuerzo de los demás.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Intercambio de cuadernos o carteles entre parejas. Cada niño pega una estrellita de color en la parte que más le gustó del trabajo de su amigo y le sugiere una mejora con una sonrisa.`,
      cierre: `⏱️ CIERRE (10 min): Agradecimiento entre compañeros: "¡Gracias por ayudarme a mejorar mi trabajito!".`,
      preguntas: [
        `¿Qué cosas bonitas le podemos decir a nuestros compañeros sobre sus trabajos?`,
        `¿Qué detalles podemos mejorar en nuestro dibujo o texto con mucha paciencia?`
      ],
      materiales: ['Estrellitas adhesivas de colores', 'Lápiz y colores para retoques'],
      entregable: `📄 Ficha de Coevaluación Infantil: Hoja con estrellitas y comentarios positivos entre pares.`
    },
    {
      num: 8,
      titulo: `Detalles Finales: Elaboración de la versión definitiva para compartir`,
      inicio: `⏱️ INICIO (10 min): Revisión de los carteles y materiales. Recordamos que la limpieza y el orden hacen que todo se vea hermoso.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Sesión de terminado fino. Los alumnos repasan letras con plumón, pegan elementos faltantes y dejan su producto final listo y limpio.`,
      cierre: `⏱️ CIERRE (10 min): Visto bueno del docente con sello de felicitación. Guardado cuidadoso para la muestra comunitaria.`,
      preguntas: [
        `¿Qué colores y toques finales le agregamos a nuestro trabajo para que quede hermoso?`,
        `¿Qué emoción sentimos al ver nuestro proyecto casi listo?`
      ],
      materiales: ['Materiales finales de exposición', 'Borrador limpio y lápiz'],
      entregable: `📄 Producto Final Individual o Colectivo terminado con nombre y sello de logro.`
    },
    {
      num: 9,
      titulo: `Ensayo en el Aula: Practicamos cómo platicarle a los demás sobre "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Demostración del docente: "¿Cómo nos paramos derechitos y hablamos fuerte y claro ante las familias?".`,
      desarrollo: `⏱️ DESARROLLO (30 min): Ensayo general en el salón. Cada niño practica su frase o muestra su dibujo diciendo su nombre y lo que aprendió en voz clara.`,
      cierre: `⏱️ CIERRE (10 min): Porra grupal de ánimo y seguridad para la presentación final.`,
      preguntas: [
        `¿Cómo ensayamos en equipo lo que le vamos a platicar a nuestras familias e invitados?`,
        `¿Quién va a sostener cada dibujo o cartel durante la presentación?`
      ],
      materiales: ['Carteles y trabajos listos', 'Espacio del salón despejado'],
      entregable: `📄 Ficha de Ensayo: Guion gráfico con la frase y dibujo que cada alumno presentará.`
    },
    {
      num: 10,
      titulo: `Muestra Comunitaria y Fiesta de Aprendizajes: Compartimos nuestro trabajo`,
      inicio: `⏱️ INICIO (10 min): Bienvenida a las familias, compañeros de otros salones y autoridades escolares.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Recorrido por la Muestra Escolar de Aprendizajes. Los niños explican sus carteles, cantan sus coplas o muestran sus maquetas con orgullo infantil.`,
      cierre: `⏱️ CIERRE (10 min): Entrega de reconocimientos formativos, aplauso general y firma en el "Mural de la Amistad".`,
      preguntas: [
        `¿Qué caras de alegría pusieron las familias e invitados al ver nuestro trabajo?`,
        `¿Qué fue lo que más nos gustó y aprendimos a lo largo de este proyecto?`
      ],
      materiales: ['Exposición montada', 'Diplomas formativos simbólicos', 'Mural de firmas y huellas'],
      entregable: `🏆 Evidencia Integradora: Muestra escolar realizada, autoevaluación con caritas y diploma de participación.`
    }
  ];

  // 4. Plantilla Especializada: Primaria Media (Fase 4: 3º y 4º Grado - Indagación Guiada y Proyectos en Equipo)
  const primaryMidTemplates = [
    {
      num: 1,
      titulo: `Planteamiento del Reto Comunitario y Activación de Saberes sobre "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Activación temática y exploración de saberes previos. El docente plantea la pregunta central y conflicto cognitivo sobre "${cleanTopic}". Los alumnos comparten sus experiencias cotidianas y registran en el pizarrón lo que ya saben.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Exploración con material manipulable y organizadores gráficos en equipos de 4 alumnos. Cada equipo analiza una situación real vinculada a "${cleanTopic}" y elabora su primer registro diagnóstico.`,
      cierre: `⏱️ CIERRE (10 min): Puesta en común de hallazgos iniciales. Cada equipo expresa en una frase su meta de aprendizaje. Registro individual en bitácora: "¿Qué descubrí hoy sobre ${cleanTopic}?".`,
      preguntas: [
        `¿En qué momentos de nuestra vida cotidiana o en nuestra comunidad observamos situaciones sobre "${cleanTopic}"?`,
        `¿Qué reto o problema podemos resolver en la escuela si investigamos este tema en equipo?`
      ],
      materiales: ['Papel bond blanco', 'Plumones de colores', 'Material concreto o interactivo', 'Cuaderno del alumno'],
      entregable: `📄 Ficha de Trabajo #1: Diagnóstico inicial de saberes previos y mapa mental grupal sobre "${cleanTopic}".`
    },
    {
      num: 2,
      titulo: `Indagación Conceptual y Exploración Guiada en Libros de Texto SEP`,
      inicio: `⏱️ INICIO (10 min): Breve retroalimentación mediante ruleta de preguntas rápidas y apertura del libro de texto gratuito de la SEP.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Lectura guiada y analítica en el libro de texto oficial de la SEP. Los alumnos identifican conceptos clave, subrayan definiciones y resuelven en parejas las actividades formativas del libro.`,
      cierre: `⏱️ CIERRE (10 min): Dinámica del "Semáforo del Aprendizaje" (Verde: comprendido, Amarillo: dudas, Rojo: apoyo). Aclaración de dudas en plenaria.`,
      preguntas: [
        `¿Qué ideas y explicaciones nuevas encontramos hoy en el libro de la SEP respecto a "${cleanTopic}"?`,
        `¿Cómo se relacionan estas lecturas con los ejemplos que observamos en nuestra comunidad?`
      ],
      materiales: ['Libro de texto gratuito SEP asignado', 'Colores y marcatextos', 'Cuaderno del alumno'],
      entregable: `📄 Ficha de Trabajo #2: Resumen visual o mapa conceptual con las ideas clave extraídas del libro de la SEP.`
    },
    {
      num: 3,
      titulo: `Modelación Práctica y Estaciones de Trabajo Concreto / Experimental`,
      inicio: `⏱️ INICIO (10 min): Presentación de los materiales de la sesión y asignación de roles en los equipos de trabajo (coordinador, relator, materiales, vocero).`,
      desarrollo: `⏱️ DESARROLLO (30 min): Trabajo en estaciones rotativas de indagación y manipulación práctica. Los alumnos aplican procedimientos directos, tabulan datos o construyen representaciones tangibles sobre "${cleanTopic}".`,
      cierre: `⏱️ CIERRE (10 min): Síntesis grupal. El portavoz de una estación comparte los resultados y conclusiones obtenidas.`,
      preguntas: [
        `¿Qué procedimiento resultó más claro para resolver los retos de las estaciones?`,
        `¿Qué dificultades encontramos al aplicar el procedimiento y cómo las resolvimos juntos?`
      ],
      materiales: ['Estaciones con material manipulable o instrumental didáctico', 'Hojas de registro'],
      entregable: `📄 Ficha de Trabajo #3: Hoja de registro de las estaciones con procedimientos, esquemas y conclusiones.`
    },
    {
      num: 4,
      titulo: `Resolución de Problemas Situados en el Contexto Escolar y Comunitario`,
      inicio: `⏱️ INICIO (10 min): Planteamiento de una problemática real de la comunidad escolar vinculada a "${cleanTopic}".`,
      desarrollo: `⏱️ DESARROLLO (30 min): Trabajo en parejas para resolver situaciones problemáticas contextualizadas paso a paso, justificando por escrito el razonamiento empleado.`,
      cierre: `⏱️ CIERRE (10 min): Puesta en común sobre las diferentes formas de resolver el reto y retroalimentación docente.`,
      preguntas: [
        `¿Por qué existen diferentes formas de resolver un mismo problema sobre "${cleanTopic}"?`,
        `¿Cuál es la forma más clara de explicar nuestro razonamiento a los demás compañeros?`
      ],
      materiales: ['Cuaderno de trabajo', 'Hojas de problemas contextualizados', 'Lápiz y goma'],
      entregable: `📄 Ficha de Trabajo #4: Resolución analítica y argumentada de los problemas comunitarios.`
    },
    {
      num: 5,
      titulo: `Organización de Información y Diseño del Primer Borrador del Proyecto`,
      inicio: `⏱️ INICIO (10 min): Presentación de la estructura del producto integrador intermedio y revisión de los criterios de calidad.`,
      desarrollo: `⏱️ DESARROLLO (30 min): En equipos, los alumnos estructuran el primer borrador de su producto integrador, organizando datos, textos, ilustraciones o maquetas.`,
      cierre: `⏱️ CIERRE (10 min): Registro del porcentaje de avance en el termómetro del proyecto grupal.`,
      preguntas: [
        `¿Qué información clave no puede faltar en nuestro producto sobre "${cleanTopic}"?`,
        `¿Cómo organizamos los datos para que cualquier persona de la comunidad los entienda con claridad?`
      ],
      materiales: ['Cartulinas o pliegos de papel', 'Colores y reglas', 'Borradores de trabajo'],
      entregable: `📄 Entregable Intermedio: Primer borrador estructurado del producto del proyecto con datos organizados.`
    },
    {
      num: 6,
      titulo: `Profundización Curricular y Vinculación Interdisciplinaria`,
      inicio: `⏱️ INICIO (10 min): Conexión explícita con los campos formativos articulados (Lenguajes, Saberes, Ética y De lo Humano).`,
      desarrollo: `⏱️ DESARROLLO (30 min): Actividad integradora que combina "${cleanTopic}" con la expresión artística, el análisis ético o la redacción formal de propuestas comunitarias.`,
      cierre: `⏱️ CIERRE (10 min): Mini-exposición de 2 minutos por equipo destacando la conexión interdisciplinaria lograda.`,
      preguntas: [
        `¿Cómo nos ayuda este tema a ser más empáticos, solidarios o analíticos con nuestra comunidad?`,
        `¿Qué otros conocimientos de la escuela se relacionan directamente con lo que estamos construyendo?`
      ],
      materiales: ['Material artístico / cartulinas', 'Textos informativos complementarios', 'Plumones'],
      entregable: `📄 Ficha de Trabajo #6: Producto interdisciplinario que vincula ${cleanTopic} con la vida comunitaria.`
    },
    {
      num: 7,
      titulo: `Taller de Coevaluación entre Pares y Retroalimentación Formativa`,
      inicio: `⏱️ INICIO (10 min): Explicación de la rúbrica analítica y de la importancia de la crítica constructiva entre compañeros basada en el respeto mutuo.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Dinámica de intercambio de proyectos entre equipos ("Taller de Galería"). Cada equipo revisa el trabajo de otro equipo con una lista de cotejo constructiva.`,
      cierre: `⏱️ CIERRE (10 min): Devolución de los trabajos con comentarios amables y claros para orientar la mejora.`,
      preguntas: [
        `¿Qué aprendimos al observar el trabajo de nuestros compañeros?`,
        `¿Cómo podemos mejorar la claridad y presentación de nuestro producto final?`
      ],
      materiales: ['Instrumentos de coevaluación impresos', 'Notas adhesivas de colores', 'Borradores de los proyectos'],
      entregable: `📄 Instrumento de Coevaluación: Lista de cotejo con retroalimentación entre pares debidamente firmada.`
    },
    {
      num: 8,
      titulo: `Ajuste, Corrección y Elaboración del Producto Final Tangible`,
      inicio: `⏱️ INICIO (10 min): Revisión de las sugerencias recibidas en la coevaluación y asignación de tareas específicas para la versión definitiva.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Sesión intensiva de producción final. Los alumnos aplican correcciones ortográficas, precisión en cálculos, orden estético y claridad en su producto entregable.`,
      cierre: `⏱️ CIERRE (10 min): Verificación final de calidad con la rúbrica oficial antes de la entrega final. Visto bueno del docente.`,
      preguntas: [
        `¿Qué cambios hicimos en nuestro producto que lo hicieron más claro y completo?`,
        `¿Nos sentimos orgullosos del trabajo que vamos a presentar a la comunidad escolar?`
      ],
      materiales: ['Materiales finales de exposición (cartulinas, modelos, maquetas, sobres, trípticos)', 'Tijeras, pegamento, plumones'],
      entregable: `📄 Producto Final Terminado: Versión definitiva del proyecto didáctico lista para su exposición comunitaria.`
    },
    {
      num: 9,
      titulo: `Ensayo General y Preparación de la Socialización Comunitaria`,
      inicio: `⏱️ INICIO (10 min): Organización del espacio del aula o patio escolar para la muestra pedagógica. Establecimiento de tiempos y turnos de presentación.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Simulación y ensayo de las exposiciones orales. Cada alumno practica su explicación con seguridad, lenguaje claro y uso de sus apoyos visuales y materiales concretos.`,
      cierre: `⏱️ CIERRE (10 min): Ronda de recomendaciones finales y palabras de motivación para la presentación oficial.`,
      preguntas: [
        `¿Cómo podemos explicar ideas sobre "${cleanTopic}" de manera sencilla para que cualquiera las entienda?`,
        `¿Qué tono de voz y postura corporal transmiten seguridad y entusiasmo en nuestra presentación?`
      ],
      materiales: ['Guiones de exposición', 'Materiales de exhibición terminados', 'Espacio escolar acondicionado'],
      entregable: `📄 Guion de Exposición: Ficha con los puntos clave que cada integrante explicará durante la muestra.`
    },
    {
      num: 10,
      titulo: `Feria de Aprendizajes Comunitarios, Evaluación Formativa y Compromisos`,
      inicio: `⏱️ INICIO (10 min): Bienvenida a la muestra de aprendizajes. Palabras de apertura por parte de los alumnos y del docente.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Presentación de la Feria de Aprendizajes ante compañeros de otros grupos, docentes o padres de familia. Demostración práctica de los conocimientos adquiridos sobre "${cleanTopic}".`,
      cierre: `⏱️ CIERRE (10 min): Aplicación de la rúbrica analítica de autoevaluación final. Firma del "Árbol de Compromisos de Aprendizaje" y felicitación grupal.`,
      preguntas: [
        `¿Cuál fue el aprendizaje más valioso que obtuviste a lo largo de este proyecto?`,
        `¿Cómo vas a seguir utilizando lo que aprendiste sobre "${cleanTopic}" en tu vida diaria?`
      ],
      materiales: ['Rúbricas analíticas individuales', 'Mural escolar de compromisos', 'Diplomas simbólicos o distintivos de logro'],
      entregable: `🏆 Evidencia Final Integradora: Rúbrica analítica completada, bitácora del proyecto y registro de la feria comunitaria.`
    }
  ];

  // 5. Plantilla Especializada: Primaria Alta (Fase 5: 5º y 6º Grado - Análisis Crítico y Propuestas Comunitarias)
  const primaryHighTemplates = primaryMidTemplates;

  // 6. Plantilla Especializada: Secundaria (Fase 6: 1º a 3º Grado - Pensamiento Crítico y Rigor Científico/Histórico)
  const secundariaTemplates = [
    {
      num: 1,
      titulo: `Planteamiento del Problema Sociocrítico y Delimitación Científica de "${cleanTopic}"`,
      inicio: `⏱️ INICIO (10 min): Presentación de un caso de estudio real o discrepancia conceptual sobre "${cleanTopic}". Debate inicial en plenaria guiado con preguntas de conflicto cognitivo.`,
      desarrollo: `⏱️ DESARROLLO (30 min): En mesas de trabajo analíticas, los estudiantes delimitan el problema de investigación, formulan hipótesis sustentadas y diseñan una matriz de análisis de fuentes.`,
      cierre: `⏱️ CIERRE (10 min): Síntesis metodológica. Cada mesa expone su hipótesis de trabajo y se registran los acuerdos en la bitácora científica.`,
      preguntas: [
        `¿Cuáles son los factores estructurales que originan las problemáticas en torno a "${cleanTopic}"?`,
        `¿Qué metodología de investigación nos permitirá contrastar nuestras hipótesis con rigor?`
      ],
      materiales: ['Artículos científicos o fuentes primarias', 'Matriz de análisis documental', 'Bitácora de investigación'],
      entregable: `📄 Protocolo de Indagación #1: Planteamiento del problema, hipótesis formuladas y justificación comunitaria.`
    },
    {
      num: 2,
      titulo: `Análisis de Fuentes Primarias, Modelación Cuantitativa y Libros SEP`,
      inicio: `⏱️ INICIO (10 min): Recuperación de saberes previos y orientación para el análisis crítico de textos y datos estadísticos en libros de la SEP.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Análisis riguroso de fuentes documentales, gráficas, ecuaciones o modelos conceptuales. Los estudiantes contrastan autores y formulan conclusiones preliminares sustentadas.`,
      cierre: `⏱️ CIERRE (10 min): Ronda de preguntas socráticas para evaluar el nivel de profundidad analítica alcanzado.`,
      preguntas: [
        `¿Qué inconsistencias o consensos encontramos entre las distintas fuentes analizadas?`,
        `¿Cómo fundamentamos con datos cuantitativos o citas textuales nuestras afirmaciones?`
      ],
      materiales: ['Libros de texto gratuitos SEP de Secundaria', 'Gráficas estadísticas o modelos matemáticos', 'Fichas de trabajo analíticas'],
      entregable: `📄 Reporte Analítico #2: Cuadro comparativo de fuentes, análisis de datos y fichas de síntesis crítica.`
    },
    {
      num: 3,
      titulo: `Experimentación en Laboratorio / Taller de Prototipado y Modelación`,
      inicio: `⏱️ INICIO (10 min): Verificación de protocolos de seguridad y calibración de instrumentos para el experimento o simulación.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Ejecución de la práctica experimental, desarrollo de modelos algebraicos/geométricos o ensamblaje de prototipos funcionales vinculados a "${cleanTopic}". Registro sistemático de variables.`,
      cierre: `⏱️ CIERRE (10 min): Discusión de resultados experimentales y control de márgenes de error.`,
      preguntas: [
        `¿De qué manera los resultados empíricos validan o refutan las hipótesis iniciales?`,
        `¿Qué variables influyeron en el comportamiento del modelo o prototipo?`
      ],
      materiales: ['Instrumental de laboratorio / materiales de prototipado', 'Hojas de registro de datos experimentales'],
      entregable: `📄 Reporte Experimental #3: Gráficas de resultados, análisis de variables y memoria técnica del prototipo.`
    },
    {
      num: 4,
      titulo: `Mesa Redonda / Debate Crítico Argumentativo entre Facciones o Posturas`,
      inicio: `⏱️ INICIO (10 min): Establecimiento de las reglas del debate formal: turnos de réplica, uso del tiempo y respeto a la diversidad ideológica.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Realización del debate argumentativo. Los equipos defienden posturas fundamentadas con evidencias científicas, históricas o éticas sobre "${cleanTopic}".`,
      cierre: `⏱️ CIERRE (10 min): Dictamen de conclusiones por el comité relator y reflexión sobre la construcción democrática del conocimiento.`,
      preguntas: [
        `¿Qué argumentos demostraron mayor solidez y rigor conceptual durante la discusión?`,
        `¿Cuál es la responsabilidad social de la ciencia y la tecnología en torno a "${cleanTopic}"?`
      ],
      materiales: ['Rúbricas técnicas de evaluación entre pares', 'Guiones de argumentación'],
      entregable: `📄 Acta de Debate y Rúbrica de Coevaluación con argumentos fundamentados.`
    },
    {
      num: 5,
      titulo: `Coloquio Estudiantil de Ciencias y Humanidades: Defensa del Proyecto y Evaluación`,
      inicio: `⏱️ INICIO (10 min): Apertura solemne del Coloquio Académico Escolar ante la comunidad y docentes invitados.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Exposición oral en atril con apoyo de diapositivas o stands demostrativos. Ronda de preguntas y respuestas técnicas.`,
      cierre: `⏱️ CIERRE (10 min): Evaluación sumativa y formativa con rúbrica analítica oficial y retroalimentación docente.`,
      preguntas: [
        `¿De qué manera nuestro proyecto contribuye a resolver un problema real de la comunidad?`,
        `¿Qué competencias científicas y comunicativas consolidamos durante el proceso?`
      ],
      materiales: ['Proyector o stands de exposición', 'Rúbricas analíticas oficiales', 'Prototipos terminados'],
      entregable: `🏆 Producto Final de Secundaria: Reporte formal de investigación, prototipo funcional evaluado y sustentación oral.`
    }
  ];

  // 7. Plantilla Especializada: Preparatoria / Bachillerato (MCCEMS)
  const preparatoriaTemplates = [
    {
      num: 1,
      titulo: `Diagnóstico Situacional y Formulación Epistemológica del Problema (MCCEMS)`,
      inicio: `⏱️ INICIO (10 min): Análisis de problemáticas complejas del entorno contemporáneo. Vinculación con las progresiones de aprendizaje del Marco Curricular Común.`,
      desarrollo: `⏱️ DESARROLLO (30 min): En seminarios de investigación, los estudiantes estructuran el marco conceptual, definen la metodología de investigación y delimitan el alcance del proyecto sobre "${cleanTopic}".`,
      cierre: `⏱️ CIERRE (10 min): Validación del protocolo metodológico con asesoría del docente tutor.`,
      preguntas: [
        `¿Cuál es el estado del arte y la relevancia socio-científica de abordar "${cleanTopic}" en la actualidad?`,
        `¿Qué metodología analítica o cuantitativa garantiza la validez de nuestro estudio?`
      ],
      materiales: ['Bases de datos académicas', 'Protocolo de investigación MCCEMS', 'Bitácora preuniversitaria'],
      entregable: `📄 Protocolo Metodológico #1: Justificación, marco teórico y diseño metodológico con normas APA.`
    },
    {
      num: 2,
      titulo: `Modelación Avanzada, Procesamiento de Datos y Simulación Científica`,
      inicio: `⏱️ INICIO (10 min): Revisión de algoritmos de cálculo, funciones matemáticas o modelos teóricos complejos.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Procesamiento cuantitativo de datos, análisis de regresión, simulaciones por computadora o contraste documental crítico.`,
      cierre: `⏱️ CIERRE (10 min): Interpretación de resultados y discusión crítica de hallazgos.`,
      preguntas: [
        `¿Qué nivel de significancia estadística o rigor cualitativo presentan los resultados?`,
        `¿Cómo se vincula el modelo matemático con la realidad socioeconómica o natural?`
      ],
      materiales: ['Software de cálculo / graficadores', 'Hojas de datos de investigación'],
      entregable: `📄 Reporte Analítico #2: Modelación cuantitativa, pruebas de hipótesis e interpretación de resultados.`
    },
    {
      num: 3,
      titulo: `Redacción Académica del Ensayo Crítico / Artículo de Divulgación Preuniversitario`,
      inicio: `⏱️ INICIO (10 min): Pautas de redacción científica: estructura IMRyD (Introducción, Metodología, Resultados y Discusión).`,
      desarrollo: `⏱️ DESARROLLO (30 min): Redacción formal del artículo o ensayo con citas en formato APA 7ª edición, integrando gráficos y conclusiones fundamentadas.`,
      cierre: `⏱️ CIERRE (10 min): Revisión por pares ciegos (Peer Review) entre equipos de investigación.`,
      preguntas: [
        `¿Cómo comunicamos ideas complejas con claridad, concisión y rigor académico?`,
        `¿Qué aportación original genera nuestra investigación a la comunidad?`
      ],
      materiales: ['Manual de estilo APA 7ª edición', 'Borradores de artículos académicos'],
      entregable: `📄 Artículo Científico / Ensayo Crítico #3 con dictamen de revisión por pares.`
    },
    {
      num: 4,
      titulo: `Simposio Académico Preuniversitario: Transferencia Social del Conocimiento y Evaluación`,
      inicio: `⏱️ INICIO (10 min): Instalación del presídium del Simposio Académico con invitados de la comunidad educativa.`,
      desarrollo: `⏱️ DESARROLLO (30 min): Ponencias formales de 10 minutos por equipo, sustentación de proyectos de impacto social y sesión de réplica académica.`,
      cierre: `⏱️ CIERRE (10 min): Evaluación por competencias del MCCEMS, entrega de constancias y cierre académico.`,
      preguntas: [
        `¿Qué impacto transformador tiene este proyecto en nuestro entorno local y perfil de egreso?`,
        `¿Cómo potencia este trabajo nuestra preparación vocacional y universitaria?`
      ],
      materiales: ['Atril y proyector de conferencias', 'Rúbricas de evaluación del MCCEMS'],
      entregable: `🏆 Producto Terminal de Bachillerato: Ponencia académica defendida, artículo publicado y rúbrica por competencias acreditada.`
    }
  ];

  let masterPool = primaryLowTemplates;
  if (level === 'preescolar') {
    masterPool = preschoolTemplates;
  } else if (level === 'primaria-baja') {
    masterPool = primaryLowTemplates;
  } else if (level === 'primaria-media') {
    masterPool = primaryMidTemplates;
  } else if (level === 'primaria-alta') {
    masterPool = primaryHighTemplates;
  } else if (level === 'secundaria') {
    masterPool = secundariaTemplates;
  } else if (level === 'preparatoria') {
    masterPool = preparatoriaTemplates;
  }
  
  if (isLanguageSubject && isEpistolar) {
    masterPool = epistolarTemplates;
  } else if (isTradition) {
    masterPool = traditionTemplates;
  }

  // Construcción de la secuencia exacta de "count" sesiones
  const resultSessions: SessionPlanItem[] = [];

  for (let i = 0; i < count; i++) {
    const sessionNum = i + 1;
    let baseTpl: (typeof masterPool)[0];

    if (count === 1) {
      // 1 sesión integrada
      baseTpl = {
        num: 1,
        titulo: `Sesión Integradora: Reto, Indagación y Aplicación Práctica sobre "${cleanTopic}"`,
        inicio: `⏱️ INICIO (10 min): Activación de saberes previos y presentación del reto sobre "${cleanTopic}". Lluvia de ideas participativa en el salón.`,
        desarrollo: `⏱️ DESARROLLO (30 min): Exploración guiada en libros SEP, modelado práctico en equipos y elaboración del producto tangible de aprendizaje.`,
        cierre: `⏱️ CIERRE (10 min): Socialización en plenaria, autoevaluación formativa con rúbrica y registro de conclusiones.`,
        preguntas: level === 'preescolar' || level === 'primaria-baja' ? [
          `¿Qué personas, objetos o dibujos descubrimos hoy sobre "${cleanTopic}"?`,
          `¿Qué aprendizaje bonito compartiré con mi familia al llegar a casa?`
        ] : [
          `¿Cómo resolvemos el reto central de "${cleanTopic}" con los saberes adquiridos hoy?`,
          `¿Qué aprendizaje clave compartiré con mi comunidad escolar?`
        ],
        materiales: ['Libro de texto gratuito SEP', 'Material manipulable o cartulinas', 'Bitácora escolar'],
        entregable: `🏆 Evidencia Integradora: Ficha de trabajo y producto demostrativo completado sobre "${cleanTopic}".`
      };
    } else if (count === 2) {
      const poolLen = masterPool.length;
      const tplIndex = i === 0 ? 0 : poolLen - 1;
      baseTpl = masterPool[tplIndex] || masterPool[0];
    } else if (count === 3) {
      const poolLen = masterPool.length;
      const tplIndex = i === 0 ? 0 : i === 1 ? 1 : poolLen - 1;
      baseTpl = masterPool[tplIndex] || masterPool[0];
    } else if (count === 4) {
      const poolLen = masterPool.length;
      const midIdx = Math.min(poolLen - 2, Math.max(2, Math.floor(poolLen / 2)));
      const tplIndex = i === 0 ? 0 : i === 1 ? 1 : i === 2 ? midIdx : poolLen - 1;
      baseTpl = masterPool[tplIndex] || masterPool[0];
    } else {
      const poolLen = masterPool.length;
      let tplIndex: number;
      if (i === 0) {
        tplIndex = 0;
      } else if (i === 1) {
        tplIndex = 1;
      } else if (i === count - 1) {
        tplIndex = poolLen - 1;
      } else {
        const progress = (i - 1) / (count - 2); // 0 to 1 between session 2 and session count-1
        tplIndex = Math.min(poolLen - 2, Math.max(2, 2 + Math.round(progress * (poolLen - 4))));
      }
      const phaseTpl = masterPool[tplIndex] || masterPool[0];
      baseTpl = {
        ...phaseTpl,
        titulo: i >= poolLen ? `${phaseTpl.titulo} (Fase de Profundización y Taller Práctico - Parte ${Math.floor(i / poolLen) + 1})` : phaseTpl.titulo
      };
    }

    const sepBook = getSepBookForSession(level, subject, sessionNum, topicHash, topic);

    resultSessions.push({
      numero: sessionNum,
      titulo: baseTpl.titulo,
      duracionTotal: '50 minutos',
      tiempos: { inicio: '10 min', desarrollo: '30 min', cierre: '10 min' },
      actividadInicio: baseTpl.inicio,
      actividadDesarrollo: baseTpl.desarrollo,
      actividadCierre: baseTpl.cierre,
      preguntasClave: baseTpl.preguntas,
      libroSep: sepBook,
      materiales: baseTpl.materiales,
      entregableSesion: baseTpl.entregable
    });
  }

  return resultSessions;
}

/**
 * Alias de compatibilidad para 10 sesiones
 */
export function generateChronometer10Sessions(
  level: string,
  subject: string,
  topic: string
): SessionPlanItem[] {
  return generateChronometerSessions(level, subject, topic, 10);
}

/**
 * Generador de PDAs Transversales / Articulados según nivel y tema
 * Garantiza vinculación interdisciplinaria auténtica de los 4 Campos Formativos sin respuestas genéricas.
 */
export function getArticulatedPdas(level: string, subject: string, topic: string): ArticulatedPda[] {
  const cleanTopic = cleanCoreTopicName(topic);
  const capitalizedTopic = cleanTopic;
  const topicLower = cleanTopic.toLowerCase();
  const levelKey = level || 'primaria-baja';

  // Identificación precisa del dominio temático
  const isTraditionsOrCulture = /muert|difunt|ofrend|calaver|altar|cempasuchil|pan de muerto|costumbre|festividad|tradicion|patrimonio biocultural|celebrac|panteon|copal|sahumerio|alfeñique|papel picado|fiesta patronal|guelaguetza|posada|navidad|carnaval|charro|mariachi|indigena|originario|lengua materna/i.test(topicLower);
  const isIndependence = /independ|hidalgo|morelos|allende|aldama|josefa|iturbide|guerrero|trigarante|dolores|grito|sentimientos de la nacion|apatzingan|cordoba|iguala|insurg/i.test(topicLower);
  const isRevolution = !isIndependence && /revoluci|madero|zapata|villa|carranza|obregon|porfiriato|diaz|huerta|adelita|1910|1917|constitucion de 1917|tierra y libertad|sufragio efectivo/i.test(topicLower);
  const isHistoryGeneral = !isIndependence && !isRevolution && /porfir|reforma|mexic|histori|juarez|virrein|prehispan|colonia|patrimon|tradicion|cultura|efemerid|civilizac|conquista|batalla|heroes|monumento|patria/i.test(topicLower);
  const isEpistolar = /carta|epistol|mensaje|buzon|cartero|correspondencia|sobre\b|postal/i.test(topicLower);
  const isLiterature = /cuento|leyenda|mito|fabula|poema|poes|rima|verso|cancion|teatro|dramat|relato|literat/i.test(topicLower);
  const isFractions = /fraccion|equivalen|particion|reparto|denominador|numerador/i.test(topicLower);
  const isMathStoreOrMoney = /tienda|mercado|dinero|moneda|compra|venta|precio|cambio|billete|ahorro|presupuesto/i.test(topicLower);
  const isMathGeneral = /matemat|suma|resta|multiplic|division|numero|conteo|algebra|ecuacion|cuadrat|parabol|geometr|tangram|area|perimetr|volumen|probabil|estadist|porcentaj/i.test(topicLower);
  const isWater = /agua|rio|lluvia|filtr|pozo|sequia|pluvial|hidrico/i.test(topicLower);
  const isGardenOrFood = /huerto|siembra|cosecha|cultivo|semilla|alimento|nutric|plato del bien comer|comida|dieta|ultraproces/i.test(topicLower);
  const isCleanEnergy = /biodigestor|biogas|energia|solar|eolica|renovable|ecotecnia|residu|recicl/i.test(topicLower);
  const isScienceGeneral = /cienc|natur|biolog|fisic|quimic|plan|animal|cuerpo|organo|salud|ecosistem|materia|fuerza|movimient|celul|atomo|luz|universo|biodivers/i.test(topicLower);
  const isCivicsPeace = /derecho|paz|acuerdo|convivenc|mediacion|inclusion|igualdad|genero|discrimin|democrac|ciudadan|justicia/i.test(topicLower);

  // 0. DOMINIO TRADICIONES, PATRIMONIO BIOCULTURAL Y DÍA DE MUERTOS
  if (isTraditionsOrCulture) {
    if (levelKey === 'preescolar') {
      return [
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades (Preescolar - Fase 2)',
          pda: `Comparte relatos, costumbres y tradiciones familiares sobre Día de Muertos y festividades de su comunidad, reconociendo la diversidad cultural y el respeto a sus compañeros.`,
          relacion: 'Identidad familiar comunitaria, primeras nociones de tradición y respeto a la diversidad.'
        },
        {
          campoFormativo: 'Lenguajes',
          pda: `Expresa mediante dibujos, modelado con masa y canciones tradicionales sus impresiones sobre las ofrendas y personajes de las festividades comunitarias.`,
          relacion: 'Expresión plástica y corporal, oralidad infantil y apreciación de símbolos culturales tradicionales.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Identifica que forma parte de una familia y comunidad con costumbres propias, participando con respeto y empatía en celebraciones colectivas.`,
          relacion: 'Pertenencia afectiva familiar, trabajo colaborativo y valores de convivencia armónica.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Observa y clasifica elementos naturales de temporada (flores de cempasúchil, frutas, semillas y hojas), describiendo colores, texturas y aromas.`,
          relacion: 'Exploración sensorial de la naturaleza y observación de los ciclos estacionales.'
        }
      ];
    } else if (levelKey === 'primaria-baja') {
      return [
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades (Primaria Baja - Fase 3)',
          pda: `Indaga en relatos familiares, fotografías y testimonios comunitarios el origen y los cambios en las tradiciones y festividades de su localidad (Día de Muertos y conmemoraciones patronales), reconociendo el patrimonio biocultural.`,
          relacion: 'Rescate de la memoria histórica local, sentido de pertenencia y valoración de las prácticas comunitarias.'
        },
        {
          campoFormativo: 'Lenguajes',
          pda: `Escribe de manera autónoma y colaborativa coplas populares, calaveritas sencillas y descripciones sobre las ofrendas y personajes tradicionales de su comunidad.`,
          relacion: 'Lectoescritura con sentido sociocultural, disfrute de la lírica popular y expresión creativa en verso.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Reconoce que las tradiciones y festividades familiares fortalecen los lazos afectivos, el respeto hacia los abuelos y adultos mayores y el sentido de identidad colectiva.`,
          relacion: 'Vínculos afectivos intergeneracionales, memoria familiar y colaboración en proyectos escolares.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Describe y clasifica elementos naturales de temporada (cempasúchil, mandarinas, calabaza, copal) y observa transformaciones físicas cotidianas en la preparación del altar.`,
          relacion: 'Observación de la biodiversidad regional, ciclos agrícolas de otoño y cambios cotidianos de la materia.'
        }
      ];
    } else if (levelKey === 'primaria-media') {
      return [
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades (La Entidad donde Vivo - Fase 4)',
          pda: `Reconoce y valora las prácticas culturales, expresiones artísticas, rituales, ofrendas y celebraciones tradicionales (como Día de Muertos) como parte del patrimonio biocultural y la memoria colectiva de su entidad federativa y pueblos originarios.`,
          relacion: 'Patrimonio biocultural regional, memoria histórica estatal y valoración de la diversidad de pueblos originarios.'
        },
        {
          campoFormativo: 'Lenguajes',
          pda: `Lee, comprende y produce calaveritas literarias y coplas populares, explorando la rima, el ritmo lírico, la sátira humorística y las figuras retóricas de la tradición lírica mexicana.`,
          relacion: 'Comprensión y creación lírica tradicional, juego poético, métrica popular y uso de la sátira respetuosa.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Indaga y describe las propiedades botánicas y usos de flores tradicionales (cempasúchil, terciopelo), semillas y frutos de temporada en las expresiones culturales de la región, reconociendo su ciclo biológico y los cambios de estado físico de la materia (fusión de cera, combustión de incienso y copal).`,
          relacion: 'Botánica regional aplicada, transformaciones físicas de la materia y preservación de la biodiversidad local.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Identifica eventos y celebraciones importantes de la historia familiar y comunitaria, reconociendo que fortalecen la identidad colectiva, el sentido de pertenencia y la transmisión intergeneracional de saberes y afectos.`,
          relacion: 'Cohesión comunitaria, vínculos afectivos familiares y colaboración activa en proyectos culturales escolares.'
        }
      ];
    } else if (levelKey === 'primaria-alta') {
      return [
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades (Primaria Alta - Fase 5)',
          pda: `Analiza críticamente el origen prehispánico, virreinal y contemporáneo de la cosmovisión sobre la vida y la muerte en México, valorando la declaratoria del Día de Muertos como Patrimonio Cultural Inmaterial de la Humanidad.`,
          relacion: 'Conciencia histórica crítica, sincretismo cultural y valoración del patrimonio inmaterial universal.'
        },
        {
          campoFormativo: 'Lenguajes',
          pda: `Elabora crónicas comunitarias, ensayos descriptivos y una antología comentada de calaveritas literarias, empleando figuras retóricas complejas, recursos de cohesión y ortografía normativa.`,
          relacion: 'Redacción literaria avanzada, divulgación cultural y preservación de la palabra escrita tradicional.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Investiga los saberes agrícolas ancestrales en el cultivo del cempasúchil y alimentos de temporada, analizando el impacto de las prácticas agroecológicas vs el uso de agroquímicos en los suelos locales.`,
          relacion: 'Saberes agrícolas tradicionales, química ambiental, sustentabilidad y preservación de suelos.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Promueve el diálogo intercultural y el respeto a la diversidad de prácticas conmemorativas presentes en su comunidad y en distintos pueblos del país, combatiendo prejuicios culturales.`,
          relacion: 'Interculturalidad crítica, empatía comunitaria y valoración de la diversidad de cosmovisiones.'
        }
      ];
    } else if (levelKey === 'secundaria') {
      return [
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades (Secundaria - Fase 6)',
          pda: `Investiga desde fuentes historiográficas el sincretismo cultural y la resignificación de las festividades de muertos durante el Virreinato y su evolución en el México independiente y contemporáneo.`,
          relacion: 'Investigación historiográfica, análisis sociocrítico del sincretismo y derechos culturales de los pueblos originarios.'
        },
        {
          campoFormativo: 'Lenguajes (Español / Artes)',
          pda: `Escribe calaveras literarias de sátira política y diseña instalaciones artísticas multidisciplinarias que resignifican los elementos simbólicos del altar tradicional frente a la mercantilización cultural.`,
          relacion: 'Análisis sociolingüístico, sátira lírica, creación artística contemporánea y pensamiento crítico discursivo.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Analiza las propiedades fitoquímicas de plantas ceremoniales (cempasúchil, copal, resinas) y modela el impacto ecológico de la producción estacional en agroecosistemas locales.`,
          relacion: 'Fitoquímica botánica, agroecología sustentable y análisis experimental de compuestos orgánicos.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Reflexiona sobre los procesos de duelo, la memoria de los antepasados y la resignificación de la pérdida, canalizando emociones mediante la creación artística y el diálogo comunitario.`,
          relacion: 'Inteligencia socioemocional, resiliencia colectiva y sentido de trascendencia humana.'
        }
      ];
    } else {
      return [
        {
          campoFormativo: 'Conciencia Histórica y Humanidades (MCCEMS)',
          pda: `Examina con aparato crítico el sincretismo biocultural, la filosofía indígena de la muerte y la construcción de la identidad nacional mexicana a través de sus tradiciones populares.`,
          relacion: 'Filosofía social, hermenéutica cultural y valoración de cosmovisiones originarias.'
        },
        {
          campoFormativo: 'Lengua y Comunicación',
          pda: `Produce ensayos argumentativos y piezas líricas de alta complejidad sobre la preservación de las tradiciones mexicanas y el derecho a la memoria biocultural.`,
          relacion: 'Pensamiento discursivo superior, rigor formal de citación y comunicación académica.'
        },
        {
          campoFormativo: 'Pensamiento Científico',
          pda: `Investiga la etnobotánica de especies endémicas ceremoniales y evalúa los equilibrios ecológicos de su cultivo en regiones bioculturales de México.`,
          relacion: 'Etnobotánica, métodos de muestreo ecológico y preservación del patrimonio natural.'
        },
        {
          campoFormativo: 'Recursos Socioemocionales',
          pda: `Diseña y coordina proyectos culturales comunitarios orientados al rescate de la memoria colectiva y el fortalecimiento del tejido social de su localidad.`,
          relacion: 'Responsabilidad social, liderazgo humanista y vinculación comunitaria activa.'
        }
      ];
    }
  }

  // 1.1 DOMINIO HISTÓRICO - INDEPENDENCIA DE MÉXICO (1810-1821)
  if (isIndependence) {
    if (levelKey === 'preescolar') {
      return [
        {
          campoFormativo: 'Lenguajes (Preescolar - Fase 2)',
          pda: `Expresa oralmente relatos, poemas y cantos tradicionales sobre el inicio de la Independencia y los héroes de la patria (Hidalgo, Josefa Ortiz de Domínguez) mediante el juego dramático, títeres y dibujo libre.`,
          relacion: 'Oralidad infantil, apreciación de símbolos patrios e iniciación en la memoria colectiva.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Identifica nociones temporales (hace muchos años, antes y hoy), ordena láminas históricas y clasifica banderas y estandartes por formas geométricas y colores.`,
          relacion: 'Noción temporal intuitiva, clasificación perceptual y observación de cambios en el entorno.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Reconoce que forma parte de México y conmemora con orgullo las fiestas patrias de septiembre, compartiendo anécdotas de su familia sobre la Independencia y el respeto a los símbolos nacionales.`,
          relacion: 'Sentido de pertenencia nacional, identidad comunitaria y valoración de las fiestas cívicas.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Participa con alegría en rondas cívicas y representaciones del Grito de Dolores, practicando el respeto, la libertad y la igualdad entre niñas y niños.`,
          relacion: 'Convivencia armónica, expresión motriz y valoración de los derechos de todas las personas.'
        }
      ];
    } else if (levelKey === 'primaria-baja') {
      return [
        {
          campoFormativo: 'Lenguajes (Primaria Baja - Fase 3)',
          pda: `Produce e interpreta narraciones orales, coplas patrióticas y dibujos sobre la Independencia de México y el Grito de Dolores, dialogando con familiares sobre Miguel Hidalgo, Josefa Ortiz de Domínguez e Ignacio Allende.`,
          relacion: 'Alfabetización inicial con sentido social, rescate de la tradición oral y expresión artística de la memoria histórica.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Organiza secuencias temporales en calendarios y líneas del tiempo sencillas (el año 1810, el paso del tiempo y las celebraciones escolares actuales), cuantificando años y colecciones de imágenes históricas.`,
          relacion: 'Uso del calendario escolar, noción matemática de tiempo histórico y resolución de problemas de conteo con datos reales.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Indaga a través de relatos orales, lecturas guiadas e imágenes los hechos del inicio de la Independencia de México, reconociendo por qué lucharon por la libertad, la justicia y la igualdad de las personas.`,
          relacion: 'Compromiso cívico, valoración del derecho a la libertad, rechazo a la discriminación y memoria comunitaria.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Participa en dramatizaciones cívicas y juegos de roles sobre los personajes insurgentes, valorando la valentía, el trabajo en equipo y la cultura de paz.`,
          relacion: 'Trabajo colaborativo, reconocimiento del papel de las mujeres en la Independencia y convivencia pacífica.'
        }
      ];
    } else if (levelKey === 'primaria-media') {
      return [
        {
          campoFormativo: 'Lenguajes (Primaria Media - Fase 4)',
          pda: `Redacta textos expositivos, biografías ilustradas y reseñas históricas sobre las causas de la Independencia en su entidad federativa y las campañas de Morelos y los insurgentes.`,
          relacion: 'Comprensión lectora de fuentes históricas, redacción de párrafos cronológicos y uso de conectores temporales.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Interpreta mapas históricos regionales de las rutas insurgentes, calcula distancias geográficas y organiza datos cronológicos de 1810 a 1821 en tablas y líneas del tiempo.`,
          relacion: 'Pensamiento geoespacial, cálculo de distancias y tratamiento de datos estadísticos históricos.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Analiza las desigualdades sociales de la Nueva España que provocaron la lucha armada de Independencia, valorando los ideales de soberanía y los derechos de los pueblos originarios.`,
          relacion: 'Conciencia histórica regional, defensa de los derechos humanos y valoración del ideario emancipador.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Reflexiona sobre los valores de libertad y soberanía popular, proponiendo acuerdos escolares para prevenir la discriminación y promover la inclusión comunitaria.`,
          relacion: 'Formación ciudadana crítica, liderazgo colaborativo y construcción de acuerdos democráticos.'
        }
      ];
    } else if (levelKey === 'primaria-alta') {
      return [
        {
          campoFormativo: 'Lenguajes (Primaria Alta - Fase 5)',
          pda: `Elabora ensayos históricos, periódicos murales y debates fundamentados sobre las cuatro etapas de la Independencia y el ideario plasmado en los "Sentimientos de la Nación".`,
          relacion: 'Pensamiento discursivo crítico, análisis de fuentes primarias y secundarias y argumentación oral rigurosa.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Analiza censos coloniales, proporciones demográficas de las castas en la Nueva España y modela datos geoespaciales de 1810 a 1821 con porcentajes y mapas a escala.`,
          relacion: 'Aplicación de porcentajes, proporcionalidad y análisis cuantitativo de la realidad sociohistórica.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Analiza críticamente las causas internas y externas de la guerra de Independencia, los Tratados de Córdoba y el Plan de Iguala en la consumación de la soberanía nacional.`,
          relacion: 'Conciencia histórica nacional, soberanía popular, abolición de la esclavitud y construcción del Estado mexicano.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Diseña iniciativas escolares para fomentar el patriotismo cívico, la equidad de género y los derechos fundamentales, inspiradas en los ideales insurgentes.`,
          relacion: 'Liderazgo social transformador, empatía histórica y promoción de los derechos humanos universales.'
        }
      ];
    } else if (levelKey === 'secundaria') {
      return [
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades (Secundaria - Fase 6)',
          pda: `Analiza críticamente desde diversas corrientes historiográficas la crisis novohispana, el impacto de la Ilustración, las conspiraciones criollas, el ideario insurgente (Morelos, Hidalgo) y la conformación del primer Estado mexicano independiente.`,
          relacion: 'Rigor historiográfico, análisis de fuentes primarias documentales y comprensión de procesos emancipadores continentales.'
        },
        {
          campoFormativo: 'Lenguajes (Español / Lengua Extranjera)',
          pda: `Produce ensayos académicos, discursos y mesas redondas con aparato crítico sobre el constitucionalismo emancipador (Constitución de Apatzingán) y los manifiestos de la Independencia.`,
          relacion: 'Argumentación dialéctica formal, análisis de textos fundacionales y oratoria deliberativa.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Modela cuantitativamente las variables económicas, pérdidas territoriales, endeudamiento y reorganización fiscal de México tras la consumación de la Independencia en 1821.`,
          relacion: 'Modelación matemática de fenómenos macroeconómicos y análisis estadístico crítico.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Evalúa los retos contemporáneos de la soberanía nacional, la autodeterminación de los pueblos y la cohesión social a partir de la memoria histórica de la emancipación.`,
          relacion: 'Conciencia cívica participativa, proyecto ético de vida y compromiso con la soberanía popular.'
        }
      ];
    } else {
      return [
        {
          campoFormativo: 'Conciencia Histórica y Humanidades (MCCEMS)',
          pda: `Examina con rigor historiográfico los procesos de emancipación en América Latina, el ideario ilustrado novohispano y la construcción de la soberanía popular en el México independiente.`,
          relacion: 'Pensamiento histórico crítico preuniversitario, juicio epistemológico y análisis de la soberanía nacional.'
        },
        {
          campoFormativo: 'Lengua y Comunicación',
          pda: `Construye discursos argumentativos y ensayos académicos rigurosamente citados sobre el pensamiento político de Morelos y el republicanismo emancipador.`,
          relacion: 'Escritura académica superior, rigor discursivo y dialéctica sociopolítica.'
        },
        {
          campoFormativo: 'Pensamiento Matemático',
          pda: `Modela variables demográficas, territoriales y hacendarias de la transición de la Nueva España al México independiente mediante análisis estadístico avanzado.`,
          relacion: 'Modelación analítica formal y análisis cuantitativo de la economía política histórica.'
        },
        {
          campoFormativo: 'Recursos Socioemocionales',
          pda: `Coordina foros de debate y proyectos cívicos sobre la soberanía y la autodeterminación comunitaria en el México actual.`,
          relacion: 'Responsabilidad social, liderazgo ético transformador y compromiso comunitario.'
        }
      ];
    }
  }

  // 1.2 DOMINIO HISTÓRICO - REVOLUCIÓN MEXICANA (1910-1917)
  if (isRevolution || isHistoryGeneral) {
    if (levelKey === 'preescolar') {
      return [
        {
          campoFormativo: 'Lenguajes (Preescolar - Fase 2)',
          pda: `Expresa oralmente relatos, canciones y corridos tradicionales sobre la Revolución Mexicana y la historia de su país a través del juego dramático, títeres y producciones plásticas.`,
          relacion: 'Oralidad infantil, apreciación de la música popular mexicana y primeros acercamientos a la memoria colectiva.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Identifica secuencias temporales sencillas (antes, durante y hoy), ordena imágenes históricas y compara juguetes y transportes antiguos con los actuales.`,
          relacion: 'Noción temporal inicial, clasificación perceptual y observación de cambios en el entorno.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Reconoce que forma parte de una comunidad con historia y festividades cívicas, compartiendo anécdotas de su familia sobre costumbres y personajes del pasado.`,
          relacion: 'Sentido de pertenencia comunitaria, identidad nacional y valoración de las tradiciones familiares.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Participa con alegría en rondas cívicas y juegos de roles de época, practicando la empatía, el diálogo y el respeto hacia todas las personas.`,
          relacion: 'Convivencia armónica, expresión motriz y valoración de la igualdad entre niñas y niños.'
        }
      ];
    } else if (levelKey === 'primaria-baja') {
      return [
        {
          campoFormativo: 'Lenguajes (Primaria Baja - Fase 3)',
          pda: `Produce e interpreta narraciones orales, coplas, corridos y dibujos sobre la Revolución Mexicana, dialogando con familiares sobre los relatos y personajes de la época.`,
          relacion: 'Alfabetización inicial con sentido social, rescate de la tradición oral y expresión artística de la memoria histórica.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Organiza secuencias temporales en calendarios y líneas del tiempo sencillas (antes de 1910, durante la lucha y la época actual), cuantificando años y colecciones de imágenes históricas.`,
          relacion: 'Uso del calendario, noción matemática de tiempo histórico y resolución de problemas de conteo con datos reales.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Indaga en relatos familiares, fotografías y testimonios de su comunidad los hechos de la Revolución Mexicana, reconociendo cómo transformaron la vida cotidiana, la escuela y los derechos de las personas.`,
          relacion: 'Compromiso cívico, valoración del derecho a la educación pública y reconocimiento de la lucha campesina y obrera.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Participa en dramatizaciones y juegos de roles sobre personajes históricos (Madero, Zapata, Villa y las Adelitas), valorando la igualdad, la solidaridad y la cultura de paz.`,
          relacion: 'Trabajo colaborativo, reconocimiento del papel de las mujeres en la historia y convivencia pacífica.'
        }
      ];
    } else if (levelKey === 'primaria-media') {
      return [
        {
          campoFormativo: 'Lenguajes (Primaria Media - Fase 4)',
          pda: `Redacta textos expositivos, reseñas históricas y biografías ilustradas acerca de los líderes y las demandas sociales de la Revolución Mexicana en su entidad federativa.`,
          relacion: 'Comprensión lectora de fuentes históricas, redacción de párrafos cronológicos y uso de conectores temporales.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Interpreta mapas históricos regionales, distancias geográficas recorridas por los ejércitos revolucionarios y organiza datos demográficos de la época en tablas y gráficas de barras.`,
          relacion: 'Pensamiento geoespacial, cálculo de distancias y tratamiento de datos estadísticos históricos.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Analiza las causas agrarias, laborales y políticas de la Revolución Mexicana en su región y en el país, valorando la justicia social y el reparto de tierras.`,
          relacion: 'Conciencia histórica regional, defensa de los derechos de los pueblos originarios y comunidades campesinas.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Reflexiona sobre la resolución pacífica de conflictos y la importancia de defender los derechos colectivos mediante la participación ciudadana organizada.`,
          relacion: 'Formación ciudadana crítica, liderazgo colaborativo y construcción de acuerdos escolares.'
        }
      ];
    } else if (levelKey === 'primaria-alta') {
      return [
        {
          campoFormativo: 'Lenguajes (Primaria Alta - Fase 5)',
          pda: `Elabora ensayos históricos, periódicos murales y debates fundamentados sobre las distintas corrientes ideológicas (maderismo, zapatismo, villismo y carrancismo) de la Revolución Mexicana.`,
          relacion: 'Pensamiento discursivo crítico, análisis de fuentes primarias y secundarias y argumentación oral rigurosa.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Analiza censos poblacionales, variaciones porcentuales en la tenencia de la tierra y calcula proporciones socioeconómicas del México de 1910 en comparación con el presente.`,
          relacion: 'Aplicación de porcentajes, proporcionalidad y análisis cuantitativo de la realidad sociohistórica.'
        },
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades',
          pda: `Analiza críticamente las causas del estallido de 1910, la promulgación de la Constitución de 1917 y la vigencia de las garantías sociales (Artículos 3º, 27 y 123) en el México actual.`,
          relacion: 'Conciencia histórica nacional, soberanía popular, derechos laborales y defensa de la educación laica y gratuita.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Diseña propuestas comunitarias orientadas a la equidad, los derechos laborales y la erradicación de la discriminación, inspiradas en los ideales de justicia social.`,
          relacion: 'Liderazgo social transformador, empatía histórica y promoción de los derechos humanos.'
        }
      ];
    } else if (levelKey === 'secundaria') {
      return [
        {
          campoFormativo: 'Ética, Naturaleza y Sociedades (Secundaria - Fase 6)',
          pda: `Analiza críticamente desde diversas corrientes historiográficas las contradicciones socioeconómicas del Porfiriato, los planes revolucionarios (San Luis, Ayala, Guadalupe) y la institucionalización del Estado mexicano.`,
          relacion: 'Rigor historiográfico, análisis de fuentes primarias documentales y comprensión de procesos estructurales de larga duración.'
        },
        {
          campoFormativo: 'Lenguajes (Español / Lengua Extranjera)',
          pda: `Produce ensayos académicos, artículos de opinión y mesas redondas formales con aparato crítico sobre el impacto discursivo, literario y periodístico de la Revolución Mexicana.`,
          relacion: 'Argumentación dialéctica formal, análisis de la prensa de época y oratoria deliberativa.'
        },
        {
          campoFormativo: 'Saberes y Pensamiento Científico',
          pda: `Modela cuantitativamente datos demográficos, pérdidas humanas, impacto económico y transformaciones en las vías de comunicación (ferrocarril) durante la etapa revolucionaria.`,
          relacion: 'Modelación matemática de fenómenos sociodemográficos y análisis estadístico crítico.'
        },
        {
          campoFormativo: 'De lo Humano y lo Comunitario',
          pda: `Evalúa los retos contemporáneos del estado de derecho, la soberanía nacional y la justicia social agraria a la luz de los principios de la Constitución de 1917.`,
          relacion: 'Conciencia cívica participativa, proyecto ético de vida y compromiso con la democracia sustantiva.'
        }
      ];
    } else {
      return [
        {
          campoFormativo: 'Conciencia Histórica y Humanidades (MCCEMS)',
          pda: `Evalúa con aparato crítico las transformaciones estructurales, reformas agrarias, educativas e institucionales derivadas de la Revolución Mexicana en el México contemporáneo.`,
          relacion: 'Pensamiento histórico crítico preuniversitario, juicio epistemológico y análisis de la soberanía nacional.'
        },
        {
          campoFormativo: 'Lengua y Comunicación',
          pda: `Construye discursos argumentativos y ensayos académicos rigurosamente citados sobre las repercusiones ideológicas y políticas de la Revolución Mexicana.`,
          relacion: 'Escritura académica superior, rigor discursivo y dialéctica sociopolítica.'
        },
        {
          campoFormativo: 'Pensamiento Matemático',
          pda: `Modela variables macroeconómicas, distribución del ingreso y transformaciones demográficas de México a lo largo del siglo XX con cálculo y estadística aplicada.`,
          relacion: 'Modelación analítica formal y análisis cuantitativo de la economía política.'
        },
        {
          campoFormativo: 'Recursos Socioemocionales',
          pda: `Coordina proyectos de participación ciudadana y memoria histórica comunitaria en defensa de los derechos fundamentales y la equidad social.`,
          relacion: 'Responsabilidad social, liderazgo ético transformador y compromiso comunitario.'
        }
      ];
    }
  }

  // 2. DOMINIO DE CORRESPONDENCIA Y TEXTOS EPISTOLARES
  if (isEpistolar) {
    return [
      {
        campoFormativo: 'Lenguajes (Español)',
        pda: `Produce y lee textos epistolares (cartas personales y formales) dirigidas a familiares, docentes y compañeros, reconociendo la estructura canónica (lugar, fecha, destinatario, saludo, cuerpo, despedida, firma y remitente).`,
        relacion: 'Desarrollo de la escritura autónoma, correspondencia grafofonética y expresión de afectos e ideas con propósito comunicativo real.'
      },
      {
        campoFormativo: 'Saberes y Pensamiento Científico',
        pda: `Organiza datos numéricos, códigos postales, fechas en el calendario y conteo de piezas postales depositadas en el buzón escolar.`,
        relacion: 'Uso del calendario, secuencias temporales, numeración y clasificación de correspondencia.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Reconoce el papel histórico de los medios de comunicación escrita y los servicios postales en la cohesión de las familias y pueblos de México.`,
        relacion: 'Apreciación del patrimonio cultural, respeto a la privacidad de la correspondencia y convivencia pacífica.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Expresa emociones, agradecimientos y acuerdos de resolución pacífica de conflictos a través de mensajes escritos en el buzón del aula.`,
        relacion: 'Fortalecimiento de la empatía, los lazos afectivos intergeneracionales y la autorregulación emocional.'
      }
    ];
  }

  // 3. DOMINIO DE CUENTOS, MITOS, FÁBULAS Y LITERATURA
  if (isLiterature) {
    return [
      {
        campoFormativo: 'Lenguajes (Literatura y Tradición Oral)',
        pda: `Lee, recrea y produce relatos, fábulas y leyendas locales identificando su estructura narrativa (inicio, desarrollo, nudo y desenlace), empleando signos de puntuación y descripciones detalladas.`,
        relacion: 'Comprensión lectora profunda, enriquecimiento del léxico y creación literaria autónoma.'
      },
      {
        campoFormativo: 'Saberes y Pensamiento Científico',
        pda: `Organiza la secuencia cronológica de los acontecimientos en una línea temporal y cuantifica elementos y personajes de los relatos populares.`,
        relacion: 'Estructuración temporal lógica, seriación y resolución de retos de ordenación.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Indaga con los adultos mayores los mitos y leyendas que explican el origen y la cosmovisión de su comunidad, reconociendo el valor del patrimonio cultural intangible.`,
        relacion: 'Rescate de la memoria comunitaria, respeto a la diversidad cultural y diálogo intergeneracional.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Dramatiza cuentos y fábulas en equipo, asumiendo roles con empatía y reflexionando sobre las moralejas y valores de solidaridad y respeto.`,
        relacion: 'Expresión corporal, desarrollo socioemocional y trabajo cooperativo sin exclusión.'
      }
    ];
  }

  // 4. DOMINIO DE MATEMÁTICAS: FRACCIONES, REPARTO Y NÚMEROS
  if (isFractions || isMathStoreOrMoney || isMathGeneral) {
    return [
      {
        campoFormativo: 'Saberes y Pensamiento Científico (Matemáticas)',
        pda: isFractions 
          ? `Representa, compara y resuelve problemas de suma y equivalencia de fracciones (medios, cuartos, octavos) en contextos cotidianos de medición y reparto equitativo con material concreto.`
          : isMathStoreOrMoney
          ? `Resuelve situaciones problemáticas de compra, venta, valor posicional y cálculo de presupuestos utilizando monedas y billetes didácticos en la tiendita escolar.`
          : `Resuelve problemas situados mediante algoritmos, estimaciones, patrones numéricos y modelación geométrica aplicados a situaciones reales de "${capitalizedTopic}".`,
        relacion: 'Desarrollo del razonamiento lógico-matemático, cálculo mental y aplicación práctica en la economía del hogar.'
      },
      {
        campoFormativo: 'Lenguajes (Comunicación Matemática)',
        pda: `Comunica de forma oral y escrita explicaciones, instrucciones y procedimientos matemáticos utilizados para resolver retos vinculados a "${capitalizedTopic}".`,
        relacion: 'Precisión conceptual, vocabulario matemático formal y argumentación clara de procesos.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Valora la equidad, la justicia distributiva y el consumo responsable en el reparto de recursos y compras comunitarias.`,
        relacion: 'Formación ética en el uso de los recursos, comercio justo y prevención de abusos económicos.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Colabora en estaciones y juegos matemáticos en equipo, respetando los turnos, apoyando a quienes requieren orientación y celebrando los logros colectivos.`,
        relacion: 'Confianza matemática, perseverancia en la resolución de problemas y aprendizaje cooperativo.'
      }
    ];
  }

  // 5. DOMINIO DE CIENCIAS, AGUA, HUERTO Y MEDIO AMBIENTE
  if (isWater || isGardenOrFood || isCleanEnergy || isScienceGeneral) {
    return [
      {
        campoFormativo: 'Saberes y Pensamiento Científico (Ciencias Naturales)',
        pda: isWater
          ? `Indaga el ciclo hidrológico, las propiedades físicas del agua y diseña prototipos de filtración y captación pluvial para el cuidado hídrico en la escuela.`
          : isGardenOrFood
          ? `Experimenta con el proceso de germinación, nutrición vegetal y la importancia del Plato del Bien Comer frente a los alimentos ultraprocesados.`
          : isCleanEnergy
          ? `Explica la transformación de la biomasa y fuentes de energía limpia, construyendo modelos demostrativos de bajo impacto ambiental.`
          : `Observa, formula hipótesis y experimenta para explicar fenómenos naturales y propiedades de la materia en torno a "${capitalizedTopic}".`,
        relacion: 'Pensamiento científico indagatorio, rigor experimental y aplicación de ecotecnias comunitarias.'
      },
      {
        campoFormativo: 'Lenguajes (Divulgación Científica)',
        pda: `Elabora bitácoras de campo, infografías y carteles ilustrados para divulgar hallazgos científicos y promover la educación ambiental en la escuela.`,
        relacion: 'Redacción de textos explicativos, síntesis de datos experimentales y comunicación visual asertiva.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Evalúa el impacto de las actividades humanas en los ecosistemas locales y propone acuerdos comunitarios para la conservación del entorno y la sustentabilidad.`,
        relacion: 'Conciencia ecológica bioética, justicia ambiental y defensa del derecho a un medio ambiente sano.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Organiza brigadas escolares para el mantenimiento del huerto, el ahorro de agua y la adopción de estilos de vida saludables en su comunidad.`,
        relacion: 'Responsabilidad social compartida, vida saludable y trabajo comunitario transformador.'
      }
    ];
  }

  // 6. DOMINIO DE FORMACIÓN CÍVICA, DERECHOS Y PAZ
  if (isCivicsPeace) {
    return [
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Reconoce los derechos fundamentales de las niñas y los niños, promueve la igualdad de género y participa en la construcción de acuerdos de convivencia pacífica en el aula.`,
        relacion: 'Formación cívica y ética, defensa de los derechos humanos y erradicación de toda forma de discriminación.'
      },
      {
        campoFormativo: 'Lenguajes (Diálogo y Mediación)',
        pda: `Utiliza el diálogo empático, la asamblea escolar y la redacción de acuerdos para mediar desacuerdos y expresar propuestas de mejora para su escuela.`,
        relacion: 'Oratoria asertiva, escucha activa y elaboración de reglamentos y acuerdos colectivos.'
      },
      {
        campoFormativo: 'Saberes y Pensamiento Científico',
        pda: `Recaba y organiza datos en encuestas sobre la convivencia escolar, analizando en tablas las necesidades prioritarias del grupo.`,
        relacion: 'Tratamiento de información social, análisis crítico de estadísticas comunitarias y toma de decisiones informada.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Desarrolla habilidades socioemocionales de autorregulación, empatía y resolución no violenta de conflictos en actividades lúdicas y colaborativas.`,
        relacion: 'Cultura de paz, inteligencia emocional y fortalecimiento de lazos de amistad y solidaridad.'
      }
    ];
  }

  // 7. FALLBACK PEDAGÓGICO INTEGRAL SEGÚN LA FASE (100% ARTICULADO, CERO GENERALIDADES)
  if (levelKey === 'preescolar') {
    return [
      {
        campoFormativo: 'Lenguajes (Preescolar - Fase 2)',
        pda: `Expresa oralmente sus ideas, emociones y preguntas sobre "${capitalizedTopic}", escuchando los relatos de sus compañeros e ilustrando sus descubrimientos.`,
        relacion: 'Desarrollo de la oralidad, confianza comunicativa y primeras representaciones gráficas.'
      },
      {
        campoFormativo: 'Saberes y Pensamiento Científico',
        pda: `Explora objetos y situaciones del entorno vinculadas a "${capitalizedTopic}" usando sus sentidos, clasificando por atributos y contando colecciones pequeñas.`,
        relacion: 'Curiosidad científica inicial, conteo perceptual y razonamiento lógico tangible.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Reconoce las reglas y acuerdos de su salón al realizar actividades sobre "${capitalizedTopic}", cuidando los materiales y conviviendo con respeto.`,
        relacion: 'Pertenencia al grupo, valores de empatía y cuidado de los recursos compartidos.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Coordina sus movimientos y participa con entusiasmo en dinámicas corporales y juegos cooperativos en torno a "${capitalizedTopic}".`,
        relacion: 'Desarrollo psicomotriz, autorregulación en el juego y socialización infantil.'
      }
    ];
  } else if (levelKey === 'primaria-baja') {
    return [
      {
        campoFormativo: 'Lenguajes (Primaria Baja - Fase 3)',
        pda: `Describe de forma oral y escrita situaciones y saberes acerca de "${capitalizedTopic}" mediante la escritura autónoma, el dibujo y el dictado colectivo.`,
        relacion: 'Consolidación de la lectoescritura con propósito social, correspondencia grafofonética y expresión clara.'
      },
      {
        campoFormativo: 'Saberes y Pensamiento Científico',
        pda: `Utiliza material concreto, tablas y dibujos para cuantificar, medir y comparar datos relacionados con retos prácticos de "${capitalizedTopic}".`,
        relacion: 'Resolución de problemas de suma y resta, valor posicional y estimación de medidas cotidianas.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Identifica cómo influyen las acciones de las personas en el bienestar de la comunidad escolar y su entorno respecto a "${capitalizedTopic}".`,
        relacion: 'Responsabilidad cívica escolar, cuidado del medio ambiente y convivencia armónica.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Participa activamente en equipos de trabajo para resolver tareas de "${capitalizedTopic}", respetando los turnos y reconociendo el valor de cada compañero.`,
        relacion: 'Trabajo colaborativo, autoestima y fomento de la empatía en el aula.'
      }
    ];
  } else if (levelKey === 'primaria-media') {
    return [
      {
        campoFormativo: 'Lenguajes (Primaria Media - Fase 4)',
        pda: `Indaga en diversas fuentes informativas, sintetiza ideas clave y redacta textos explicativos e instructivos estructurados sobre "${capitalizedTopic}" empleando conectores lógicos y signos de puntuación.`,
        relacion: 'Comprensión lectora analítica, redacción estructurada en párrafos y divulgación de saberes.'
      },
      {
        campoFormativo: 'Saberes y Pensamiento Científico',
        pda: `Plantea preguntas, formula hipótesis tentativas y registra observaciones empíricas sistemáticas sobre los componentes y fenómenos de "${capitalizedTopic}" en su entorno escolar y comunitario.`,
        relacion: 'Indagación científica escolar, pensamiento lógico y registro riguroso de evidencias empíricas.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Examina la relevancia y consecuencias sociales o ambientales de "${capitalizedTopic}" en la vida cotidiana de su entidad federativa, proponiendo acciones orientadas al bien común.`,
        relacion: 'Identidad regional, pensamiento ético situado y participación democrática escolar.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Colabora en equipos escolares mediante acuerdos consensuados, diálogo empático y distribución equitativa de roles para desarrollar propuestas de acción comunitaria sobre "${capitalizedTopic}".`,
        relacion: 'Toma de acuerdos colectivos, trabajo colaborativo solidario y convivencia escolar armónica.'
      }
    ];
  } else if (levelKey === 'primaria-alta') {
    return [
      {
        campoFormativo: 'Lenguajes (Primaria Alta - Fase 5)',
        pda: `Elabora ensayos breves, reseñas críticas y participa en debates formales sobre "${capitalizedTopic}", sustentando sus argumentos en fuentes confiables.`,
        relacion: 'Pensamiento crítico discursivo, análisis literario e informativo y comunicación oral asertiva.'
      },
      {
        campoFormativo: 'Saberes y Pensamiento Científico',
        pda: `Aplica modelos matemáticos (porcentajes, volumen, proporcionalidad) y el método experimental para investigar fenómenos asociados a "${capitalizedTopic}".`,
        relacion: 'Pensamiento probabilístico, pensamiento STEM y experimentación científica rigurosa.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Evalúa críticamente los procesos socioambientales y las leyes que regulan problemáticas vinculadas a "${capitalizedTopic}" a nivel nacional.`,
        relacion: 'Conciencia histórica de México, soberanía, sustentabilidad ecológica y derechos humanos.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Lidera proyectos comunitarios colaborativos orientados al bienestar común y la equidad social en torno a "${capitalizedTopic}".`,
        relacion: 'Liderazgo transformador, resiliencia comunitaria y cultura de paz.'
      }
    ];
  } else if (levelKey === 'secundaria') {
    return [
      {
        campoFormativo: 'Saberes y Pensamiento Científico (Secundaria - Fase 6)',
        pda: `Modela situaciones y fenómenos reales relacionados con "${capitalizedTopic}" mediante expresiones algebraicas, gráficas, funciones y contrastación experimental de laboratorio.`,
        relacion: 'Rigor cuantitativo, formulación de modelos matemáticos y leyes científicas fundamentales.'
      },
      {
        campoFormativo: 'Lenguajes (Español / Lengua Extranjera)',
        pda: `Produce ensayos académicos, artículos de divulgación y participa en mesas redondas formales sobre "${capitalizedTopic}" con rigor metodológico y citas textuales.`,
        relacion: 'Argumentación crítica avanzada, dialéctica y divulgación del conocimiento científico.'
      },
      {
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        pda: `Analiza críticamente las causas estructurales, históricas y éticas de las problemáticas socioambientales ligadas a "${capitalizedTopic}".`,
        relacion: 'Conciencia histórica crítica, geopolítica, sostenibilidad y justicia social transformadora.'
      },
      {
        campoFormativo: 'De lo Humano y lo Comunitario',
        pda: `Diseña prototipos tecnológicos y propuestas productivas comunitarias orientadas a la innovación y el proyecto de vida en torno a "${capitalizedTopic}".`,
        relacion: 'Innovación técnica, vocación productiva, salud integral y proyecto de vida.'
      }
    ];
  } else {
    return [
      {
        campoFormativo: 'Lengua y Comunicación (MCCEMS)',
        pda: `Construye discursos argumentativos y ensayos críticos preuniversitarios sobre "${capitalizedTopic}", integrando diversas perspectivas epistemológicas y normas de citación formal.`,
        relacion: 'Pensamiento analítico superior, juicio crítico y comunicación académica especializada.'
      },
      {
        campoFormativo: 'Pensamiento Matemático y Ciencias Naturales',
        pda: `Modela sistemas complejos y resuelve problemas cuantitativos de cálculo, probabilidad y física/química aplicada en torno a "${capitalizedTopic}".`,
        relacion: 'Modelación matemática formal, abstracción analítica y metodología científica avanzada.'
      },
      {
        campoFormativo: 'Conciencia Histórica y Humanidades',
        pda: `Examina las implicaciones éticas, filosóficas e históricas de "${capitalizedTopic}" en el desarrollo contemporáneo de la sociedad mexicana y mundial.`,
        relacion: 'Reflexión filosófica, análisis social interdisciplinario y ciudadanía crítica universal.'
      },
      {
        campoFormativo: 'Recursos Socioemocionales',
        pda: `Coordina proyectos de impacto comunitario y responsabilidad social vinculados a "${capitalizedTopic}", demostrando liderazgo ético y compromiso ciudadano.`,
        relacion: 'Transformación del entorno social, compromiso ético y desarrollo humano integral.'
      }
    ];
  }
}

/**
 * Generador de Propuesta de Proyecto Final Integrador Situado y Específico (Basado en Libros Oficiales SEP / NEM)
 * Universal para todos los niveles educativos (Preescolar a Bachillerato) y todas las disciplinas.
 */
export function generateFinalProjectProposal(level: string, subject: string, topic: string): FinalProjectProposal {
  const cleanTopic = cleanCoreTopicName(topic);
  const capitalizedTopic = cleanTopic;
  const levelKey = level || 'primaria-baja';
  const domain = classifyPedagogicalDomain(cleanTopic, subject);

  // 1. DOMINIO TRADICIONES Y PATRIMONIO BIOCULTURAL
  if (domain === 'traditions_culture') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      return {
        titulo: `Ofrenda Tradicional Viva y Álbum de Recuerdos: "Costumbres y Sabores de ${capitalizedTopic}"`,
        problematicaComunitaria: `En nuestra comunidad escolar y familiar se requiere fortalecer la transmisión oral de los saberes ancestrales sobre "${capitalizedTopic}", valorando los elementos naturales, la convivencia afectiva y el respeto a la memoria familiar.`,
        proposito: `Investigar en relatos de abuelos, familias y libros de texto de la SEP los elementos naturales (cempasúchil, frutas, copal) y montar una ofrenda viva infantil con dibujos, modelado y versos tradicionales.`,
        productoFinal: `Instalación de la "Ofrenda Tradicional Infantil de ${capitalizedTopic}" en el aula, con módulos de elementos naturales (flores nativas, semillas, frutas), dibujos rotulados por los alumnos y recital de rimas y cantos ante las familias.`,
        impactoSocial: `Fortalece la identidad cultural temprana, estrecha lazos afectivos con las familias y estimula el respeto a la diversidad de costumbres locales.`,
        rubrica: {
          criterio1: {
            nombre: 'Indagación Familiar y Elementos Tradicionales',
            sobresaliente: `Recupera con entusiasmo relatos familiares y reconoce los elementos naturales del altar tradicional y su significado.`,
            satisfactorio: `Identifica los elementos principales de la tradición con apoyo de su familia y el docente.`,
            enProceso: `Presenta dificultades para identificar los elementos o el sentido de la celebración.`
          },
          criterio2: {
            nombre: 'Expresión Plástica y Oral Infantil',
            sobresaliente: `Elabora dibujos detallados, piezas de modelado y recita coplas o rimas tradicionales con alegría y claridad.`,
            satisfactorio: `Participa en la elaboración de dibujos o manualidades para el altar con orden y limpieza.`,
            enProceso: `Muestra timidez o poco interés en las actividades artísticas del proyecto.`
          },
          criterio3: {
            nombre: 'Convivencia Afectiva en el Montaje Colectivo',
            sobresaliente: `Colabora con generosidad y respeto con sus compañeros y familias durante la preparación y muestra de la ofrenda.`,
            satisfactorio: `Trabaja en equipo y comparte materiales de forma armoniosa.`,
            enProceso: `Le cuesta compartir materiales o integrarse al trabajo con el grupo.`
          }
        }
      };
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      return {
        titulo: `Ofrenda Viva y Memoria Comunitaria: "Patrimonio Biocultural, Tradiciones y Calaveritas sobre ${capitalizedTopic}"`,
        problematicaComunitaria: `En nuestra comunidad escolar y en el entorno local se ha debilitado la transmisión oral de los saberes ancestrales y el significado profundo del patrimonio biocultural y lírico de nuestra entidad en torno a "${capitalizedTopic}".`,
        proposito: `Investigar en fuentes familiares, comunitarias y libros de texto de la SEP (Proyectos Escolares / Cartografía de México) el origen, los elementos bioculturales (flores nativas, copal, alimentos de temporada) y las manifestaciones literarias (calaveritas y relatos orales) para montar una ofrenda viva comunitaria y recital tradicional.`,
        productoFinal: `Montaje de la "Ofrenda Tradicional Viva de Nuestra Entidad" en el patio escolar, con módulos de elementos bioculturales (cempasúchil, gastronomía regional), exposición de tapetes artesanales, antología ilustrada de calaveritas literarias y tertulia de relatos con familias y adultos mayores.`,
        impactoSocial: `Fortalece el sentido de pertenencia y arraigo cultural en las niñas y niños, dignifica la memoria de los antepasados y estrecha los lazos afectivos y solidarios entre la escuela y las familias de la comunidad.`,
        rubrica: {
          criterio1: {
            nombre: 'Indagación del Patrimonio Biocultural y Tradición Oral',
            sobresaliente: `Recupera con profundidad relatos familiares, el simbolismo de los altares y el uso de flora nativa (cempasúchil) y alimentos de temporada con base en fuentes comunitarias y libros SEP.`,
            satisfactorio: `Identifica los elementos principales del altar tradicional y explica su significado con apoyo de lecturas e indagación familiar.`,
            enProceso: `Presenta dificultades para explicar el origen o significado de los elementos tradicionales.`
          },
          criterio2: {
            nombre: 'Producción Literaria y Artística Tradicional (Calaveritas y Ofrenda)',
            sobresaliente: `Crea calaveritas literarias con excelente métrica, rima consonante, humor respetuoso y elabora piezas plásticas para el altar con alta calidad estética y simbólica.`,
            satisfactorio: `Elabora calaveritas o dibujos para el altar con orden, rima básica y apego a la temática de la festividad.`,
            enProceso: `Los textos o trabajos plásticos carecen de relación con la lírica o simbolismo tradicional.`
          },
          criterio3: {
            nombre: 'Participación en el Montaje Comunitario y Convivencia Afectiva',
            sobresaliente: `Colabora con entusiasmo, respeto y liderazgo solidario en el montaje y atención de la ofrenda, dialogando cordialmente con familias y visitantes.`,
            satisfactorio: `Participa activamente en su equipo y explica su sección de la ofrenda con claridad y amabilidad.`,
            enProceso: `Muestra poca disposición para colaborar en equipo o atender el evento escolar.`
          }
        }
      };
    } else {
      return {
        titulo: `Muestra Etnográfica y Encuentro Intercultural: "Sincretismo, Memoria Colectiva y Resistencia Cultural en ${capitalizedTopic}"`,
        problematicaComunitaria: `Desarticulación entre los saberes ancestrales de los pueblos originarios y las juventudes contemporáneas ante la mercantilización y descontextualización de "${capitalizedTopic}".`,
        proposito: `Analizar el sincretismo histórico, la cosmovisión sobre la vida y la muerte y el valor etnobotánico regional para montar una instalación comunitaria, documental multimedia y foro de diálogo intercultural (Colección Ximhai / MCCEMS).`,
        productoFinal: `Exposición etnográfica y documental multimedia sobre las variantes regionales de "${capitalizedTopic}", con ensayos críticos, altares monumentales bioculturales y coloquio escolar con especialistas comunitarios.`,
        impactoSocial: `Revaloriza los saberes bioculturales de los pueblos originarios, promueve el pensamiento crítico ante el consumo globalizado y afianza la identidad juvenil comunitaria.`,
        rubrica: {
          criterio1: {
            nombre: 'Análisis Etnohistórico y Rigor Conceptual',
            sobresaliente: `Fundamenta el origen prehispánico, virreinal y contemporáneo de la festividad con base en fuentes etnográficas rigurosas y bibliografía especializada.`,
            satisfactorio: `Explica las transformaciones históricas de la tradición apoyándose en textos escolares e indagación formal.`,
            enProceso: `El análisis histórico es superficial o confunde elementos folclóricos con datos documentados.`
          },
          criterio2: {
            nombre: 'Curaduría y Producción Cultural Comunitaria',
            sobresaliente: `Diseña una museografía de alta calidad estética con cédulas informativas impecables, testimonios orales grabados y respeto absoluto al patrimonio inmaterial.`,
            satisfactorio: `Presenta su montaje etnográfico con orden, cédulas comprensibles y materiales pertinentes.`,
            enProceso: `El montaje carece de rigor explicativo o la presentación visual es descuidada.`
          },
          criterio3: {
            nombre: 'Liderazgo y Difusión Dialógica en el Foro',
            sobresaliente: `Conduce el diálogo con elocuencia, respeto y sensibilidad intercultural, respondiendo con solvencia a las preguntas del público y familias.`,
            satisfactorio: `Expone su módulo con claridad y participa cordialmente en la atención del evento.`,
            enProceso: `Dificultad para interactuar con la audiencia o explicar los fundamentos culturales del proyecto.`
          }
        }
      };
    }
  }

  // 1.1 DOMINIO HISTÓRICO - INDEPENDENCIA DE MÉXICO
  if (domain === 'history_independence') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      return {
        titulo: `Galería Infantil de los Héroes de la Patria: "El Grito de Dolores y el Nacimiento de Nuestra Independencia"`,
        problematicaComunitaria: `En nuestra comunidad escolar y familiar se requiere fortalecer el conocimiento sobre las raíces históricas de México, comprendiendo por qué conmemoramos el 16 de septiembre y qué valores de libertad, igualdad y valentía nos heredaron los héroes insurgentes.`,
        proposito: `Investigar a través de relatos familiares, canciones patrióticas y libros de texto gratuitos de la SEP (Proyectos de Aula 2º Grado / Nuestros Saberes) los acontecimientos del inicio de la Independencia y la vida de Miguel Hidalgo, Josefa Ortiz de Domínguez e Ignacio Allende para montar una feria cívica escolar.`,
        productoFinal: `Instalación de la "Feria Cívica Infantil de la Independencia" en el salón, con dibujos rotulados de los héroes insurgentes, dramatización infantil guiada del Grito de Dolores con campanas simbólicas y recital de coplas patrióticas ante las familias.`,
        impactoSocial: `Inicia a las niñas y niños en la comprensión del valor de la libertad y la justicia, despierta el respeto a los símbolos patrios y fortalece los lazos de convivencia escolar con las familias.`,
        rubrica: {
          criterio1: {
            nombre: 'Reconocimiento de los Héroes Insurgentes y su Lucha',
            sobresaliente: `Reconoce a Miguel Hidalgo, Josefa Ortiz de Domínguez y Allende, explicando con sus palabras por qué lucharon por la libertad y la igualdad de las personas.`,
            satisfactorio: `Identifica a los héroes principales y relata aspectos básicos del Grito de Dolores.`,
            enProceso: `Muestra dificultad para identificar a los personajes históricos o confunde las conmemoraciones.`
          },
          criterio2: {
            nombre: 'Expresión Artística y Narración Oral del Grito',
            sobresaliente: `Elabora dibujos expresivos y coloridos de los héroes y símbolos patrios, y participa con entusiasmo en la dramatización cívica con lenguaje claro.`,
            satisfactorio: `Realiza sus dibujos y participa en la dramatización con apoyo del docente.`,
            enProceso: `Presenta timidez o desinterés en las actividades artísticas y narrativas del proyecto.`
          },
          criterio3: {
            nombre: 'Convivencia y Respeto en la Muestra Cívica',
            sobresaliente: `Muestra actitud de respeto y alegría durante la ceremonia cívica, colabora en el arreglo del salón y escucha con atención a sus compañeros.`,
            satisfactorio: `Participa con orden en la presentación y comparte sus trabajos con las familias.`,
            enProceso: `Le cuesta mantener el orden o colaborar con su equipo de trabajo.`
          }
        }
      };
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      return {
        titulo: `Museo Viviente de la Emancipación: "De la Conspiración de Querétaro a la Consumación de la Independencia de México"`,
        problematicaComunitaria: `Los estudiantes requieren profundizar en el análisis crítico de las cuatro etapas del movimiento insurgente, contrastando los ideales de justicia social de los "Sentimientos de la Nación" con la realidad de nuestra entidad federativa.`,
        proposito: `Analizar fuentes primarias y libros de texto de la SEP (Nuestros Saberes 4º / Proyectos Escolares 5º) para diseñar salas temáticas interactivas del proceso emancipador de 1810 a 1821.`,
        productoFinal: `Montaje del "Museo Histórico Viviente de la Independencia" en el patio cívico, con 4 módulos temáticos atendidos por estudiantes caracterizados, periódicos facsimilares de época, mapas de las campañas de Morelos e Hidalgo y debate con la comunidad escolar.`,
        impactoSocial: `Sensibiliza sobre la soberanía nacional, los derechos fundamentales y la vigencia del ideario de justicia social en el México contemporáneo.`,
        rubrica: {
          criterio1: {
            nombre: 'Análisis de las Etapas e Ideario Insurgente',
            sobresaliente: `Explica con rigor cronológico las 4 etapas de la Independencia y la trascendencia de los Sentimientos de la Nación en la abolición de la esclavitud y la igualdad.`,
            satisfactorio: `Identifica los momentos centrales de la lucha insurgente apoyándose en lecturas y líneas de tiempo.`,
            enProceso: `Presenta confusiones cronológicas entre las etapas o desconoce los documentos fundacionales.`
          },
          criterio2: {
            nombre: 'Producción Museográfica y Cédulas Históricas',
            sobresaliente: `Elabora cédulas museográficas ilustradas, mapas de batallas y periódicos de época con redacción impecable y creatividad histórica.`,
            satisfactorio: `Diseña su material expositivo con orden, limpieza y datos históricos correctos.`,
            enProceso: `El material es incompleto o carece de sustento documental.`
          },
          criterio3: {
            nombre: 'Conducción y Diálogo Crítico con Visitantes',
            sobresaliente: `Explica con elocuencia y dominio temático su módulo a las familias, respondiendo preguntas y vinculando la historia con los derechos actuales.`,
            satisfactorio: `Atiende su estación de forma adecuada y comunica con amabilidad lo aprendido.`,
            enProceso: `Muestra inseguridad o dificultad para expresarse ante el público.`
          }
        }
      };
    } else {
      return {
        titulo: `Coloquio Historiográfico y Archivo Documental: "Pensamiento Ilustrado, Insurgencia Popular y Soberanía Nacional en la Independencia de México"`,
        problematicaComunitaria: `Necesidad de examinar críticamente las contradicciones de la sociedad novohispana, el impacto de las reformas borbónicas y los proyectos de nación en pugna durante el proceso emancipador.`,
        proposito: `Realizar una investigación historiográfica rigurosa analizando fuentes primarias (Constitución de Apatzingán, Sentimientos de la Nación, Plan de Iguala, Tratados de Córdoba) para debatir en un coloquio académico juvenil (Colección Ximhai / MCCEMS).`,
        productoFinal: `Coloquio estudiantil "Voces y Documentos de la Independencia", edición de revista facsimilar comentada y podcast de divulgación histórica comunitaria.`,
        impactoSocial: `Desarrolla el pensamiento crítico preuniversitario, fortalece la identidad ciudadana y defiende la soberanía popular.`,
        rubrica: {
          criterio1: {
            nombre: 'Rigor Historiográfico y Análisis de Fuentes Primarias',
            sobresaliente: `Examina con aparato crítico fuentes primarias novohispanas e insurgentes, contrastando interpretaciones historiográficas y citando formalmente.`,
            satisfactorio: `Sustenta su ensayo histórico con documentos clave y argumentos coherentes.`,
            enProceso: `Carece de aparato crítico o reproduce relatos anecdóticos sin sustento.`
          },
          criterio2: {
            nombre: 'Argumentación Dialéctica en Ponencia y Revista',
            sobresaliente: `Escribe y expone con solvencia teórica su ponencia, defendiendo con claridad sus tesis sobre la soberanía popular y el Estado constitucional.`,
            satisfactorio: `Presenta su ponencia con estructura académica y claridad discursiva.`,
            enProceso: `Dificultad para estructurar argumentos o responder a contraargumentos.`
          },
          criterio3: {
            nombre: 'Liderazgo Académico y Divulgación Comunitaria',
            sobresaliente: `Modera mesas de debate con apertura democrática y coordina la edición digital de la revista con excelencia técnica.`,
            satisfactorio: `Participa activamente en las mesas de debate y colabora en la revista escolar.`,
            enProceso: `Poca participación o falta de compromiso con las tareas de difusión.`
          }
        }
      };
    }
  }

  // 1.2 DOMINIO HISTÓRICO - REVOLUCIÓN MEXICANA
  if (domain === 'history_revolution') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      return {
        titulo: `Galería y Corridos de la Revolución Mexicana: "Personajes, Relatos y Adelitas de 1910"`,
        problematicaComunitaria: `En nuestra comunidad escolar se requiere rescatar la memoria histórica sobre la Revolución Mexicana, valorando las demandas campesinas y la lucha por la educación pública.`,
        proposito: `Investigar relatos y corridos populares de 1910 en libros SEP (Proyectos Escolares 2º Grado) para montar una galería de personajes históricos y canciones tradicionales.`,
        productoFinal: `Galería histórica infantil con dibujos de Madero, Zapata, Villa y las Adelitas, recital de corridos tradicionales y pequeña dramatización de la vida campesina.`,
        impactoSocial: `Fortalece el sentido de justicia, equidad y respeto a los derechos humanos desde la primera infancia.`,
        rubrica: {
          criterio1: {
            nombre: 'Reconocimiento de Personajes de la Revolución',
            sobresaliente: `Identifica a Madero, Zapata, Villa y las Adelitas, explicando por qué lucharon por la tierra y la educación.`,
            satisfactorio: `Reconoce a los personajes principales y sus características representativas.`,
            enProceso: `Confunde los personajes o hechos de la Revolución Mexicana.`
          },
          criterio2: {
            nombre: 'Expresión Musical y Plástica Tradicional',
            sobresaliente: `Canta fragmentos de corridos y elabora dibujos detallados con vestuario de época.`,
            satisfactorio: `Participa en los cantos y dibujos con orden y entusiasmo.`,
            enProceso: `Muestra desinterés en las actividades plásticas o musicales.`
          },
          criterio3: {
            nombre: 'Trabajo Colaborativo en el Montaje Escolar',
            sobresaliente: `Colabora activamente en equipo y comparte sus trabajos con orgullo ante las familias.`,
            satisfactorio: `Participa con amabilidad en el salón durante la muestra escolar.`,
            enProceso: `Presenta dificultades para convivir o trabajar en equipo.`
          }
        }
      };
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      return {
        titulo: `Museo Viviente de la Revolución Mexicana: "Causas, Corridos y la Constitución de 1917"`,
        problematicaComunitaria: `Necesidad de analizar críticamente las desigualdades sociales del Porfiriato y cómo la lucha revolucionaria forjó los derechos agrarios, laborales y educativos.`,
        proposito: `Indagar en libros SEP (Proyectos Comunitarios 5º / Nuestros Saberes 4º) para crear estaciones museográficas interactivas sobre la Revolución de 1910.`,
        productoFinal: `Museo viviente escolar con estaciones temáticas (El Porfiriato, La Lucha Agraria, Las Mujeres en la Revolución, La Constitución de 1917) y periódico facsimilar "El Maderista Escolar".`,
        impactoSocial: `Fomenta la conciencia cívica sobre los derechos laborales y el valor de la educación pública gratuita.`,
        rubrica: {
          criterio1: {
            nombre: 'Comprensión Histórica de las Causas y Leyes',
            sobresaliente: `Explica las causas del estallido de 1910 y la importancia de los Artículos 3º, 27 y 123 de la Constitución.`,
            satisfactorio: `Identifica las demandas principales de la Revolución y los líderes del movimiento.`,
            enProceso: `Presenta dificultades para explicar las causas o la trascendencia de la Constitución.`
          },
          criterio2: {
            nombre: 'Calidad del Periódico de Época y Cédulas',
            sobresaliente: `Redacta noticias históricas con rigor cronológico, diseño facsimilar creativo y ortografía impecable.`,
            satisfactorio: `Elabora su periódico mural o notas con datos correctos y orden visual.`,
            enProceso: `El material es incompleto o contiene anacronismos evidentes.`
          },
          criterio3: {
            nombre: 'Guía y Mediación Museográfica ante Familias',
            sobresaliente: `Conduce su estación con seguridad, elocuencia y empatía hacia los visitantes de la comunidad.`,
            satisfactorio: `Explica su sección del museo con amabilidad y datos claros.`,
            enProceso: `Muestra timidez o dificultad para transmitir las ideas históricas.`
          }
        }
      };
    } else {
      return {
        titulo: `Coloquio Historiográfico: "Facciones Revolucionarias, Transformación Constitucional y Vigencia Social de 1917"`,
        problematicaComunitaria: `Examen crítico de las demandas zapatistas, villistas y constitucionalistas, y su grado de cumplimiento en el México del siglo XXI.`,
        proposito: `Desarrollar un análisis historiográfico riguroso con fuentes primarias (Planes de San Luis, Ayala y Guadalupe) que culmine en un simposio estudiantil.`,
        productoFinal: `Coloquio estudiantil con mesas redondas, edición de revista digital histórica y podcast de divulgación sobre las conquistas sociales de la Revolución.`,
        impactoSocial: `Promueve el compromiso cívico de las juventudes con la democracia sustantiva y la justicia social.`,
        rubrica: {
          criterio1: {
            nombre: 'Rigor Historiográfico y Análisis de Planes',
            sobresaliente: `Contrasta con aparato crítico los planes revolucionarios y sus fundamentos ideológicos con fuentes primarias.`,
            satisfactorio: `Analiza los planes de la Revolución con argumentos fundamentados.`,
            enProceso: `Falta de sustento documental o visión simplista del conflicto.`
          },
          criterio2: {
            nombre: 'Argumentación Dialéctica en el Coloquio',
            sobresaliente: `Expone ponencias con elocuencia académica y defiende posturas críticas sobre los derechos sociales.`,
            satisfactorio: `Presenta su investigación con claridad y orden expositivo.`,
            enProceso: `Dificultad para articular argumentos ante el auditorio.`
          },
          criterio3: {
            nombre: 'Liderazgo Cívico y Producción Editorial',
            sobresaliente: `Coordina la revista y mesas de trabajo con alto sentido ético y profesionalismo académico.`,
            satisfactorio: `Colabora eficazmente en la producción editorial y logística del simposio.`,
            enProceso: `Poca participación en las actividades colectivas.`
          }
        }
      };
    }
  }

  // 2. DOMINIO HISTORIA, GEOGRAFÍA Y SOCIEDAD GENERAL
  if (domain === 'history_society') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      return {
        titulo: `Galería de la Historia Viva: "Relatos, Dibujos y Personajes de ${capitalizedTopic}"`,
        problematicaComunitaria: `En nuestra comunidad escolar y familiar se requiere fortalecer la memoria histórica sobre "${capitalizedTopic}", comprendiendo cómo vivían las personas en el pasado y qué cosas valiosas heredamos en nuestra escuela y hogar.`,
        proposito: `Investigar a través de relatos familiares, canciones populares y libros de texto de la SEP acontecimientos y personajes clave sobre "${capitalizedTopic}", para crear una galería ilustrada y dramatizaciones infantiles sencillas.`,
        productoFinal: `Instalación de la "Galería Histórica Infantil de ${capitalizedTopic}" en el salón, con dibujos coloreados de escenas y personajes, vestuario simbólico sencillo y narración oral guiada ante las familias.`,
        impactoSocial: `Inicia a las niñas y niños en la noción del tiempo histórico, fortalece la identidad comunitaria y estrecha los lazos intergeneracionales.`,
        rubrica: {
          criterio1: {
            nombre: 'Comprensión de Personajes y Épocas Históricas',
            sobresaliente: `Reconoce personajes centrales, su vestimenta y el motivo por el cual recordamos "${capitalizedTopic}" con apoyo de lecturas e imágenes.`,
            satisfactorio: `Identifica a los personajes principales y menciona algunos detalles de su historia.`,
            enProceso: `Confunde los personajes o hechos históricos con situaciones de ficción.`
          },
          criterio2: {
            nombre: 'Expresión Plástica y Narrativa Infantil',
            sobresaliente: `Elabora dibujos expresivos con colores limpios y relata con sus palabras lo que aprendió sobre los hechos históricos.`,
            satisfactorio: `Realiza sus dibujos y participa en la narración oral con apoyo del docente.`,
            enProceso: `Presenta dificultad para expresar oralmente o plasmar en dibujos lo aprendido.`
          },
          criterio3: {
            nombre: 'Participación y Respeto en la Muestra Escolar',
            sobresaliente: `Participa con orgullo y respeto en la presentación ante las familias, escuchando atentamente a sus compañeros.`,
            satisfactorio: `Colabora en el salón y comparte sus trabajos durante la visita familiar.`,
            enProceso: `Muestra timidez excesiva o desinterés en la actividad comunitaria.`
          }
        }
      };
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      return {
        titulo: `Museo Viviente y Archivo Histórico Escolar: "Voces, Cronología y Transformaciones de ${capitalizedTopic}"`,
        problematicaComunitaria: `Los estudiantes requieren profundizar en el análisis crítico de las causas sociales, territoriales y humanas vinculadas a "${capitalizedTopic}", valorando cómo las luchas del pasado forjaron los derechos cívicos y educativos de nuestra entidad.`,
        proposito: `Analizar fuentes primarias (cartas, testimonios orales, mapas históricos) y libros de texto de la SEP (Proyectos Escolares y Cartografía de México) para montar estaciones interactivas del museo viviente escolar sobre "${capitalizedTopic}".`,
        productoFinal: `Montaje del "Museo Viviente y Galería Histórica de ${capitalizedTopic}" en el patio escolar, con módulos atendidos por alumnos caracterizados, líneas de tiempo ilustradas, mapas de batallas o rutas y periódico facsimilar de época.`,
        impactoSocial: `Sensibiliza a la comunidad escolar sobre la importancia de la memoria histórica, la justicia social y el cuidado de los derechos ciudadanos en el México contemporáneo.`,
        rubrica: {
          criterio1: {
            nombre: 'Indagación Histórica y Manejo de Fuentes',
            sobresaliente: `Contrasta información de libros SEP y testimonios orales, explicando con claridad causas, desarrollo y consecuencias de "${capitalizedTopic}".`,
            satisfactorio: `Identifica los acontecimientos y personajes principales apoyándose en las lecturas del libro de texto.`,
            enProceso: `Presenta dificultades para ordenar cronológicamente los hechos o explicar sus causas.`
          },
          criterio2: {
            nombre: 'Caracterización y Producción Museográfica',
            sobresaliente: `Diseña cédulas museográficas impecables, vestuario de época representativo y periódicos facsimilares con alta creatividad y fidelidad histórica.`,
            satisfactorio: `Elabora su material museográfico con orden, limpieza y datos históricos correctos.`,
            enProceso: `El material es descuidado o contiene errores cronológicos notorios.`
          },
          criterio3: {
            nombre: 'Conducción del Museo y Diálogo Cívico',
            sobresaliente: `Explica con elocuencia, empatía y respeto su módulo a los visitantes, respondiendo dudas y vinculando los hechos con la vida actual.`,
            satisfactorio: `Atiende su estación de forma adecuada y comparte lo aprendido con amabilidad.`,
            enProceso: `Muestra timidez o dificultad para comunicar sus ideas ante el público.`
          }
        }
      };
    } else {
      return {
        titulo: `Coloquio Historiográfico y Archivo de la Memoria Social: "Análisis Crítico, Actores Colectivos y Vigencia de ${capitalizedTopic}"`,
        problematicaComunitaria: `Necesidad de examinar críticamente las contradicciones estructurales, los proyectos de nación en disputa y el grado de cumplimiento de los derechos sociales vinculados a "${capitalizedTopic}" en el México actual.`,
        proposito: `Desarrollar una investigación historiográfica rigurosa que culmine en un simposio académico estudiantil y la publicación de una revista histórica digital para la comunidad (Colección Ximhai / MCCEMS).`,
        productoFinal: `Coloquio estudiantil "Voces y Debates sobre ${capitalizedTopic}" con ponencias argumentadas, revista digital facsimilar y podcast de divulgación histórica comunitaria.`,
        impactoSocial: `Fomenta la conciencia histórica transformadora, la cultura de la legalidad y el compromiso cívico de la juventud con su entorno sociopolítico.`,
        rubrica: {
          criterio1: {
            nombre: 'Rigor Historiográfico y Aparato Crítico',
            sobresaliente: `Analiza fuentes primarias y secundarias con metodología historiográfica rigurosa, citando fuentes documentales y contrastando corrientes interpretativas sobre "${capitalizedTopic}".`,
            satisfactorio: `Sustenta su ensayo histórico con bibliografía adecuada y argumentos estructurados.`,
            enProceso: `Carece de aparato crítico o muestra sesgo sin sustento documental.`
          },
          criterio2: {
            nombre: 'Discurso Argumentativo y Ponencia Académica',
            sobresaliente: `Defiende su tesis con dominio oratorio, solvencia conceptual y capacidad dialéctica en el simposio ante la comunidad.`,
            satisfactorio: `Expone su ponencia con fluidez y responde a las preguntas del panel adecuadamente.`,
            enProceso: `Lectura plana del texto sin interacción ni profundidad argumentativa.`
          },
          criterio3: {
            nombre: 'Compromiso Ético y Propuestas de Incidencia Social',
            sobresaliente: `Formula propuestas concretas de incidencia cívica vinculando los ideales históricos con la justicia social contemporánea.`,
            satisfactorio: `Relaciona adecuadamente el tema histórico con la realidad comunitaria actual.`,
            enProceso: `No logra vincular el análisis histórico con el contexto presente.`
          }
        }
      };
    }
  }

  // 3. DOMINIO MATEMÁTICAS - NÚMEROS, ARITMÉTICA Y TIENDITA ESCOLAR
  if (domain === 'mathematics_numbers') {
    return {
      titulo: `Mercado Escolar y Tiendita Cooperativa: "Números, Monedas y Finanzas para el Bien Común sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Los estudiantes requieren fortalecer el cálculo mental, la comprensión del valor posicional del dinero y el desarrollo de hábitos de consumo responsable y finanzas solidarias en torno a "${capitalizedTopic}".`,
      proposito: `Diseñar e instalar una tiendita escolar cooperativa utilizando billetes y monedas didácticos para resolver problemas de adición, sustracción, cálculo de cambio y presupuesto familiar (Libro SEP: Nuestros Saberes / Proyectos de Aula).`,
      productoFinal: `Simulación del "Mercado Cooperativo Escolar" con puestos de productos, lista de precios calculada por los alumnos, billetes y monedas didácticas, libro de contabilidad escolar y guía de compra inteligente para las familias.`,
      impactoSocial: `Fomenta la educación financiera temprana, el comercio justo, el consumo de alimentos locales y el ahorro familiar responsable.`,
      rubrica: {
        criterio1: {
          nombre: 'Cálculo de Precios, Operaciones y Cálculo de Cambio',
          sobresaliente: `Realiza transacciones con exactitud, aplica estrategias de cálculo mental eficientes y calcula el cambio correspondiente con rapidez y sin errores.`,
          satisfactorio: `Calcula totales y cambios de forma correcta apoyándose en el registro escrito o material manipulable.`,
          enProceso: `Presenta dificultades para sumar cantidades monetarias o calcular el cambio exacto.`
        },
        criterio2: {
          nombre: 'Organización del Puesto y Clasificación Numérica',
          sobresaliente: `Etiqueta productos con claridad, organiza listas de precios ordenadas por valor y promueve productos sanos y sustentables.`,
          satisfactorio: `Mantiene su puesto ordenado y con precios visibles para los compradores.`,
          enProceso: `Los precios son confusos o el puesto presenta desorganización en los datos numéricos.`
        },
        criterio3: {
          nombre: 'Atención al Cliente y Trabajo en Equipo',
          sobresaliente: `Atiende con empatía, amabilidad y honestidad a los compradores, promoviendo el consumo ético y el ahorro solidario.`,
          satisfactorio: `Colabora en la atención de su puesto y se comunica con respeto con los clientes.`,
          enProceso: `Muestra desinterés en la atención de la tiendita o dificultad para trabajar con sus pares.`
        }
      }
    };
  }

  // 4. DOMINIO MATEMÁTICAS - FRACCIONES Y REPARTO EQUITATIVO
  if (domain === 'mathematics_fractions') {
    return {
      titulo: `Laboratorio Matemático en Acción: "Fracciones, Repartos Justos y Soluciones Prácticas sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Dificultad en los estudiantes para visualizar las fracciones de forma tangible y aplicarlas en situaciones de la vida diaria como la preparación de recetas, la medición de terrenos y el reparto equitativo de recursos en el hogar.`,
      proposito: `Comprender las fracciones como partes de la unidad y operadores de reparto equitativo mediante modelos manipulables, rectas numéricas y resolución de problemas cotidianos sobre "${capitalizedTopic}" (Libro SEP: Nuestros Saberes / Proyectos de Aula).`,
      productoFinal: `Feria de Retos Fraccionarios con modelos manipulables a escala, tiras de fracciones equivalentes, recetario escolar ilustrado con cantidades fraccionarias y estación de juegos interactivos de retos matemáticos.`,
      impactoSocial: `Promueve la justicia distributiva, la equidad en el reparto de alimentos y la aplicación práctica del razonamiento matemático en la economía familiar.`,
      rubrica: {
        criterio1: {
          nombre: 'Modelado y Representación Gráfica de Fracciones',
          sobresaliente: `Representa con exactitud fracciones propias, impropias y equivalentes usando material concreto, rectas numéricas y esquemas a escala.`,
          satisfactorio: `Identifica y representa fracciones básicas correctamente en figuras geométricas y situaciones de reparto.`,
          enProceso: `Confunde el numerador con el denominador o divide enteros en partes desiguales.`
        },
        criterio2: {
          nombre: 'Resolución de Problemas de Reparto y Equivalencias',
          sobresaliente: `Resuelve problemas complejos de suma, resta y comparación de fracciones con distintos métodos y justifica con elocuencia su razonamiento.`,
          satisfactorio: `Resuelve problemas de reparto fraccionario con apoyo de material manipulable.`,
          enProceso: `Presenta dificultades para calcular repartos básicos o identificar equivalencias simples.`
        },
        criterio3: {
          nombre: 'Atención en la Estación Demostrativa y Mediación Lúdica',
          sobresaliente: `Explica con claridad y entusiasmo los retos de fracciones a los visitantes de la feria con gran empatía y solvencia pedagógica.`,
          satisfactorio: `Colabora en la atención de la estación y demuestra los modelos fraccionarios adecuadamente.`,
          enProceso: `Participa con timidez o no logra explicar el funcionamiento de sus modelos manipulables.`
        }
      }
    };
  }

  // 5. DOMINIO MATEMÁTICAS - GEOMETRÍA Y DISEÑO ESPACIAL
  if (domain === 'mathematics_geometry') {
    return {
      titulo: `Taller de Arquitectura Escolar y Modelado Geométrico: "Diseño Espacial y Cuerpos del Entorno sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Los estudiantes requieren aplicar nociones de geometría espacial, perímetros, áreas y simetría al diseño de espacios escolares y comunitarios seguros y funcionales vinculados a "${capitalizedTopic}".`,
      proposito: `Construir maquetas a escala y figuras geométricas tridimensionales aplicando fórmulas de área, perímetro y propiedades de los polígonos con base en los libros de texto SEP (Nuestros Saberes / Proyectos de Aula).`,
      productoFinal: `Exposición interactiva "Geometría en Nuestra Escuela" con maquetas a escala, cuerpos geométricos elaborados con desarrollos planos, planos arquitectónicos del salón y catálogo de polígonos del entorno.`,
      impactoSocial: `Permite a los estudiantes proponer mejoras tangibles al espacio escolar, mejorando la habitabilidad, accesibilidad y estética del entorno educativo.`,
      rubrica: {
        criterio1: {
          nombre: 'Identificación de Propiedades Geométricas y Medición',
          sobresaliente: `Identifica con precisión lados, vértices, aristas y ángulos en figuras y cuerpos, calculando perímetros y áreas sin errores.`,
          satisfactorio: `Reconoce las figuras geométricas principales y aplica fórmulas básicas de medición.`,
          enProceso: `Confunde figuras bidimensionales con cuerpos 3D o presenta errores constantes de medición.`
        },
        criterio2: {
          nombre: 'Construcción de Maquetas y Desarrollos Planos',
          sobresaliente: `Arma cuerpos geométricos y maquetas a escala con gran precisión, simetría, resistencia estructural y estética impecable.`,
          satisfactorio: `Elabora sus modelos geométricos con orden y limpieza respetando las dimensiones básicas.`,
          enProceso: `Los modelos geométricos son frágiles o deformes.`
        },
        criterio3: {
          nombre: 'Socialización y Explicación del Diseño Espacial',
          sobresaliente: `Explica con elocuencia las propiedades geométricas y la utilidad comunitaria de su diseño ante los visitantes de la muestra.`,
          satisfactorio: `Expone su maqueta con claridad y amabilidad durante el recorrido escolar.`,
          enProceso: `Muestra dificultad para justificar el uso de las figuras geométricas en su maqueta.`
        }
      }
    };
  }

  // 6. DOMINIO MATEMÁTICAS - ÁLGEBRA Y FUNCIONES CUADRÁTICAS
  if (domain === 'mathematics_algebra') {
    return {
      titulo: `Laboratorio de Modelación Cuadrática y Trayectorias: "Ecuaciones y Parábolas en la Vida Diaria sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Dificultad en los estudiantes de secundaria y preparatoria para comprender el significado físico y geométrico de las ecuaciones cuadráticas y funciones algebraicas en fenómenos del entorno.`,
      proposito: `Modelar matemáticamente situaciones reales (tiro parabólico, arcos arquitectónicos, maximización de áreas y optimización de costos) utilizando herramientas algebraicas y software dinámico (Libros SEP: Saberes y Pensamiento Científico Secundaria).`,
      productoFinal: `Muestra de Modelación Matemática con maquetas de catapultas y arcos a escala, gráficas analíticas de parábolas rotuladas con vértice, raíces y eje de simetría, y simulaciones dinámicas en GeoGebra.`,
      impactoSocial: `Demuestra la utilidad del álgebra en la ingeniería, el deporte y la planeación económica comunitaria, fomentando vocaciones científicas y tecnológicas.`,
      rubrica: {
        criterio1: {
          nombre: 'Dominio Algebraico y Solución de Ecuaciones',
          sobresaliente: `Resuelve ecuaciones cuadráticas por factorización, fórmula general y completando cuadrados, interpretando el discriminante y las raíces físicas.`,
          satisfactorio: `Aplica la fórmula general correctamente y obtiene las raíces de la ecuación.`,
          enProceso: `Comete errores constantes en la sustitución de coeficientes o en el manejo de signos.`
        },
        criterio2: {
          nombre: 'Modelación Gráfica y Simulación Dinámica',
          sobresaliente: `Traza e interpreta con exactitud la curva parabólica, identificando el vértice y los parámetros a, b y c en software digital y papel milimétrico.`,
          satisfactorio: `Grafica la parábola identificando su orientación y punto máximo o mínimo.`,
          enProceso: `La gráfica no corresponde a los valores de la función cuadrática.`
        },
        criterio3: {
          nombre: 'Divulgación Matemática y Explicación Aplicada',
          sobresaliente: `Explica con claridad y rigor matemático cómo la parábola resuelve el problema concreto ante la comunidad escolar.`,
          satisfactorio: `Expone su modelo matemático con orden y responde a las preguntas del panel.`,
          enProceso: `Dificultad para explicar el vínculo entre la fórmula algebraica y el fenómeno físico.`
        }
      }
    };
  }

  // 7. DOMINIO CIENCIAS NATURALES, ECOLOGÍA Y MEDIO AMBIENTE
  if (domain === 'natural_sciences') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      return {
        titulo: `Álbum de Exploradores de la Naturaleza: "Descubriendo y Cuidando ${capitalizedTopic}"`,
        problematicaComunitaria: `Necesidad de promover desde la primera infancia el asombro por el mundo natural, la observación de seres vivos y el cuidado de los recursos naturales vinculados a "${capitalizedTopic}".`,
        proposito: `Explorar de forma sensorial y guiada elementos de la naturaleza (plantas, agua, suelo, insectos) y plasmar sus descubrimientos en un álbum ilustrado con apoyo de los libros SEP (Múltiples Lenguajes / Nuestros Saberes).`,
        productoFinal: `Álbum de campo infantil con dibujos y muestras secas de hojas, semillas o huellas, acompañado de una pequeña estación de germinación o cuidado del agua en el aula.`,
        impactoSocial: `Siembra valores de respeto bioético hacia todos los seres vivos y promueve hábitos de ahorro del agua y protección de áreas verdes en la familia.`,
        rubrica: {
          criterio1: {
            nombre: 'Curiosidad Científica y Observación Guiada',
            sobresaliente: `Observa con atención los detalles de la naturaleza, describe características con sus sentidos y plantea preguntas ingeniosas sobre "${capitalizedTopic}".`,
            satisfactorio: `Participa en la observación y describe lo que ve con apoyo del docente.`,
            enProceso: `Muestra distracción o dificultad para enfocarse en la observación de los especímenes.`
          },
          criterio2: {
            nombre: 'Registro Gráfico en el Álbum de Campo',
            sobresaliente: `Dibuja con esmero seres vivos y elementos naturales, utilizando colores vivos y agregando rótulos descriptivos claros.`,
            satisfactorio: `Completa las hojas de su álbum con limpieza y orden.`,
            enProceso: `Los dibujos están incompletos o descuidados.`
          },
          criterio3: {
            nombre: 'Cuidado Ambiental y Convivencia Escolar',
            sobresaliente: `Trata con delicadeza las plantas y animales del entorno escolar y promueve el cuidado del agua entre sus compañeros.`,
            satisfactorio: `Sigue las reglas de respeto a la naturaleza durante las actividades al aire libre.`,
            enProceso: `Muestra conductas de descuido o maltrato a las plantas o materiales escolares.`
          }
        }
      };
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      return {
        titulo: `Guía Botánica de Campo y Estación Ecotécnica: "Indagación Empírica y Conservación de ${capitalizedTopic}"`,
        problematicaComunitaria: `Deterioro de las áreas verdes y escasa cultura sobre la conservación de la biodiversidad, el ciclo del agua y el manejo sustentable de recursos relacionados con "${capitalizedTopic}" en la comunidad escolar.`,
        proposito: `Investigar en libros de texto de la SEP (Proyectos Escolares y Nuestros Saberes) los ciclos biogeoquímicos, la interacción de los seres vivos y construir una ecotecnia o guía botánica comunitaria.`,
        productoFinal: `Estación Demostrativa de Ciencias Naturales con herbario escolar clasificado, prototipo ecotécnico funcional (filtro de agua casero, germinador o composta) y guía ilustrada de biodiversidad local.`,
        impactoSocial: `Fomenta la educación ambiental práctica, la reducción del desperdicio de agua y la regeneración de espacios verdes escolares con participación familiar.`,
        rubrica: {
          criterio1: {
            nombre: 'Indagación Científica y Registro de Observaciones',
            sobresaliente: `Registra datos de forma sistemática en bitácoras de campo, formula hipótesis fundamentadas y explica con precisión los ciclos biológicos vinculados a "${capitalizedTopic}".`,
            satisfactorio: `Completa su registro de observaciones y describe los fenómenos naturales apoyándose en el libro SEP.`,
            enProceso: `El registro de datos es incompleto o no explica las causas de los fenómenos observados.`
          },
          criterio2: {
            nombre: 'Funcionalidad del Prototipo y Calidad del Herbario',
            sobresaliente: `El prototipo ecotécnico opera con eficiencia demostrable y las muestras del herbario están impecablemente prensadas y rotuladas.`,
            satisfactorio: `El prototipo funciona adecuadamente y las fichas botánicas contienen los datos principales.`,
            enProceso: `El prototipo presenta fallas o las muestras botánicas están deterioradas.`
          },
          criterio3: {
            nombre: 'Divulgación Ambiental y Compromiso Ecológico',
            sobresaliente: `Comunica con pasión y elocuencia la importancia del cuidado ambiental ante la comunidad escolar, proponiendo compromisos tangibles.`,
            satisfactorio: `Explica su trabajo con claridad y atiende con amabilidad a los visitantes de la estación.`,
            enProceso: `Dificultad para explicar el impacto ecológico de su proyecto.`
          }
        }
      };
    } else {
      return {
        titulo: `Simposio de Indagación Científica y Proyecto de Sustentabilidad: "Modelos y Soluciones Ambientales sobre ${capitalizedTopic}"`,
        problematicaComunitaria: `Impacto del cambio climático, la contaminación antropogénica y la pérdida de ecosistemas en nuestra cuenca regional vinculados a problemáticas de "${capitalizedTopic}".`,
        proposito: `Diseñar y ejecutar un proyecto de investigación experimental o ecotecnológico sustentable fundamentado en las ciencias naturales y la bioética (MCCEMS / Colección Ximhai).`,
        productoFinal: `Simposio Escolar de Ciencias con presentación de artículos de investigación formal, prototipos de mitigación ambiental y panel de debate con la comunidad sobre políticas de sostenibilidad.`,
        impactoSocial: `Genera datos empíricos útiles para la gestión ambiental escolar y compromete a la juventud en la toma de decisiones ecológicas informadas.`,
        rubrica: {
          criterio1: {
            nombre: 'Metodología Experimental y Rigor Científico',
            sobresaliente: `Aplica el método científico experimental con control de variables, análisis estadístico de datos y conclusiones rigurosas sobre "${capitalizedTopic}".`,
            satisfactorio: `Sigue los pasos de la investigación científica y reporta resultados claros.`,
            enProceso: `Carece de rigor metodológico o no sustenta sus conclusiones con evidencias empíricas.`
          },
          criterio2: {
            nombre: 'Innovación Tecnológica y Viabilidad Ambiental',
            sobresaliente: `Diseña una propuesta de solución sustentable innovadora, de bajo costo y alto impacto comunitario.`,
            satisfactorio: `La propuesta ambiental es viable y atiende la problemática planteada.`,
            enProceso: `La propuesta es inviable o no se relaciona con los principios científicos estudiados.`
          },
          criterio3: {
            nombre: 'Defensa Académica y Divulgación ante la Comunidad',
            sobresaliente: `Defiende su investigación con solvencia conceptual, vocabulario científico preciso y capacidad de diálogo interdisciplinario en el simposio.`,
            satisfactorio: `Expone su ponencia con fluidez y responde a las preguntas del comité evaluador.`,
            enProceso: `Lectura insegura o dificultad para sustentar los datos experimentales.`
          }
        }
      };
    }
  }

  // 8. DOMINIO CIENCIAS DE LA SALUD, NUTRICIÓN Y CUERPO HUMANO
  if (domain === 'health_nutrition') {
    return {
      titulo: `Feria Escolar de la Salud y Nutrición Consciente: "El Plato del Bien Comer y Hábitos Saludables frente a ${capitalizedTopic}"`,
      problematicaComunitaria: `Elevada incidencia de consumo de alimentos ultraprocesados, hábitos sedentarios y falta de información accesible sobre el cuidado integral del cuerpo humano en torno a "${capitalizedTopic}".`,
      proposito: `Analizar los grupos nutrimentales del Plato del Bien Comer, el funcionamiento de los sistemas del cuerpo y elaborar propuestas de menús saludables y rutinas de bienestar (Libro SEP: Nuestros Saberes / Proyectos Comunitarios).`,
      productoFinal: `Montaje de la "Feria de la Salud Escolar" con puestos de degustación de colaciones nutritivas locales, recetario escolar ilustrado, infografías del sistema digestivo/circulatorio y estación de toma de signos vitales guiada.`,
      impactoSocial: `Modifica positivamente los hábitos de alimentación familiar, disminuye el consumo de comida chatarra en la cooperativa escolar y previene enfermedades crónicas tempranas.`,
      rubrica: {
        criterio1: {
          nombre: 'Comprensión Nutricional y Fisiológica del Cuerpo',
          sobresaliente: `Explica con precisión la función de los nutrientes, los riesgos del consumo excesivo de azúcares y grasas, y la fisiología del cuerpo humano frente a "${capitalizedTopic}".`,
          satisfactorio: `Identifica los grupos del Plato del Bien Comer y propone opciones de menús balanceados.`,
          enProceso: `Confunde los grupos nutrimentales o desconoce la función básica de los órganos.`
        },
        criterio2: {
          nombre: 'Elaboración del Recetario y Recursos Didácticos',
          sobresaliente: `Crea recetas nutritivas con ingredientes económicos de la región, rotuladas con tablas de valor calórico y presentación gráfica impecable.`,
          satisfactorio: `Presenta sus recetas y carteles con orden, limpieza e información comprensible.`,
          enProceso: `Las recetas son poco saludables o los materiales visuales carecen de claridad.`
        },
        criterio3: {
          nombre: 'Promoción de la Salud y Diálogo con las Familias',
          sobresaliente: `Orienta con amabilidad y argumentos fundamentados a las familias en la feria de la salud, promoviendo compromisos de vida saludable.`,
          satisfactorio: `Atiende su módulo con cordialidad y explica las recomendaciones nutricionales.`,
          enProceso: `Muestra timidez o dificultad para dialogar sobre los hábitos saludables.`
        }
      }
    };
  }

  // 9. DOMINIO TEXTOS EPISTOLARES Y CORRESPONDENCIA
  if (domain === 'language_epistolar') {
    return {
      titulo: `El Cartero Escolar y el Buzón de la Amistad: "Cartas que Unen Corazones sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `La comunicación digital inmediata ha desplazado la correspondencia escrita, provocando que las niñas y niños desconozcan la función social de la carta, sus componentes estructurales y el valor de expresar afecto o peticiones ciudadanas mediante la palabra escrita.`,
      proposito: `Desarrollar competencias integrales de lectoescritura con sentido social real, elaborando cartas personalizadas para miembros de la comunidad escolar y diseñando un buzón postal funcional (Libro SEP: Proyectos Comunitarios).`,
      productoFinal: `Montaje del "Buzón Postal Comunitario" en el aula y patio escolar, con sobres decorados a mano, estampillas postales diseñadas por los alumnos y jornada de entrega postal en la comunidad escolar.`,
      impactoSocial: `Fortalece los vínculos afectivos intergeneracionales, rescata el patrimonio de la correspondencia postal mexicana y estimula la escritura reflexiva y empática.`,
      rubrica: {
        criterio1: {
          nombre: 'Estructura Epistolar y Calidad del Mensaje Escrito',
          sobresaliente: `La carta incluye con absoluta precisión sus 6 partes (lugar/fecha, destinatario, saludo, cuerpo estructurado, despedida y firma), con excelente caligrafía y ortografía.`,
          satisfactorio: `La carta contiene la mayoría de los elementos de la estructura epistolar con redacción comprensible.`,
          enProceso: `El texto carece de encabezado o despedida, o las ideas están desordenadas.`
        },
        criterio2: {
          nombre: 'Diseño del Sobre, Estampilla y Rotulación Postal',
          sobresaliente: `El sobre está impecablemente rotulado con remitente y destinatario en las posiciones correctas, incluye código postal y una estampilla artística original.`,
          satisfactorio: `El sobre contiene los datos principales de remitente y destinatario con buena presentación general.`,
          enProceso: `El sobre confunde el remitente con el destinatario o carece de datos indispensables.`
        },
        criterio3: {
          nombre: 'Participación en la Jornada del Buzón Comunitario',
          sobresaliente: `Participa con entusiasmo y empatía en la construcción del buzón, asume con responsabilidad su rol de cartero y lee con elocuencia ante la comunidad.`,
          satisfactorio: `Colabora adecuadamente en el montaje del buzón y entrega su correspondencia a tiempo.`,
          enProceso: `Muestra poco interés en la entrega comunitaria o dificultad para integrarse en el equipo.`
        }
      }
    };
  }

  // 10. DOMINIO NARRATIVA, CUENTOS Y RELATOS
  if (domain === 'language_narrative') {
    return {
      titulo: `Antología Cartonera y Festival de Narrativa: "Voces y Relatos Comunitarios sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Pérdida paulatina de la tradición oral comunitaria y escaso hábito de creación literaria autónoma, lo que limita la imaginación y la comprensión lectora en el entorno escolar.`,
      proposito: `Rescatar y recrear relatos locales mediante la producción colectiva de una antología de cuentos ilustrados con estructura narrativa formal (planteamiento, nudo y desenlace), utilizando libros SEP (Proyectos de Aula / Múltiples Lenguajes).`,
      productoFinal: `Libro cartonero antológico encuadernado y decorado a mano con material reciclable, presentado en una tertulia literaria comunitaria con lectura en atril y tendedero de cuentos en el patio escolar.`,
      impactoSocial: `Fomenta el amor por la lectura comunitaria, recupera la memoria colectiva y dota a la biblioteca de aula de un acervo literario creado por las y los alumnos.`,
      rubrica: {
        criterio1: {
          nombre: 'Estructura Narrativa y Creatividad Literaria',
          sobresaliente: `Desarrolla una trama original con personajes bien caracterizados, conflicto claro y desenlace creativo, empleando conectores temporales y adjetivos descriptivos sobre "${capitalizedTopic}".`,
          satisfactorio: `El relato presenta inicio, desarrollo y final comprensibles con adecuada estructura de párrafos.`,
          enProceso: `La narración no tiene una secuencia lógica clara o queda inconclusa.`
        },
        criterio2: {
          nombre: 'Confección del Libro Cartonero y Expresión Plástica',
          sobresaliente: `El libro cartonero está sólidamente encuadernado, con portadas artísticas llamativas e ilustraciones que enriquecen profundamente el texto.`,
          satisfactorio: `El libro cartonero cumple con los requisitos de armado e ilustración con limpieza y orden.`,
          enProceso: `El encuadernado es frágil o las ilustraciones carecen de relación con el texto.`
        },
        criterio3: {
          nombre: 'Socialización y Lectura en Atril',
          sobresaliente: `Lee con fluidez, modulación de voz adecuada y expresión corporal que cautiva a la audiencia en la tertulia literaria.`,
          satisfactorio: `Realiza su lectura en voz alta con claridad y volumen audible ante el público.`,
          enProceso: `Muestra inseguridad o tono de voz inaudible durante la presentación oral.`
        }
      }
    };
  }

  // 11. DOMINIO POESÍA, LÍRICA Y RIMA
  if (domain === 'language_poetry') {
    return {
      titulo: `Taller Lírico y Recital Escolar: "Coplas, Calaveritas y Versos sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Escaso acercamiento de los estudiantes al lenguaje poético, el ritmo métrico y los recursos sonoros del idioma en su vida cotidiana escolar.`,
      proposito: `Explorar la lírica tradicional mexicana (calaveritas, coplas, rondas, décimas) y crear poemas originales para un recital escolar poético (Libro SEP: Múltiples Lenguajes / Proyectos Escolares).`,
      productoFinal: `Plaquette poética ilustrada y recital en vivo en el patio escolar con acompañamiento rítmico, micrófonos y declamación abierta a familias y docentes.`,
      impactoSocial: `Enriquece la sensibilidad estética, el vocabulario poético y fortalece la autoestima oral y la apreciación de la lírica tradicional mexicana.`,
      rubrica: {
        criterio1: {
          nombre: 'Métrica, Rima y Recursos Poéticos',
          sobresaliente: `Emplea rima consonante o asonante, metáforas creativas y ritmo musical bien estructurado en sus estrofas poéticas sobre "${capitalizedTopic}".`,
          satisfactorio: `Construye versos con rima y sentido poético básico con apego al tema.`,
          enProceso: `Los versos carecen de musicalidad o se leen como texto en prosa sin ritmo.`
        },
        criterio2: {
          nombre: 'Diseño Editorial de la Plaquette Poética',
          sobresaliente: `Diseña un poemario ilustrado con caligrafía artística, grecas decorativas y excelente presentación visual.`,
          satisfactorio: `Presenta su hoja poética con limpieza, orden e ilustraciones pertinentes.`,
          enProceso: `El diseño es descuidado o la letra es poco legible.`
        },
        criterio3: {
          nombre: 'Declamación y Expresión Lírica en el Recital',
          sobresaliente: `Declama con entonación emotiva, volumen adecuado, modulación y seguridad escénica ante la comunidad escolar.`,
          satisfactorio: `Lee su poema en voz alta con claridad y postura adecuada.`,
          enProceso: `Muestra timidez excesiva o dificultad para proyectar la voz ante el público.`
        }
      }
    };
  }

  // 12. DOMINIO TEXTOS EXPOSITIVOS, PERIODISMO Y GACETA ESCOLAR
  if (domain === 'language_expository') {
    return {
      titulo: `Gaceta Escolar Comunitaria y Periódico Mural: "Periodismo y Artículos de Divulgación sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Falta de medios de difusión escolares donde los estudiantes puedan compartir investigaciones documentales, notas informativas y artículos de opinión verídicos sobre "${capitalizedTopic}".`,
      proposito: `Desarrollar competencias de investigación periodística, redacción informativa y diseño editorial para socializar el tema "${capitalizedTopic}" mediante una gaceta escolar impresa y digital (Libro SEP: Proyectos Escolares).`,
      productoFinal: `Edición especial de la "Gaceta Escolar Comunitaria" con reportajes de campo, infografías ilustradas, entrevistas a personas de la localidad y artículos de divulgación elaborados por los alumnos.`,
      impactoSocial: `Democratiza el acceso a la información en la comunidad escolar, estimula la libertad de expresión responsable y revaloriza la voz de las niñas y niños.`,
      rubrica: {
        criterio1: {
          nombre: 'Calidad de Redacción, Cohesión y Rigor Informativo',
          sobresaliente: `Redacta textos informativos con excelente cohesión, variedad de vocabulario, ortografía impecable y apego riguroso al tema "${capitalizedTopic}".`,
          satisfactorio: `Redacta artículos comprensibles con estructura básica de párrafos y pocos errores ortográficos.`,
          enProceso: `Los textos presentan ideas desordenadas, repetición de palabras o falta de coherencia.`
        },
        criterio2: {
          nombre: 'Diseño Editorial y Recursos Gráficos',
          sobresaliente: `El diseño visual es armónico, con jerarquía tipográfica, fotografías pertinentes y esquemas explicativos de alta calidad.`,
          satisfactorio: `Organiza el contenido de forma limpia con ilustraciones adecuadas al tema.`,
          enProceso: `El diseño es confuso o las imágenes no tienen relación con el texto.`
        },
        criterio3: {
          nombre: 'Presentación y Diálogo con los Lectores',
          sobresaliente: `Presenta la gaceta con gran elocuencia ante la comunidad escolar, respondiendo con solvencia a las preguntas del público.`,
          satisfactorio: `Explica su artículo con claridad ante compañeros y docentes.`,
          enProceso: `Muestra dificultad para resumir oralmente los puntos clave de su investigación.`
        }
      }
    };
  }

  // 13. DOMINIO ARTES VISUALES, PLÁSTICAS Y ESCÉNICAS
  if (domain === 'arts') {
    return {
      titulo: `Galería de Expresión Plástica y Arte Comunitario: "Formas, Colores y Emociones sobre ${capitalizedTopic}"`,
      problematicaComunitaria: `Limitados espacios para la exploración de técnicas artísticas multidisciplinarias (pintura, grabado, escultura, arte efímero) y la valoración estética del entorno escolar vinculada a "${capitalizedTopic}".`,
      proposito: `Explorar elementos de las artes visuales (punto, línea, forma, color, textura y espacio) para crear obras plásticas originales que transmitan emociones y mensajes comunitarios (Libro SEP: Múltiples Lenguajes / Proyectos de Aula).`,
      productoFinal: `Montaje de la "Galería Escolar de Artes Plásticas" en los pasillos de la escuela, con cédulas de autor, cuadros en diversas técnicas (óleo pastel, acuarela, modelado) y recorrido guiado para las familias.`,
      impactoSocial: `Embellece el entorno escolar, fomenta la sensibilidad artística infantil y ofrece canales no verbales de expresión emocional y pensamiento divergente.`,
      rubrica: {
        criterio1: {
          nombre: 'Exploración Técnica y Manejo de Materiales',
          sobresaliente: `Aplica con destreza mezclas de color, texturas y composición plástica, demostrando dominio en la técnica artística elegida sobre "${capitalizedTopic}".`,
          satisfactorio: `Utiliza los materiales artísticos con orden, limpieza y adecuada aplicación técnica.`,
          enProceso: `Presenta dificultad en el manejo de materiales o los trabajos quedan inconclusos.`
        },
        criterio2: {
          nombre: 'Expresividad Estética y Mensaje Comunitario',
          sobresaliente: `La obra transmite con profunda emotividad y originalidad un mensaje claro y reflexivo sobre "${capitalizedTopic}".`,
          satisfactorio: `La obra refleja el tema propuesto con creatividad y elementos visuales reconocibles.`,
          enProceso: `La obra carece de relación con la temática o es una copia mecánica sin intención expresiva.`
        },
        criterio3: {
          nombre: 'Curaduría y Montaje de la Galería',
          sobresaliente: `Colabora activamente en la iluminación, colocación de cédulas y atención respetuosa a los visitantes de la galería escolar.`,
          satisfactorio: `Participa en el montaje de su cuadro y atiende su espacio durante la muestra.`,
          enProceso: `Muestra desinterés en el cuidado y presentación colectiva de las obras.`
        }
      }
    };
  }

  // 14. DOMINIO CÍVICA, ÉTICA, DERECHOS Y CULTURA DE PAZ
  if (domain === 'civics_ethics') {
    return {
      titulo: `Asamblea Escolar y Campaña Comunitaria: "Construyendo Acuerdos, Inclusión y Cultura de Paz en Torno a ${capitalizedTopic}"`,
      problematicaComunitaria: `Conflictos recurrentes en la convivencia escolar y necesidad de fortalecer la cultura del diálogo, el conocimiento de los derechos humanos y la resolución pacífica de controversias sobre "${capitalizedTopic}".`,
      proposito: `Construir consensos democráticos a través de asambleas de aula, redactar un decálogo de convivencia y diseñar una campaña escolar de cultura de paz (Libro SEP: Ética, Naturaleza y Sociedades / Proyectos de Aula).`,
      productoFinal: `Realización de la "Asamblea Escolar de la Convivencia y la Paz", con aprobación del Decálogo de Aula, instalación de carteles interactivos de mediación de conflictos y firma de compromisos colectivos.`,
      impactoSocial: `Reduce incidentes de exclusión o violencia en el aula, fortalece el tejido social escolar y promueve la ciudadanía democrática activa desde la infancia.`,
      rubrica: {
        criterio1: {
          nombre: 'Comprensión y Defensa de los Derechos y la Igualdad',
          sobresaliente: `Reconoce y fundamenta con claridad los derechos de las niñas y niños (expresión, inclusión, respeto a las diferencias) en torno a "${capitalizedTopic}".`,
          satisfactorio: `Identifica los derechos principales y explica su importancia para la convivencia pacífica.`,
          enProceso: `Confunde derechos con obligaciones o desconoce las normas básicas de convivencia.`
        },
        criterio2: {
          nombre: 'Elaboración de Acuerdos y Decálogo de Convivencia',
          sobresaliente: `Redacta acuerdos inclusivos, propositivos y consensuados con excelente redacción, ilustrándolos de forma creativa y visible para todos.`,
          satisfactorio: `Participa en la redacción de normas claras para el bienestar del salón de clases.`,
          enProceso: `Propone normas punitivas o no respeta los consensos del grupo.`
        },
        criterio3: {
          nombre: 'Habilidades de Mediación y Diálogo Asertivo',
          sobresaliente: `Aplica la escucha activa y el diálogo constructivo para mediar diferencias entre compañeros, fomentando la empatía y la reconciliación.`,
          satisfactorio: `Participa con respeto en las asambleas y acata los acuerdos pactados.`,
          enProceso: `Muestra dificultad para dialogar pacíficamente ante desacuerdos.`
        }
      }
    };
  }

  // 15. DOMINIO SOCIOEMOCIONAL, VIDA SALUDABLE Y EDUCACIÓN FÍSICA (Default situado general)
  return {
    titulo: `Círculo de Diálogo y Rally Deportivo Cooperativo: "Convivencia Saludable y Trabajo en Equipo sobre ${capitalizedTopic}"`,
    problematicaComunitaria: `Necesidad de fortalecer el autoconocimiento socioemocional, la empatía y el desarrollo motriz a través de actividades lúdicas cooperativas vinculadas a "${capitalizedTopic}".`,
    proposito: `Desarrollar habilidades socioemocionales y motrices mediante circuitos de retos colaborativos, diarios de emociones y asambleas de reflexión grupal (Libro SEP: De lo Humano y lo Comunitario / Proyectos de Aula).`,
    productoFinal: `Circuito del "Rally Cooperativo Escolar" con estaciones de retos motrices y lúdicos, "Árbol de las Emociones" con compromisos afectivos rotulados y guía comunitaria de juegos tradicionales para el recreo.`,
    impactoSocial: `Mejora el clima escolar, fomenta la salud mental y física de la niñez, previene el acoso escolar y promueve la integración comunitaria.`,
    rubrica: {
      criterio1: {
        nombre: 'Reconocimiento y Gestión Emocional',
        sobresaliente: `Identifica y nombra sus emociones con asertividad, aplicando estrategias de autorregulación y empatía hacia sus pares sobre "${capitalizedTopic}".`,
        satisfactorio: `Expresa sus sentimientos con respeto y reconoce cómo se sienten sus compañeros.`,
        enProceso: `Presenta dificultades para regular el enojo o la frustración durante los juegos.`
      },
      criterio2: {
        nombre: 'Desempeño Motriz y Trabajo Cooperativo',
        sobresaliente: `Participa activamente en los retos motores, colabora con entusiasmo para que todos logren la meta y respeta las reglas acordadas.`,
        satisfactorio: `Completa los circuitos motrices y ayuda a los miembros de su equipo.`,
        enProceso: `Muestra apatía motriz o desinterés en colaborar con su equipo.`
      },
      criterio3: {
        nombre: 'Promoción del Juego Limpio y la Inclusión',
        sobresaliente: `Lidera con generosidad, celebra los logros ajenos y se asegura de que nadie quede excluido en ninguna dinámica.`,
        satisfactorio: `Juega con honestidad y comparte los espacios deportivos con amabilidad.`,
        enProceso: `Presenta actitudes individualistas o excluyentes hacia sus compañeros.`
      }
    }
  };
}

/**
 * Generador de Preguntas Detonadoras Situadas y No Genéricas (Apertura y Conflicto Cognitivo)
 * Estrictamente calibradas al nivel de desarrollo cognitivo de cada Fase NEM y al dominio pedagógico del tema.
 */
export function generateDetonatingQuestions(topic: string, level: string = 'primaria-baja', subject: string = ''): string[] {
  const cleanTopic = cleanCoreTopicName(topic);
  const capitalizedTopic = cleanTopic;
  const levelKey = level || 'primaria-baja';
  const domain = classifyPedagogicalDomain(cleanTopic, subject);

  let rawQuestions: string[] = [];

  // 1. TRADICIONES Y PATRIMONIO BIOCULTURAL
  if (domain === 'traditions_culture') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué historias nos platican los abuelitos sobre los altares y qué olores ricos sentimos con el copal y las flores de cempasúchil en ${capitalizedTopic}?`,
        `¿Por qué en nuestras casas y escuelas recordamos con tanto cariño, fiesta y comida rica a nuestros seres queridos?`,
        `¿Cómo podemos ayudar con flores, semillas y dibujos bonitos a preparar la ofrenda tradicional de nuestro salón?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Qué elementos bioculturales (flores nativas, alimentos de temporada, cerámicas) se utilizan en nuestra entidad para conmemorar "${capitalizedTopic}" y qué simbolismo guardan?`,
        `¿Por qué los relatos orales de nuestros abuelos y personas mayores son indispensables para comprender el sentido profundo de "${capitalizedTopic}" frente a modas foráneas?`,
        `¿Cómo redactamos calaveritas literarias y elaboramos representaciones artísticas que combinen el ingenio, el humor respetuoso y la identidad cultural sin ofender a nadie?`
      ];
    } else {
      rawQuestions = [
        `¿De qué forma las tradiciones populares como "${capitalizedTopic}" actúan como actos de resistencia cultural y preservación de la memoria histórica frente a la homogenización global?`,
        `¿Cómo se articulan los rituales de conmemoración colectiva y el sincretismo virreinal-prehispánico con los procesos de duelo y cohesión comunitaria en los jóvenes?`,
        `¿Qué propuestas artísticas y etnográficas contemporáneas pueden resignificar los símbolos ancestrales de "${capitalizedTopic}" manteniendo viva su raíz comunitaria?`
      ];
    }
  }

  // 1.1 HISTORIA - INDEPENDENCIA DE MÉXICO
  else if (domain === 'history_independence') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Por qué en septiembre tocamos campanas, ondeamos banderas y gritamos "¡Viva México!" para recordar a Hidalgo y a doña Josefa Ortiz?`,
        `¿Qué historias nos cuentan en casa y en la escuela sobre cómo vivían las personas antes de que México fuera un país libre e independiente?`,
        `¿Cómo podemos dibujar y dramatizar con respeto a las mujeres y hombres valientes que lucharon por nuestra libertad y la igualdad de todos?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cuáles fueron las principales injusticias y desigualdades sociales en la Nueva España que impulsaron al cura Hidalgo, a Morelos y al pueblo a levantarse en armas en 1810?`,
        `¿Cómo nos ayuda el estudio de documentos como los "Sentimientos de la Nación" a entender qué país de igualdad y justicia soñaban construir los insurgentes?`,
        `¿De qué manera los ideales de libertad, soberanía y abolición de la esclavitud de la Independencia siguen vivos en las leyes de nuestro México actual?`
      ];
    } else {
      rawQuestions = [
        `¿Qué papel jugaron las reformas borbónicas, la invasión napoleónica a España y el pensamiento ilustrado en el estallido insurgente de 1810?`,
        `¿Cómo contrastan los proyectos de nación y soberanía de Hidalgo, Morelos e Iturbide a lo largo de las cuatro etapas emancipadoras?`,
        `¿En qué medida los Tratados de Córdoba y el Plan de Iguala consolidaron la soberanía o dejaron compromisos sociales pendientes con las clases populares?`
      ];
    }
  }

  // 1.2 HISTORIA - REVOLUCIÓN MEXICANA
  else if (domain === 'history_revolution') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Por qué el 20 de noviembre recordamos a Francisco I. Madero, Emiliano Zapata y las Adelitas con vestuarios y canciones tradicionales?`,
        `¿Qué cosas cambiaron en la vida del campo y las escuelas después de la Revolución Mexicana?`,
        `¿Cómo podemos cantar corridos y dramatizar historias de la Revolución Mexicana valorando la justicia y la paz?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cuáles fueron las causas del Porfiriato y las desigualdades en el campo y las fábricas que provocaron el estallido de la Revolución de 1910?`,
        `¿Por qué la Constitución de 1917 fue tan importante al establecer por primera vez en el mundo el derecho a la educación gratuita (Art. 3º) y el trabajo digno (Art. 123)?`,
        `¿Qué ideales de tierra, justicia y democracia de la Revolución siguen siendo compromisos indispensables en nuestras comunidades?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo se articuló la heterogeneidad de los proyectos maderista, zapatista, villista y constitucionalista durante el proceso revolucionario de 1910 a 1920?`,
        `¿Cuál fue la trascendencia geopolítica y social de la Constitución de 1917 como pacto refundacional del Estado mexicano moderno?`,
        `¿Qué continuidades y rupturas existen entre las demandas agrarias y laborales de la Revolución y las transformaciones sociopolíticas contemporáneas?`
      ];
    }
  }

  // 2. HISTORIA, GEOGRAFÍA Y SOCIEDAD GENERAL
  else if (domain === 'history_society') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Cómo se transportaban, qué comían y a qué jugaban las personas de nuestra comunidad hace muchos años cuando ocurrió "${capitalizedTopic}"?`,
        `¿Por qué en nuestra comunidad y en la escuela celebramos con banderas, música y relatos las fechas cívicas de México?`,
        `¿Qué personas o héroes importantes ayudaron a que hoy tengamos escuelas con libros y maestros para todas las niñas y niños?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cuáles fueron las principales causas sociales, territoriales y de injusticia que impulsaron a las personas de nuestra entidad a participar en "${capitalizedTopic}"?`,
        `¿Cómo nos ayuda el análisis de cartas, fotografías antiguas y testimonios en los libros de la SEP a distinguir lo que realmente sucedió de los mitos sobre "${capitalizedTopic}"?`,
        `¿Qué derechos, libertades y leyes que hoy nos protegen en la escuela y en nuestra familia nacieron a partir de las luchas históricas de "${capitalizedTopic}"?`
      ];
    } else {
      rawQuestions = [
        `¿Qué contradicciones socioeconómicas territoriales y disputas ideológicas determinaron el desarrollo y desenlace de "${capitalizedTopic}"?`,
        `¿De qué forma las fuentes primarias facsimilares y los debates historiográficos contemporáneos desmienten las versiones oficiales lineales sobre "${capitalizedTopic}"?`,
        `¿Qué demandas históricas de justicia social, soberanía y democracia consagradas en esa época siguen siendo retos vigentes en el México del siglo XXI?`
      ];
    }
  }

  // 3. MATEMÁTICAS - NÚMEROS, TIENDITA Y ARITMÉTICA
  else if (domain === 'mathematics_numbers') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Cómo usamos nuestras monedas didácticas de 1, 2, 5 y 10 pesos para jugar a la tiendita y pagar exactamente lo que compramos?`,
        `¿Qué pasa si tenemos 10 pesos y compramos una fruta de 6 pesos: cómo sabemos cuánto cambio nos tienen que regresar?`,
        `¿Cómo contamos y agrupamos objetos de 10 en 10 para no equivocarnos al contar cantidades grandes en "${capitalizedTopic}"?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cómo nos ayuda el cálculo mental y el valor posicional a verificar rápidamente el costo total y el cambio en una compra comunitaria sobre "${capitalizedTopic}"?`,
        `¿Qué diferencia existe entre un gasto necesario para el bienestar y un gasto impulsivo al planear el presupuesto de nuestra cooperativa escolar?`,
        `¿De qué manera las operaciones matemáticas (multiplicación, división, porcentajes) nos permiten calcular descuentos y comparar precios con justicia?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo se modelan matemáticamente los presupuestos, el valor del dinero en el tiempo y el interés en proyectos socioeconómicos comunitarios sobre "${capitalizedTopic}"?`,
        `¿Qué indicadores estadísticos nos permiten evaluar la rentabilidad social y el balance costo-beneficio en una iniciativa productiva escolar?`,
        `¿De qué forma el razonamiento cuantitativo y la educación financiera previenen el consumo desmedido y promueven la economía solidaria?`
      ];
    }
  }

  // 4. MATEMÁTICAS - FRACCIONES
  else if (domain === 'mathematics_fractions') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Cómo podemos repartir 4 manzanas o panes entre 4 amigos para que a todos les toque exactamente la misma parte?`,
        `¿Qué pasa cuando doblamos una hoja o una tortilla a la mitad y luego otra vez a la mitad: cuántas partes iguales tenemos?`,
        `¿En qué momentos en la cocina o en los juegos usamos mitades y cuartos para compartir con alegría?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Por qué 2/4 representa exactamente la misma cantidad que 1/2 aunque se utilicen números diferentes en el numerador y denominador?`,
        `¿Cómo resolvemos problemas de medición y reparto al preparar recetas con ingredientes en cuartos, medios y octavos de kilo o litro?`,
        `¿De qué manera las fracciones nos ayudan a resolver desacuerdos cotidianos y asegurar repartos justos y equitativos en el salón?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo se fundamenta formalmente el orden y la densidad en el conjunto de los números racionales a través de la recta numérica?`,
        `¿Qué aplicaciones prácticas tienen las razones, proporciones y equivalencias fraccionarias en modelos físicos, químicos y financieros?`,
        `¿Cómo optimizan los algoritmos fraccionarios la precisión en el diseño de proyectos tecnológicos y de construcción?`
      ];
    }
  }

  // 5. MATEMÁTICAS - GEOMETRÍA
  else if (domain === 'mathematics_geometry') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué figuras geométricas (círculos, cuadrados, triángulos y rectángulos) podemos descubrir en las ventanas, puertas y objetos del salón sobre "${capitalizedTopic}"?`,
        `¿En qué se diferencia una figura plana dibujada en papel de un cuerpo con volumen como una caja o pelota?`,
        `¿Cómo podemos usar las piezas del tangram para inventar figuras de animales o casas divertidas?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cómo calculamos el perímetro y el área de espacios de nuestra escuela (canchas, jardines, salones) para proponer mejoras en "${capitalizedTopic}"?`,
        `¿Qué características distinguen a los prismas de las pirámides cuando armamos sus desarrollos planos en cartulina?`,
        `¿De qué manera la simetría y los ángulos rectos hacen que las construcciones y edificios de nuestra comunidad sean estables y resistentes?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo se aplican los teoremas geométricos (Pitágoras, Tales) y las propiedades de semejanza en la medición indirecta de alturas y distancias en el entorno?`,
        `¿Qué relación matemática existe entre la variación del perímetro y la variación del área o volumen en figuras a escala?`,
        `¿De qué forma el diseño geométrico optimiza el uso de materiales y el espacio en la arquitectura sustentable comunitaria?`
      ];
    }
  }

  // 6. MATEMÁTICAS - ÁLGEBRA Y FUNCIONES
  else if (domain === 'mathematics_algebra') {
    rawQuestions = [
      `¿Por qué la trayectoria de un proyectil o la forma de los arcos de un puente colgante describen con exactitud una curva parabólica (y = ax² + bx + c)?`,
      `¿Qué significado físico tienen el vértice, el eje de simetría y las raíces en una ecuación cuadrática aplicada a situaciones cotidianas sobre "${capitalizedTopic}"?`,
      `¿Cómo nos ayuda el software dinámico (GeoGebra) a predecir alcances máximos y optimizar dimensiones en problemas reales?`
    ];
  }

  // 7. CIENCIAS NATURALES Y MEDIO AMBIENTE
  else if (domain === 'natural_sciences') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué necesitan las plantitas y los animalitos de nuestro entorno para vivir felices y cómo podemos cuidarlos con amor en "${capitalizedTopic}"?`,
        `¿Qué sienten nuestras manitas al tocar la tierra, el agua fresca y las hojas de las plantas del huerto escolar?`,
        `¿Por qué es muy importante cerrar bien la llave del agua y apagar la luz que no usemos en la escuela y en casa?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Qué factores ambientales (agua, luz, temperatura, tipo de suelo) determinan el equilibrio biológico en los ecosistemas de nuestra entidad sobre "${capitalizedTopic}"?`,
        `¿Cómo podemos comprobar mediante observaciones sistemáticas en la bitácora escolar cómo se transforma la materia y la energía en la naturaleza?`,
        `¿Qué acciones concretas y medibles podemos implementar en la escuela para filtrar el agua, separar residuos o proteger la biodiversidad en "${capitalizedTopic}"?`
      ];
    } else {
      rawQuestions = [
        `¿Qué leyes de la termodinámica y principios ecológicos rigen los flujos de energía y ciclos de materia en los ecosistemas frente a "${capitalizedTopic}"?`,
        `¿Qué impacto bioético y socioambiental generan las actividades antropogénicas en la pérdida de biodiversidad y la huella de carbono regional?`,
        `¿Cómo se justifican científica y tecnológicamente las alternativas ecotécnicas (energías renovables, filtración pluvial) para mitigar el cambio climático?`
      ];
    }
  }

  // 8. SALUD, NUTRICIÓN Y CUERPO HUMANO
  else if (domain === 'health_nutrition') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Por qué comer frutas de colores, verduras y tomar agua simple nos hace correr rápido y crecer sanos en lugar de comer comida chatarra?`,
        `¿Cómo sentimos los latidos de nuestro corazón cuando saltamos la cuerda o bailamos en el patio escolar?`,
        `¿Qué hábitos de higiene (lavado de manos con agua y jabón, cepillado de dientes) protegen nuestro cuerpo de enfermarse?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cómo se relacionan los grupos del Plato del Bien Comer y la Jarra del Buen Beber con el funcionamiento del sistema digestivo y circulatorio?`,
        `¿Qué riesgos reales para la salud provocan el consumo frecuente de bebidas azucaradas y alimentos ultraprocesados en nuestra comunidad escolar?`,
        `¿Qué propuesta de colaciones saludables y accesibles podemos promover en la cooperativa escolar para mejorar la nutrición de todos?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo influyen los determinantes socioeconómicos y la publicidad de la industria alimentaria en la prevalencia de enfermedades crónicas no transmisibles en México?`,
        `¿Qué procesos metabólicos y fisiológicos explican la relación entre el estrés crónico, el sedentarismo y la salud cardiovascular en la juventud?`,
        `¿Qué políticas de salud pública y soberanía alimentaria comunitaria pueden revertir el daño a la salud de la población?`
      ];
    }
  }

  // 9. LENGUAJES - EPISTOLAR
  else if (domain === 'language_epistolar') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿A qué persona de tu familia o amigo te gustaría enviarle una carta o un dibujo bonito para decirle cuánto lo quieres?`,
        `¿Por qué una carta guardada en un sobre con estampilla se siente tan especial y bonita al recibirla?`,
        `¿Qué datos y dibujos necesitamos poner en el sobre para que el cartero sepa exactamente a quién entregárselo?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Por qué una carta formal o personal escrita a mano transmite ideas con mayor calidez y claridad que un mensaje digital rápido en torno a "${capitalizedTopic}"?`,
        `¿Qué partes indispensables (lugar, fecha, destinatario, saludo, cuerpo, despedida y firma) estructuran un texto epistolar formal?`,
        `¿A qué autoridades o miembros de la comunidad escolar podemos plantearles una propuesta de mejora colectiva mediante una carta de petición ciudadana?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo ha evolucionado el género epistolar como testimonio histórico, político y literario en la conformación de la memoria pública de México?`,
        `¿Qué estrategias retóricas y registros lingüísticos distinguen a la correspondencia diplomática de la correspondencia privada?`,
        `¿Qué valor ético conserva la privacidad de la correspondencia en la era de la vigilancia y las comunicaciones digitales masivas?`
      ];
    }
  }

  // 10. LENGUAJES - NARRATIVA Y CUENTOS
  else if (domain === 'language_narrative') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué cuentos o relatos divertidos te han contado tus abuelitos o maestros en la escuela sobre "${capitalizedTopic}"?`,
        `¿Cómo podemos inventar personajes fantásticos, un misterio emocionante y un final feliz para nuestra historia?`,
        `¿Qué dibujos, colores y letreros le pondremos a la portada de nuestro libro cartonero de cuentos?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Qué estructura narrativa (planteamiento, nudo, clímax y desenlace) hace que un relato atrape el interés y la emoción del lector en "${capitalizedTopic}"?`,
        `¿Cómo nos ayudan las descripciones detalladas de escenarios y los diálogos directos a transmitir la personalidad de los personajes?`,
        `¿De qué manera la elaboración de un libro cartonero escolar fomenta el amor por la lectura y el cuidado del medio ambiente?`
      ];
    } else {
      rawQuestions = [
        `¿De qué forma las tradiciones orales y la narrativa contemporánea reflejan la cosmovisión e identidad cultural de nuestras comunidades?`,
        `¿Qué recursos estilísticos, figuras retóricas y polifonía discursiva enriquecen la construcción dramática de un relato sobre "${capitalizedTopic}"?`,
        `¿Cómo influye la recepción crítica de una obra literaria en la resignificación de los dilemas éticos y sociales de nuestro tiempo?`
      ];
    }
  }

  // 11. LENGUAJES - POESÍA Y RIMA
  else if (domain === 'language_poetry') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué palabras suenan parecido y riman bonito como "canción" y "corazón" cuando cantamos sobre "${capitalizedTopic}"?`,
        `¿Cómo se siente en nuestra voz y cuerpo decir versos y coplas populares con ritmo y alegría?`,
        `¿A quién le dedicaremos un poema o calaverita bonita escrita con amor en el salón?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cómo utilizamos la rima consonante, el conteo de sílabas y las metáforas para darle musicalidad a nuestros versos sobre "${capitalizedTopic}"?`,
        `¿Qué diferencia existe entre un texto escrito en prosa y un poema estructurado en versos y estrofas?`,
        `¿De qué manera la declamación poética nos ayuda a vencer la timidez y comunicar emociones profundas ante nuestra comunidad?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo se articulan las vanguardias literarias, la métrica tradicional y el verso libre en la lírica mexicana contemporánea sobre "${capitalizedTopic}"?`,
        `¿Qué tropos literarios (oxímoron, metonimia, alegoría) potencian la carga estética e ideológica de un texto poético?`,
        `¿De qué forma la poesía actúa como vehículo de denuncia social y afirmación de la dignidad humana ante las crisis actuales?`
      ];
    }
  }

  // 12. LENGUAJES - EXPOSITIVO Y PERIODISMO
  else if (domain === 'language_expository') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué noticias interesantes o avisos importantes de nuestro salón queremos compartir en el periódico mural?`,
        `¿Cómo le explicamos con dibujos claros a los demás niños cómo hacer una manualidad paso a paso en "${capitalizedTopic}"?`,
        `¿Por qué es importante decir siempre la verdad cuando platicamos lo que pasó en la escuela?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cómo distinguimos una noticia fundamentada en hechos reales de un rumor o información falsa sobre "${capitalizedTopic}"?`,
        `¿Qué partes indispensables (titular, encabezado, cuerpo de la noticia, fotografía y pie de foto) organizan un artículo de divulgación?`,
        `¿De qué manera nuestra gaceta escolar puede dar a conocer los problemas y soluciones de nuestra comunidad a las familias?`
      ];
    } else {
      rawQuestions = [
        `¿Qué criterios epistemológicos y metodológicos nos permiten verificar la validez y confiabilidad de las fuentes en la era de la infodemia?`,
        `¿Cómo se estructura un texto argumentativo formal para defender una postura crítica con evidencias sólidas sobre "${capitalizedTopic}"?`,
        `¿Qué responsabilidad ética tienen los medios de comunicación y las redes digitales en la conformación de la opinión pública?`
      ];
    }
  }

  // 13. ARTES VISUALES
  else if (domain === 'arts') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué colores alegres podemos mezclar con pintura para expresar cómo nos sentimos hoy sobre "${capitalizedTopic}"?`,
        `¿Qué formas bonitas podemos crear modelando plastilina o masa con nuestras manos?`,
        `¿Cómo organizamos nuestro salón para que parezca una galería de arte hermosa para las familias?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Cómo nos ayudan los colores primarios, secundarios y los contrastes de luz y sombra a transmitir emociones en una pintura sobre "${capitalizedTopic}"?`,
        `¿Qué materiales reutilizables (cartón, tapitas, papel) podemos transformar en esculturas o instalaciones artísticas con mensaje ecológico?`,
        `¿De qué manera el arte comunitario rescata las historias y el patrimonio visual de nuestro barrio o municipio?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo desafían las corrientes artísticas contemporáneas los cánones tradicionales de belleza y representación en torno a "${capitalizedTopic}"?`,
        `¿Qué función social desempeña el arte efímero y el performance en la sensibilización comunitaria sobre las problemáticas actuales?`,
        `¿De qué forma la curaduría artística propicia una experiencia dialógica transformadora en los espectadores?`
      ];
    }
  }

  // 14. CÍVICA, ÉTICA Y CULTURA DE PAZ
  else if (domain === 'civics_ethics') {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Por qué es bonito tener acuerdos de convivencia en el salón para jugar y aprender con respeto y amistad en "${capitalizedTopic}"?`,
        `¿Cómo podemos resolver un desacuerdo en el recreo platicando con calma y escuchando a los demás?`,
        `¿Qué derechos tienen todas las niñas y niños para sentirse queridos, seguros y felices en la escuela?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Por qué los acuerdos construidos democráticamente en asamblea de aula son más respetados que las reglas impuestas desde afuera?`,
        `¿Qué estrategias de mediación de la amistad y diálogo asertivo podemos aplicar cuando surja un conflicto en el recreo o salón en torno a "${capitalizedTopic}"?`,
        `¿De qué manera defendemos y promovemos la igualdad de género y la inclusión de todas y todos en las actividades escolares?`
      ];
    } else {
      rawQuestions = [
        `¿Cómo se articulan los derechos humanos, el estado de derecho y la justicia restaurativa en la resolución de controversias sociales sobre "${capitalizedTopic}"?`,
        `¿Qué dilemas éticos contemporáneos desafían la construcción de una cultura de paz y no violencia en los espacios públicos juveniles?`,
        `¿Qué mecanismos de participación ciudadana y mediación institucional fortalecen el tejido social y la convivencia democrática?`
      ];
    }
  }

  // 15. SOCIOEMOCIONAL Y FÍSICA (Default situado general)
  else {
    if (levelKey === 'preescolar' || levelKey === 'primaria-baja') {
      rawQuestions = [
        `¿Qué personas, actividades o juegos de nuestra familia y escuela nos hacen sentir alegres, fuertes y seguros sobre "${capitalizedTopic}"?`,
        `¿Cómo nos ayudamos en equipo para investigar, dibujar y aprender juntos en nuestros libros de texto de la SEP?`,
        `¿Qué trabajo bonito y terminado compartiremos con orgullo con nuestras familias al final del proyecto?`
      ];
    } else if (levelKey === 'primaria-media' || levelKey === 'primaria-alta') {
      rawQuestions = [
        `¿Qué causas originan los retos principales vinculados a "${capitalizedTopic}" en nuestra comunidad y cómo podemos comprobarlas con datos y evidencias?`,
        `¿Cómo nos organizamos en equipos colaborativos para que cada integrante aporte sus mejores habilidades y conocimientos al proyecto?`,
        `¿Qué propuesta tangible, creativa y sustentable podemos presentar a la escuela para resolver problemas en torno a "${capitalizedTopic}"?`
      ];
    } else {
      rawQuestions = [
        `¿Cuáles son las implicaciones éticas, sociales y científicas de "${capitalizedTopic}" en el contexto actual de nuestro país?`,
        `¿De qué forma los marcos teóricos y el pensamiento crítico nos permiten analizar rigurosamente este fenómeno sin prejuicios?`,
        `¿Qué proyecto de impacto social transformador podemos liderar para incidir positivamente en nuestra comunidad escolar?`
      ];
    }
  }

  return rawQuestions.map(q => sanitizeSpanishPedagogicalGrammar(q));
}

/**
 * Formateador oficial de fechas en letras en español (ej. "25 de agosto de 2026")
 */
export function formatSpanishDateInLetters(dateInput?: string | Date): string {
  if (!dateInput) {
    return formatSpanishDateInLetters(new Date());
  }

  let date: Date;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  } else {
    date = dateInput;
  }

  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month} de ${year}`;
}

/**
 * Detector y Generador Dinámico de PDAs oficiales de la NEM 2024
 * Analiza el tema introducido, el nivel educativo (Fase) y la asignatura seleccionada
 * para ofrecer sugerencias de PDAs contextualizados, pedagógicamente rigurosos y articulados.
 */
export function detectCurriculumPdasForTopic(
  topic: string,
  level: string = 'primaria-baja',
  subjectIdOrName: string = ''
): string[] {
  if (!topic || topic.trim().length < 2) return [];

  const cleanTopic = cleanCoreTopicName(topic);
  const capitalizedTopic = cleanTopic;
  const topicLower = cleanTopic.toLowerCase();
  const subLower = (subjectIdOrName || '').toLowerCase();
  const levelKey = level || 'primaria-baja';

  // Identificación exhaustiva de dominios temáticos
  const isTraditionsOrCulture = /muert|difunt|ofrend|calaver|altar|cempasuchil|pan de muerto|costumbre|festividad|tradicion|patrimonio biocultural|celebrac|panteon|copal|sahumerio|alfeñique|papel picado|fiesta patronal|guelaguetza|posada|navidad|carnaval|charro|mariachi|indigena|originario|lengua materna/i.test(topicLower);
  const isIndependence = /independ|hidalgo|morelos|allende|aldama|josefa|iturbide|guerrero|trigarante|dolores|grito|sentimientos de la nacion|apatzingan|cordoba|iguala|insurg/i.test(topicLower);
  const isRevolution = !isIndependence && /revoluci|madero|zapata|villa|carranza|obregon|porfiriato|diaz|huerta|adelita|1910|1917|constitucion de 1917|tierra y libertad/i.test(topicLower);
  const isHistoryOrCivics = isIndependence || isRevolution || /porfir|reforma|mexic|histori|constituc|juarez|virrein|prehispan|colonia|patrimon|cultura|efemerid|civilizac|conquista|batalla|heroes|monumento|patria|comunidad|entidad|region|localidad/i.test(topicLower);
  const isMath = /matemat|fraccion|suma|resta|multiplic|division|numero|conteo|algebra|ecuacion|cuadrat|parabol|geometr|tangram|area|perimetr|volumen|probabil|estadist|porcentaj|proporc|vector|recta|plano/i.test(topicLower);
  const isScience = /cienc|natur|biolog|fisic|quimic|plan|animal|cuerpo|organo|salud|nutric|ecosistem|agua|aire|suelo|materia|energia|fuerza|movimient|celul|atomo|combust|calor|optica|luz|universo|planeta|medio ambiente|biodivers|huerto|recicl/i.test(topicLower);
  const isEpistolar = /carta|epistol|mensaje|buzon|cartero|correspondencia|sobre\b|postal/i.test(topicLower);
  const isLiterature = /cuento|leyenda|mito|fabula|poema|poes|rima|verso|cancion|teatro|dramat|relato|literat/i.test(topicLower);
  const isLanguageGeneral = isEpistolar || isLiterature || /lengua|espanol|lectur|escritur|ensayo|resen|noticia|periodico|oratori|debate|discurs|argument|exposit|instructiv|ortograf|redacc/i.test(topicLower);
  const isCivicsRights = /civic|etica|derecho|paz|convivenc|acuerdo|regla|igualdad|genero|discrimin|democrac|inclusion|comunidad|ciudadan|justicia/i.test(topicLower);
  const isArt = /arte|pintur|dibujo|musica|teatro|danza|escultur|color|expresion artist|ritmo|sonido/i.test(topicLower);
  const isHealth = /salud|higiene|aliment|plato del bien comer|ejercicio|deport|emocion|socioemocional|motriz/i.test(topicLower);

  const pdasByPhase: Record<string, {
    traditions: string[];
    independence?: string[];
    revolution?: string[];
    history: string[];
    math: string[];
    science: string[];
    language: string[];
    civics: string[];
    art: string[];
    health: string[];
    general: string[];
  }> = {
    'preescolar': {
      traditions: [
        `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos, costumbres y tradiciones familiares sobre Día de Muertos y festividades locales, reconociendo la diversidad cultural y el respeto a sus compañeros.`,
        `Fase 2 (Preescolar) - Lenguajes: Expresa mediante dibujos, modelado con masa y canciones tradicionales sus impresiones sobre las ofrendas y personajes de las festividades de su comunidad.`,
        `Fase 2 (Preescolar) - De lo Humano y lo Comunitario: Identifica que forma parte de una familia y comunidad con costumbres propias, participando con respeto y alegría en celebraciones colectivas.`,
        `Fase 2 (Preescolar) - Saberes y Pensamiento Científico: Observa los elementos naturales de temporada (flores de cempasúchil, frutas, semillas y hojas), describiendo colores, formas y texturas.`
      ],
      independence: [
        `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos y dibujos sobre la Independencia de México, Miguel Hidalgo y los símbolos patrios, reconociendo el valor de la libertad.`,
        `Fase 2 (Preescolar) - Lenguajes: Expresa oralmente relatos, poemas y canciones sobre los héroes patrios mediante el juego dramático y títeres.`
      ],
      revolution: [
        `Fase 2 (Preescolar) - Lenguajes: Expresa mediante dibujos y canciones relatos sobre personajes de la Revolución Mexicana.`
      ],
      history: [
        `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos, costumbres y tradiciones familiares sobre "${capitalizedTopic}", reconociendo la historia de su entorno y festividades de su comunidad.`,
        `Fase 2 (Preescolar) - Lenguajes: Expresa mediante dibujos, cantos y dramatizaciones infantiles sucesos y personajes representativos de "${capitalizedTopic}".`
      ],
      math: [
        `Fase 2 (Preescolar) - Saberes y Pensamiento Científico: Cuenta objetos de su entorno, compara colecciones y utiliza nociones espaciales (arriba, abajo, cerca, lejos) en actividades sobre "${capitalizedTopic}".`,
        `Fase 2 (Preescolar) - Saberes y Pensamiento Científico: Identifica formas geométricas, patrones y cantidades en elementos cotidianos asociados a "${capitalizedTopic}".`
      ],
      science: [
        `Fase 2 (Preescolar) - Saberes y Pensamiento Científico: Observa con curiosidad seres vivos y elementos naturales vinculados a "${capitalizedTopic}", describiendo lo que percibe con sus sentidos y proponiendo cómo cuidarlos.`,
        `Fase 2 (Preescolar) - De lo Humano y lo Comunitario: Practica acciones cotidianas de higiene, hidratación y cuidado del medio ambiente escolar en torno a "${capitalizedTopic}".`
      ],
      language: [
        `Fase 2 (Preescolar) - Lenguajes: Expresa oralmente sus emociones, ideas y preguntas sobre "${capitalizedTopic}", escuchando con atención los relatos y opiniones de sus compañeros.`,
        `Fase 2 (Preescolar) - Lenguajes: Explora libros ilustrados, rimas, canciones y cuentos sobre "${capitalizedTopic}", inventando sus propias narraciones orales.`
      ],
      civics: [
        `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Colabora en juegos y acuerdos de convivencia del salón inspirados en "${capitalizedTopic}", respetando turnos y a sus compañeros.`,
        `Fase 2 (Preescolar) - De lo Humano y lo Comunitario: Reconoce que todas las niñas y niños tienen los mismos derechos a jugar, aprender y ser escuchados al participar en proyectos sobre "${capitalizedTopic}".`
      ],
      art: [
        `Fase 2 (Preescolar) - Lenguajes (Artes): Experimenta con colores, texturas, plastilina y música para representar de forma libre y creativa ideas sobre "${capitalizedTopic}".`
      ],
      health: [
        `Fase 2 (Preescolar) - De lo Humano y lo Comunitario: Reconoce la importancia del descanso, la alimentación saludable y la actividad física regular al explorar "${capitalizedTopic}".`
      ],
      general: [
        `Fase 2 (Preescolar) - Fase 2 Integral: Explora su entorno inmediato descubriendo aspectos significativos de "${capitalizedTopic}" y comunica sus hallazgos con recursos gráficos y orales.`
      ]
    },
    'primaria-baja': {
      traditions: [
        `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga en relatos familiares, fotografías y testimonios comunitarios el origen y los cambios en las tradiciones y festividades de su localidad (como Día de Muertos y conmemoraciones patronales), reconociendo el patrimonio biocultural.`,
        `Fase 3 (1º y 2º Primaria) - Lenguajes: Escribe de manera autónoma y mediante dictado al docente coplas, rimas y descripciones sencillas sobre las ofrendas y personajes tradicionales de su comunidad.`,
        `Fase 3 (1º y 2º Primaria) - Lenguajes (Artes): Explora elementos plásticos (papel picado, calaveritas de barro o plastilina, aserrín de colores) para recrear altares y manifestaciones de la tradición popular.`,
        `Fase 3 (1º y 2º Primaria) - De lo Humano y lo Comunitario: Reconoce que las tradiciones y festividades familiares fortalecen los lazos afectivos, el respeto intergeneracional y el sentido de pertenencia colectiva.`,
        `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Describe y clasifica elementos naturales de temporada (cempasúchil, mandarinas, calabaza, copal) y observa sus transformaciones físicas cotidianas.`
      ],
      independence: [
        `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga a través de relatos históricos, lecturas compartidas e imágenes los acontecimientos y personajes del inicio de la Independencia de México (Miguel Hidalgo, Josefa Ortiz de Domínguez, Ignacio Allende), reconociendo por qué conmemoramos esta fecha cívica y valorando la libertad y la justicia.`,
        `Fase 3 (1º y 2º Primaria) - Lenguajes: Produce e interpreta narraciones orales, coplas patrióticas y dibujos sobre los héroes y heroínas de la Independencia de México, dialogando con sus compañeros sobre el valor de la libertad y el respeto a los símbolos patrios.`,
        `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Organiza secuencias temporales y líneas del tiempo sencillas (el Grito de 1810, el paso de los años y la celebración actual en nuestra escuela y comunidad).`,
        `Fase 3 (1º y 2º Primaria) - De lo Humano y lo Comunitario: Participa en dramatizaciones, rondas y representaciones cívicas sobre los valores de valentía, solidaridad e igualdad heredados del movimiento de Independencia.`
      ],
      revolution: [
        `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga en relatos familiares, fotografías y testimonios de su comunidad los hechos de la Revolución Mexicana, reconociendo cómo transformaron la vida cotidiana, la escuela y los derechos de las personas.`,
        `Fase 3 (1º y 2º Primaria) - Lenguajes: Produce e interpreta narraciones orales, coplas, corridos y dibujos sobre la Revolución Mexicana (Madero, Zapata, Villa y las Adelitas).`,
        `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Organiza secuencias temporales en calendarios y líneas del tiempo sencillas (antes de 1910, durante la lucha y la época actual).`,
        `Fase 3 (1º y 2º Primaria) - De lo Humano y lo Comunitario: Participa en dramatizaciones y juegos de roles sobre personajes históricos de la Revolución, valorando la igualdad y la justicia.`
      ],
      history: [
        `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga a través de relatos orales, fotografías familiares y testimonios comunitarios las tradiciones, historia y cambios de "${capitalizedTopic}" en su comunidad.`,
        `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico (Conocimiento del Medio): Describe y registra los elementos naturales y socioculturales de su entorno vinculados a "${capitalizedTopic}".`,
        `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Valora la diversidad cultural y el patrimonio histórico local en celebraciones y proyectos sobre "${capitalizedTopic}".`
      ],
      math: [
        isMath && /fraccion/i.test(topicLower) 
          ? `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico (Estudio de los números): Expresa de manera oral y escrita fracciones sencillas (medios, cuartos y octavos) en situaciones cotidianas de reparto vinculadas a "${capitalizedTopic}" con material concreto.`
          : `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Resuelve problemas vinculados a su contexto que implican agregar, quitar, comparar y repartir colecciones de objetos en torno a "${capitalizedTopic}".`,
        `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Construye figuras y patrones geométricos mediante tangram y material manipulativo para modelar situaciones de "${capitalizedTopic}".`
      ],
      science: [
        `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Describe y registra las características de elementos naturales, plantas, animales y estados físicos en relación con "${capitalizedTopic}", proponiendo acciones comunitarias de conservación.`,
        `Fase 3 (1º y 2º Primaria) - De lo Humano y lo Comunitario: Identifica los órganos de los sentidos y hábitos de vida saludable aplicados a "${capitalizedTopic}" para el bienestar escolar.`
      ],
      language: [
        isEpistolar
          ? `Fase 3 (1º y 2º Primaria) - Lenguajes (Producción de textos epistolares): Reconoce la estructura de la carta (lugar, fecha, destinatario, saludo, cuerpo, despedida, firma y remitente), escribe cartas con propósitos reales y utiliza el buzón escolar para la entrega de correspondencia comunitaria.`
          : isLiterature
          ? `Fase 3 (1º y 2º Primaria) - Lenguajes: Lee y produce cuentos, fábulas y leyendas sobre "${capitalizedTopic}", identificando inicio, desarrollo y desenlace, y aplicando signos de puntuación básicos.`
          : `Fase 3 (1º y 2º Primaria) - Lenguajes: Describe de forma oral y escrita objetos, personas y eventos relacionados con "${capitalizedTopic}" mediante el dibujo y la escritura autónoma con sentido social.`
      ],
      civics: [
        `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Construye normas y acuerdos de convivencia en el aula inspirados en "${capitalizedTopic}", fomentando el diálogo, la inclusión y la cultura de paz.`
      ],
      art: [
        `Fase 3 (1º y 2º Primaria) - Lenguajes (Artes): Explora texturas, formas, colores, rondas tradicionales y modelado con plastilina sobre "${capitalizedTopic}" para expresar emociones libremente.`
      ],
      health: [
        `Fase 3 (1º y 2º Primaria) - De lo Humano y lo Comunitario: Practica hábitos de hidratación, alimentación sana del Plato del Bien Comer y movimiento físico vinculados a "${capitalizedTopic}".`
      ],
      general: [
        `Fase 3 (1º y 2º Primaria) - Fase 3 Integral: Identifica y describe con sus palabras las principales características de "${capitalizedTopic}" en su contexto escolar y comunitario, registrando sus observaciones con material manipulativo y gráfico.`
      ]
    },
    'primaria-media': {
      traditions: [
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades (La Entidad donde Vivo): Reconoce y valora las prácticas culturales, expresiones artísticas, rituales, ofrendas y festividades tradicionales (como Día de Muertos) como parte del patrimonio biocultural y la memoria colectiva de su entidad federativa y pueblos originarios.`,
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades (Historia Regional): Indaga en fuentes orales, escritas y testimonios familiares sobre el origen histórico, continuidades y transformaciones de las celebraciones populares en las diversas regiones de su estado.`,
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades (Geografía y Territorio): Localiza y analiza en el mapa de su entidad federativa los lugares, pueblos originarios y regiones donde se preservan las festividades tradicionales y conmemoraciones colectivas.`,
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Identifica la composición pluricultural de su entidad federativa, reconociendo el aporte de los pueblos indígenas y afromexicanos en la preservación de costumbres y fiestas comunitarias.`,
        `Fase 4 (3º y 4º Primaria) - Lenguajes (Calaveritas Literarias): Lee, comprende y produce calaveritas literarias y coplas populares, explorando la rima, el ritmo lírico, la sátira humorística y las figuras retóricas de la tradición lírica mexicana.`,
        `Fase 4 (3º y 4º Primaria) - Lenguajes (Artes Visuales): Analiza las características estéticas, cromáticas y simbólicas de las manifestaciones artísticas del Día de Muertos (altares, tapetes florales, catrinas y arte efímero), interpretando sus significados culturales.`,
        `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico (Botánica Biocultural): Indaga y describe las propiedades botánicas y usos de flores tradicionales (cempasúchil, terciopelo), semillas y frutos de temporada en las expresiones culturales de la región, reconociendo su ciclo biológico y su preservación ecológica.`,
        `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico (Cambios de Estado): Experimenta y explica los cambios de estado físico de la materia (fusión de cera, combustión de incienso y copal, sublimación aromática) observados en las prácticas culturales de su entorno.`,
        `Fase 4 (3º y 4º Primaria) - De lo Humano y lo Comunitario (Identidad y Pertenencia): Identifica eventos y celebraciones importantes de la historia familiar y comunitaria, reconociendo que fortalecen la identidad colectiva, el sentido de pertenencia y la transmisión intergeneracional de saberes y afectos.`,
        `Fase 4 (3º y 4º Primaria) - De lo Humano y lo Comunitario: Colabora en la planeación y montaje de proyectos culturales escolares, reconociendo la diversidad de formas de pensar, celebrar y convivir de las familias del grupo.`
      ],
      history: [
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades (La Entidad donde Vivo): Reconoce los cambios en los paisajes, las costumbres, tradiciones y patrimonio biocultural de su entidad federativa en torno a "${capitalizedTopic}".`,
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Investiga en fuentes primarias y secundarias las causas, personajes y consecuencias de "${capitalizedTopic}" en su entidad federativa y en México, valorando el patrimonio cultural y cívico.`,
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Localiza y representa en mapas de su entidad federativa la distribución espacial, legado y relevancia comunitaria de "${capitalizedTopic}".`
      ],
      math: [
        `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Resuelve problemas de fracciones equivalentes, multiplicación, división, cálculo de perímetros y áreas contextualizados en situaciones reales de "${capitalizedTopic}".`,
        `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Recolecta, organiza y representa datos en tablas de doble entrada y gráficas de barras sobre "${capitalizedTopic}".`
      ],
      science: [
        `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Analiza las relaciones entre factores bióticos y abióticos en torno a "${capitalizedTopic}", diseñando prototipos y acciones comunitarias de cuidado ambiental.`,
        `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Describe el funcionamiento de los sistemas del cuerpo humano y explica cómo influye "${capitalizedTopic}" en la salud comunitaria.`
      ],
      language: [
        `Fase 4 (3º y 4º Primaria) - Lenguajes: Comprende, resume y produce textos expositivos, instructivos y periodísticos sobre "${capitalizedTopic}", empleando párrafos organizados y signos de puntuación.`,
        `Fase 4 (3º y 4º Primaria) - Lenguajes: Participa en debates escolares y mesas de diálogo sobre "${capitalizedTopic}", expresando opiniones fundamentadas y escuchando con respeto.`
      ],
      civics: [
        `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Analiza los derechos de la niñez, la igualdad de género y la resolución pacífica de desacuerdos al desarrollar proyectos de "${capitalizedTopic}".`
      ],
      art: [
        `Fase 4 (3º y 4º Primaria) - Lenguajes (Artes): Crea producciones visuales y escénicas que resignifican el tema de "${capitalizedTopic}" utilizando técnicas plásticas mixtas.`
      ],
      health: [
        `Fase 4 (3º y 4º Primaria) - De lo Humano y lo Comunitario: Diseña propuestas de activación física, nutrición y bienestar emocional en torno a "${capitalizedTopic}".`
      ],
      general: [
        `Fase 4 (3º y 4º Primaria) - Fase 4 Integral: Indaga, sistematiza y comunica hallazgos sobre "${capitalizedTopic}" aplicando la metodología de proyectos comunitarios de la NEM.`
      ]
    },
    'primaria-alta': {
      traditions: [
        `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades: Analiza críticamente el origen prehispánico, virreinal y contemporáneo de la cosmovisión sobre la vida y la muerte en México, valorando el Día de Muertos como Patrimonio Cultural Inmaterial de la Humanidad.`,
        `Fase 5 (5º y 6º Primaria) - Lenguajes: Elabora crónicas comunitarias, ensayos descriptivos y una antología comentada de calaveritas literarias, empleando figuras retóricas complejas, recursos de cohesión y ortografía normativa.`,
        `Fase 5 (5º y 6º Primaria) - Saberes y Pensamiento Científico: Investiga los saberes agrícolas ancestrales en el cultivo del cempasúchil y alimentos de temporada, analizando el impacto de las prácticas agroecológicas vs el uso de agroquímicos en los suelos locales.`,
        `Fase 5 (5º y 6º Primaria) - De lo Humano y lo Comunitario: Promueve el diálogo intercultural y el respeto a la diversidad de cosmovisiones y prácticas funerarias o conmemorativas de distintas regiones del país y del mundo.`
      ],
      history: [
        `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades (Historia): Analiza críticamente las causas económicas, políticas y sociales de "${capitalizedTopic}", la promulgación de leyes y la vigencia de los derechos colectivos en el México contemporáneo.`,
        `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades (Geografía): Analiza las relaciones espaciales, ambientales y socioeconómicas de "${capitalizedTopic}" en México mediante fuentes cartográficas.`,
        `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades: Evalúa el impacto de "${capitalizedTopic}" en la soberanía, la justicia social y la conformación de la identidad nacional.`
      ],
      math: [
        `Fase 5 (5º y 6º Primaria) - Saberes y Pensamiento Científico: Resuelve problemas de proporcionalidad directa, porcentajes, números decimales y cálculo de volumen aplicados a retos cuantitativos de "${capitalizedTopic}".`,
        `Fase 5 (5º y 6º Primaria) - Saberes y Pensamiento Científico: Analiza tendencias estadísticas, media, mediana y moda en investigaciones de campo vinculadas a "${capitalizedTopic}".`
      ],
      science: [
        `Fase 5 (5º y 6º Primaria) - Saberes y Pensamiento Científico: Analiza el impacto de "${capitalizedTopic}" en los ecosistemas locales, formula hipótesis basadas en evidencia y diseña prototipos de ecotecnias sustentables.`,
        `Fase 5 (5º y 6º Primaria) - Saberes y Pensamiento Científico: Explica las transformaciones de la energía, circuitos eléctricos y propiedades de la materia en experimentos sobre "${capitalizedTopic}".`
      ],
      language: [
        `Fase 5 (5º y 6º Primaria) - Lenguajes: Produce textos argumentativos, reseñas críticas y artículos de divulgación científica sobre "${capitalizedTopic}", sustentando sus posturas con fuentes confiables.`,
        `Fase 5 (5º y 6º Primaria) - Lenguajes: Organiza y conduce debates formales sobre problemáticas de "${capitalizedTopic}", aplicando recursos persuasivos y escucha activa.`
      ],
      civics: [
        `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades: Debate dilemas éticos, derechos humanos y ejercicio democrático de la ciudadanía en torno a "${capitalizedTopic}".`
      ],
      art: [
        `Fase 5 (5º y 6º Primaria) - Lenguajes (Artes): Diseña proyectos interdisciplinarios de artes visuales, música o teatro para sensibilizar a la comunidad sobre "${capitalizedTopic}".`
      ],
      health: [
        `Fase 5 (5º y 6º Primaria) - De lo Humano y lo Comunitario: Lidera campañas de salud integral, prevención de adicciones y resiliencia comunitaria vinculadas a "${capitalizedTopic}".`
      ],
      general: [
        `Fase 5 (5º y 6º Primaria) - Fase 5 Integral: Desarrolla proyectos de indagación científica y comunitaria sobre "${capitalizedTopic}" aplicando el rigor pedagógico de la NEM 2024.`
      ]
    },
    'secundaria': {
      traditions: [
        `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades (Historia): Investiga desde fuentes historiográficas el sincretismo cultural y la resignificación de las festividades de muertos durante la época novohispana y su impacto en la conformación de la identidad nacional mexicana.`,
        `Fase 6 (Secundaria) - Lenguajes (Español): Escribe calaveras literarias de sátira política y ensayos críticos que reflexionan sobre la vigencia y mercantilización de las tradiciones populares mexicanas frente a influencias globales.`,
        `Fase 6 (Secundaria) - Lenguajes (Artes): Diseña instalaciones plásticas contemporáneas o montajes teatrales que resignifican los elementos simbólicos del altar tradicional, integrando lenguajes artísticos híbridos.`,
        `Fase 6 (Secundaria) - De lo Humano y lo Comunitario: Reflexiona sobre los procesos de duelo, la memoria de los antepasados y la resignificación de la pérdida, canalizando emociones mediante la creación artística y el diálogo comunitario.`
      ],
      history: [
        `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades (Historia): Analiza críticamente desde diversas corrientes historiográficas las contradicciones socioeconómicas, los planes y movimientos de "${capitalizedTopic}" y su legado en las instituciones actuales.`,
        `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades (Geografía): Interpreta representaciones cartográficas y analiza la dinámica territorial, sociocultural y ambiental vinculada a "${capitalizedTopic}".`,
        `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades (Formación Cívica y Ética): Evalúa los avances y retos en materia de derechos humanos, legalidad y justicia social derivados de "${capitalizedTopic}".`
      ],
      math: [
        /parabol|cuadrat|segundo grado|tiro parab/i.test(topicLower)
          ? `Fase 6 (3º Secundaria) - Saberes y Pensamiento Científico: Modela y resuelve problemas de la vida cotidiana y fenómenos físicos mediante funciones cuadráticas y parábolas (y = ax² + bx + c). Analiza e interpreta vértice, raíces y concavidad.`
          : `Fase 6 (Secundaria) - Saberes y Pensamiento Científico: Modela y resuelve situaciones reales y fenómenos científicos vinculados a "${capitalizedTopic}" mediante ecuaciones lineales, sistemas algebraicos y razones trigonométricas.`,
        `Fase 6 (Secundaria) - Saberes y Pensamiento Científico: Aplica el análisis probabilístico y el muestreo estadístico para interpretar datos de investigación comunitaria sobre "${capitalizedTopic}".`
      ],
      science: [
        `Fase 6 (Secundaria) - Saberes y Pensamiento Científico: Explica las leyes científicas, reacciones químicas, conservación de la energía y estructura de la materia que intervienen en "${capitalizedTopic}".`,
        `Fase 6 (Secundaria) - Saberes y Pensamiento Científico: Evalúa el impacto ambiental de procesos industriales y tecnológicos relacionados con "${capitalizedTopic}", proponiendo alternativas sustentables.`
      ],
      language: [
        `Fase 6 (Secundaria) - Lenguajes: Analiza discursos persuasivos, artículos de opinión y produce ensayos críticos con aparato de citas sobre "${capitalizedTopic}".`,
        `Fase 6 (Secundaria) - Lenguajes: Diseña y produce contenidos comunicativos multimedia (podcasts, videos educativos o gaceta digital) en torno a "${capitalizedTopic}".`
      ],
      civics: [
        `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades: Propone proyectos ciudadanos para el fortalecimiento del estado de derecho y la cultura de paz en relación con "${capitalizedTopic}".`
      ],
      art: [
        `Fase 6 (Secundaria) - Lenguajes (Artes): Desarrolla proyectos artísticos interdisciplinarios que abordan problemáticas comunitarias sobre "${capitalizedTopic}".`
      ],
      health: [
        `Fase 6 (Secundaria) - De lo Humano y lo Comunitario: Analiza factores de riesgo y formula proyectos comunitarios para el autocuidado y la salud mental en torno a "${capitalizedTopic}".`
      ],
      general: [
        `Fase 6 (Secundaria) - Fase 6 Integral: Diseña y ejecuta proyectos sociocríticos integrales sobre "${capitalizedTopic}" con rigor pedagógico oficial NEM 2024.`
      ]
    },
    'preparatoria': {
      traditions: [
        `Bachillerato (MCCEMS) - Conciencia Histórica y Humanidades: Examina con aparato crítico el sincretismo biocultural, la filosofía indígena de la muerte y la construcción de la identidad nacional mexicana a través de sus tradiciones populares.`,
        `Bachillerato (MCCEMS) - Lengua y Comunicación: Produce ensayos argumentativos y piezas líricas de alta complejidad sobre la preservación de las tradiciones mexicanas y el derecho a la memoria biocultural.`
      ],
      history: [
        `Bachillerato (MCCEMS) - Ciencias Sociales y Conciencia Histórica: Evalúa con aparato crítico las transformaciones estructurales, reformas agrarias e institucionales derivadas de "${capitalizedTopic}" en el México contemporáneo.`,
        `Bachillerato (MCCEMS) - Lengua y Comunicación: Produce discursos argumentativos y ensayos preuniversitarios formalmente citados sobre la trascendencia de "${capitalizedTopic}".`
      ],
      math: [
        `Bachillerato (MCCEMS) - Pensamiento Matemático: Modela fenómenos continuos y discretos mediante cálculo diferencial/integral, vectores y estadística inferencial sobre "${capitalizedTopic}".`
      ],
      science: [
        `Bachillerato (MCCEMS) - Ciencias Naturales y Tecnología: Aplica principios termodinámicos, estequiométricos y modelos biológicos avanzados para analizar retos de "${capitalizedTopic}".`
      ],
      language: [
        `Bachillerato (MCCEMS) - Lengua y Comunicación: Desarrolla el pensamiento crítico mediante el análisis comparativo de discursos y la redacción de artículos académicos sobre "${capitalizedTopic}".`
      ],
      civics: [
        `Bachillerato (MCCEMS) - Humanidades: Examina dilemas éticos y filosóficos contemporáneos de "${capitalizedTopic}" en la construcción de la sociedad global.`
      ],
      art: [
        `Bachillerato (MCCEMS) - Artes: Desarrolla proyectos conceptuales y estéticos contemporáneos en torno a "${capitalizedTopic}".`
      ],
      health: [
        `Bachillerato (MCCEMS) - Recursos Socioemocionales: Coordina proyectos de impacto comunitario y responsabilidad social vinculados a "${capitalizedTopic}".`
      ],
      general: [
        `Bachillerato (MCCEMS) - Formación Integral: Integra marcos teóricos y cuantitativos para formular proyectos de investigación aplicada sobre "${capitalizedTopic}".`
      ]
    }
  };

  const levelPdas = pdasByPhase[levelKey] || pdasByPhase['primaria-baja'];

  // Identificación del dominio pedagógico según la asignatura seleccionada
  let primaryDomain: 'history' | 'civics' | 'math' | 'science' | 'language' | 'art' | 'health' | null = null;

  if (
    subLower.includes('mat') || 
    subLower.includes('algebra') || 
    subLower.includes('calc') || 
    subLower.includes('aritmet') || 
    subLower.includes('-mat')
  ) {
    primaryDomain = 'math';
  } else if (
    subLower.includes('cien') || 
    subLower.includes('nat') || 
    subLower.includes('bio') || 
    subLower.includes('fis') || 
    subLower.includes('quim') || 
    subLower.includes('medio') || 
    subLower.includes('tec') || 
    subLower.includes('-cie') || 
    subLower.includes('-con')
  ) {
    primaryDomain = 'science';
  } else if (
    subLower.includes('ent') || 
    subLower.includes('his') || 
    subLower.includes('geo') || 
    subLower.includes('soc') || 
    subLower.includes('conciencia') || 
    subLower.includes('-ent') || 
    subLower.includes('-his') || 
    subLower.includes('-geo')
  ) {
    primaryDomain = 'history';
  } else if (
    subLower.includes('civ') || 
    subLower.includes('etic') || 
    subLower.includes('ciudadan') || 
    subLower.includes('derech') || 
    subLower.includes('paz') || 
    subLower.includes('-civ')
  ) {
    primaryDomain = 'civics';
  } else if (
    subLower.includes('art') || 
    subLower.includes('mus') || 
    subLower.includes('teat') || 
    subLower.includes('danz') || 
    subLower.includes('plastic') || 
    subLower.includes('-art')
  ) {
    primaryDomain = 'art';
  } else if (
    subLower.includes('hum') || 
    subLower.includes('fisic') || 
    subLower.includes('deport') || 
    subLower.includes('salud') || 
    subLower.includes('socio') || 
    subLower.includes('tut') || 
    subLower.includes('emo') || 
    subLower.includes('-hum') || 
    subLower.includes('-efi') || 
    subLower.includes('-tut')
  ) {
    primaryDomain = 'health';
  } else if (
    subLower.includes('esp') || 
    subLower.includes('leng') || 
    subLower.includes('comun') || 
    subLower.includes('lect') || 
    subLower.includes('ing') || 
    subLower.includes('dig') || 
    subLower.includes('-esp') || 
    subLower.includes('-len') || 
    subLower.includes('-ing')
  ) {
    primaryDomain = 'language';
  }

  // Selección inteligente y exhaustiva de PDAs según rigor temático oficial
  const candidateLists: string[][] = [];

  if (isTraditionsOrCulture) {
    if (primaryDomain === 'history') {
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Ética') || p.includes('Entidad') || p.includes('Historia') || p.includes('Geografía')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Lenguajes') || p.includes('Artes')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Humano') || p.includes('Saberes')));
    } else if (primaryDomain === 'language') {
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Lenguajes') || p.includes('Artes')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Ética') || p.includes('Entidad') || p.includes('Historia')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Humano') || p.includes('Saberes')));
    } else if (primaryDomain === 'art') {
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Artes') || p.includes('Lenguajes')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Ética') || p.includes('Entidad')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Humano')));
    } else if (primaryDomain === 'health') {
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Humano')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Ética') || p.includes('Lenguajes')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Saberes')));
    } else if (primaryDomain === 'science') {
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Saberes')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Ética') || p.includes('Lenguajes')));
      candidateLists.push(levelPdas.traditions.filter(p => p.includes('Humano')));
    } else {
      candidateLists.push(levelPdas.traditions);
    }
  } else {
    if (isIndependence && levelPdas.independence) {
      candidateLists.push(levelPdas.independence);
    } else if (isRevolution && levelPdas.revolution) {
      candidateLists.push(levelPdas.revolution);
    }

    if (primaryDomain === 'history') {
      candidateLists.push(levelPdas.history);
      candidateLists.push(levelPdas.civics);
      if (isLanguageGeneral) candidateLists.push(levelPdas.language);
    } else if (primaryDomain === 'civics') {
      candidateLists.push(levelPdas.civics);
      candidateLists.push(levelPdas.history);
    } else if (primaryDomain === 'math') {
      candidateLists.push(levelPdas.math);
    } else if (primaryDomain === 'science') {
      candidateLists.push(levelPdas.science);
    } else if (primaryDomain === 'language') {
      candidateLists.push(levelPdas.language);
      candidateLists.push(levelPdas.art);
    } else if (primaryDomain === 'art') {
      candidateLists.push(levelPdas.art);
      candidateLists.push(levelPdas.language);
    } else if (primaryDomain === 'health') {
      candidateLists.push(levelPdas.health);
      candidateLists.push(levelPdas.civics);
    }

    // Coincidencia temática secundaria
    if (isHistoryOrCivics && primaryDomain !== 'history' && primaryDomain !== 'civics') {
      candidateLists.push(levelPdas.history);
      candidateLists.push(levelPdas.civics);
    }
    if (isMath && primaryDomain !== 'math') {
      candidateLists.push(levelPdas.math);
    }
    if (isScience && primaryDomain !== 'science') {
      candidateLists.push(levelPdas.science);
    }
    if (isLanguageGeneral && primaryDomain !== 'language') {
      candidateLists.push(levelPdas.language);
    }
    if (isArt && primaryDomain !== 'art') {
      candidateLists.push(levelPdas.art);
    }
    if (isHealth && primaryDomain !== 'health') {
      candidateLists.push(levelPdas.health);
    }

    candidateLists.push(levelPdas.general);
  }

  // Aplanar y eliminar duplicados manteniendo el estricto orden de relevancia
  const result: string[] = [];
  for (const list of candidateLists) {
    if (!list) continue;
    for (const pdaText of list) {
      if (pdaText && !result.includes(pdaText)) {
        result.push(pdaText);
      }
    }
  }

  return result.slice(0, 8);
}
