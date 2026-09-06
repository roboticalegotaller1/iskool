import fs from 'fs';
import path from 'path';

const VAULT_BASE = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool\\planeaciones\\Secundaria';

interface PlanningData {
  campo: string;
  materia: string;
  grado: string; // '1er_Grado' | '2do_Grado' | '3er_Grado'
  temaNumero: number;
  temaTitulo: string;
  tituloProyecto: string;
  ejes: string[];
  pda: string;
  duracion: string;
  preguntasDetonadoras: string[];
  inicio: string;
  desarrollo: string;
  cierre: string;
  evaluacion: string;
  materiales: string;
  evidenciaEntregable: string;
}

const plannings: PlanningData[] = [
  // =========================================================================
  // 🗣️ 1. CAMPO FORMATIVO: LENGUAJES
  // =========================================================================

  // --- ESPAÑOL ---
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    grado: '1er_Grado',
    temaNumero: 1,
    temaTitulo: 'La diversidad de lenguas y su uso en la comunicación familiar, escolar y comunitaria',
    tituloProyecto: 'Mosaico Lingüístico de Nuestra Comunidad: El Valor de Nuestras Palabras',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Reconoce la riqueza lingüística de México y el mundo a partir de obras literarias y testimonios orales, identificando variantes lingüísticas en la familia, escuela y comunidad para promover actitudes de respeto e inclusión.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué en distintas regiones de México o en nuestras familias usamos palabras diferentes para nombrar el mismo objeto (ej. bolillo, birote, pan francés)?',
      '¿Cuántas lenguas originarias se hablan en nuestro país y qué podemos aprender de su cosmovisión?',
      '¿Qué ocurre cuando una lengua deja de hablarse y cómo podemos evitar la discriminación lingüística?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Audición de fragmentos breves de conversaciones y poemas en lenguas originarias (Náhuatl, Zapoteco, Maya) y español con variantes regionales (Norte, Centro, Costa).\n2. Pregunta detonadora: "¿Alguna vez te han corregido por usar una palabra típica de tu familia o estado? ¿Por qué existen tantas formas de hablar español?".\n3. Lluvia de ideas en pizarrón: armar un banco de regionalismos y palabras de origen indígena que usamos todos los días (chocolate, tianguis, papalote, aguacate).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Trabajo en Equipos de 4: Lectura y análisis de fragmentos de "La visión de los vencidos" y testimonios contemporáneos sobre la convivencia lingüística.\n2. Cuadro Comparativo de Variantes: Identificar variantes dialectales, sociales y generacionales en un texto modelo proporcionado por el docente.\n3. Diseño del Guion de Entrevista: Redactar 5 preguntas para entrevistar a un familiar o vecino sobre los modismos, palabras heredadas de sus abuelos o lenguas originarias que conozcan.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de socialización: Cada equipo comparte dos hallazgos sobre las palabras heredadas.\n2. Metacognición: Responder en libreta: "¿Por qué ninguna variante lingüística es superior o inferior a otra?".\n3. Entrega de evidencia: Borrador revisado de la guía de entrevista comunitaria.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Reconocimiento de la Diversidad Lingüística (Sobresaliente: Identifica origen etimológico y variantes regionales con argumentos sólidos | Satisfactorio: Distingue regionalismos sin profundizar en su origen | En Proceso: Muestra prejuicios hacia ciertas variantes).\n• Criterio 2 - Estructura de la Guía de Entrevista (Sobresaliente: Formula preguntas abiertas, pertinentes y respetuosas | Satisfactorio: Preguntas funcionales con detalles menores | En Proceso: Preguntas cerradas sin relación al tema).\n• Instrumento: Lista de cotejo coevaluativa y rúbrica analítica.',
    materiales: 'Audio/bocina con grabaciones breves, copias de textos literarios bilingües, papel bond, plumones de colores.',
    evidenciaEntregable: 'Guía estructurada de entrevista familiar/comunitaria y cuadro comparativo de variantes lingüísticas regionales.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    grado: '2do_Grado',
    temaNumero: 2,
    temaTitulo: 'La diversidad étnica, cultural y lingüística de México a favor de una sociedad intercultural',
    tituloProyecto: 'Voces y Raíces: Crónicas Interculturales de México',
    ejes: ['Interculturalidad Crítica', 'Pensamiento Crítico'],
    pda: 'Fase 6 (2º Secundaria) - Compara y valora textos sobre las tensiones y aportaciones de la diversidad étnica y cultural de México, expresando juicios fundamentados en un texto argumentativo que promueva la convivencia intercultural armónica.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué significa vivir en una sociedad pluricultural y cuál es la diferencia entre asimilación cultural e interculturalidad?',
      '¿Cuáles son los principales desafíos que enfrentan los pueblos originarios y afrodescendientes en el México contemporáneo?',
      '¿Cómo puede el diálogo intercultural enriquecer nuestra propia identidad?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de un mapa etnolingüístico interactivo del Instituto Nacional de Lenguas Indígenas (INALI).\n2. Pregunta detonadora: "¿Por qué México se reconoce constitucionalmente como una nación pluricultural y qué derechos ampara este principio?".\n3. Recuperación de saberes previos: debate breve sobre casos reales de discriminación y aportaciones culturales de comunidades afromexicanas e indígenas.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis Crítico de Textos: Lectura en parejas de dos artículos de opinión con posturas encontradas sobre las políticas de preservación lingüística.\n2. Taller de Argumentación: Identificar la tesis central, los datos estadísticos de respaldo y las falacias retóricas en los textos leídos.\n3. Redacción de Borrador: Estructurar un ensayo argumentativo breve (Introducción con tesis, 2 argumentos con evidencia y Conclusión) proponiendo acciones para erradicar la discriminación cultural en la escuela.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Coevaluación en Parejas: Intercambio de borradores utilizando una rúbrica de coherencia y cohesión.\n2. Reflexión final: "¿Qué acción concreta puedo implementar hoy para respetar la diversidad de mis compañeros?".\n3. Entrega de evidencia: Ficha de análisis argumentativo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Postura Crítica e Intercultural (Sobresaliente: Defiende con argumentos y fuentes oficiales el valor de los derechos pluriculturales | Satisfactorio: Argumenta pero con evidencias limitadas | En Proceso: Copia textual sin emitir juicio propio).\n• Criterio 2 - Cohesión y Estructura Ensayística (Sobresaliente: Conectores lógicos fluidos y tesis clara | Satisfactorio: Estructura reconocible con fallas de puntuación | En Proceso: Párrafos inconexos).\n• Instrumento: Rúbrica de producción escrita.',
    materiales: 'Mapa etnolingüístico de México, artículos de opinión impresos, rúbrica de coevaluación.',
    evidenciaEntregable: 'Ensayo argumentativo breve "Construyendo Puentes Interculturales" con aparato crítico básico.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    grado: '3er_Grado',
    temaNumero: 3,
    temaTitulo: 'Textos literarios escritos en español o traducidos (creaciones tradicionales y contemporáneas)',
    tituloProyecto: 'Antología Comentada: El Viaje del Héroe en la Literatura Universal y Mexicana',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (3º Secundaria) - Crea textos narrativos, poéticos o dramáticos a partir del análisis de figuras retóricas, recursos estilísticos y estructuras narrativas de textos literarios universales y mexicanos, expresando una postura estética y personal.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué las historias escritas hace cientos de años (como Don Quijote o el Popol Vuh) siguen emocionándonos hoy en día?',
      '¿Qué recursos estilísticos (metáforas, hipérboles, prosopopeyas) utilizan los autores para conmover al lector?',
      '¿Cómo podemos reinterpretar un relato clásico situándolo en el contexto de nuestra ciudad o colonia actual?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Lectura dramatizada por parte del docente de un microrrelato contemporáneo y un fragmento de Juan Rulfo ("Pedro Páramo").\n2. Pregunta detonadora: "¿Qué hace que una historia se sienta viva y estética y no como un simple informe de sucesos?".\n3. Identificación colectiva de figuras retóricas presentes en los textos leídos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller Literario de Escritura Creativa: Seleccionar un arquetipo literario tradicional (el héroe rebelde, el guardián del bosque, la despedida).\n2. Planificación del Cuento: Elaborar el esquema narrativo (planteamiento, nudo, clímax, desenlace) e incorporar intencionalmente al menos tres figuras retóricas.\n3. Redacción del Primer Borrador: Escritura individual cuidando el tono, la voz del narrador y la atmósfera.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Ronda de "Micrófono de Oro": Dos alumnos leen el inicio de su cuento ante el grupo.\n2. Retroalimentación formativa inmediata entre pares con la técnica "2 estrellas y 1 deseo".\n3. Entrega de evidencia: Esquema narrativo y primer borrador del cuento.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Creatividad y Voz Narrativa (Sobresaliente: Construye una atmósfera envolvente y personajes con profundidad | Satisfactorio: Historia coherente con desarrollo predecible | En Proceso: Relato esquemático sin elementos literarios).\n• Criterio 2 - Uso de Recursos Retóricos (Sobresaliente: Integra metáforas y comparaciones con valor estético | Satisfactorio: Usa 1 o 2 figuras forzadas | En Proceso: No usa figuras retóricas).\n• Instrumento: Rúbrica de creación literaria.',
    materiales: 'Antología de cuentos breves mexicanos e hispanoamericanos, hojas de diseño narrativo, guía de figuras retóricas.',
    evidenciaEntregable: 'Cuento literario original ilustrado para la Antología del Salón.'
  },

  // --- INGLÉS ---
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    grado: '1er_Grado',
    temaNumero: 1,
    temaTitulo: 'La diversidad lingüística y sus formas de expresión en México y el mundo',
    tituloProyecto: 'Global Voices: English as a Bridge for Cultural Diversity',
    ejes: ['Interculturalidad Crítica', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Hace uso del alfabeto, los números y las expresiones básicas en inglés para recuperar información sobre la diversidad lingüística y cultural en países anglófonos y no anglófonos, presentándola mediante fichas informativas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'Why is English considered a global language (lingua franca) today?',
      'How do people greet and express their cultural traditions in different English-speaking countries (UK, USA, Australia, South Africa, India)?',
      'How can we use English to share Mexican traditions with the rest of the world?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Warm-up: Listening to different English accents around the world (BBC, American, Australian, Jamaican, Indian).\n2. Driving Question: "Did you know that there are more non-native English speakers in the world than native speakers? Why?".\n3. Brainstorming: Vocabulary related to countries, nationalities, languages, and traditional greetings.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Pair Work Reading: Short infographic about 4 diverse countries where English is an official language.\n2. Vocabulary & Grammar Practice: Simple present tense ("They speak...", "In Kenya, people greet by...").\n3. Fact Sheet Creation: In pairs, design a bilingual cultural profile card of an assigned country including flags, languages spoken, greetings, and typical cultural traditions.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Gallery Walk: Students display their cultural profile cards on the classroom walls.\n2. Quick Peer Quiz: Asking and answering 3 questions in English to classmates.\n3. Exit Ticket: "One new fact I learned in English today about world cultures".',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1 - Language Accuracy (Outstanding: Correct use of simple present, subject-verb agreement and vocabulary | Satisfactory: Minor spelling errors with clear message | Developing: Incomplete sentences).\n• Criterion 2 - Cultural Content (Outstanding: Rich and accurate cultural data | Satisfactory: Basic information | Developing: Missing data).\n• Instrument: Checklist & Peer Assessment.',
    materiales: 'Audio player with accent samples, world map, colored cardstock, markers, bilingual dictionaries.',
    evidenciaEntregable: 'Cultural Profile Fact Sheet in English with flags, languages and customs.'
  },

  // --- ARTES ---
  {
    campo: 'Lenguajes',
    materia: 'Artes',
    grado: '2do_Grado',
    temaNumero: 2,
    temaTitulo: 'Patrimonio cultural de la comunidad en manifestaciones artísticas',
    tituloProyecto: 'Cartografía del Patrimonio Vivo: Mural Comunitario y Memoria Sensorial',
    ejes: ['Artes y Experiencias Estéticas', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Emplea elementos de las artes visuales y escénicas (color, textura, forma, movimiento y sonido) para reinterpretar y valorar el patrimonio cultural tangible e intangible de su comunidad en una producción artística colectiva.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué monumentos, recetas, fiestas patronales, música o tradiciones forman parte del patrimonio vivo de nuestra comunidad?',
      '¿Cómo podemos usar el color, la forma y la textura para contar la historia de nuestro barrio?',
      '¿Por qué el patrimonio artístico no solo pertenece a los museos sino a las calles y a la memoria colectiva?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección fotográfica de murales comunitarios de Diego Rivera, Siqueiros y arte urbano contemporáneo.\n2. Pregunta detonadora: "¿Si tuvieras que pintar el alma de tu colonia en un solo muro, qué símbolos, colores y personajes no podrían faltar?".\n3. Registro en pizarra de elementos patrimoniales locales tangibles (iglesias, plazas, mercados) e intangibles (música de banda, leyendas, oficios tradicionales).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Bocetaje Colectivo: En equipos de 4, definir la paleta cromática (cálida, fría o contrastante) y la composición visual del mural en papel kraft.\n2. Aplicación de Técnicas Mixtas: Integrar texturas táctiles (arena, cartón corrugado, collage de fotografías) y elementos figurativos o abstractos representativos del patrimonio local.\n3. Ficha Curatorial: Redactar la cédula de la obra con título, autoría grupal y justificación conceptual del mensaje artístico.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Exposición tipo "Museo Escolar": Montaje de los paneles de mural en el aula.\n2. Crítica estética formativa: Cada equipo comenta la técnica y simbolismo del mural de otro equipo.\n3. Entrega de evidencia: Panel mural bocetado con cédula curatorial formal.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Expresión y Simbolismo Patrimonial (Sobresaliente: Representa con maestría y originalidad los valores culturales comunitarios | Satisfactorio: Incluye símbolos reconocibles con técnica básica | En Proceso: Copia sin propuesta propia).\n• Criterio 2 - Manejo de Elementos Plásticos (Sobresaliente: Excelente dominio del color, contraste, textura y equilibrio visual | Satisfactorio: Composición adecuada con detalles de acabado | En Proceso: Descuido en la técnica).\n• Instrumento: Rúbrica de apreciación estética.',
    materiales: 'Rollos de papel kraft o cartulinas grandes, pinturas acrílicas, pinceles, esponjas, recortes, pegamento, cédulas curatoriales impresas.',
    evidenciaEntregable: 'Panel mural comunitario en técnica mixta con cédula artística de interpretación cultural.'
  },

  // =========================================================================
  // 🧬 2. CAMPO FORMATIVO: SABERES Y PENSAMIENTO CIENTÍFICO
  // =========================================================================

  // --- MATEMÁTICAS ---
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    grado: '1er_Grado',
    temaNumero: 1,
    temaTitulo: 'Extensión de los números a positivos y negativos y su orden',
    tituloProyecto: 'El Termómetro Financiero y Geográfico: Dominando los Enteros',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Reconoce la necesidad de los números negativos a partir de situaciones reales (temperaturas bajo cero, altitudes marinas, balances contables y deudas), y los ubica y ordena en la recta numérica justificando las reglas de comparación.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué significa que una cuenta bancaria tenga saldo -150 pesos o que la temperatura en Chihuahua sea de -8 °C?',
      '¿Por qué el número -10 es MENOR que -2 si el número 10 es mayor que 2?',
      '¿Cómo nos ayuda la recta numérica a tomar decisiones financieras responsables?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dinámica del Elevador Subterráneo y el Buceador: Presentar un esquema con niveles sobre el nivel del mar (+ metros) y bajo el nivel del mar (- metros).\n2. Pregunta detonadora: "Si una persona tiene 200 pesos y gasta 350 en el mercado, ¿cómo representamos matemáticamente su estado financiero?".\n3. Recuperación de saberes: Ubicar números naturales en la recta y reflexionar sobre la simetría del cero.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Recta Numérica Gigante: En parejas, trazar una recta numérica graduada de -15 a +15 en una tira de papel.\n2. Desafíos de Orden y Comparación: Resolver situaciones problema usando símbolos >, < o = (ej. comparar -8 vs -3, | -12 | vs 12).\n3. Juego de Simulación Contable "La Tiendita del Barrio": Registrar ingresos (+), deudas (-) y calcular el balance neto final de 5 transacciones consecutivas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria y Formalización: Regla de oro: "En la recta numérica, el número que se ubica más a la derecha siempre es el mayor".\n2. Metacognición: "¿Qué error común cometen las personas al comparar dos números negativos?".\n3. Entrega de evidencia: Hoja de balance contable con recta numérica verificada.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Ubicación y Orden en la Recta (Sobresaliente: Ubica con precisión absoluta enteros positivos, negativos y el cero con escala uniforme | Satisfactorio: Errores menores de escala | En Proceso: Confunde la orientación de negativos a la izquierda del cero).\n• Criterio 2 - Resolución de Problemas de Contexto (Sobresaliente: Modela correctamente ingresos, deudas y variaciones térmicas | Satisfactorio: Resuelve operaciones básicas con dudas en la interpretación | En Proceso: No comprende el signo negativo).\n• Instrumento: Lista de cotejo formativa.',
    materiales: 'Tiras de papel cuadriculado, reglas de 30 cm, plumones, fichas de saldo financiero simuladas.',
    evidenciaEntregable: 'Bitácora Contable "Mi Primer Negocio" con 5 balances resueltos y recta numérica analítica rotulada.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    grado: '2do_Grado',
    temaNumero: 5,
    temaTitulo: 'Medición y cálculo en diferentes contextos (Teorema de Pitágoras y razones trigonométricas)',
    tituloProyecto: 'Ingeniería en el Patio Escolar: Aplicando el Teorema de Pitágoras en la Vida Real',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (2º Secundaria) - Formula, justifica y usa el Teorema de Pitágoras al resolver problemas geométricos y de medición indirecta en contextos reales (construcción de rampas, cálculo de alturas y distancias inaccesibles).',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo sabían los constructores del antiguo Egipto si una esquina formaba un ángulo recto perfecto de 90° usando solo una cuerda con nudos?',
      '¿Qué relación existe entre las áreas de los cuadrados construidos sobre los lados de cualquier triángulo rectángulo?',
      '¿Cómo podemos calcular la altura de un árbol o poste sin subirnos a él?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración geométrica visual con rompecabezas de agua/frijoles: comprobar que el área sobre la hipotenusa es igual a la suma de las áreas sobre los catetos ($a^2 + b^2 = c^2$).\n2. Pregunta detonadora: "¿Por qué el Teorema de Pitágoras SOLAMENTE funciona en triángulos rectángulos y qué pasa si el ángulo es obtuso o agudo?".\n3. Identificación de catetos e hipotenusa en figuras reales del aula (marcos de puertas, esquinas de mesas).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Demostración Geométrica en Papel Milimétrico: Construir triángulos rectángulos de catetos (3, 4, 5) y (6, 8, 10). Dibujar los cuadrados sobre cada lado, calcular sus áreas y comprobar algebraicamente la igualdad.\n2. Taller de Despeje y Cálculo: Despejar $c = \\sqrt{a^2 + b^2}$ y $a = \\sqrt{c^2 - b^2}$.\n3. Problema de Accesibilidad Escolar: Diseñar una rampa para silla de ruedas que debe salvar una altura de 1.2 metros con una base horizontal de 5 metros. Calcular la longitud exacta de la rampa ($c$) y el costo del material.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común de los resultados del diseño de la rampa.\n2. Metacognición: "¿En qué otra profesión (arquitectura, navegación, videojuegos) es indispensable usar este teorema?".\n3. Entrega de evidencia: Hoja de cálculo geométrico con la justificación del diseño de la rampa.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Justificación Geométrica y Deducción (Sobresaliente: Demuestra el teorema mediante áreas y fórmula algebraica sin fallos | Satisfactorio: Aplica la fórmula pero le cuesta relacionarla con las áreas | En Proceso: Confunde catetos con hipotenusa).\n• Criterio 2 - Precisión en el Cálculo y Despejes (Sobresaliente: Despeja y opera raíces cuadradas con exactitud | Satisfactorio: Comete errores menores de redondeo | En Proceso: Suma directamente los catetos sin elevar al cuadrado).\n• Instrumento: Rúbrica de resolución de problemas.',
    materiales: 'Papel milimétrico, escuadras de 90°, tijeras, calculadora científica, cinta métrica escolar.',
    evidenciaEntregable: 'Reporte Técnico "Diseño de Rampa Accesible" con trazo geométrico a escala y cálculo de hipotenusa.'
  },

  // --- BIOLOGÍA (1º de Secundaria) ---
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biologia',
    grado: '1er_Grado',
    temaNumero: 1,
    temaTitulo: 'Funcionamiento del cuerpo humano coordinado por los sistemas nervioso y endocrino',
    tituloProyecto: 'Redes de Control: Cómo el Cerebro y las Hormonas Gobiernan Nuestro Cuerpo',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Explica la participación de los sistemas nervioso y endocrino en la coordinación de las funciones del cuerpo humano, reconoce el papel de las hormonas y neurotransmisores en la respuesta a estímulos y valora la importancia de estilos de vida saludables para su cuidado.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué ocurre en tu cuerpo en milésimas de segundo cuando tocas por accidente una olla caliente y retiras la mano?',
      '¿Por qué cuando te asustas o tienes una emoción fuerte el corazón late más rápido, sudan las manos y se dilatan las pupilas?',
      '¿Cómo afecta el uso excesivo de pantallas y la falta de sueño a la producción de melatonina y al sistema nervioso?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Experimento de Tiempo de Reacción: En parejas, soltar una regla graduada y medir cuántos centímetros cae antes de que el compañero la atrape.\n2. Pregunta detonadora: "¿Por qué tardamos entre 150 y 250 milisegundos en reaccionar? ¿Qué ruta siguió el impulso eléctrico desde los ojos hasta los dedos?".\n3. Lluvia de ideas: Diferencias entre estímulo, receptor, centro de control (cerebro/médula) y efector (músculos/glándulas).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Modelado de una Neurona y el Arco Reflejo: En equipos de 3, esquematizar la estructura de una neurona (dendritas, soma, axón, mielina, sinapsis) usando plastilina o colores.\n2. Cuadro Comparativo: Sistema Nervioso (comunicación eléctrica ultra-rápida vía neurotransmisores) vs Sistema Endocrino (comunicación química vía hormonas en el torrente sanguíneo con efectos duraderos como la adrenalina, insulina y hormona del crecimiento).\n3. Estudio de Caso "Estrés y Salud": Analizar cómo el cortisol elevado crónicamente por falta de descanso deteriora la memoria y el sistema inmune.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de síntesis: Concluir por qué ambos sistemas trabajan de forma coordinada (sistema neuroendocrino).\n2. Metacognición en Bitácora: Elaborar un "Decálogo para cuidar mi cerebro y mis glándulas" (sueño de 8 hrs, alimentación, ejercicio).\n3. Entrega de evidencia: Diagrama del arco reflejo y cuadro comparativo neuroendocrino.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Comprensión del Mecanismo Fisiológico (Sobresaliente: Explica con rigor científico la ruta del impulso nervioso y la acción hormonal | Satisfactorio: Describe la ruta general con omisiones menores | En Proceso: Confunde neurona con célula muscular).\n• Criterio 2 - Relación con Hábitos de Vida Saludable (Sobresaliente: Argumenta con evidencia médica cómo el descanso y la nutrición protegen el sistema neuroendocrino | Satisfactorio: Menciona hábitos generales | En Proceso: No relaciona el tema con la salud).\n• Instrumento: Guía de observación y rúbrica analítica.',
    materiales: 'Reglas de 30 cm, plastilina de colores, pliegos de papel bond, infografías del sistema endocrino, plumones.',
    evidenciaEntregable: 'Infografía Científica "El Arco Reflejo y la Respuesta Neuroendocrina ante el Estrés".'
  },

  // --- FÍSICA (2º de Secundaria) ---
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Fisica',
    grado: '2do_Grado',
    temaNumero: 3,
    temaTitulo: 'Principios de Pascal y de Arquímedes',
    tituloProyecto: 'La Fuerza de los Fluidos: De los Frenos Hidráulicos a los Barcos Gigantes',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (2º Secundaria) - Experimenta e interpreta los principios de Pascal y Arquímedes en fenómenos cotidianos y aplicaciones tecnológicas (gatos hidráulicos, sistemas de frenado, flotabilidad de cuerpos y submarinos), calculando presión, fuerza y empuje hidrostático.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué un barco de acero que pesa miles de toneladas flota en el mar, pero una pequeña moneda de metal se hunde de inmediato?',
      '¿Cómo es posible que con la simple fuerza de un pie sobre el pedal de freno de un automóvil podamos detener un vehículo de 2 toneladas a alta velocidad?',
      '¿Qué relación existe entre la densidad de un fluido y la fuerza de empuje que experimenta un cuerpo sumergido?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración experimental con dos jeringas de distinto diámetro conectadas por una manguera con agua coloreada (Prensa Hidráulica Escolar).\n2. Pregunta detonadora: "Si aplicamos una fuerza pequeña en el émbolo chico, ¿por qué el émbolo grande es capaz de levantar un libro pesado? ¿De dónde sale esa fuerza extra?".\n3. Recuperación de saberes: Definición de Presión ($P = F / A$) y principio de incompresibilidad de los líquidos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Laboratorio en Equipos:\n   • Parte A (Principio de Pascal): Medir las áreas de las jeringas ($A_1$ y $A_2$) y comprobar algebraicamente la multiplicación de fuerza: $F_2 = F_1 \\cdot (A_2 / A_1)$.\n   • Parte B (Principio de Arquímedes): Sumergir un bloque de plastilina compacto en una probeta con agua (se hunde); luego moldearlo en forma de barquito hueco (flota). Medir el volumen de agua desalojada y calcular la Fuerza de Empuje ($E = \\rho \\cdot g \\cdot V$).\n2. Resolución de Problemas Contextualizados: Calcular la fuerza necesaria para elevar un auto en un taller mecánico mediante un elevador hidráulico.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización de resultados experimentales y contrastación de datos calculados vs observados.\n2. Metacognición: "¿Por qué los submarinos usan tanques de lastre de agua para sumergirse o emerger?".\n3. Entrega de evidencia: Reporte de práctica de laboratorio con cálculos de presión y empuje.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Aplicación Matemática y Conceptual (Sobresaliente: Resuelve problemas de $P_1 = P_2$ y calcula empuje hidrostático con unidades correctas en SI | Satisfactorio: Resuelve fórmulas con errores en conversión de unidades | En Proceso: Dificultad para relacionar fuerza y área).\n• Criterio 2 - Procedimiento Experimental y Rigor (Sobresaliente: Manipula el equipo de laboratorio con destreza y registra datos con precisión | Satisfactorio: Desarrolla la práctica con apoyo del docente | En Proceso: No concluye la fase experimental).\n• Instrumento: Rúbrica de laboratorio experimental.',
    materiales: 'Jeringas de 5 ml y 20 ml, manguera flexible de acuario, agua con colorante, plastilina, dinamómetro, probetas graduadas de 100 ml, balanza granataria.',
    evidenciaEntregable: 'Reporte de Práctica de Laboratorio "Fuerza Hidráulica y Flotabilidad" con datos experimentales y conclusiones físicas.'
  },

  // --- QUÍMICA (3º de Secundaria) ---
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Quimica',
    grado: '3er_Grado',
    temaNumero: 5,
    temaTitulo: 'Las reacciones químicas: ecuaciones, manifestaciones y propiedades',
    tituloProyecto: 'La Alquimia Moderna: Ley de Conservación de la Materia y Balanceo Químico',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (3º Secundaria) - Reconoce y modela reacciones químicas mediante el lenguaje simbólico de las ecuaciones químicas, identifica manifestaciones de cambio químico (desprendimiento de gas, cambio de color, precipitado y variación de temperatura) y comprueba la Ley de Conservación de la Materia de Lavoisier mediante balanceo por tanteo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'Cuando quemamos un trozo de madera y queda solo un puñado de cenizas, ¿a dónde se fue la masa restante? ¿Desapareció la materia?',
      '¿Cómo podemos saber si ocurrió un cambio químico o simplemente un cambio físico al mezclar dos sustancias?',
      '¿Por qué una ecuación química debe estar perfectamente balanceada como una balanza en equilibrio?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración en vivo de Cambio Químico: Bicarbonato de sodio + vinagre en un matraz sellado con un globo sobre una balanza digital. Observar que la masa total se mantiene idéntica antes y después de la efervescencia ($m_{\\text{reactivos}} = m_{\\text{productos}}$).\n2. Pregunta detonadora: "¿Por qué el gas que infló el globo no provocó que la balanza marcara menos masa?".\n3. Formalización del postulado de Antoine Lavoisier: "La materia no se crea ni se destruye, solo se transforma".',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller Simbólico de Ecuaciones Químicas: Identificar reactivos, productos, coeficientes estequiométricos, subíndices y estados de agregación ($s, l, g, ac$).\n2. Taller de Balanceo por Tanteo con Modelos Concretos: En parejas, usar bolitas de plastilina de distintos colores para representar átomos (H = blanco, O = rojo, C = negro) y balancear ecuaciones clave:\n   • Combustión del metano: $\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$\n   • Fotosíntesis: $6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$\n3. Verificación de conteo atómico: Comprobar que el número de átomos de cada elemento sea idéntico en ambos miembros de la ecuación.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Reto Pizarrón: Dos equipos compiten amistosamente en balancear una reacción de neutralización en tiempo récord.\n2. Metacognición: "¿Por qué NUNCA debemos alterar los subíndices de una fórmula química al balancear?".\n3. Entrega de evidencia: Hoja de trabajo con 5 ecuaciones químicas balanceadas con modelos atómicos dibujados.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Dominio del Lenguaje Químico y Simbología (Sobresaliente: Distingue con precisión reactivos, productos, coeficientes y subíndices | Satisfactorio: Identifica reactivos y productos con dudas menores en subíndices | En Proceso: Confunde coeficiente con subíndice).\n• Criterio 2 - Balanceo de Ecuaciones por Tanteo (Sobresaliente: Balancea correctamente respetando la ley de conservación de masas | Satisfactorio: Balancea ecuaciones simples pero comete errores en ecuaciones complejas | En Proceso: Modifica subíndices indebidamente).\n• Instrumento: Lista de cotejo y ejercicios de evaluación formativa.',
    materiales: 'Bicarbonato de sodio, vinagre blanco, globos, matraces o botellas PET, balanza digital, plastilina tricolor para modelado atómico, hojas de reactivos.',
    evidenciaEntregable: 'Taller de Balanceo Químico con modelado corpuscular dibujado y comprobación de la Ley de Lavoisier.'
  },

  // =========================================================================
  // 🌍 3. CAMPO FORMATIVO: ÉTICA, NATURALEZA Y SOCIEDADES
  // =========================================================================

  // --- GEOGRAFÍA (1º de Secundaria) ---
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Geografia',
    grado: '1er_Grado',
    temaNumero: 1,
    temaTitulo: 'El espacio geográfico como un producto social',
    tituloProyecto: 'Diagnóstico Territorial: Nuestra Colonia a Través del Espacio Geográfico',
    ejes: ['Pensamiento Crítico', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Comprende que el espacio geográfico es una construcción social dinámica integrada por componentes naturales, sociales, culturales, económicos y políticos, y analiza las relaciones e interacciones entre ellos en su entorno local.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué decimos que la colonia donde vivimos no es solo un pedazo de tierra, sino una construcción de la sociedad?',
      '¿Cómo han transformado las actividades humanas el paisaje natural de nuestra comunidad en los últimos 20 años?',
      '¿Qué componentes (naturales, económicos o políticos) generan las mayores desigualdades en el acceso a servicios básicos?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección comparativa de imágenes aéreas satelitales (Google Earth) de la localidad: antes (hace 25 años) vs hoy.\n2. Pregunta detonadora: "¿Qué elementos naturales desaparecieron y qué infraestructura social o económica se construyó encima? ¿Quiénes tomaron esas decisiones?".\n3. Lluvia de ideas: Clasificar elementos de la colonia en 5 categorías (Naturales, Sociales, Culturales, Económicos y Políticos).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Elaboración de un Croquis Temático Comunitario en Equipos: Trazar el mapa de la colonia identificando zonas de riesgo natural (arroyos, laderas), zonas comerciales, escuelas, centros de salud y áreas verdes.\n2. Matriz de Interacción Geográfica: Analizar en tabla cómo el componente natural (clima, relieve) condiciona el componente económico (comercio, agricultura) y cómo el componente político regula el uso del suelo.\n3. Diagnóstico de Necesidades: Identificar una problemática espacial real (falta de agua, carencia de áreas recreativas o contaminación vial).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de socialización de los croquis comunitarios.\n2. Metacognición: "¿Qué puedo proponer desde mi papel de estudiante para mejorar el espacio geográfico escolar?".\n3. Entrega de evidencia: Croquis analítico con matriz de componentes geográficos.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Categorización de Componentes Geográficos (Sobresaliente: Clasifica con exactitud los 5 componentes y explica sus interrelaciones dinámicas | Satisfactorio: Identifica los componentes principales sin profundizar en su interacción | En Proceso: Confunde componentes naturales con sociales).\n• Criterio 2 - Calidad de la Cartografía Comunitaria (Sobresaliente: Croquis con simbología clara, orientación cardinal y escala adecuada | Satisfactorio: Croquis comprensible con simbología básica | En Proceso: Trazo desorganizado sin simbología).\n• Instrumento: Rúbrica de análisis espacial.',
    materiales: 'Imágenes satelitales impresas o proyectadas, papel bond milimétrico, colores, plumones, reglas, simbología cartográfica básica.',
    evidenciaEntregable: 'Croquis Cartográfico Comunitario con Matriz de Interacción de los 5 Componentes Geográficos.'
  },

  // --- HISTORIA ---
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Historia',
    grado: '2do_Grado',
    temaNumero: 3,
    temaTitulo: 'Las revoluciones modernas y sus tendencias (Independencia y Revolución Mexicana)',
    tituloProyecto: 'Diálogos con la Historia: Juicio Crítico a los Caudillos y las Causas Sociales',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Analiza las causas económicas, políticas y sociales de los movimientos revolucionarios en México, examina fuentes primarias y secundarias, y asume una postura crítica sobre las demandas agrarias, laborales y de justicia social.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué las revoluciones armadas no surgen de la nada, sino tras décadas de desigualdad estructural y falta de libertad política?',
      '¿Cuáles eran las diferencias irreconciliables entre el Plan de Ayala de Emiliano Zapata y el proyecto constitucionalista de Venustiano Carranza?',
      '¿Qué ideales de la Revolución Mexicana siguen vigentes en el Artículo 3º, 27º y 123º de nuestra Constitución actual?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Audición de un corrido revolucionario tradicional ("La Adelita" o "El Corrido de Emiliano Zapata") y proyección de fotografías del Archivo Casasola.\n2. Pregunta detonadora: "¿Quiénes eran las personas que aparecen en las fotos? ¿Por qué campesinos, mujeres y obreros arriesgaron su vida en la lucha armada?".\n3. Activación de conocimientos previos sobre el Porfiriato (latifundios, huelgas de Cananea y Río Blanco, reelección).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis de Fuentes Primarias en Equipos: Lectura de fragmentos del Plan de San Luis (Madero), Plan de Ayala (Zapata) y Plan de Guadalupe (Carranza).\n2. Cuadro Comparativo de Facciones Revolucionarias: Maderismo, Zapatismo, Villismo y Constitucionalismo (Líderes, base social, demandas clave y destino histórico).\n3. Simulación de la Convención de Aguascalientes (1914): Debate en el aula donde cada equipo asume la postura de una facción y defiende sus demandas agrarias y obreras.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Síntesis de acuerdos alcanzados en el debate histórico.\n2. Metacognición en libreta: "¿Qué deuda histórica de la Revolución Mexicana consideras que aún no se ha saldado en nuestro país?".\n3. Entrega de evidencia: Cuadro comparativo de facciones y ficha de análisis de fuentes primarias.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Pensamiento Histórico y Análisis Crítico (Sobresaliente: Contrasta fuentes primarias reconociendo sesgos, motivaciones sociales y causas estructurales | Satisfactorio: Resume los acontecimientos sin profundizar en las causas | En Proceso: Repite fechas y nombres sin comprensión histórica).\n• Criterio 2 - Argumentación en el Debate Simulado (Sobresaliente: Defiende con rigor documental la postura de la facción asignada | Satisfactorio: Participa con ideas generales | En Proceso: No participa o desvía el tema).\n• Instrumento: Rúbrica de debate y análisis historiográfico.',
    materiales: 'Copias facsimilares de planes revolucionarios, fotografías históricas impresas, fichas de trabajo de fuentes primarias, proyector.',
    evidenciaEntregable: 'Ensayo Breve o Periódico Histórico "El Sentir de la Revolución" con análisis de fuentes primarias.'
  },

  // --- FORMACIÓN CÍVICA Y ÉTICA ---
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Formacion_Civica_y_Etica',
    grado: '3er_Grado',
    temaNumero: 1,
    temaTitulo: 'Los derechos humanos en México y en el mundo como valores compartidos',
    tituloProyecto: 'Defensores de la Dignidad: Juicio Ciudadano y Mecanismos de Protección',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Igualdad de Género'],
    pda: 'Fase 6 (3º Secundaria) - Asume una postura crítica y comprometida ante situaciones de vulneración de los derechos humanos en México y el mundo, evalúa la eficacia de las leyes e instituciones garantes (CNDH, ONU) y propone mecanismos de exigibilidad ciudadana.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué decimos que los Derechos Humanos son inalienables, universales, indivisibles y progresivos?',
      '¿Qué ocurre cuando una ley o una costumbre cultural vulnera la dignidad humana de las mujeres, pueblos indígenas o migrantes?',
      '¿Qué instituciones y mecanismos legales existen en México para denunciar la violación de un derecho humano?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Presentación de tres titulares de noticias reales sobre casos de discriminación y vulneración de derechos.\n2. Pregunta detonadora: "¿Qué derecho fue violado en cada caso y por qué la dignidad humana no es negociable bajo ninguna circunstancia?".\n3. Recuperación de saberes previos: Declaración Universal de los Derechos Humanos de 1948 y reformas al Artículo 1º Constitucional mexicano.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Análisis de Casos Jurídicos Reales: En equipos de 4, revisar un expediente simulado de la CNDH (discriminación laboral, derecho a la salud, libertad de expresión).\n2. Ruta de Exigibilidad Legal: Identificar qué autoridad debió actuar, qué artículo constitucional fue violentado y cuál es el procedimiento para interponer una queja formal o juicio de amparo.\n3. Elaboración de la "Guía Ciudadana de Denuncia": Redactar un tríptico informativo de bolsillo para la comunidad escolar con pasos claros, teléfonos de ayuda (CNDH, CONAPRED, DIF) y derechos de las víctimas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria: Presentación de las Guías Ciudadanas de Denuncia.\n2. Metacognición: "¿De qué manera puedo ser un defensor activo de los derechos humanos en mi salón y familia?".\n3. Entrega de evidencia: Tríptico de exigibilidad ciudadana revisado.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Fundamentación Legal y Ética (Sobresaliente: Cita con precisión artículos constitucionales y tratados internacionales de DDHH | Satisfactorio: Menciona derechos generales sin respaldo legal formal | En Proceso: Confunde normas de cortesía con derechos humanos fundamentales).\n• Criterio 2 - Propuesta de Acción Ciudadana (Sobresaliente: Diseña una ruta de denuncia clara, viable y accesible para la comunidad | Satisfactorio: Ruta incompleta | En Proceso: No propone soluciones).\n• Instrumento: Rúbrica de formación cívica y ética.',
    materiales: 'Constitución Política de los EUM, folletos de la CNDH, hojas para trípticos, marcadores, noticias impresas.',
    evidenciaEntregable: 'Tríptico Comunitario "Guía de Bolsillo para la Defensa y Denuncia de los Derechos Humanos".'
  },

  // =========================================================================
  // 🤝 4. CAMPO FORMATIVO: DE LO HUMANO Y LO COMUNITARIO
  // =========================================================================

  // --- TECNOLOGÍA ---
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tecnologia',
    grado: '2do_Grado',
    temaNumero: 1,
    temaTitulo: 'Herramientas, máquinas e instrumentos como extensión corporal',
    tituloProyecto: 'Evolución Técnica: De la Mano Humana a los Sistemas Automatizados',
    ejes: ['Pensamiento Crítico', 'Igualdad de Género'],
    pda: 'Fase 6 (2º Secundaria) - Analiza las funciones y delegación de funciones en herramientas, máquinas e instrumentos en distintos procesos productivos, evaluando su impacto ergonómico, ambiental y social para diseñar propuestas de mejora técnica comunitaria.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿De qué manera una pinza, una palanca o un software especializado amplifican o extienden las capacidades de nuestro cuerpo y mente?',
      '¿Cuál es la diferencia técnica entre una herramienta manual, una máquina compuesta y un instrumento de medición digital?',
      '¿Cómo ha cambiado la automatización y la inteligencia artificial los oficios tradicionales de nuestra comunidad?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Exhibición de objetos: una piedra afilada, un cuchillo metálico, una tijera, una licuadora y un circuito electrónico con sensor.\n2. Pregunta detonadora: "¿Qué tienen en común todos estos objetos y qué necesidad humana resolvieron en su momento histórico?".\n3. Concepto clave de Delegación de Funciones: Transferir fuerza, precisión o control del cuerpo humano a un medio técnico.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis Funcional y Ergonómico en Parejas: Seleccionar un artefacto tecnológico común (ej. taladro, bicicleta, smartphone, máquina de coser).\n2. Diagrama de Flujo Técnico: Desglosar entrada (energía humana o eléctrica), proceso (mecanismos de transmisión, engranes, poleas) y salida (trabajo realizado).\n3. Taller de Rediseño Ergonómico: Proponer una mejora técnica al artefacto para personas con discapacidad motriz o para reducir el consumo energético.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Presentación tipo "Feria de Inventores": Cada pareja expone su propuesta de rediseño técnico.\n2. Metacognición: "¿La tecnología siempre beneficia a todos por igual o puede generar exclusión?".\n3. Entrega de evidencia: Ficha técnica y boceto de rediseño ergonómico.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Análisis de Sistemas Técnicos (Sobresaliente: Identifica con precisión la delegación de funciones, mecanismos de transmisión y ergonomía | Satisfactorio: Describe el funcionamiento general con lagunas técnicas | En Proceso: No comprende el concepto de delegación de funciones).\n• Criterio 2 - Propuesta de Innovación y Accesibilidad (Sobresaliente: Diseña una mejora ergonómica innovadora, viable y sustentable | Satisfactorio: Propuesta básica con impacto limitado | En Proceso: Copia el objeto sin cambios).\n• Instrumento: Rúbrica de proyectos tecnológicos.',
    materiales: 'Herramientas manuales desmontadas seguras, papel milimétrico, colores, guía de ergonomía y dibujo técnico.',
    evidenciaEntregable: 'Boceto de Dibujo Técnico con Ficha Ergonómica de Mejora a un Sistema Técnico Cotidiano.'
  },

  // --- EDUCACIÓN FÍSICA ---
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Educacion_Fisica',
    grado: '1er_Grado',
    temaNumero: 2,
    temaTitulo: 'Estilos de vida activos y saludables',
    tituloProyecto: 'Circuito de Condición Física y Salud Integral: Mi Plan de Vida Activa',
    ejes: ['Vida Saludable', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Diseña y organiza actividades lúdicas y físico-deportivas para evaluar sus capacidades perceptivo-motrices y condicionales (resistencia, fuerza, velocidad y flexibilidad), proponiendo un plan personalizado de vida activa y saludable.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el sedentarismo se considera una de las principales amenazas de salud para los adolescentes en México?',
      '¿Cómo medimos la frecuencia cardíaca en reposo y en esfuerzo para saber si estamos trabajando en una zona cardiovascular segura?',
      '¿Qué componentes debe tener una sesión de actividad física completa para prevenir lesiones?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. En la cancha escolar: Medición de frecuencia cardíaca basal en la arteria carótida o radial durante 1 minuto ($F_c$ basal).\n2. Pregunta detonadora: "¿Por qué nuestro corazón se acelera y qué nos indica el tiempo que tarda en volver a su ritmo normal tras el ejercicio?".\n3. Calentamiento articular y neuromuscular dinámico guiado de cabeza a pies (movilidad articular, estiramientos activos).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Circuito de 5 Estaciones de Capacidades Físicas (en equipos de 5):\n   • Estación 1: Flexibilidad (Test Sit and Reach con cajón).\n   • Estación 2: Fuerza en tren inferior (Sentadillas técnicas con propio peso corporal en 1 min).\n   • Estación 3: Fuerza en tren superior (Lagartijas modificadas en 1 min).\n   • Estación 4: Agilidad y coordinación (Escalera pliométrica de piso).\n   • Estación 5: Resistencia aeróbica (Test de Course-Navette o trote continuo de 3 min).\n2. Registro Individual en Ficha de Aptitud Física: Cada alumno anota sus marcas y compara con las tablas estandarizadas de salud escolar.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Vuelta a la calma: Ejercicios de respiración diafragmática y elongación muscular estática.\n2. Metacognición en círculo: "¿Qué capacidad física es mi fortaleza y cuál requiere mayor entrenamiento semanal?".\n3. Entrega de evidencia: Ficha de Autoevaluación de Condición Física.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Ejecución Técnica y Autocuidado (Sobresaliente: Ejecuta los ejercicios con técnica biomecánica correcta y postura segura | Satisfactorio: Desarrolla el circuito con correcciones menores | En Proceso: Ejecuta movimientos riesgosos sin control postural).\n• Criterio 2 - Compromiso con el Plan Saludable (Sobresaliente: Diseña metas semanales realistas de actividad física y alimentación | Satisfactorio: Plan básico | En Proceso: No llena su registro).\n• Instrumento: Ficha de aptitud física y lista de cotejo.',
    materiales: 'Conos, cronómetros, escalera de agilidad, colchonetas, cintas métricas, silbato, fichas de registro impresas.',
    evidenciaEntregable: 'Ficha de Valoración de Capacidades Físicas y Plan de Acción Personalizado de Vida Saludable.'
  },

  // --- TUTORÍA Y EDUCACIÓN SOCIOEMOCIONAL ---
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tutoria_Socioemocional',
    grado: '3er_Grado',
    temaNumero: 3,
    temaTitulo: 'Construcción del proyecto de vida',
    tituloProyecto: 'Brújula de Futuro: Proyecto de Vida, Metas Vocacionales y Resiliencia',
    ejes: ['Pensamiento Crítico', 'Igualdad de Género', 'Inclusión'],
    pda: 'Fase 6 (3º Secundaria) - Valora sus logros, intereses, habilidades socioemocionales y áreas de oportunidad para diseñar de manera autónoma un proyecto de vida con metas a corto, mediano y largo plazo que favorezca su autorrealización personal y comunitaria.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Quién soy hoy, qué talentos me distinguen y quién deseo ser al terminar la secundaria y el bachillerato?',
      '¿Cómo podemos tomar decisiones vocacionales libres de estereotipos de género o presiones sociales externas?',
      '¿Qué estrategias de resiliencia podemos aplicar cuando un plan no resulta como lo esperábamos?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dinámica "El Árbol de Mi Identidad": Dibujar un árbol rápido (Raíces = mis valores y familia; Tronco = mis fortalezas; Ramas = mis sueños; Frutos = mis logros hasta hoy).\n2. Pregunta detonadora: "¿Tener un proyecto de vida significa que nuestro futuro está escrito en piedra, o es una brújula flexible que podemos ajustar?".\n3. Reflexión guiada sobre la importancia de la toma de decisiones informada al egresar de secundaria.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Matriz de Autodiagnóstico FODA Personal: Identificar Fortalezas, Oportunidades (opciones de bachillerato técnico/general), Debilidades y Amenazas.\n2. Taller de Metas SMART (Específicas, Medibles, Alcanzables, Relevantes y con Tiempo definido):\n   • Corto plazo (egreso de secundaria y examen COMIPEMS/bachillerato estatal).\n   • Mediano plazo (conclusión de educación media superior y certificación técnica).\n   • Largo plazo (carrera profesional, oficio, desarrollo artístico/deportivo y contribución comunitaria).\n3. Plan de Contingencia y Red de Apoyo: Identificar a qué personas de confianza acudir ante crisis emocionales o académicas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Ronda de Cierre en Círculo de Paz: Cada alumno comparte en una sola frase su mayor aspiración de vida.\n2. Metacognición: "¿Qué hábito diario debo comenzar a cambiar desde hoy para alcanzar mi meta de mediano plazo?".\n3. Entrega de evidencia: Carta de Compromiso Personal con el Proyecto de Vida.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Autoconocimiento y Claridad de Metas (Sobresaliente: Formula metas SMART coherentes con sus talentos y valores éticos | Satisfactorio: Metas generales con falta de temporalidad | En Proceso: Metas vagas o copiadas).\n• Criterio 2 - Estrategias de Afrontamiento y Resiliencia (Sobresaliente: Identifica redes de apoyo y planes alternativos viables | Satisfactorio: Menciona apoyos generales | En Proceso: Sin visión preventiva ante dificultades).\n• Instrumento: Rúbrica socioemocional y carta de compromiso.',
    materiales: 'Formatos de matriz FODA personal, hojas de diseño de metas SMART, sobres de carta para cápsula del tiempo, plumones.',
    evidenciaEntregable: 'Dossier "Mi Brújula de Vida" con Matriz FODA, Metas SMART a 1, 3 y 5 años y Carta de Compromiso Personal.'
  }
];

function sanitize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

export function generateAllNodes() {
  console.log(`🚀 Iniciando generación de arquitectura de planeaciones NEM en Bóveda de Obsidian...`);

  // Asegurar directorio base
  if (!fs.existsSync(VAULT_BASE)) {
    fs.mkdirSync(VAULT_BASE, { recursive: true });
  }

  const generatedFiles: string[] = [];

  for (const plan of plannings) {
    const targetDir = path.join(VAULT_BASE, plan.grado, plan.materia);
    fs.mkdirSync(targetDir, { recursive: true });

    const safeTitle = sanitize(plan.tituloProyecto);
    const fileName = `Planeacion_${safeTitle}.md`;
    const filePath = path.join(targetDir, fileName);

    const tagCampo = sanitize(plan.campo).toLowerCase();
    const tagGrado = sanitize(plan.grado).toLowerCase();
    const tagMateria = sanitize(plan.materia).toLowerCase();

    const timestamp = new Date().toISOString();

    const markdownContent = `---
tags: [iskool, planeacion_nem, segundo_cerebro, campo_${tagCampo}, grado_${tagGrado}, materia_${tagMateria}, fase6_secundaria]
campo_formativo: "${plan.campo}"
materia: "${plan.materia}"
grado: "${plan.grado.replace('_', ' ')}"
nivel: "Secundaria (Fase 6)"
tema: "${plan.temaTitulo}"
docente: "Prof. Israel López Ángeles"
fecha_creacion: "${timestamp}"
---

# ${plan.tituloProyecto}

> [!INFO] **Ficha Técnica NEM 2022**
> - **Docente Titular:** Prof. Israel López Ángeles
> - **Nivel / Fase:** Secundaria • Fase 6 (${plan.grado.replace('_', ' ')})
> - **Campo Formativo:** ${plan.campo}
> - **Asignatura:** ${plan.materia.replace('_', ' ')}
> - **Duración Estimada:** ${plan.duracion}
> - **Ejes Articuladores:** ${plan.ejes.join(' • ')}

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA)

> **${plan.pda}**

---

## ❓ II. Preguntas Detonadoras para el Salón (Apertura y Conflicto Cognitivo)

${plan.preguntasDetonadoras.map((preg, idx) => `${idx + 1}. **${preg}**`).join('\n\n')}

---

## ⏱️ III. Secuencia Didáctica (Dosificación en Bloques de 50 minutos)

### 📌 Inicio (10 minutos)
${plan.inicio}

### 🔬 Desarrollo (30 minutos)
${plan.desarrollo}

### 💡 Cierre (10 minutos)
${plan.cierre}

---

## 📋 IV. Evaluación Formativa y Rúbrica Analítica

${plan.evaluacion}

---

## 📦 V. Materiales, Recursos y Evidencias Entregables

### Materiales y Recursos Didácticos
${plan.materiales}

### Evidencia Entregable de la Clase (Producto Tangible)
> 📄 **${plan.evidenciaEntregable}**

---

## 🔗 Nodos Relacionados y Conexiones en el Segundo Cerebro
- [[00_Indice_Maestro_Secundaria_NEM|Índice Maestro de Secundaria]]
- [[Planeacion_Modelado_y_Exploracion_Geometrica_de_Funciones_Cuadraticas_y_Parabolas_y_ax_bx_c_1787024824495|Planeación: Parábolas y Funciones Cuadráticas]]
- Tag: #${tagCampo} | #${tagMateria} | #${tagGrado}
`;

    fs.writeFileSync(filePath, markdownContent, 'utf8');
    generatedFiles.push(filePath);
    console.log(`✅ Nodo Creado: ${filePath}`);
  }

  // Generar Nodo Maestro / MOC (Map of Content)
  const masterIndexPath = path.join(VAULT_BASE, '00_Indice_Maestro_Secundaria_NEM.md');
  const masterIndexContent = `---
tags: [iskool, indice_maestro, moc, segundo_cerebro, fase6_secundaria]
titulo: "Mapa de Nodos Curriculares: Secundaria NEM 2022"
docente: "Prof. Israel López Ángeles"
fecha_actualizacion: "${new Date().toISOString()}"
---

# 🗺️ Mapa de Nodos Curriculares: Secundaria NEM 2022 (Fase 6)
**Super Usuario Creador:** Prof. Israel López Ángeles  
**Institución:** Colegio Anglo Mexicano / Plataforma ISkool  

Este nodo actúa como el **Centro de Enlace (Map of Content - MOC)** de la Bóveda de Obsidian, conectando todas las planeaciones didácticas de Secundaria organizadas por Campo Formativo, Grado y Asignatura con enlaces bidireccionales y dosificación de 50 minutos.

---

## 🗣️ 1. Campo Formativo: Lenguajes

### 📚 Español
- **1º Grado:** [[1er_Grado/Espanol/Planeacion_Mosaico_Linguistico_de_Nuestra_Comunidad_El_Valor_de_Nuestras_Palabras|Mosaico Lingüístico de Nuestra Comunidad]]
- **2º Grado:** [[2do_Grado/Espanol/Planeacion_Voces_y_Raices_Cronicas_Interculturales_de_Mexico|Voces y Raíces: Crónicas Interculturales]]
- **3º Grado:** [[3er_Grado/Espanol/Planeacion_Antologia_Comentada_El_Viaje_del_Heroe_en_la_Literatura_Universal_y_Mexicana|Antología Comentada: El Viaje del Héroe]]

### 🌍 Inglés
- **1º Grado:** [[1er_Grado/Ingles/Planeacion_Global_Voices_English_as_a_Bridge_for_Cultural_Diversity|Global Voices: English as a Bridge for Cultural Diversity]]

### 🎨 Artes
- **2º Grado:** [[2do_Grado/Artes/Planeacion_Cartografia_del_Patrimonio_Vivo_Mural_Comunitario_y_Memoria_Sensorial|Cartografía del Patrimonio Vivo: Mural Comunitario]]

---

## 🧬 2. Campo Formativo: Saberes y Pensamiento Científico

### 📐 Matemáticas
- **1º Grado:** [[1er_Grado/Matematicas/Planeacion_El_Termometro_Financiero_y_Geografico_Dominando_los_Enteros|El Termómetro Financiero y Geográfico: Enteros]]
- **2º Grado:** [[2do_Grado/Matematicas/Planeacion_Ingenieria_en_el_Patio_Escolar_Aplicando_el_Teorema_de_Pitagoras_en_la_Vida_Real|Teorema de Pitágoras en la Vida Real]]
- **3º Grado:** [[3_de_Secundaria_Fase_6_14-15_anos/General/Matematicas/Planeacion_Modelado_y_Exploracion_Geometrica_de_Funciones_Cuadraticas_y_Parabolas_y_ax_bx_c_1787024824495|Modelado de Parábolas y Funciones Cuadráticas]]

### 🔬 Biología (1º Grado)
- **1º Grado:** [[1er_Grado/Biologia/Planeacion_Redes_de_Control_Como_el_Cerebro_y_las_Hormonas_Gobiernan_Nuestro_Cuerpo|Redes de Control: Sistemas Nervioso y Endocrino]]

### ⚡ Física (2º Grado)
- **2º Grado:** [[2do_Grado/Fisica/Planeacion_La_Fuerza_de_los_Fluidos_De_los_Frenos_Hidraulicos_a_los_Barcos_Gigantes|Fuerza de los Fluidos: Pascal y Arquímedes]]

### 🧪 Química (3º Grado)
- **3º Grado:** [[3er_Grado/Quimica/Planeacion_La_Alquimia_Moderna_Ley_de_Conservacion_de_la_Materia_y_Balanceo_Quimico|Alquimia Moderna: Ley de Lavoisier y Balanceo Químico]]

---

## 🌍 3. Campo Formativo: Ética, Naturaleza y Sociedades

### 🗺️ Geografía (1º Grado)
- **1º Grado:** [[1er_Grado/Geografia/Planeacion_Diagnostico_Territorial_Nuestra_Colonia_a_Traves_del_Espacio_Geografico|Diagnóstico Territorial: Espacio Geográfico]]

### 📜 Historia
- **2º Grado:** [[2do_Grado/Historia/Planeacion_Dialogos_con_la_Historia_Juicio_Critico_a_los_Caudillos_y_las_Causas_Sociales|Diálogos con la Historia: Revoluciones y Demandas Sociales]]

### ⚖️ Formación Cívica y Ética
- **3º Grado:** [[3er_Grado/Formacion_Civica_y_Etica/Planeacion_Defensores_de_la_Dignidad_Juicio_Ciudadano_y_Mecanismos_de_Proteccion|Defensores de la Dignidad: Juicio y Protección de DDHH]]

---

## 🤝 4. Campo Formativo: De lo Humano y lo Comunitario

### ⚙️ Tecnología
- **2º Grado:** [[2do_Grado/Tecnologia/Planeacion_Evolucion_Tecnica_De_la_Mano_Humana_a_los_Sistemas_Automatizados|Evolución Técnica: De la Mano a la Automatización]]

### 🏃 Educación Física
- **1º Grado:** [[1er_Grado/Educacion_Fisica/Planeacion_Circuito_de_Condicion_Fisica_y_Salud_Integral_Mi_Plan_de_Vida_Activa|Circuito de Condición Física y Salud Integral]]

### 🧭 Tutoría / Educación Socioemocional
- **3º Grado:** [[3er_Grado/Tutoria_Socioemocional/Planeacion_Brujula_de_Futuro_Proyecto_de_Vida_Metas_Vocacionales_y_Resiliencia|Brújula de Futuro: Proyecto de Vida y Metas SMART]]

---
*Generado automáticamente para el ecosistema educativo ISkool & Obsidian Vault.*
`;

  fs.writeFileSync(masterIndexPath, masterIndexContent, 'utf8');
  console.log(`⭐ Índice Maestro Creado: ${masterIndexPath}`);

  return { total: generatedFiles.length, files: generatedFiles, index: masterIndexPath };
}

generateAllNodes();
