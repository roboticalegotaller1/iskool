import { SchoolDigitalBook } from '@/types/schoolBooks';

export const INITIAL_SCHOOL_BOOKS_SEED: SchoolDigitalBook[] = [
  // =========================================================================
  // 1. UP JUAN JACOBO ROSSEAU (sch-jjrosseau)
  // =========================================================================
  {
    id: 'book-jjr-math-sec2',
    schoolId: 'sch-jjrosseau',
    schoolName: 'UP Juan Jacobo Rosseau',
    titulo: 'Matemáticas Aplicadas & Pensamiento Crítico 2º',
    autorEditorial: 'Academia de Ciencias Exactas Rosseau • Edición Institucional',
    materia: 'Matemáticas',
    nivelEducativo: 'secundaria',
    faseNEM: 'Fase 6',
    grado: '2º',
    isbn: '978-607-001-2026',
    cicloEscolar: '2025-2026',
    totalPaginas: 210,
    portadaColor: 'from-blue-600 to-indigo-800',
    archivoNombre: 'Matematicas_2_Secundaria_JJR.pdf',
    archivoTamanoMb: 14.8,
    fechaCarga: '2026-02-15T10:30:00Z',
    estadoMapeo: 'completo',
    palabrasClaveIndice: ['álgebra', 'ecuaciones lineales', 'sistemas de ecuaciones', 'geometría', 'teorema de pitágoras', 'probabilidad', 'porcentajes'],
    capitulos: [
      {
        id: 'cap-jjr-m2-1',
        numero: 1,
        titulo: 'Fundamentos del Lenguaje Algebraico y Ecuaciones Lineales',
        rangoPaginas: '12-28',
        paginaInicio: 12,
        paginaFin: 28,
        campoFormativo: 'Saberes y Pensamiento Científico',
        resumenTematico: 'Traducción del lenguaje común al lenguaje algebraico formal. Resolución de ecuaciones de primer grado ax + b = c y modelos de balanza aplicados a la economía familiar y compras cotidianas.',
        conceptosClave: ['Término algebraico', 'Coeficiente', 'Incógnita', 'Propiedad uniforme', 'Despeje'],
        preguntasDetonadoras: [
          '¿Cómo podemos representar matemáticamente una oferta de 2x1 en la tienda del colegio?',
          '¿De qué manera el equilibrio de una balanza demuestra la solución de una ecuación?'
        ],
        pdaRelacionados: [
          'Fase 6 - Resuelve ecuaciones lineales de la forma ax + b = c utilizando propiedades de la igualdad.',
          'Fase 6 - Modela situaciones de la vida cotidiana mediante expresiones algebraicas lineales.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-jjr-m2-1a',
            numero: 1,
            instruccion: 'Resuelve el taller de balanzas numéricas de la página 18 y grafica los resultados.',
            tipo: 'practica',
            paginaReferencia: 18
          },
          {
            id: 'ex-jjr-m2-1b',
            numero: 2,
            instruccion: 'Investigación comunitaria: redacta 3 problemas de costos de transporte y resuélvelos con ecuaciones.',
            tipo: 'proyecto',
            paginaReferencia: 24
          }
        ]
      },
      {
        id: 'cap-jjr-m2-2',
        numero: 2,
        titulo: 'Sistemas de Ecuaciones 2x2 y Métodos de Solución',
        rangoPaginas: '29-48',
        paginaInicio: 29,
        paginaFin: 48,
        campoFormativo: 'Saberes y Pensamiento Científico',
        resumenTematico: 'Estudio de sistemas lineales de dos ecuaciones con dos incógnitas por los métodos de suma y resta (reducción), sustitución e igualación, con comprobación geométrica.',
        conceptosClave: ['Sistema 2x2', 'Método de reducción', 'Método de sustitución', 'Punto de intersección', 'Solución simultánea'],
        preguntasDetonadoras: [
          '¿Por qué dos condiciones simultáneas permiten encontrar dos valores desconocidos?',
          '¿Qué significa gráficamente que dos rectas no se crucen nunca?'
        ],
        pdaRelacionados: [
          'Fase 6 - Modela y resuelve sistemas de dos ecuaciones lineales con dos incógnitas por métodos algebraicos.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-jjr-m2-2a',
            numero: 1,
            instruccion: 'Aplica el método de reducción a los ejercicios de optimización de costos en la página 37.',
            tipo: 'practica',
            paginaReferencia: 37
          }
        ]
      },
      {
        id: 'cap-jjr-m2-3',
        numero: 3,
        titulo: 'Teorema de Pitágoras y Aplicaciones en el Entorno Urbano',
        rangoPaginas: '49-70',
        paginaInicio: 49,
        paginaFin: 70,
        campoFormativo: 'Saberes y Pensamiento Científico',
        resumenTematico: 'Demostración geométrica del Teorema de Pitágoras en triángulos rectángulos. Cálculo de hipotenusas y catetos aplicados a rampas de accesibilidad y diseño arquitectónico escolar.',
        conceptosClave: ['Triángulo rectángulo', 'Hipotenusa', 'Catetos', 'Área de cuadrados adyacentes', 'Accesibilidad universal'],
        preguntasDetonadoras: [
          '¿Cómo utilizar el teorema de Pitágoras para comprobar si una rampa escolar cumple con la pendiente oficial?',
          '¿Cómo medían las distancias los constructores prehispánicos sin herramientas digitales?'
        ],
        pdaRelacionados: [
          'Fase 6 - Formula, justifica y usa el teorema de Pitágoras al resolver problemas.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-jjr-m2-3a',
            numero: 1,
            instruccion: 'Mide la diagonal del patio cívico y calcula la hipotenusa teórica siguiendo la guía de la página 62.',
            tipo: 'proyecto',
            paginaReferencia: 62
          }
        ]
      }
    ]
  },
  {
    id: 'book-jjr-bio-sec1',
    schoolId: 'sch-jjrosseau',
    schoolName: 'UP Juan Jacobo Rosseau',
    titulo: 'Biología Celular & Ecosistemas Vivos 1º',
    autorEditorial: 'Consejo Pedagógico Rosseau • Textos de Investigación Escolar',
    materia: 'Ciencias',
    nivelEducativo: 'secundaria',
    faseNEM: 'Fase 6',
    grado: '1º',
    isbn: '978-607-002-2026',
    cicloEscolar: '2025-2026',
    totalPaginas: 185,
    portadaColor: 'from-emerald-600 to-teal-800',
    archivoNombre: 'Biologia_Celular_Ecosistemas_1Sec_JJR.pdf',
    archivoTamanoMb: 18.2,
    fechaCarga: '2026-02-18T14:10:00Z',
    estadoMapeo: 'completo',
    palabrasClaveIndice: ['célula animal', 'célula vegetal', 'fotosíntesis', 'biodiversidad', 'cadenas tróficas', 'microscopio', 'genética básica'],
    capitulos: [
      {
        id: 'cap-jjr-b1-1',
        numero: 1,
        titulo: 'La Célula como Unidad Estructural y Funcional de los Seres Vivos',
        rangoPaginas: '10-32',
        paginaInicio: 10,
        paginaFin: 32,
        campoFormativo: 'Saberes y Pensamiento Científico',
        resumenTematico: 'Estructura celular básica procariota y eucariota. Diferenciación morfológica entre célula animal y vegetal, organelos principales (núcleo, mitocondria, cloroplasto) y técnicas de microscopía óptica.',
        conceptosClave: ['Membrana plasmática', 'Núcleo celular', 'Mitocondria', 'Cloroplastos', 'Pared celular', 'Citoplasma'],
        preguntasDetonadoras: [
          '¿Por qué decimos que la célula es el ladrillo fundamental de la vida?',
          '¿Qué sucedería con una planta si sus células perdieran la pared de celulosa?'
        ],
        pdaRelacionados: [
          'Fase 6 - Compara las características comunes de los seres vivos y reconoce que todos están formados por células.',
          'Fase 6 - Identifica las funciones vitales de la célula y su relación con la salud.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-jjr-b1-1a',
            numero: 1,
            instruccion: 'Elabora un mapa conceptual comparativo de organelos celulares según la tabla de la página 22.',
            tipo: 'practica',
            paginaReferencia: 22
          }
        ]
      },
      {
        id: 'cap-jjr-b1-2',
        numero: 2,
        titulo: 'Biodiversidad Mexicana y Conservación de Redes Tróficas',
        rangoPaginas: '33-58',
        paginaInicio: 33,
        paginaFin: 58,
        campoFormativo: 'Ética, Naturaleza y Sociedades',
        resumenTematico: 'Análisis de la megadiversidad biológica de México. Flujo de energía en cadenas y redes tróficas, productores primarios, consumidores y el impacto de especies invasoras en ecosistemas locales.',
        conceptosClave: ['Megadiversidad', 'Red trófica', 'Nivel trófico', 'Biomasa', 'Especie endémica'],
        preguntasDetonadoras: [
          '¿Por qué México es considerado uno de los 12 países megadiversos del planeta?',
          '¿Qué ocurre en una red alimentaria cuando desaparece un depredador tope?'
        ],
        pdaRelacionados: [
          'Fase 6 - Analiza el flujo de materia y energía en los ecosistemas y valora la megadiversidad de México.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-jjr-b1-2a',
            numero: 1,
            instruccion: 'Diseña una red trófica de la Cuenca del Valle de México siguiendo la guía de campo de la página 45.',
            tipo: 'investigacion',
            paginaReferencia: 45
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. LABORATORIO PEDAGÓGICO & TEST CASES (sch-test-case)
  // =========================================================================
  {
    id: 'book-test-english-b1',
    schoolId: 'sch-test-case',
    schoolName: 'Laboratorio Pedagógico & Test Cases',
    titulo: 'English Explorer & Grammar Mastery B1',
    autorEditorial: 'Cambridge & PRONI Integration • ISkool Academic Publishing',
    materia: 'Inglés',
    nivelEducativo: 'secundaria',
    faseNEM: 'Fase 6',
    grado: '2º',
    isbn: '978-607-003-2026',
    cicloEscolar: '2025-2026',
    totalPaginas: 175,
    portadaColor: 'from-purple-600 to-pink-700',
    archivoNombre: 'English_Explorer_B1_Grammar_Mastery.pdf',
    archivoTamanoMb: 12.5,
    fechaCarga: '2026-02-20T09:00:00Z',
    estadoMapeo: 'completo',
    palabrasClaveIndice: ['verbs', 'present simple', 'past simple', 'irregular verbs', 'daily routines', 'communicative competence', 'listening', 'pronunciation'],
    capitulos: [
      {
        id: 'cap-test-eng-1',
        numero: 1,
        titulo: 'Mastering Action Verbs & Daily Routines in the Present Simple',
        rangoPaginas: '14-30',
        paginaInicio: 14,
        paginaFin: 30,
        campoFormativo: 'Lenguajes',
        resumenTematico: 'Complete guide to English regular and irregular verbs. Third person singular rules (-s, -es, -ies), auxiliary verb "do/does", time adverbs of frequency, and communicative fluency in everyday school situations.',
        conceptosClave: ['Action verbs', 'Present simple', 'Third person singular', 'Adverbs of frequency', 'Daily routines', 'Auxiliary verbs'],
        preguntasDetonadoras: [
          'How do you describe your morning routine before arriving at school using dynamic action verbs?',
          'What happens phonetically to verbs ending in -ch, -sh, -x when we talk about he/she/it?'
        ],
        pdaRelacionados: [
          'Fase 6 - Emplea el presente simple en inglés para describir rutinas personales y escolares con precisión gramatical.',
          'Fase 6 - Participa en intercambios comunicativos breves utilizando vocabulario de acción cotidiana.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-test-eng-1a',
            numero: 1,
            instruccion: 'Complete the Verb Conjugation Chart on page 20 with 15 common action verbs and write 5 sentences.',
            tipo: 'practica',
            paginaReferencia: 20
          },
          {
            id: 'ex-test-eng-1b',
            numero: 2,
            instruccion: 'Role-play in pairs: Interview your classmate about their weekend hobbies following the dialogue on page 26.',
            tipo: 'proyecto',
            paginaReferencia: 26
          }
        ]
      },
      {
        id: 'cap-test-eng-2',
        numero: 2,
        titulo: 'Narrating Past Events: Regular & Irregular Verbs in Simple Past',
        rangoPaginas: '31-52',
        paginaInicio: 31,
        paginaFin: 52,
        campoFormativo: 'Lenguajes',
        resumenTematico: 'Formation of Simple Past tense. Pronunciation rules for -ed endings (/t/, /d/, /id/). Top 50 irregular verbs list, negative and interrogative structures using "did/didn\'t".',
        conceptosClave: ['Past simple', 'Regular verbs', 'Irregular verbs', 'Pronunciation of -ed', 'Time markers (yesterday, last week)'],
        preguntasDetonadoras: [
          'How do we distinguish between regular past endings that sound like /t/ versus /id/?',
          'What historical anecdote can you narrate in English using at least five irregular verbs?'
        ],
        pdaRelacionados: [
          'Fase 6 - Relata sucesos significados del pasado utilizando verbos regulares e irregulares en lengua inglesa.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-test-eng-2a',
            numero: 1,
            instruccion: 'Listen to the audio track and classify the -ed verb sounds into the phonetic grid on page 38.',
            tipo: 'practica',
            paginaReferencia: 38
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. COLEGIO ANGLO MEXICANO (sch-anglo-mexicano)
  // =========================================================================
  {
    id: 'book-anglo-cambridge-a2',
    schoolId: 'sch-anglo-mexicano',
    schoolName: 'Colegio Anglo Mexicano',
    titulo: 'Cambridge Young Explorers A2 • English Reader & Workbook',
    autorEditorial: 'Anglo Mexican Educational Press • Cambridge CEFR Alignment',
    materia: 'Inglés',
    nivelEducativo: 'primaria_alta',
    faseNEM: 'Fase 5',
    grado: '5º',
    isbn: '978-607-004-2026',
    cicloEscolar: '2025-2026',
    totalPaginas: 160,
    portadaColor: 'from-amber-500 to-orange-700',
    archivoNombre: 'Cambridge_Young_Explorers_A2_Anglo.pdf',
    archivoTamanoMb: 11.2,
    fechaCarga: '2026-02-12T11:20:00Z',
    estadoMapeo: 'completo',
    palabrasClaveIndice: ['cambridge a2', 'phonics', 'verbs', 'community life', 'storytelling', 'vocabulary', 'present continuous'],
    capitulos: [
      {
        id: 'cap-anglo-eng-1',
        numero: 1,
        titulo: 'Actions in Progress: Present Continuous & Community Help',
        rangoPaginas: '10-26',
        paginaInicio: 10,
        paginaFin: 26,
        campoFormativo: 'Lenguajes',
        resumenTematico: 'Use of verb to be + gerund (-ing) to describe actions happening right now. Focus on volunteer work, community recycling, and helping neighbors.',
        conceptosClave: ['Present continuous', 'Action verbs with -ing', 'Verb to be', 'Spelling double consonant rules'],
        preguntasDetonadoras: [
          'What are your family members doing right now at home? Describe it in English.',
          'How can we help clean our school garden while speaking English with action verbs?'
        ],
        pdaRelacionados: [
          'Fase 5 - Expresa acciones simultáneas en presente continuo en lengua inglesa para describir el trabajo comunitario.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-anglo-eng-1a',
            numero: 1,
            instruccion: 'Complete the comic strip on page 19 with present continuous speech bubbles.',
            tipo: 'proyecto',
            paginaReferencia: 19
          }
        ]
      }
    ]
  },
  {
    id: 'book-anglo-lengua-sec1',
    schoolId: 'sch-anglo-mexicano',
    schoolName: 'Colegio Anglo Mexicano',
    titulo: 'Lengua Materna & Creación Literaria Contemporánea 1º',
    autorEditorial: 'Claustro de Letras Anglo Mexicano • Biblioteca de Aula',
    materia: 'Español',
    nivelEducativo: 'secundaria',
    faseNEM: 'Fase 6',
    grado: '1º',
    isbn: '978-607-005-2026',
    cicloEscolar: '2025-2026',
    totalPaginas: 190,
    portadaColor: 'from-rose-600 to-red-800',
    archivoNombre: 'Lengua_Materna_Creacion_Literaria_1Sec_Anglo.pdf',
    archivoTamanoMb: 15.6,
    fechaCarga: '2026-02-14T16:00:00Z',
    estadoMapeo: 'completo',
    palabrasClaveIndice: ['comprensión lectora', 'géneros narrativos', 'figuras retóricas', 'ensayo breve', 'ortografía', 'argumentación'],
    capitulos: [
      {
        id: 'cap-anglo-esp-1',
        numero: 1,
        titulo: 'El Cuento Latinoamericano y la Estructura de la Tensión Narrativa',
        rangoPaginas: '15-38',
        paginaInicio: 15,
        paginaFin: 38,
        campoFormativo: 'Lenguajes',
        resumenTematico: 'Análisis de elementos del relato breve: narrador omnisciente vs testigo, clímax narrativo, conflicto dramático y caracterización psicológica de personajes en autores hispanohablantes.',
        conceptosClave: ['Narrador', 'Conflicto', 'Clímax', 'Giro argumental', 'Atmósfera'],
        preguntasDetonadoras: [
          '¿Qué diferencia a un final abierto de un desenlace cerrado en un relato de misterio?',
          '¿Cómo influye la voz del narrador en lo que el lector cree o duda de la historia?'
        ],
        pdaRelacionados: [
          'Fase 6 - Analiza recursos literarios en cuentos y novelas para interpretar el sentido global de una obra narrativa.'
        ],
        ejerciciosPropuestos: [
          {
            id: 'ex-anglo-esp-1a',
            numero: 1,
            instruccion: 'Escribe un relato breve de 300 palabras aplicando el giro argumental explicado en la página 28.',
            tipo: 'proyecto',
            paginaReferencia: 28
          }
        ]
      }
    ]
  }
];
