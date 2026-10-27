// src/lib/redisenosComprehensiveData.ts
// Especificación técnica forense completa de los 10 Rediseños Gamificados de ISkool
// Dirigido a Dirección General / CEO Educativo, Inversionistas y Comités Pedagógicos.
// Cero placeholders; extraído e indexado al 100% desde la Bóveda Curricular y documentos maestros.

export interface TechnicalChallenge {
  challenge: string;
  severity: 'Alta' | 'Media' | 'Baja';
  solution: string;
}

export interface GlobalBenchmark {
  name: string;
  origin: string;
  description: string;
  iskoolAdvantage: string;
}

export interface RedesignExecutiveSpec {
  key: string;
  title: string;
  level: string;
  ages: string;
  liveDemoUrl: string;
  tagline: string;
  worldBenchmarkSummary: string;
  hubImage: string;
  quizImage: string;
  avatarImage: string;

  // 1. Identidad Visual y Concepto de Juego
  identity: {
    educationalLevel: string;
    gameMetaphor: string;
    coreLevelMechanic: string;
  };

  // 2. Vistas y Pantallas Detalladas
  screens: {
    hub: {
      title: string;
      visualStructure: string;
      keyComponents: string[];
    };
    quiz: {
      title: string;
      mechanic: string;
      optionsStyle: string;
      positiveReinforcement: string;
      errorPedagogy: string;
    };
    avatar: {
      title: string;
      customizationFeatures: string[];
      economyModel: string;
      gameplayIntegration: string;
    };
    teacherStudio: {
      title: string;
      flowSteps: string[];
      polymorphicOutput: string;
    };
  };

  // 3. Integración con el Ecosistema ISkool
  iskoolIntegration: {
    storeConnection: string;
    vaultIntegration: string;
    historicalAvatarsFirstPerson: string;
  };

  // 4. Desafíos Técnicos de Implementación y Soluciones
  technicalChallenges: TechnicalChallenge[];

  // 5. Estimación de Tiempos y Capacitación Docente
  trainingAndAdoption: {
    trainingHours: string;
    learningCurve: string;
    parentAdoption: string;
  };

  // 6. Viabilidad e Integración Cloud Institucional
  cloudViability: {
    ssoAuth: string;
    cloudStorage: string;
    classroomIntegration: string;
  };

  // 7. Benchmarks Mundiales y Ventaja Exclusiva
  globalBenchmarks: GlobalBenchmark[];
}

export const REDESIGNS_EXECUTIVE_SPECS: Record<string, RedesignExecutiveSpec> = {
  '01': {
    key: '01',
    title: '01 Preescolar · El Reino de las Huellitas',
    level: 'Preescolar (Fase 2 SEP)',
    ages: '3 a 5 Años',
    liveDemoUrl: '/redisenos_gamificados/el_reino_de_las_huellitas',
    tagline: 'Santuario táctil de plastilina con navegación 100% por voz y pedagogía del error amable',
    worldBenchmarkSummary: 'Khan Academy Kids (EE.UU.) & Toca Boca World (Suecia)',
    hubImage: '/redisenos_assets/gamification_preescolar_huellitas_1792732717441.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preescolar_gameplay_1792734559505.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_preescolar_customizer_1792734577407.jpg',

    identity: {
      educationalLevel: 'Preescolar (Fase 2 SEP · Alumnos de 3 a 5 años)',
      gameMetaphor: 'Una granja mágica y santuario interactivo donde cada niño cuida a una pequeña criatura (zorrito, panda, conejito, dragón bebé) modelada en estilo claymation (plastilina táctil) y texturas de fieltro cálido.',
      coreLevelMechanic: 'Cero necesidad de lectoescritura obligatoria. Toda la navegación, pistas y felicitaciones se ejecutan mediante el Motor de IA Pedagógica por Voz y sonidos binaurales reconfortantes. Cada actividad completada nutre y hace crecer al santuario del alumno.'
    },

    screens: {
      hub: {
        title: 'Hub de Aventura: La Pradera de Plastilina',
        visualStructure: 'Entorno soleado en 2.5D con árboles de plastilina, casitas de madera y arcoíris luminoso.',
        keyComponents: [
          'Avatar Central Vivo: El dragón verde saluda con voz real ("¡Hola, vamos a jugar!") al tocar la pantalla.',
          'Senderos de Huellas de Colores: Cada sendero representa un Campo Formativo de la NEM (Huellas Verdes: Ética y Naturaleza; Amarillas: Saberes y Ciencias; Azules: Lenguajes).',
          'Mi Arcoíris de Logros: Barra de progreso dinámico (65% / 7 de 10 estrellas) que conduce al castillo mágico.',
          'Colección de Huellitas: Álbum de pegatinas desbloqueables (Osezno, Estrellita, Arbolito, Búho Sabio).'
        ]
      },
      quiz: {
        title: 'Videojuego de Preguntas & Desafío Lúdico: Alimentar al Amiguito',
        mechanic: 'El animalito tiene hambre o necesita cruzar un puente. El sistema formula la pregunta con audio natural en español: "¿Cuál es la fruta roja?" o "¿Qué objeto tiene forma de círculo?".',
        optionsStyle: 'Tres botones gigantes acolchados con textura de plastilina y madera que rebotan con física háptica suave al ser tocados (88x88px mínimo).',
        positiveReinforcement: 'Al acertar, llueven estrellitas de confeti 3D, el zorrito da una voltereta alegre y se añade una Estrella de Sabiduría a la alcancía del alumno.',
        errorPedagogy: 'Pedagogía del error amable: Si el alumno elige la opción incorrecta, el botón tiembla suavemente con una risita dulce y el asistente sugiere: "¡Casi! Prueba tocar el que parece una manzana roja", sin restar vidas ni generar frustración.'
      },
      avatar: {
        title: 'Vestidor y Personalizador: ¡Crea tu Compañero!',
        customizationFeatures: [
          'Selección de compañero (Panda de peluche en pedestal de madera, Zorrito, Osezno o Dragón Bebé).',
          'Bandeja de accesorios: Gorrito de fiesta con pompones, Gorra de detective, Bufanda multicolor, Alas de mariposa y Cascabeles musicales.',
          'Selector de sombreros temáticos: Gorro de osito, Corona real dorada, Gorro de chef blanco y Gorro de dinosaurio verde.'
        ],
        economyModel: 'Economía virtual protegida sin dinero real: Los accesorios se desbloquean con Estrellitas de Sabiduría ganadas resolviendo retos pedagógicos.',
        gameplayIntegration: 'Al presionar "¡JUGAR!", el compañero luce inmediatamente su atuendo en el mapa principal y acompaña al alumno en todas las actividades.'
      },
      teacherStudio: {
        title: 'Módulo Universal del Profesor (Universal Challenge Studio)',
        flowSteps: [
          'La educadora redacta una pregunta sencilla o selecciona un PDA de la Bóveda Curricular (e.g. PDA Preescolar 2: Reconoce figuras geométricas y colores primarios).',
          'El Motor de IA Pedagógica autogenera las 3 opciones visuales táctiles y la narración oral.',
          'En el panel de vista previa polimórfica, la docente visualiza cómo se renderiza exactamente en la pantalla del niño.',
          'Con 1 solo clic ("Asignar al Grupo"), el reto llega a todos los alumnos adaptado a su interfaz.'
        ],
        polymorphicOutput: 'Transfigura reactivos formales en minijuegos de plastilina táctil con voz en <3 segundos.'
      }
    },

    iskoolIntegration: {
      storeConnection: 'Cada acierto actualiza la clave stars y experiencePoints del almacén de estado Zustand (useStudentStore), manteniendo intacto el esquema de datos central.',
      vaultIntegration: 'Los proyectos de exploración sensorial se indexan en Markdown con tags frontmatter fase: 2, grado: preescolar dentro de la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Próceres y personajes históricos aparecen como "Héroes Sabios de Cuento" que narran historias orales en estricta primera persona ("Nací en una hermosa hacienda y me gustaba observar el cielo...").'
    },

    technicalChallenges: [
      {
        challenge: 'Sintetizador de Voz (TTS) de Baja Latencia para Tablets',
        severity: 'Media',
        solution: 'Caché de audios pre-renderizados en memoria mediante Web Audio API y Web Speech API en español neutro (es-MX) a cadencia 0.85x.'
      },
      {
        challenge: 'Manejo Táctil y Falsos Toques en Dispositivos Móviles',
        severity: 'Alta',
        solution: 'Debouncing táctil de 350ms y áreas de impacto (hitboxes) de al menos 88x88px por botón para evitar toques accidentales con la palma.'
      },
      {
        challenge: 'Rendimiento de Texturas de Plastilina 3D en Equipos Escolares',
        severity: 'Media',
        solution: 'Activos optimizados y comprimidos bajo 100KB en WebP con animaciones vectoriales ligeras en Framer Motion.'
      }
    ],

    trainingAndAdoption: {
      trainingHours: '4 a 6 horas totales divididas en 2 talleres prácticos interactivos.',
      learningCurve: 'Menos de 15 minutos para que una educadora configure y publique su primer minijuego interactivo.',
      parentAdoption: 'Portal familiar de visualización que traduce las estrellas en competencias formativas de lenguaje y motricidad.'
    },

    cloudViability: {
      ssoAuth: 'Inicio de sesión biométrico o mediante "Código de Imagen / QR de Aula" vinculado al Google Workspace institucional del colegio sin teclear correos complejos.',
      cloudStorage: 'Evidencias de audio y dibujos comprimidos obligatoriamente (WebP/JPEG <300KB) directo a Google Drive institucional.',
      classroomIntegration: 'Sincronización silenciosa de insignias hacia Google Classroom en la carpeta oficial del grupo.'
    },

    globalBenchmarks: [
      {
        name: 'Khan Academy Kids',
        origin: 'Estados Unidos',
        description: 'Pionero en acompañamiento emocional sin calificaciones punitivas numéricas.',
        iskoolAdvantage: 'ISkool añade síntesis de voz en español mexicano y alineación curricular directa con los campos formativos de la NEM.'
      },
      {
        name: 'Toca Boca World',
        origin: 'Suecia',
        description: 'Referente mundial en físicas táctiles blandas y exploración lúdica libre.',
        iskoolAdvantage: 'ISkool vincula la física de plastilina a la evaluación formativa y al portafolio oficial del colegio.'
      }
    ]
  },

  '02': {
    key: '02',
    title: '02 Preescolar · La Isla de los Juguetes Mágicos',
    level: 'Preescolar (Fase 2 SEP)',
    ages: '3 a 5 Años',
    liveDemoUrl: '/redisenos_gamificados/la_isla_de_los_juguetes_magicos',
    tagline: 'Maqueta voxel tridimensional con bloques de construcción espacial y compañeros mecánicos',
    worldBenchmarkSummary: 'LEGO DUPLO World (Dinamarca) & Nintendo Yoshi Crafted World (Japón)',
    hubImage: '/redisenos_assets/gamification_preescolar_isla_magica_1792732740102.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preescolar_gameplay_1792734559505.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_preescolar_customizer_1792734577407.jpg',
    identity: {
      educationalLevel: 'Preescolar (Fase 2 SEP · 3 a 5 años)',
      gameMetaphor: 'Una maqueta flotante isométrica de juguetes vivientes y bloques de madera colorida donde cada respuesta correcta construye puentes, faros y castillos.',
      coreLevelMechanic: 'Desarrollo de pensamiento espacial y seriación. El alumno arrastra y toca bloques volumétricos para desbloquear islas temáticas.'
    },
    screens: {
      hub: {
        title: 'Hub Voxel: El Archipiélago de Juguete',
        visualStructure: 'Isla tridimensional isométrica con molinos de viento, pistas de trenes y bloques de madera.',
        keyComponents: ['Tren de Letras', 'Torre de Bloques Numéricos', 'Compañero Robot de Cuerda', 'Faro de la Sabiduría']
      },
      quiz: {
        title: 'Desafío Espacial: Construcción de Secuencias',
        mechanic: 'El tren de madera necesita un puente para avanzar. El alumno debe colocar el bloque con la forma y color que falta en la secuencia.',
        optionsStyle: 'Piezas de madera 3D táctiles con relieves y sombras dinámicas.',
        positiveReinforcement: 'El tren avanza tocando su silbato alegremente con música orquestal de xilófono.',
        errorPedagogy: 'La pieza no encaja con sonido suave de madera y el robot asistente ofrece una pista visual luminosa.'
      },
      avatar: {
        title: 'Taller de Juguetes: Diseña tu Robot Mecatrónico',
        customizationFeatures: ['Chasis de madera', 'Ruedas de tren', 'Hélices de colores', 'Antenas luminosas'],
        economyModel: 'Piezas doradas ganadas por constancia motriz.',
        gameplayIntegration: 'El robot acompaña el recorrido del tren y celebra cada acierto.'
      },
      teacherStudio: {
        title: 'Universal Studio para Constructores',
        flowSteps: ['Seleccionar reto de seriación o clasificación', 'Previsualización del puente voxel', 'Asignación inmediata'],
        polymorphicOutput: 'Renderizado isométrico de alta eficiencia en WebGL/Three.js.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Sincronización de progreso y bloques ganados en useStudentStore.',
      vaultIntegration: 'Nodos de psicomotricidad y seriación vinculados en Markdown en la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Héroes nacionales presentados como juguetes ilustres en primera persona rigurosa.'
    },
    technicalChallenges: [
      { challenge: 'Renderizado Isométrico 3D Fluido en Navegador', severity: 'Media', solution: 'Canvas 2D optimizado con efectos de profundidad y sombras pre-computadas.' },
      { challenge: 'Sensibilidad de Arrastre Táctil', severity: 'Media', solution: 'Áreas magnéticas de ajuste automático (snapping) para dedos pequeños.' }
    ],
    trainingAndAdoption: {
      trainingHours: '4 horas prácticas.',
      learningCurve: '10 minutos para publicar un reto de secuencias.',
      parentAdoption: 'Seguimiento visual de coordinación motriz fina.'
    },
    cloudViability: {
      ssoAuth: 'Acceso por código QR institucional.',
      cloudStorage: 'Almacenamiento de maquetas en Google Drive.',
      classroomIntegration: 'Reporte automático de tareas en Classroom.'
    },
    globalBenchmarks: [
      { name: 'LEGO DUPLO World', origin: 'Dinamarca', description: 'Referente en bloques táctiles de aprendizaje inicial.', iskoolAdvantage: 'Integración curricular completa y cero compras dentro de la app.' }
    ]
  },

  '03': {
    key: '03',
    title: '03 Primaria Baja · Academia de Guardianes Elementales',
    level: '1º a 3º de Primaria (Fases 3 y 4 SEP)',
    ages: '6 a 8 Años',
    liveDemoUrl: '/redisenos_gamificados/Guardianes_Elementales',
    tagline: 'Saga de rol al estilo Nintendo con mapa Overworld y combate didáctico de hechizos',
    worldBenchmarkSummary: 'Prodigy Math Game (Canadá) & Super Mario RPG (Japón)',
    hubImage: '/redisenos_assets/gamification_primaria_baja_guardianes_1792732757751.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_baja_battle_1792734597009.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '1º a 3º de Primaria (Fases 3 y 4 SEP · 6 a 8 años)',
      gameMetaphor: 'Una academia mágica de aprendices de magos donde las matemáticas, la lectura y las ciencias son hechizos arcanos para purificar a las criaturas del bosque.',
      coreLevelMechanic: 'Combate didáctico por turnos. El cálculo rápido y la comprensión lectora determinan la potencia mágica y combos de impacto.'
    },
    screens: {
      hub: {
        title: 'Overworld: Los 4 Reinos Elementales',
        visualStructure: 'Mapa sinuoso 2D con biomas de Fuego, Agua, Tierra y Viento.',
        keyComponents: ['Torre de los Saberes', 'Sendero de Desafíos Semanales', 'Mascota Fénix Evolutiva', 'Cofres de Racha']
      },
      quiz: {
        title: 'Arena Didáctica: Duelo con Silvanus, The Forest Golem',
        mechanic: 'Para lanzar el Hechizo de Luz, el alumno resuelve 24 ÷ 4 o una pregunta de comprensión de texto.',
        optionsStyle: 'Runas mágicas luminosas con selector de maná.',
        positiveReinforcement: 'Animación de ataque mágico, impacto crítico en el jefe y lluvia de gemas arcanas.',
        errorPedagogy: 'El hechizo se desvanece suavemente y el báculo elemental muestra una pista matemática guiada.'
      },
      avatar: {
        title: 'Guardarropa del Mago Chibi',
        customizationFeatures: ['Capas de fuego', 'Báculos de cristal', 'Mascotas míticas (Fénix, Grifo)', 'Títulos de honor'],
        economyModel: 'Monedas de oro y gemas de sabiduría ganadas en clase.',
        gameplayIntegration: 'Los atuendos otorgan bonificaciones estéticas en las batallas del aula.'
      },
      teacherStudio: {
        title: 'Universal Studio RPG',
        flowSteps: ['Crear reactivo aritmético o de lectura', 'Asignar nivel de dificultad y puntos de maná', 'Publicar a la clase'],
        polymorphicOutput: 'Conversión inmediata en encuentro de rol con jefe didáctico.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración completa con useGamificationStore y useStudentStore.',
      vaultIntegration: 'Archivos Markdown de planeaciones didácticas de Fase 3 y 4 vinculadas en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Próceres de la Independencia como mentores arcanos hablando en primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Balance de Daño y Tiempos de Turno en Aula', severity: 'Media', solution: 'Algoritmo de calibración adaptativa que ajusta la vida del jefe al tamaño del grupo.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas totales.',
      learningCurve: '20 minutos para programar un torneo escolar.',
      parentAdoption: 'Dashboard de dominio de tablas de multiplicar y lectura fluida.'
    },
    cloudViability: {
      ssoAuth: 'Google Workspace institucional con cuentas de alumno.',
      cloudStorage: 'Capturas de batalla y reportes directo a Drive.',
      classroomIntegration: 'Calificaciones formativas enviadas a Google Classroom.'
    },
    globalBenchmarks: [
      { name: 'Prodigy Math Game', origin: 'Canadá', description: 'El referente mundial de batallas de rol matemáticas.', iskoolAdvantage: 'ISkool cubre todas las materias oficiales mexicanas sin suscripciones individuales a padres.' }
    ]
  },

  '04': {
    key: '04',
    title: '04 Primaria Baja · El Libro de Aventuras & Álbum',
    level: '1º a 3º de Primaria (Fases 3 y 4 SEP)',
    ages: '6 a 8 Años',
    liveDemoUrl: '/redisenos_gamificados/El_Libro_de_aventuras_y_album',
    tagline: 'Grimorio de pergamino con sobres de estampas holográficas coleccionables e intercambio de aula',
    worldBenchmarkSummary: 'Animal Crossing Museum (Japón), Álbum Panini Didáctico & Kahoot Kids',
    hubImage: '/redisenos_assets/gamification_primaria_baja_libro_aventura_1792732777656.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_baja_battle_1792734597009.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '1º a 3º de Primaria (Fases 3 y 4 SEP · 6 a 8 años)',
      gameMetaphor: 'Un gran grimorio encuadernado en cuero y oro donde cada materia escolar es un "Capítulo Iluminado" y cada logro desbloquea sobres de estampas coleccionables holográficas.',
      coreLevelMechanic: 'Fomentar el hábito de lectura y resolución diaria mediante la emoción del coleccionismo físico-digital (estilo álbum Panini interactivo con brillo cromado y efectos de sonido al despegar y pegar estampas).'
    },
    screens: {
      hub: {
        title: 'El Gran Grimorio Escolar (Hub de Aventura)',
        visualStructure: 'Vista de libro abierto con textura de pergamino iluminado y animaciones de páginas que pasan en 3D.',
        keyComponents: [
          'Índice de Capítulos: Capítulo 1: El Reino de las Fracciones, Capítulo 2: Los Secretos de la Naturaleza, Capítulo 3: Héroes de la Historia.',
          'Sobres de Estampas Pendientes de Abrir: Con animación de rasgado que revela estampas comunes, raras y legendarias de oro.',
          'Contador de Páginas Completadas: Barra de progreso que otorga un trofeo de salón al llenar un capítulo completo.',
          'Compañero Mascota Pip con medidor de felicidad (85%) y reacciones hápticas táctiles.'
        ]
      },
      quiz: {
        title: 'Videojuego de Preguntas & Desafío Lúdico (El Acertijo del Grimorio / Arena Gólem)',
        mechanic: 'El libro plantea un acertijo interactivo o combate didáctico. Al responder correctamente 5 preguntas consecutivas, el alumno gana un "Sobre Dorado de Estampas" y derrota al Gólem del Bosque.',
        optionsStyle: 'Gemas elementales táctiles (Púrpura, Esmeralda, Rubí, Zafiro) con selector de maná y cálculo mental sin estrés.',
        positiveReinforcement: 'Animación de ataque mágico luminoso, caída del jefe, fanfarria de nivel, lluvia de confeti 3D y gemas estelares.',
        errorPedagogy: 'La pluma mágica sugiere releer la pista o repasar las tablas de multiplicar guiadas sin penalización punitiva.'
      },
      avatar: {
        title: 'Álbum de Estampas & Personalización del Estudiante',
        customizationFeatures: [
          'Interacción táctil de pegar estampas arrastrándolas hacia su silueta en la página del libro.',
          'Estampas que cobran vida con animación 3D y narran un dato curioso curricular al completarse.',
          'Mesa de intercambio ("Feria de Saberes") para canjear cromos duplicados con compañeros de aula.',
          'Guardarropa de explorador estelar con capas místicas, báculos y mascotas mágicas.'
        ],
        economyModel: 'Economía protegida basada en mérito lector y constancia: 1,250 monedas ganadas por misiones familiares y lectura diaria.',
        gameplayIntegration: 'Visualización inmediata de atuendos y mascotas en el Hub principal y salón escolar.'
      },
      teacherStudio: {
        title: 'Módulo Universal del Profesor (Universal Challenge Studio)',
        flowSteps: [
          'El profesor programa qué estampas se liberan en cada semana según el calendario de planeación bimestral registrado en la Bóveda Curricular.',
          'Genera reactivos de comprensión lectora y cálculo mental con autocompletado pedagógico de la NEM.',
          'Previsualización en tiempo real de cómo luce el capítulo en la pantalla del alumno.'
        ],
        polymorphicOutput: 'Capítulo interactivo listo para aplicación digital o exportación a PDF didáctico.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Registro de cromos desbloqueados y monedas en useStudentStore y useGamificationStore.',
      vaultIntegration: 'Cada estampa del álbum contiene en sus metadatos el enlace directo al nodo Markdown de la Bóveda Curricular correspondiente.',
      historicalAvatarsFirstPerson: 'Próceres y próceres de la patria narran sus hazañas en estricta primera persona dentro de las fichas de los cromos históricos.'
    },
    technicalChallenges: [
      { challenge: 'Física y Efectos Shaders de Brillo Holográfico', severity: 'Media', solution: 'Implementados con CSS WebGL Shaders ligeros para simular el brillo arcoíris sin sobrecalentar los dispositivos escolares.' },
      { challenge: 'Arrastre y Pegado Táctil Preciso en Tablets', severity: 'Media', solution: 'Zonas magnéticas de ajuste automático (snapping) para dedos de 6 a 8 años.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas totales.',
      learningCurve: '15 minutos para programar un sobre semanal temático.',
      parentAdoption: 'Alta vinculación familiar mediante las "Misiones Familiares" de recolección de gemas en casa.'
    },
    cloudViability: {
      ssoAuth: 'Google Workspace institucional con acceso directo sin contraseñas complicadas.',
      cloudStorage: 'Los álbumes digitales completos pueden exportarse a un PDF interactivo de recuerdo de fin de curso guardado en Drive (<300KB).',
      classroomIntegration: 'Las tareas entregadas a tiempo otorgan automáticamente un sobre de estampas en ISkool mediante webhook seguro.'
    },
    globalBenchmarks: [
      { name: 'Animal Crossing (Nintendo)', origin: 'Japón', description: 'Mecánica de museo y coleccionismo de especies e hitos que despierta el orgullo de los niños.', iskoolAdvantage: 'Alineación 100% curricular a la historia, geografía y biodiversidad de la NEM.' },
      { name: 'Álbum Panini Didáctico', origin: 'Italia / Global', description: 'Emoción táctil del coleccionismo físico de cromos intercambiables con sobre rasgable.', iskoolAdvantage: 'Cero costo para las familias; los cromos se obtienen exclusivamente con lectura y esfuerzo escolar.' },
      { name: 'Kahoot Kids', origin: 'Noruega', description: 'Cuestionarios interactivos de alta energía adaptados al ritmo individual de aprendizaje.', iskoolAdvantage: 'Evaluación formativa continua sin estrés ni clasificaciones humillantes.' }
    ]
  },

  '05': {
    key: '05',
    title: '05 Primaria Alta · Crónicas de Exploradores',
    level: '4º a 6º de Primaria (Fase 5 SEP)',
    ages: '9 a 11 Años',
    liveDemoUrl: '/redisenos_gamificados/cronicas_de_exploradores',
    tagline: 'Archipiélago de hexágonos 3D tipo Catan con niebla de guerra y expediciones comunitarias STEM',
    worldBenchmarkSummary: 'Classcraft (Canadá) & Catan Junior (Alemania)',
    hubImage: '/redisenos_assets/gamification_primaria_alta_cronicas_1792732799979.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_alta_tcg_1792734618682.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '4º a 6º de Primaria (Fase 5 SEP · 9 a 11 años)',
      gameMetaphor: 'Una expedición científica y geográfica a través de un continente inexplorado dividido en casillas hexagonales de recursos naturales y civilizaciones.',
      coreLevelMechanic: 'Estrategia territorial cooperativa. Resolver proyectos comunitarios y ciencias despeja la niebla de guerra en el mapa de la clase.'
    },
    screens: {
      hub: {
        title: 'Mapa Territorial Hexagonal',
        visualStructure: 'Rejilla isométrica hexagonal de biomas (bosques, montañas, selvas, ríos).',
        keyComponents: ['Base de Expedición', 'Puntos de Observación Meteorológica', 'Radar Comunitario', 'Almacén de Recursos']
      },
      quiz: {
        title: 'Desafío de Exploración de Terreno',
        mechanic: 'Preguntas sobre placas tectónicas, ecosistemas y cálculo de áreas para colocar puestos científicos.',
        optionsStyle: 'Tarjetas topográficas con instrumentos de medición.',
        positiveReinforcement: 'Despeje de la niebla con animación de brújula dorada y recursos de madera y piedra ganados.',
        errorPedagogy: 'La brújula recalcula la ruta y sugiere consultar el mapa orográfico.'
      },
      avatar: {
        title: 'Vestidor del Científico de Campo',
        customizationFeatures: ['Batas de campo', 'Brújulas de bronce', 'Mochilas solares', 'Drones exploradores'],
        economyModel: 'Créditos de investigación ganados por tareas de campo.',
        gameplayIntegration: 'El avatar lidera la expedición en el mapa hex de la escuela.'
      },
      teacherStudio: {
        title: 'Universal Studio Cartográfico',
        flowSteps: ['Definir misión geográfica o histórica', 'Ubicar casilla en el mapa escolar', 'Activar reto grupal'],
        polymorphicOutput: 'Nodo de expedición sincronizado para todo el salón.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Sincronización de progreso territorial en useClassroomStore.',
      vaultIntegration: 'Proyectos sociocomunitarios vinculados en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Exploradores y científicos mexicanos hablando en primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Cálculo de Rejilla Hexagonal en Navegadores', severity: 'Media', solution: 'Matemáticas de coordenadas cúbicas de hexágonos optimizadas en TypeScript puro.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas.',
      learningCurve: '20 minutos para configurar un mapa bimestral.',
      parentAdoption: 'Visualización clara del progreso del grupo en proyectos reales.'
    },
    cloudViability: {
      ssoAuth: 'Google Workspace for Education.',
      cloudStorage: 'Portafolios de proyectos en Drive.',
      classroomIntegration: 'Entregables sincronizados con rúbricas de Classroom.'
    },
    globalBenchmarks: [
      { name: 'Classcraft', origin: 'Canadá', description: 'Gamificación de aula con clases de personajes.', iskoolAdvantage: 'Enfoque directo en la geografía y sociedad mexicana sin sobrecarga de gestión.' }
    ]
  },

  '06': {
    key: '06',
    title: '06 Primaria Alta · Torneo de Saberes & Cartas TCG',
    level: '4º a 6º de Primaria (Fase 5 SEP)',
    ages: '9 a 11 Años',
    liveDemoUrl: '/redisenos_gamificados/torneo_de_saberes_tcg',
    tagline: 'Estadio holográfico de cartas didácticas coleccionables con duelos estratégicos de ciencia e historia',
    worldBenchmarkSummary: 'Pokémon TCG Educativo & Hearthstone Didáctico',
    hubImage: '/redisenos_assets/gamification_primaria_alta_torneo_cartas_1792732819565.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_alta_tcg_1792734618682.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '4º a 6º de Primaria (Fase 5 SEP · 9 a 11 años)',
      gameMetaphor: 'Un estadio holográfico donde los conocimientos se baten en duelo mediante barajas estratégicas con personajes históricos, leyes físicas y fórmulas matemáticas.',
      coreLevelMechanic: 'Duelo por turnos con mazo de cartas. Los reactivos resueltos activan habilidades de cartas (e.g. Isaac Newton invoca Ley de Gravedad).'
    },
    screens: {
      hub: {
        title: 'La Arena de Duelo TCG',
        visualStructure: 'Tablero de juego con zonas de invocación, mazo y cementerio holográfico.',
        keyComponents: ['Constructor de Mazos', 'Liga Escolar de Campeones', 'Tienda de Sobres', 'Mesa de Práctica']
      },
      quiz: {
        title: 'Duelo de Saberes en el Tablero',
        mechanic: 'Jugar la carta de "Revolución Mexicana" requiere acertar el año de inicio (1910) para infligir daño directo.',
        optionsStyle: 'Cartas detalladas con ilustraciones, costo de maná y texto didáctico.',
        positiveReinforcement: 'Animación de impacto elemental de la carta con sonido estéreo y bonus de racha.',
        errorPedagogy: 'La carta regresa a la mano temporalmente y muestra su ficha biográfica de repaso.'
      },
      avatar: {
        title: 'Perfil del Duelista Estratega',
        customizationFeatures: ['Reversos de cartas holográficos', 'Tapetes de duelo', 'Medallas de torneo', 'Títulos de liga'],
        economyModel: 'Polvo arcano y sobres ganados por precisión académica.',
        gameplayIntegration: 'Personalización visible en los duelos multijugador del aula.'
      },
      teacherStudio: {
        title: 'Universal Studio Creador de Cartas',
        flowSteps: ['Redactar concepto científico/histórico', 'Generar carta con atributos y arte', 'Integrar al mazo del salón'],
        polymorphicOutput: 'Carta interactiva exportable a PDF para torneos físicos de mesa.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Registro de barajas y estadísticas en useGamificationStore.',
      vaultIntegration: 'Fichas biográficas de la Bóveda Curricular como fuente directa de las cartas.',
      historicalAvatarsFirstPerson: 'Los textos de las cartas hablan en primera persona ("Fui caudillo del sur...").'
    },
    technicalChallenges: [
      { challenge: 'Físicas de Arrastre de Cartas en Pantallas Táctiles', severity: 'Media', solution: 'Motor dnd-kit integrado con aceleración por hardware en CSS transforms.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas.',
      learningCurve: '15 minutos para organizar un torneo temático.',
      parentAdoption: 'Fácil comprensión gracias a la mecánica universal de juegos de cartas.'
    },
    cloudViability: {
      ssoAuth: 'Google Workspace institucional.',
      cloudStorage: 'Mazos y cartas guardados en Drive.',
      classroomIntegration: 'Resultados del torneo exportables a hojas de cálculo de Google Sheets.'
    },
    globalBenchmarks: [
      { name: 'Hearthstone Educativo', origin: 'EE.UU.', description: 'Líder en mecánicas de cartas digitales coleccionables.', iskoolAdvantage: 'Contenido 100% curricular y pedagógicamente protegido.' }
    ]
  },

  '07': {
    key: '07',
    title: '07 Secundaria · Gremio Cyber-Saga Esports',
    level: 'Secundaria (Fase 6 SEP)',
    ages: '12 a 14 Años',
    liveDemoUrl: '/redisenos_gamificados/gremio_cyber_esports',
    tagline: 'Dark Neon / Synthwave & Anime Cyberpunk con duelos síncronos de trivia y clanes escolares',
    worldBenchmarkSummary: 'Guilded Esports & Kahoot Live Arena',
    hubImage: '/redisenos_assets/gamification_secundaria_gremio_esports_1792732846760.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    identity: {
      educationalLevel: 'Secundaria (Fase 6 SEP · 12 a 14 años)',
      gameMetaphor: 'Una metrópolis cibernética donde los estudiantes forman clanes de esports educativos, compitiendo en arenas de ciberseguridad, matemáticas y ciencias.',
      coreLevelMechanic: 'Duelos de trivia síncronos en tiempo real con temporizadores, rachas de precisión y multiplicadores de clan.'
    },
    screens: {
      hub: {
        title: 'Cyber Hub del Clan',
        visualStructure: 'Interfaz OLED de tonos oscuros con ribetes de neón cian, magenta y tipografía monospace moderna.',
        keyComponents: ['Panel de Clasificación de Clanes', 'Terminal de Desafíos Diarios', 'Locker Streetwear', 'Transmisión en Vivo del Aula']
      },
      quiz: {
        title: 'Cyber Duelo: Duelo Glitch Dragon',
        mechanic: 'Preguntas de álgebra, historia contemporánea y física para hackear al dragón corrupto.',
        optionsStyle: 'Módulos hexagonales ciberpunk con tiempo regresivo en barra neón.',
        positiveReinforcement: 'Efecto glitch de victoria, subida instantánea en el ranking y monedas cibernéticas.',
        errorPedagogy: 'El escudo del clan absorbe el error y la terminal arroja un log de depuración conceptual.'
      },
      avatar: {
        title: 'Locker Streetwear Anime',
        customizationFeatures: ['Chamarras neo-Tokyo con fibra óptica', 'Gafas de realidad aumentada', 'Emblemas de clan', 'Drones asistentes'],
        economyModel: 'Cyber-monedas ganadas por rachas consecutivas de estudio sin faltas.',
        gameplayIntegration: 'Renderizado en AnimeAvatarSprite.tsx con sprites animados.'
      },
      teacherStudio: {
        title: 'Universal Studio para Moderadores de Esports',
        flowSteps: ['Configurar torneo de trivia síncrona', 'Lanzar partida en pantalla gigante del aula', 'Descargar analíticas'],
        polymorphicOutput: 'Sala multijugador con código de acceso para los alumnos.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración directa con useGamificationStore y useCoopStore.',
      vaultIntegration: 'Contenidos de Fase 6 SEP indexados en Markdown en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Figuras de la Revolución Mexicana e Historia Universal hablando en primera persona rigurosa.'
    },
    technicalChallenges: [
      { challenge: 'Sincronización WebSockets en Tiempo Real en Redes Escolares con Firewall', severity: 'Alta', solution: 'Fallback automático a HTTP Polling de baja latencia con reconexión silenciosa.' }
    ],
    trainingAndAdoption: {
      trainingHours: '6 horas.',
      learningCurve: '15 minutos para iniciar una partida en clase.',
      parentAdoption: 'Canalización positiva del interés en los videojuegos hacia el aprendizaje formal.'
    },
    cloudViability: {
      ssoAuth: 'OAuth2 Google Workspace institucional con autenticación de dos factores.',
      cloudStorage: 'Logs de partidas y estadísticas directo a Google Cloud / Drive.',
      classroomIntegration: 'Sincronización automática de asistencias y participación.'
    },
    globalBenchmarks: [
      { name: 'Kahoot Live Arena', origin: 'Noruega', description: 'Referente en concursos de preguntas en el aula.', iskoolAdvantage: 'ISkool elimina la superficialidad del azar y recompensa la consistencia pedagógica y trabajo en equipo.' }
    ]
  },

  '08': {
    key: '08',
    title: '08 Secundaria · Metrópolis de Inventores',
    level: 'Secundaria (Fase 6 SEP)',
    ages: '12 a 14 Años',
    liveDemoUrl: '/redisenos_gamificados/metropolis_de_inventores',
    tagline: 'Steampunk victoriano de vapor, engranes y bobinas Tesla con simulación de circuitos y física aplicada',
    worldBenchmarkSummary: 'SimCityEDU & Brilliant.org STEM',
    hubImage: '/redisenos_assets/gamification_secundaria_metropolis_stem_1792732869540.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    identity: {
      educationalLevel: 'Secundaria (Fase 6 SEP · 12 a 14 años)',
      gameMetaphor: 'Una gran urbe industrial del siglo XIX que depende de la física, la química y las máquinas térmicas para expandirse y erradicar la contaminación.',
      coreLevelMechanic: 'Ingeniería y resolución de problemas. Cada reactivo de ciencias activa generadores y maquinaria que encienden distritos urbanos.'
    },
    screens: {
      hub: {
        title: 'El Plano de la Metrópolis Steampunk',
        visualStructure: 'Mapa de planos en papel milimétrico azul con tuberías de latón, vapor y engranes dorados.',
        keyComponents: ['Central Hidroeléctrica', 'Taller de Mecatrónica', 'Laboratorio Químico', 'Torre del Reloj de Presión']
      },
      quiz: {
        title: 'Prueba de Presión en la Caldera',
        mechanic: 'Calcular la ley de Ohm o la resistencia de un circuito para evitar una fuga de vapor.',
        optionsStyle: 'Manómetros y palancas de latón con agujas móviles.',
        positiveReinforcement: 'El manómetro se estabiliza, el generador emite chispas eléctricas y el distrito se ilumina.',
        errorPedagogy: 'La válvula silba suavemente y el esquema eléctrico resalta la rama con sobrecarga.'
      },
      avatar: {
        title: 'Taller del Inventor Victoriano',
        customizationFeatures: ['Monóculos térmicos', 'Chalecos de cuero', 'Brazos mecánicos de latón', 'Llaves inglesas de oro'],
        economyModel: 'Patentes de invención y engranes dorados ganados en laboratorio.',
        gameplayIntegration: 'El avatar supervisa las obras mecánicas en el mapa de la ciudad.'
      },
      teacherStudio: {
        title: 'Universal Studio de Laboratorio',
        flowSteps: ['Crear problema de física o química', 'Vincular a circuito o máquina térmica', 'Lanzar reto de taller'],
        polymorphicOutput: 'Simulación interactiva basada en Canvas 2D sin plugins pesados.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Registro de patentes y habilidades técnicas en useStudentStore.',
      vaultIntegration: 'Prácticas de laboratorio NEM vinculadas en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Grandes inventores de la historia narrando sus descubrimientos en primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Física de Partículas de Humo y Vapor sin Ralentizar', severity: 'Media', solution: 'Emisores de partículas CSS ligeros con ciclo de vida limitado a 1.2 segundos.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas.',
      learningCurve: '20 minutos para programar una práctica de laboratorio.',
      parentAdoption: 'Excelente valoración por fomentar vocaciones de ingeniería temprana.'
    },
    cloudViability: {
      ssoAuth: 'Google Workspace institucional.',
      cloudStorage: 'Esquemas técnicos guardados en Google Drive.',
      classroomIntegration: 'Reporte directo a tareas de ciencias en Classroom.'
    },
    globalBenchmarks: [
      { name: 'Brilliant.org', origin: 'EE.UU.', description: 'Referente en enseñanza interactiva de ciencias e ingeniería.', iskoolAdvantage: 'Contextualización completa con los programas y libros de texto de la SEP.' }
    ]
  },

  '09': {
    key: '09',
    title: '09 Preparatoria · Apex Academy Venture Studio',
    level: 'Preparatoria (1º a 3º de Bachillerato)',
    ages: '15 a 18 Años',
    liveDemoUrl: '/redisenos_gamificados/apex_academy_venture_studio',
    tagline: 'Executive Dark Mode de alta productividad con desafíos formales en LaTeX y portafolios de admisión universitaria',
    worldBenchmarkSummary: 'Linear & Portafolios Educativos de Élite',
    hubImage: '/redisenos_assets/gamification_preparatoria_venture_studio_1792732893154.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preparatoria_mastery_1792734699863.jpg',
    avatarImage: '/redisenos_assets/gamification_preparatoria_portfolio_radar_1792734730504.jpg',
    identity: {
      educationalLevel: 'Preparatoria (1º a 3º de Bachillerato · 15 a 18 años)',
      gameMetaphor: 'Una aceleradora de proyectos y estudio de investigación pre-universitario donde el alumno construye su perfil profesional y académico verificable para admisiones y becas.',
      coreLevelMechanic: 'Maestría conceptual profunda. El estudiante resuelve problemas de cálculo, economía y redacción formal; cada entrega alimenta un radar de 5 competencias.'
    },
    screens: {
      hub: {
        title: 'Executive Dashboard de Preparatoria',
        visualStructure: 'Diseño minimalista negro carbón con tipografía Inter, paneles colapsables y métricas de rendimiento.',
        keyComponents: ['Radar Pentagonal de Competencias', 'Heatmap de Constancia (365 días)', 'Portafolio de Ensayos', 'Predictor de Admisión Ceneval/UNAM']
      },
      quiz: {
        title: 'Desafío de Cálculo & Razonamiento Avanzado',
        mechanic: 'Resolver límites indeterminados o problemas de optimización con renderizado en tiempo real en LaTeX.',
        optionsStyle: 'Módulos sobrios con justificación matemática y botones de teclado simbólico.',
        positiveReinforcement: 'Incremento en el índice de maestría porcentual y badge verificado en el portafolio.',
        errorPedagogy: 'El Asistente Pedagógico IA desglosa el paso algebraico donde ocurrió la inconsistencia sin juicios.'
      },
      avatar: {
        title: 'Portafolio & Credenciales Profesionales',
        customizationFeatures: ['Radar pentagonal interactivo', 'Insignias oficiales exportables en PDF', 'Código QR institucional verificable', 'Bio ejecutiva'],
        economyModel: 'Puntos de mérito y horas de investigación académica acumuladas.',
        gameplayIntegration: 'Portafolio compartible con universidades y comités de becas.'
      },
      teacherStudio: {
        title: 'Universal Studio para Catedráticos',
        flowSteps: ['Cargar problema de cálculo o ensayo argumentativo', 'Definir rúbrica analítica por competencias', 'Publicar evaluación formativa'],
        polymorphicOutput: 'Reactivo formal de alto nivel con soporte LaTeX e inspección de plagio.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración directa con usePortfolioStore y useStudentStore.',
      vaultIntegration: 'Ensayos y tesis vinculadas como notas con Frontmatter en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Filósofos, científicos y próceres debatiendo dilemas éticos en primera persona verídica.'
    },
    technicalChallenges: [
      { challenge: 'Renderizado Rápido de Ecuaciones Matemáticas en LaTeX', severity: 'Media', solution: 'KaTeX integrado con renderizado en hilo secundario para latencia <5ms.' }
    ],
    trainingAndAdoption: {
      trainingHours: '6 horas.',
      learningCurve: '15 minutos para configurar una rúbrica analítica universitaria.',
      parentAdoption: 'Alta satisfacción familiar al ver el portafolio pre-universitario real del estudiante.'
    },
    cloudViability: {
      ssoAuth: 'Google Workspace con credenciales institucionales seguras.',
      cloudStorage: 'Portafolios completos sincronizados con Google Drive y Docs.',
      classroomIntegration: 'Sincronización bidireccional de tareas y rúbricas en Classroom.'
    },
    globalBenchmarks: [
      { name: 'Linear', origin: 'EE.UU.', description: 'Líder en interfaces de productividad de ingeniería sobrias y rápidas.', iskoolAdvantage: 'Diseñado específicamente para el rigor formativo del bachillerato mexicano.' }
    ]
  },

  '10': {
    key: '10',
    title: '10 Preparatoria · Nexus Protocol Research Guild',
    level: 'Preparatoria (1º a 3º de Bachillerato)',
    ages: '15 a 18 Años',
    liveDemoUrl: '/redisenos_gamificados/nexus_protocol_research_guild',
    tagline: 'Minimalismo OLED con grafos de constelación, terminal de diagnóstico algorítmico y segundo cerebro',
    worldBenchmarkSummary: 'Bóveda Curricular & LeetCode Académico',
    hubImage: '/redisenos_assets/gamification_preparatoria_nexus_protocol_1792732922568.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preparatoria_mastery_1792734699863.jpg',
    avatarImage: '/redisenos_assets/gamification_preparatoria_portfolio_radar_1792734730504.jpg',
    identity: {
      educationalLevel: 'Preparatoria (1º a 3º de Bachillerato · 15 a 18 años)',
      gameMetaphor: 'Un gremio de investigadores avanzados que navegan por una constelación de conocimiento donde cada nodo descubierto expande el grafo conceptual del alumno.',
      coreLevelMechanic: 'Pensamiento en redes y algoritmia. El alumno conecta conceptos interdisciplinarios mediante terminales de diagnóstico y grafos interactivos.'
    },
    screens: {
      hub: {
        title: 'Grafo de Constelación del Conocimiento',
        visualStructure: 'Canvas interactivo de nodos y enlaces bidireccionales con físicas de fuerza elástica.',
        keyComponents: ['Visor de Grafo de Conceptos', 'Terminal CLI de Diagnóstico', 'Línea de Tiempo de Hipótesis', 'Radar de Especialidad']
      },
      quiz: {
        title: 'Terminal de Diagnóstico de Código & Ensayos',
        mechanic: 'Depurar un algoritmo en pseudocódigo o argumentar una tesis filosófica validando enlaces lógicos.',
        optionsStyle: 'Consola monospace con resaltado de sintaxis y analizador estático en vivo.',
        positiveReinforcement: 'El nodo del grafo se enciende en verde esmeralda y desbloquea tres ramas adyacentes.',
        errorPedagogy: 'La terminal indica la línea con incoherencia lógica y sugiere el nodo de la Bóveda Curricular a consultar.'
      },
      avatar: {
        title: 'Identidad del Investigador Científico',
        customizationFeatures: ['Firma criptográfica de autoría', 'Insignias de maestría técnica', 'Grafo personal exportable', 'Diógenes Badge'],
        economyModel: 'Nodos investigados y publicaciones internas aprobadas por pares.',
        gameplayIntegration: 'Visualización de la red del alumno en el directorio institucional de la preparatoria.'
      },
      teacherStudio: {
        title: 'Universal Studio para Directores de Tesis',
        flowSteps: ['Publicar pregunta de investigación abierta', 'Definir red de conceptos requerida', 'Monitorear grafos de alumnos'],
        polymorphicOutput: 'Mapeo conceptual con detección automática de conexiones interdisciplinarias.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración directa con useWritingEngineStore y usePortfolioStore.',
      vaultIntegration: 'Conexión nativa con todos los archivos .md y enlaces bidireccionales [[...]] de la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Próceres y pensadores universales dialogando en primera persona en la terminal investigativa.'
    },
    technicalChallenges: [
      { challenge: 'Física de Fuerza de Grafos para 500+ Nodos en Tiempo Real', severity: 'Alta', solution: 'Motor de grafos basado en Web Workers para mantener 60 FPS en el hilo principal.' }
    ],
    trainingAndAdoption: {
      trainingHours: '6 horas.',
      learningCurve: '20 minutos para trazar una constelación temática de estudio.',
      parentAdoption: 'Visualización tangible de la madurez investigativa y pensamiento crítico del alumno.'
    },
    cloudViability: {
      ssoAuth: 'SSO OAuth2 institucional de alta seguridad.',
      cloudStorage: 'Sincronización continua de grafos y notas en Google Drive.',
      classroomIntegration: 'Conexión de entregables con Classroom y Google Docs.'
    },
    globalBenchmarks: [
      { name: 'Bóveda Curricular y Segundos Cerebros', origin: 'Global', description: 'Referente en pensamiento conectado y gestión del conocimiento personal.', iskoolAdvantage: 'Integración automática y hermética con el currículo de la NEM y evaluación oficial.' }
    ]
  }
};
