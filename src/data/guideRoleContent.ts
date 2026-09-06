export interface GuideStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  badgeText: string;
  colorClass: string;
  highlights: string[];
}

export interface RoleFeature {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  benefit: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface RoleGuideData {
  roleId: 'teacher' | 'student' | 'parent' | 'admin';
  roleTitle: string;
  roleSubtitle: string;
  roleBadge: string;
  heroDescription: string;
  keyBenefits: string[];
  steps: GuideStep[];
  features: RoleFeature[];
  faq: { q: string; a: string }[];
}

export const GUIDE_ROLE_DATA: Record<string, RoleGuideData> = {
  teacher: {
    roleId: 'teacher',
    roleTitle: 'Guía Integral del Profesor & Taller Gamificado',
    roleSubtitle: 'Colegio Anglo Mexicano • Creador de Actividades, Laboratorios y Rúbricas NEM',
    roleBadge: 'Rol: Docente / Titular de Academia',
    heroDescription: 'Transforma tus clases tradicionales en aventuras gamificadas interactivas. Con ISkool puedes armar misiones por bloques, integrar simuladores científicos PhET en vivo, retar a tus alumnos con duelos RPG contra Bosses y sincronizar calificaciones con los PDA de la Nueva Escuela Mexicana.',
    keyBenefits: [
      '⚡ 16 Mecánicas Gamificadas (Drag & Drop, Escape Rooms, Crucigramas, Laboratorios PhET, Ruletas y Duelos).',
      '🤖 Retroalimentación Formativa Inmediata impulsada por IA según tus criterios y rúbricas docentes.',
      '📊 Monitoreo de Calificaciones y Evidencias en tiempo real vinculado a la matrícula oficial.',
      '🌐 Directorio integrado de 50 Simuladores Web interactivos listos para incrustar con un clic.',
      '🤝 Comunidad Docente para clonar, adaptar y compartir lecciones con colegas del colegio.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Configurar Metadatos y PDA',
        subtitle: 'Ajustes Pedagógicos de la Lección',
        description: 'Haz clic en el botón de engranaje (Ajustes) en la barra superior del Estudio. Define el título, materia, grado, Campo Formativo y el Proceso de Desarrollo de Aprendizaje (PDA) correspondiente del programa sintético de la NEM.',
        iconName: 'Settings',
        badgeText: 'Alineación Curricular',
        colorClass: 'from-purple-500 to-indigo-600',
        highlights: [
          'Vincular PDA y Campo Formativo NEM.',
          'Configurar vidas disponibles (3 por defecto).',
          'Definir tiempo límite y multiplicador de rachas.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Construir el Flujo de Nodos Didácticos',
        subtitle: 'Grafo Visual con Conexión por Flechas',
        description: 'Arrastra y añade nodos desde el dock o el catálogo (+). Conecta con un solo clic jalando desde el puerto de salida (●) de cualquier nodo hacia el siguiente para trazar el recorrido pedagógico. Cualquier nodo puede ser marcado como Inicio y los nodos sin salida son automáticamente Nodos Finales.',
        iconName: 'Workflow',
        badgeText: 'Constructor de Flujo Visual',
        colorClass: 'from-violet-500 to-purple-600',
        highlights: [
          'Jala con el ratón para trazar flechas de conexión directas entre nodos.',
          'Mueve y organiza libremente los nodos en el tablero 2D interactivo.',
          'Configura cualquier nodo haciendo clic en "Configurar" para abrir el panel lateral.',
          'Pega URLs de los 50 simuladores web compatibles sin salir del portal.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Probar la Experiencia en Vivo',
        subtitle: 'Simulador FlowPlayer con Audio y XP',
        description: 'Haz clic en "Probar Juego" en la barra superior. Experimentarás la lección tal como la vivirá el alumno: con sintetizador de audio nativo, barra de salud en combate contra monstruos, candados de escape room y pantalla final de victoria.',
        iconName: 'Play',
        badgeText: 'Validación Didáctica',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Verifica tiempos y dificultad de los reactivos.',
          'Prueba la interacción táctil en simuladores y emparejamientos.',
          'Comprueba los efectos de victoria y entrega de botín XP.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Asignar a Grupos y Evaluar',
        subtitle: 'Publicación Escolar y Calificaciones',
        description: 'Haz clic en "Publicar y Asignar". Selecciona tus grupos escolares (ej. 2° Secundaria - Grupo A). La actividad aparecerá en el mapa de misiones de los alumnos y sus resultados se registrarán automáticamente en tu libro de calificaciones.',
        iconName: 'Send',
        badgeText: 'Evaluación Automática',
        colorClass: 'from-amber-500 to-orange-600',
        highlights: [
          'Asignación directa a múltiples grupos o alumnos específicos.',
          'Calificación automática inmediata y rúbrica formativa.',
          'Descarga de reportes de progreso y evidencias de portafolio.'
        ]
      }
    ],
    features: [
      {
        id: 'studio-creator',
        title: 'Estudio Creador de Actividades',
        category: 'Creación Didáctica',
        description: 'Diseño modular de lecciones interactivas mediante 16 bloques gamificados secuenciales.',
        icon: 'Sparkles',
        benefit: 'Ahorra hasta un 70% del tiempo de planeación docente.',
        actionUrl: '/teacher/studio',
        actionLabel: 'Ir al Estudio Docente'
      },
      {
        id: 'gradebook-analytics',
        title: 'Libro de Calificaciones & Rúbricas NEM',
        category: 'Evaluación Formativa',
        description: 'Registro automatizado de aciertos, intentos, nivel de dominio y tiempo dedicado por cada alumno.',
        icon: 'Award',
        benefit: 'Monitoreo objetivo alineado a los 4 campos formativos.',
        actionUrl: '/teacher/grades',
        actionLabel: 'Ver Calificaciones'
      },
      {
        id: 'simulators-directory',
        title: 'Directorio de 50 Simuladores Web',
        category: 'Laboratorios Vivos',
        description: 'Repositorio clasificado de laboratorios PhET, GeoGebra, Desmos, MolView, NASA y Tinkercad.',
        icon: 'Globe',
        benefit: 'Incrustación directa sin configuraciones complejas.',
        actionUrl: '#simuladores',
        actionLabel: 'Explorar Simuladores'
      },
      {
        id: 'teacher-community',
        title: 'Comunidad & Banco de Recursos',
        category: 'Colaboración',
        description: 'Banco de actividades compartidas por otros profesores del Colegio Anglo Mexicano para clonar y adaptar.',
        icon: 'Users',
        benefit: 'Intercambio de mejores prácticas y proyectos interdisciplinarios.',
        actionUrl: '/teacher',
        actionLabel: 'Ir al Panel Docente'
      }
    ],
    faq: [
      {
        q: '¿Cómo incrusto un simulador PhET o GeoGebra en mi actividad?',
        a: 'En el creador de actividades, haz clic en (+) y selecciona "Simulador Científico Web / Laboratorio" (external_embed). Luego copia la URL de nuestra lista de 50 simuladores y pégala en el campo correspondiente.'
      },
      {
        q: '¿Qué pasa si un alumno agota sus 3 vidas en una lección?',
        a: 'El alumno puede revisar la retroalimentación formativa y reiniciar el reactivo o la misión con apoyo guiado, fomentando el aprendizaje por dominio (Mastery Learning).'
      },
      {
        q: '¿Las actividades se sincronizan con los padres de familia?',
        a: 'Sí. En cuanto un alumno completa una actividad, el tutor puede ver el avance, la insignia obtenida y los comentarios formativos desde su portal familiar.'
      }
    ]
  },

  student: {
    roleId: 'student',
    roleTitle: 'Guía de Aventuras y Misiones del Alumno',
    roleSubtitle: 'Colegio Anglo Mexicano • Tu Portal de Aprendizaje Gamificado',
    roleBadge: 'Rol: Estudiante / Explorador',
    heroDescription: '¡Bienvenido a tu aventura de aprendizaje en ISkool! Aquí cada tarea escolar se convierte en una misión donde ganas Puntos de Experiencia (XP), Monedas de Oro, mejoras tu Avatar anime, derrotas monstruos con tus conocimientos y desbloqueas diplomas de maestría.',
    keyBenefits: [
      '🗺️ Mapa de Aventuras (Saga Map) con misiones interactivas desbloqueables por etapas.',
      '⚔️ Combates RPG Pixi contra Bosses donde tus aciertos académicos son tus mejores ataques.',
      '🎨 Personalizador de Avatar Anime con atuendos, peinados, ojos y capas desbloqueables.',
      '🔥 Sistema de Rachas de Fuego (Streak) y Monedas para comprar en la Tienda Escolar.',
      '🐾 Santuario de Mascotas Digitales que evolucionan conforme cumples tus tareas diarias.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Entrar al Mapa de Misiones',
        subtitle: 'Tu Saga de Aprendizaje',
        description: 'Al iniciar sesión verás tu mapa de aventuras con las lecciones asignadas por tus profesores. Los nodos iluminados representan misiones activas listas para comenzar.',
        iconName: 'Map',
        badgeText: 'Misiones Activas',
        colorClass: 'from-amber-500 to-yellow-600',
        highlights: [
          'Revisa las materias activas (Matemáticas, Ciencias, Historia).',
          'Consulta la XP y monedas que ganarás al completar cada misión.',
          'Conserva tus 3 vidas respondiendo con atención.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Resolver Desafíos y Laboratorios',
        subtitle: 'Interactividad y Pensamiento Crítico',
        description: 'Sigue la secuencia de bloques interactuando con simuladores científicos PhET, ordenando secuencias históricas, descifrando códigos secretos de escape rooms y emparejando conceptos.',
        iconName: 'Gamepad2',
        badgeText: 'Juego Interactivo',
        colorClass: 'from-blue-500 to-indigo-600',
        highlights: [
          'Manipula vectores, circuitos y moléculas en laboratorios en vivo.',
          'Aprovecha el banco de palabras en enunciados mutilados.',
          'Recibe pistas de auxilio en los candados de misterio.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Derrotar al Boss y Abrir Cofres',
        subtitle: 'Duelo RPG por Turnos',
        description: 'En el desafío final de la lección te enfrentarás al monstruo guardián (como el Dragón de la Duda o el Gólem del Olvido). Lanza ataques críticos con tus conocimientos para vaciar su barra de vida y reclamar el cofre de botín.',
        iconName: 'Swords',
        badgeText: 'Batalla Épica',
        colorClass: 'from-rose-500 to-red-600',
        highlights: [
          'Usa ataques críticos, hechizos didácticos y pociones de enfoque.',
          'Haz clic en el cofre legendario para ganar gemas y medallas.',
          'Mantén tu racha de fuego activa para multiplicar tus puntos de XP.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Personalizar Avatar y Portafolio',
        subtitle: 'Ropero Escolar & Tienda de Recompensas',
        description: 'Usa las monedas ganadas para personalizar tu personaje en el Personalizador de Avatar, alimentar a tus mascotas en el Santuario y revisar tus Diplomas de Honor en tu Portafolio digital.',
        iconName: 'User',
        badgeText: 'Recompensas & Avatar',
        colorClass: 'from-purple-500 to-pink-600',
        highlights: [
          'Elige peinados, capas, gafas y accesorios anime exclusivos.',
          'Adopta y entrena mascotas virtuales en el Pet Sanctuary.',
          'Descarga tus Diplomas de Honor con firma docente.'
        ]
      }
    ],
    features: [
      {
        id: 'saga-map',
        title: 'Mapa de Misiones (Saga Map)',
        category: 'Aventura Académica',
        description: 'Ruta visual interactiva con lecciones y niveles clasificados por materia.',
        icon: 'MapPin',
        benefit: 'Visualiza tu progreso diario de forma clara y divertida.',
        actionUrl: '/student',
        actionLabel: 'Ver Mi Mapa'
      },
      {
        id: 'avatar-studio',
        title: 'Personalizador de Avatar Anime',
        category: 'Identidad Gamificada',
        description: 'Diseña tu personaje escolar con cientos de combinaciones cosméticas.',
        icon: 'Smile',
        benefit: 'Demuestra tu rango y estilo dentro del colegio.',
        actionUrl: '/student/avatar',
        actionLabel: 'Personalizar Avatar'
      },
      {
        id: 'shop-rewards',
        title: 'Tienda Escolar & Recompensas',
        category: 'Economía de Aula',
        description: 'Canjea monedas de oro por mejoras, pociones y accesorios legendarios.',
        icon: 'ShoppingBag',
        benefit: 'Recompensa real a tu constancia académica.',
        actionUrl: '/student/shop',
        actionLabel: 'Abrir Tienda'
      },
      {
        id: 'portfolio-evidence',
        title: 'Portafolio de Evidencias & Diplomas',
        category: 'Historial Académico',
        description: 'Bitácora con todas tus misiones superadas, insignias ganadas y diplomas oficiales.',
        icon: 'Award',
        benefit: 'Constancia de todo lo que has aprendido.',
        actionUrl: '/student/portfolio',
        actionLabel: 'Ver Mi Portafolio'
      }
    ],
    faq: [
      {
        q: '¿Cómo mantengo mi racha de fuego (Streak)?',
        a: 'Completa al menos una misión académica cada día. Al acumular días seguidos recibirás multiplicadores especiales de XP y monedas extras.'
      },
      {
        q: '¿Puedo repetir una misión para mejorar mi calificación?',
        a: '¡Sí! Puedes volver a jugar cualquier misión del mapa para reforzar conceptos y asegurar la máxima puntuación.'
      },
      {
        q: '¿Dónde puedo ver mis diplomas de honor?',
        a: 'En la sección "Mi Portafolio", dentro de la pestaña "Insignias y Certificados", podrás ver y descargar todos tus diplomas otorgados.'
      }
    ]
  },

  parent: {
    roleId: 'parent',
    roleTitle: 'Guía del Portal Familiar y Monitoreo Tutor',
    roleSubtitle: 'Colegio Anglo Mexicano • Acompañamiento Académico en Tiempo Real',
    roleBadge: 'Rol: Padre de Familia / Tutor',
    heroDescription: 'El Portal Familiar de ISkool te brinda una ventana transparente y en tiempo real al desempeño académico de tus hijos. Monitorea su avance curricular en la Nueva Escuela Mexicana, hábitos de estudio, constancia de entrega y reconocimientos de mérito sin intermediarios.',
    keyBenefits: [
      '📈 Monitoreo en tiempo real de calificaciones, tareas entregadas y tiempo de estudio diario.',
      '🛡️ Alertas formativas tempranas ante dificultades en asignaturas o tareas pendientes.',
      '🏅 Visualización de insignias, diplomas de honor y proyectos de portafolio de tus hijos.',
      '💬 Canal directo de retroalimentación pedagógica con el equipo de profesores del colegio.',
      '📱 Acceso seguro y multiplataforma desde cualquier celular, tableta o computadora.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Acceder al Panel de Hijos',
        subtitle: 'Visión General Familiar',
        description: 'Inicia sesión con tu correo registrado. Si tienes más de un hijo en el Colegio Anglo Mexicano, podrás alternar entre sus perfiles con un solo clic.',
        iconName: 'Users',
        badgeText: 'Perfil Familiar',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Selector rápido entre hermanos inscritos.',
          'Resumen de promedio general y nivel de constancia.',
          'Notificaciones de actividades recientes asignadas.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Consultar Desempeño por Asignatura',
        subtitle: 'Campos Formativos NEM',
        description: 'Revisa las calificaciones desglosadas por materia (Lenguajes, Saberes y Pensamiento Científico, Ética, etc.) y los Procesos de Desarrollo de Aprendizaje (PDA) alcanzados.',
        iconName: 'TrendingUp',
        badgeText: 'Progreso Curricular',
        colorClass: 'from-blue-500 to-indigo-600',
        highlights: [
          'Gráficas de rendimiento trimestral y asistencia.',
          'Detalle de reactivos acertados e intentos realizados.',
          'Comentarios de retroalimentación del docente titular.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Fomentar Hábitos y Reconocimientos',
        subtitle: 'Motivación y Constancia',
        description: 'Supervisa las rachas de estudio de tu hijo y celebra sus logros al desbloquear Diplomas de Honor y medallas al mérito científico o cívico.',
        iconName: 'Award',
        badgeText: 'Acompañamiento Positivo',
        colorClass: 'from-amber-500 to-orange-600',
        highlights: [
          'Visualiza el tiempo diario dedicado a la plataforma.',
          'Descarga constancias y diplomas de mérito académico.',
          'Refuerza en casa los temas sugeridos por el profesor.'
        ]
      }
    ],
    features: [
      {
        id: 'parent-dashboard',
        title: 'Panel Familiar en Tiempo Real',
        category: 'Monitoreo',
        description: 'Tablero central con métricas de desempeño, tareas entregadas y asistencia.',
        icon: 'LayoutDashboard',
        benefit: 'Información clara e inmediata sobre la vida escolar de tus hijos.',
        actionUrl: '/parent',
        actionLabel: 'Ir a Mi Panel Familiar'
      },
      {
        id: 'parent-alerts',
        title: 'Alertas Pedagógicas Preventivas',
        category: 'Acompañamiento',
        description: 'Avisos automáticos si una tarea está por vencer o si se detecta rezago en un tema.',
        icon: 'Bell',
        benefit: 'Intervención oportuna antes de los periodos de evaluación.',
        actionUrl: '/parent',
        actionLabel: 'Ver Alertas'
      }
    ],
    faq: [
      {
        q: '¿Cómo sé si mi hijo completó su tarea del día?',
        a: 'En tu panel familiar, las tareas completadas aparecerán con un ícono verde de verificación junto con la calificación obtenida y la hora de entrega.'
      },
      {
        q: '¿Qué significa el puntaje de XP de mi hijo?',
        a: 'Los Puntos de Experiencia (XP) reflejan el esfuerzo, la constancia y los retos superados por el estudiante dentro de la plataforma gamificada.'
      }
    ]
  },

  admin: {
    roleId: 'admin',
    roleTitle: 'Guía Institucional para Directores y Coordinadores',
    roleSubtitle: 'Colegio Anglo Mexicano • Gestión Escolar, Rúbricas y Analíticas Globales',
    roleBadge: 'Rol: Coordinador / Director Académico',
    heroDescription: 'El módulo administrativo de ISkool proporciona a directores y coordinadores el control total sobre la identidad institucional, analíticas globales de aprendizaje, cumplimiento de PDAs por academia y gestión integral de la matrícula escolar.',
    keyBenefits: [
      '🏛️ Analíticas globales de desempeño escolar por grado, grupo, materia y profesor titular.',
      '🎨 Personalización total de identidad visual (logotipo, colores corporativos y banners temáticos).',
      '📋 Supervisión del cumplimiento de los 4 Campos Formativos y Ejes Articuladores de la NEM.',
      '👥 Gestión de matrícula de alumnos, claustro docente y cuentas de tutores en un solo lugar.',
      '📈 Exportación de reportes ejecutivos para juntas de academia y supervisión escolar.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Monitorear Analíticas Institucionales',
        subtitle: 'Tablero de Control Macro',
        description: 'Supervisa los promedios globales del colegio, la tasa de finalización de actividades por materia y los grupos que destacan en rendimiento académico.',
        iconName: 'BarChart3',
        badgeText: 'Inteligencia de Datos',
        colorClass: 'from-purple-500 to-indigo-600',
        highlights: [
          'Métricas comparativas entre grupos y niveles escolares.',
          'Monitoreo de actividad semanal y uso de la plataforma.',
          'Detección de áreas de oportunidad por academia.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Personalizar Identidad Institucional',
        subtitle: 'Branding y Ajustes de Marca',
        description: 'Configura el nombre del plantel (Colegio Anglo Mexicano), logotipo oficial, colores primarios del tema y banners conmemorativos de temporada.',
        iconName: 'Palette',
        badgeText: 'Identidad Visual',
        colorClass: 'from-blue-500 to-cyan-600',
        highlights: [
          'Carga de logotipo oficial en alta resolución.',
          'Paleta cromática institucional sincronizada en todos los perfiles.',
          'Banners de felicitación y eventos escolares.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Supervisar Cobertura Curricular NEM',
        subtitle: 'Cumplimiento de PDAs',
        description: 'Verifica qué Procesos de Desarrollo de Aprendizaje han sido cubiertos por cada docente en el creador de actividades para garantizar la cobertura del programa escolar.',
        iconName: 'CheckSquare',
        badgeText: 'Alineación NEM',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Mapeo de actividades creadas por Campo Formativo.',
          'Verificación de rúbricas y criterios de evaluación docente.',
          'Reportes listos para sesiones de Consejo Técnico Escolar (CTE).'
        ]
      }
    ],
    features: [
      {
        id: 'admin-analytics',
        title: 'Analíticas Globales del Colegio',
        category: 'Dirección Escolar',
        description: 'Métricas integrales de aprendizaje, participación y avance curricular.',
        icon: 'TrendingUp',
        benefit: 'Toma de decisiones fundamentada en datos objetivos.',
        actionUrl: '/coordinator',
        actionLabel: 'Panel de Coordinación'
      },
      {
        id: 'admin-branding',
        title: 'Personalizador Institucional',
        category: 'Configuración',
        description: 'Ajuste de logotipo, colores de marca y ajustes generales del sistema.',
        icon: 'Shield',
        benefit: 'Preserva la identidad y prestigio del Colegio Anglo Mexicano.',
        actionUrl: '/coordinator',
        actionLabel: 'Ajustes Institucionales'
      }
    ],
    faq: [
      {
        q: '¿Cómo exporto los reportes de rendimiento para el Consejo Técnico?',
        a: 'Desde el panel de Coordinación, accede a la pestaña "Reportes y Analíticas" y haz clic en "Exportar Reporte Ejecutivo NEM" en formato PDF o Excel.'
      },
      {
        q: '¿Puedo asignar permisos especiales a profesores líderes de academia?',
        a: 'Sí. El rol de coordinador permite crear y supervisar carpetas de academia para compartir proyectos entre múltiples docentes.'
      }
    ]
  }
};
