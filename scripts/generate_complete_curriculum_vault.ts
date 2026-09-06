import fs from 'fs';
import path from 'path';

const VAULT_BASE = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool\\planeaciones\\Secundaria';

interface NodeDef {
  campo: string;
  materia: string;
  materiaNombre: string;
  grado: string;
  gradoDisplay: string;
  temaNum: number;
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

const curriculumData: NodeDef[] = [
  // -------------------------------------------------------------------------
  // 🗣️ 1. CAMPO FORMATIVO: LENGUAJES
  // -------------------------------------------------------------------------
  // ESPAÑOL (6 Temas)
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    materiaNombre: 'Español',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'La diversidad de lenguas y su uso en la comunicación familiar, escolar y comunitaria',
    tituloProyecto: 'Mosaico Lingüístico: Palabras y Raíces de Nuestra Comunidad',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Reconoce la riqueza lingüística de México y el mundo a partir de obras literarias y testimonios orales, identificando variantes lingüísticas en la familia, escuela y comunidad para promover actitudes de respeto e inclusión.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué en distintas regiones de México usamos palabras diferentes para un mismo objeto?',
      '¿Cuántas lenguas originarias se hablan en nuestro país y qué nos enseñan sobre la naturaleza?',
      '¿Qué acciones podemos tomar para evitar la discriminación lingüística en la escuela?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Audición de variantes dialectales y fragmentos en lenguas indígenas.\n2. Pregunta detonadora: "¿Por qué ninguna forma de hablar es superior a otra?".\n3. Lluvia de ideas: banco de palabras de origen náhuatl, maya y zapoteco en el español cotidiano.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Lectura en parejas de textos literarios bilingües.\n2. Clasificación de variantes dialectales, sociales y generacionales en un cuadro comparativo.\n3. Diseño de un guion de 5 preguntas para entrevista familiar sobre expresiones y modismos heredados.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de socialización de hallazgos.\n2. Metacognición en libreta: "¿Qué aprendí hoy sobre el valor de las lenguas maternas?".\n3. Entrega de evidencia: Guion de entrevista comunitaria estructurado.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Reconocimiento de variantes (Sobresaliente: 3 pts | Satisfactorio: 2 pts | En Proceso: 1 pt).\n• Criterio 2: Diseño de instrumentos de indagación comunitaria (Sobresaliente: 3 pts | Satisfactorio: 2 pts | En Proceso: 1 pt).\n• Criterio 3: Actitud intercultural y respeto a la diversidad (Sobresaliente: 4 pts | Satisfactorio: 2.5 pts | En Proceso: 1 pt).',
    materiales: 'Bocina, textos bilingües, pliegos de papel bond, plumones de colores.',
    evidenciaEntregable: 'Guion de entrevista comunitaria y cuadro comparativo de variantes lingüísticas regionales.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    materiaNombre: 'Español',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'La diversidad étnica, cultural y lingüística de México a favor de una sociedad intercultural',
    tituloProyecto: 'Voces y Raíces: Crónicas Interculturales de México',
    ejes: ['Interculturalidad Crítica', 'Pensamiento Crítico'],
    pda: 'Fase 6 (2º Secundaria) - Compara y valora textos sobre las tensiones y aportaciones de la diversidad étnica y cultural de México, expresando juicios fundamentados en un texto argumentativo que promueva la convivencia intercultural armónica.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia fundamental entre asimilación cultural e interculturalidad simétrica?',
      '¿Qué aportaciones fundamentales han brindado los pueblos indígenas y afromexicanos a la identidad nacional?',
      '¿Cómo podemos erradicar los estereotipos racistas presentes en el lenguaje cotidiano?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección del mapa etnolingüístico interactivo del INALI.\n2. Pregunta detonadora sobre los derechos constitucionales pluriculturales.\n3. Recuperación de saberes: debate breve sobre casos de discriminación en medios.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis comparativo de dos artículos de opinión sobre derechos culturales.\n2. Taller de argumentación: identificación de premisas, tesis y contraargumentos.\n3. Redacción del borrador de un ensayo breve con propuestas de convivencia escolar.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Coevaluación en parejas con rúbrica de coherencia.\n2. Metacognición: "¿Qué postura crítica asumo frente a la discriminación?".\n3. Entrega de evidencia: Esquema de ensayo argumentativo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Argumentación intercultural fundamentada.\n• Criterio 2: Cohesión textual y estructura ensayística.\n• Criterio 3: Propuestas de acción comunitaria viables.',
    materiales: 'Mapa etnolingüístico, lecturas críticas impresas, rúbricas de coevaluación.',
    evidenciaEntregable: 'Ensayo argumentativo breve "Construyendo Puentes Interculturales".'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    materiaNombre: 'Español',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Textos literarios escritos en español o traducidos (creaciones tradicionales y contemporáneas)',
    tituloProyecto: 'Antología Comentada: El Viaje del Héroe en la Literatura Universal y Mexicana',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (3º Secundaria) - Crea textos narrativos, poéticos o dramáticos a partir del análisis de figuras retóricas, recursos estilísticos y estructuras narrativas de textos literarios universales y mexicanos, expresando una postura estética y personal.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué las historias clásicas siguen resonando en nuestras emociones contemporáneas?',
      '¿Qué recursos estilísticos transforman un relato ordinario en una obra artística?',
      '¿Cómo reinterpretamos un mito tradicional en el contexto de nuestra ciudad actual?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Lectura dramatizada de fragmentos de Juan Rulfo y Gabriel García Márquez.\n2. Pregunta detonadora sobre la atmósfera y el tono literario.\n3. Identificación de figuras retóricas (metáfora, hipérbole, prosopopeya).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de creación literaria: selección de arquetipos y conflicto dramático.\n2. Elaboración del esquema narrativo de 4 actos.\n3. Redacción del primer borrador individual con integración de recursos estilísticos.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Lectura en atril de fragmentos destacados.\n2. Retroalimentación formativa inmediata (2 estrellas y 1 deseo).\n3. Entrega de evidencia: Borrador del cuento literario.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Originalidad y voz narrativa.\n• Criterio 2: Uso deliberado de figuras retóricas.\n• Criterio 3: Coherencia y estructura narrativa.',
    materiales: 'Antología literaria comentada, hojas de diseño narrativo.',
    evidenciaEntregable: 'Cuento literario original ilustrado con cédula de figuras retóricas.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    materiaNombre: 'Español',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Los géneros periodísticos y sus recursos para comunicar sucesos significativos',
    tituloProyecto: 'Periodistas de la Comunidad: Crónica y Reportaje Escolar',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Investiga un hecho significativo comunitario o nacional mediante la consulta de fuentes diversas, y redacta noticias, crónicas o reportajes utilizando recursos periodísticos objetivos y verificables.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo distinguimos un hecho verificable de una manipulación mediática o noticia falsa?',
      '¿De qué manera las 6 preguntas periodísticas estructuran una nota con rigor ético?',
      '¿Por qué el periodismo comunitario fortalece la vida democrática?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Análisis comparativo de encabezados periodísticos sobre un suceso reciente.\n2. Pregunta detonadora sobre la objetividad y las fuentes informativas.\n3. Identificación de la pirámide invertida.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Elección en equipos de un hecho comunitario de alto impacto escolar.\n2. Redacción de la nota informativa aplicando encabezado, lead y cuerpo con citas de testigos.\n3. Cotejo de datos duros con fuentes oficiales locales.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Ronda de coedición periodística entre mesas de trabajo.\n2. Metacognición sobre la ética de informar con veracidad.\n3. Entrega de evidencia: Nota periodística redactada.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Estructura periodística y pirámide invertida.\n• Criterio 2: Verificación de fuentes y testimonios.\n• Criterio 3: Redacción objetiva y ortografía.',
    materiales: 'Periódicos físicos y digitales, plantillas de diagramación.',
    evidenciaEntregable: 'Gaceta escolar con notas y crónicas comunitarias.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    materiaNombre: 'Español',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 5,
    temaTitulo: 'Comunicación asertiva y dialógica para erradicar expresiones de violencia',
    tituloProyecto: 'Diálogos de Paz: El Poder Transformador de la Comunicación Asertiva',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Igualdad de Género'],
    pda: 'Fase 6 (1º Secundaria) - Realiza juegos de rol y diálogos reflexivos sobre situaciones de conflicto escolar o familiar, aplicando estrategias de comunicación asertiva, escucha activa y empatía para prevenir y erradicar la violencia verbal y física.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo influye la forma en que decimos las cosas para calmar o escalar una discusión?',
      '¿Qué es la técnica del Mensaje Yo y cómo nos permite poner límites sin agredir?',
      '¿Cómo podemos crear acuerdos de convivencia pacífica en nuestro salón de clases?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dramatización de un conflicto escolar cotidiano.\n2. Pregunta detonadora sobre las reacciones agresivas vs pasivas vs asertivas.\n3. Explicación de la fórmula del Mensaje Yo.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de reescritura: transformar 5 frases hirientes en declaraciones asertivas.\n2. Dinámica de mediación en tríadas con roles asignados.\n3. Construcción del Decálogo del Aula Dialógica.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Firma simbólica del Decálogo de Paz por todos los alumnos.\n2. Metacognición sobre el autocontrol emocional.\n3. Entrega de evidencia: Registro de casos asertivos.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Estructura del Mensaje Asertivo.\n• Criterio 2: Empatía y escucha activa en mediación.\n• Criterio 3: Compromiso con acuerdos de no violencia.',
    materiales: 'Tarjetas de casos de conflicto, cartulinas, marcadores.',
    evidenciaEntregable: 'Decálogo de Convivencia Dialógica y Cuaderno de Mediación Asertiva.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Espanol',
    materiaNombre: 'Español',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 6,
    temaTitulo: 'Textos de divulgación científica y mensajes para promover una vida saludable',
    tituloProyecto: 'Ciencia Accesible: Revista Juvenil de Salud y Bienestar Comunitario',
    ejes: ['Vida Saludable', 'Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (3º Secundaria) - Elabora una propuesta de divulgación científica sobre temas de salud, medio ambiente o nutrición, transformando textos académicos especializados en un lenguaje accesible, riguroso y atractivo para la comunidad escolar.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué la divulgación científica es un puente vital entre los laboratorios y la vida cotidiana?',
      '¿Qué analogías e infografías permiten explicar conceptos de biología y medicina sin perder rigor?',
      '¿Cómo combate la ciencia los mitos alimentarios y la desinformación en redes sociales?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Lectura comparativa de un paper médico vs un artículo de divulgación de la UNAM.\n2. Pregunta detonadora sobre los recursos visuales y el lenguaje divulgativo.\n3. Selección del problema de salud a divulgar.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Extracción de datos de fuentes científicas oficiales (OMS, SSA).\n2. Redacción del artículo con analogías didácticas y glosario de términos.\n3. Diseño de la infografía explicativa de apoyo.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Revisión cruzada de rigor conceptual entre pares.\n2. Metacognición sobre la responsabilidad social de comunicar ciencia.\n3. Entrega de evidencia: Borrador diagramado del artículo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Precisión científica y traducción a lenguaje claro.\n• Criterio 2: Calidad y pertinencia de la infografía de apoyo.\n• Criterio 3: Utilidad práctica para promover estilos de vida saludables.',
    materiales: 'Revistas de divulgación científica, hojas de diagramación, fuentes oficiales de salud.',
    evidenciaEntregable: 'Artículo de divulgación ilustrado para la revista escolar "Ciencia al Día".'
  },

  // INGLÉS (5 Temas)
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    materiaNombre: 'Inglés',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'La diversidad lingüística y sus formas de expresión en México y el mundo',
    tituloProyecto: 'Global Voices: English as a Cultural Bridge',
    ejes: ['Interculturalidad Crítica', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Hace uso del alfabeto, los números y las expresiones básicas en inglés para recuperar información sobre la diversidad lingüística y cultural en países anglófonos y no anglófonos, presentándola mediante fichas informativas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'Why is English considered the primary lingua franca in the modern world?',
      'How do cultural traditions vary across English-speaking countries?',
      'How can we use English to showcase Mexico’s traditions to the world?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Warm-up audio listening to global English accents.\n2. Driving question on linguistic diversity.\n3. Brainstorming vocabulary: nationalities, languages, traditional greetings.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Reading comprehension of short profiles of 4 diverse English-speaking nations.\n2. Grammar focus on Simple Present and subject-verb agreement.\n3. Designing bilingual profile cards with flags, languages and customs.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Gallery walk and peer Q&A in English.\n2. Metacognition exit ticket.\n3. Submission: Cultural profile fact sheet.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1: Grammatical accuracy in simple present.\n• Criterion 2: Quality of cultural content.\n• Criterion 3: Oral confidence in greetings.',
    materiales: 'World map, cardstock, colored markers, bilingual dictionaries.',
    evidenciaEntregable: 'Bilingual Cultural Fact Sheet in English with flags and customs.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    materiaNombre: 'Inglés',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'La identidad y cultura de pueblos de habla inglesa',
    tituloProyecto: 'Traditions and Identities in the Anglophone World',
    ejes: ['Interculturalidad Crítica', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Compara aspectos culturales, costumbres y expresiones identitarias de comunidades de habla inglesa con las de su entorno local, empleando estructuras en tiempo pasado y comparativos en inglés.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'How are Halloween or Thanksgiving culturally connected to harvest and ancestral memory?',
      'What elements of English-language music have influenced Mexican youth culture?',
      'Why is intercultural appreciation essential for global citizenship?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Visual comparison: Día de Muertos vs Celtic Samhain.\n2. Driving question on shared ancestral roots.\n3. Vocabulary bank: festivals, traditions, historical origins.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Reading text on traditions in the UK, USA, Ireland and Canada.\n2. Practice on comparative adjectives (*more traditional than, as colorful as*) and Past Simple.\n3. Creating a comparative Venn Diagram poster in teams.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. 2-minute oral presentation per team in English.\n2. Self-evaluation on pronunciation.\n3. Submission: Comparative poster.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1: Comparative structure mastery.\n• Criterion 2: Cultural depth and respect.\n• Criterion 3: Collaborative teamwork.',
    materiales: 'Comparative reading worksheets, poster paper, markers.',
    evidenciaEntregable: 'Comparative Cultural Venn Diagram Poster in English.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    materiaNombre: 'Inglés',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 3,
    temaTitulo: 'El uso del inglés para expresar necesidades, intereses y problemas de la comunidad',
    tituloProyecto: 'Community Action: Proposing Local Solutions in English',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (3º Secundaria) - Elabora y presenta propuestas en inglés para solucionar problemas comunitarios (manejo de residuos, cuidado del agua o espacios públicos), utilizando verbos modales (should, must, can) y conectores de causa y efecto.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'What are the most urgent environmental challenges in our local community?',
      'How can modal verbs (should, must, have to) strengthen our proposals in English?',
      'How can a bilingual flyer help raise awareness among tourists and neighbors?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Problem tree diagram on board for local community needs.\n2. Driving question on civic advocacy in English.\n3. Activation of modal verbs and cause-effect connectors.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Team selection of one community challenge.\n2. Drafting 5 structured proposals using modals (*We should clean..., The government must provide...*).\n3. Designing an impactful bilingual public infographic flyer.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. 1-minute elevator pitch per team in English.\n2. Constructive peer feedback.\n3. Submission: Action flyer and formal proposal draft.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1: Accurate use of modal verbs and connectors.\n• Criterion 2: Feasibility and impact of the civic proposal.\n• Criterion 3: Visual clarity of the campaign flyer.',
    materiales: 'Proposal templates, flyer paper, colored markers.',
    evidenciaEntregable: 'Community Action Bilingual Flyer and Proposal Letter in English.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    materiaNombre: 'Inglés',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Relatos en inglés para expresar sucesos significativos',
    tituloProyecto: 'Storytellers: Memoirs and Personal Narratives in English',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (2º Secundaria) - Narra sucesos significativos personales, familiares o escolares en inglés empleando conectores temporales (first, then, after that, finally) y tiempos verbales en pasado simple y continuo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'What is an unforgettable story or funny anecdote from your school years?',
      'How do narrative time connectors help readers follow a story in English?',
      'How do past simple and continuous combine to describe simultaneous past actions?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Teacher\'s storytelling hook.\n2. Driving question on narrative pacing in English.\n3. Time connector chart on board.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Storyboarding a 4-panel narrative comic in pairs.\n2. Writing past tense captions (*While we were studying, suddenly...*).\n3. Peer editing of irregular verbs.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Storytelling circle reading selected panels.\n2. Metacognition on irregular past verb usage.\n3. Submission: Narrative comic strip.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1: Past tense and narrative sequencing accuracy.\n• Criterion 2: Visual and written harmony.\n• Criterion 3: Expressive storytelling.',
    materiales: 'Comic strip templates, verb charts, colored pencils.',
    evidenciaEntregable: 'Illustrated 4-Panel Narrative Comic Strip in English.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Ingles',
    materiaNombre: 'Inglés',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 5,
    temaTitulo: 'Mensajes en inglés en medios de comunicación masiva que promueven una vida saludable',
    tituloProyecto: 'Healthy Habits: Public Service Announcements in English',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 6 (3º Secundaria) - Analiza y crea mensajes publicitarios y campañas de servicio público en inglés dirigidas a jóvenes sobre hábitos de vida saludable (alimentación balanceada, deporte y bienestar mental), aplicando lenguaje persuasivo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'How do mass media ads use slogans and color psychology to persuade teenagers?',
      'How can we create positive health campaigns using imperative verbs and memorable slogans in English?',
      'What healthy habits are most critical for secondary students today?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Analysis of global public service health ads (WHO).\n2. Driving question on persuasive slogan design.\n3. Imperative verb grammar practice (*Eat well, Move daily, Protect your sleep*).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Team concept design for a health campaign.\n2. Scriptwriting for a 30-second audio/video PSA in English.\n3. Creating the visual campaign poster with catchy slogans.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Live PSA performance by student teams.\n2. Peer evaluation on voice clarity and persuasive impact.\n3. Submission: PSA script and poster.',
    evaluacion: '📋 FORMATIVE RUBRIC (3 Criteria):\n• Criterion 1: Persuasive language and imperative grammar.\n• Criterion 2: Health message depth and scientific relevance.\n• Criterion 3: Visual and oral presentation quality.',
    materiales: 'Sample PSA ads, poster paper, colored markers.',
    evidenciaEntregable: 'Public Service Announcement (PSA) Script and Campaign Poster in English.'
  },

  // ARTES (4 Temas)
  {
    campo: 'Lenguajes',
    materia: 'Artes',
    materiaNombre: 'Artes',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Diversidad de lenguajes artísticos en la riqueza pluricultural de México y del mundo',
    tituloProyecto: 'Caleidoscopio de las Artes: Explorando Lenguajes Visuales y Sonoros',
    ejes: ['Artes y Experiencias Estéticas', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Experimenta con los elementos básicos de las artes visuales, la música, la danza y el teatro para expresar emociones e ideas sobre la diversidad pluricultural de México y el mundo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿De qué manera el color, el ritmo y el movimiento corporal comunican ideas sin necesidad de palabras?',
      '¿Qué lenguajes artísticos tradicionales (alebrijes, danzas folclóricas, son jarocho) identifican a nuestro país?',
      '¿Cómo podemos fusionar dos disciplinas artísticas en una sola creación colectiva?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Estímulo multisensorial: imagen de arte huichol y fragmento musical de mariachi tradicional.\n2. Pregunta detonadora sobre los lenguajes no verbales.\n3. Registro en pizarra de elementos plásticos, sonoros y corporales.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de exploración interdisciplinaria en equipos de 4.\n2. Creación plástica o coreográfica inspirada en una leyenda tradicional mexicana.\n3. Redacción de la ficha artística conceptual.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Presentación tipo galería en el salón.\n2. Crítica formativa respetuosa entre pares.\n3. Entrega de evidencia: Boceto plástico con justificación.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Exploración y dominio de elementos artísticos.\n• Criterio 2: Expresión de la identidad pluricultural.\n• Criterio 3: Trabajo colaborativo y sensibilidad estética.',
    materiales: 'Pinturas acrílicas, cartulinas, telas, reproductor de audio, pinceles.',
    evidenciaEntregable: 'Composición artística interdisciplinaria con cédula conceptual explicativa.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Artes',
    materiaNombre: 'Artes',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Patrimonio cultural de la comunidad en manifestaciones artísticas',
    tituloProyecto: 'Cartografía del Patrimonio Vivo: Mural Comunitario y Memoria Sensorial',
    ejes: ['Artes y Experiencias Estéticas', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Emplea elementos de las artes visuales y escénicas (color, textura, forma, movimiento y sonido) para reinterpretar y valorar el patrimonio cultural tangible e intangible de su comunidad en una producción artística colectiva.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué monumentos, tradiciones, recetas u oficios forman el patrimonio vivo de nuestro barrio?',
      '¿Cómo podemos usar la técnica del muralismo para narrar la historia de nuestra colonia?',
      '¿Por qué el arte en espacios públicos democratiza la cultura?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de murales comunitarios mexicanos de Rivera, Orozco y colectivos urbanos.\n2. Pregunta detonadora sobre los símbolos de nuestra localidad.\n3. Registro de bienes culturales tangibles e intangibles.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Bocetaje colectivo del mural en pliegos de papel kraft en equipos de 4.\n2. Aplicación de técnicas mixtas (texturas, acrílicos, collage fotográfico).\n3. Redacción de la cédula curatorial formal.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Montaje de paneles tipo museo escolar.\n2. Crítica estética entre pares.\n3. Entrega de evidencia: Panel mural bocetado con cédula.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Simbolismo y rescate patrimonial.\n• Criterio 2: Manejo plástico de texturas y armonía cromática.\n• Criterio 3: Fundamentación curatorial.',
    materiales: 'Papel kraft, pinturas acrílicas, pinceles, esponjas, recortes, pegamento.',
    evidenciaEntregable: 'Panel mural comunitario en técnica mixta con cédula artística curatorial.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Artes',
    materiaNombre: 'Artes',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Elementos de las artes y recursos estéticos apreciados en el entorno natural y social',
    tituloProyecto: 'Geometrías y Sonidos de la Naturaleza: Arte Ambiental y Land Art',
    ejes: ['Artes y Experiencias Estéticas', 'Pensamiento Crítico'],
    pda: 'Fase 6 (3º Secundaria) - Diseña propuestas artísticas interdisciplinarias utilizando recursos estéticos del entorno natural y social (formas orgánicas, texturas naturales, patrones fractales y paisajes sonoros), reflexionando sobre el impacto ambiental.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo encontramos armonía estética, proporciones áureas y fractales en las hojas, conchas y árboles?',
      '¿Qué es la corriente artística Land Art y cómo dialoga con la ecología sin contaminar?',
      '¿Cómo podemos registrar los paisajes sonoros de nuestra escuela para una pieza artística?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de obras de Land Art (Andy Goldsworthy) y paisajes sonoros ecológicos.\n2. Pregunta detonadora sobre la belleza de los materiales efímeros naturales.\n3. Reconocimiento de texturas y formas orgánicas en el patio escolar.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Recolección de materiales orgánicos caídos (hojas secas, piedras, ramas, semillas).\n2. Construcción de una escultura efímera o ensamble visual en el patio.\n3. Registro fotográfico profesional y elaboración de la memoria conceptual del proyecto.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Recorrido colectivo por las intervenciones de Land Art.\n2. Metacognición sobre el arte sustentable.\n3. Entrega de evidencia: Fotografía artística con ficha técnica.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Uso creativo de recursos naturales y composición estética.\n• Criterio 2: Reflexión ecológica y sustentabilidad.\n• Criterio 3: Calidad del registro visual y memoria conceptual.',
    materiales: 'Elementos naturales recolectados, cámara/celular para registro, cartulinas de montaje.',
    evidenciaEntregable: 'Fotografía artística de intervención Land Art con memoria conceptual de sustentabilidad.'
  },
  {
    campo: 'Lenguajes',
    materia: 'Artes',
    materiaNombre: 'Artes',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Valor estético de la naturaleza, de la vida cotidiana y de diferentes manifestaciones',
    tituloProyecto: 'La Estética de lo Cotidiano: Diario Visual y Fotografía Documental',
    ejes: ['Artes y Experiencias Estéticas', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Aprecia y expresa el valor estético de situaciones, objetos y paisajes de la vida cotidiana mediante técnicas de dibujo, pintura o fotografía, argumentando las emociones e ideas que provocan.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Puede un objeto cotidiano y simple (una silla de madera, una taza con café, un rayo de sol sobre una pared) ser una obra de arte?',
      '¿Cómo influye la luz, la sombra y el encuadre fotográfico para transmitir melancolía, alegría o sorpresa?',
      '¿Cómo entrenamos la mirada estética para encontrar belleza en lo ordinario?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de naturalezas muertas clásicas (Cézanne) y fotografía documental contemporánea.\n2. Pregunta detonadora: "¿Qué hace que una imagen cotidiana capture nuestra atención?".\n3. Principios de composición visual (regla de tercios, encuadre, contraste de luz).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Safari fotográfico / dibujo de observación en el aula y pasillos escolares.\n2. Selección de un objeto o rincón cotidiano y realización de 3 bocetos con distintos ángulos y contrastes de luz.\n3. Redacción de un microrrelato poético que acompañe a la imagen seleccionada.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Exposición en cordel de las obras visuales cotidianas.\n2. Metacognición sobre la sensibilidad estética.\n3. Entrega de evidencia: Diario visual con dibujo/fotografía y texto poético.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Aplicación de encuadre, luz y composición visual.\n• Criterio 2: Sensibilidad estética y expresividad emocional.\n• Criterio 3: Integración armónica entre imagen y microrrelato.',
    materiales: 'Papel marquilla, lápices de grafito graduados (2B, 4B, 6B), difuminos, cámara/celular.',
    evidenciaEntregable: 'Lámina de Diario Visual "La Belleza Oculta de lo Cotidiano" con texto poético.'
  }
];

export function runFullCurriculumBuild() {
  console.log(`🚀 Iniciando generación completa de los nodos curriculares de Secundaria en Obsidian...`);

  let count = 0;
  for (const node of curriculumData) {
    const targetDir = path.join(VAULT_BASE, node.grado, node.materia);
    fs.mkdirSync(targetDir, { recursive: true });

    const safeTitle = node.tituloProyecto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const fileName = `Planeacion_${safeTitle}.md`;
    const filePath = path.join(targetDir, fileName);

    const tagCampo = node.campo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const tagGrado = node.grado.toLowerCase();
    const tagMateria = node.materia.toLowerCase();
    const timestamp = new Date().toISOString();

    const markdown = `---
tags: [iskool, planeacion_nem, segundo_cerebro, campo_${tagCampo}, grado_${tagGrado}, materia_${tagMateria}, fase6_secundaria]
campo_formativo: "${node.campo}"
materia: "${node.materiaNombre}"
grado: "${node.gradoDisplay}"
nivel: "Secundaria (Fase 6)"
tema: "${node.temaTitulo}"
docente: "Prof. Israel López Ángeles"
fecha_creacion: "${timestamp}"
---

# ${node.tituloProyecto}

> [!INFO] **Ficha Técnica NEM 2022**
> - **Docente Titular:** Prof. Israel López Ángeles
> - **Nivel / Fase:** ${node.gradoDisplay} • Fase 6
> - **Campo Formativo:** ${node.campo}
> - **Asignatura:** ${node.materiaNombre}
> - **Duración Estimada:** ${node.duracion}
> - **Ejes Articuladores:** ${node.ejes.join(' • ')}

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA)

> **${node.pda}**

---

## ❓ II. Preguntas Detonadoras para el Salón (Apertura y Conflicto Cognitivo)

${node.preguntasDetonadoras.map((preg, idx) => `${idx + 1}. **${preg}**`).join('\n\n')}

---

## ⏱️ III. Secuencia Didáctica (Dosificación en Bloques de 50 minutos)

### 📌 Inicio (10 minutos)
${node.inicio}

### 🔬 Desarrollo (30 minutos)
${node.desarrollo}

### 💡 Cierre (10 minutos)
${node.cierre}

---

## 📋 IV. Evaluación Formativa y Rúbrica Analítica

${node.evaluacion}

---

## 📦 V. Materiales, Recursos y Evidencias Entregables

### Materiales y Recursos Didácticos
${node.materiales}

### Evidencia Entregable de la Clase (Producto Tangible)
> 📄 **${node.evidenciaEntregable}**

---

## 🔗 Nodos Relacionados y Conexiones en el Segundo Cerebro
- [[00_Indice_Maestro_Secundaria_NEM|Índice Maestro de Secundaria]]
- Tag: #${tagCampo} | #${tagMateria} | #${tagGrado}
`;

    fs.writeFileSync(filePath, markdown, 'utf8');
    count++;
  }

  console.log(`✨ Se han estructurado y escrito ${count} nodos curriculares en la bóveda de Obsidian.`);
}

runFullCurriculumBuild();
