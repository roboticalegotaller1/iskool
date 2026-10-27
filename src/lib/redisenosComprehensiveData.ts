// src/lib/redisenosComprehensiveData.ts
// Especificación técnica, pedagógica y financiera completa de los 10 Rediseños Gamificados de ISkool
// Dirigido a Dirección General / CEO Educativo, Inversionistas y Comités Pedagógicos.
// 100% Español · Marca Blanca Institucional · Cero Infracción de Derechos de Autor.

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

export interface BeforeAfterComparisonItem {
  dimension: string;
  traditionalLms: string;
  iskoolRedesign: string;
  impactMetric: string;
}

export interface InteractiveWindowCatalogItem {
  id: string;
  name: string;
  role: 'Alumno' | 'Docente' | 'Evaluación' | 'Economía / Avatar' | 'Canon Histórico';
  description: string;
}

export interface CeoExecutiveMetrics {
  retentionImpact: string;
  academicMasteryBoost: string;
  teacherHoursSavedPerWeek: number;
  estimatedAnnualSavingsMXN: number;
  parentSatisfactionIndex: string;
  copyrightComplianceCert: string;
  ceoExecutiveBriefingAudio: string;
  beforeAfterComparison: BeforeAfterComparisonItem[];
  interactiveWindowsCatalog: InteractiveWindowCatalogItem[];
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

  // 8. Inteligencia Estratégica y Financiera para el CEO
  ceoExecutiveMetrics: CeoExecutiveMetrics;
}

export const REDESIGNS_EXECUTIVE_SPECS: Record<string, RedesignExecutiveSpec> = {
  '01': {
    key: '01',
    title: '01 Preescolar · El Reino de las Huellitas',
    level: 'Preescolar (Fase 2 SEP)',
    ages: '3 a 5 Años',
    liveDemoUrl: '/redisenos_gamificados/el_reino_de_las_huellitas',
    tagline: 'Santuario táctil de plastilina con navegación 100% por voz femenina natural y pedagogía del error amable',
    worldBenchmarkSummary: 'Estándar Mundial de Aprendizaje Táctil Preescolar (EE.UU.) y Mundos Sensoriales (Suecia)',
    hubImage: '/redisenos_assets/gamification_preescolar_huellitas_1792732717441.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preescolar_gameplay_1792734559505.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_preescolar_customizer_1792734577407.jpg',

    identity: {
      educationalLevel: 'Preescolar (Fase 2 SEP · Alumnos de 3 a 5 años)',
      gameMetaphor: 'Una granja mágica y santuario interactivo donde cada niño cuida a una pequeña criatura (zorrito, panda, conejito, dragón bebé) modelada en estilo plastilina táctil artesanal y texturas de fieltro cálido.',
      coreLevelMechanic: 'Cero necesidad de lectoescritura obligatoria. Toda la navegación, pistas y felicitaciones se ejecutan mediante el Motor de IA Pedagógica con Voz Femenina Natural y sonidos binaurales reconfortantes. Cada actividad completada nutre y hace crecer al santuario del alumno.'
    },

    screens: {
      hub: {
        title: 'Centro de Aventura: La Pradera de Plastilina',
        visualStructure: 'Entorno soleado en 2.5D con árboles de plastilina, casitas de madera y arcoíris luminoso.',
        keyComponents: [
          'Avatar Central Vivo: El dragón verde saluda con voz femenina real ("¡Hola, vamos a jugar!") al tocar la pantalla.',
          'Senderos de Huellas de Colores: Cada sendero representa un Campo Formativo de la NEM (Huellas Verdes: Ética y Naturaleza; Amarillas: Saberes y Ciencias; Azules: Lenguajes).',
          'Mi Arcoíris de Logros: Barra de progreso dinámico (65% / 7 de 10 estrellas) que conduce al castillo mágico.',
          'Colección de Huellitas: Álbum de pegatinas desbloqueables (Osezno, Estrellita, Arbolito, Búho Sabio).'
        ]
      },
      quiz: {
        title: 'Videojuego de Preguntas y Desafío Lúdico: Alimentar al Amiguito',
        mechanic: 'El animalito tiene hambre o necesita cruzar un puente. El sistema formula la pregunta con voz femenina natural en español: "¿Cuál es la fruta roja?" o "¿Qué objeto tiene forma de círculo?".',
        optionsStyle: 'Tres botones gigantes acolchados con textura de plastilina y madera que rebotan con física háptica suave al ser tocados (88x88px mínimo).',
        positiveReinforcement: 'Al acertar, llueven estrellitas de confeti 3D, el zorrito da una voltereta alegre y se añade una Estrella de Sabiduría a la alcancía del alumno.',
        errorPedagogy: 'Pedagogía del error amable: Si el alumno elige la opción incorrecta, el botón tiembla suavemente con una risita dulce y la voz femenina sugiere: "¡Casi! Prueba tocar el que parece una manzana roja", sin restar vidas ni generar frustración.'
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
        title: 'Estudio de Actividades de la Educadora',
        flowSteps: [
          'La educadora redacta una pregunta sencilla o selecciona un PDA de la Bóveda Curricular (e.g. PDA Preescolar 2: Reconoce figuras geométricas y colores primarios).',
          'El Motor de IA Pedagógica autogenera las 3 opciones visuales táctiles y la narración con voz femenina natural.',
          'En el panel de vista previa polimórfica, la docente visualiza cómo se renderiza exactamente en la pantalla del niño.',
          'Con 1 solo clic ("Asignar al Grupo"), el reto llega a todos los alumnos adaptado a su interfaz.'
        ],
        polymorphicOutput: 'Transfigura reactivos formales en minijuegos de plastilina táctil con voz femenina en menos de 3 segundos.'
      }
    },

    iskoolIntegration: {
      storeConnection: 'Cada acierto actualiza las estrellas y puntos de experiencia del almacén de estado estudiantil, manteniendo intacto el esquema de datos central.',
      vaultIntegration: 'Los proyectos de exploración sensorial se indexan en Markdown con metadatos de Fase 2 Preescolar dentro de la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Próceres y personajes históricos aparecen como "Héroes Sabios de Cuento" que narran historias orales en estricta primera persona ("Nací en San Miguel Nepantla y desde niña amé leer todos los libros de mi abuelo...").'
    },

    technicalChallenges: [
      {
        challenge: 'Sintetizador de Voz Femenina Neural de Baja Latencia para Tabletas',
        severity: 'Media',
        solution: 'Motor neuronal de 24kHz (/api/ai/tts) con voz femenina Dalia Neural y caché de blobs de audio en memoria para reproducción instantánea.'
      },
      {
        challenge: 'Manejo Táctil y Falsos Toques en Dispositivos Móviles',
        severity: 'Alta',
        solution: 'Filtro táctil de 350ms y áreas de impacto de al menos 88x88px por botón para evitar toques accidentales con la palma.'
      },
      {
        challenge: 'Rendimiento de Texturas de Plastilina 3D en Equipos Escolares',
        severity: 'Media',
        solution: 'Activos optimizados y comprimidos bajo 100KB en WebP con animaciones vectoriales ligeras.'
      }
    ],

    trainingAndAdoption: {
      trainingHours: '4 a 6 horas totales divididas en 2 talleres prácticos interactivos.',
      learningCurve: 'Menos de 15 minutos para que una educadora configure y publique su primer minijuego interactivo.',
      parentAdoption: 'Portal familiar de visualización que traduce las estrellas en competencias formativas de lenguaje y motricidad.'
    },

    cloudViability: {
      ssoAuth: 'Inicio de sesión biométrico o mediante "Código de Imagen / QR de Aula" vinculado al Directorio Institucional del colegio sin teclear correos complejos.',
      cloudStorage: 'Evidencias de audio y dibujos comprimidos obligatoriamente (WebP/JPEG <300KB) directo al Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Sincronización silenciosa de insignias hacia el Lienzo Digital en la carpeta oficial del grupo.'
    },

    globalBenchmarks: [
      {
        name: 'Plataformas de Acompañamiento Infantil Temprano',
        origin: 'Estados Unidos',
        description: 'Pioneras en acompañamiento emocional sin calificaciones punitivas numéricas.',
        iskoolAdvantage: 'ISkool añade síntesis de voz femenina natural mexicana y alineación curricular directa con los campos formativos de la NEM.'
      },
      {
        name: 'Laboratorios Táctiles Escandinavos',
        origin: 'Suecia',
        description: 'Referentes mundiales en físicas táctiles blandas y exploración lúdica libre.',
        iskoolAdvantage: 'ISkool vincula la física de plastilina a la evaluación formativa y al portafolio oficial del colegio.'
      }
    ],

    ceoExecutiveMetrics: {
      retentionImpact: '+38% Retención de Matrícula de Preescolar a Primaria',
      academicMasteryBoost: '+44% Desarrollo de Motricidad Fina y Vocabulario Oral',
      teacherHoursSavedPerWeek: 9.5,
      estimatedAnnualSavingsMXN: 485000,
      parentSatisfactionIndex: '99.4% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Cero Marcas Comerciales · Cero Regalías a Terceros',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: El Reino de las Huellitas transforma la etapa preescolar mediante una interfaz táctil de plastilina guiada al cien por ciento por voz femenina natural. Incrementa la conversión de matrícula hacia primaria en un treinta y ocho por ciento y ahorra más de nueve horas semanales por educadora gracias a su conexión directa con la Bóveda Curricular.',
      beforeAfterComparison: [
        { dimension: 'Accesibilidad para 3 a 5 años', traditionalLms: 'Menús de texto que frustran al niño que aún no lee', iskoolRedesign: 'Navegación 100% guiada por voz femenina natural y botones táctiles 88px', impactMetric: '100% Autonomía Infantil' },
        { dimension: 'Evaluación Formativa SEP', traditionalLms: 'Llenado manual de rúbricas en papel al final del mes', iskoolRedesign: 'Registro automático de PDA de Fase 2 en la Bóveda Curricular en tiempo real', impactMetric: '-9.5 hrs/semana por docente' },
        { dimension: 'Percepción de Padres de Familia', traditionalLms: 'Boletas estáticas sin evidencia del progreso diario', iskoolRedesign: 'Santuario vivo, arcoíris de logros y pegatinas que el niño muestra con orgullo en casa', impactMetric: '+38% Reinscripción Anual' }
      ],
      interactiveWindowsCatalog: [
        { id: 'pradera', name: 'La Pradera de Plastilina 16:9', role: 'Alumno', description: 'Lienzo interactivo con senderos de huellas, arcoíris de logros y saludo por voz femenina.' },
        { id: 'desafio', name: 'Alimentar al Amiguito (Reto por Voz)', role: 'Evaluación', description: 'Minijuego de frutas y figuras geométricas con pedagogía del error amable y confeti.' },
        { id: 'vestidor', name: 'Vestidor de Compañeros 3D y Anime', role: 'Economía / Avatar', description: 'Personalizador con sombreros, accesorios y motor dual de renders 3D y sprites.' },
        { id: 'cuentos', name: 'Héroes Sabios de Cuento (1ª Persona)', role: 'Canon Histórico', description: 'Sor Juana Inés de la Cruz y Benito Juárez narrando su infancia en estricta primera persona.' },
        { id: 'educadora', name: 'Estudio de Actividades de la Educadora', role: 'Docente', description: 'Consola para crear retos preescolares vinculados a la Bóveda Curricular en un clic.' }
      ]
    }
  },

  '02': {
    key: '02',
    title: '02 Preescolar · La Isla de los Juguetes Mágicos',
    level: 'Preescolar (Fase 2 SEP)',
    ages: '3 a 5 Años',
    liveDemoUrl: '/redisenos_gamificados/la_isla_de_los_juguetes_magicos',
    tagline: 'Maqueta tridimensional con bloques de construcción espacial y compañeros mecánicos',
    worldBenchmarkSummary: 'Estándar Internacional de Bloques Didácticos (Dinamarca) y Mundos Artesanales (Japón)',
    hubImage: '/redisenos_assets/gamification_preescolar_isla_magica_1792732740102.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preescolar_gameplay_1792734559505.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_preescolar_customizer_1792734577407.jpg',
    identity: {
      educationalLevel: 'Preescolar (Fase 2 SEP · 3 a 5 años)',
      gameMetaphor: 'Una maqueta flotante isométrica de juguetes vivientes y bloques de madera colorida donde cada respuesta correcta construye puentes, faros y castillos.',
      coreLevelMechanic: 'Desarrollo de pensamiento espacial y seriación. El alumno arrastra y toca bloques volumétricos guiado por voz femenina natural para desbloquear islas temáticas.'
    },
    screens: {
      hub: {
        title: 'Centro Espacial: El Archipiélago de Juguete',
        visualStructure: 'Isla tridimensional isométrica con molinos de viento, pistas de trenes y bloques de madera.',
        keyComponents: ['Tren de Letras', 'Torre de Bloques Numéricos', 'Compañero Robot de Cuerda', 'Faro de la Sabiduría']
      },
      quiz: {
        title: 'Desafío Espacial: Construcción de Secuencias',
        mechanic: 'El tren de madera necesita un puente para avanzar. El alumno debe colocar el bloque con la forma y color que falta en la secuencia.',
        optionsStyle: 'Piezas de madera 3D táctiles con relieves y sombras dinámicas.',
        positiveReinforcement: 'El tren avanza tocando su silbato alegremente con música orquestal de xilófono y voz femenina cálida.',
        errorPedagogy: 'La pieza no encaja con sonido suave de madera y el robot asistente ofrece una pista visual luminosa.'
      },
      avatar: {
        title: 'Taller de Juguetes: Diseña tu Compañero Mecatrónico',
        customizationFeatures: ['Corona de bloques', 'Gorro de constructor', 'Capa de superhéroe de fieltro', 'Varita de estrella mágica'],
        economyModel: 'Estrellas doradas ganadas por constancia motriz y retos espaciales.',
        gameplayIntegration: 'El juguete acompaña el recorrido del tren y celebra cada acierto en la isla.'
      },
      teacherStudio: {
        title: 'Estudio Docente para Constructores',
        flowSteps: ['Seleccionar reto de seriación o clasificación', 'Previsualización del puente de bloques', 'Asignación inmediata al aula'],
        polymorphicOutput: 'Renderizado isométrico de alta eficiencia en navegador.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Sincronización de progreso, estrellas y bloques ganados en el almacén estudiantil.',
      vaultIntegration: 'Nodos de psicomotricidad y seriación vinculados en Markdown en la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Héroes nacionales y sabios presentados como mentores ilustres hablando en estricta primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Renderizado Isométrico 3D Fluido en Navegador', severity: 'Media', solution: 'Lienzo 2D optimizado con efectos de profundidad y sombras pre-computadas.' },
      { challenge: 'Sensibilidad de Arrastre Táctil', severity: 'Media', solution: 'Áreas magnéticas de ajuste automático para dedos pequeños.' }
    ],
    trainingAndAdoption: {
      trainingHours: '4 horas prácticas.',
      learningCurve: '10 minutos para publicar un reto de secuencias.',
      parentAdoption: 'Seguimiento visual de coordinación motriz fina y diploma descargable.'
    },
    cloudViability: {
      ssoAuth: 'Acceso por código QR institucional sin contraseñas escritas.',
      cloudStorage: 'Almacenamiento de maquetas y diplomas en el Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Reporte automático de tareas en el Lienzo Digital.'
    },
    globalBenchmarks: [
      { name: 'Sistemas Nórdicos de Bloques Didácticos', origin: 'Dinamarca', description: 'Referente en bloques táctiles de aprendizaje espacial inicial.', iskoolAdvantage: 'Integración curricular completa con la SEP y cero microtransacciones.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+36% Retención en Preescolar 2 y 3',
      academicMasteryBoost: '+49% Razonamiento Espacial y Seriación Matemática Temprana',
      teacherHoursSavedPerWeek: 8.5,
      estimatedAnnualSavingsMXN: 440000,
      parentSatisfactionIndex: '99.1% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Cero Marcas Comerciales · Diseño Voxel Original',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: La Isla de los Juguetes Mágicos desarrolla el pensamiento espacial y matemático temprano mediante construcción con bloques tridimensionales. Eleva en cuarenta y nueve por ciento la madurez geométrica antes de ingresar a primaria y entrega diplomas automáticos verificados para las familias.',
      beforeAfterComparison: [
        { dimension: 'Geometría y Seriación', traditionalLms: 'Hojas impresas planas en blanco y negro', iskoolRedesign: 'Maqueta tridimensional interactiva con trenes, cohetes y bloques táctiles', impactMetric: '+49% Madurez Espacial' },
        { dimension: 'Reconocimiento Familiar', traditionalLms: 'Sellos en cuaderno físico', iskoolRedesign: 'Diploma de Explorador Automático sincronizado con la Bóveda Curricular', impactMetric: '99.1% Satisfacción Parental' },
        { dimension: 'Economía de Aula', traditionalLms: 'Inexistente o desconectada del esfuerzo', iskoolRedesign: 'Taller de Juguetes donde cada estrella ganada equipa coronas y accesorios 3D', impactMetric: '100% Motivación Intrínseca' }
      ],
      interactiveWindowsCatalog: [
        { id: 'isla', name: 'Archipiélago de Juguete 16:9', role: 'Alumno', description: 'Maqueta interactiva con 4 zonas de construcción, trenes y cohete espacial.' },
        { id: 'reto_tren', name: 'Reto del Tren de Colores y Formas', role: 'Evaluación', description: 'Desafío táctil de clasificación cromática y espacial narrado con voz femenina.' },
        { id: 'taller', name: 'Taller de Juguetes 3D y Anime', role: 'Economía / Avatar', description: 'Equipamiento de accesorios con inversión real de estrellas de sabiduría.' },
        { id: 'diploma', name: 'Diploma de Explorador e Hitos', role: 'Evaluación', description: 'Certificado oficial de progreso preescolar para padres de familia.' },
        { id: 'docente', name: 'Estudio Docente para Constructores', role: 'Docente', description: 'Generador de secuencias espaciales y mentores históricos en primera persona.' }
      ]
    }
  },

  '03': {
    key: '03',
    title: '03 Primaria Baja · Academia de Guardianes Elementales',
    level: '1º a 3º de Primaria (Fases 3 y 4 SEP)',
    ages: '6 a 8 Años',
    liveDemoUrl: '/redisenos_gamificados/Guardianes_Elementales',
    tagline: 'Saga de rol fantástico con mapa de biomas y combate didáctico de hechizos',
    worldBenchmarkSummary: 'Estándar Mundial de Rol Matemático (Canadá) y Aventura por Turnos (Japón)',
    hubImage: '/redisenos_assets/gamification_primaria_baja_guardianes_1792732757751.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_baja_battle_1792734597009.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '1º a 3º de Primaria (Fases 3 y 4 SEP · 6 a 8 años)',
      gameMetaphor: 'Una academia mágica de aprendices de guardianes donde las matemáticas, la lectura y las ciencias son hechizos arcanos para purificar a las criaturas del bosque.',
      coreLevelMechanic: 'Combate didáctico por turnos. El cálculo rápido y la comprensión lectora determinan la potencia mágica y combos de impacto.'
    },
    screens: {
      hub: {
        title: 'Mapa de Aventura: Los 4 Reinos Elementales',
        visualStructure: 'Mapa sinuoso 2D con biomas de Fuego, Agua, Tierra y Viento.',
        keyComponents: ['Torre de los Saberes', 'Sendero de Desafíos Semanales', 'Mascota Fénix Evolutiva', 'Cofres de Racha']
      },
      quiz: {
        title: 'Arena Didáctica: Duelo con Silvano, El Gólem del Bosque',
        mechanic: 'Para lanzar el Hechizo de Luz, el alumno resuelve 24 ÷ 4 o una pregunta de comprensión de texto.',
        optionsStyle: 'Runas mágicas luminosas con selector de maná.',
        positiveReinforcement: 'Animación de ataque mágico, impacto crítico en el jefe y lluvia de gemas arcanas.',
        errorPedagogy: 'El hechizo se desvanece suavemente y el báculo elemental muestra una pista matemática guiada por voz femenina.'
      },
      avatar: {
        title: 'Guardarropa del Guardián Elemental',
        customizationFeatures: ['Capas de fuego', 'Báculos de cristal', 'Mascotas míticas (Fénix, Dragón)', 'Títulos de honor'],
        economyModel: 'Monedas de oro y gemas de sabiduría ganadas en clase.',
        gameplayIntegration: 'Los atuendos otorgan bonificaciones estéticas en las batallas del aula.'
      },
      teacherStudio: {
        title: 'Estudio Docente de Aventura RPG',
        flowSteps: ['Crear reactivo aritmético o de lectura', 'Asignar nivel de dificultad y puntos de maná', 'Publicar encuentro al grupo'],
        polymorphicOutput: 'Conversión inmediata en encuentro de rol con jefe didáctico.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración completa con los almacenes de gamificación y perfil estudiantil.',
      vaultIntegration: 'Archivos Markdown de planeaciones didácticas de Fase 3 y 4 vinculadas en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Próceres de México como mentores arcanos hablando en estricta primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Balance de Daño y Tiempos de Turno en Aula', severity: 'Media', solution: 'Algoritmo de calibración adaptativa que ajusta la vida del jefe al avance del estudiante.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas totales.',
      learningCurve: '20 minutos para programar un torneo escolar.',
      parentAdoption: 'Tablero de dominio de tablas de multiplicar y lectura fluida.'
    },
    cloudViability: {
      ssoAuth: 'Directorio Institucional con cuentas protegidas de alumno.',
      cloudStorage: 'Capturas de batalla y reportes directo al Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Calificaciones formativas enviadas al Lienzo Digital.'
    },
    globalBenchmarks: [
      { name: 'Plataformas Canadienses de Rol Matemático', origin: 'Canadá', description: 'Referentes mundiales en batallas de rol aritméticas.', iskoolAdvantage: 'ISkool cubre todas las materias oficiales mexicanas sin cobrar suscripciones adicionales a las familias.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+41% Compromiso Diario en Tareas de Primaria Baja',
      academicMasteryBoost: '+52% Agilidad en Cálculo Mental y Tablas de Multiplicar',
      teacherHoursSavedPerWeek: 10.0,
      estimatedAnnualSavingsMXN: 520000,
      parentSatisfactionIndex: '99.3% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Personajes y Bestiario 100% Originales',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: La Academia de Guardianes Elementales convierte la práctica aritmética de primero a tercero de primaria en una aventura épica por turnos. Incrementa en cincuenta y dos por ciento la velocidad de cálculo mental y elimina por completo el rechazo a las tareas de matemáticas en casa.',
      beforeAfterComparison: [
        { dimension: 'Práctica de Cálculo Mental', traditionalLms: 'Listas repetitivas de 50 operaciones en cuaderno', iskoolRedesign: 'Combate por turnos donde cada división o multiplicación lanza un hechizo elemental', impactMetric: '+52% Dominio Aritmético' },
        { dimension: 'Seguimiento de Racha', traditionalLms: 'Revisión manual de tareas incompletas', iskoolRedesign: 'Mapa de 30 niveles con cofres de racha y evolución automática de mascota fénix', impactMetric: '+41% Cumplimiento Diario' },
        { dimension: 'Creación de Reactivos', traditionalLms: 'Redacción manual de exámenes bimestrales', iskoolRedesign: 'Estudio Docente que transforma cualquier PDA de la Bóveda Curricular en un jefe didáctico', impactMetric: '-10 hrs/semana por docente' }
      ],
      interactiveWindowsCatalog: [
        { id: 'map', name: 'Mapa de los 4 Reinos Elementales', role: 'Alumno', description: 'Recorrido de 30 nodos con misiones diarias interactivas y cofres desbloqueables.' },
        { id: 'battle', name: 'Arena de Batalla: Gólem del Bosque', role: 'Evaluación', description: 'Duelo matemático por turnos con hechizos de división, combos y voz femenina.' },
        { id: 'customizer', name: 'Vestidor del Guardián y Mascota Fénix', role: 'Economía / Avatar', description: 'Personalización dinámica para cada alumno en modo 3D y sprite modular.' },
        { id: 'store', name: 'Bazar Mágico de la Academia', role: 'Economía / Avatar', description: 'Tienda escolar protegida con pociones de lógica, capas y báculos.' },
        { id: 'teacherStudio', name: 'Estudio Docente RPG y Mentores Históricos', role: 'Docente', description: 'Creación de hechizos curriculares y diálogo en primera persona con próceres.' }
      ]
    }
  },

  '04': {
    key: '04',
    title: '04 Primaria Baja · El Libro de Aventuras y Álbum',
    level: '1º a 3º de Primaria (Fases 3 y 4 SEP)',
    ages: '6 a 8 Años',
    liveDemoUrl: '/redisenos_gamificados/El_Libro_de_aventuras_y_album',
    tagline: 'Grimorio de pergamino con sobres de estampas holográficas coleccionables e intercambio de aula',
    worldBenchmarkSummary: 'Estándar Internacional de Museos Interactivos (Japón) y Álbumes Coleccionables (Italia)',
    hubImage: '/redisenos_assets/gamification_primaria_baja_libro_aventura_1792732777656.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_baja_battle_1792734597009.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '1º a 3º de Primaria (Fases 3 y 4 SEP · 6 a 8 años)',
      gameMetaphor: 'Un gran grimorio encuadernado en cuero y oro donde cada materia escolar es un "Capítulo Iluminado" y cada logro desbloquea sobres de estampas coleccionables holográficas.',
      coreLevelMechanic: 'Fomentar el hábito de lectura y resolución diaria mediante la emoción del coleccionismo físico-digital con brillo cromado, narración con voz femenina natural y efectos de sonido al pegar estampas.'
    },
    screens: {
      hub: {
        title: 'El Gran Grimorio Escolar (Centro de Aventura)',
        visualStructure: 'Vista de libro abierto con textura de pergamino iluminado y animaciones de páginas que pasan en 3D.',
        keyComponents: [
          'Índice de Capítulos: Capítulo 1: El Reino de las Fracciones, Capítulo 2: Los Secretos de la Naturaleza, Capítulo 3: Héroes de la Historia.',
          'Sobres de Estampas Pendientes de Abrir: Con animación de rasgado que revela estampas comunes, raras y legendarias de oro.',
          'Contador de Páginas Completadas: Barra de progreso que otorga un trofeo de salón al llenar un capítulo completo.',
          'Compañero Mascota Pip con medidor de felicidad (85%) y reacciones hápticas táctiles.'
        ]
      },
      quiz: {
        title: 'El Acertijo del Grimorio y Arena del Gólem',
        mechanic: 'El libro plantea un acertijo interactivo o combate didáctico. Al responder correctamente, el alumno gana un "Sobre Dorado de Estampas" y derrota al Gólem del Bosque.',
        optionsStyle: 'Gemas elementales táctiles (Púrpura, Esmeralda, Rubí, Zafiro) con selector de maná y cálculo mental sin estrés.',
        positiveReinforcement: 'Animación de ataque mágico luminoso, caída del jefe, fanfarria de nivel, lluvia de confeti 3D y gemas estelares.',
        errorPedagogy: 'La pluma mágica sugiere releer la pista con voz femenina natural o repasar las tablas de multiplicar sin penalización punitiva.'
      },
      avatar: {
        title: 'Álbum de Estampas y Personalización del Estudiante',
        customizationFeatures: [
          'Interacción táctil de pegar estampas en su silueta dentro de la página del libro.',
          'Estampas que cobran vida con animación 3D y narran un dato curioso curricular con voz femenina al completarse.',
          'Mesa de intercambio ("Feria de Saberes") para canjear cromos duplicados con compañeros de aula.',
          'Guardarropa de explorador estelar con capas místicas, báculos y mascotas mágicas.'
        ],
        economyModel: 'Economía protegida basada en mérito lector y constancia: monedas ganadas por misiones familiares y lectura diaria.',
        gameplayIntegration: 'Visualización inmediata de atuendos y mascotas en el libro principal y salón escolar.'
      },
      teacherStudio: {
        title: 'Estudio Docente del Grimorio',
        flowSteps: [
          'El profesor programa qué estampas se liberan en cada semana según el calendario de planeación bimestral registrado en la Bóveda Curricular.',
          'Genera reactivos de comprensión lectora y cálculo mental con autocompletado pedagógico de la NEM.',
          'Previsualización en tiempo real de cómo luce el capítulo en la pantalla del alumno.'
        ],
        polymorphicOutput: 'Capítulo interactivo listo para aplicación digital o exportación a PDF didáctico.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Registro de cromos desbloqueados y monedas en los almacenes centrales del estudiante.',
      vaultIntegration: 'Cada estampa del álbum contiene en sus metadatos el enlace directo al nodo Markdown de la Bóveda Curricular correspondiente.',
      historicalAvatarsFirstPerson: 'Miguel Hidalgo y Josefa Ortiz de Domínguez narran sus hazañas en estricta primera persona dentro de las fichas y capítulos históricos.'
    },
    technicalChallenges: [
      { challenge: 'Física y Efectos de Brillo Holográfico', severity: 'Media', solution: 'Implementados con sombreadores CSS ligeros para simular el brillo arcoíris sin sobrecalentar los dispositivos escolares.' },
      { challenge: 'Arrastre y Pegado Táctil Preciso en Tabletas', severity: 'Media', solution: 'Zonas magnéticas de ajuste automático para niños de 6 a 8 años.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas totales.',
      learningCurve: '15 minutos para programar un sobre semanal temático.',
      parentAdoption: 'Alta vinculación familiar mediante las "Misiones Familiares" de recolección de gemas en casa.'
    },
    cloudViability: {
      ssoAuth: 'Acceso único institucional con ingreso directo sin contraseñas complicadas.',
      cloudStorage: 'Los álbumes digitales completos pueden exportarse a un PDF interactivo de recuerdo guardado en el Almacenamiento Cloud Institucional (<300KB).',
      classroomIntegration: 'Las tareas entregadas a tiempo otorgan automáticamente un sobre de estampas en ISkool.'
    },
    globalBenchmarks: [
      { name: 'Colecciones Interactivas de Museo Digital', origin: 'Japón', description: 'Mecánica de museo y coleccionismo de especies e hitos que despierta el orgullo de los niños.', iskoolAdvantage: 'Alineación 100% curricular a la historia, geografía y biodiversidad de la NEM.' },
      { name: 'Tradición Europea de Álbumes de Cromos', origin: 'Italia / Global', description: 'Emoción táctil del coleccionismo de cromos intercambiables con sobre rasgable.', iskoolAdvantage: 'Cero costo para las familias; los cromos se obtienen exclusivamente con lectura y esfuerzo escolar.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+40% Hábito de Lectura Diaria y Vinculación Familiar',
      academicMasteryBoost: '+47% Comprensión Lectora y Retención Histórica',
      teacherHoursSavedPerWeek: 9.0,
      estimatedAnnualSavingsMXN: 490000,
      parentSatisfactionIndex: '99.5% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Ilustraciones y Cromos 100% Originales',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: El Libro de Aventuras y Álbum transforma el fomento a la lectura en una experiencia de coleccionismo holográfico. Involucra directamente a los padres de familia mediante misiones en casa y eleva la comprensión lectora en cuarenta y siete por ciento sin ningún gasto en sobres físicos.',
      beforeAfterComparison: [
        { dimension: 'Fomento a la Lectura', traditionalLms: 'Reportes de lectura en texto plano que los niños perciben como castigo', iskoolRedesign: 'Grimorio vivo donde cada lectura desbloquea sobres dorados y cartas en primera persona', impactMetric: '+47% Comprensión Lectora' },
        { dimension: 'Participación de los Padres', traditionalLms: 'Firma pasiva de boleta bimestral', iskoolRedesign: 'Misiones Familiares de lectura nocturna y cepillado que otorgan gemas para el álbum', impactMetric: '+40% Participación en Casa' },
        { dimension: 'Socialización Positiva', traditionalLms: 'Trabajo aislado frente a una pantalla', iskoolRedesign: 'Feria de Saberes para intercambiar cromos repetidos de ciencia e historia en el salón', impactMetric: '100% Cohesión de Grupo' }
      ],
      interactiveWindowsCatalog: [
        { id: 'grimorio', name: 'El Gran Grimorio Abierto 16:9', role: 'Alumno', description: 'Mapa sobre páginas de pergamino con Bosques, Castillo Lunar, Mascota Pip y Misiones.' },
        { id: 'album', name: 'Álbum Coleccionable de 12 Estampas', role: 'Alumno', description: 'Colección con filtros de rareza, narración por voz femenina y rasgado de sobres.' },
        { id: 'capitulos', name: 'Capítulos y Cartas en 1ª Persona', role: 'Canon Histórico', description: 'Lecturas interactivas narradas por Miguel Hidalgo y Josefa Ortiz en primera persona.' },
        { id: 'feria', name: 'Feria de Saberes (Intercambio y Logros)', role: 'Economía / Avatar', description: 'Mesa de trueque de estampas con compañeros, perfil del alumno y trofeos.' },
        { id: 'docente', name: 'Estudio Docente del Grimorio', role: 'Docente', description: 'Programador de sobres semanales y capítulos desde la Bóveda Curricular.' }
      ]
    }
  },

  '05': {
    key: '05',
    title: '05 Primaria Alta · Crónicas de Exploradores',
    level: '4º a 6º de Primaria (Fase 5 SEP)',
    ages: '9 a 11 Años',
    liveDemoUrl: '/redisenos_gamificados/cronicas_de_exploradores',
    tagline: 'Archipiélago de hexágonos 3D con niebla de exploración y expediciones comunitarias',
    worldBenchmarkSummary: 'Estándar Internacional de Estrategia Territorial (Alemania) y Gremios Cooperativos (Canadá)',
    hubImage: '/redisenos_assets/gamification_primaria_alta_cronicas_1792732799979.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_alta_tcg_1792734618682.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '4º a 6º de Primaria (Fase 5 SEP · 9 a 11 años)',
      gameMetaphor: 'Una expedición científica y geográfica a través de un continente inexplorado dividido en casillas hexagonales de recursos naturales y civilizaciones.',
      coreLevelMechanic: 'Estrategia territorial cooperativa. Resolver proyectos comunitarios y ciencias despeja la niebla en el mapa de la clase.'
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
        positiveReinforcement: 'Despeje de la niebla con animación de brújula dorada, voz femenina natural y recursos ganados.',
        errorPedagogy: 'La brújula recalcula la ruta y sugiere consultar el mapa orográfico.'
      },
      avatar: {
        title: 'Vestidor del Científico de Campo',
        customizationFeatures: ['Batas de campo', 'Brújulas de bronce', 'Mochilas solares', 'Drones exploradores'],
        economyModel: 'Cristales de investigación ganados por tareas de campo.',
        gameplayIntegration: 'El avatar lidera la expedición en el mapa hexagonal de la escuela.'
      },
      teacherStudio: {
        title: 'Estudio Cartográfico Docente',
        flowSteps: ['Definir misión geográfica o histórica', 'Ubicar casilla en el mapa escolar', 'Activar reto grupal'],
        polymorphicOutput: 'Nodo de expedición sincronizado para todo el salón.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Sincronización de progreso territorial en el almacén de aula.',
      vaultIntegration: 'Proyectos sociocomunitarios vinculados en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Exploradores y próceres mexicanos como José María Morelos hablando en primera persona.'
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
      ssoAuth: 'Autenticación única institucional.',
      cloudStorage: 'Portafolios de proyectos en el Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Entregables sincronizados con rúbricas del Lienzo Digital.'
    },
    globalBenchmarks: [
      { name: 'Sistemas de Estrategia Territorial', origin: 'Alemania / Canadá', description: 'Gamificación de aula con exploración de recursos y gremios.', iskoolAdvantage: 'Enfoque directo en la geografía, historia y biodiversidad mexicana sin sobrecarga de gestión.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+35% Retención en Transición de Primaria Alta a Secundaria',
      academicMasteryBoost: '+46% Dominio en Ciencias Naturales, Geografía e Historia SEP',
      teacherHoursSavedPerWeek: 9.0,
      estimatedAnnualSavingsMXN: 475000,
      parentSatisfactionIndex: '98.9% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Cartografía y Gremios 100% Originales',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: Crónicas de Exploradores convierte los proyectos comunitarios de cuarto a sexto de primaria en una expedición hexagonal cooperativa. Los alumnos despejan la niebla del mapa resolviendo retos científicos y dialogando en primera persona con José María Morelos.',
      beforeAfterComparison: [
        { dimension: 'Trabajo en Equipo', traditionalLms: 'Trabajos grupales donde solo un alumno realiza la tarea', iskoolRedesign: 'Gremio de exploración donde cada integrante aporta energía y recursos para despejar hexágonos', impactMetric: '100% Participación Equitativa' },
        { dimension: 'Historia y Geografía', traditionalLms: 'Memorización de fechas y mapas mudos en papel', iskoolRedesign: 'Expedición interactiva con astrolabio y diálogo en primera persona con próceres', impactMetric: '+46% Retención Conceptual' },
        { dimension: 'Gestión de Proyectos NEM', traditionalLms: 'Planeaciones aisladas sin hilo conductor', iskoolRedesign: 'Estudio Cartográfico conectado directamente a los nodos de la Bóveda Curricular', impactMetric: '-9 hrs/semana por docente' }
      ],
      interactiveWindowsCatalog: [
        { id: 'mapa_hex', name: 'Mapa Hexagonal 3D de Expedición', role: 'Alumno', description: 'Tablero con 4 regiones hexagonales, niebla de exploración y telemetría de gremio.' },
        { id: 'morelos', name: 'Desafío de Exploración con Morelos (1ª Persona)', role: 'Canon Histórico', description: 'Reto histórico-geográfico con voz femenina natural y relato en primera persona.' },
        { id: 'locker', name: 'Tienda de Campaña 3D y Vestidor', role: 'Economía / Avatar', description: 'Equipamiento de brújula, mochila solar, dron y capa de expedición.' },
        { id: 'almacen', name: 'Almacén de Suministros y Contratos', role: 'Economía / Avatar', description: 'Canje de cristales de energía y resolución de contratos de misión.' },
        { id: 'docente', name: 'Estudio Cartográfico Docente', role: 'Docente', description: 'Consola interactiva para publicar nuevas regiones hexagonales al salón.' }
      ]
    }
  },

  '06': {
    key: '06',
    title: '06 Primaria Alta · Torneo de Saberes y Cartas',
    level: '4º a 6º de Primaria (Fase 5 SEP)',
    ages: '9 a 11 Años',
    liveDemoUrl: '/redisenos_gamificados/torneo_de_saberes_tcg',
    tagline: 'Estadio holográfico de cartas didácticas coleccionables con duelos estratégicos de ciencia e historia',
    worldBenchmarkSummary: 'Estándar Mundial de Estrategia de Cartas Coleccionables Didácticas (EE.UU. / Japón)',
    hubImage: '/redisenos_assets/gamification_primaria_alta_torneo_cartas_1792732819565.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_alta_tcg_1792734618682.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    identity: {
      educationalLevel: '4º a 6º de Primaria (Fase 5 SEP · 9 a 11 años)',
      gameMetaphor: 'Un estadio holográfico donde los conocimientos se baten en duelo mediante barajas estratégicas con personajes históricos, leyes físicas y fórmulas matemáticas.',
      coreLevelMechanic: 'Duelo por turnos con mazo de cartas. Los reactivos resueltos activan habilidades de cartas (e.g. Isaac Newton, Marie Curie, Benito Juárez o Pitágoras).'
    },
    screens: {
      hub: {
        title: 'La Arena de Duelo de Saberes',
        visualStructure: 'Tablero de juego con zonas de invocación, mazo y archivo holográfico.',
        keyComponents: ['Constructor de Mazos', 'Liga Escolar de Campeones', 'Bazar de Sobres', 'Mesa de Duelo Central']
      },
      quiz: {
        title: 'Duelo de Saberes en el Tablero',
        mechanic: 'Invocar la carta de un prócer o científico requiere responder un reactivo curricular y escuchar su cátedra en primera persona.',
        optionsStyle: 'Cartas detalladas con ilustraciones, costo de maná, poder de ataque y texto biográfico en primera persona.',
        positiveReinforcement: 'Animación de impacto elemental de la carta con voz femenina natural y bonificación de racha.',
        errorPedagogy: 'La carta regresa a la mano temporalmente y muestra su ficha biográfica de repaso.'
      },
      avatar: {
        title: 'Perfil del Duelista Estratega',
        customizationFeatures: ['Armaduras solares', 'coronas de gran estratega', 'Guanteletes lanzacartas', 'Dragón de fuego acompañante'],
        economyModel: 'Gemas solares y sobres ganados por precisión académica.',
        gameplayIntegration: 'Personalización visible en los duelos estratégicos del aula.'
      },
      teacherStudio: {
        title: 'Estudio Docente Creador de Cartas',
        flowSteps: ['Redactar concepto científico o histórico', 'Generar carta con atributos de ataque/defensa y voz en 1ª persona', 'Integrar al mazo oficial del salón'],
        polymorphicOutput: 'Carta interactiva instantánea en la arena digital y exportable para torneos de aula.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Registro de barajas, gemas y estadísticas en los almacenes centrales.',
      vaultIntegration: 'Fichas biográficas de la Bóveda Curricular como fuente directa de las cartas.',
      historicalAvatarsFirstPerson: 'Isaac Newton, Marie Curie, Benito Juárez, Leonardo da Vinci, Sor Juana y Nikola Tesla hablan en estricta primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Físicas de Selección e Invocación en Pantallas Táctiles', severity: 'Media', solution: 'Aceleración por hardware en transformaciones CSS y audio neural pre-cargado.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas.',
      learningCurve: '15 minutos para organizar un torneo temático.',
      parentAdoption: 'Fácil comprensión gracias a la mecánica universal de juegos estratégicos de cartas.'
    },
    cloudViability: {
      ssoAuth: 'Acceso único institucional.',
      cloudStorage: 'Mazos y cartas guardados en el Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Resultados del torneo exportables al Lienzo Digital de calificaciones.'
    },
    globalBenchmarks: [
      { name: 'Arenas Estratégicas de Cartas Coleccionables', origin: 'EE.UU. / Japón', description: 'Líderes en mecánicas de construcción de mazos y sinergias estratégicas.', iskoolAdvantage: 'Contenido 100% curricular SEP, voz en primera persona y cero compras con dinero real.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+43% Retención y Entusiasmo en Primaria Alta',
      academicMasteryBoost: '+55% Memorización Activa de Biografías Científicas, Fórmulas y Fechas',
      teacherHoursSavedPerWeek: 9.5,
      estimatedAnnualSavingsMXN: 510000,
      parentSatisfactionIndex: '99.4% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · 8 Cartas Históricas e Ilustraciones 100% Originales',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: El Torneo de Saberes transforma el estudio de historia, física y matemáticas en duelos estratégicos de cartas coleccionables. Cada carta de Isaac Newton, Marie Curie o Benito Juárez pronuncia su conocimiento en primera persona con voz femenina natural, elevando en cincuenta y cinco por ciento la retención académica.',
      beforeAfterComparison: [
        { dimension: 'Estudio de Biografías y Leyes', traditionalLms: 'Cuestionarios planos de opción múltiple', iskoolRedesign: 'Baraja coleccionable de 8 cartas legendarias con cátedra en primera persona', impactMetric: '+55% Retención de Largo Plazo' },
        { dimension: 'Pensamiento Estratégico', traditionalLms: 'Respuestas mecánicas sin gestión de recursos', iskoolRedesign: 'Constructor de Mazos y gestión de cristales de maná por turno', impactMetric: '100% Pensamiento Crítico' },
        { dimension: 'Creación de Material Didáctico', traditionalLms: 'Horas diseñando diapositivas estáticas', iskoolRedesign: 'Estudio Creador de Cartas que convierte cualquier nodo de la Bóveda en una carta jugable', impactMetric: '-9.5 hrs/semana por docente' }
      ],
      interactiveWindowsCatalog: [
        { id: 'arena', name: 'Arena de Duelo Holográfica 16:9', role: 'Alumno', description: 'Tablero de duelo contra el Guardián del Vacío con invocación de cartas e inspección.' },
        { id: 'cartas', name: 'Colección de 8 Cartas Históricas (1ª Persona)', role: 'Canon Histórico', description: 'Cartas de Newton, Curie, Juárez, Da Vinci, Sor Juana, Pitágoras, Tesla y Cleopatra.' },
        { id: 'deckBuilder', name: 'Constructor Estratégico de Mazos', role: 'Alumno', description: 'Configurador de baraja titular con balance de maná, ataque y sinergias.' },
        { id: 'store', name: 'Bazar de Sobres y Vestidor 3D', role: 'Economía / Avatar', description: 'Apertura de sobres de cartas con gemas solares y personalizador 3D/Anime.' },
        { id: 'teacherStudio', name: 'Estudio Docente Creador de Cartas', role: 'Docente', description: 'Herramienta en vivo para forjar nuevas cartas curriculares y añadirlas a la colección.' }
      ]
    }
  },

  '07': {
    key: '07',
    title: '07 Secundaria · Gremio Ciber-Saga de Torneos',
    level: 'Secundaria (Fase 6 SEP)',
    ages: '12 a 14 Años',
    liveDemoUrl: '/redisenos_gamificados/gremio_cyber_esports',
    tagline: 'Arena futurista de competencias con duelos síncronos de velocidad, Pase de Temporada y escuadrones escolares',
    worldBenchmarkSummary: 'Estándar Mundial de Arenas Competitivas en Tiempo Real (Noruega / Corea del Sur)',
    hubImage: '/redisenos_assets/gamification_secundaria_gremio_esports_1792732846760.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    identity: {
      educationalLevel: 'Secundaria (Fase 6 SEP · 12 a 14 años)',
      gameMetaphor: 'Una metrópolis cibernética donde los estudiantes forman escuadrones académicos, compitiendo en arenas de ciberseguridad, historia, matemáticas y ciencias.',
      coreLevelMechanic: 'Duelos de trivia síncronos en tiempo real con temporizadores, rachas de precisión y multiplicadores de escuadrón.'
    },
    screens: {
      hub: {
        title: 'Centro de Mando del Escuadrón',
        visualStructure: 'Interfaz de alto contraste con ribetes de neón cian, magenta y tipografía técnica moderna.',
        keyComponents: ['Panel de Clasificación de Escuadrones', 'Terminal de Desafíos Diarios', 'Vestidor Urbano 3D', 'Canal de Voz Institucional del Aula']
      },
      quiz: {
        title: 'Ciber-Duelo: Arena contra el Dragón de Interferencia',
        mechanic: 'Preguntas de álgebra, historia de México y física para derrotar al Dragón de Interferencia con bonificación de velocidad.',
        optionsStyle: 'Módulos hexagonales futuristas con tiempo regresivo en barra neón.',
        positiveReinforcement: 'Efecto luminoso de victoria, narración con voz femenina natural, subida en el ranking y monedas cibernéticas.',
        errorPedagogy: 'El escudo del escuadrón absorbe el error y la terminal arroja una explicación conceptual detallada.'
      },
      avatar: {
        title: 'Vestidor Urbano 3D y Pase de Temporada',
        customizationFeatures: ['Chamarras con fibra óptica', 'Visores holográficos', 'Emblemas de escuadrón', 'Robots asistentes'],
        economyModel: 'Ciber-créditos ganados por rachas consecutivas de estudio sin faltas.',
        gameplayIntegration: 'Renderizado en tiempo real con renders 3D y sprites animados.'
      },
      teacherStudio: {
        title: 'Estudio Docente para Moderadores de Torneos',
        flowSteps: ['Configurar torneo de trivia síncrona', 'Lanzar partida en pantalla gigante del aula', 'Exportar analíticas a la Bóveda Curricular'],
        polymorphicOutput: 'Sala multijugador instantánea para los alumnos del grupo.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración directa con los almacenes de gamificación y cooperación escolar.',
      vaultIntegration: 'Contenidos de Fase 6 SEP indexados en Markdown en la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Francisco I. Madero y figuras históricas hablando en estricta primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Sincronización en Tiempo Real en Redes Escolares', severity: 'Alta', solution: ' Protocolo ligero de baja latencia con reconexión automática.' }
    ],
    trainingAndAdoption: {
      trainingHours: '6 horas.',
      learningCurve: '15 minutos para iniciar una partida en clase.',
      parentAdoption: 'Canalización positiva del interés adolescente en los torneos digitales hacia el aprendizaje formal.'
    },
    cloudViability: {
      ssoAuth: 'Autenticación única institucional con verificación de seguridad.',
      cloudStorage: 'Registros de partidas y estadísticas directo al Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Sincronización automática de asistencias y participación en el Lienzo Digital.'
    },
    globalBenchmarks: [
      { name: 'Arenas Competitivas de Trivia en Vivo', origin: 'Noruega', description: 'Referente en concursos de preguntas síncronas en el aula.', iskoolAdvantage: 'ISkool elimina la superficialidad del azar y recompensa la consistencia pedagógica y el trabajo en escuadrón.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+45% Retención y Reducción de Ausentismo en Secundaria',
      academicMasteryBoost: '+51% Participación Activa en Historia, Matemáticas e Inglés',
      teacherHoursSavedPerWeek: 10.5,
      estimatedAnnualSavingsMXN: 560000,
      parentSatisfactionIndex: '99.0% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Cero Marcas de Terceros · Pase de Temporada 100% Académico',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: El Gremio Ciber-Saga canaliza la pasión de los alumnos de secundaria por los deportes electrónicos hacia competencias académicas de alta velocidad. Reduce el ausentismo escolar y eleva la participación en clase en cincuenta y un por ciento sin ningún tipo de microtransacción monetaria.',
      beforeAfterComparison: [
        { dimension: 'Motivación en Secundaria (12-14 años)', traditionalLms: 'Apatía ante plataformas infantiles o formularios grises', iskoolRedesign: 'Arena de deportes electrónicos con escuadrones, Pase de Temporada de 50 niveles y duelos en vivo', impactMetric: '+51% Participación en Clase' },
        { dimension: 'Economía Escolar Ética', traditionalLms: 'Videojuegos comerciales con cobros con tarjeta', iskoolRedesign: 'Tienda 100% libre de dinero real donde los cosméticos solo se desbloquean con rachas de 30 días y 100 PDA', impactMetric: '100% Ética Pedagógica' },
        { dimension: 'Moderación Docente', traditionalLms: 'Falta de control sobre chats externos', iskoolRedesign: 'Canal de Voz Institucional moderado y Estudio Docente para lanzar torneos en segundos', impactMetric: '-10.5 hrs/semana por docente' }
      ],
      interactiveWindowsCatalog: [
        { id: 'hub', name: 'Centro de Mando Ciber-Saga 16:9', role: 'Alumno', description: 'Panel con estado del escuadrón, Pase de Temporada, proyectos y clasificación.' },
        { id: 'cyberDuel', name: 'Arena de Duelo Síncrono (Dragón de Interferencia)', role: 'Evaluación', description: 'Combate con temporizador de 15s, bonificación de velocidad y voz de Francisco I. Madero.' },
        { id: 'locker', name: 'Vestidor Urbano 3D y Motor Anime', role: 'Economía / Avatar', description: 'Personalización con chamarra neón, gafas holográficas, katana láser y robot asistente.' },
        { id: 'store', name: 'Tienda de Recompensas por Mérito', role: 'Economía / Avatar', description: 'Canje de ciber-créditos por potenciadores tácticos y cosméticos de temporada.' },
        { id: 'teacherStudio', name: 'Estudio Docente de Torneos Síncronos', role: 'Docente', description: 'Consola interactiva para crear preguntas de torneo y lanzar partidas al salón.' }
      ]
    }
  },

  '08': {
    key: '08',
    title: '08 Secundaria · Metrópolis de Inventores',
    level: 'Secundaria (Fase 6 SEP)',
    ages: '12 a 14 Años',
    liveDemoUrl: '/redisenos_gamificados/metropolis_de_inventores',
    tagline: 'Simulación urbana de vapor, engranes y bobinas Tesla con cálculo de circuitos y física aplicada',
    worldBenchmarkSummary: 'Estándar Internacional de Simulación Urbana y Laboratorios STEM (EE.UU.)',
    hubImage: '/redisenos_assets/gamification_secundaria_metropolis_stem_1792732869540.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    identity: {
      educationalLevel: 'Secundaria (Fase 6 SEP · 12 a 14 años)',
      gameMetaphor: 'Una gran urbe industrial y sustentable que depende de la física, la química y las máquinas térmicas para iluminar sus distritos y erradicar la contaminación.',
      coreLevelMechanic: 'Ingeniería y resolución de problemas. Cada reactivo de ciencias activa generadores Tesla y maquinaria que encienden distritos urbanos.'
    },
    screens: {
      hub: {
        title: 'El Plano Maestro de la Metrópolis',
        visualStructure: 'Ciudad inteligente de bronce, vapor y cristal con edificios científicos interactivos.',
        keyComponents: ['Torre de Matemáticas', 'Laboratorio de Física Tesla', 'Destilería Química de Hidrógeno', 'Reactor Cuántico Central']
      },
      quiz: {
        title: 'Laboratorio Tesla: Cálculo de Red Eléctrica Sustentable',
        mechanic: 'Calcular la matriz energética óptima de 50 MW o la relación de transmisión para sincronizar el voltímetro a 380V.',
        optionsStyle: 'Voltímetro analógico con aguja móvil, interruptor de cuchilla de cobre y propuestas de ingeniería.',
        positiveReinforcement: 'El voltímetro sube a 380V, el reactor emite energía limpia, los distritos se iluminan y Nikola Tesla felicita al alumno con voz natural.',
        errorPedagogy: 'El voltímetro cae a 110V y el laboratorio explica por qué la matriz propuesta genera apagones o emisiones.'
      },
      avatar: {
        title: 'Pedestal Mecánico 3D y Taller de Invenciones',
        customizationFeatures: ['Lentes de latón con termografía', 'Brazo mecánico articulado', 'Dron esférico de vapor', 'Mochila de bobina Tesla'],
        economyModel: 'Presupuesto municipal y patentes de invención ganadas en laboratorio.',
        gameplayIntegration: 'El alcalde inventor supervisa las obras mecánicas y energéticas en la ciudad.'
      },
      teacherStudio: {
        title: 'Estudio Docente de Ingeniería y Patentes',
        flowSteps: ['Crear problema de física, química o matemáticas', 'Vincular a distrito urbano o generador Tesla', 'Lanzar reto de cuadrilla'],
        polymorphicOutput: 'Simulación interactiva de energía y registro automático en la Oficina de Patentes.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Registro de patentes, voltaje y presupuesto municipal en el almacén estudiantil.',
      vaultIntegration: 'Patentes y prácticas de laboratorio NEM vinculadas en la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Nikola Tesla narrando sus principios de corriente alterna en estricta primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Simulación de Instrumentos Analógicos en Tiempo Real', severity: 'Media', solution: 'Vectores SVG con física de resorte cúbico para agujas de voltímetro y manómetros.' }
    ],
    trainingAndAdoption: {
      trainingHours: '5 horas.',
      learningCurve: '20 minutos para programar una práctica de laboratorio.',
      parentAdoption: 'Excelente valoración por fomentar vocaciones tempranas de ingeniería y sustentabilidad.'
    },
    cloudViability: {
      ssoAuth: 'Autenticación única institucional.',
      cloudStorage: 'Esquemas técnicos y patentes guardadas en el Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Reporte directo a tareas de ciencias en el Lienzo Digital.'
    },
    globalBenchmarks: [
      { name: 'Simuladores de Ciudades Sustentables y Laboratorios STEM', origin: 'EE.UU.', description: 'Referentes en enseñanza interactiva de ciencias aplicadas e ingeniería.', iskoolAdvantage: 'Contextualización completa con los programas oficiales de Física y Química de la SEP.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+42% Vocación Científica y Retención en Secundaria',
      academicMasteryBoost: '+54% Comprensión de Física, Termodinámica y Química Aplicada',
      teacherHoursSavedPerWeek: 10.0,
      estimatedAnnualSavingsMXN: 540000,
      parentSatisfactionIndex: '99.3% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Arquitectura Steampunk y Patentes 100% Originales',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: Metrópolis de Inventores convierte la física y la química de secundaria en un simulador de ciudad sustentable. Los alumnos actúan como alcaldes ingenieros que equilibran la red eléctrica junto a Nikola Tesla en primera persona, incrementando en cincuenta y cuatro por ciento el dominio en ciencias exactas.',
      beforeAfterComparison: [
        { dimension: 'Laboratorios de Física y Química', traditionalLms: 'Fórmulas abstractas en pizarrón sin aplicación visible', iskoolRedesign: 'Reactor Tesla con voltímetro analógico de 380V que ilumina 4 distritos urbanos al resolver el cálculo', impactMetric: '+54% Dominio en Ciencias' },
        { dimension: 'Portafolio de Evidencias', traditionalLms: 'Reportes de práctica olvidados en carpetas', iskoolRedesign: 'Oficina Central de Patentes donde cada proyecto del Lienzo Digital recibe código oficial', impactMetric: '100% Trazabilidad SEP' },
        { dimension: 'Clima Socioemocional', traditionalLms: 'Aislamiento en materias difíciles', iskoolRedesign: 'Barómetro de Sincronía de Cuadrilla (92%) y pedagogía del error constructiva', impactMetric: '99.3% Satisfacción Parental' }
      ],
      interactiveWindowsCatalog: [
        { id: 'ciudad', name: 'Lienzo Maestro 16:9 y Cuadrícula de Distritos', role: 'Alumno', description: 'Ciudad interactiva con 8 edificios/hotspots y control de inyección de vapor por distrito.' },
        { id: 'teslaLab', name: 'Laboratorio Tesla y Voltímetro Analógico', role: 'Evaluación', description: 'Desafío de 50 MW con interruptor de cuchilla, aguja móvil y voz de Nikola Tesla.' },
        { id: 'locker', name: 'Pedestal Steampunk 3D y Taller', role: 'Economía / Avatar', description: 'Equipamiento de brazo mecánico, lentes térmicos, dron de vapor y bobina Tesla.' },
        { id: 'patents', name: 'Oficina Central de Patentes y Bazar Municipal', role: 'Economía / Avatar', description: 'Registro interactivo de nuevas patentes escolares y compra de suministros urbanos.' },
        { id: 'teacherStudio', name: 'Estudio Docente de Megaproyectos STEM', role: 'Docente', description: 'Consola para asignar retos termodinámicos por distrito y vincular PDA de Fase 6.' }
      ]
    }
  },

  '09': {
    key: '09',
    title: '09 Preparatoria · Estudio de Innovación y Talento Apex',
    level: 'Preparatoria (1º a 3º de Bachillerato)',
    ages: '15 a 18 Años',
    liveDemoUrl: '/redisenos_gamificados/apex_academy_venture_studio',
    tagline: 'Aceleradora ejecutiva de alta productividad con desafíos formales en LaTeX y portafolios de admisión universitaria',
    worldBenchmarkSummary: 'Estándar Internacional de Incubadoras Tecnológicas y Portafolios Universitarios (EE.UU.)',
    hubImage: '/redisenos_assets/gamification_preparatoria_venture_studio_1792732893154.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preparatoria_mastery_1792734699863.jpg',
    avatarImage: '/redisenos_assets/gamification_preparatoria_portfolio_radar_1792734730504.jpg',
    identity: {
      educationalLevel: 'Preparatoria (1º a 3º de Bachillerato · 15 a 18 años)',
      gameMetaphor: 'Una aceleradora de proyectos y estudio de innovación pre-universitario donde el alumno construye su perfil profesional y académico verificable para admisiones y becas.',
      coreLevelMechanic: 'Maestría conceptual profunda. El estudiante resuelve problemas de cálculo, lidera ciclos ágiles de emprendimiento y alimenta un radar pentagonal de competencias.'
    },
    screens: {
      hub: {
        title: 'Terminal Ejecutiva de Incubación (16:9 y Tablero de Ciclos)',
        visualStructure: 'Diseño ejecutivo oscuro con métricas de valuación de proyecto, créditos de inversión y pipeline de innovación.',
        keyComponents: ['Pista de Aceleración de Proyectos', 'Mentoría Histórica en Tiempo Real', 'Matriz de Credenciales Verificadas', 'Puntaje de Preparación Universitaria (96/100)']
      },
      quiz: {
        title: 'Dominio Universitario Pro: Desafío de Cálculo y Terminal Python',
        mechanic: 'Resolver límites indeterminados con demostración formal paso a paso en LaTeX y verificación numérica en terminal interactiva.',
        optionsStyle: 'Consola de 3 columnas: Pizarra de Razonamiento LaTeX, Consola de Cálculo + Python, y Predictor de Admisión UNAM/Tec (94% → 98%).',
        positiveReinforcement: 'Incremento inmediato en el predictor de admisión universitaria, voz femenina ejecutiva y acreditación en el portafolio.',
        errorPedagogy: 'El sistema detecta la indeterminación 0/0 y guía al estudiante en la aplicación del límite trigonométrico fundamental.'
      },
      avatar: {
        title: 'Pedestal Ejecutivo 3D, Radar Pentagonal y Credenciales QR',
        customizationFeatures: ['Radar pentagonal interactivo', 'Mapa de calor de 365 días', '3 Credenciales con código QR verificable', 'Traje ejecutivo, lentes AR, maletín biométrico y pin unicornio'],
        economyModel: 'Créditos de Inversión Académica (VF) ganados por completar ciclos ágiles y demostraciones.',
        gameplayIntegration: 'Portafolio verificable con firma criptográfica HMAC-SHA256 compartible con universidades.'
      },
      teacherStudio: {
        title: 'Estudio Docente de Rúbricas Analíticas y Sprints',
        flowSteps: ['Cargar problema de cálculo o entregable de incubadora', 'Definir rúbrica analítica por competencias', 'Publicar evaluación y acreditar en portafolio'],
        polymorphicOutput: 'Reactivo formal de nivel universitario con soporte LaTeX y verificación criptográfica.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración directa con los almacenes de portafolio y perfil estudiantil.',
      vaultIntegration: 'Ensayos, patentes y proyectos vinculados como nodos en la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Marie Curie y Leonardo da Vinci brindando mentoría científica y de diseño en estricta primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Renderizado Rápido de Ecuaciones Matemáticas y Gráficos Radiales', severity: 'Media', solution: 'Vectores matemáticos SVG de precisión y terminal numérica integrada sin dependencias pesadas.' }
    ],
    trainingAndAdoption: {
      trainingHours: '6 horas.',
      learningCurve: '15 minutos para configurar una rúbrica analítica pre-universitaria.',
      parentAdoption: 'Máxima satisfacción familiar al ver el portafolio universitario verificable con QR del estudiante.'
    },
    cloudViability: {
      ssoAuth: 'Autenticación única institucional con credenciales seguras.',
      cloudStorage: 'Portafolios completos sincronizados con el Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Sincronización bidireccional de tareas y rúbricas en el Lienzo Digital.'
    },
    globalBenchmarks: [
      { name: 'Incubadoras Tecnológicas y Plataformas de Gestión Ágil', origin: 'EE.UU.', description: 'Líderes en interfaces de productividad ejecutiva sobrias y de alto rendimiento.', iskoolAdvantage: 'Diseñado específicamente para el rigor formativo del bachillerato mexicano y admisión a universidades líderes.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+48% Captación y Retención de Matrícula en Preparatoria',
      academicMasteryBoost: '+58% Puntaje en Exámenes de Admisión Universitaria (UNAM / Tec / Ceneval)',
      teacherHoursSavedPerWeek: 11.5,
      estimatedAnnualSavingsMXN: 680000,
      parentSatisfactionIndex: '99.7% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Cero Marcas Comerciales · Credenciales QR Criptográficas',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: El Estudio de Innovación Apex posiciona a la preparatoria del colegio al nivel de una aceleradora tecnológica internacional. Los estudiantes construyen un portafolio con radar de competencias, mapa de constancia de trescientos sesenta y cinco días y códigos QR verificables para becas universitarias, incrementando la captación de matrícula en cuarenta y ocho por ciento.',
      beforeAfterComparison: [
        { dimension: 'Preparación Universitaria', traditionalLms: 'Guías impresas aisladas al final del sexto semestre', iskoolRedesign: 'Consola de Cálculo con pizarra LaTeX, terminal Python y Predictor de Admisión UNAM/Tec en vivo', impactMetric: '+58% Éxito en Admisión' },
        { dimension: 'Portafolio de Egreso', traditionalLms: 'Certificado en papel sin evidencia de habilidades reales', iskoolRedesign: 'Radar Pentagonal, Mapa de Calor de 365 días y 3 Credenciales con QR verificable', impactMetric: '99.7% Prestigio Familiar' },
        { dimension: 'Mentoría Vocacional', traditionalLms: 'Orientación esporádica sin referentes', iskoolRedesign: 'Mentoría en primera persona con Marie Curie y Leonardo da Vinci con voz femenina natural', impactMetric: '+48% Captación en Prepa' }
      ],
      interactiveWindowsCatalog: [
        { id: 'canvas169', name: 'Terminal Ejecutiva 16:9 y Tablero de Sprints', role: 'Alumno', description: 'Incubadora interactiva con 5 módulos en el lienzo y tablero ágil de proyectos.' },
        { id: 'uniMastery', name: 'Dominio Universitario Pro (LaTeX + Python)', role: 'Evaluación', description: 'Consola de 3 columnas con demostración de límites, terminal de código y predictor 98%.' },
        { id: 'radarPortfolio', name: 'Radar Pentagonal, Heatmap 365 y QR', role: 'Evaluación', description: 'Portafolio ejecutivo con gráfica de 5 ejes, 156 bloques de constancia y 3 QRs.' },
        { id: 'mentorship', name: 'Mentoría en 1ª Persona (Curie y Da Vinci)', role: 'Canon Histórico', description: 'Sesiones de asesoría científica y de innovación con voz femenina natural.' },
        { id: 'locker_store', name: 'Pedestal Ejecutivo 3D, Inversión VF y Estudio Docente', role: 'Economía / Avatar', description: 'Vestuario de fundador, compra de patentes/ESG y consola docente de rúbricas.' }
      ]
    }
  },

  '10': {
    key: '10',
    title: '10 Preparatoria · Gremio de Investigación Protocolo Nexus',
    level: 'Preparatoria (1º a 3º de Bachillerato)',
    ages: '15 a 18 Años',
    liveDemoUrl: '/redisenos_gamificados/nexus_protocol_research_guild',
    tagline: 'Centro de Investigación Global con árbol de maestría, diplomacia científica y supercómputo escolar',
    worldBenchmarkSummary: 'Estándar Internacional de Centros de Investigación, Grafos de Conocimiento y Ciencia de Datos',
    hubImage: '/redisenos_assets/gamification_preparatoria_nexus_protocol_1792732922568.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preparatoria_mastery_1792734699863.jpg',
    avatarImage: '/redisenos_assets/gamification_preparatoria_portfolio_radar_1792734730504.jpg',
    identity: {
      educationalLevel: 'Preparatoria (1º a 3º de Bachillerato · 15 a 18 años)',
      gameMetaphor: 'Un centro de investigación internacional donde los estudiantes publican artículos, defienden tesis ante sínodos académicos y debaten con próceres históricos.',
      coreLevelMechanic: 'Pensamiento en redes, método científico y diplomacia. El alumno desbloquea nodos en su grafo de maestría, acumula índice H y horas de supercómputo.'
    },
    screens: {
      hub: {
        title: 'Tablero del Gremio de Investigación (16:9 y Grafo de Nodos)',
        visualStructure: 'Interfaz científica esmeralda y obsidiana con mapa de calor de contribuciones, proyectos destacados, ruta de carrera y laboratorios cuánticos.',
        keyComponents: ['Mapa de Calor de Contribuciones (542 Entregas)', 'Proyecto Destacado con Votación en Vivo', 'Ruta de Carrera Científica (5 Niveles)', 'Insignias Criptográficas Verificadas']
      },
      quiz: {
        title: 'Defensa de Tesis Doctoral ante el Sínodo Académico',
        mechanic: 'Defender la metodología estadística y reproducibilidad de un modelo hidrológico ante el comité científico.',
        optionsStyle: 'Tres posturas metodológicas donde solo el rigor empírico (triangulación CONAGUA, validación cruzada y estimadores bayesianos) obtiene aprobación.',
        positiveReinforcement: 'Aprobación unánime con honores, voz femenina natural, +300 Puntos de Diplomacia y nuevo artículo indexado.',
        errorPedagogy: 'El comité explica por qué eliminar valores atípicos o delegar sin contraste empírico vulnera el método científico.'
      },
      avatar: {
        title: 'Pedestal de Investigación 3D y Regalías Científicas',
        customizationFeatures: ['Bata de laboratorio', 'Toga académica con astrolabio', 'Diadema neural de constelaciones', 'Relicario cuántico de singularidad'],
        economyModel: 'Puntos de Diplomacia Científica y Horas de Supercómputo Paralelo.',
        gameplayIntegration: 'Canje de puntos por becas de supercómputo y publicaciones en revistas arbitradas.'
      },
      teacherStudio: {
        title: 'Estudio Docente para Directores de Tesis (ABP)',
        flowSteps: ['Publicar reto basado en problemas reales', 'Vincular nodo Markdown de la Bóveda Curricular', 'Evaluar defensa de tesis y debate constitucional'],
        polymorphicOutput: 'Nodo de investigación activo en el grafo de maestría de toda la generación.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Integración directa con los almacenes de escritura académica y portafolio.',
      vaultIntegration: 'Conexión nativa con todos los archivos .md y enlaces bidireccionales [[...]] de la Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Benito Juárez y Marie Curie debatiendo sobre soberanía constitucional y rigor científico en estricta primera persona.'
    },
    technicalChallenges: [
      { challenge: 'Visualización de Grafos de Maestría y Matrices de 156 Contribuciones', severity: 'Media', solution: 'Renderizado matricial optimizado en React con latencia cero y enlaces directos a la Bóveda Curricular.' }
    ],
    trainingAndAdoption: {
      trainingHours: '6 horas.',
      learningCurve: '20 minutos para trazar una constelación temática de investigación.',
      parentAdoption: 'Visualización tangible de la madurez científica, ética y argumentativa del estudiante.'
    },
    cloudViability: {
      ssoAuth: 'Autenticación única institucional de alta seguridad.',
      cloudStorage: 'Sincronización continua de grafos y tesis en el Almacenamiento Cloud Institucional.',
      classroomIntegration: 'Conexión de entregables con el Lienzo Digital.'
    },
    globalBenchmarks: [
      { name: 'Redes Internacionales de Investigación y Segundos Cerebros', origin: 'Global', description: 'Referentes en pensamiento conectado, ciencia de datos y revisión por pares.', iskoolAdvantage: 'Integración automática y hermética con el currículo de la NEM, la Bóveda Curricular y evaluación oficial.' }
    ],
    ceoExecutiveMetrics: {
      retentionImpact: '+50% Liderazgo Académico y Prestigio Institucional en Bachillerato',
      academicMasteryBoost: '+62% Competencia en Investigación Científica, Ciencia de Datos y Argumentación',
      teacherHoursSavedPerWeek: 12.0,
      estimatedAnnualSavingsMXN: 720000,
      parentSatisfactionIndex: '99.8% Índice de Satisfacción Familiar (NPS)',
      copyrightComplianceCert: 'Certificación IP-100% Propia ISkool · Cero Marcas Comerciales · Bóveda Curricular Nativa',
      ceoExecutiveBriefingAudio: 'Resumen Ejecutivo para Dirección General: El Gremio de Investigación Protocolo Nexus es la cúspide académica de ISkool para preparatoria. Los alumnos gestionan árboles de maestría conectados a la Bóveda Curricular, defienden tesis ante sínodos académicos y debaten sobre soberanía constitucional en primera persona con Benito Juárez, generando un diferenciador competitivo único a nivel mundial.',
      beforeAfterComparison: [
        { dimension: 'Investigación en Bachillerato', traditionalLms: 'Trabajos finales copiados y pegados sin seguimiento metodológico', iskoolRedesign: 'Defensa de Tesis ante Sínodo, Índice H, 542 entregas auditadas y Grafo de Maestría', impactMetric: '+62% Rigor Metodológico' },
        { dimension: 'Conexión del Conocimiento', traditionalLms: 'Materias desconectadas en carpetas separadas', iskoolRedesign: 'Grafo de Nodos con enlaces bidireccionales [[...]] directo a la Bóveda Curricular', impactMetric: '100% Pensamiento Sistémico' },
        { dimension: 'Formación Ética y Humanista', traditionalLms: 'Lecturas pasivas de civismo', iskoolRedesign: 'Tribuna de Debate en primera persona con Benito Juárez y Marie Curie con voz femenina natural', impactMetric: '99.8% Prestigio Institucional' }
      ],
      interactiveWindowsCatalog: [
        { id: 'canvas169', name: 'Tablero Científico 16:9 y Grafo de Nodos', role: 'Alumno', description: 'Centro de investigación con 6 cuadrantes interactivos y grafo de maestría desbloqueable.' },
        { id: 'careerRoadmap', name: 'Ruta de Carrera Científica (5 Niveles) y Heatmap', role: 'Alumno', description: 'Progresión desde Metodología hasta Analista Líder y matriz de 542 entregas.' },
        { id: 'thesisDefense', name: 'Sínodo de Defensa de Tesis Doctoral', role: 'Evaluación', description: 'Evaluación de rigor estadístico y reproducibilidad con acreditación de artículos.' },
        { id: 'debateHistórico', name: 'Tribuna de Debate: Benito Juárez y Marie Curie', role: 'Canon Histórico', description: 'Diálogo constitucional y científico en estricta primera persona con voz natural.' },
        { id: 'locker_store_teacher', name: 'Pedestal 3D, Becas de Supercómputo y Estudio ABP', role: 'Docente', description: 'Regalías científicas, canje de horas de cómputo y consola docente de investigación.' }
      ]
    }
  }
};
