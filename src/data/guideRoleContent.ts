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
    roleSubtitle: 'Colegio Anglo Mexicano • 703 Nodos NEM 2024, Libros Digitales SEP y Estudio Didáctico',
    roleBadge: 'Rol: Docente / Titular de Academia',
    heroDescription: 'Diseña planeaciones didácticas oficiales con la Bóveda Curricular de 703 nodos NEM 2024 y transforma tus clases en aventuras interactivas. Con ISkool puedes consultar planeaciones al instante (<5ms), aprovechar el mapeo curricular a 0 tokens de los Libros de Texto Digitales de la SEP, generar proyectos con el Asistente Pedagógico IA, construir actividades con 17 bloques interactivos en el Lienzo Digital, integrar videoteca certificada (YouTube 200 OK), incrustar 50 simuladores científicos y evaluar el dominio formativo de tus alumnos en tiempo real.',
    keyBenefits: [
      '📚 Bóveda Curricular con 703 Planeaciones Oficiales NEM 2024 listas para usar con respuesta en menos de 5 ms.',
      '📖 Libros de Texto Digitales de la SEP & Cuaderno Inteligente: Mapeo curricular a 0 tokens con citas de páginas oficiales de Conaliteg.',
      '🧠 Arquitectura Vault-First: Entrega instantánea de nodos preexistentes con respaldo de IA Pedagógica exclusiva ante ausencias.',
      '🎨 Estudio de Actividades con 17 Bloques Gamificados (Drag & Drop, Escape Rooms, Crucigramas, Ruletas, Duelos Boss RPG y Laboratorios).',
      '🎥 Videoteca Pedagógica Certificada (YouTube oEmbed 200 OK) para Inglés (Pre-A1 a B2), Matemáticas, Ciencias, Historia y Español.',
      '🌐 Directorio integrado de 50 Simuladores Web interactivos (PhET, GeoGebra, Desmos, NASA, Tinkercad) listos para incrustar.',
      '🛡️ Purga Automática de Enlaces Rotos con reporte en un solo clic para garantizar recursos 100% disponibles.',
      '📊 Libro de Calificaciones y Rúbricas analíticas formativas sincronizadas con la matrícula y asistencia del colegio.',
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
        title: 'Paso 2: Explotar Libros de Texto SEP & Cuaderno Inteligente',
        subtitle: 'Mapeo Curricular a 0 Tokens & Citas Conaliteg',
        description: 'Integra los libros de texto gratuitos de la SEP directamente en tus lecciones. El subsistema extrae conceptos, lecturas y problemas de los libros oficiales de Primaria y Secundaria a costo cero de tokens. A través del Cuaderno Inteligente, puedes fundamentar reactivos y brindar explicaciones a los alumnos con el número de página exacto del libro oficial.',
        iconName: 'BookOpen',
        badgeText: 'Libros SEP & 0 Tokens',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Acceso inmediato a los libros de texto de Primaria y Secundaria organizados por grado.',
          'Extracción instantánea de contenidos y ejercicios sin consumo de tokens de IA.',
          'Cuaderno Inteligente con respuestas fundamentadas en citas oficiales de página.',
          'Aislamiento estricto por plantel para preservar los compendios y proyectos del colegio.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Construir Actividades en el Estudio Didáctico',
        subtitle: 'Lienzo Digital & 17 Bloques Gamificados',
        description: 'Diseña experiencias interactivas conectando nodos en el Lienzo Digital. Agrega bloques desde el dock inferior o el catálogo (+) y jala flechas desde los puertos de salida (●) de cualquier nodo hacia el siguiente. Modula libremente las rutas de aprendizaje: desde preguntas de opción múltiple hasta crucigramas, líneas temporales, candados de escape room y duelos contra monstruos del aprendizaje.',
        iconName: 'Workflow',
        badgeText: 'Lienzo Digital',
        colorClass: 'from-purple-500 to-indigo-600',
        highlights: [
          'Trazado intuitivo de conexiones arrastrando flechas con el ratón.',
          '17 bloques interactivos con vidas, temporizadores, pistas y rachas de fuego.',
          'Configuración granular de PDA, Campo Formativo y criterios formativos.',
          'Generador asistido de reactivos impulsado por el Asistente Pedagógico IA.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Incorporar Videoteca Certificada y Simuladores',
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
        stepNumber: 5,
        title: 'Paso 5: Probar en Vivo (FlowPlayer) y Asignar Calificaciones',
        subtitle: 'Simulador Alumno, Asistencia y Rúbricas NEM',
        description: 'Antes de publicar la actividad, haz clic en "Probar Juego". Experimentarás la lección tal como la vivirá el estudiante: con narración por voz sintetizada nativa, barra de salud, candados y pantalla de victoria. Al publicar, asígnala a tus grupos del Colegio Anglo Mexicano: el sistema registrará los aciertos, intentos y nivel de dominio en tu Libro de Calificaciones institucional.',
        iconName: 'Play',
        badgeText: 'Evaluación Formativa',
        colorClass: 'from-amber-500 to-orange-600',
        highlights: [
          'Verificación previa del ritmo pedagógico, audio y retroalimentación.',
          'Asignación grupal o atención diferenciada personalizada en un clic.',
          'Calificación automática inmediata vinculada a los PDA de la NEM.',
          'Registro de asistencia en tiempo real y bitácoras del portafolio escolar.'
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
        id: 'libros-sep-cuaderno',
        title: 'Libros SEP & Cuaderno Inteligente',
        category: 'Contenido Oficial',
        description: 'Catálogo de libros de texto Conaliteg con mapeo a 0 tokens y motor de preguntas fundamentadas con citas exactas de página.',
        icon: 'BookOpen',
        benefit: 'Enriquece tus clases con la bibliografía de la SEP sin coste de procesamiento.',
        actionUrl: '/teacher',
        actionLabel: 'Consultar Libros Digitales'
      },
      {
        id: 'studio-creator',
        title: 'Estudio Creador de Actividades (Lienzo Digital)',
        category: 'Creación Didáctica',
        description: 'Diseño interactivo con 17 bloques gamificados, conexiones visuales de nodos pedagógicos por flechas y auto-guardado.',
        icon: 'Sparkles',
        benefit: 'Ahorra hasta un 70% del tiempo de planeación docente.',
        actionUrl: '/teacher/studio',
        actionLabel: 'Ir al Estudio Docente'
      },
      {
        id: 'videoteca-pedagogica',
        title: 'Videoteca Pedagógica & Recursos Certificados',
        category: 'Recursos Multimedia',
        description: 'Videos YouTube verificados 200 OK por materia (Inglés Pre-A1 a B2, Matemáticas, Ciencias, etc.) y portales oficiales auditados.',
        icon: 'Video',
        benefit: 'Material didáctico verificado sin enlaces rotos ni contenidos inapropiados.',
        actionUrl: '/teacher',
        actionLabel: 'Ver Recursos en Planificador'
      },
      {
        id: 'gradebook-analytics',
        title: 'Libro de Calificaciones & Rúbricas NEM',
        category: 'Evaluación Formativa',
        description: 'Registro automatizado de aciertos, intentos, nivel de dominio, asistencia y tiempo dedicado por cada alumno.',
        icon: 'Award',
        benefit: 'Monitoreo objetivo alineado a los 4 campos formativos de la NEM.',
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
        description: 'Banco de actividades compartidas por profesores del colegio y respaldo automático en el Repositorio Central.',
        icon: 'Users',
        benefit: 'Intercambio de mejores prácticas y proyectos interdisciplinarios.',
        actionUrl: '/teacher',
        actionLabel: 'Ir al Panel Docente'
      }
    ],
    faq: [
      {
        q: '¿Cómo funciona la Bóveda Curricular y la búsqueda de las 703 planeaciones oficiales?',
        a: 'La Bóveda Curricular contiene 703 nodos pedagógicos que cubren exhaustivamente las Fases 3, 4, 5 y 6 de la Nueva Escuela Mexicana. Al ingresar cualquier palabra clave, tema o PDA en el Planificador Didáctico, el motor busca en la bóveda local entregando los resultados en menos de 5 milisegundos con su estructura completa: inicio, desarrollo, cierre, rúbricas y bibliografía oficial de la SEP.'
      },
      {
        q: '¿Qué es la política "Vault-First" (Bóveda Primero) y cómo optimiza el trabajo docente?',
        a: 'La política Vault-First establece que siempre que se solicita una planeación, el sistema consulta prioritariamente la Bóveda Curricular para reutilizar nodos oficiales preexistentes. Solo en caso de no encontrarse una planeación para el tema o PDA solicitado, entra en acción el Motor de IA Pedagógica para generarla. Una vez generada, se guarda automáticamente en la Bóveda y se sincroniza con el Repositorio Central para que esté disponible de por vida.'
      },
      {
        q: '¿Cómo funciona el subsistema de Libros de Texto SEP y el Cuaderno Inteligente a 0 tokens?',
        a: 'El sistema indexa localmente los libros de texto gratuitos oficiales de Conaliteg para Primaria y Secundaria. La extracción de lecturas, conceptos y ejercicios opera mediante indexación estructural directa, lo que permite aprovechar los contenidos curriculares a 0 tokens de IA. Además, el Cuaderno Inteligente fundamenta las respuestas y orientaciones citando el número de página y tomo exacto.'
      },
      {
        q: '¿Cuáles son los 17 bloques disponibles en el Estudio de Actividades (Lienzo Digital)?',
        a: 'El Estudio cuenta con 17 bloques modulares: Pregunta de Opción Múltiple, Arrastrar y Soltar (Drag & Drop), Completar Enunciado, Escape Room con Candado de Misterio, Batalla contra Boss RPG, Tarjetas de Memoria, Ordenar Cronología / Pasos, Ruleta de Preguntas, Verdadero o Falso, Laboratorio / Simulador Externo Web, Video Pedagógico Certificado, Texto Informativo, Imagen Interactiva, Audio Narrado, Selección Múltiple, Calculadora / Fórmula y Pantalla de Victoria con Recompensas XP.'
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
    roleTitle: 'Guía de Aventuras, Mascotas Místicas y Personalizador Anime',
    roleSubtitle: 'Colegio Anglo Mexicano • Tu Portal de Aprendizaje Gamificado',
    roleBadge: 'Rol: Estudiante / Explorador',
    heroDescription: '¡Bienvenido a tu aventura de aprendizaje en ISkool! Aquí cada tarea escolar se convierte en una misión donde ganas Puntos de Experiencia (XP), Monedas de Oro, mejoras tu Avatar anime Shonen o Hechicera con animaciones en vivo, crías a tus Compañeros Místicos a través de 5 etapas evolutivas, construyes tu Santuario con 5 Casas Temáticas y conquistas el Mapa de Aventuras.',
    keyBenefits: [
      '🗺️ Mapa de Aventuras (Saga Map): Ruta de misiones desbloqueables donde tu avatar camina fluido a escala 3x.',
      '🐾 Compañeros Místicos & Mascotas Vivas: 10 razas elementales, caricias interactivas (petting touch) y 5 etapas evolutivas por tareas escolares.',
      '🏡 Santuario y Hogar Gamificado: 5 Casas Temáticas con partículas, matriz de 32 ranuras y 10 camas progresivas con regeneración de energía (+10⚡ a +300⚡).',
      '🎨 Personalizador de Avatar Anime Shonen / Hechicera: 15+ estilos de cabello, 15 colores, 6 categorías de guardarropa y animaciones de magia y salto acrobático.',
      '📖 Libros de Texto SEP & Cuaderno Inteligente: Consulta digital de tus libros Conaliteg y resuelve dudas con citas exactas de página.',
      '⚔️ Combates RPG Pixi contra Bosses: Derrota monstruos del aprendizaje donde tus aciertos académicos son tus mejores ataques.',
      '🎧 FlowPlayer con sintetizador de voz nativo, pistas de apoyo y retroalimentación inmediata.',
      '🔥 Rachas de Fuego (Streak), monedas de oro y Tienda Escolar para canjear recompensas reales.',
      '📜 Portafolio de Evidencias y Diplomas de Honor oficiales descargables en PDF con firma docente.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Entrar al Mapa de Misiones (Saga Map)',
        subtitle: 'Tu Saga de Aprendizaje con Avatar Dinámico',
        description: 'Al iniciar sesión verás tu mapa de aventuras con las lecciones asignadas por tus profesores. Tu avatar anime personalizado camina fluidamente sobre el sendero hacia el nodo activo. Los nodos iluminados representan misiones listas para comenzar, con su recompensa en XP, monedas de oro y progreso para la evolución de tu mascota.',
        iconName: 'Map',
        badgeText: 'Misiones Activas',
        colorClass: 'from-amber-500 to-yellow-600',
        highlights: [
          'Revisa las materias activas (Matemáticas, Ciencias, Inglés, Historia).',
          'Consulta la XP y monedas que ganarás al superar cada desafío.',
          'Conserva tus 3 corazones de vida respondiendo con atención.',
          'Observa a tu avatar caminar sobre la ruta hacia cada nuevo reto escolar.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Resolver Desafíos y Consultar Libros SEP',
        subtitle: 'Interactividad, Voz Nativa & Cuaderno Inteligente',
        description: 'Sigue la secuencia de bloques interactuando con simuladores científicos PhET, ordenando oraciones en inglés, completando enunciados, descifrando códigos de escape rooms y manipulando modelos 3D. Si tienes dudas, abre el Cuaderno Inteligente para consultar las páginas oficiales de tus libros de texto gratuitos de la SEP.',
        iconName: 'Gamepad2',
        badgeText: 'Juego Interactivo',
        colorClass: 'from-blue-500 to-indigo-600',
        highlights: [
          'Escucha la narración con voz nativa en cada reactivo en inglés o español.',
          'Manipula vectores, circuitos y moléculas en laboratorios vivos.',
          'Aprovecha las citas de página de los libros SEP para fundamentar tus respuestas.',
          'Usa el banco de pistas guiadas si te quedas atascado en un candado.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Derrotar al Boss y Abrir Cofres Legendarios',
        subtitle: 'Duelo RPG por Turnos con Ataques Académicos',
        description: 'En el desafío final te enfrentarás al monstruo guardián del tema (como el Dragón de la Duda o el Gólem de la Distracción). Aplica tus conocimientos para lanzar ataques críticos, vaciar su barra de vida y reclamar el cofre de botín con gemas, medallas y monedas de oro.',
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
        title: 'Paso 4: Cuidar y Evolucionar a tu Compañero Místico',
        subtitle: '10 Razas Elementales, Caricias y 5 Etapas',
        description: 'Tu mascota escolar crece conforme entregas tareas escolares. Comienza como un Huevo Misterioso, eclosiona en Bebé tras tu 1ª tarea completada, se transforma en Niño a las 3 tareas, se convierte en Adolescente a las 10 tareas y alcanza el rango de Guardián Adulto a las 25 tareas. Acaríciala para subir su Vínculo Afectivo y cuida sus barras de Hambre, Felicidad y Energía.',
        iconName: 'Heart',
        badgeText: 'Mascotas Vivas',
        colorClass: 'from-pink-500 to-rose-600',
        highlights: [
          'Elige tu raza favorita: Cryo, Pyros, Aqua, Voltfang, Flora, Astro, Umbra, Solari, Terra o Axo.',
          'Acaricia a tu mascota con el cursor (Petting Touch) para que emita corazones y gane EXP.',
          'Alimenta (5🪙) y juega con ella (2🪙) para mantener sus barras al máximo.',
          'Desbloquea las 5 etapas evolutivas cumpliendo tus tareas del colegio.'
        ]
      },
      {
        stepNumber: 5,
        title: 'Paso 5: Diseñar tu Hogar en el Santuario y Personalizar Avatar',
        subtitle: '5 Casas Temáticas, Guardarropa Anime & Diplomas',
        description: 'Usa las monedas ganadas en clase para adquirir una de las 5 Casas Temáticas del Santuario (Boreal, Astral, Ártica, Magmática o Coral) e instalar camas regeneradoras de energía. Además, entra al Personalizador Anime para elegir peinados, capas, varitas y atuendos con animaciones de celebración y magia.',
        iconName: 'Smile',
        badgeText: 'Identidad & Santuario',
        colorClass: 'from-purple-500 to-pink-600',
        highlights: [
          '5 Casas Temáticas con partículas ambientales y 32 ranuras para muebles.',
          '10 camas progresivas con regeneración de energía de +10⚡ hasta +300⚡.',
          'Guardarropa de 6 categorías con peinados anime Shonen y Hechicera.',
          'Animaciones interactivas en vivo: Celebrar con salto acrobático y Lanzar Magia arcana.',
          'Descarga tus Diplomas de Honor oficiales con firma docente en Mi Portafolio.'
        ]
      }
    ],
    features: [
      {
        id: 'saga-map',
        title: 'Mapa de Misiones (Saga Map)',
        category: 'Aventura Académica',
        description: 'Ruta visual interactiva con lecciones clasificadas por materia y desplazamiento fluido de tu avatar a escala 3x.',
        icon: 'MapPin',
        benefit: 'Visualiza tu progreso diario de forma clara, divertida y emocionante.',
        actionUrl: '/student',
        actionLabel: 'Ver Mi Mapa'
      },
      {
        id: 'mascotas-vivas',
        title: 'Compañeros Místicos & Mascotas Vivas',
        category: 'Crianza Gamificada',
        description: '10 razas elementales, 5 etapas de evolución por tareas completadas, caricias interactivas y barras Tamagotchi.',
        icon: 'Heart',
        benefit: 'Tu esfuerzo académico diario hace crecer y fortalecer a tu compañero mágico.',
        actionUrl: '/student',
        actionLabel: 'Visitar Mi Mascota'
      },
      {
        id: 'santuario-hogar',
        title: 'Santuario & Hogar Gamificado',
        category: 'Espacio Personal',
        description: '5 Casas Temáticas desbloqueables, matriz de 32 ranuras y 10 camas progresivas con regeneración de energía (+10⚡ a +300⚡).',
        icon: 'Sparkles',
        benefit: 'Crea tu propio refugio personalizado y recupera energía para seguir jugando.',
        actionUrl: '/student',
        actionLabel: 'Ir al Santuario'
      },
      {
        id: 'avatar-studio',
        title: 'Personalizador de Avatar Anime Shonen / Hechicera',
        category: 'Identidad Gamificada',
        description: '15+ estilos de cabello, 15 colores, 15 tonos de piel, 6 categorías de guardarropa y animaciones de magia y salto.',
        icon: 'Smile',
        benefit: 'Demuestra tu rango escolar y estilo único en el mapa de misiones.',
        actionUrl: '/student/avatar',
        actionLabel: 'Personalizar Avatar'
      },
      {
        id: 'libros-cuaderno-alumno',
        title: 'Libros SEP & Cuaderno Inteligente',
        category: 'Consulta Escolar',
        description: 'Tus libros de texto gratuitos Conaliteg en formato digital con orientaciones didácticas y citas de página.',
        icon: 'BookOpen',
        benefit: 'Ten siempre a la mano tus libros oficiales sin cargar mochilas pesadas.',
        actionUrl: '/student',
        actionLabel: 'Abrir Cuaderno Inteligente'
      },
      {
        id: 'flow-player',
        title: 'Reproductor de Actividades (FlowPlayer)',
        category: 'Experiencia Interactiva',
        description: 'Lienzo de juego con sintetizador de voz nativo, vidas, temporizador y retroalimentación inmediata.',
        icon: 'Play',
        benefit: 'Aprende jugando a tu propio ritmo con apoyo audiovisual dinámico.',
        actionUrl: '/student',
        actionLabel: 'Entrar a Misiones'
      },
      {
        id: 'portfolio-evidence',
        title: 'Portafolio de Evidencias & Diplomas de Honor',
        category: 'Historial Académico',
        description: 'Bitácora con todas tus misiones superadas, insignias ganadas y diplomas oficiales descargables en PDF.',
        icon: 'Award',
        benefit: 'Constancia verificable de todo lo que has aprendido para presumir en casa.',
        actionUrl: '/student/portfolio',
        actionLabel: 'Ver Mi Portafolio'
      }
    ],
    faq: [
      {
        q: '¿Cómo evoluciono a mi Compañero Místico de Huevo a Guardián Adulto?',
        a: 'La evolución de tu mascota no depende del azar, sino de tu constancia académica: 1) Huevo Misterioso (0 tareas); 2) Bebé con cinemática de eclosión al completar tu 1ª tarea escolar; 3) Niño al completar 3 tareas; 4) Adolescente al acumular 10 tareas; y 5) Guardián Adulto con forma legendaria al alcanzar 25 tareas escolares completadas.'
      },
      {
        q: '¿Cómo funciona el sistema de caricias interactivas (Petting Touch)?',
        a: 'En la tarjeta de tu mascota en el panel de estudiante o en el Santuario, haz clic o toca suavemente a tu compañero. Observarás corazones animados flotando sobre él y escucharás una reacción de cariño que aumentará su Vínculo Afectivo (EXP).'
      },
      {
        q: '¿Cómo cuido las barras de Hambre, Felicidad y Energía de mi mascota?',
        a: 'Tu compañero místico tiene 3 barras de bienestar: 1) Hambre: dale de comer usando el botón "Alimentar" por 5 monedas de oro; 2) Felicidad: juega con él con el botón "Jugar" por 2 monedas; 3) Energía: se recupera descansando en las camas del Santuario o al descansar entre sesiones de estudio.'
      },
      {
        q: '¿Cuáles son las 5 Casas Temáticas del Santuario y las 10 camas regeneradoras?',
        a: 'Puedes equipar: 1) Cabaña Silvestre Boreal (con lluvia de hojas otoñales); 2) Observatorio Astral Cósmico (estrellas fugaces y nebulosas); 3) Templo de Cristal Ártico (copos de nieve relucientes); 4) Forja y Mansión Magmática (chispas incandescentes); y 5) Cueva Sumergida de Coral (burbujas marinas). Las 10 camas disponibles en la tienda proporcionan regeneración de energía pasiva desde +10⚡ hasta +300⚡ para que nunca te quedes sin energía en tus misiones.'
      },
      {
        q: '¿Cómo personalizo mi Avatar Anime y ejecuto animaciones en vivo?',
        a: 'Dirígete al "Personalizador de Avatar" desde el menú. Puedes seleccionar entre 15+ peinados, 15 colores intensos, 15 expresiones y 6 categorías de prendas (calzado, pantalones/faldas, camisas, capas, sombreros y varitas/armas). Además, haz clic en los botones de acción "Celebrar" (para dar un salto acrobático con confeti) o "Lanzar Magia" (para canalizar un orbe de energía elemental).'
      },
      {
        q: '¿Cómo mantengo activa mi racha de fuego (Streak)?',
        a: 'Completa al menos una misión académica cada día. Al acumular días consecutivos recibirás multiplicadores de XP y cofres con recompensas adicionales en monedas de oro.'
      },
      {
        q: '¿Dónde puedo ver y descargar mis Diplomas de Honor?',
        a: 'En la sección "Mi Portafolio", dentro de la pestaña "Insignias y Certificados", podrás consultar y descargar tus diplomas en PDF con el sello oficial del colegio y la firma de tu profesor titular.'
      }
    ]
  },

  parent: {
    roleId: 'parent',
    roleTitle: 'Guía del Portal Familiar y Monitoreo Tutor',
    roleSubtitle: 'Colegio Anglo Mexicano • Acompañamiento Académico y Formativo en Tiempo Real',
    roleBadge: 'Rol: Padre de Familia / Tutor',
    heroDescription: 'El Portal Familiar de ISkool te brinda una ventana transparente y en tiempo real al desempeño académico de tus hijos. Monitorea su avance curricular en la Nueva Escuela Mexicana, hábitos de estudio, constancia de entrega, crianza de sus compañeros místicos y reconocimientos de mérito sin intermediarios.',
    keyBenefits: [
      '📈 Monitoreo en tiempo real de calificaciones, tareas entregadas y tiempo de estudio diario.',
      '🐾 Visualización del crecimiento de la mascota virtual y racha de constancia de tus hijos.',
      '🛡️ Alertas formativas tempranas ante dificultades en asignaturas o tareas pendientes antes del fin de trimestre.',
      '🏅 Acceso y descarga directa de insignias, diplomas de honor y evidencias de portafolio oficial.',
      '📋 Seguimiento desglosado por los 4 Campos Formativos y Procesos de Desarrollo de Aprendizaje (PDA) de la NEM.',
      '💬 Canal directo y transparente con las observaciones formativas del profesor titular.',
      '📱 Acceso seguro y multiplataforma desde cualquier celular, tableta o computadora sin contraseñas engorrosas.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Acceder al Panel de Hijos',
        subtitle: 'Visión General Familiar & Selector de Hermanos',
        description: 'Inicia sesión con tu correo registrado. Si tienes más de un hijo inscrito en el Colegio Anglo Mexicano, podrás alternar entre sus perfiles con un solo clic para ver su resumen general de calificaciones, asistencias y tareas.',
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
        subtitle: 'Campos Formativos de la NEM & Libros SEP',
        description: 'Revisa las calificaciones desglosadas por materia (Lenguajes, Saberes y Pensamiento Científico, Ética, De lo Humano y lo Comunitario) y los Procesos de Desarrollo de Aprendizaje (PDA) alcanzados, con referencias a los libros de texto gratuitos de la SEP.',
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
        title: 'Paso 3: Acompañar Hábitos, Mascotas y Diplomas',
        subtitle: 'Crianza Positiva, Racha de Fuego & Portafolio',
        description: 'Supervisa el cuidado de la mascota de tu hijo (que crece con sus tareas cumplidas) y su racha de estudio diaria. Descarga sus Diplomas de Honor oficiales con sello escolar para celebrar sus logros en familia.',
        iconName: 'Award',
        badgeText: 'Acompañamiento Positivo',
        colorClass: 'from-amber-500 to-orange-600',
        highlights: [
          'Visualiza el tiempo diario dedicado a la plataforma y las rachas de estudio.',
          'Monitorea la etapa evolutiva de la mascota como reflejo de disciplina.',
          'Descarga constancias y diplomas oficiales de mérito académico en PDF.',
          'Refuerza en casa los temas sugeridos por el profesor.'
        ]
      }
    ],
    features: [
      {
        id: 'parent-dashboard',
        title: 'Panel Familiar en Tiempo Real',
        category: 'Monitoreo Escolar',
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
        id: 'parent-pet-monitor',
        title: 'Monitoreo de Hábitos & Mascota',
        category: 'Motivación',
        description: 'Visualiza la evolución del compañero místico y las rachas de fuego como indicador de disciplina en el estudio.',
        icon: 'Heart',
        benefit: 'Convierte el cumplimiento de deberes en una experiencia positiva compartida.',
        actionUrl: '/parent',
        actionLabel: 'Ver Progreso de Hábito'
      },
      {
        id: 'parent-evidence',
        title: 'Portafolio de Evidencias & Diplomas',
        category: 'Reconocimiento',
        description: 'Visualizador de diplomas oficiales con sello institucional y medallas de mérito logradas por los alumnos.',
        icon: 'Award',
        benefit: 'Reconocimiento verificable del esfuerzo de tus hijos para guardar o imprimir.',
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
        q: '¿Cómo apoya el sistema de mascotas virtuales en los hábitos de estudio de mi hijo?',
        a: 'La mascota mágica no avanza con compras comerciales, sino únicamente cuando el alumno cumple sus deberes escolares (1ª tarea = eclosión de bebé, 3 tareas = niño, 10 tareas = adolescente, 25 tareas = guardián adulto). Esto genera un refuerzo intrínseco muy positivo que motiva al estudiante a repasar sin necesidad de discusiones.'
      },
      {
        q: '¿Dónde descargo los Diplomas de Honor de mis hijos?',
        a: 'En la pestaña "Portafolio y Diplomas" dentro de tu Portal Familiar. Puedes descargar e imprimir los diplomas oficiales emitidos por el Colegio Anglo Mexicano con firma y sello.'
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
    roleTitle: 'Guía Institucional para Directores, Coordinadores y Super Usuarios',
    roleSubtitle: 'Colegio Anglo Mexicano • Auditoría de Tokens, Suspensión Institucional y Preservación Curricular',
    roleBadge: 'Rol: Coordinador / Director / Super Usuario',
    heroDescription: 'El módulo directivo y de super usuario de ISkool proporciona control absoluto sobre la infraestructura institucional: métricas en tiempo real del consumo de tokens del Asistente Pedagógico IA, control deslizante de suspensión escolar con candado multi-cuenta, eliminación segura con cláusula de preservación curricular, estudio de compendios interdisciplinarios y supervisión del cumplimiento de los PDAs de la Nueva Escuela Mexicana.',
    keyBenefits: [
      '🏛️ Directorio de Planteles Activos con recuento de matrícula, suscripciones y auditoría institucional.',
      '⚡ Auditoría en Tiempo Real de Tokens de IA Pedagógica: Monitoreo de consumo de tokens, llamadas a la API y proyección de costos por plantel y docente.',
      '🔒 Control Deslizante de Suspensión Institucional: Bloqueo administrativo inmediato de acceso escolar con candado preventivo multi-cuenta.',
      '🛡️ Eliminación Segura con Cláusula de Preservación Curricular: Los contenidos y planeaciones de la Bóveda NUNCA se eliminan, sino que se preservan y re-acreditan al Prof. Israel López Ángeles.',
      '📑 Estudio de Compendios Interdisciplinarios: Creación y exportación de compendios temáticos globales entre múltiples fases NEM.',
      '📋 Supervisión de Cobertura Curricular de la NEM por Campos Formativos y Ejes Articuladores para sesiones de CTE.',
      '🎨 Personalización Total de Marca Blanca Institucional (logotipos de alta resolución, paletas cromáticas y banners escolares).',
      '👥 Gestión Unificada de Matrícula: Alumnos, claustro docente, academias y cuentas familiares con aislamiento estricto de datos.'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Monitorear Tablero Directivo y Cobertura NEM',
        subtitle: 'Inteligencia Escolar & Auditoría para CTE',
        description: 'Supervisa los promedios globales del colegio, la tasa de finalización de actividades por materia y el avance en los Procesos de Desarrollo de Aprendizaje (PDA) de la Nueva Escuela Mexicana para preparar las sesiones de Consejo Técnico Escolar.',
        iconName: 'BarChart3',
        badgeText: 'Inteligencia de Datos',
        colorClass: 'from-purple-500 to-indigo-600',
        highlights: [
          'Métricas comparativas entre grupos y niveles escolares.',
          'Mapeo de cobertura de los 4 Campos Formativos de la NEM.',
          'Detección temprana de áreas de oportunidad por academia docente.',
          'Exportación de informes ejecutivos listos para CTE.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Auditar Consumo de Tokens de IA en Tiempo Real',
        subtitle: 'Portal de Super Usuario & Eficiencia Financiera',
        description: 'Accede a la pestaña de analítica de Inteligencia Artificial Pedagógica. Supervisa el total de tokens consumidos, llamadas procesadas, coste operativo acumulado y desglose por profesor, garantizando el máximo aprovechamiento del motor sin desperdicio.',
        iconName: 'Cpu',
        badgeText: 'Auditoría de Tokens',
        colorClass: 'from-cyan-500 to-blue-600',
        highlights: [
          'Gráficas de consumo de tokens en tiempo real por periodo y colegio.',
          'Desglose del ahorro generado por la arquitectura Vault-First (<5ms).',
          'Identificación de docentes con mayor generación de proyectos didácticos.',
          'Control preventivo de cuotas y proyecciones de gasto.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Gestionar Suspensión Escolar con Control Deslizante',
        subtitle: 'Interruptor de Estado & Candado Multi-Cuenta',
        description: 'En el directorio de planteles, utiliza el interruptor deslizante de activación/suspensión. Al suspender una escuela, se activa de inmediato un candado administrativo que bloquea el acceso de docentes y alumnos mostrando un mensaje institucional sin alterar sus bases de datos.',
        iconName: 'ShieldCheck',
        badgeText: 'Control de Suspensión',
        colorClass: 'from-amber-500 to-orange-600',
        highlights: [
          'Deslizador de activación instantánea sin tiempos de propagación.',
          'Candado multi-cuenta preventivo para cierres de ciclo o ajustes administrativos.',
          'Mensaje informativo personalizado para la comunidad escolar afectada.',
          'Reactivación inmediata con un solo toque del interruptor.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Aplicar Eliminación Segura con Preservación Curricular',
        subtitle: 'Protección del Acervo del Prof. Israel López Ángeles',
        description: 'Si es necesario dar de baja una escuela de prueba o inactiva, el modal de eliminación aplica la Cláusula de Preservación Curricular: los datos de matrícula se limpian de manera segura, pero todas las planeaciones y actividades de la Bóveda Curricular se preservan de por vida y se re-acreditan al acervo del Prof. Israel López Ángeles en el Repositorio Central.',
        iconName: 'Database',
        badgeText: 'Preservación Curricular',
        colorClass: 'from-emerald-500 to-teal-600',
        highlights: [
          'Doble verificación con confirmación textual obligatoria.',
          'Preservación inviolable de nodos didácticos y secuencias pedagógicas.',
          'Re-acreditación curricular automática al Prof. Israel López Ángeles.',
          'Sincronización segura e íntegra con el Repositorio Central del colegio.'
        ]
      },
      {
        stepNumber: 5,
        title: 'Paso 5: Diseñar Compendios Interdisciplinarios & Marca Escolar',
        subtitle: 'Proyectos Transversales & Marca Blanca',
        description: 'Utiliza el Estudio de Compendios para articular proyectos interdisciplinarios que vinculen Lenguajes con Ciencias y Matemáticas. Personaliza además los logotipos oficiales, paleta de colores y banners para reflejar el prestigio del Colegio Anglo Mexicano.',
        iconName: 'Palette',
        badgeText: 'Compendios & Marca',
        colorClass: 'from-pink-500 to-purple-600',
        highlights: [
          'Agrupación de proyectos didácticos en compendios transversales.',
          'Exportación de cuadernillos interdisciplinarios en PDF institucional.',
          'Carga de logotipos en alta resolución y paletas cromáticas oficiales.',
          'Aislamiento estricto de expedientes y privacidad por escuela.'
        ]
      }
    ],
    features: [
      {
        id: 'admin-analytics',
        title: 'Analíticas Globales del Colegio & CTE',
        category: 'Dirección Escolar',
        description: 'Métricas integrales de aprendizaje, asistencia, participación y cobertura de PDAs de la Nueva Escuela Mexicana.',
        icon: 'TrendingUp',
        benefit: 'Toma de decisiones objetivas fundamentada en datos para el Consejo Técnico Escolar.',
        actionUrl: '/coordinator',
        actionLabel: 'Panel de Coordinación'
      },
      {
        id: 'super-tokens',
        title: 'Auditoría de Tokens de IA en Tiempo Real',
        category: 'Super Usuario',
        description: 'Monitoreo en vivo de consumo de tokens del Motor de IA Pedagógica, llamadas procesadas y análisis de costes.',
        icon: 'Cpu',
        benefit: 'Máxima transparencia y optimización del presupuesto tecnológico del plantel.',
        actionUrl: '/admin',
        actionLabel: 'Ver Auditoría de Tokens'
      },
      {
        id: 'school-suspension',
        title: 'Control Deslizante de Suspensión Escolar',
        category: 'Control de Acceso',
        description: 'Interruptor interactivo de suspensión institucional con candado multi-cuenta preventivo inmediato.',
        icon: 'ShieldCheck',
        benefit: 'Gestión ágil de suscripciones y mantenimiento administrativo sin riesgo de pérdida de datos.',
        actionUrl: '/admin',
        actionLabel: 'Gestionar Planteles'
      },
      {
        id: 'curriculum-preservation',
        title: 'Eliminación Segura con Preservación Curricular',
        category: 'Patrimonio Pedagógico',
        description: 'Garantía institucional que preserva de por vida las planeaciones didácticas de la Bóveda bajo la autoría del Prof. Israel López Ángeles.',
        icon: 'Database',
        benefit: 'Cero pérdida de conocimiento educativo ante limpiezas administrativas.',
        actionUrl: '/admin',
        actionLabel: 'Consultar Protocolo'
      },
      {
        id: 'compendios-studio',
        title: 'Estudio de Compendios Interdisciplinarios',
        category: 'Innovación Curricular',
        description: 'Generador y gestor de compendios temáticos globales que articulan proyectos entre múltiples academias.',
        icon: 'BookOpen',
        benefit: 'Facilita el trabajo por proyectos integradores de la NEM.',
        actionUrl: '/admin',
        actionLabel: 'Abrir Compendios'
      },
      {
        id: 'admin-branding',
        title: 'Personalizador Institucional & Marca Blanca',
        category: 'Identidad Visual',
        description: 'Ajuste de logotipo, colores de marca escolar y esquema de aislamiento estricto por plantel.',
        icon: 'Palette',
        benefit: 'Preserva la identidad y el prestigio exclusivo del Colegio Anglo Mexicano.',
        actionUrl: '/coordinator',
        actionLabel: 'Ajustes Institucionales'
      }
    ],
    faq: [
      {
        q: '¿Cómo funciona la Cláusula de Preservación Curricular al eliminar un plantel?',
        a: 'Al ejecutar la eliminación de un plantel inactivo o de prueba desde el panel de Super Usuario, el sistema borra los registros de matrícula de alumnos y credenciales temporales, pero protege estrictamente todo el acervo pedagógico: las planeaciones didácticas y actividades creadas se preservan de por vida en la Bóveda Curricular y se re-acreditan institucionalmente al Prof. Israel López Ángeles, sincronizándose de forma transparente en el Repositorio Central.'
      },
      {
        q: '¿Qué ocurre al accionar el control deslizante de suspensión de una escuela?',
        a: 'El interruptor de suspensión actualiza en tiempo real el estado del plantel en la base de datos institucional. Al suspenderse, cualquier intento de inicio de sesión o navegación de docentes y alumnos de dicho plantel queda bloqueado por un candado preventivo con aviso administrativo. Los datos permanecen 100% intactos y la reactivación es inmediata al volver a deslizar el interruptor.'
      },
      {
        q: '¿Cómo se audita el consumo de tokens de Inteligencia Artificial Pedagógica?',
        a: 'El panel de Super Usuario registra cada interacción con el Motor de IA Pedagógica: conteo de tokens de entrada (prompts didácticos) y salida (planeaciones generadas), coste estimado en dólares y pesos, y desglose por docente. Gracias a la arquitectura Vault-First, más del 85% de las consultas se resuelven a costo cero de tokens desde la Bóveda Curricular.'
      },
      {
        q: '¿Cómo se garantiza el aislamiento de datos entre diferentes planteles?',
        a: 'La plataforma implementa un esquema estricto de Aislamiento Escolar por Plantel (Multi-School Multi-Tenant Isolation) con políticas RLS activas en la base de datos institucional. Ningún usuario o directivo puede acceder o consultar datos, calificaciones o expedientes pertenecientes a otra institución educativa.'
      },
      {
        q: '¿Cómo exporto reportes para el Consejo Técnico Escolar (CTE)?',
        a: 'En la sección de Analíticas del panel de Coordinación, haz clic en "Exportar Reporte Ejecutivo NEM". El sistema generará un documento formal con métricas de cobertura por Campo Formativo, porcentaje de logro de PDAs y áreas prioritarias de intervención pedagógica.'
      }
    ]
  }
};
