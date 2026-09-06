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

export const allPlannings: PlanningData[] = [
  // =========================================================================
  // 🗣️ 1. CAMPO FORMATIVO: LENGUAJES
  // =========================================================================

  // --- ESPAÑOL (6 Temas) ---
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
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Audición de grabaciones con variantes dialectales del español en México y fragmentos en lenguas originarias (Náhuatl, Zapoteco, Maya).\n2. Pregunta detonadora: "¿Alguna vez te han corregido por usar una palabra típica de tu familia o estado? ¿Por qué existen tantas formas de hablar?".\n3. Lluvia de ideas: Construir un banco de palabras de origen indígena usadas cotidianamente.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Lectura en Equipos: Análisis de testimonios sobre la convivencia lingüística y derechos culturales.\n2. Cuadro Comparativo: Clasificar variantes dialectales, sociales y generacionales en un texto modelo.\n3. Guion de Entrevista: Diseñar 5 preguntas para entrevistar a familiares o vecinos sobre modismos y palabras heredadas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización de hallazgos por equipo.\n2. Metacognición: "¿Por qué ninguna forma de hablar es superior a otra?".\n3. Entrega de evidencia: Guion de entrevista comunitaria.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Reconocimiento de la Diversidad Lingüística (Sobresaliente: Identifica origen etimológico y variantes con argumentos sólidos | Satisfactorio: Distingue regionalismos sin profundizar | En Proceso: Muestra prejuicios hacia ciertas variantes).\n• Criterio 2 - Estructura de la Entrevista (Sobresaliente: Preguntas abiertas y pertinentes | Satisfactorio: Preguntas funcionales | En Proceso: Preguntas cerradas sin relación).\n• Instrumento: Lista de cotejo coevaluativa.',
    materiales: 'Audio/bocina, textos bilingües impresos, papel bond, plumones.',
    evidenciaEntregable: 'Guía de entrevista comunitaria y cuadro comparativo de variantes lingüísticas.'
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
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección del mapa etnolingüístico interactivo del INALI.\n2. Pregunta detonadora: "¿Por qué México se reconoce constitucionalmente como una nación pluricultural?".\n3. Debate breve sobre casos reales de aportaciones culturales de comunidades afromexicanas e indígenas.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis Crítico: Lectura en parejas de dos artículos de opinión con posturas encontradas sobre preservación cultural.\n2. Taller de Argumentación: Identificar tesis, argumentos de respaldo y falacias.\n3. Redacción de Ensayo Breve: Estructurar un texto con tesis, dos argumentos fundamentados y conclusión.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Coevaluación en parejas con rúbrica de coherencia.\n2. Metacognición: "¿Qué acción concreta puedo implementar hoy para respetar la diversidad?".\n3. Entrega de evidencia: Ficha de análisis argumentativo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Postura Crítica e Intercultural (Sobresaliente: Defiende con datos oficiales los derechos pluriculturales | Satisfactorio: Argumenta con evidencias limitadas | En Proceso: Copia textual sin juicio propio).\n• Criterio 2 - Cohesión Textual (Sobresaliente: Conectores fluidos y tesis clara | Satisfactorio: Estructura reconocible | En Proceso: Párrafos inconexos).\n• Instrumento: Rúbrica de producción escrita.',
    materiales: 'Mapa etnolingüístico, artículos de opinión impresos, rúbricas.',
    evidenciaEntregable: 'Ensayo argumentativo breve "Construyendo Puentes Interculturales".'
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
      '¿Por qué las historias escritas hace siglos (como el Popol Vuh o Don Quijote) siguen conmoviéndonos hoy?',
      '¿Qué figuras retóricas (metáforas, hipérboles, prosopopeyas) logran transformar una frase simple en arte?',
      '¿Cómo podemos reinterpretar un relato clásico situándolo en nuestra realidad contemporánea?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Lectura dramatizada de un microrrelato contemporáneo y un fragmento de Juan Rulfo.\n2. Pregunta detonadora: "¿Qué hace que una historia se sienta viva y estética?".\n3. Identificación colectiva de figuras retóricas.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Escritura Creativa: Seleccionar un arquetipo literario tradicional.\n2. Planificación del Cuento: Elaborar el esquema narrativo e integrar al menos tres figuras retóricas.\n3. Redacción del Primer Borrador individual.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Dinámica "Micrófono de Oro": Lectura de aperturas de cuentos.\n2. Retroalimentación formativa entre pares (2 estrellas y 1 deseo).\n3. Entrega de evidencia: Esquema narrativo y borrador.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Creatividad y Voz Narrativa (Sobresaliente: Atmósfera envolvente y personajes profundos | Satisfactorio: Historia coherente | En Proceso: Relato esquemático).\n• Criterio 2 - Uso de Figuras Retóricas (Sobresaliente: Metáforas con valor estético | Satisfactorio: Figuras básicas | En Proceso: Sin recursos literarios).\n• Instrumento: Rúbrica de creación literaria.',
    materiales: 'Antología de cuentos breves, formatos de diseño narrativo.',
    evidenciaEntregable: 'Cuento literario original ilustrado para la antología escolar.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    grado: '2do_Grado',
    temaNumero: 4,
    temaTitulo: 'Los géneros periodísticos y sus recursos para comunicar sucesos significativos',
    tituloProyecto: 'Periodistas Comunitarios: La Noticia y el Reportaje de Nuestra Realidad',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Investiga un hecho significativo comunitario o nacional mediante la consulta de fuentes diversas, y redacta noticias, crónicas o reportajes utilizando recursos periodísticos objetivos y verificables.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia entre un hecho comprobable y una opinión en los medios de comunicación?',
      '¿Cómo se estructuran las 6 preguntas clave del periodismo (¿Qué, Quién, Cuándo, Dónde, Por qué, Cómo?)?',
      '¿Qué impacto tienen las "fake news" o noticias falsas en nuestra comunidad y cómo podemos detectarlas?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Comparación de tres portadas de periódicos y notas digitales sobre un mismo suceso.\n2. Pregunta detonadora: "¿Por qué un mismo hecho puede ser contado de formas tan distintas según la línea editorial?".\n3. Identificación de la pirámide invertida en la noticia.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Trabajo en Equipos: Elegir un suceso escolar o comunitario relevante (ej. campaña de reciclaje, torneo deportivo, feria de ciencias).\n2. Redacción de Nota Periodística: Aplicar encabezado, balazo, entrada (lead) con las 6 preguntas periodísticas y cuerpo de la noticia.\n3. Verificación de Fuentes: Contrastar testimonios reales y cifras.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Coedición tipo redacción periodística entre equipos.\n2. Metacognición: "¿Por qué el rigor y la ética son esenciales al informar?".\n3. Entrega de evidencia: Nota periodística diagramada.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Estructura Periodística y Objetividad (Sobresaliente: Aplica pirámide invertida y distingue hechos de opiniones | Satisfactorio: Estructura clara con sesgos leves | En Proceso: Redacción tipo ensayo personal).\n• Criterio 2 - Manejo de Fuentes (Sobresaliente: Cita fuentes fiables y testimonios contrastados | Satisfactorio: Cita una sola fuente | En Proceso: Datos no verificables).\n• Instrumento: Rúbrica periodística escolar.',
    materiales: 'Ejemplares de periódicos, plantillas de diagramación periodística, plumones.',
    evidenciaEntregable: 'Gaceta Escolar con notas informativas y reportajes de la comunidad.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    grado: '1er_Grado',
    temaNumero: 5,
    temaTitulo: 'Comunicación asertiva y dialógica para erradicar expresiones de violencia',
    tituloProyecto: 'Palabras que Construyen Paz: Taller de Diálogo y Mediación Escolar',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Igualdad de Género'],
    pda: 'Fase 6 (1º Secundaria) - Realiza juegos de rol y diálogos reflexivos sobre situaciones de conflicto escolar o familiar, aplicando estrategias de comunicación asertiva, escucha activa y empatía para prevenir y erradicar la violencia verbal y física.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia entre comunicarse de forma pasiva, agresiva y asertiva?',
      '¿Cómo influye el tono de voz, el lenguaje corporal y la elección de palabras al resolver un malentendido?',
      '¿Qué pasos podemos seguir para expresar un desacuerdo sin herir ni atacar a la otra persona?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dramatización breve de un conflicto cotidiano en el salón (ej. préstamo de un material, desacuerdo en equipo).\n2. Pregunta detonadora: "¿Por qué muchas discusiones escalan a agresiones cuando no sabemos expresar lo que sentimos?".\n3. Definición del "Mensaje Yo" (Yo siento... cuando ocurre... porque necesito... y propongo...).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Transformación Asertiva: Convertir 5 frases agresivas o pasivas en expresiones asertivas con la técnica del Mensaje Yo.\n2. Dinámica de Mediación en Tríadas: Roles (Persona A, Persona B y Mediador Asertivo) resolviendo casos simulados.\n3. Decálogo del Aula Dialógica: Redactar 5 acuerdos para la resolución no violenta de conflictos en el salón.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común del Decálogo de Convivencia.\n2. Metacognición: "¿Cómo puedo aplicar la comunicación asertiva hoy en mi hogar?".\n3. Entrega de evidencia: Hoja de casos transformados a lenguaje asertivo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Dominio de la Comunicación Asertiva (Sobresaliente: Aplica la estructura del Mensaje Yo con empatía y claridad | Satisfactorio: Aplica la fórmula con dificultad emocional | En Proceso: Mantiene tono acusatorio).\n• Criterio 2 - Habilidades de Mediación (Sobresaliente: Escucha activa y formulación de acuerdos ganar-ganar | Satisfactorio: Facilita el diálogo básico | En Proceso: Toma partido en el conflicto).\n• Instrumento: Escala estimativa formativa.',
    materiales: 'Tarjetas con casos de conflicto simulados, cartulinas, plumones, formato de acuerdos de paz.',
    evidenciaEntregable: 'Decálogo de Convivencia Dialógica y Registro de Casos Asertivos Resueltos.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    grado: '3er_Grado',
    temaNumero: 6,
    temaTitulo: 'Textos de divulgación científica y mensajes para promover una vida saludable',
    tituloProyecto: 'Ciencia para Todos: Revista de Divulgación y Salud Comunitaria',
    ejes: ['Vida Saludable', 'Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (3º Secundaria) - Elabora una propuesta de divulgación científica sobre temas de salud, medio ambiente o nutrición, transformando textos académicos especializados en un lenguaje accesible, riguroso y atractivo para la comunidad escolar.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué es fundamental que la ciencia se comunique en un lenguaje que cualquier ciudadano pueda entender?',
      '¿Qué recursos utilizan los divulgadores científicos (analogías, infografías, ejemplos cotidianos) para explicar conceptos complejos?',
      '¿Cómo puede la divulgación científica combatir mitos sobre la alimentación, vacunas o adicciones?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Lectura comparativa: Un fragmento de un paper médico denso vs un artículo de revista de divulgación ("¿Cómo ves?" de la UNAM).\n2. Pregunta detonadora: "¿Qué diferencias notas en el vocabulario, las metáforas y las imágenes de ambos textos?".\n3. Identificación de las características de la divulgación científica.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Selección del Tema de Salud en Equipos: Nutrición balanceada, prevención de diabetes, higiene del sueño o salud mental adolescente.\n2. Transformación de Fuentes Científicas: Extraer datos duros de fuentes oficiales (OMS, Secretaría de Salud) y traducirlos a un artículo accesible con analogías visuales.\n3. Diagramación de Artículo de Divulgación: Título atractivo, subtítulos, infografía explicativa y glosario de términos clave.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Ronda de revisión entre pares: Evaluar claridad conceptual y rigor.\n2. Metacognición: "¿Por qué divulgar ciencia es un acto de responsabilidad social?".\n3. Entrega de evidencia: Borrador del artículo de divulgación.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1 - Rigor Científico y Accesibilidad (Sobresaliente: Datos respaldados en fuentes oficiales explicados con claridad y analogías | Satisfactorio: Información verídica pero con tecnicismos sin explicar | En Proceso: Información imprecisa sin fuentes).\n• Criterio 2 - Recursos Gráficos e Infográficos (Sobresaliente: Infografía complementaria clara y visualmente atractiva | Satisfactorio: Gráficos básicos | En Proceso: Sin apoyos visuales).\n• Instrumento: Rúbrica de divulgación científica.',
    materiales: 'Ejemplares de revistas científicas juveniles, computadoras o pliegos de diseño, infografías oficiales de salud.',
    evidenciaEntregable: 'Artículo de Divulgación Científica Ilustrado para la Revista Escolar "Ciencia Viva".'
  },

  // --- INGLÉS (5 Temas) ---
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
      'How do people greet and express their cultural traditions in different English-speaking countries?',
      'How can we use English to share Mexican traditions with the rest of the world?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Warm-up: Listening to English accents around the world (BBC, Australian, Jamaican, Indian).\n2. Driving Question: "Did you know that there are more non-native English speakers than native speakers?".\n3. Brainstorming: Vocabulary on countries, languages, and traditional greetings.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Pair Reading: Short infographic about 4 countries where English is official.\n2. Grammar Practice: Simple present tense ("They speak...", "In Kenya, people celebrate...").\n3. Fact Sheet Creation: Bilingual cultural profile card with flags, greetings and customs.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Gallery Walk: Displaying profile cards on classroom walls.\n2. Peer Q&A in English.\n3. Exit Ticket: "One new fact I learned in English today".',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1 - Language Accuracy (Outstanding: Correct simple present and vocabulary | Satisfactory: Minor spelling errors | Developing: Incomplete sentences).\n• Criterion 2 - Cultural Content (Outstanding: Rich data | Satisfactory: Basic | Developing: Incomplete).\n• Instrument: Checklist & Peer Assessment.',
    materiales: 'Audio player, world map, cardstock, markers.',
    evidenciaEntregable: 'Cultural Profile Fact Sheet in English.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    grado: '2do_Grado',
    temaNumero: 2,
    temaTitulo: 'La identidad y cultura de pueblos de habla inglesa',
    tituloProyecto: 'Traditions and Identities in the Anglophone World',
    ejes: ['Interculturalidad Crítica', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Compara aspectos culturales, costumbres y expresiones identitarias de comunidades de habla inglesa con las de su entorno local, empleando estructuras en tiempo pasado y comparativos en inglés.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'How are traditional celebrations like Halloween or Thanksgiving similar to or different from Día de Muertos?',
      'How has music (rock, jazz, reggae) shaped cultural identities in English-speaking nations?',
      'Why is it important to learn about other cultures without losing our own Mexican roots?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Visual comparison: Images of Día de Muertos in Michoacán vs Celtic Samhain / Halloween in Ireland.\n2. Driving Question: "What do these ancient autumn festivals have in common?".\n3. Vocabulary: Festivals, costumes, offerings, historical roots.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Reading Comprehension: Text describing cultural traditions across the UK, USA, Ireland and Canada.\n2. Language Focus: Comparative adjectives ("Día de Muertos is more colorful than...", "Both festivals originated from...") and Past Simple.\n3. Venn Diagram Poster: In teams of 3, create a comparative visual poster in English.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. 2-minute oral presentation per team in English.\n2. Self-assessment on pronunciation and fluency.\n3. Submission: Comparative cultural poster.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1 - Comparative Structures (Outstanding: Accurate use of comparatives and past tense | Satisfactory: Minor grammatical flaws | Developing: Incorrect comparison forms).\n• Criterion 2 - Cultural Respect (Outstanding: Deep appreciation of cultural diversity | Satisfactory: Surface comparisons | Developing: Stereotypes).\n• Instrument: Oral presentation rubric.',
    materiales: 'Comparative reading worksheets, poster paper, color markers.',
    evidenciaEntregable: 'Comparative Cultural Venn Diagram Poster in English.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    grado: '3er_Grado',
    temaNumero: 3,
    temaTitulo: 'El uso del inglés para expresar necesidades, intereses y problemas de la comunidad',
    tituloProyecto: 'Community Action: Proposing Solutions in English for Local Problems',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (3º Secundaria) - Elabora y presenta propuestas en inglés para solucionar problemas comunitarios (manejo de residuos, cuidado del agua o espacios públicos), utilizando verbos modales (should, must, can) y conectores de causa y efecto.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'What are the most urgent environmental or social problems in our neighborhood?',
      'How can we use modal verbs (should, must, could) to express strong recommendations for our community?',
      'How can an awareness campaign in English reach international organizations or tourists?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Problem Tree Activity: Brainstorming local problems on the board (water scarcity, street dogs, plastic waste).\n2. Driving Question: "If you were mayor of your city, what laws or actions would you propose in English to help tourists and citizens?".\n3. Grammar Activation: Modal verbs of obligation and advice (*should, must, have to*).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Case Study in Teams: Choose one community challenge.\n2. Proposal Drafting: Write 5 actionable proposals using modals and cause-effect connectors (*because, therefore, in order to*).\n3. Infographic Brochure Design: Design a clean bilingual community flyer.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Pitch Session: 1-minute elevator pitch per team.\n2. Peer feedback on persuasive language in English.\n3. Submission of the proposal draft.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1 - Use of Modals & Connectors (Outstanding: Flawless use of should, must and cause-effect connectors | Satisfactory: Minor errors with clear communicative intent | Developing: Incoherent sentences).\n• Criterion 2 - Community Relevance (Outstanding: Highly realistic and impactful solution | Satisfactory: Feasible proposal | Developing: Unrealistic).\n• Instrument: Rubric for civic proposals in English.',
    materiales: 'Template for community proposals, poster boards, dictionary.',
    evidenciaEntregable: 'Community Action Flyer & Proposal Letter in English.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    grado: '2do_Grado',
    temaNumero: 4,
    temaTitulo: 'Relatos en inglés para expresar sucesos significativos',
    tituloProyecto: 'Storytellers: Memoirs and Personal Narratives in English',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (2º Secundaria) - Narra sucesos significativos personales, familiares o escolares en inglés empleando conectores temporales (first, then, after that, finally) y tiempos verbales en pasado simple y continuo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'What is an unforgettable memory or funny story from your childhood?',
      'How do time connectors (first, suddenly, meanwhile, finally) make a story engaging in English?',
      'How do past simple and past continuous work together to describe actions interrupted in the past?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Teacher\'s Anecdote: Short interactive story told with suspense.\n2. Driving Question: "What words helped you follow the sequence of events?".\n3. Time connector bank on board.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Storyboarding in Pairs: Draw a 4-panel comic strip representing a memorable real-life event.\n2. Narrative Writing: Write captions combining Past Simple (*I saw...*) and Past Continuous (*while I was walking...*).\n3. Peer Editing: Check irregular past verb forms.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Storytelling Circle: Volunteers read their narrative comic strip.\n2. Metacognition: "What irregular past verb was hardest to remember?".\n3. Submission: Narrative comic strip draft.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1 - Narrative Sequence & Past Tenses (Outstanding: Accurate past simple/continuous and time connectors | Satisfactory: Minor tense inconsistencies | Developing: Present tense used for past events).\n• Criterion 2 - Visual & Written Harmony (Outstanding: Expressive illustrations matching text | Satisfactory: Simple drawings | Developing: Text only).\n• Instrument: Comic strip rubric.',
    materiales: 'Comic strip templates, colored pens, verb conjugation lists.',
    evidenciaEntregable: 'Illustrated Narrative Comic Strip in English (My Unforgettable Day).'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    grado: '3er_Grado',
    temaNumero: 5,
    temaTitulo: 'Mensajes en inglés en medios de comunicación masiva que promueven una vida saludable',
    tituloProyecto: 'Health Campaign: Public Service Announcements in English',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 6 (3º Secundaria) - Analiza y crea mensajes publicitarios y campañas de servicio público en inglés dirigidas a jóvenes sobre hábitos de vida saludable (alimentación balanceada, deporte y bienestar mental), aplicando lenguaje persuasivo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'How do junk food commercials use catchy slogans and colors to persuade teenagers?',
      'How can we create positive public service announcements in English that inspire healthy habits?',
      'What rhetorical slogans and imperative verbs work best in social media health campaigns?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Analysis of 2 global health ads (WHO, UNICEF).\n2. Driving Question: "What makes a slogan memorable and persuasive in English?".\n3. Slogan structure with imperatives (*Drink water, Stay active, Protect your mind*).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Team Campaign Concept: Choose one health pillar (hydration, sleep hygiene, physical activity, emotional wellbeing).\n2. Slogan & Script Writing: Draft a 30-second social media audio/video PSA script in English.\n3. Poster / Digital Mockup: Create the visual poster for the campaign with clear call-to-actions.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Live PSA Delivery: Teams perform their 30-second announcement.\n2. Peer evaluation on voice projection and persuasion.\n3. Submission of the PSA script and campaign poster.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1 - Persuasive Language & Imperatives (Outstanding: Catchy slogans, correct imperative forms and vocabulary | Satisfactory: Understandable message | Developing: Literal translation errors).\n• Criterion 2 - Health Message Impact (Outstanding: Evidence-based healthy advice | Satisfactory: General advice | Developing: Unclear).\n• Instrument: Public announcement rubric.',
    materiales: 'Sample PSA ads, poster paper, recording device (optional).',
    evidenciaEntregable: 'Public Service Announcement (PSA) Campaign Script and Poster in English.'
  }
];

export function generateFullArchitecture() {
  console.log(`🚀 Generando todos los nodos curriculares en la Bóveda de Obsidian...`);

  // Asegurar carpetas por grado
  const grados = ['1er_Grado', '2do_Grado', '3er_Grado'];
  for (const g of grados) {
    fs.mkdirSync(path.join(VAULT_BASE, g), { recursive: true });
  }

  const generatedList: string[] = [];

  for (const plan of allPlannings) {
    const targetDir = path.join(VAULT_BASE, plan.grado, plan.materia);
    fs.mkdirSync(targetDir, { recursive: true });

    const safeTitle = plan.tituloProyecto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const fileName = `Planeacion_${safeTitle}.md`;
    const filePath = path.join(targetDir, fileName);

    const tagCampo = plan.campo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const tagGrado = plan.grado.toLowerCase();
    const tagMateria = plan.materia.toLowerCase();
    const timestamp = new Date().toISOString();

    const content = `---
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
- Tag: #${tagCampo} | #${tagMateria} | #${tagGrado}
`;

    fs.writeFileSync(filePath, content, 'utf8');
    generatedList.push(filePath);
  }

  console.log(`✅ ${generatedList.length} planeaciones especializadas generadas exitosamente.`);
}

generateFullArchitecture();
