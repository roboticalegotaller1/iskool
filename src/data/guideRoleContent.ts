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
    roleTitle: 'Guía Integral del Profesor, Bóveda Curricular & Taller Gamificado',
    roleSubtitle: 'Colegio Anglo Mexicano • 703 Nodos NEM 2024, Videoteca Certificada y Estudio Didáctico',
    roleBadge: 'Rol: Docente / Titular de Academia',
    heroDescription: 'Diseña planeaciones didácticas oficiales con la Bóveda Curricular de 703 nodos NEM 2024 y transforma tus clases en aventuras interactivas. Con ISkool puedes consultar planeaciones al instante (<5ms), generar proyectos curriculares con el Asistente Pedagógico IA, integrar videos educativos verificados (YouTube 200 OK), incrustar 50 simuladores científicos PhET y evaluar el dominio de tus alumnos en tiempo real.',
    keyBenefits: [
      '📚 Bóveda Curricular con 703 Planeaciones Oficiales NEM 2024 listas para usar con respuesta en menos de 5 ms.',
      '🧠 Arquitectura Vault-First: Entrega instantánea de nodos preexistentes con respaldo de IA Pedagógica ante ausencias.',
      '🎥 Videoteca Pedagógica Certificada (YouTube oEmbed 200 OK) para Inglés (Pre-A1 a B2), Matemáticas, Ciencias, Historia y Español.',
      '🌐 Directorio integrado de 50 Simuladores Web interactivos (PhET, GeoGebra, Desmos, NASA) listos para incrustar.',
      '🛡️ Purga Automática de Enlaces Rotos con reporte en un solo clic para garantizar recursos 100% disponibles.',
      '⚡ 16 Mecánicas Gamificadas (Drag & Drop, Escape Rooms, Crucigramas, Ruletas, Duelos Boss RPG y Laboratorios).',
      '📊 Libro de Calificaciones y Rúbricas analíticas formativas sincronizadas con la matrícula del colegio.',
      '🤝 Comunidad Docente y Sincronización Institucional con el Repositorio Central para compartir proyectos entre academias.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Consultar la Bóveda Curricular (703 Nodos NEM)',
        subtitle: 'Planificador Didáctico & Protocolo Vault-First',
        description: 'Accede al Planificador Didáctico. El sistema consulta primero la Bóveda Central de Conocimiento: más de 703 planeaciones oficiales categorizadas por Fases 3, 4, 5 y 6 de la Nueva Escuela Mexicana. Si la planeación ya existe, se recupera al instante (<5ms) sin demoras ni consumo innecesario de IA. Si requieres un tema especializado no catalogado, la Inteligencia Artificial Pedagógica genera la planeación completa y la guarda de inmediato en la Bóveda con enlaces bidireccionales.',
        iconName: 'Database',
        badgeText: 'Bóveda Curricular NEM',
        colorClass: 'from-indigo-600 to-blue-600',
        highlights: [
          'Búsqueda ultra rápida por palabra clave, PDA, Fase o Campo Formativo.',
          'Entrega instantánea mediante caché y persistencia en Markdown con metadatos YAML.',
          'Fallback con Motor de IA Pedagógica exclusivo para contenidos ausentes.',
          'Edición flexible de momentos didácticos (Inicio, Desarrollo y Cierre) con rúbricas.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Construir Actividades en el Estudio Didáctico',
        subtitle: 'Lienzo Digital & Flujo de Nodos Conectados',
        description: 'Diseña experiencias interactivas conectando nodos en el Lienzo Digital. Agrega bloques desde el dock inferior o el catálogo (+) y jala flechas desde los puertos de salida (●) de cualquier nodo hacia el siguiente. Modula libremente las rutas de aprendizaje: desde preguntas de opción múltiple hasta crucigramas, líneas temporales y candados de misterio.',
        iconName: 'Workflow',
        badgeText: 'Lienzo Digital',
        colorClass: 'from-purple-500 to-indigo-600',
        highlights: [
          'Trazado intuitivo de conexiones arrastrando flechas con el ratón.',
          '16 bloques gamificados con soporte para vidas, temporizadores y rachas.',
          'Configuración granular de PDA, Campo Formativo y criterios formativos.',
          'Generador asistido de reactivos impulsado por el Asistente Pedagógico IA.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Incorporar Videoteca Certificada y Simuladores',
        subtitle: 'Recursos Verificados por Materia & 50 Simuladores Web',
        description: 'Enriquece cada actividad con contenido audiovisual verificado. Selecciona videos de nuestra Videoteca Pedagógica (YouTube oEmbed 200 OK) filtrados para Inglés (niveles Pre-A1 a B2), Matemáticas, Ciencias, Historia y Artes, o incrusta laboratorios PhET, GeoGebra y Desmos de nuestro catálogo de 50 simuladores compatibles con un solo clic.',
        iconName: 'Globe',
        badgeText: 'Recursos Certificados',
        colorClass: 'from-cyan-500 to-blue-600',
        highlights: [
          'Videos pedagógicos clasificados por nivel académico sin distracciones comerciales.',
          'Portales oficiales activos: Conaliteg, PhET, BBC Learning English, Khan Academy, INAH.',
          'Simuladores científicos y matemáticos interactivos incrustables directamente.',
          'Botón de reporte de enlaces caídos con purga y reemplazo automático en milisegundos.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Probar la Experiencia en Vivo (FlowPlayer)',
        subtitle: 'Simulador Alumno con Audio Sintetizado y XP',
        description: 'Antes de publicar la actividad a tus alumnos, haz clic en "Probar Juego". Experimentarás la lección tal como la vivirá el estudiante: con narración por sintetizador de voz nativo, barra de salud en combate contra monstruos del aprendizaje, candados de escape room y pantalla de victoria con reparto de botín XP.',
        iconName: 'Play',
        badgeText: 'Validación Didáctica',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Verificación del ritmo pedagógico, retroalimentación y dificultad.',
          'Prueba de la respuesta háptica y auditiva en cada reactivo.',
          'Comprobación del cofre de recompensa y multiplicadores de racha.'
        ]
      },
      {
        stepNumber: 5,
        title: 'Paso 5: Asignar a Grupos y Monitorear Calificaciones',
        subtitle: 'Publicación Escolar, Rúbricas NEM y Portafolio',
        description: 'Haz clic en "Publicar y Asignar", selecciona tus grupos del Colegio Anglo Mexicano. La actividad aparecerá en el mapa de misiones de los alumnos y el sistema registrará los aciertos, intentos y nivel de dominio en tu Libro de Calificaciones institucional.',
        iconName: 'Send',
        badgeText: 'Evaluación Formativa',
        colorClass: 'from-amber-500 to-orange-600',
        highlights: [
          'Asignación a grupos completos o atención diferenciada personalizada.',
          'Calificación automática inmediata vinculada a los PDA de la NEM.',
          'Exportación de reportes de evaluación y bitácoras de portafolio.'
        ]
      }
    ],
    features: [
      {
        id: 'boveda-curricular',
        title: 'Bóveda Curricular (Segundo Cerebro NEM)',
        category: 'Planeación Oficial',
        description: '703 planeaciones didácticas oficiales con búsqueda en <5ms, arquitectura Vault-First y respaldo con IA Pedagógica.',
        icon: 'Database',
        benefit: 'Alineación instantánea a la NEM sin duplicar esfuerzos ni consumir tokens innecesarios.',
        actionUrl: '/teacher',
        actionLabel: 'Abrir Planificador NEM'
      },
      {
        id: 'videoteca-pedagogica',
        title: 'Videoteca Pedagógica & Recursos Certificados',
        category: 'Recursos Multimedia',
        description: 'Videos YouTube verificados 200 OK por materia (Inglés Pre-A1 a B2, Matemáticas, Ciencias, etc.) y portales oficiales como Conaliteg, PhET, BBC y Khan Academy.',
        icon: 'Video',
        benefit: 'Material didáctico verificado sin enlaces rotos ni contenidos inapropiados.',
        actionUrl: '/teacher',
        actionLabel: 'Ver Recursos en Planificador'
      },
      {
        id: 'studio-creator',
        title: 'Estudio Creador de Actividades (Lienzo Digital)',
        category: 'Creación Didáctica',
        description: 'Diseño interactivo con 16 bloques gamificados y conexión visual de nodos pedagógicos por flechas.',
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
        title: 'Comunidad & Sincronización Institucional',
        category: 'Colaboración',
        description: 'Banco de actividades compartidas por otros profesores del colegio y respaldo en el Repositorio Central.',
        icon: 'Users',
        benefit: 'Intercambio de mejores prácticas y proyectos interdisciplinarios.',
        actionUrl: '/teacher',
        actionLabel: 'Ir al Panel Docente'
      }
    ],
    faq: [
      {
        q: '¿Cómo funciona la Bóveda Curricular y la búsqueda de las 703 planeaciones oficiales?',
        a: 'La Bóveda Curricular contiene 703 nodos pedagógicos que cubren exhaustivamente las Fases 3, 4, 5 y 6 de la Nueva Escuela Mexicana. Al ingresar cualquier palabra clave, tema o PDA en el Planificador Didáctico, el motor busca en la boveda local entregando los resultados en menos de 5 milisegundos con su estructura completa: inicio, desarrollo, cierre, rúbricas y bibliografía oficial de la SEP.'
      },
      {
        q: '¿Qué es la política "Vault-First" (Bóveda Primero) y cómo optimiza el trabajo docente?',
        a: 'La política Vault-First establece que siempre que se solicita una planeación, el sistema consulta prioritariamente la Bóveda Curricular para reutilizar nodos oficiales preexistentes. Solo en caso de no encontrarse una planeación para el tema o PDA solicitado, entra en acción el Motor de IA Pedagógica para generarla. Una vez generada, se guarda automáticamente en la Bóveda y se sincroniza con el Repositorio Central para que esté disponible de por vida.'
      },
      {
        q: '¿Cómo se aseguran de que los videos y recursos para Inglés u otras materias no estén rotos?',
        a: 'Todos los recursos de nuestra Videoteca Pedagógica pasan por un filtro de verificación en vivo (oEmbed 200 OK) y provienen de fuentes institucionales auditadas (BBC Learning English, AgendaWeb, Khan Academy, PhET, Conaliteg, INAH). Además, el sistema cuenta con un botón de "Reportar enlace roto" que permite purgar al instante cualquier enlace no disponible y reemplazarlo de forma automática por una alternativa activa.'
      },
      {
        q: '¿Cómo incrusto un simulador PhET, GeoGebra o Desmos en mi actividad?',
        a: 'En el Estudio Creador de Actividades (Lienzo Digital), haz clic en el botón (+) del dock inferior y añade el bloque "Simulador Científico Web / Laboratorio" (external_embed). En la sección de 50 simuladores de este Centro de Ayuda, haz clic en "Copiar URL" sobre el simulador que deseas y pégalo en el campo URL del nodo.'
      },
      {
        q: '¿Qué sucede si un estudiante agota sus 3 vidas durante una lección?',
        a: 'El alumno recibe retroalimentación formativa inmediata con pistas guiadas y tiene la opción de reiniciar el desafío o intentarlo nuevamente. Este mecanismo se basa en el principio pedagógico de Aprendizaje por Dominio (Mastery Learning), asegurando que el error sea parte del proceso de aprendizaje.'
      },
      {
        q: '¿Las actividades y calificaciones se sincronizan con los padres de familia?',
        a: 'Sí. En el momento en que un alumno completa una misión o tarea, su calificación, tiempo invertido, medallas y comentarios formativos se reflejan automáticamente en el Portal Familiar del tutor.'
      },
      {
        q: '¿Cómo se conectan los nodos en el Lienzo Digital del Estudio?',
        a: 'Haz clic y mantén presionado sobre el puerto de salida circular (●) ubicado en el borde de un nodo y arrastra el cursor hacia el siguiente nodo. Una flecha conectora unirá ambos bloques trazando la ruta de la aventura didáctica.'
      },
      {
        q: '¿Cómo se respalda mi trabajo y mis planeaciones en el colegio?',
        a: 'Todas las planeaciones y actividades se guardan en la Bóveda Curricular interna y se respaldan periódicamente en el Repositorio Central del colegio, garantizando seguridad de datos institucional y cero pérdida de información.'
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
      '🗺️ Mapa de Aventuras (Saga Map) con misiones interactivas desbloqueables por etapas y niveles.',
      '⚔️ Combates RPG Pixi contra Bosses donde tus aciertos académicos son tus mejores ataques.',
      '🎧 FlowPlayer interactivo con sintetizador de voz nativo y retroalimentación en cada reactivo.',
      '🎨 Personalizador de Avatar Anime con atuendos, peinados, ojos, gafas y capas desbloqueables.',
      '🔥 Sistema de Rachas de Fuego (Streak) y Monedas para comprar en la Tienda Escolar.',
      '🐾 Santuario de Mascotas Digitales que evolucionan conforme cumples tus tareas diarias.',
      '📜 Portafolio de Evidencias y Diplomas de Honor oficiales con firma docente.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Entrar al Mapa de Misiones (Saga Map)',
        subtitle: 'Tu Saga de Aprendizaje',
        description: 'Al iniciar sesión verás tu mapa de aventuras con las lecciones asignadas por tus profesores. Los nodos iluminados representan misiones activas listas para comenzar. Cada misión muestra su recompensa en XP y monedas de oro.',
        iconName: 'Map',
        badgeText: 'Misiones Activas',
        colorClass: 'from-amber-500 to-yellow-600',
        highlights: [
          'Revisa las materias activas (Matemáticas, Ciencias, Inglés, Historia).',
          'Consulta la XP y monedas que ganarás al superar cada desafío.',
          'Conserva tus 3 corazones de vida respondiendo con atención.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Resolver Desafíos y Laboratorios en Vivo',
        subtitle: 'Interactividad, Audio y Pensamiento Crítico',
        description: 'Sigue la secuencia de bloques interactuando con simuladores científicos PhET, ordenando oraciones en inglés, completando enunciados, descifrando códigos secretos de escape rooms y manipulando modelos 3D.',
        iconName: 'Gamepad2',
        badgeText: 'Juego Interactivo',
        colorClass: 'from-blue-500 to-indigo-600',
        highlights: [
          'Escucha la narración con voz nativa en cada reactivo.',
          'Manipula vectores, circuitos y moléculas en laboratorios vivos.',
          'Aprovecha el banco de pistas cuando tengas dudas en un candado.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Derrotar al Boss y Abrir Cofres Legendarios',
        subtitle: 'Duelo RPG por Turnos',
        description: 'En el desafío final te enfrentarás al monstruo guardián del tema (como el Dragón de la Duda o el Gólem de la Distracción). Aplica tus conocimientos para lanzar ataques críticos, vaciar su barra de vida y reclamar el cofre de botín con gemas y medallas.',
        iconName: 'Swords',
        badgeText: 'Batalla Épica',
        colorClass: 'from-rose-500 to-red-600',
        highlights: [
          'Lanza ataques críticos, hechizos didácticos y pociones de enfoque.',
          'Abre el cofre legendario para ganar gemas y medallas de honor.',
          'Mantén tu racha diaria de fuego activa para multiplicar tus puntos de XP.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Personalizar Avatar, Mascotas y Portafolio',
        subtitle: 'Ropero Escolar, Tienda & Diplomas',
        description: 'Usa las monedas ganadas en clase para comprar atuendos y accesorios en el Personalizador de Avatar, alimentar y entrenar a tus mascotas en el Santuario y descargar tus Diplomas de Honor oficiales en tu Portafolio escolar.',
        iconName: 'User',
        badgeText: 'Recompensas & Avatar',
        colorClass: 'from-purple-500 to-pink-600',
        highlights: [
          'Elige peinados, capas, gafas y accesorios anime exclusivos.',
          'Adopta y evoluciona mascotas virtuales en el Pet Sanctuary.',
          'Descarga tus Diplomas de Honor con firma docente para mostrar en casa.'
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
        benefit: 'Visualiza tu progreso diario de forma clara y emocionante.',
        actionUrl: '/student',
        actionLabel: 'Ver Mi Mapa'
      },
      {
        id: 'flow-player',
        title: 'Reproductor de Actividades (FlowPlayer)',
        category: 'Experiencia Interactiva',
        description: 'Lienzo de juego con sintetizador de voz nativo, vidas, temporizador y retroalimentación inmediata.',
        icon: 'Play',
        benefit: 'Aprende jugando a tu propio ritmo con apoyo audiovisual.',
        actionUrl: '/student',
        actionLabel: 'Entrar a Misiones'
      },
      {
        id: 'avatar-studio',
        title: 'Personalizador de Avatar Anime',
        category: 'Identidad Gamificada',
        description: 'Diseña tu personaje escolar con cientos de combinaciones cosméticas desbloqueables.',
        icon: 'Smile',
        benefit: 'Demuestra tu rango y estilo dentro del colegio.',
        actionUrl: '/student/avatar',
        actionLabel: 'Personalizar Avatar'
      },
      {
        id: 'shop-rewards',
        title: 'Tienda Escolar & Santuario de Mascotas',
        category: 'Economía de Aula',
        description: 'Canjea monedas de oro por mejoras, pociones y cuida mascotas que evolucionan con tus tareas.',
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
        benefit: 'Constancia verificable de todo lo que has aprendido.',
        actionUrl: '/student/portfolio',
        actionLabel: 'Ver Mi Portafolio'
      }
    ],
    faq: [
      {
        q: '¿Cómo mantengo activa mi racha de fuego (Streak)?',
        a: 'Completa al menos una misión académica cada día. Al acumular días consecutivos recibirás multiplicadores de XP y cofres con recompensas adicionales.'
      },
      {
        q: '¿Puedo repetir una misión si quiero mejorar mi calificación o recuperar vidas?',
        a: '¡Claro que sí! Puedes volver a jugar cualquier misión completada en el mapa para repasar antes de tus exámenes y asegurar la máxima puntuación.'
      },
      {
        q: '¿Dónde puedo ver y descargar mis Diplomas de Honor?',
        a: 'En la sección "Mi Portafolio", dentro de la pestaña "Insignias y Certificados", podrás consultar y descargar tus diplomas en PDF con el sello oficial del colegio.'
      },
      {
        q: '¿Cómo uso el sintetizador de voz en las preguntas en inglés o lectura?',
        a: 'En el reproductor FlowPlayer, cada tarjeta interactiva tiene un botón de altavoz que reproduce el texto con pronunciación nativa para ayudarte a practicar comprensión auditiva.'
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
      '🏅 Visualización de insignias, diplomas de honor y evidencias de portafolio de tus hijos.',
      '📋 Seguimiento desglosado por los 4 Campos Formativos y Procesos de Desarrollo de Aprendizaje (PDA) de la NEM.',
      '💬 Canal directo y transparente con las observaciones formativas del profesor titular.',
      '📱 Acceso seguro y multiplataforma desde cualquier celular, tableta o computadora.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Acceder al Panel de Hijos',
        subtitle: 'Visión General Familiar',
        description: 'Inicia sesión con tu correo registrado. Si tienes más de un hijo inscrito en el Colegio Anglo Mexicano, podrás alternar entre sus perfiles con un solo clic para ver su resumen general.',
        iconName: 'Users',
        badgeText: 'Perfil Familiar',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Selector rápido entre hermanos inscritos.',
          'Resumen de promedio general y constancia de entregas.',
          'Notificaciones de tareas recientes asignadas y pendientes.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Consultar Desempeño por Asignatura y PDA',
        subtitle: 'Campos Formativos de la NEM',
        description: 'Revisa las calificaciones desglosadas por materia (Lenguajes, Saberes y Pensamiento Científico, Ética, De lo Humano y lo Comunitario) y los Procesos de Desarrollo de Aprendizaje (PDA) alcanzados.',
        iconName: 'TrendingUp',
        badgeText: 'Progreso Curricular',
        colorClass: 'from-blue-500 to-indigo-600',
        highlights: [
          'Gráficas de rendimiento trimestral y constancia semanal.',
          'Detalle de reactivos acertados, intentos realizados y tiempo invertido.',
          'Comentarios de retroalimentación pedagógica del docente titular.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Fomentar Hábitos y Celebrar Logros',
        subtitle: 'Acompañamiento Positivo & Portafolio',
        description: 'Supervisa las rachas de estudio de tu hijo y celebra sus logros al desbloquear Diplomas de Honor y medallas al mérito científico, cívico o lingüístico.',
        iconName: 'Award',
        badgeText: 'Acompañamiento Positivo',
        colorClass: 'from-amber-500 to-orange-600',
        highlights: [
          'Visualiza el tiempo diario dedicado a la plataforma.',
          'Descarga constancias y diplomas oficiales de mérito académico.',
          'Refuerza en casa los temas sugeridos por el profesor.'
        ]
      }
    ],
    features: [
      {
        id: 'parent-dashboard',
        title: 'Panel Familiar en Tiempo Real',
        category: 'Monitoreo',
        description: 'Tablero central con métricas de desempeño, tareas entregadas y asistencia de tus hijos.',
        icon: 'LayoutDashboard',
        benefit: 'Información clara e inmediata sobre la vida escolar de tus hijos.',
        actionUrl: '/parent',
        actionLabel: 'Ir a Mi Panel Familiar'
      },
      {
        id: 'parent-alerts',
        title: 'Alertas Pedagógicas Preventivas',
        category: 'Acompañamiento',
        description: 'Avisos automáticos si una tarea está por vencer o si se detecta dificultad en un contenido.',
        icon: 'Bell',
        benefit: 'Intervención oportuna antes de los periodos de evaluación trimestral.',
        actionUrl: '/parent',
        actionLabel: 'Ver Alertas'
      },
      {
        id: 'parent-evidence',
        title: 'Portafolio de Evidencias & Diplomas',
        category: 'Reconocimiento',
        description: 'Visualizador de diplomas, medallas e insignias logradas por los alumnos.',
        icon: 'Award',
        benefit: 'Reconocimiento verificable del esfuerzo de tus hijos.',
        actionUrl: '/parent',
        actionLabel: 'Ver Diplomas'
      }
    ],
    faq: [
      {
        q: '¿Cómo sé si mi hijo completó su tarea del día?',
        a: 'En tu panel familiar, las tareas completadas aparecerán con un ícono verde de verificación junto con la calificación obtenida, la fecha y la hora exacta de entrega.'
      },
      {
        q: '¿Qué significan los Puntos de Experiencia (XP) y las Rachas de Fuego?',
        a: 'Los Puntos de Experiencia (XP) miden el esfuerzo y dominio en los reactivos superados. La Racha de Fuego refleja los días consecutivos que el alumno ha dedicado a repasar sus materias escolares.'
      },
      {
        q: '¿Puedo revisar los comentarios de los profesores?',
        a: 'Sí. En el desglose de cada actividad podrás leer las observaciones formativas del profesor titular para orientar el estudio en casa.'
      },
      {
        q: '¿Cómo accedo desde mi teléfono celular?',
        a: 'ISkool es una plataforma web progresiva completamente adaptable. Solo ingresa a la dirección web desde el navegador de tu celular con tus credenciales institucionales.'
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
      '📋 Supervisión del cumplimiento de los 4 Campos Formativos y Ejes Articuladores de la NEM.',
      '🎨 Personalización total de identidad institucional (logotipo, colores corporativos y banners temáticos).',
      '👥 Gestión de matrícula de alumnos, claustro docente y cuentas de tutores en un solo lugar.',
      '🛡️ Aislamiento Escolar por Plantel: Seguridad de datos institucional y estricto control de acceso.',
      '📈 Exportación de reportes ejecutivos listos para juntas de academia y sesiones de Consejo Técnico Escolar (CTE).'
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
          'Detección de áreas de oportunidad por academia docente.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Supervisar Cobertura Curricular NEM',
        subtitle: 'Auditoría de PDAs para CTE',
        description: 'Verifica qué Procesos de Desarrollo de Aprendizaje han sido cubiertos por cada docente en el creador de actividades para garantizar la cobertura del programa sintético oficial.',
        iconName: 'CheckSquare',
        badgeText: 'Alineación NEM',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Mapeo de actividades creadas por Campo Formativo.',
          'Verificación de rúbricas y criterios de evaluación docente.',
          'Reportes ejecutivos listos para sesiones de Consejo Técnico Escolar (CTE).'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Personalizar Identidad Institucional',
        subtitle: 'Branding Escolar y Aislamiento de Datos',
        description: 'Configura el nombre del plantel (Colegio Anglo Mexicano), logotipo oficial, colores primarios del tema y garantiza el aislamiento de datos entre planteles escolares.',
        iconName: 'Palette',
        badgeText: 'Identidad Visual',
        colorClass: 'from-blue-500 to-cyan-600',
        highlights: [
          'Carga de logotipo institucional en alta resolución.',
          'Paleta cromática oficial sincronizada en todos los perfiles.',
          'Aislamiento estricto de expedientes y calificaciones por escuela.'
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
        id: 'admin-curriculum',
        title: 'Auditoría de Cobertura Curricular NEM',
        category: 'Supervisión Académica',
        description: 'Seguimiento del porcentaje de cumplimiento de PDAs por grado y materia.',
        icon: 'CheckSquare',
        benefit: 'Informes preparados al instante para el Consejo Técnico Escolar (CTE).',
        actionUrl: '/coordinator',
        actionLabel: 'Auditar Cobertura'
      },
      {
        id: 'admin-branding',
        title: 'Personalizador Institucional & Marca Blanca',
        category: 'Configuración',
        description: 'Ajuste de logotipo, colores de marca y ajustes generales del sistema.',
        icon: 'ShieldCheck',
        benefit: 'Preserva la identidad y prestigio del Colegio Anglo Mexicano.',
        actionUrl: '/coordinator',
        actionLabel: 'Ajustes Institucionales'
      }
    ],
    faq: [
      {
        q: '¿Cómo exporto los reportes de rendimiento para el Consejo Técnico Escolar (CTE)?',
        a: 'Desde el panel de Coordinación, accede a la pestaña "Reportes y Analíticas" y haz clic en "Exportar Reporte Ejecutivo NEM" en formato PDF o Excel con desglose por Campo Formativo.'
      },
      {
        q: '¿Cómo se garantiza la privacidad de los datos entre diferentes escuelas?',
        a: 'La plataforma implementa un esquema estricto de Aislamiento Escolar por Plantel (Multi-School Isolation), asegurando que los expedientes, calificaciones y docentes pertenezcan exclusivamente a la base institucional autorizada.'
      },
      {
        q: '¿Puedo asignar permisos especiales a profesores líderes de academia?',
        a: 'Sí. El rol directivo permite crear carpetas de academia para que los docentes compartan y clonen planeaciones y actividades colaborativas en el Repositorio Central del colegio.'
      }
    ]
  }
};
