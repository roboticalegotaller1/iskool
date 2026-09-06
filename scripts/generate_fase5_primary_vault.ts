import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const FASE5_VAULT_BASE = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones', 'Primaria_Fase_5');

export interface PlanningDefinition {
  id: string;
  campo: string;
  campoTag: string;
  materia: string;
  materiaFolder: string;
  grado: string; // '5to_Grado' | '6to_Grado'
  gradoDisplay: string; // '5º de Primaria' | '6º de Primaria'
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

export const fase5Curriculum: PlanningDefinition[] = [
  // =========================================================================
  // 🗣️ ÁREA 1: LENGUAJES - COMUNICACIÓN ESCRITA, EXPLICATIVOS Y DEBATES (6)
  // =========================================================================
  {
    id: 'fase5-len-1',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 1,
    temaTitulo: 'Narración de sucesos autobiográficos',
    tituloProyecto: 'El Libro de Mi Vida: Crónicas, Emociones y Memorias de la Infancia',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Inclusión'],
    pda: 'Fase 5 (5º Primaria) - Lee textos autobiográficos y reflexiona sobre las razones por las que suelen estar narrados en primera persona del singular. Determina los sucesos autobiográficos que desea narrar y los organiza lógicamente, resaltando los aspectos más significativos. Escribe la narración de los hechos autobiográficos, haciendo uso de comas, puntos y seguido, puntos y aparte y dos puntos, para dar claridad y orden a las ideas. Describe personas, lugares y hechos a través del uso de reiteraciones, frases adjetivas, símiles e imágenes, y mantiene la referencia a los mismos en toda la narración por medio de pronombres y sinónimos.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué al escribir sobre nuestros propios recuerdos usamos verbos en primera persona del singular (yo viví, yo sentí, yo aprendí)?',
      '¿Cuál es el recuerdo más significativo de tu infancia que te ayudó a ser la persona que eres hoy?',
      '¿Cómo ayudan los puntos, comas y dos puntos a que un lector sienta la emoción de nuestra historia sin perder el hilo de las ideas?',
      '¿Qué adjetivos y comparaciones poéticas (símiles) podemos usar para describir a un ser querido de forma inolvidable?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dinámica de la "Caja de los Recuerdos": El docente muestra 3 objetos personales de su infancia (un boleto antiguo, una fotografía gastada y un juguete pequeño) y comparte una anécdota breve de 2 minutos destacando la emoción que le produce.
2. Pregunta detonadora: "¿Si tuvieran que elegir un solo momento de sus vidas para contárselo a alguien que no los conoce, cuál sería y por qué?".
3. Activación de saberes previos: Identificación de la voz narrativa en primera persona ("Yo") vs tercera persona ("Él/Ella") en dos textos cortos proyectados en el pizarrón.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Cronología Personal en Equipos de Pares:
   • Los alumnos dibujan en su cuaderno su "Línea del Tiempo Emocional" seleccionando 4 acontecimientos clave (ej. mi primer día de escuela, un viaje familiar, cuando superé un miedo, una fiesta comunitaria).
2. Taller de Redacción con Recursos Estilísticos y Puntuación:
   • Redactan el primer borrador del capítulo 1 de su autobiografía aplicando:
     - Signos de puntuación normativos: coma enumerativa, punto y seguido para separar ideas, punto y aparte para cambiar de momento.
     - Frases adjetivas y símiles: "Sus ojos brillaban como luceros de bengala", "Aquella tarde calurosa y silenciosa como un desierto".
     - Uso de pronombres y sinónimos para evitar repetir palabras como "mi mamá", "luego", "después".
3. Rondas de Colectivo Literario: Lectura en parejas para revisar fluidez y ortografía con la técnica "2 halagos y 1 sugerencia de puntuación".`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: 3 alumnos voluntarios leen un párrafo emotivo de su borrador al grupo desde el atril del aula.
2. Reflexión metacognitiva en bitácora: "¿Qué descubrí sobre mí mismo al poner en palabras un recuerdo del pasado?".
3. Entrega de evidencia: Línea del tiempo estructurada y primer borrador corregido con rúbrica de autorrevisión.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Voz Narrativa y Estructura Autobiográfica (Sobresaliente [3.5 pts]: Narra en primera persona con coherencia temporal y selección profunda de hechos significativos | Satisfactorio [2.5 pts]: Narra en primera persona con saltos temporales menores | En Proceso [1.5 pts]: Mezcla voces narrativas o relata hechos aislados sin hilo conductor).
• Criterio 2 - Uso de Signos de Puntuación y Recursos Estilísticos (Sobresaliente [3.5 pts]: Aplica correctamente comas, puntos y dos puntos, e integra símiles y frases adjetivas ricas | Satisfactorio [2.5 pts]: Aplica puntos y comas básicos con pocos adjetivos | En Proceso [1.5 pts]: Omite puntuación básica dificultando la lectura).
• Criterio 3 - Coevaluación y Sentido Comunitario (Sobresaliente [3 pts]: Brinda y recibe retroalimentación constructiva con respeto y empatía | Satisfactorio [2 pts]: Participa en la coevaluación de manera básica | En Proceso [1 pt]: Dificultad para recibir sugerencias de mejora).
• Instrumento: Rúbrica formativa analítica y lista de cotejo de borradores literarios.`,
    materiales: `• Cuaderno de trabajo y hojas opalina para el libro final.
• Fotografías o dibujos representativos de su historia personal.
• Guía de conectores temporales (al principio, mientras tanto, finalmente, por consiguiente).
• Marcadores de colores y notas adhesivas para coevaluación.`,
    evidenciaEntregable: `Capítulo 1 ilustrado de la autobiografía personal "El Libro de Mi Vida", con uso explícito de primera persona, puntuación adecuada y frases adjetivas.`
  },
  {
    id: 'fase5-len-2',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 2,
    temaTitulo: 'Comprensión y producción de textos explicativos',
    tituloProyecto: 'Pequeños Divulgadores Científicos: ¿Por Qué Ocurren los Fenómenos de la Naturaleza?',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 5 (5º Primaria) - Lee distintos tipos de textos explicativos y reflexiona sobre sus características y funciones. Expone las diferencias entre una descripción y una explicación, y entre un texto descriptivo y uno explicativo. Recupera información de distintas fuentes, como artículos de divulgación, libros de texto, reportes de investigación, para producir un texto explicativo sobre temas diversos y con propósitos particulares. Establece relaciones causales y emplea expresiones como en consecuencia, por lo tanto, debido a, a causa de, porque, por consiguiente. Distingue sus propias palabras de la paráfrasis y citas textuales, y registra la información bibliográfica de las fuentes consultadas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia entre "describir" cómo se ve un volcán y "explicar" las causas físicas y geológicas de su erupción?',
      '¿Por qué los textos explicativos usan conectores de causa y efecto como "debido a", "en consecuencia" y "por lo tanto"?',
      '¿Cómo podemos explicar un fenómeno complejo con nuestras propias palabras (paráfrasis) sin copiar textualmente de internet?',
      '¿Qué datos indispensables debemos anotar de un libro o artículo científico para citarlo correctamente?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Desafío Cognitivo "¿Descripción o Explicación?": El docente lee dos textos cortos:
   - Texto A: "El arcoíris tiene 7 franjas de colores: rojo, naranja, amarillo, verde, azul, añil y violeta en forma semicircular".
   - Texto B: "El arcoíris se forma debido a que la luz solar se refracta y descompone al atravesar las gotas de lluvia suspendidas en la atmósfera; en consecuencia, cada longitud de onda viaja en diferente ángulo".
2. Pregunta detonadora: "¿Cuál de los dos textos nos ayuda a ENTENDER el porqué de las cosas y cuál solo nos dice CÓMO se ve?".
3. Registro en el pizarrón de las características clave del texto explicativo (causa-efecto, lenguaje claro, esquemas).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Investigación y Paráfrasis en Tríos:
   • Cada equipo elige un enigma natural (¿Por qué tiembla en México?, ¿Por qué las hojas cambian de color en otoño?, ¿Por qué el agua hierve a 100 °C?).
   • Consultan un artículo de divulgación científica infantil y aplican la técnica del "Semáforo de Lectura":
     - Verde: Ideas principales comprendidas.
     - Amarillo: Palabras técnicas que requieren diccionario.
     - Rojo: Datos que deben citarse textualmente entre comillas.
2. Redacción del Artículo de Divulgación:
   • Estructuran el texto en 3 partes: Introducción al fenómeno, Explicación causal con conectores (por consiguiente, a causa de), y Conclusión con esquema gráfico explicativo.
   • Registro de la fuente bibliográfica en formato básico (Autor, Título, Editorial/Portal, Año).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Ronda de Micrófono Científico: Cada equipo expone en 60 segundos la relación causal descubierta utilizando al menos dos conectores lógicos.
2. Metacognición: "¿Por qué es una falta de honestidad académica copiar y pegar sin parafrasear ni citar la fuente?".
3. Entrega de evidencia: Esquema de investigación con paráfrasis y ficha bibliográfica.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Rigor Explicativo y Relaciones Causales (Sobresaliente [3.5 pts]: Articula con precisión las causas y consecuencias del fenómeno con conectores lógicos | Satisfactorio [2.5 pts]: Explica el fenómeno pero usa conectores causales limitados | En Proceso [1.5 pts]: Se limita a describir sin explicar causas).
• Criterio 2 - Paráfrasis y Registro de Fuentes (Sobresaliente [3.5 pts]: Diferencia sus palabras de citas textuales y registra autor, título y fecha | Satisfactorio [2.5 pts]: Parafrasea bien pero omite datos en la referencia | En Proceso [1.5 pts]: Copia textual sin comillas ni referencia).
• Criterio 3 - Claridad y Recursos Gráficos (Sobresaliente [3 pts]: Integra esquemas explicativos con rótulos claros y letra legible | Satisfactorio [2 pts]: Esquema sencillo | En Proceso [1 pt]: Sin apoyos visuales).
• Instrumento: Rúbrica analítica y lista de verificación de conectores causales.`,
    materiales: `• Artículos de divulgación científica para niños (Revistas ¿Cómo ves?, National Geographic Kids o libros de texto SEP).
• Tarjetas de conectores lógicos de causa-efecto.
• Pliegos de papel bond o cartulinas para infografía explicativa.`,
    evidenciaEntregable: `Artículo de divulgación científica breve ilustrado con esquema causal, conectores lógicos y ficha bibliográfica completa.`
  },
  {
    id: 'fase5-len-3',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 3,
    temaTitulo: 'Participación en debates sobre temas de interés común',
    tituloProyecto: 'El Ágora Escolar: Diálogo, Argumentación y Consensos en Debate Democrático',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Igualdad de Género'],
    pda: 'Fase 5 (5º Primaria) - Reconoce que hay temas donde las opiniones se dividen, y es necesario sustentar las propias. Conoce la función y organización de un debate. Investiga y toma notas de las ideas centrales y otros datos significativos con relación al tema del debate, con la intención de construir sus argumentos. Identifica la función de los nexos de subordinación en textos argumentativos. Hace su presentación, opina sobre lo que dicen otros y otras participantes y reconoce que es posible cambiar de opinión, a partir de las opiniones argumentadas de las demás personas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué decir "porque yo lo digo" o "porque no me gusta" NO es un argumento válido en una discusión seria?',
      '¿Cuál es la función del moderador, los polemistas y la audiencia en la estructura formal de un debate?',
      '¿Por qué cambiar de opinión ante un argumento respaldado por datos científicos es una muestra de madurez y no de debilidad?',
      '¿Cómo ayudan los nexos de subordinación (ya que, dado que, puesto que) a fundamentar nuestras posturas?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Simulación Rápida de Conflicto: Se plantea un dilema escolar: "¿Deberían eliminarse las tareas escolares en las tardes para que los niños tengan más tiempo de juego y deporte?".
2. Votación rápida a mano alzada y división espontánea del grupo en dos posturas.
3. Pregunta detonadora: "¿Cómo podemos defender nuestra postura sin gritar, respetando el turno de la palabra y convenciendo con evidencias?".`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Construcción de Argumentos vs Opiniones:
   • En equipos de 4, los alumnos analizan fichas informativas con datos estadísticos sobre el descanso, el aprendizaje y el rendimiento escolar.
   • Construyen 3 argumentos sólidos usando la fórmula: [Postura] + [Nexo de subordinación (porque / dado que)] + [Evidencia o dato de soporte].
2. Asignación de Roles y Reglas del Ágora:
   • Se eligen moderadores, cronometristas, equipos a favor, equipos en contra y jueces de audiencia reflexiva.
   • Ensayo de intervenciones de 1 minuto respetando el semáforo de tiempo.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Ronda de Conclusiones y Acuerdos de Consenso: Los moderadores sintetizan los puntos de encuentro entre ambas partes.
2. Bitácora de Metacognición: Responder: "¿Hubo algún argumento del equipo contrario que me hizo dudar de mi postura original? ¿Por qué?".
3. Entrega de evidencia: Ficha de preparación de argumentos con citas de datos y nexos subordinados.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Estructura y Solidez Argumentativa (Sobresaliente [3.5 pts]: Argumenta con base en datos verificados y usa nexos de subordinación de forma impecable | Satisfactorio [2.5 pts]: Argumenta con ideas claras pero pocos datos de respaldo | En Proceso [1.5 pts]: Expresa opiniones personales sin sustento lógico).
• Criterio 2 - Escucha Activa y Respeto a la Diversidad (Sobresaliente [3.5 pts]: Escucha atentamente, toma notas de los contrarios y debate con respeto absoluto | Satisfactorio [2.5 pts]: Respeta los turnos con leves interrupciones | En Proceso [1.5 pts]: Interrumpe o descalifica a sus compañeros).
• Criterio 3 - Capacidad de Consenso y Flexibilidad Cognitiva (Sobresaliente [3 pts]: Reconoce el valor de argumentos ajenos y propone acuerdos comunes | Satisfactorio [2 pts]: Acepta consensos básicos | En Proceso [1 pt]: Postura rígida e intransigente).
• Instrumento: Rúbrica de desempeño oral y lista de cotejo para moderación de debates.`,
    materiales: `• Fichas informativas con datos y estadísticas del tema elegido.
• Tarjetas de roles (Moderador, Portavoz, Cronometrista, Audiencia Crítica).
• Campanilla o cronómetro digital visible para control de tiempos.`,
    evidenciaEntregable: `Ficha Técnica de Argumentación y Matriz de Consensos del Debate Escolar.`
  },
  {
    id: 'fase5-len-4',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 4,
    temaTitulo: 'Seguimiento crítico de noticias en diferentes medios de comunicación escrita',
    tituloProyecto: 'Detectives de la Información: Análisis Crítico de Medios, Sesgos y Fake News',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Interculturalidad Crítica'],
    pda: 'Fase 5 (6º Primaria) - Consulta distintos medios de comunicación escrita y selecciona noticias de su interés, justificando las razones de su elección. Da seguimiento a las noticias de su interés en distintos medios de comunicación escrita e identifica las fuentes de las que proviene la información: testimonios, agencias de noticias, otros diarios y revistas. Identifica relaciones de contraste, complementariedad, causa-consecuencia y temporalidad entre las diferentes notas informativas sobre el mismo hecho noticioso. Reflexiona sobre las diferentes formas de expresar y abordar el mismo hecho noticioso en diferentes medios de comunicación escrita: extensión, manera de presentarlo, opiniones de las autoras y los autores, tipo de información que se revela. Escribe y comparte sus conclusiones sobre el hecho noticioso y sus reflexiones sobre las razones por las que pueden presentarse de diferente manera en cada medio de comunicación escrita.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué dos periódicos distintos pueden titular la misma noticia con enfoques completamente opuestos?',
      '¿Cómo identificamos si una noticia proviene de una agencia verificada, un testigo real o un rumor sin fundamento en redes sociales?',
      '¿Qué elementos gráficos (titulares alarmistas, imágenes recortadas, colores) usan los medios para influir en nuestras emociones?',
      '¿Qué responsabilidad ciudadana tenemos antes de compartir una noticia en la era digital?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Presentación del "Caso Periodístico": El docente proyecta las portadas de dos periódicos reales que cubrieron el mismo acontecimiento ambiental con titulares contrastantes:
   - Periódico A: "Histórica lluvia rompe récord y llena presas".
   - Periódico B: "Caos e inundaciones colapsan vialidades por tormenta".
2. Pregunta detonadora: "¿Ambos periódicos dicen la verdad? ¿Por qué cada uno destaca aspectos tan diferentes de un mismo suceso?".
3. Definición colectiva de conceptos clave: Fuente informativa, titular, sesgo periodístico y objetividad.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Auditoría Periodística en Equipos de 4:
   • Cada equipo recibe 3 notas informativas de medios locales, nacionales y digitales sobre un acontecimiento reciente.
   • Llenan la Matriz de Comparación Periodística:
     - Fuentes citadas (¿Hay científicos, autoridades, ciudadanos afectados?).
     - Adjetivos y tono del lenguaje (neutro, alarmista, esperanzador).
     - Relaciones de causa-consecuencia y omisiones de información.
2. Redacción del "Informe de Juicio Crítico":
   • Los alumnos redactan un texto comparativo explicando cómo la línea editorial de cada medio influye en la percepción de los lectores y proponiendo criterios para verificar noticias falsas.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Presentación de los hallazgos más sorprendentes sobre diferencias de cobertura.
2. Metacognición en libreta: "¿A partir de hoy, en qué me fijaré antes de creer una noticia que lea en internet?".
3. Entrega de evidencia: Matriz de contraste periodístico y reporte de juicio crítico.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Análisis Comparativo de Fuentes y Enfoques (Sobresaliente [3.5 pts]: Identifica fuentes primarias, relaciones de contraste y posibles sesgos con agudeza crítica | Satisfactorio [2.5 pts]: Compara dos notas e identifica diferencias evidentes | En Proceso [1.5 pts]: Resume las notas sin compararlas críticamente).
• Criterio 2 - Juicio Crítico y Argumentación Escrita (Sobresaliente [3.5 pts]: Redacta conclusiones fundamentadas sobre el papel de los medios y la ética informativa | Satisfactorio [2.5 pts]: Redacta su opinión con argumentos básicos | En Proceso [1.5 pts]: Opinión vaga sin respaldo en los textos analizados).
• Criterio 3 - Responsabilidad Digital y Ciudadana (Sobresaliente [3 pts]: Propone un decálogo concreto para identificar noticias falsas | Satisfactorio [2 pts]: Propone medidas generales | En Proceso [1 pt]: No reconoce los riesgos de la desinformación).
• Instrumento: Rúbrica de análisis crítico de medios de comunicación escrita.`,
    materiales: `• Ejemplares impresos y digitales de diferentes periódicos y revistas.
• Matriz impresa de contraste de notas informativas.
• Plumones y cartulinas para síntesis gráfica.`,
    evidenciaEntregable: `Matriz de Contraste Periodístico y Decálogo del Lector Crítico frente a la Desinformación.`
  },
  {
    id: 'fase5-len-5',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 5,
    temaTitulo: 'Elaboración de un tríptico informativo sobre la prevención de algún problema colectivo',
    tituloProyecto: 'Brigada Comunitaria de Información: Trípticos para la Prevención y la Salud',
    ejes: ['Vida Saludable', 'Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 5 (6º Primaria) - Indaga y reflexiona sobre las características y funciones de los trípticos informativos. Comparte con sus compañeras y compañeros la información investigada y dialoga para que, entre todos y todas, reflexionen sobre la relevancia de la prevención y elijan el problema colectivo sobre el que harán un tríptico informativo. Investiga con mayor profundidad sobre el problema colectivo que hayan elegido e integran la información en un texto breve que incluirán en un tríptico que contenga portada, imágenes, gráficas, tablas, cuadros, fuentes de consulta, datos de personas o instituciones de apoyo, etcétera. Presenta y difunde el tríptico con la comunidad.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué un tríptico plegado en tres partes es uno de los medios más efectivos para comunicar mensajes de prevención en una comunidad?',
      '¿Cómo debemos distribuir visualmente los títulos, imágenes, gráficas y datos de contacto en las 6 caras del tríptico?',
      '¿Qué problema urgente de nuestra escuela o colonia (dengue, acoso escolar, desperdicio de agua, mala alimentación) necesita atención preventiva inmediata?',
      '¿A qué números telefónicos o instituciones de apoyo de nuestra localidad deben acudir las personas en caso de emergencia?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Exploración Sensorial de Trípticos Reales: El docente reparte trípticos de salud pública (vacunación, prevención de incendios, ahorro de agua).
2. Pregunta detonadora: "¿Qué cara del tríptico miramos primero y cuál es la que debe contener los teléfonos de ayuda y las medidas de acción?".
3. Análisis de la anatomía del tríptico: Portada impactante, cuerpo interior (problema, causas, medidas preventivas), y contraportada con directorio y créditos.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Elección Democrática del Problema Colectivo en Equipos:
   • Los equipos eligen un tema prioritario para su comunidad escolar (ej. "Cuidado del Agua en la Escuela", "Prevención del Acoso Escolar y Cultura de Paz", "Alimentación Saludable sin Ultraprocesados").
2. Maquetación y Diseño del Prototipo en Papel:
   • Doblan hojas bond en 3 partes iguales (6 paneles).
   • Redactan textos breves, directos y con verbos en imperativo/infinitivo para las acciones preventivas ("Lava tus manos", "Reporta fugas", "Respeta a tus compañeros").
   • Integran una gráfica sencilla o tabla de datos y dibujan o pegan imágenes claras.
   • Registran el directorio de instituciones locales (DIF, Centro de Salud, Protección Civil).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Galería de Prototipos: Rondas de intercambio de trípticos para revisión con lista de cotejo entre equipos.
2. Metacognición: "¿De qué manera este folleto puede ayudar a una familia de mi comunidad a prevenir un riesgo?".
3. Entrega de evidencia: Maqueta de tríptico terminada y lista para reproducción.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Contenido Preventivo y Rigor de la Información (Sobresaliente [3.5 pts]: Plantea medidas de prevención concretas, viables y respaldadas por fuentes oficiales | Satisfactorio [2.5 pts]: Contiene información clara con medidas preventivas generales | En Proceso [1.5 pts]: Información escasa o desorganizada).
• Criterio 2 - Diseño Gráfico y Distribución en 6 Caras (Sobresaliente [3.5 pts]: Portada atractiva, uso balanceado de texto/imágenes, gráficas claras y directorio de apoyo | Satisfactorio [2.5 pts]: Distribución adecuada con detalles menores de legibilidad | En Proceso [1.5 pts]: Texto amontonado o caras en blanco).
• Criterio 3 - Difusión Comunitaria (Sobresaliente [3 pts]: Diseña una estrategia clara para compartir el tríptico con padres y vecinos | Satisfactorio [2 pts]: Comparte en el aula | En Proceso [1 pt]: Sin plan de difusión).
• Instrumento: Rúbrica para diseño editorial comunitario y lista de verificación técnica.`,
    materiales: `• Hojas blancas y de colores tamaño carta.
• Reglas, tijeras, pegamento, plumones y lápices de color.
• Folletos y trípticos de ejemplo de la Secretaría de Salud y Protección Civil.`,
    evidenciaEntregable: `Tríptico informativo impreso o manuscrito de alta calidad con las 6 caras completas y plan de difusión escolar.`
  },
  {
    id: 'fase5-len-6',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 6,
    temaTitulo: 'Comprensión y producción de textos discontinuos (gráficas, cuadros sinópticos y mapas conceptuales)',
    tituloProyecto: 'Infografías y Organizadores Gráficos: El Poder Visual de la Síntesis del Conocimiento',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 5 (6º Primaria) - Reconoce, mediante el análisis, las características y funciones de los textos discontinuos, en particular de gráficas, cuadros sinópticos y mapas conceptuales. Reflexiona sobre las posibilidades de los textos discontinuos para organizar la información que expone a otras personas. Sintetiza información, sin perder el significado original, para organizarla y presentarla por medio de textos discontinuos. Produce textos discontinuos, considerando al destinatario y empleando elementos gráficos útiles para organizar y presentar información, como tipografía, viñetas, espacios de la página, interlineado, signos de puntuación, mayúsculas y minúsculas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué un cerebro humano procesa una imagen o gráfica en milisegundos mientras un texto continuo de 10 páginas toma mucho más tiempo?',
      '¿Cuál es la diferencia estructural entre un mapa conceptual (con conceptos y conectores verbales) y un cuadro sinóptico (con llaves y jerarquía)?',
      '¿Cómo podemos sintetizar un capítulo largo de historia o ciencias sin perder las ideas esenciales?',
      '¿Qué función cumplen la tipografía, los colores contrastantes y los iconos en una infografía educativa?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Reto Visual "Texto Continuo vs Infografía": El docente proyecta un párrafo denso de 20 líneas sobre la biodiversidad de México frente a una infografía colorida con iconos y porcentajes del mismo tema.
2. Pregunta detonadora: "¿En cuál de los dos formatos encontraron la información más rápido y por qué?".
3. Análisis de los elementos de los textos discontinuos: Jerarquías, llaves, flechas conectoras, iconos y títulos destacados.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Transformación de Textos Continuos a Textos Discontinuos:
   • En parejas, los alumnos reciben un texto continuo sobre los "Ecosistemas y Regiones Naturales de México".
   • Aplican la técnica de las 3 fases de síntesis:
     - Paso 1: Subrayar conceptos clave y datos numéricos.
     - Paso 2: Diseñar la estructura jerárquica (Cuadro sinóptico con llaves o Mapa Conceptual con enlaces como "se compone de", "produce", "habita en").
     - Paso 3: Elaborar la infografía final cuidando la tipografía, el uso de mayúsculas normativas y viñetas organizadoras.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Exposición "Muro de la Síntesis": Pegar los organizadores en las paredes del aula y realizar un recorrido silencioso de apreciación técnica.
2. Metacognición: "¿Cómo me ayuda elaborar mapas conceptuales cuando tengo que estudiar para un examen difícil?".
3. Entrega de evidencia: Infografía u organizador gráfico terminado con rúbrica de síntesis visual.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Capacidad de Síntesis y Fidelidad Conceptual (Sobresaliente [3.5 pts]: Sintetiza las ideas principales sin perder el rigor conceptual original | Satisfactorio [2.5 pts]: Resume las ideas con omisiones menores | En Proceso [1.5 pts]: Copia párrafos enteros sin sintetizar).
• Criterio 2 - Estructura Jerárquica y Conectores (Sobresaliente [3.5 pts]: Emplea llaves, niveles jerárquicos y palabras de enlace con lógica impecable | Satisfactorio [2.5 pts]: Estructura comprensible con jerarquías básicas | En Proceso [1.5 pts]: Estructura desordenada sin jerarquía clara).
• Criterio 3 - Calidad Gráfica y Tipografía (Sobresaliente [3 pts]: Uso excelente de colores, tamaños de letra legibles, viñetas y espacios limpios | Satisfactorio [2 pts]: Presentación adecuada | En Proceso [1 pt]: Presentación descuidada o ilegible).
• Instrumento: Rúbrica de organizadores gráficos y textos discontinuos.`,
    materiales: `• Textos continuos de ciencias e historia para sintetizar.
• Cartulinas, reglas, plumones de colores y notas adhesivas.
• Guías de conectores lógicos para mapas conceptuales.`,
    evidenciaEntregable: `Lámina Infográfica o Mapa Conceptual de síntesis temática con jerarquías visuales y conectores lógicos.`
  },

  // =========================================================================
  // 🎨 ÁREA 2: LENGUAJES - LITERATURA, MITOS, TEATRO Y ARTES (6)
  // =========================================================================
  {
    id: 'fase5-len-7',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 7,
    temaTitulo: 'Reconocimiento de la diversidad lingüística de México',
    tituloProyecto: 'Palabras con Raíz: El Legado de las Lenguas Originarias en el Español Mexicano',
    ejes: ['Interculturalidad Crítica', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 5 (5º Primaria) - Investiga en fuentes impresas y/o electrónicas sobre la diversidad lingüística en México y sobre la influencia de las lenguas originarias en el español en México. Averigua por medio de entrevistas con personas adultas mayores y la consulta de diccionarios, algunas palabras usuales en el español mexicano que provienen de lenguas originarias. Registra las palabras sobre las que averiguó, comprende su significado y, de ser posible, indaga en su historia. Comparte el resultado de su investigación. Reflexiona sobre la diversidad lingüística en México y valora su riqueza.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Sabías que cuando dices chocolate, aguacate, popote, tianguis, apapachar o papalote estás hablando náhuatl?',
      '¿Por qué México es uno de los 10 países con mayor diversidad lingüística del planeta con 68 agrupaciones y 364 variantes?',
      '¿Qué conocimientos ancestrales sobre plantas medicinales, astronomía y respeto a la Madre Tierra se pierden si se extingue una lengua originaria?',
      '¿Cómo podemos promover el orgullo y respeto hacia los hablantes de lenguas indígenas en nuestra escuela?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dinámica del "Árbol de los Nahuatlismos": El docente pega en el pizarrón hojas con dibujos de objetos cotidianos (tomate, chicle, petate, comal, molcajete, mecate).
2. Pregunta detonadora: "¿De qué idioma creen que provienen estas palabras que usamos todos los días en México?".
3. Proyección del mapa sonoro de lenguas indígenas del INALI con audios en maya, náhuatl, mixteco y rarámuri.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Diccionario Etnolingüístico en Parejas:
   • Consultan el catálogo de lenguas originarias y seleccionan 6 indigenismos de su región o del país.
   • Elaboran fichas léxicas que incluyen: Palabra original, Lengua madre (ej. Náhuatl / Maya / Purépecha), Significado etimológico desglosado (ej. *Ahuacatl* = testículo por la forma del fruto; *Xocolatl* = agua amarga) y Oración ilustrada de uso actual.
2. Diseño de la Entrevista a Adultos Mayores:
   • Redactan un guion de 4 preguntas para entrevistar a sus abuelos o vecinos mayores sobre palabras, refranes o relatos tradicionales de sus pueblos de origen.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Lotería de Palabras Originarias: Juego interactivo rápido para afianzar los significados etimológicos aprendidos.
2. Metacognición: "¿Por qué discriminar a alguien por hablar una lengua indígena es rechazar nuestras propias raíces mexicanas?".
3. Entrega de evidencia: Fichas del Mini-Diccionario Ilustrado de Indigenismos.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión Etimológica y Diversidad Lingüística (Sobresaliente [3.5 pts]: Investiga orígenes, significados y contextos de lenguas originarias con rigor | Satisfactorio [2.5 pts]: Identifica palabras y significados básicos | En Proceso [1.5 pts]: Confunde orígenes lingüísticos).
• Criterio 2 - Valoración Intercultural Crítica (Sobresaliente [3.5 pts]: Reflexiona con empatía sobre el valor del multilingüismo y los derechos lingüísticos | Satisfactorio [2.5 pts]: Expresa respeto general | En Proceso [1.5 pts]: Actitud indiferente ante la pérdida de lenguas).
• Criterio 3 - Creatividad en el Producto Léxico (Sobresaliente [3 pts]: Fichas impecables con etimología, oraciones de contexto e ilustraciones | Satisfactorio [2 pts]: Fichas completas | En Proceso [1 pt]: Fichas incompletas).
• Instrumento: Rúbrica intercultural de patrimonio lingüístico.`,
    materiales: `• Diccionarios de indigenismos y mapas lingüísticos de México (INALI / SEP).
• Tarjetas de cartulina blanca (media carta) y colores.
• Grabadora de audio o celular para audición de variantes.`,
    evidenciaEntregable: `Mini-Diccionario Ilustrado de Indigenismos Mexicanos "Palabras con Raíz y Corazón".`
  },
  {
    id: 'fase5-len-8',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 8,
    temaTitulo: 'Análisis de cuentos y poemas para su disfrute y comprensión',
    tituloProyecto: 'Café Literario Escolar: Recital y Antología de Cuentos y Poemas Mexicanos',
    ejes: ['Artes y Experiencias Estéticas', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 5 (5º Primaria) - Lee y selecciona cuentos y poemas mexicanos a partir de sus intereses y gustos, y comparte los motivos de su elección. Analiza cuentos y poemas, y expresa oralmente sus interpretaciones de estos. Distingue las características tanto de cuentos como de poemas. Organiza y participa en un recital literario en el que lee en voz alta cuentos y poemas para la comunidad escolar. Crea poemas y cuentos en colectivo a partir de historias propias, familiares o populares.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué distingue la estructura de un poema (versos, estrofas, rima, ritmo) de la estructura narrativa de un cuento (inicio, nudo, desenlace)?',
      '¿Cómo logran autores mexicanos como Octavio Paz, Rosario Castellanos o Amado Nervo hacernos sentir tristeza, asombro o alegría con pocas palabras?',
      '¿Qué recursos de la voz (volumen, pausas, énfasis, entonación) debemos dominar para recitar un poema frente a un público?',
      '¿Cómo podemos transformar una anécdota familiar divertida en un cuento de ficción emocionante?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Ambientación de Café Literario: Música suave de guitarra mexicana y lectura en voz alta por el docente del poema "La higuera" de Juana de Ibarbourou o fragmentos de Nezahualcóyotl.
2. Pregunta detonadora: "¿Qué imágenes vinieron a su mente al escuchar estos versos? ¿Qué diferencia sintieron con respecto a la lectura de una noticia?".
3. Contrastación en tabla comparativa: Cuento (prosa, personajes, trama) vs Poema (verso, musicalidad, metáfora).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Creación Poética y Narrativa en Equipos:
   • Los alumnos eligen trabajar en un Poema Colectivo en cuartetas (rimas AABB o ABAB) o un Microcuento de tradición popular.
   • Aplican figuras retóricas:
     - Metáforas ("El sol es una moneda de oro en el cielo").
     - Personificación ("El viento silba canciones entre los árboles").
2. Laboratorio de Expresión Oral y Modulación:
   • Ensayos en parejas de lectura en atril marcando pausas con signos de puntuación, modulando tonos graves y agudos y proyectando la voz sin gritar.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Mini-Recital "Micrófono de Oro": 3 parejas presentan su creación poética al grupo recibiendo ovación y retroalimentación cálida.
2. Metacognición: "¿Qué emoción fue la más fácil y cuál la más difícil de expresar en verso?".
3. Entrega de evidencia: Manuscrito ilustrado del poema o cuento colectivo.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión y Creación Literaria (Sobresaliente [3.5 pts]: Construye textos con dominio de rima, métrica y metáforas originales | Satisfactorio [2.5 pts]: Texto coherente con rimas sencillas | En Proceso [1.5 pts]: Dificultad para estructurar versos o tramas).
• Criterio 2 - Expresión y Modulación Oral en Recital (Sobresaliente [3.5 pts]: Proyección de voz, dicción impecable, pausas emotivas y contacto visual | Satisfactorio [2.5 pts]: Lectura fluida con modulación básica | En Proceso [1.5 pts]: Lectura monótona o inaudible).
• Criterio 3 - Trabajo Colectivo y Apreciación Estética (Sobresaliente [3 pts]: Colabora armónicamente y valora la producción de sus compañeros | Satisfactorio [2 pts]: Participa con apoyo | En Proceso [1 pt]: Trabajo individualista).
• Instrumento: Rúbrica de expresión estética y declamación poética.`,
    materiales: `• Antologías de poesía y cuentos mexicanos infantiles.
• Hojas pergamino o cartulinas decoradas.
• Atril o soporte de lectura y micrófono simulado.`,
    evidenciaEntregable: `Página ilustrada para la "Antología Poética del Grupo 5º" y participación activa en el Recital Literario.`
  },
  {
    id: 'fase5-len-9',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 9,
    temaTitulo: 'Lectura y análisis de mitos y leyendas, para su disfrute y valoración',
    tituloProyecto: 'Misterios del Mayab y Anáhuac: Antología y Escenificación de Mitos y Leyendas',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Interculturalidad Crítica', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 5 (5º Primaria) - Lee mitos y leyendas de México e identifica las características y funciones de cada tipo de texto. Investiga sobre el origen de los mitos y leyendas leídos. Identifica elementos de realidad y fantasía tanto en mitos como en leyendas. Indaga, con las personas adultas mayores de su comunidad, para conocer los mitos y leyendas que forman parte de la cultura de su región. Escenifica un mito o leyenda de su interés frente a público. Reflexiona sobre la riqueza cultural que encierran los mitos y las leyendas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia fundamental entre un MITO (que explica el origen del cosmos, los dioses y el mundo) y una LEYENDA (que mezcla hechos históricos reales con sucesos sobrenaturales en un lugar concreto)?',
      '¿Por qué leyendas como la de "La Llorona", "El Callejón del Beso" o "Los Volcanes Popocatépetl e Iztaccíhuatl" siguen vivas tras cientos de años?',
      '¿Qué relatos sobrenaturales o misteriosos cuentan los ancianos de tu comunidad sobre cerros, ríos o casas antiguas?',
      '¿Cómo podemos caracterizar a los personajes míticos usando máscaras y teatro de sombras?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Narración a Oscuras con Linterna: El docente narra con efectos de sonido el mito prehispánico del Quinto Sol o la leyenda maya del pájaro Dziú.
2. Pregunta detonadora: "¿Qué parte de esta historia busca explicar la realidad de la naturaleza y qué parte pertenece a la magia y la fantasía?".
3. Cuadro de doble entrada en pizarrón: Mitos cosmogónicos vs Leyendas urbanas y rurales.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Compilación y Análisis en Equipos de 4:
   • Cada equipo selecciona una leyenda de su estado o región de México.
   • Completan la Ficha de Deconstrucción Narrativa:
     - Elementos reales e históricos (época virreinal, lugares geográficos exactos).
     - Elementos fantásticos (apariciones, transformaciones, magia).
     - Valores o moralejas comunitarias (respeto a la naturaleza, prudencia, lealtad).
2. Adaptación a Guion para Teatro de Sombras o Títeres:
   • Transforman la leyenda en un libreto corto con diálogos y acotaciones escénicas.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Muestra Relámpago de Títeres de Papel: Representación de 1 minuto de una escena cumbre de cada leyenda.
2. Metacognición: "¿Por qué los mitos y leyendas son el tesoro de la memoria oral de los pueblos?".
3. Entrega de evidencia: Ficha de análisis y libreto dramatizado.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Diferenciación entre Mito, Leyenda, Realidad y Fantasía (Sobresaliente [3.5 pts]: Distingue con total claridad los elementos cosmogónicos, históricos y fantásticos | Satisfactorio [2.5 pts]: Identifica diferencias básicas | En Proceso [1.5 pts]: Confunde mitos con cuentos ordinarios).
• Criterio 2 - Indagación Comunitaria y Rescate Oral (Sobresaliente [3.5 pts]: Recopila relatos con adultos mayores con respeto y detalle testimonial | Satisfactorio [2.5 pts]: Registra historias de fuentes impresas | En Proceso [1.5 pts]: Información mínima sin contexto).
• Criterio 3 - Representación Teatral y Expresión Artística (Sobresaliente [3 pts]: Crea escenografía y modula voces con creatividad y dinamismo | Satisfactorio [2 pts]: Representación sencilla | En Proceso [1 pt]: Lectura plana).
• Instrumento: Rúbrica de análisis de tradición oral y puesta en escena.`,
    materiales: `• Textos de mitos prehispánicos y leyendas coloniales de México.
• Cartoncillo negro, palitos de madera, papel celofán de colores y linternas para teatro de sombras.
• Formato de libreto teatral impreso.`,
    evidenciaEntregable: `Compendio Ilustrado de Leyendas Regionales con Guion de Adaptación Teatral.`
  },
  {
    id: 'fase5-len-10',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español / Artes',
    materiaFolder: 'Artes',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 10,
    temaTitulo: 'Análisis y representación de guiones teatrales',
    tituloProyecto: 'Telón Abierto: Montaje, Acotaciones y Escenificación de Teatro Escolar',
    ejes: ['Artes y Experiencias Estéticas', 'Inclusión', 'Pensamiento Crítico'],
    pda: 'Fase 5 (6º Primaria) - Formula comentarios críticos respecto de un guion teatral de su elección, para expresar sus gustos, intereses e ideas, así como para desarrollar la argumentación. Realiza una representación teatral en colectivo, jugando con combinaciones de secuencias de sonidos y movimientos rápidos, lentos, agudos, graves, fuertes, débiles, pausas y con acentos variados. Emplea diversos elementos de los lenguajes artísticos, para crear escenografía, vestuario y maquillaje en la escenificación de una obra de teatro infantil o una situación improvisada a la que se invite a familiares y otros miembros de la comunidad.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué función tienen las acotaciones entre paréntesis en un guion teatral y por qué NO deben leerse en voz alta durante la actuación?',
      '¿Cómo podemos transmitir el miedo, la sorpresa o la alegría utilizando únicamente el lenguaje corporal y el tono de voz?',
      '¿Cómo se diseña una escenografía creativa utilizando materiales reciclados del entorno escolar?',
      '¿Qué importancia tiene la puntualidad y la coordinación en las entradas y salidas de escena de los actores?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dinámica de Estatuas Emocionales: El docente dice una emoción o situación (ej. "¡Un explorador descubre un tesoro en una cueva oscura!") y los alumnos deben congelar su cuerpo en una postura dramática expresiva.
2. Pregunta detonadora: "¿Cómo sabe un actor cuándo debe entrar furioso o cuándo debe hablar en susurros si el autor de la obra no está presente?".
3. Lectura comentada de un fragmento de guion teatral identificando parlamentos, personajes en negritas y acotaciones (*itálicas*).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Dirección Escénica y Producción en Equipos de 5:
   • Roles asignados: 2 Actores, 1 Director de Escena, 1 Diseñador de Escenografía/Utilería y 1 Encargado de Sonorización y Efectos Foleys.
   • Adaptan una obra breve sobre la resolución pacífica de un conflicto comunitario.
   • Creación de utilería y vestuario rápido con cartón, telas y pintura facial básica.
2. Ensayos con la técnica de Secuencias de Ritmo y Voz:
   • Practican cambios de ritmo: movimientos en cámara lenta vs movimientos rápidos, y contrastes de volumen vocal (del susurro dramático a la voz de trueno).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Ensayo General de 2 minutos por equipo frente a sus compañeros con retroalimentación del "Director Invitado".
2. Metacognición: "¿Qué sentí al interpretar a un personaje con una forma de ser totalmente distinta a la mía?".
3. Entrega de evidencia: Guion técnico acotado y boceto escenográfico.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión y Aplicación del Guion Teatral (Sobresaliente [3.5 pts]: Interpreta acotaciones, estructura dramática y diálogos con fluidez y naturalidad | Satisfactorio [2.5 pts]: Sigue el guion con dudas en acotaciones | En Proceso [1.5 pts]: Lee mecánicamente sin interpretar).
• Criterio 2 - Expresión Corporal, Vocal y Sonora (Sobresaliente [3.5 pts]: Manejo impecable de modulación de voz, silencios dramáticos y lenguaje no verbal | Satisfactorio [2.5 pts]: Expresión adecuada con nerviosismo menor | En Proceso [1.5 pts]: Falta de proyección o rigidez corporal).
• Criterio 3 - Diseño Escenográfico y Trabajo en Equipo (Sobresaliente [3 pts]: Crea escenografía y vestuario creativos y demuestra sincronía grupal | Satisfactorio [2 pts]: Utilería básica | En Proceso [1 pt]: Descoordinación).
• Instrumento: Rúbrica de artes escénicas y dramatización grupal.`,
    materiales: `• Guiones de teatro infantil y juvenil adaptados.
• Cajas de cartón, telas recicladas, gises, pinturas no tóxicas.
• Instrumentos de percusión sencillos (claves, panderos, maracas) para efectos sonoros.`,
    evidenciaEntregable: `Guion Teatral Director con Acotaciones y Montaje Escénico "Teatro en Comunidad".`
  },
  {
    id: 'fase5-len-11',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Artes',
    materiaFolder: 'Artes',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 11,
    temaTitulo: 'Apropiación e intervención artística en el espacio comunitario',
    tituloProyecto: 'Murales y Espacios Vivos: Arte Urbano Transformador para el Bienestar Escolar',
    ejes: ['Artes y Experiencias Estéticas', 'Inclusión', 'Vida Saludable'],
    pda: 'Fase 5 (6º Primaria) - Reflexiona en colectivo acerca de las maneras en que un espacio puede ser mejorado, y lo lleva a cabo mediante la planeación de expresiones artísticas, tales como performance, videoarte, instalación, escultura, o teatro comunitario. Representa en colectivo problemas de la comunidad para visibilizarlas mediante propuestas artísticas ante los demás. Crea producciones artísticas con distintos lenguajes: oral, escrito, alternativo, musical, visual, teatral o dancístico, para transformar de manera efímera, o incluso permanentemente, un espacio público de la comunidad, a favor del bienestar social.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo puede una pared gris y descuidada transformarse en una fuente de alegría, identidad y reflexión mediante un mural comunitario?',
      '¿Qué mensajes sobre la paz, la inclusión y el cuidado del medio ambiente necesita nuestra escuela?',
      '¿Cuál es la diferencia entre el vandalismo y una intervención artística colectiva con permiso y sentido social?',
      '¿Qué técnicas de arte visual (mosaico con tapitas recicladas, pintura al temple, esténcil) podemos usar de forma sustentable?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Recorrido de "Diagnóstico Estético": El grupo realiza una caminata de 5 minutos por los patios y pasillos del plantel escolar para identificar un rincón que requiera revitalización.
2. Pregunta detonadora: "¿Qué emociones nos transmite este espacio ahora mismo y qué queremos que sienta la gente al pasar por aquí?".
3. Proyección de imágenes de muralistas mexicanos (Diego Rivera, Siqueiros y colectivos urbanos contemporáneos de arte comunitario).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Bocetaje Colectivo en Papel Kraft:
   • En equipos de 5, diseñan una propuesta de intervención artística bajo el lema "Nuestra Comunidad Florece en Paz".
   • Definen la paleta de colores cromática (cálidos para energía, fríos para serenidad) y los símbolos visuales (manos unidas, árboles nativos, libros, niños jugando).
   • Proponen la técnica: Mural en papel kraft desmontable o mosaico ecológico con tapas plásticas clasificadas por color.
2. Asignación de Tareas del Colectivo de Artistas:
   • Trazadores de siluetas, coloristas de fondos, letristas de mensajes poéticos y coordinadores de limpieza ecológica.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Exposición y Votación Democrática del Boceto Integrador.
2. Metacognición: "¿Cómo el arte nos da voz a los niños para transformar nuestro entorno?".
3. Entrega de evidencia: Boceto a escala con justificación social del mensaje.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Sentido Social y Propósito Comunitario (Sobresaliente [3.5 pts]: El proyecto visibiliza una problemática real y promueve valores de paz e inclusión | Satisfactorio [2.5 pts]: Mensaje visual positivo general | En Proceso [1.5 pts]: Dibujo decorativo sin mensaje reflexivo).
• Criterio 2 - Dominio Técnico y Lenguaje Visual (Sobresaliente [3.5 pts]: Armonía en la composición, uso deliberado del color, proporciones y limpieza | Satisfactorio [2.5 pts]: Composición adecuada | En Proceso [1.5 pts]: Trazo descuidado o desorganizado).
• Criterio 3 - Trabajo Colaborativo e Impacto en el Entorno (Sobresaliente [3 pts]: Colabora con entusiasmo, cuida los materiales y respeta el espacio común | Satisfactorio [2 pts]: Trabajo en equipo básico | En Proceso [1 pt]: Falta de compromiso con la obra grupal).
• Instrumento: Rúbrica de arte público e intervención socio-comunitaria.`,
    materiales: `• Rollos de papel kraft grueso, masking tape, pinceles y pinturas acrílicas al agua.
• Tapitas de plástico recicladas de colores para mosaicos.
• Gises de colores y reglas largas.`,
    evidenciaEntregable: `Boceto y Maqueta del Mural Comunitario "Espacios Vivos para la Convivencia Escolar".`
  },
  {
    id: 'fase5-len-12',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Artes / Español',
    materiaFolder: 'Artes',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 12,
    temaTitulo: 'Interpretación y valoración de manifestaciones culturales y artísticas',
    tituloProyecto: 'Galería de Identidades: Simbolismo, Rituales y Significado en el Arte Popular Mexicano',
    ejes: ['Interculturalidad Crítica', 'Artes y Experiencias Estéticas', 'Inclusión'],
    pda: 'Fase 5 (6º Primaria) - Reconoce ideales y temáticas sociales que se imprimieron en ciertas manifestaciones culturales y artísticas, en un tiempo y espacio determinados. Analiza las partes y elementos que conforman una manifestación cultural o artística, y reconoce la multiplicidad de significados, puntos de vista y concepciones del mundo en ella. Reconoce símbolos presentes en manifestaciones culturales y artísticas, a partir del análisis e interpretación de formas, colores, texturas, sonidos, objetos, aromas, movimientos y gestos, que contienen.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué simbolizan los alebrijes oaxaqueños, las máscaras de los danzantes de concheros o los árboles de la vida de Metepec?',
      '¿Cómo los pueblos originarios plasman su cosmovisión sobre la vida, la muerte y el cosmos a través de colores, texturas y formas?',
      '¿Por qué una artesanía no es solo un adorno, sino un libro vivo de historia y resistencia cultural?',
      '¿Cómo podemos interpretar una obra de arte moderna a partir de las emociones y metáforas que despierta en nosotros?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Museo en el Aula: El docente coloca en una mesa central 4 piezas de arte tradicional mexicano (un alebrije de madera, un bordado tenangense, una máscara de madera y un jarro de barro negro).
2. Pregunta detonadora: "¿Qué historias nos cuentan las figuras fantásticas y los colores de estas obras creadas por manos artesanas?".
3. Definición de Simbolismo Artístico: Cómo un objeto, animal o color representa ideas profundas (el jaguar como fuerza, el colibrí como mensajero del sol).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Curaduría y Semiótica en Tríos:
   • Cada equipo selecciona una manifestación artística o danza tradicional mexicana (ej. La Danza de los Viejitos de Michoacán, Los Huicholes y el Arte Wixárika con chaquira, El Son Jarocho y el zapateado en tarima).
   • Elaboran la Cédula Museográfica de Análisis Simbólico:
     - Elementos visuales y sensoriales: Texturas, ritmo, aromas de copal, colores sagrados.
     - Significado cultural y resistencia histórica de la comunidad que lo creó.
     - Interpretación personal: ¿Qué nos enseña hoy sobre la convivencia y el cuidado de la tierra?
2. Creación de una Pieza Simbólica Propia:
   • Los alumnos modelan en plastilina o dibujan un "Amuleto de Identidad" combinando símbolos de su familia y aspiraciones personales.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Recorrido Guiado por la Galería de Cédulas Museográficas con explicaciones breves de los curadores infantiles.
2. Metacognición: "¿De qué manera el arte popular fortalece nuestro orgullo de ser mexicanos?".
3. Entrega de evidencia: Cédula museográfica y pieza simbólica explicada.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Interpretación Semiótica y Simbólica (Sobresaliente [3.5 pts]: Decodifica símbolos culturales, ideales sociales e intenciones estéticas con profundidad | Satisfactorio [2.5 pts]: Describe elementos y significados evidentes | En Proceso [1.5 pts]: Descripción superficial sin interpretación).
• Criterio 2 - Cédula Museográfica y Rigor Histórico (Sobresaliente [3.5 pts]: Redacta cédulas informativas con datos de origen, técnica y contexto biocultural | Satisfactorio [2.5 pts]: Cédula completa con datos básicos | En Proceso [1.5 pts]: Faltan datos esenciales de la obra).
• Criterio 3 - Respeto y Valoración del Patrimonio (Sobresaliente [3 pts]: Demuestra admiración y defensa del patrimonio biocultural | Satisfactorio [2 pts]: Actitud respetuosa | En Proceso [1 pt]: Desinterés).
• Instrumento: Rúbrica de apreciación estética y curaduría cultural.`,
    materiales: `• Fotografías en alta resolución y muestras físicas de artesanías mexicanas.
• Tarjetas de cartulina negra con plumones metálicos para cédulas museográficas.
• Plastilina, arcilla o gises pastel para modelado simbólico.`,
    evidenciaEntregable: `Cédula Museográfica Curatorial y Pieza Simbólica de Arte Popular Mexicano.`
  },

  // =========================================================================
  // 🧬 ÁREA 3: SABERES Y PENSAMIENTO CIENTÍFICO - CIENCIAS NATURALES & SALUD (6)
  // =========================================================================
  {
    id: 'fase5-sci-13',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Ciencias Naturales',
    materiaFolder: 'Ciencias_Naturales',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 13,
    temaTitulo: 'Estructura y funcionamiento del cuerpo humano: sistemas circulatorio y respiratorio',
    tituloProyecto: 'El Motor de la Vida: Modelando el Pulso Cardíaco y la Respiración Celular',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 5 (5º Primaria) - Describe y representa mediante modelos, la relación de la nariz, tráquea y pulmones, como parte del sistema respiratorio, con el intercambio de gases. Indaga y explica con modelos, la función general del corazón y los vasos sanguíneos (arterias y venas), que forman parte del sistema circulatorio y su relación con el intercambio de gases. Comprende que la frecuencia cardiaca es el número de latidos del corazón en un minuto, que se puede medir en los puntos en los que se ubican arterias a través del pulso cardíaco; establece relaciones entre la actividad física y la frecuencia cardiaca. Indaga los factores del medio ambiente que inciden en la salud de los sistemas circulatorio y respiratorio; propone y practica acciones para prevenir infecciones y favorecer su cuidado.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué cuando corremos en el patio nuestro corazón late más rápido y respiramos con mayor velocidad?',
      '¿Cómo viaja el oxígeno desde el aire que entra por la nariz hasta la última célula de nuestros pies gracias a los glóbulos rojos?',
      '¿Cuál es la diferencia biológica entre una arteria (sangre oxigenada a presión) y una vena (retorno de sangre con dióxido de carbono)?',
      '¿Cómo afecta la contaminación por partículas PM2.5 y el humo del tabaco a los alvéolos pulmonares?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Experimento del Pulso en Reposo vs Actividad: Los alumnos aprenden a tomarse el pulso radial (en la muñeca) o carotídeo (en el cuello) durante 1 minuto en reposo (ej. 75 latidos/min). Luego realizan 30 saltos de tijera y vuelven a medirlo inmediatamente (ej. 130 latidos/min).
2. Pregunta detonadora: "¿Por qué el corazón necesita bombear más sangre cuando los músculos hacen esfuerzo?".
3. Recuperación de saberes: El circuito cerrado de circulación (corazón, arterias, capilares, venas).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Construcción de Prototipos Anatómicos en Equipos de 3:
   • Prototipo A (Pulmón en Botella): Botella PET cortada con dos globos interiores (pulmones) y un guante de látex en la base (diafragma) para demostrar cómo la presión negativa expande los alvéolos.
   • Prototipo B (Bomba Cardíaca Hidráulica): Dos frascos con agua coloreada de rojo y mangueras transparentes con válvulas de retención caseras para simular el sístole y diástole.
2. Registro Científico de Variables:
   • Grafican en papel milimétrico la curva de recuperación cardíaca (minuto 0, minuto 2, minuto 5 post-ejercicio).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Explicación con los modelos del intercambio de oxígeno por dióxido de carbono en los alvéolos.
2. Metacognición en libreta: "¿Qué compromisos de ejercicio diario y respiración consciente asumo para cuidar mi corazón?".
3. Entrega de evidencia: Modelo anatómico funcional y tabla de registro de frecuencia cardíaca.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión Fisiológica y Modelación (Sobresaliente [3.5 pts]: Explica con rigor la interacción entre corazón, pulmones y transporte de gases con modelos funcionales | Satisfactorio [2.5 pts]: Explica el circuito con detalles menores | En Proceso [1.5 pts]: Confunde arterias con venas o respiración celular con inhalación).
• Criterio 2 - Medición Científica y Registro de Frecuencia (Sobresaliente [3.5 pts]: Mide el pulso con precisión, tabula datos y correlaciona esfuerzo físico con gasto cardíaco | Satisfactorio [2.5 pts]: Toma el pulso pero con errores de conteo | En Proceso [1.5 pts]: Dificultad para localizar el pulso).
• Criterio 3 - Propuestas de Salud Ambiental y Cardiovascular (Sobresaliente [3 pts]: Argumenta acciones preventivas contra contaminación y sedentarismo | Satisfactorio [2 pts]: Propone medidas generales | En Proceso [1 pt]: Sin propuestas claras).
• Instrumento: Rúbrica de laboratorio de ciencias y reporte de frecuencia cardíaca.`,
    materiales: `• Botellas de plástico recicladas, globos de colores, popotes, plastilina, ligas, mangueras de acuario y colorante vegetal rojo.
• Cronómetros y estetoscopios didácticos caseros (embudos y manguera).
• Hojas milimétricas para gráficas de pulso.`,
    evidenciaEntregable: `Reporte de Laboratorio "El Circuito de la Vida: Modelo Pulmonar-Cardíaco y Gráfica de Esfuerzo Físico".`
  },
  {
    id: 'fase5-sci-14',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Ciencias Naturales',
    materiaFolder: 'Ciencias_Naturales',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 14,
    temaTitulo: 'Alimentación saludable: características de la dieta correcta y riesgos de los ultraprocesados',
    tituloProyecto: 'El Plato del Buen Comer y la Dieta de la Milpa: Nutrición Consciente contra Enfermedades Crónicas',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 5 (5º Primaria) - Explica las características de la dieta correcta: variada, completa, equilibrada, inocua, suficiente, y las contrasta con sus hábitos de alimentación para tomar decisiones en beneficio de su salud. Indaga posibles riesgos de los hábitos de alimentación personales y familiares, como diabetes, hipertensión, colesterol elevado, entre otros; propone posibles cambios en su alimentación a partir de las alternativas que están disponibles en su localidad y en las prácticas de higiene relacionadas con la preparación y consumo de alimentos. Describe de dónde provienen y cómo se producen o procesan los alimentos que consume y los beneficios nutrimentales que estos tienen; diseña distintos menús basados en las características de la dieta correcta.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué significan exactamente los 5 pilares de una dieta correcta: Completa, Equilibrada, Variada, Suficiente e Inocua?',
      '¿Por qué la milpa mexicana (maíz, frijol, calabaza, chile y quelites) es reconocida mundialmente como uno de los sistemas alimentarios más nutritivos y sustentables?',
      '¿Cómo provocan las bebidas azucaradas y las frituras ultraprocesadas la resistencia a la insulina y la diabetes infantil?',
      '¿Qué podemos comprar en el tianguis o mercado local por el mismo dinero que gastamos en una bolsa de papas fritas y un refresco?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Desafío "La Báscula del Azúcar Oculto": El docente coloca frente al grupo una botella de néctar comercial de 500 ml, una bolsa de galletas rellenas y un refresco, al lado de montoncitos de cucharadas de azúcar real que contienen (ej. 14 cucharadas para el refresco).
2. Pregunta detonadora: "¿Si supiéramos que estamos comiendo 14 cucharadas de azúcar en 5 minutos, nos la comeríamos? ¿Por qué la industria oculta estos ingredientes con saborizantes y colorantes?".
3. Activación de conocimientos sobre el Plato del Bien Comer y la Jarra del Buen Beber.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Auditoría de Desayunos Escolares en Equipos:
   • Los alumnos analizan lo que desayunaron durante los últimos 3 días clasificando en 4 cuadrantes: Alimentos Frescos, Mínimamente Procesados, Procesados y Ultraprocesados.
   • Identifican carencias de fibra, micronutrientes y exceso de sodio y grasas trans.
2. Diseño del Menú de la Milpa Saludable y Económico:
   • Diseñan un menú escolar semanal completo (Desayuno, Colación y Comida) utilizando ingredientes de la región a bajo costo (tlacoyos de frijol con nopales, agua fresca de limón con chía, fruta de temporada con chile piquín casero).
3. Elaboración del Decálogo de Inocuidad e Higiene en la Cocina Familiar.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Presentación de Menús Saludables por equipos en el "Restaurante de la Salud Escolar".
2. Metacognición: "¿Qué alimento chatarra puedo eliminar voluntariamente de mi dieta a partir de hoy?".
3. Entrega de evidencia: Menú semanal equilibrado con tabla de costos y beneficios nutrimentales.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Dominio de las Características de la Dieta Correcta (Sobresaliente [3.5 pts]: Diseña menús que cumplen al 100% con los 5 criterios de la dieta correcta y la Jarra del Buen Beber | Satisfactorio [2.5 pts]: Menú balanceado con detalles menores | En Proceso [1.5 pts]: Incluye alimentos ultraprocesados o carece de variedad).
• Criterio 2 - Análisis Crítico de Riesgos a la Salud (Sobresaliente [3.5 pts]: Argumenta con solvencia la relación entre ultraprocesados, diabetes, hipertensión y caries | Satisfactorio [2.5 pts]: Reconoce que la chatarra daña la salud | En Proceso [1.5 pts]: Desconoce el impacto metabólico de los azúcares).
• Criterio 3 - Rescate de Alimentos Locales y Economía Familiar (Sobresaliente [3 pts]: Propone ingredientes de temporada accesibles basados en la milpa | Satisfactorio [2 pts]: Propone ingredientes comunes | En Proceso [1 pt]: Opciones costosas o inaccesibles).
• Instrumento: Rúbrica de educación nutricional y salud preventiva.`,
    materiales: `• Empaques con sellos de advertencia NOM-051.
• Guías impresas del Plato del Bien Comer y la Dieta de la Milpa (Secretaría de Salud).
• Báscula gramera y bolsas con sal y azúcar para demostración.`,
    evidenciaEntregable: `Guía Menú Semanal Ilustrado "La Cocina de la Milpa: Saludable, Rica y Económica".`
  },
  {
    id: 'fase5-sci-15',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Ciencias Naturales',
    materiaFolder: 'Ciencias_Naturales',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 15,
    temaTitulo: 'Propiedades de los materiales: dureza, flexibilidad, permeabilidad y caracterización de gases',
    tituloProyecto: 'Laboratorio de Materia: Dureza, Flexibilidad y Permeabilidad en la Vida Cotidiana',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 5 (5º Primaria) - Experimenta con diversos materiales las propiedades de dureza -resistencia que tiene al rayado y el corte en su superficie-, flexibilidad -cambio de forma al doblarse sin romperse- y permeabilidad -paso de un líquido a través de él sin que se altere su composición-. Relaciona las propiedades de dureza, flexibilidad y permeabilidad de los materiales con su uso, para la satisfacción de algunas necesidades; toma decisiones sobre cuál es el más adecuado y de las consecuencias de su uso excesivo para el medio ambiente. Diseña y construye objetos con base en las propiedades de dureza, flexibilidad y permeabilidad de algunos materiales (vidrio, papel, cartón, plástico, unicel o metales).',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué los impermeables se fabrican de plástico y no de tela de algodón, mientras los zapatos deportivos necesitan ser flexibles y transpirables?',
      '¿Cuál es la diferencia física entre que un material sea "duro" (difícil de rayar) vs que sea "tenaz" (difícil de romper)?',
      '¿Por qué el uso excesivo de plásticos y unicel desechables tarda cientos de años en degradarse contaminando los océanos?',
      '¿Cómo influye la permeabilidad del suelo en la recarga de los mantos acuíferos subterráneos de nuestra ciudad?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Desafío "El Material Misterioso": El docente presenta 4 objetos (un pedazo de madera, una lámina de foami, un trozo de vidrio templado y una bolsa de tela) y pide a un alumno vendado que intente rayarlos con una moneda o doblarlos.
2. Pregunta detonadora: "¿Qué propiedad hace que cada uno sirva para un propósito diferente?".
3. Definición rigurosa de Dureza (Escala de Mohs simple), Flexibilidad y Permeabilidad.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Circuito de 3 Estaciones de Experimentación en Equipos de 4:
   • Estación 1 (Test de Dureza al Rayado): Rayar muestras de madera, gis, metal, plástico y vidrio con una uña, una moneda de cobre y un clavo de hierro.
   • Estación 2 (Test de Flexibilidad y Elasticidad): Medir cuántos grados se dobla una regla de madera, una de plástico y una de metal antes de deformarse o romperse.
   • Estación 3 (Test de Permeabilidad al Agua): Verter 20 ml de agua sobre papel filtro, tela de algodón, plástico de bolsa y unicel, midiendo el volumen filtrado en probetas.
2. Registro de Datos en Matriz de Selección de Materiales:
   • Diseñan un contenedor ecológico para alimentos seleccionando el material óptimo considerando su impacto ambiental.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Puesta en común de resultados de laboratorio y discusión sobre la crisis de microplásticos.
2. Metacognición en bitácora: "¿Qué material de un solo uso puedo sustituir en mi casa por uno reutilizable?".
3. Entrega de evidencia: Tabla de propiedades experimentales y justificación del contenedor ecológico.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Experimentación y Medición de Propiedades (Sobresaliente [3.5 pts]: Aplica pruebas de dureza, flexibilidad y permeabilidad con rigor metodológico y control de variables | Satisfactorio [2.5 pts]: Realiza las pruebas con registro básico | En Proceso [1.5 pts]: Realiza pruebas sin seguir el método).
• Criterio 2 - Relación Propiedad-Uso y Medio Ambiente (Sobresaliente [3.5 pts]: Justifica la selección de materiales según su función y propone alternativas biodegradables | Satisfactorio [2.5 pts]: Relaciona uso y propiedad | En Proceso [1.5 pts]: No fundamenta la elección del material).
• Criterio 3 - Seguridad y Manejo en el Laboratorio (Sobresaliente [3 pts]: Maneja materiales con pulcritud, cuidado y orden en equipo | Satisfactorio [2 pts]: Cumple normas básicas | En Proceso [1 pt]: Desorden en mesas).
• Instrumento: Rúbrica de laboratorio de física y química de materiales.`,
    materiales: `• Muestras de materiales: trozos de madera, plástico, unicel, cartón, tela de algodón, vidrio, esponja y metal.
• Monedas, clavos, reglas graduadas, embudos, probetas y agua con colorante.
• Formato de bitácora de laboratorio.`,
    evidenciaEntregable: `Reporte de Práctica Experimental "Matriz de Propiedades Mecánicas de los Materiales y Diseño de Empaque Sustentable".`
  },
  {
    id: 'fase5-sci-16',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Ciencias Naturales',
    materiaFolder: 'Ciencias_Naturales',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 16,
    temaTitulo: 'Sistema inmunológico, vacunas y prevención de enfermedades transmisibles',
    tituloProyecto: 'Escudo Inmunológico: La Ciencia de los Glóbulos Blancos, las Vacunas y la Cartilla Nacional',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 5 (6º Primaria) - Explica la participación del sistema inmunológico en la defensa y protección del cuerpo humano ante infecciones y enfermedades, algunas de las células y órganos que lo conforman, sin profundizar en características y funciones específicas. Describe los beneficios y practica acciones para fortalecer y cuidar el sistema inmunológico: vacunación, higiene, alimentación saludable, consumo de agua simple potable, descanso, actividades físicas y recreativas. Argumenta la importancia de las vacunas como aportes científicos y tecnológicos para prevenir enfermedades transmisibles y de la Cartilla Nacional de Salud para dar seguimiento a su estado de salud, así como de prácticas culturales para prevenirlas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo sabe nuestro cuerpo cuándo ha entrado un virus o una bacteria dañina y qué ejército de células sale a combatirlo?',
      '¿Por qué las vacunas entrenan a nuestra memoria inmunológica mediante virus atenuados o fragmentos de proteínas para que no nos enfermemos de gravedad?',
      '¿Qué enfermedades mortales del pasado (como la viruela y la poliomielitis) han sido erradicadas o controladas gracias a las campañas de vacunación obligatorias?',
      '¿Por qué el descanso nocturno de 8 horas y la alimentación rica en vitaminas C y D son indispensables para que los glóbulos blancos funcionen al 100%?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Proyección de Micrografía Electrónica: El docente muestra un video en alta definición de un glóbulo blanco (macrófago) persiguiendo y fagocitando a una bacteria en el torrente sanguíneo.
2. Pregunta detonadora: "¿Si los microbios están en el aire, en las mesas y en la piel... por qué no estamos enfermos todo el tiempo?".
3. Definición de Inmunidad Natural vs Inmunidad Adquirida por Vacunación.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Simulación "Batalla Inmunológica" en Equipos:
   • Modelan con plastilina o recortables los 3 niveles de defensa:
     - Barreras primarias (piel, lágrimas, moco, ácido gástrico).
     - Respuesta innata (glóbulos blancos que fagocitan).
     - Respuesta adaptativa (linfocitos B y T produciendo anticuerpos específicos como llaves y cerraduras).
2. Auditoría de la Cartilla Nacional de Salud:
   • Analizan un esquema del calendario nacional de vacunación en México (BCG, Hepatitis B, Hexavalente, Triple Viral SRP, VPH).
   • Explican qué es la "Inmunidad de Rebaño" y por qué vacunarse protege a los bebés y ancianos vulnerables.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Desmentir mitos falsos sobre las vacunas con argumentos científicos.
2. Metacognición en libreta: "¿Por qué tener mi Cartilla de Vacunación al corriente es un derecho y un deber social con mi comunidad?".
3. Entrega de evidencia: Esquema del Escudo Inmunológico y decálogo de hábitos de protección celular.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión del Sistema Inmunológico y Anticuerpos (Sobresaliente [3.5 pts]: Explica con claridad la función de glóbulos blancos, antígenos, anticuerpos y memoria inmunológica | Satisfactorio [2.5 pts]: Describe la función defensiva general | En Proceso [1.5 pts]: Confunde virus con glóbulos blancos).
• Criterio 2 - Argumentación sobre Vacunación y Salud Pública (Sobresaliente [3.5 pts]: Argumenta la importancia histórica y científica de las vacunas y la inmunidad colectiva | Satisfactorio [2.5 pts]: Reconoce que las vacunas previenen enfermedades | En Proceso [1.5 pts]: Posturas desinformadas sin sustento).
• Criterio 3 - Hábitos de Autocuidado y Cartilla Nacional (Sobresaliente [3 pts]: Propone un plan integral de sueño, higiene, hidratación y seguimiento de vacunas | Satisfactorio [2 pts]: Plan básico | En Proceso [1 pt]: Omite hábitos indispensables).
• Instrumento: Rúbrica de salud comunitaria e inmunología básica.`,
    materiales: `• Esquema impreso de la Cartilla Nacional de Salud de México.
• Plastilina de colores para modelar antígenos y anticuerpos.
• Infografías de la OMS sobre la historia de las vacunas.`,
    evidenciaEntregable: `Infografía Científica "Mi Escudo Inmunológico: Cómo los Glóbulos Blancos y las Vacunas Salvan Vidas".`
  },
  {
    id: 'fase5-sci-17',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Ciencias Naturales',
    materiaFolder: 'Ciencias_Naturales',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 17,
    temaTitulo: 'Biodiversidad, problemas medioambientales y efecto invernadero',
    tituloProyecto: 'Guardianes del Clima: Efecto Invernadero, Huella de Carbono y Restauración Ecológica',
    ejes: ['Pensamiento Crítico', 'Vida Saludable', 'Interculturalidad Crítica'],
    pda: 'Fase 5 (6º Primaria) - Comprende que el medio ambiente es el conjunto de componentes naturales en interacción con los componentes sociales. Analiza situaciones que se relacionan con problemas medio ambientales de la comunidad y el impacto que tienen en la salud ambiental. Comprende que el efecto invernadero es un proceso natural que favorece la vida en el planeta; establece relaciones entre su alteración, la contaminación del aire y el cambio climático, así como las consecuencias en el medio ambiente y la salud. Indaga y propone acciones orientadas a promover el consumo responsable en la escuela, familia y comunidad para favorecer estilos de vida sustentables.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué sin el Efecto Invernadero Natural la Tierra estaría congelada a -18 °C... pero con el exceso de gases industriales estamos calentando peligrosamente el planeta?',
      '¿Cuáles son los principales Gases de Efecto Invernadero (GEI: Dióxido de Carbono $CO_2$, Metano $CH_4$, Vapor de agua) y qué actividades humanas los emiten?',
      '¿Cómo calculamos nuestra "Huella de Carbono" personal y qué acciones escolares reducen directamente las emisiones?',
      '¿Qué proyectos comunitarios de reforestación con árboles endémicos ayudan a capturar toneladas de carbono atmosférico?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Experimento del Invernadero en Miniatura: Dos termómetros bajo una lámpara potente; uno dentro de un frasco de vidrio cerrado (simulando la atmósfera con GEI) y otro al aire libre. En 5 minutos se comprueba que el frasco cerrado alcanza 6 °C más.
2. Pregunta detonadora: "¿Cómo actúan los gases contaminantes de fábricas y automóviles igual que el cristal de este frasco calentando el planeta?".
3. Distinción conceptual: Efecto Invernadero Natural vs Calentamiento Global Antropogénico.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Cálculo de Huella de Carbono Escolar en Tríos:
   • Utilizan una calculadora de carbono simplificada para estimar los kilogramos de $CO_2$ generados por:
     - Transporte en automóvil vs bicicleta/caminata.
     - Consumo de carne roja vs legumbres y verduras.
     - Desperdicio de electricidad por aparatos en modo de espera (consumo vampiro).
2. Diseño del Plan de Acción Climática Escolar "ISkool Verde":
   • Proponen 3 metas medibles: 1) Huerto escolar polinizador, 2) Apagado de luces no utilizadas, 3) Reducción del uso de plásticos desechables en la cooperativa.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Cada equipo presenta su compromiso de reducción de emisiones de $CO_2$.
2. Metacognición: "¿Qué hábito de mi vida cotidiana puedo modificar para ser un guardián activo del clima?".
3. Entrega de evidencia: Hoja de cálculo de huella de carbono y cartel de acción climática escolar.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión Científica del Efecto Invernadero y GEI (Sobresaliente [3.5 pts]: Explica el mecanismo de radiación infrarroja, gases atrapadores y cambio climático con precisión conceptual | Satisfactorio [2.5 pts]: Explica el efecto invernadero con nociones generales | En Proceso [1.5 pts]: Confunde capa de ozono con efecto invernadero).
• Criterio 2 - Estimación de Huella de Carbono (Sobresaliente [3.5 pts]: Calcula datos de consumo energético y propone acciones de mitigación cuantificables | Satisfactorio [2.5 pts]: Calcula datos básicos | En Proceso [1.5 pts]: Dificultad para relacionar actividades humanas con emisiones).
• Criterio 3 - Propuestas Comunitarias Sustentables (Sobresaliente [3 pts]: Diseña proyectos viables de reforestación, ahorro energético y consumo responsable | Satisfactorio [2 pts]: Propuestas comunes | En Proceso [1 pt]: Sin propuestas viables).
• Instrumento: Rúbrica de educación ambiental y mitigación climática.`,
    materiales: `• Dos frascos de vidrio grandes, dos termómetros de laboratorio, lámpara incandescente.
• Calculadora de huella ecológica escolar impresa.
• Cartulinas y plumones reciclados.`,
    evidenciaEntregable: `Plan de Acción Climática Escolar "Huella Cero" con diagnóstico de emisiones y compromisos sustentables.`
  },
  {
    id: 'fase5-sci-18',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Ciencias Naturales',
    materiaFolder: 'Ciencias_Naturales',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 18,
    temaTitulo: 'Transformaciones de la energía eléctrica y circuitos térmicos',
    tituloProyecto: 'Energía en Movimiento: Circuitos Eléctricos, Cargas y Conductores en la Vida Tecnológica',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 5 (6º Primaria) - Comprende que la electricidad es una forma de energía que se caracteriza por el movimiento o acumulación de cargas eléctricas, y experimenta con las propiedades de conducción o aislamiento eléctrico, para identificar algunos materiales, como los metales que poseen conductividad eléctrica. Describe que hay dos tipos de cargas eléctricas, positiva (+) y negativa (-), a partir de las cuales se determinan las interacciones entre los objetos; cuando dos objetos cargados eléctricamente se atraen, significa que sus cargas eléctricas son diferentes, y si se repelen significa que sus cargas son iguales. Reconoce las propiedades que tienen los materiales para conducir la corriente eléctrica (conductores) y aquellos que no la conducen (aislantes), y los aplica en un circuito eléctrico; experimenta y describe interacciones de atracción y repulsión eléctrica.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué cuando frotamos un globo en el cabello atrae pedacitos de papel como si fuera un imán invisible?',
      '¿Qué diferencia existe entre la electricidad estática (cargas acumuladas) y la corriente eléctrica (flujo constante de electrones)?',
      '¿Por qué los cables eléctricos tienen alambre de cobre por dentro y recubrimiento de plástico por fuera?',
      '¿Cómo construimos un interruptor casero para encender y apagar un foco LED en un circuito simple en serie?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Demostración de Electrostática: El docente frota una regla de acrílico con un trozo de lana y desvía un chorrito fino de agua que cae de una llave sin tocarlo.
2. Pregunta detonadora: "¿Por qué el agua se curva hacia la regla? ¿Qué fuerza invisible está actuando entre las cargas positivas y negativas?".
3. Ley fundamental de cargas: Cargas iguales se repelen ($++$ / $--$), cargas opuestas se atraen ($+-$).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Laboratorio de Circuitos y Conductividad en Equipos de 3:
   • Cada equipo recibe un kit básico: 1 pila de 9V o AA, 2 cables con caimanes, 1 foco LED o zumbador y un clip metálico.
   • Construyen un circuito cerrado verificando que el LED encienda.
   • Taller del Probador de Conductores y Aislantes: Prueban 8 materiales en el circuito abierto (moneda de cobre, clavo de hierro, goma de borrar, grafito de lápiz, trozo de madera, plástico, papel aluminio, agua con sal).
   • Registran en tabla: Conductor de electricidad vs Aislante eléctrico.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Explicación de por qué los metales y el grafito conducen electricidad gracias a sus electrones libres.
2. Metacognición: "¿Qué precauciones de seguridad eléctrica debemos tener en casa con enchufes y agua?".
3. Entrega de evidencia: Tabla de conductividad y diagrama simbólico del circuito eléctrico.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión de Cargas Eléctricas y Electrostática (Sobresaliente [3.5 pts]: Explica con rigor la atracción/repulsión de cargas y el flujo de electrones | Satisfactorio [2.5 pts]: Comprende la polaridad básica | En Proceso [1.5 pts]: Dificultad para explicar el fenómeno estático).
• Criterio 2 - Construcción de Circuitos y Clasificación de Materiales (Sobresaliente [3.5 pts]: Arma circuitos funcionales y clasifica conductores y aislantes con precisión experimental | Satisfactorio [2.5 pts]: Construye el circuito con apoyo | En Proceso [1.5 pts]: No logra cerrar el circuito).
• Criterio 3 - Normas de Seguridad y Uso Responsable (Sobresaliente [3 pts]: Argumenta medidas de prevención contra descargas eléctricas y ahorro de energía | Satisfactorio [2 pts]: Medidas básicas | En Proceso [1 pt]: Descuido de seguridad).
• Instrumento: Rúbrica de laboratorio de física y circuitos eléctricos.`,
    materiales: `• Pilas de 1.5V (AA) o 9V, portalámparas pequeños o LEDs, cables con pinzas de caimán, clips.
• Muestras de prueba: grafito, plástico, cobre, aluminio, madera, agua con sal, goma.
• Globos y paños de lana para pruebas electrostáticas.`,
    evidenciaEntregable: `Bitácora de Laboratorio Eléctrico "Circuito Probador de Conductividad y Ley de Cargas".`
  },

  // =========================================================================
  // 📐 ÁREA 4: SABERES Y PENSAMIENTO CIENTÍFICO - MATEMÁTICAS (6)
  // =========================================================================
  {
    id: 'fase5-mat-19',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Matemáticas',
    materiaFolder: 'Matematicas',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 19,
    temaTitulo: 'Estudio de los números: regularidades hasta 9 cifras, decimales y fracciones equivalentes',
    tituloProyecto: 'El Imperio de los Números: De las Millonésimas a las Fracciones Equivalentes',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 5 (5º Primaria) - A través de situaciones vinculadas a diferentes contextos ordena, lee, escribe e identifica regularidades en números naturales de hasta nueve cifras. Lee, escribe y ordena números decimales hasta diezmilésimos en notación decimal y letra, y los interpreta en diferentes contextos. Resuelve situaciones problemáticas que implican comparar y ordenar fracciones a partir de construir fracciones equivalentes al multiplicar o dividir al numerador y al denominador por un mismo número. Reconoce, interpreta y utiliza las fracciones 1/2, 1/4, 3/4, 1/5 y 1/8 expresados en notación decimal y viceversa en diferentes contextos.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo se lee y escribe la población total de México (129,000,000) o el presupuesto nacional usando el valor posicional de hasta 9 cifras?',
      '¿Por qué el número decimal $0.75$ es exactamente equivalente a la fracción $3/4$, y $0.125$ equivale a $1/8$?',
      '¿Cómo transformamos una fracción en otra equivalente multiplicando el numerador y denominador por el mismo factor?',
      '¿Qué número es mayor: $0.45$ o $0.405$, y cómo nos ayuda la tabla de órdenes decimales (décimos, centésimos, milésimos, diezmilésimos)?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Desafío "Cifras Gigantes": El docente proyecta datos de distancias astronómicas y poblaciones mundiales (ej. 384,400 km a la Luna, 126,014,024 habitantes en México).
2. Pregunta detonadora: "¿Cómo agrupamos de 3 en 3 cifras para leer millones, miles y unidades sin equivocarnos?".
3. Tabla Posicional de Valor Absoluto y Relativo en el pizarrón.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Recta Numérica Decimal y Fraccionaria en Parejas:
   • Gradúan una recta de 0 a 1 en papel milimétrico.
   • Ubican pares equivalentes: $1/2 = 0.5$, $1/4 = 0.25$, $3/4 = 0.75$, $1/5 = 0.2$, $1/8 = 0.125$.
2. Desafíos de Fracciones Equivalentes por Amplificación y Simplificación:
   • Resuelven problemas de reparto de tierras comunales y recetas de cocina: $\frac{2}{3} = \frac{4}{6} = \frac{8}{12}$.
   • Ordenan de menor a mayor conjuntos de 5 números mixtos (fracciones y decimales hasta diezmilésimos).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Batalla Relámpago de Equivalencias en pizarrón por parejas.
2. Metacognición: "¿Por qué multiplicar el de arriba y el de abajo por el mismo número no altera el valor de la fracción?".
3. Entrega de evidencia: Hoja de desafíos de valor posicional y equivalencias.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Lectura y Escritura de Números Grandes y Decimales (Sobresaliente [3.5 pts]: Lee, escribe y ordena números hasta 9 cifras y decimales hasta diezmilésimos sin error | Satisfactorio [2.5 pts]: Domina hasta 6 cifras y milésimos | En Proceso [1.5 pts]: Confunde órdenes posicionales).
• Criterio 2 - Construcción y Uso de Fracciones Equivalentes (Sobresaliente [3.5 pts]: Convierte y compara fracciones con amplificación/simplificación y notación decimal con fluidez | Satisfactorio [2.5 pts]: Resuelve equivalencias básicas (1/2, 1/4) | En Proceso [1.5 pts]: Dificultad para encontrar denominadores comunes).
• Criterio 3 - Resolución de Problemas Contextualizados (Sobresaliente [3 pts]: Aplica números grandes y fracciones a problemas de la vida diaria y economía | Satisfactorio [2 pts]: Resuelve con apoyo | En Proceso [1 pt]: No plantea la operación).
• Instrumento: Rúbrica analítica de sentido numérico y pensamiento algebraico.`,
    materiales: `• Tiras de papel milimétrico y reglas graduadas.
• Tarjetas de dominó de fracciones y números decimales equivalentes.
• Ábaco posicional o tabla plastificada de valor de posición.`,
    evidenciaEntregable: `Bitácora de Retos "El Ábaco de los Millones y la Recta de Fracciones Equivalentes".`
  },
  {
    id: 'fase5-mat-20',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Matemáticas',
    materiaFolder: 'Matematicas',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 20,
    temaTitulo: 'Suma y resta de fracciones con diferente denominador y números decimales',
    tituloProyecto: 'El Gran Chef Matemático: Operaciones con Fracciones y Decimales en la Cocina Escolar',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 5 (5º Primaria) - Propone y resuelve situaciones problemáticas que implican sumas y restas con números decimales utilizando el algoritmo convencional y fracciones con diferentes denominadores. Utiliza, explica y comprueba sus estrategias para calcular mentalmente sumas y restas de dos números múltiplos de 100 y dos fracciones cuyos denominadores son múltiplos.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué NO podemos sumar directamente los numeradores de $1/2 + 2/3$ sin antes convertirlas a un denominador común?',
      '¿Cómo calculamos la cantidad total de ingredientes si una receta pide $3/4$ kg de harina, $1/2$ kg de azúcar y $0.250$ kg de mantequilla?',
      '¿Por qué al sumar o restar números decimales es una regla sagrada alinear verticalmente el punto decimal?',
      '¿Qué trucos de cálculo mental nos permiten resolver $1,500 - 800$ o $1/2 - 1/4$ en menos de 5 segundos?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dilema del Restaurante: El docente plantea: "Un cocinero tiene $1/2$ litro de leche en una jarra y le agrega $1/3$ de litro de otra jarra. Si dice que tiene $2/5$ de litro en total... ¿está en lo correcto o cometió un error grave?".
2. Pregunta detonadora: "¿Por qué $2/5$ es menor que $1/2$? ¿Cómo encontramos un tamaño de rebanada común (denominador) para poder sumarlas?".
3. Representación visual con tiras de fracciones de colores.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Algoritmos de Fracciones y Decimales en Parejas:
   • Método del Mínimo Común Múltiplo (MCM) y Productos Cruzados:
     $$\frac{1}{2} + \frac{2}{3} = \frac{3 + 4}{6} = \frac{7}{6} = 1\frac{1}{6}$$
   • Resolución de problemas de compras en el mercado con números decimales con pesos y centavos ($145.50 + 89.75 - 50.00$).
2. Laboratorio de Cálculo Mental Rápido:
   • Rondas de cálculo con fracciones de denominadores múltiplos ($1/2 + 1/4 = 3/4$, $3/4 - 1/8 = 5/8$).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Explicación en el pizarrón de la comprobación mediante operaciones inversas (Restar para comprobar la suma).
2. Metacognición: "¿Qué método me resulta más fácil para encontrar el común denominador?".
3. Entrega de evidencia: Menú de recetas resueltas con algoritmos formales y comprobaciones.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Dominio de Suma y Resta de Fracciones con Diferente Denominador (Sobresaliente [3.5 pts]: Convierte a común denominador y simplifica resultados a fracciones mixtas con precisión | Satisfactorio [2.5 pts]: Aplica el algoritmo pero omite simplificar | En Proceso [1.5 pts]: Suma numeradores y denominadores directamente).
• Criterio 2 - Algoritmo y Alineación de Decimales (Sobresaliente [3.5 pts]: Alinea el punto decimal y opera con precisión de centésimos y milésimos | Satisfactorio [2.5 pts]: Resuelve con errores menores | En Proceso [1.5 pts]: Desalinea el punto decimal).
• Criterio 3 - Estrategias de Cálculo Mental y Comprobación (Sobresaliente [3 pts]: Aplica estrategias mentales ágiles y comprueba con operaciones inversas | Satisfactorio [2 pts]: Comprueba con apoyo | En Proceso [1 pt]: No comprueba).
• Instrumento: Rúbrica de operaciones fraccionarias y cálculo numérico.`,
    materiales: `• Tiras de fracciones didácticas fraccionables.
• Tarjetas de recetas de cocina con medidas en fracciones y decimales.
• Hojas de trabajo impresas "El Recetario Fraccionario".`,
    evidenciaEntregable: `Problemario Resuelto "El Chef Matemático: Balance de Ingredientes en Fracciones y Decimales".`
  },
  {
    id: 'fase5-mat-21',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Matemáticas',
    materiaFolder: 'Matematicas',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 21,
    temaTitulo: 'Cuerpos geométricos (prismas y pirámides) y cálculo de perímetro y área',
    tituloProyecto: 'Arquitectos del Futuro: Prismas, Pirámides y Fórmulas de Área y Perímetro',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 5 (5º Primaria) - Reconoce y describe semejanzas y diferencias entre un prisma y una pirámide; propone desarrollos planos para construir prismas rectos cuadrangulares o rectangulares. Distingue unidades lineales de cuadráticas, al calcular, con el apoyo de retículas cuadriculadas, el perímetro y área de diferentes polígonos para reconocer que existen: figuras diferentes con el mismo perímetro y diferente área; figuras diferentes con la misma área y diferente perímetro; figuras diferentes con el mismo perímetro y con la misma área. Construye y usa fórmulas para calcular el área de rectángulos, romboides y triángulos; utiliza unidades convencionales (m² y cm²) para expresar sus resultados.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia fundamental entre un prisma (dos bases iguales y caras rectangulares) y una pirámide (una sola base y caras triangulares que convergen en un vértice)?',
      '¿Por qué dos figuras pueden tener exactamente el mismo perímetro (ej. 20 cm) pero encerrar áreas totalmente diferentes?',
      '¿Por qué la fórmula del área del triángulo es $\\text{Área} = \\frac{b \\times h}{2}$ (la mitad exacta de un rectángulo o romboide)?',
      '¿Cómo trazamos el desarrollo plano de una caja en cartón para que al armarla cierre a la perfección sin encimarse?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Exploración Táctil de Cuerpos 3D: El docente reparte modelos de prismas triangulares, cuadrangulares y pirámides de madera o plástico.
2. Pregunta detonadora: "¿Cuántas caras, aristas y vértices tiene cada cuerpo y cómo se verían si los desdoblamos sobre la mesa?".
3. Definición en pizarrón: Cértices, aristas, bases y caras laterales.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Geometría Plana y Espacial en Equipos:
   • Estación A (Desarrollos Planos): Trazan con regla y compás el desarrollo plano de un prisma rectangular con pestañas de 5 mm para ensamblar.
   • Estación B (El Enigma del Perímetro y Área en Cuadrícula):
     - Dibujan en retículas cuadriculadas 3 figuras distintas con un perímetro fijo de 16 cm (un cuadrado de $4 \\times 4 = 16\\text{ cm}^2$, un rectángulo de $6 \\times 2 = 12\\text{ cm}^2$ y uno de $7 \\times 1 = 7\\text{ cm}^2$).
     - Comprueban que el cuadrado es la figura cuadrilátera que maximiza el área.
2. Deducción de Fórmulas de Área:
   • Cortan un romboide y demuestran que al reacomodar un triángulo lateral se convierte en un rectángulo ($A = b \\times h$).
   • Cortan un rectángulo por la diagonal para deducir el área del triángulo ($A = \\frac{b \\times h}{2}$).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Galería de Maquetas: Ensamble y exhibición de los prismas construidos.
2. Metacognición: "¿Por qué las unidades lineales ($cm$) miden contornos y las cuadráticas ($cm^2$) miden superficies?".
3. Entrega de evidencia: Prisma armado y lámina de deducción de fórmulas de área en cuadrícula.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Caracterización y Desarrollo Plano de Cuerpos (Sobresaliente [3.5 pts]: Traza y arma desarrollos planos de prismas con precisión geométrica y pestañas correctas | Satisfactorio [2.5 pts]: Arma el cuerpo con detalles menores de trazo | En Proceso [1.5 pts]: El desarrollo plano no cierra correctamente).
• Criterio 2 - Distinción de Perímetro vs Área y Deducción de Fórmulas (Sobresaliente [3.5 pts]: Distingue unidades $cm$ vs $cm^2$ y deduce fórmulas de triángulos y romboides con rigor | Satisfactorio [2.5 pts]: Aplica fórmulas pero con dudas en unidades | En Proceso [1.5 pts]: Confunde perímetro con área).
• Criterio 3 - Precisión en el Trazo con Instrumentos Geométricos (Sobresaliente [3 pts]: Uso impecable de regla, escuadra y compás con líneas limpias | Satisfactorio [2 pts]: Trazo adecuado | En Proceso [1 pt]: Trazo descuidado).
• Instrumento: Rúbrica de geometría y modelado espacial.`,
    materiales: `• Cartulinas brístol, tijeras, pegamento blanco, reglas graduadas y escuadras.
• Hojas cuadriculadas de 1 cm².
• Cuerpos geométricos de madera para manipulación.`,
    evidenciaEntregable: `Maqueta de Prisma Rectangular con Desarrollo Plano y Lámina Geométrica de Deducción de Áreas.`
  },
  {
    id: 'fase5-mat-22',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Matemáticas',
    materiaFolder: 'Matematicas',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 22,
    temaTitulo: 'Multiplicación y división de fracciones y números decimales',
    tituloProyecto: 'Reparto Proporcional y División Fraccionaria en la Vida Económica Comunitaria',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 5 (6º Primaria) - Resuelve situaciones problemáticas vinculadas a diferentes contextos que implican multiplicar números fraccionarios y números decimales, con un número natural como multiplicador. Resuelve situaciones problemáticas vinculadas a diferentes contextos que implican dividir números decimales entre naturales. Resuelve situaciones problemáticas vinculadas a diferentes contextos que implican dividir números fraccionarios entre números naturales.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué significa en la vida real dividir $3/4$ de kilogramo de queso entre 3 personas en partes iguales?',
      '¿Por qué al dividir una fracción entre un número natural ($3/4 \\div 3 = 1/4$ o $2/5 \\div 4 = 2/20 = 1/10$) el resultado es una porción más pequeña?',
      '¿Cómo calculamos el costo unitario si un paquete de 6 libretas cuesta $187.50 pesos en la papelería?',
      '¿Qué ocurre con el punto decimal en la casita de división cuando dividimos un decimal entre un entero?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Desafío "La Pizza Familiar": El docente dibuja un círculo dividido en 4 partes y sombrea 3 ($3/4$). Pregunta: "Si nos quedan estos $3/4$ de pizza y debemos repartirlos entre 6 amigos por igual... ¿qué fracción de la pizza completa le toca a cada uno?".
2. Pregunta detonadora: "¿Es lo mismo multiplicar por $1/2$ que dividir entre 2?".
3. Demostración gráfica: Partir cada cuarto a la mitad para obtener octavos.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Modelado y Algoritmo de División en Parejas:
   • División de fracciones entre enteros:
     $$\frac{a}{b} \div n = \frac{a}{b \times n}$$
     Ejemplo: $\frac{4}{5} \div 2 = \frac{4}{10} = \frac{2}{5}$ de litro de pintura por pared.
   • División de números decimales entre naturales:
     - Reparto de utilidades de una cooperativa escolar: $\$4,567.80 \div 12$ alumnos.
     - Práctica de subir el punto decimal exactamente alineado en el cociente.
2. Resolución de Problemario Contextualizado "La Cooperativa Escolar".`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Comprobación de divisiones mediante la multiplicación inversa.
2. Metacognición: "¿Por qué dominar la división decimal es indispensable para saber si nos están cobrando lo justo en el supermercado?".
3. Entrega de evidencia: Problemario de división fraccionaria y decimal comprobado.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - División de Fracciones entre Naturales (Sobresaliente [3.5 pts]: Modela gráficamente y resuelve divisiones fraccionarias simplificando resultados | Satisfactorio [2.5 pts]: Aplica el algoritmo con errores menores | En Proceso [1.5 pts]: Invierte operaciones sin sentido).
• Criterio 2 - División de Decimales entre Naturales (Sobresaliente [3.5 pts]: Resuelve divisiones con punto decimal en el dividendo con total precisión | Satisfactorio [2.5 pts]: Ubica el punto con dudas menores | En Proceso [1.5 pts]: Omite el punto decimal en el cociente).
• Criterio 3 - Razonamiento en Problemas Reales (Sobresaliente [3 pts]: Interpreta el residuo y expresa la respuesta en unidades monetarias o de medida | Satisfactorio [2 pts]: Resuelve con apoyo | En Proceso [1 pt]: Solo anota números sin contexto).
• Instrumento: Rúbrica de operaciones aritméticas avanzadas.`,
    materiales: `• Hojas de problemas de la cooperativa escolar.
• Tiras fraccionarias circulares y lineales.
• Calculadora para verificación posterior de cocientes.`,
    evidenciaEntregable: `Problemario Resuelto "Finanzas de la Cooperativa Escolar: Repartos Fraccionarios y Cocientes Decimales".`
  },
  {
    id: 'fase5-mat-23',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Matemáticas',
    materiaFolder: 'Matematicas',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 23,
    temaTitulo: 'Relaciones de proporcionalidad, valor unitario y cálculo de porcentajes (50%, 25%, 10%, 1%)',
    tituloProyecto: 'Feria Comercial y Porcentajes: Descuentos, IVA y Razones Matemáticas en el Mercado',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 5 (6º Primaria) - A partir de situaciones problemáticas de proporcionalidad vinculadas a diferentes contextos, determina valores faltantes en las que en ocasiones se conoce el valor unitario y en otras no. Resuelve situaciones problemáticas vinculadas a diferentes contextos que implican comparar razones expresadas con dos números naturales y con una fracción. Utiliza, explica y comprueba sus estrategias para calcular mentalmente los porcentajes: 50%, 25%, 10% y 1%, de un número natural. Resuelve situaciones problemáticas vinculadas a diferentes contextos que implican calcular el tanto por ciento de una cantidad o el porcentaje que representa una cantidad de otra.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué significa que una tienda ofrezca el "50% de descuento más 10% adicional"? ¿Es lo mismo que el 60% directo?',
      '¿Por qué calcular el 10% de cualquier número solo requiere recorrer el punto decimal un lugar a la izquierda ($10\\% \\text{ de } 450 = 45$)?',
      '¿Cómo calculamos el 16% de IVA en las compras de productos y servicios?',
      '¿Cómo determinamos qué oferta conviene más: 3 paquetes de galletas por $45 pesos o 4 paquetes por $56 pesos usando el valor unitario?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Simulación "El Buen Fin Escolar": El docente muestra carteles con ofertas reales: "Tenis de $800 con 25% de descuento" y "Mochila de $500 con 50% de rebaja".
2. Pregunta detonadora: "¿Cuánto dinero nos ahorramos en cada producto y cuánto pagaremos en caja?".
3. Equivalencia de porcentajes clave:
   - $50\\% = 1/2 = 0.5$ (dividir entre 2)
   - $25\\% = 1/4 = 0.25$ (dividir entre 4)
   - $10\\% = 1/10 = 0.10$ (dividir entre 10)
   - $1\\% = 1/100 = 0.01$ (dividir entre 100).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Mercado Matemático en Equipos de 4:
   • Estación A (Estrategias de Cálculo Mental Rápido):
     - Para calcular el 15% de $600: $10\\% (60) + 5\\% (30) = 90$.
     - Para calcular el 26% de $800: $25\\% (200) + 1\\% (8) = 208$.
   • Estación B (Tablas de Proporcionalidad Directa y Valor Unitario):
     - Llenar tablas de rendimiento de combustible (km/litro), recetas a escala para 10, 50 y 100 personas y costos unitarios.
2. Resolución del Reto "El Mejor Comprador": Comparar 4 productos y justificar la compra más inteligente.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Ronda de Desafíos Relámpago de Porcentajes Mentales.
2. Metacognición: "¿Cómo me ayuda el cálculo de porcentajes a no ser engañado por publicidad falsa?".
3. Entrega de evidencia: Tabla de cálculo mental de porcentajes y análisis de ofertas comerciales.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Cálculo Mental y Estratégico de Porcentajes (Sobresaliente [3.5 pts]: Calcula mentalmente 50%, 25%, 10% y 1% y los combina con agilidad | Satisfactorio [2.5 pts]: Calcula con procedimientos escritos | En Proceso [1.5 pts]: Confunde porcentajes con números enteros).
• Criterio 2 - Determinación de Valor Unitario y Proporcionalidad (Sobresaliente [3.5 pts]: Encuentra valores faltantes en tablas de variación proporcional y compara razones | Satisfactorio [2.5 pts]: Resuelve con apoyo | En Proceso [1.5 pts]: No identifica el valor unitario).
• Criterio 3 - Aplicación a Finanzas del Consumidor Crítico (Sobresaliente [3 pts]: Aplica descuentos, IVA y compras razonadas con análisis crítico | Satisfactorio [2 pts]: Resuelve problemas estándar | En Proceso [1 pt]: Dificultad para interpretar problemas).
• Instrumento: Rúbrica de proporcionalidad y educación financiera.`,
    materiales: `• Folletos publicitarios y notas de compra reales.
• Tarjetas de cálculo mental de porcentajes.
• Hojas de tablas de proporcionalidad.`,
    evidenciaEntregable: `Guía del Consumidor Inteligente: Análisis de Ofertas, Cálculo de IVA y Descuentos con Porcentajes.`
  },
  {
    id: 'fase5-mat-24',
    campo: 'Saberes y Pensamiento Científico',
    campoTag: 'saberes_y_pensamiento_cientifico',
    materia: 'Matemáticas',
    materiaFolder: 'Matematicas',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 24,
    temaTitulo: 'Perímetro, área de figuras compuestas, volumen con cubos y valor de Pi',
    tituloProyecto: 'El Enigma de Pi y el Volumen Tridimensional: Geometría Avanzada y Conteo de Cubos',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 5 (6º Primaria) - Identifica y comprueba en diferentes objetos y dibujos con forma circular, la relación que existe entre la circunferencia y el diámetro (valor aproximado de $\\pi$). Utiliza instrumentos geométricos para trazar polígonos regulares. Resuelve situaciones problemáticas que implican calcular el perímetro y área de figuras compuestas por triángulos y cuadriláteros; utiliza unidades convencionales (m, cm, m² y cm²) para expresar sus resultados. Resuelve problemas que implican construir, estimar y comparar el volumen de cuerpos y prismas rectos rectangulares mediante el conteo de cubos, y reconoce que existen diferentes cuerpos con el mismo volumen.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué sin importar si medimos una moneda pequeña o la rueda gigante de una bicicleta, al dividir la circunferencia entre el diámetro SIEMPRE obtenemos aproximadamente $3.1416$ ($\pi$)?',
      '¿Cómo calculamos el área de una figura compuesta (como una casa con techo triangular y fachada rectangular o una piscina en forma de L)?',
      '¿Cuál es la diferencia física entre el área de la base ($cm^2$) y el volumen tridimensional de un prisma ($cm^3$)?',
      '¿Cuántos prismas rectangulares diferentes podemos construir que tengan exactamente un volumen de 24 cubos unitarios?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Taller Experimental de $\pi$: Cada alumno trae un objeto circular (tapa de frasco, vaso, plato). Con un estambre miden el contorno (circunferencia $C$) y con una regla miden el ancho pasando por el centro (diámetro $D$).
2. División experimental en la calculadora: $C \div D$.
3. Asombro grupal: Todos los resultados rondan $3.14$ a $3.15$. Presentación formal del número irracional Pi ($\pi \approx 3.1416$).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Descomposición de Figuras Compuestas en Equipos:
   • Descomponen planos arquitectónicos en triángulos, rectángulos y trapecios.
   • Suman las áreas parciales para obtener el área total ($A_{\text{total}} = A_1 + A_2 + A_3$).
2. Laboratorio de Conteo de Cubos y Volumen Tridimensional:
   • Con cubos de madera o plástico (centímetros cúbicos), construyen prismas rectangulares de $V = 24\text{ cm}^3$ en diferentes configuraciones:
     - Prisma A: $2 \times 3 \times 4\text{ cm}$
     - Prisma B: $1 \times 2 \times 12\text{ cm}$
     - Prisma C: $1 \times 1 \times 24\text{ cm}$
   • Deducen la fórmula del volumen: $\text{Volumen} = \text{Largo} \times \text{Ancho} \times \text{Alto} = \text{Área de la base} \times h$.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Comparación de prismas con igual volumen pero distinta área superficial.
2. Metacognición: "¿Por qué $\pi$ es una de las constantes matemáticas más importantes del universo?".
3. Entrega de evidencia: Reporte de aproximación experimental de $\pi$ y problemas de figuras compuestas y volumen.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Deducción Experimental de $\pi$ y Circunferencia (Sobresaliente [3.5 pts]: Demuestra la relación $C/D = \pi$ con mediciones rigurosas y aplica $P = \pi \times D$ | Satisfactorio [2.5 pts]: Calcula perímetros circulares con la fórmula | En Proceso [1.5 pts]: Confunde radio con diámetro).
• Criterio 2 - Área de Figuras Compuestas (Sobresaliente [3.5 pts]: Descompone figuras complejas y calcula áreas totales con unidades correctas ($m^2, cm^2$) | Satisfactorio [2.5 pts]: Resuelve con apoyo | En Proceso [1.5 pts]: Omite partes de la figura).
• Criterio 3 - Estimación y Cálculo de Volumen con Cubos (Sobresaliente [3 pts]: Construye y compara cuerpos tridimensionales deduciendo $V = A_b \times h$ en $cm^3$ | Satisfactorio [2 pts]: Cuenta cubos correctamente | En Proceso [1 pt]: Confunde volumen con área).
• Instrumento: Rúbrica de geometría analítica y cálculo tridimensional.`,
    materiales: `• Objetos circulares diversos, estambre, tijeras, reglas y calculadoras.
• Cajas con cubos conectables de $1\text{ cm}^3$.
• Hojas de planos de figuras compuestas.`,
    evidenciaEntregable: `Reporte Geométrico "El Misterio de Pi, Cálculo de Superficies Compuestas y Modelado de Prismas en $cm^3$".`
  },

  // =========================================================================
  // 🌍 ÁREA 5: ÉTICA, NATURALEZA Y SOCIEDADES (6)
  // =========================================================================
  {
    id: 'fase5-soc-25',
    campo: 'Ética, Naturaleza y Sociedades',
    campoTag: 'etica_naturaleza_y_sociedades',
    materia: 'Geografía / Formación Cívica',
    materiaFolder: 'Geografia',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 25,
    temaTitulo: 'Valoración de la biodiversidad en México y patrimonio biocultural',
    tituloProyecto: 'México Megadiverso: Patrimonio Biocultural, Ecosistemas y Tradición Comunitaria',
    ejes: ['Pensamiento Crítico', 'Interculturalidad Crítica', 'Vida Saludable'],
    pda: 'Fase 5 (5º Primaria) - Comprende la biodiversidad, su función como elemento vital en la Tierra y en el equilibrio de la biosfera, así como la importancia para la vida humana y de las demás especies. Compara e interpreta representaciones cartográficas de la biodiversidad de México, su entidad y localidad, reconociendo su distribución y los elementos que la hacen posible (suelo, clima, altitud, latitud). Comprende por qué México es un país biodiverso y biocultural, así como la biodiversidad local y su influencia en las tradiciones culturales de la comunidad (cultivos, alimentos, indumentaria, herbolaria, fiestas, ritos). Propone y realiza acciones que ayuden a proteger la biodiversidad.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué México concentra casi el 12% de todas las especies de plantas y animales del planeta en apenas el 1.5% del territorio mundial?',
      '¿Cómo influyen el relieve montañoso (Sierras Madre) y la ubicación entre dos océanos y dos zonas térmicas en nuestra megadiversidad?',
      '¿Qué relación existe entre la variedad biológica y las tradiciones de los pueblos indígenas (medicina herbolaria, fiestas patronales y gastronomía)?',
      '¿Qué especies endémicas de nuestra región están en peligro de extinción y qué podemos hacer para proteger su hábitat?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Proyección Cartográfica Interactiva: Mapa físico y biogeográfico de México mostrando la convergencia de la región Neártica y Neotropical.
2. Pregunta detonadora: "¿Por qué en México podemos pasar de un desierto con cactus a una selva tropical lluviosa o a un bosque nevado en pocas horas de viaje?".
3. Activación de conocimientos sobre especies endémicas (ajolote, vaquita marina, jaguar, cempasúchil).`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Cartografía Biocultural en Equipos de 4:
   • Cada equipo analiza un ecosistema mexicano (Selva Lacandona, Desierto de Sonora, Bosque de Niebla de Veracruz, Arrecifes de Cozumel).
   • Elaboran un Mapa Parlante que integra:
     - Factores geográficos (tipo de clima, relieve, altitud y disponibilidad de agua).
     - Flora y fauna representativa y endémica.
     - Prácticas bioculturales asociadas de los pueblos originarios (usos medicinales del maguey, cultivo de milpa, textiles teñidos con grana cochinilla).
2. Diseño del Decálogo de Protección Comunitaria de Especies Nativas.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Muestra Cartográfica: Presentación de los mapas parlantes en una feria de la megadiversidad.
2. Metacognición en libreta: "¿Por qué defender la naturaleza es defender también nuestra cultura e historia mexicana?".
3. Entrega de evidencia: Mapa biocultural de México y ficha de protección de especie endémica.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Análisis de Factores Geográficos de la Megadiversidad (Sobresaliente [3.5 pts]: Explica con rigor la influencia del relieve, clima, latitud y confluencia biogeográfica | Satisfactorio [2.5 pts]: Identifica factores básicos | En Proceso [1.5 pts]: Lista especies sin explicar causas geográficas).
• Criterio 2 - Reconocimiento del Patrimonio Biocultural (Sobresaliente [3.5 pts]: Relaciona profundamente la biodiversidad con las tradiciones, herbolaria y gastronomía indígena | Satisfactorio [2.5 pts]: Relaciona biodiversidad y cultura básica | En Proceso [1.5 pts]: Trata la naturaleza aislada de la cultura).
• Criterio 3 - Propuestas de Conservación Sustentable (Sobresaliente [3 pts]: Propone acciones de preservación viables y fundamentadas | Satisfactorio [2 pts]: Propuestas generales | En Proceso [1 pt]: Sin propuestas).
• Instrumento: Rúbrica de geografía ambiental y patrimonio biocultural.`,
    materiales: `• Atlas de México y del Mundo (SEP / CONABIO).
• Mapas mudos de la República Mexicana con división política.
• Colores, recortes y fichas de especies en peligro de extinción.`,
    evidenciaEntregable: `Mapa Mural Biocultural de México y Ficha de Rescate de una Especie Endémica Regional.`
  },
  {
    id: 'fase5-soc-26',
    campo: 'Ética, Naturaleza y Sociedades',
    campoTag: 'etica_naturaleza_y_sociedades',
    materia: 'Historia',
    materiaFolder: 'Historia',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 26,
    temaTitulo: 'Movimientos sociales en el México del siglo XIX: La Independencia de México',
    tituloProyecto: 'Rutas de Libertad: Protagonistas, Ideales y Héroes Invisibilizados de la Independencia',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Interculturalidad Crítica'],
    pda: 'Fase 5 (5º Primaria) - Indaga en fuentes bibliográficas, hemerográficas, digitales y fotográficas, las causas del movimiento de independencia, la injusticia social, las confrontaciones ideológicas entre grupos de criollos y peninsulares. Dialoga acerca de los ideales que impulsaron el movimiento independentista, tales como la libertad, la justicia, la abolición de la esclavitud, la igualdad de derechos y la defensa de la soberanía. Analiza la participación de las y los protagonistas del movimiento de independencia: Miguel Hidalgo, Josefa Ortiz, Ignacio Allende, Leona Vicario, Morelos, Vicente Guerrero, Agustín de Iturbide. Analiza la participación de grupos no visibilizados: personas esclavizadas, pueblos originarios, afrodescendientes, mujeres y niños. Representa en mapas las rutas estratégicas y lugares emblemáticos de las luchas por la independencia.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el sistema colonial de castas de la Nueva España generaba tanta desigualdad e injusticia entre españoles peninsulares, criollos, indígenas y afrodescendientes?',
      '¿Cuáles fueron las ideas revolucionarias de José María Morelos en "Sentimientos de la Nación" (abolición de la esclavitud, moderar la opulencia y la indigencia)?',
      '¿Qué papel heroico y decisivo tuvieron mujeres como Leona Vicario, Josefa Ortiz de Domínguez y Gertrudis Bocanegra?',
      '¿Cómo trazamos en el mapa la ruta insurgente desde Dolores Hidalgo hasta la entrada del Ejército Trigarante en la Ciudad de México?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Lectura del Bando de Abolición de la Esclavitud promulgado por Miguel Hidalgo en Guadalajara (1810).
2. Pregunta detonadora: "¿Por qué abolir la esclavitud y las castas fue un acto tan radical y valiente en esa época?".
3. Contrastación en el pizarrón: Sistema de Castas virreinal vs Principio de Igualdad de la República.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Historiografía y Cartografía Insurgente en Equipos:
   • Mapeo Histórico: Trazan en un mapa de la Nueva España las 4 etapas de la lucha (Iniciación, Organización con Morelos, Resistencia con Guerrero y Consumación con el Abrazo de Acatempan).
   • Fichas de Personajes No Visibilizados: Investigan la participación de los batallones de afrodescendientes en el sur de México y las redes de espionaje femenino de "Los Guadalupes" lideradas por Leona Vicario.
2. Análisis Crítico del ideario de Morelos:
   • Discuten los artículos centrales de "Sentimientos de la Nación" y su vigencia en el México actual.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Reflexión sobre qué ideales de la Independencia siguen siendo un reto hoy en día.
2. Metacognición: "¿Qué héroe o heroína de la Independencia me inspira más y qué valor cívico me enseña?".
3. Entrega de evidencia: Mapa de rutas insurgentes y crónica histórica ilustrada.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión de Causas, Etapas e Ideales (Sobresaliente [3.5 pts]: Explica con rigor histórico las causas sociales, el ideario de libertad y las 4 etapas de la guerra | Satisfactorio [2.5 pts]: Describe etapas básicas | En Proceso [1.5 pts]: Memoriza fechas sin comprender causas).
• Criterio 2 - Revaloración de Grupos No Visibilizados (Sobresaliente [3.5 pts]: Destaca la participación clave de mujeres, pueblos originarios y afrodescendientes con fuentes | Satisfactorio [2.5 pts]: Menciona a las mujeres insurgentes | En Proceso [1.5 pts]: Solo menciona a los héroes tradicionales).
• Criterio 3 - Precisión Cartográfica Histórica (Sobresaliente [3 pts]: Traza rutas, batallas y lugares emblemáticos con simbología clara | Satisfactorio [2 pts]: Mapa completo con detalles menores | En Proceso [1 pt]: Rutas desordenadas).
• Instrumento: Rúbrica de pensamiento histórico y análisis de fuentes primarias.`,
    materiales: `• Mapas históricos de la Nueva España de 1810 a 1821.
• Facsímil de "Sentimientos de la Nación" y fragmentos de proclamas insurgentes.
• Líneas de tiempo ilustradas y colores.`,
    evidenciaEntregable: `Atlas Histórico "Rutas Insurgentes y Sentimientos de la Nación: Voces de la Libertad en México".`
  },
  {
    id: 'fase5-soc-27',
    campo: 'Ética, Naturaleza y Sociedades',
    campoTag: 'etica_naturaleza_y_sociedades',
    materia: 'Historia / Formación Cívica',
    materiaFolder: 'Historia',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 27,
    temaTitulo: 'México independiente: invasiones extranjeras, defensa de la soberanía y Leyes de Reforma',
    tituloProyecto: 'Defensa de la Soberanía y el Estado Laico: De las Intervenciones Extranjeras a las Leyes de Reforma',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 5 (5º Primaria) - Indaga acerca de los inicios del México independiente, cuáles eran las condiciones sociales, económicas y políticas, por qué se designó a Iturbide como emperador, identificar el contexto internacional, qué países querían dominar a México y el impacto en el territorio nacional de las invasiones extranjeras. Analiza causas y consecuencias de las invasiones al territorio mexicano por los Estados Unidos: la Guerra de Texas y las implicaciones del Tratado de Guadalupe-Hidalgo. Reconoce el papel de Benito Juárez en la construcción y el establecimiento de las Leyes de Reforma (1859), mismas que sentaron las bases para la constitución de un estado laico en México. Conoce y dialoga acerca de las implicaciones de una educación laica, crítica y sin dogmas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué los primeros 30 años de México como país independiente fueron de tanta inestabilidad, bancarrota y luchas entre liberales y conservadores?',
      '¿Cuáles fueron las consecuencias territoriales devastadoras del Tratado de Guadalupe-Hidalgo de 1848 para nuestro país (pérdida de más de la mitad del territorio)?',
      '¿Qué significan las Leyes de Reforma (1859) de Benito Juárez y por qué separaron los asuntos de la Iglesia y del Estado?',
      '¿Por qué el artículo 3º Constitucional garantiza una educación pública laica, gratuita y científica libre de cualquier dogma?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Comparación Cartográfica del Mapa de México de 1824 vs el Mapa Actual: Los alumnos observan con asombro la extensión de Alta California, Nuevo México y Texas antes de 1848.
2. Pregunta detonadora: "¿Por qué potencias extranjeras como EE.UU. y Francia intentaron invadir y dividir a México en el siglo XIX?".
3. Activación de saberes sobre los proyectos de nación: República Federal vs República Centralista / Monarquía.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Análisis Documental "El Juicio de la Historia" en Equipos:
   • Caso A (La Pérdida del Territorio Norte): Analizan las causas de la Guerra de Texas (1836) y la invasión estadounidense (1846-1848).
   • Caso B (La Segunda Intervención Francesa y el Imperio de Maximiliano): La Batalla de Puebla del 5 de mayo de 1862 y la defensa juarista de la República itinerante.
   • Caso C (Las Leyes de Reforma): Registro Civil, Matrimonio Civil, Libertad de Cultos y Laicidad de la Enseñanza.
2. Redacción del Manifiesto en Defensa de la Soberanía y el Estado Laico.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Debate sobre la importancia de la educación laica para la convivencia armónica entre personas con diferentes creencias.
2. Metacognición: "¿Qué significa en mi vida escolar diaria el valor de la laicidad y la tolerancia?".
3. Entrega de evidencia: Cuadro comparativo de intervenciones y esquema de las Leyes de Reforma.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión de Intervenciones y Pérdida Territorial (Sobresaliente [3.5 pts]: Analiza con rigor causas, consecuencias y tratados internacionales (Guadalupe-Hidalgo) | Satisfactorio [2.5 pts]: Describe las invasiones con datos generales | En Proceso [1.5 pts]: Confunde intervenciones extranjeras).
• Criterio 2 - Significado Histórico de las Leyes de Reforma y Juárez (Sobresaliente [3.5 pts]: Explica con profundidad la separación Iglesia-Estado y las instituciones del Estado Laico | Satisfactorio [2.5 pts]: Reconoce el papel de Benito Juárez | En Proceso [1.5 pts]: Desconoce el concepto de Estado Laico).
• Criterio 3 - Reflexión sobre la Educación Laica (Sobresaliente [3 pts]: Argumenta la importancia de la laicidad como garante de derechos y libertad de pensamiento | Satisfactorio [2 pts]: Reflexión básica | En Proceso [1 pt]: Confunde laicidad con antirreligión).
• Instrumento: Rúbrica de análisis histórico y formación cívica ciudadana.`,
    materiales: `• Mapas comparativos de México (1824, 1848 y contemporáneo).
• Textos adaptados de las Leyes de Reforma y proclamas de Benito Juárez.
• Fichas biográficas de personajes liberales y conservadores.`,
    evidenciaEntregable: `Cuadro de Análisis Histórico "Soberanía, Conflictos Territoriales y Construcción del Estado Laico Mexicano".`
  },
  {
    id: 'fase5-soc-28',
    campo: 'Ética, Naturaleza y Sociedades',
    campoTag: 'etica_naturaleza_y_sociedades',
    materia: 'Historia / Formación Cívica',
    materiaFolder: 'Historia',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 28,
    temaTitulo: 'La Revolución Mexicana de 1910 y la Constitución de 1917',
    tituloProyecto: 'Tierra y Libertad: La Revolución Mexicana, las Mujeres Zapatistas y la Constitución de 1917',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Igualdad de Género'],
    pda: 'Fase 5 (6º Primaria) - Indaga acerca de las causas que dieron origen al movimiento revolucionario de 1910: despojo de tierras, explotación laboral por compañías extranjeras (huelgas de Cananea y Río Blanco). Analiza la participación en el movimiento de personajes como Francisco I. Madero, Emiliano Zapata, Francisco Villa, Venustiano Carranza, destacando sus ideales. Reconoce la participación de las mujeres en la lucha revolucionaria: Adelitas, Petra Herrera, María Quinteras, Carmen Vélez. Analiza los artículos 3o, 27 y 123 de la Constitución de 1917 referentes a la educación, la propiedad de las tierras y el trabajo, e indaga los debates en el constituyente.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué las huelgas obreras de Cananea (1906) y Río Blanco (1907) y la frase "Tierra y Libertad" fueron la chispa que encendió la Revolución contra el Porfiriato?',
      '¿Cuáles eran las diferencias ideológicas entre el agrarismo radical de Emiliano Zapata (Plan de Ayala) y el constitucionalismo legalista de Venustiano Carranza?',
      '¿Quiénes fueron las "Soldaderas" y generales revolucionarias como Petra Herrera y por qué sus nombres deben estar en letras de oro en nuestra historia?',
      '¿Cómo transformó la Constitución de 1917 a México en el primer país del mundo en consagrar los derechos sociales en los artículos 3º (Educación), 27º (Tierras y Recursos) y 123º (Trabajo digno de 8 horas)?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Audición de Corridos Revolucionarios: Se reproduce el corrido de "La Adelita" y "El Corrido de Emiliano Zapata" acompañados de fotografías históricas del Archivo Casasola.
2. Pregunta detonadora: "¿Por qué miles de campesinos y obreros arriesgaron sus vidas en trenes y batallas para derrocar a Porfirio Díaz?".
3. Activación de conceptos clave: Latifundio, tienda de raya, sufragio efectivo no reelección, justicia social.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller del Congreso Constituyente de Querétaro en Equipos:
   • Los alumnos representan a los diputados constituyentes de 1917 y analizan la redacción de los 3 grandes artículos de justicia social:
     - Artículo 3º: Educación pública, laica, obligatoria y gratuita.
     - Artículo 27º: La propiedad originaria de tierras, aguas y petróleo corresponde a la Nación; restitución de ejidos campesinos.
     - Artículo 123º: Jornada laboral máxima de 8 horas, descanso semanal, prohibición del trabajo infantil y salario mínimo justo.
2. Ficha de Homenaje a las Mujeres de la Revolución: Rescatan las historias de las combatientes que comandaron tropas vestidas de hombres para poder luchar por sus derechos.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Promulgación simulada de la Carta Magna en el salón de clases.
2. Metacognición: "¿Cómo beneficia a mi familia hoy en día tener derecho a una jornada laboral de 8 horas y a la escuela gratuita?".
3. Entrega de evidencia: Matriz de los Artículos 3º, 27º y 123º y ficha biográfica de una mujer revolucionaria.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión de Causas y Facciones Revolucionarias (Sobresaliente [3.5 pts]: Explica con solidez las demandas agrarias, laborales y democráticas de Madero, Zapata, Villa y Carranza | Satisfactorio [2.5 pts]: Describe la lucha revolucionaria general | En Proceso [1.5 pts]: Confunde líderes y etapas).
• Criterio 2 - Análisis Jurídico-Social de la Constitución de 1917 (Sobresaliente [3.5 pts]: Domina el contenido y trascendencia de los artículos 3º, 27º y 123º como derechos sociales pioneros | Satisfactorio [2.5 pts]: Explica los artículos de forma básica | En Proceso [1.5 pts]: Desconoce el contenido de los artículos).
• Criterio 3 - Visibilización de las Mujeres Revolucionarias (Sobresaliente [3 pts]: Documenta el papel militar, logístico e ideológico de soldaderas y lideresas revolucionarias | Satisfactorio [2 pts]: Menciona a las soldaderas | En Proceso [1 pt]: Omite el enfoque de género).
• Instrumento: Rúbrica de derechos sociales y constitución histórica.`,
    materiales: `• Fotografías del Archivo Casasola de la Revolución Mexicana.
• Texto simplificado de los Artículos 3º, 27º y 123º de la Constitución de 1917.
• Pliegos de papel craft para mural del Congreso Constituyente.`,
    evidenciaEntregable: `Periódico Histórico Mural "1917: La Voz del Pueblo en la Constitución de Querétaro".`
  },
  {
    id: 'fase5-soc-29',
    campo: 'Ética, Naturaleza y Sociedades',
    campoTag: 'etica_naturaleza_y_sociedades',
    materia: 'Historia / Formación Cívica',
    materiaFolder: 'Historia',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 29,
    temaTitulo: 'México posrevolucionario (1917-1940), Escuela Rural Mexicana, Cardenismo y Expropiación Petrolera',
    tituloProyecto: 'El México de los Campesinos: Escuela Rural, Cardenismo y la Soberanía del Petróleo',
    ejes: ['Pensamiento Crítico', 'Interculturalidad Crítica', 'Inclusión'],
    pda: 'Fase 5 (6º Primaria) - Indaga en fuentes históricas la vida cotidiana en el México posrevolucionario (1917-1940), qué estragos dejó la guerra y qué es la Escuela Rural Mexicana. Analiza el proceso que implicó la reconfiguración del país para la cimentación de un régimen político democrático. Analiza el proceso denominado Maximato (1928-1934). Identifica algunas acciones que se impulsaron durante el Cardenismo, como la expropiación petrolera (1938) y el reparto agrario a campesinos y comunidades indígenas. Dialoga acerca de cómo los procesos históricos han cambiado la vida de las personas y sus comunidades.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo los maestros misioneros de la Escuela Rural Mexicana llevaron la alfabetización, el arte y la agricultura a los rincones más alejados del país?',
      '¿Por qué el 18 de marzo de 1938 el presidente Lázaro Cárdenas decretó la Expropiación Petrolera y todo el pueblo donó dinero y pertenencias para pagar la indemnización?',
      '¿Qué significó el reparto agrario masivo (creación del Ejido de La Laguna y Yucatán) para devolverle la dignidad a los pueblos indígenas?',
      '¿Cómo ayudaron instituciones como el Instituto Politécnico Nacional (IPN) y el INAH al desarrollo científico y cultural de México?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Audición de la Grabación Histórica de Radio: El mensaje a la Nación de Lázaro Cárdenas anunciando la Expropiación de las compañías petroleras extranjeras (1938).
2. Pregunta detonadora: "¿Por qué la gente humilde llevaba gallinas, anillos de boda y alcancías a Bellas Artes para cooperar con la deuda petrolera?".
3. Activación de conocimientos sobre soberanía de los recursos naturales y justicia social.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Investigación Posrevolucionaria en Equipos:
   • Eje 1 (La Escuela Rural Mexicana y las Misiones Culturales de Vasconcelos): Analizan el rol de los maestros rurales enseñando a leer en lenguas originarias y español y creando bibliotecas comunitarias.
   • Eje 2 (El Reparto Agrario Cardenista): Analizan cómo el ejido comunal protegió las tierras de los pueblos originarios contra los latifundistas.
   • Eje 3 (La Creación de Instituciones Nacionales): El surgimiento del IPN, PEMEX, CFE y el INAH para construir soberanía industrial y médica.
2. Elaboración del Cartel Testimonial "El Rescate de lo Nuestro".`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Reflexión sobre la importancia de que el petróleo y los recursos del subsuelo pertenezcan a todos los mexicanos.
2. Metacognición: "¿Qué valor tiene para nuestra comunidad que la educación pública llegue hasta el pueblo más lejano?".
3. Entrega de evidencia: Reporte histórico del Cardenismo y la Escuela Rural.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Análisis del Periodo Cardenista y Soberanía Energética (Sobresaliente [3.5 pts]: Explica con rigor la expropiación petrolera, el reparto agrario y el contexto del Maximato | Satisfactorio [2.5 pts]: Describe la expropiación y el cardenismo con ideas básicas | En Proceso [1.5 pts]: Datos confusos sin contexto).
• Criterio 2 - Valoración de la Escuela Rural Mexicana (Sobresaliente [3.5 pts]: Reconoce el impacto social, alfabetizador y cultural de los maestros misioneros | Satisfactorio [2.5 pts]: Reconoce la escuela rural | En Proceso [1.5 pts]: Desconoce la misión educativa posrevolucionaria).
• Criterio 3 - Conciencia Histórica y Bienestar Colectivo (Sobresaliente [3 pts]: Relaciona los logros institucionales con el desarrollo actual del país | Satisfactorio [2 pts]: Relación básica | En Proceso [1 pt]: Sin reflexión crítica).
• Instrumento: Rúbrica de historia contemporánea y soberanía nacional.`,
    materiales: `• Fotografías de la Escuela Rural Mexicana y de la Expropiación Petrolera de 1938.
• Grabaciones de época y testimonios orales de ancianos campesinos.
• Cartulinas y material gráfico.`,
    evidenciaEntregable: `Monografía Ilustrada "Lázaro Cárdenas y la Escuela Rural: El Despertar del Campo Mexicano".`
  },
  {
    id: 'fase5-soc-30',
    campo: 'Ética, Naturaleza y Sociedades',
    campoTag: 'etica_naturaleza_y_sociedades',
    materia: 'Geografía / Formación Cívica',
    materiaFolder: 'Geografia',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 30,
    temaTitulo: 'Migración interna y externa: causas, consecuencias y derechos humanos',
    tituloProyecto: 'Caminos de Esperanza: Geografía de la Migración, Empatía y Protección de los Derechos Humanos',
    ejes: ['Inclusión', 'Pensamiento Crítico', 'Interculturalidad Crítica'],
    pda: 'Fase 5 (6º Primaria) - Reconoce los flujos migratorios en los que hay mayor cantidad de emigrantes en el mundo, identificando países de origen y de destino. Explica causas y consecuencias sociales, culturales, económicas, políticas y ambientales de la migración, en casos específicos en el mundo, mediante el análisis de noticias, documentales y testimonios de migrantes internacionales. Ubica en mapas, las rutas que siguen los migrantes, desde su lugar de origen, hasta su destino. Dialoga acerca de cómo se sienten las personas al ser obligadas a abandonar su lugar de origen, dejando atrás su patrimonio y su forma de vida. Dialoga y elabora juicios éticos acerca de los derechos de las personas migrantes.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuáles son las causas forzadas (pobreza extrema, sequías por cambio climático, violencia, guerras) que obligan a familias enteras a dejar su patria?',
      '¿Cuáles son las principales rutas migratorias del mundo (Centroamérica hacia México-EE.UU., África hacia Europa, Medio Oriente)?',
      '¿Por qué NINGÚN ser humano es ilegal y cuáles son los tratados internacionales que protegen a los niños migrantes y refugiados?',
      '¿Cómo podemos erradicar la discriminación y la xenofobia hacia las personas migrantes que transitan o se establecen en nuestra comunidad?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dinámica de Empatía "La Maleta del Migrante": El docente muestra una mochila pequeña y pregunta: "Si tuvieran que abandonar su casa en 10 minutos para caminar miles de kilómetros hacia un país desconocido... ¿qué 3 cosas indispensables empacarían?".
2. Pregunta detonadora: "¿Por qué migrar es un derecho humano y no un delito?".
3. Definición de conceptos: Emigrante, Inmigrante, Refugiado, Asilado y Derechos Humanos Universales.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Mapeo y Testimonios en Equipos de 4:
   • Análisis Cartográfico: Trazan en un planisferio los grandes corredores migratorios globales y la ruta de tránsito por México hacia la frontera norte.
   • Análisis Testimonial: Leen testimonios reales de niñas y niños migrantes en albergues humanitarios.
   • Identifican los peligros del trayecto (trata de personas, extorsión, desierto, barreras burocráticas).
2. Redacción de la "Declaración Escolar de Solidaridad y Acogida al Migrante".`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Construcción colectiva del "Mural de la Hospitalidad sin Fronteras".
2. Metacognición: "¿Cómo me gustaría que me trataran a mí y a mi familia si tuviéramos que migrar a otro país?".
3. Entrega de evidencia: Planisferio de flujos migratorios y manifiesto de derechos humanos.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión Geográfica y Causas Multifactoriales (Sobresaliente [3.5 pts]: Identifica rutas, países de origen/destino y causas económicas, bélicas y climáticas con rigor | Satisfactorio [2.5 pts]: Ubica rutas con causas generales | En Proceso [1.5 pts]: Confunde países o conceptos migratorios).
• Criterio 2 - Juicio Ético y Defensa de los Derechos Humanos (Sobresaliente [3.5 pts]: Argumenta con solidez los tratados de protección a refugiados y la no discriminación | Satisfactorio [2.5 pts]: Expresa empatía básica | En Proceso [1.5 pts]: Reproduce prejuicios xenófobos).
• Criterio 3 - Expresión Cartográfica y Empatía Testimonial (Sobresaliente [3 pts]: Planisferio con simbología impecable y propuesta de acogida humanitaria | Satisfactorio [2 pts]: Mapa completo | En Proceso [1 pt]: Mapa incompleto).
• Instrumento: Rúbrica de geografía humana y derechos internacionales.`,
    materiales: `• Planisferios del mundo con división política y mapa de la República Mexicana.
• Testimonios adaptados de ACNUR y UNICEF sobre niñez en movilidad.
• Plumones y gises para el Mural de la Hospitalidad.`,
    evidenciaEntregable: `Planisferio Temático de Rutas Migratorias Globales y Manifiesto de Derechos Humanos de las Personas en Movilidad.`
  },

  // =========================================================================
  // 🤝 ÁREA 6: DE LO HUMANO Y LO COMUNITARIO (6)
  // =========================================================================
  {
    id: 'fase5-com-31',
    campo: 'De lo Humano y lo Comunitario',
    campoTag: 'de_lo_humano_y_lo_comunitario',
    materia: 'Educación Socioemocional',
    materiaFolder: 'Educacion_Socioemocional',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 31,
    temaTitulo: 'Las familias como espacio para el desarrollo del sentido de pertenencia y convivencia',
    tituloProyecto: 'Árbol de la Convivencia: Tradiciones, Vínculos Familiares y Sentido de Pertenencia',
    ejes: ['Inclusión', 'Igualdad de Género', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 5 (5º Primaria) - Participa en distintas formas de convivencia en la familia, para fortalecer su sentido de pertenencia y afecto. Reflexiona acerca de los valores heredados de la familia, para el desarrollo de una sana convivencia en la escuela y la comunidad. Diseña e interactúa en distintos escenarios de convivencia, para fortalecer su autonomía y su participación en la familia.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué tradiciones, comidas, relatos o valores únicos distinguen a tu familia y te hacen sentir orgulloso de pertenecer a ella?',
      '¿Por qué existen diferentes tipos de familias (nucleares, monoparentales, extendidas, compuestas) y todas merecen el mismo respeto y amor?',
      '¿Cómo podemos colaborar de manera equitativa entre hombres y mujeres en las tareas del hogar y en el cuidado mutuo?',
      '¿Qué acuerdos familiares nos ayudan a resolver desacuerdos cotidianos con cariño y sin gritos?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Presentación de la Fotografía del Corazón: Cada alumno muestra un dibujo o foto de un momento feliz con su familia.
2. Pregunta detonadora: "¿Qué valores como la honestidad, la solidaridad o la perseverancia aprendiste de las personas que te cuidan?".
3. Reconocimiento de la diversidad familiar: Todas las familias unidas por el afecto y la protección.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller del "Árbol Genealógico de Valores y Tradiciones" en Parejas:
   • Dibujan un árbol frondoso donde:
     - Las Raíces representan los orígenes y lugares de procedencia de sus antepasados.
     - El Tronco representa los valores fundamentales heredados (el trabajo digno, la unión, la generosidad).
     - Las Ramas y Hojas representan las tradiciones familiares vivas (comidas típicas, paseos, consejos).
     - Los Frutos representan los compromisos de cada alumno para cuidar la convivencia en su casa y en la escuela.
2. Diseño del "Contrato de Colaboración Equitativa en el Hogar".`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Rondas de Compartir: Lectura de los valores más inspiradores del árbol.
2. Metacognición: "¿Qué puedo hacer hoy al llegar a mi casa para agradecerle a mi familia lo que hace por mí?".
3. Entrega de evidencia: Árbol Genealógico de Valores terminado e ilustrado.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Sentido de Pertenencia e Identidad Familiar (Sobresaliente [3.5 pts]: Reflexiona con profundidad sobre las raíces, tradiciones y valores que conforman su identidad | Satisfactorio [2.5 pts]: Describe tradiciones básicas | En Proceso [1.5 pts]: Descripción superficial).
• Criterio 2 - Valoración de la Diversidad y Equidad Familiar (Sobresaliente [3.5 pts]: Respeta todas las estructuras familiares y promueve la distribución equitativa de roles sin estereotipos de género | Satisfactorio [2.5 pts]: Expresa respeto general | En Proceso [1.5 pts]: Reproduce roles machistas).
• Criterio 3 - Creatividad y Expresión Afectiva (Sobresaliente [3 pts]: Árbol genealógico cuidado, emotivo y con compromisos concretos | Satisfactorio [2 pts]: Trabajo completo | En Proceso [1 pt]: Trabajo incompleto).
• Instrumento: Rúbrica socioafectiva y autoevaluación familiar.`,
    materiales: `• Cartulinas, fotografías familiares o recortes, plumones de colores.
• Hojas de contrato de convivencia familiar.`,
    evidenciaEntregable: `Lámina "Árbol Genealógico de Tradiciones y Valores Familiares" con Contrato de Corresponsabilidad en el Hogar.`
  },
  {
    id: 'fase5-com-32',
    campo: 'De lo Humano y lo Comunitario',
    campoTag: 'de_lo_humano_y_lo_comunitario',
    materia: 'Educación Socioemocional',
    materiaFolder: 'Educacion_Socioemocional',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 32,
    temaTitulo: 'Alternativas ante conflictos y cultura de paz en la comunidad escolar',
    tituloProyecto: 'Mesa de Mediación y Diálogo: Transformando Conflictos en Acuerdos Asertivos de Paz',
    ejes: ['Inclusión', 'Pensamiento Crítico'],
    pda: 'Fase 5 (5º Primaria) - Reflexiona sobre los conflictos que tiene en la escuela y la familia, para valorar las posibles alternativas de solución. Valora la pertinencia del diálogo, para solucionar los conflictos interpersonales. Diseña, bajo los principios de respeto y tolerancia, estrategias de organización ante diferentes situaciones, para la prevención de conflictos, la satisfacción de necesidades comunes y el desarrollo sustentable de su comunidad.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué tener un conflicto con un compañero es algo natural, pero resolverlo con violencia física o insultos destruye la convivencia?',
      '¿Cuáles son los 4 pasos de la Comunicación No Violenta (1. Observar sin juzgar, 2. Expresar lo que siento, 3. Identificar mi necesidad, 4. Hacer una petición clara)?',
      '¿Qué rol cumple un mediador escolar neutral y por qué no debe tomar partido por ninguno de los involucrados?',
      '¿Cómo podemos convertir el patio de recreo en un territorio 100% libre de burlas y exclusión?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dramatización de Conflicto en el Recreo: Dos alumnos voluntarios escenifican un altercado por el uso de la cancha de fútbol.
2. Pregunta detonadora: "¿Qué pasa si ambos siguen gritando? ¿Quién gana cuando un conflicto termina a golpes? ¿Cómo podemos llegar a una solución ganar-ganar?".
3. Definición de Mediación Escolar y Acuerdo de Paz.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de "Jueces de Paz y Mediadores Escolares" en Equipos de 4:
   • Analizan 3 casos típicos de fricción escolar (un rumor en grupos de chat, un empujón accidental no disculpado, exclusión en un juego de equipo).
   • Aplican el Protocolo de las 3 Sillas de Mediación:
     - Silla 1 (Parte A): Habla en primera persona usando "Yo siento..." sin atacar.
     - Silla 2 (Parte B): Parafrasea lo que escuchó para demostrar escucha activa y expone su punto de vista.
     - Silla del Mediador: Formula preguntas reflexivas y guía la redacción de un acta de compromiso mutuo.
2. Redacción del "Decálogo de Convivencia Asertiva del Salón".`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Firma simbólica del Pacto de Paz y Mediación del Aula.
2. Metacognición en libreta: "¿Qué haré la próxima vez que sienta que el enojo me hace querer gritar o agredir?".
3. Entrega de evidencia: Acta de mediación resuelta y protocolo de diálogo asertivo.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Aplicación del Protocolo de Mediación y Diálogo (Sobresaliente [3.5 pts]: Conduce procesos de mediación con imparcialidad, empatía y técnicas de comunicación no violenta | Satisfactorio [2.5 pts]: Aplica pasos básicos de diálogo | En Proceso [1.5 pts]: Justifica la violencia o impone soluciones).
• Criterio 2 - Identificación de Necesidades y Soluciones Ganar-Ganar (Sobresaliente [3.5 pts]: Propone alternativas creativas donde ambas partes quedan satisfechas y reconciliadas | Satisfactorio [2.5 pts]: Soluciones sencillas | En Proceso [1.5 pts]: Soluciones punitivas).
• Criterio 3 - Compromiso con la Cultura de Paz (Sobresaliente [3 pts]: Asume compromisos personales y promueve activamente el respeto en el aula | Satisfactorio [2 pts]: Cumple acuerdos | En Proceso [1 pt]: Indiferencia).
• Instrumento: Rúbrica de resolución pacífica de conflictos y habilidades socioemocionales.`,
    materiales: `• Formatos de Actas de Mediación y Reconciliación Escolar.
• Tarjetas de casos de estudio de conflictos escolares.
• Cartel grande para el Pacto de Paz del Aula.`,
    evidenciaEntregable: `Guía de Mediación Escolar y Acta de Compromiso para la Resolución Pacífica de Conflictos.`
  },
  {
    id: 'fase5-com-33',
    campo: 'De lo Humano y lo Comunitario',
    campoTag: 'de_lo_humano_y_lo_comunitario',
    materia: 'Educación Física',
    materiaFolder: 'Educacion_Fisica',
    grado: '5to_Grado',
    gradoDisplay: '5º de Primaria',
    temaNum: 33,
    temaTitulo: 'Capacidades, habilidades y destrezas motrices mediante juegos cooperativos',
    tituloProyecto: 'Reto Cooperativo: Circuitos Motrices, Coordinación y Estrategia Lúdica en Equipo',
    ejes: ['Vida Saludable', 'Inclusión'],
    pda: 'Fase 5 (5º Primaria) - Reconoce posibilidades y límites al participar en situaciones de juego e iniciación deportiva, individuales y colectivas, para valorar su desempeño y determinar posibles mejoras. Planifica e implementa estrategias ante situaciones de juego y cotidianas, para contar con opciones que incrementen la efectividad de su actuación. Promueve ambientes de participación en situaciones de juego, iniciación deportiva y cotidianas, para valorar posibles interacciones en favor de una sana convivencia.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué en los juegos cooperativos el éxito no se mide en vencer a otro equipo, sino en superar un reto físico todos juntos sin que nadie se quede atrás?',
      '¿Cómo podemos combinar habilidades motrices básicas (correr, saltar, esquivar, lanzar con puntería, mantener el equilibrio) en una pista de obstáculos?',
      '¿Qué adaptaciones debemos acordar para que un compañero con alguna dificultad física pueda participar activamente y aportar a la meta?',
      '¿Qué importancia tiene la hidratación con agua simple potable y los estiramientos musculares antes y después de la actividad física?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Activación Morfofuncional y Calentamiento Dinámico: Movilidad articular céfalo-caudal (cuello, hombros, cadera, rodillas y tobillos) y juego lúdico de calentamiento "El Lazarillo y el Navegante" con ojos vendados guiado por la voz.
2. Pregunta detonadora: "¿Cómo nos ayuda la confianza en nuestros compañeros a movernos con mayor seguridad?".
3. Explicación de los retos de la pista motriz cooperativa.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Circuito de 4 Estaciones Motrices Cooperativas en Equipos de 6:
   • Estación 1 (El Puente de Cuerdas): Cruzar una línea de equilibrio transportando un balón medicinal entre dos espaldas sin tocarlo con las manos.
   • Estación 2 (Lanzamiento Sincronizado): Encestar pelotas en aros suspendidos mediante lanzamientos parabólicos coordinados.
   • Estación 3 (La Telaraña Gigante): Atravesar un entramado de cuerdas elásticas sin tocar los cascabeles sonoros.
   • Estación 4 (Estrategia de relevos): Diseñar la secuencia más eficiente para trasladar conos con relevos de velocidad y agilidad.
2. Registro de Tiempos y Ajuste de Estrategias: Los equipos evalúan qué falló en el primer intento y modifican su táctica.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Vuelta a la Calma y Ejercicios de Respiración Diafragmática (Inspirar en 4 tiempos, retener en 4, exhalar en 6).
2. Metacognición: "¿En qué momento tuve que adaptar mi ritmo para ayudar a un compañero de equipo?".
3. Entrega de evidencia: Hoja de registro de desempeño motriz y autoevaluación de cooperación.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Destrezas Motrices y Coordinación (Sobresaliente [3.5 pts]: Demuestra equilibrio, agilidad, fuerza controlada y precisión motriz en todos los retos | Satisfactorio [2.5 pts]: Ejecuta los movimientos con destreza básica | En Proceso [1.5 pts]: Dificultades de coordinación motriz).
• Criterio 2 - Planeación Estratégica y Trabajo Cooperativo (Sobresaliente [3.5 pts]: Diseña estrategias colectivas, alienta a sus pares y adapta roles para incluir a todos | Satisfactorio [2.5 pts]: Colabora bien en equipo | En Proceso [1.5 pts]: Actitud individualista o poco participativa).
• Criterio 3 - Conciencia Corporal y Cuidado de la Salud (Sobresaliente [3 pts]: Realiza calentamiento consciente, hidrata su cuerpo y respeta los límites físicos | Satisfactorio [2 pts]: Cuida su seguridad | En Proceso [1 pt]: Descuido en la postura).
• Instrumento: Rúbrica de educación física y motricidad cooperativa.`,
    materiales: `• Conos, aros, balones de diferentes tamaños, cuerdas elásticas, colchonetas.
• Silbato y cronómetro.
• Botellas de agua simple de los alumnos.`,
    evidenciaEntregable: `Bitácora de Desempeño Motriz y Ficha de Estrategia Lúdica en Equipo "Superando Retos Juntos".`
  },
  {
    id: 'fase5-com-34',
    campo: 'De lo Humano y lo Comunitario',
    campoTag: 'de_lo_humano_y_lo_comunitario',
    materia: 'Tutoría / Socioemocional',
    materiaFolder: 'Tutoria_Socioemocional',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 34,
    temaTitulo: 'Construcción del proyecto de vida y autoevaluación de metas',
    tituloProyecto: 'Mi Brújula de Vida: Autoconcepto, Metas a Futuro y Transición Exitosa a la Secundaria',
    ejes: ['Inclusión', 'Pensamiento Crítico', 'Igualdad de Género'],
    pda: 'Fase 5 (6º Primaria) - Valora sus logros y retos afrontados en la historia personal para definir aspiraciones y acciones a realizar ante nuevas etapas de la vida. Valora logros y cambios en gustos, necesidades, intereses y habilidades actuales, para reestructurar metas que favorezcan el desarrollo personal y social. Se informa acerca de la oferta educativa en su región, para identificar sus posibilidades de ingreso al nivel de educación media básica (secundaria).',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué fortalezas, talentos y habilidades has desarrollado a lo largo de tus 6 años de primaria que te acompañarán siempre?',
      '¿Qué temores o expectativas sientes ante el cambio de pasar a la escuela secundaria y tener varios maestros?',
      '¿Cuáles son tus metas a corto plazo (graduarte con honores de primaria), mediano plazo (secundaria) y largo plazo (profesión u oficio de tus sueños)?',
      '¿Qué pasos concretos y hábitos de estudio diarios necesitas construir para alcanzar tus metas sin rendirte?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dinámica del "Escudo Personal de Fortalezas": Los alumnos dibujan un escudo heráldico dividido en 4 cuadrantes: 1) Mi mayor talento, 2) Mi reto más grande superado, 3) Las personas que creen en mí, 4) Mi sueño profesional.
2. Pregunta detonadora: "¿Qué huella quieres dejar en el mundo cuando seas adulto?".
3. Reflexión guiada sobre el cierre de ciclo de la educación primaria y el nuevo reto de la secundaria.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de la "Brújula de Metas SMART" en Parejas:
   • Aprenden a redactar metas claras: Específicas, Medibles, Alcanzables, Relevantes y con Tiempo definido.
   • Construyen el "Plan de Vuelo hacia la Secundaria":
     - Dimensión Académica: Hábitos de lectura diaria de 20 min, organización de apuntes, gestión de tiempos.
     - Dimensión Emocional: Manejo de nerviosismo ante exámenes, búsqueda de amistades positivas y rechazo al bullying.
     - Dimensión Comunitaria: Cómo usar mi vocación futura (médico, ingeniero, artista, maestro, deportista) para ayudar a mi comunidad.
2. Redacción de la "Carta a Mi Yo del Futuro en Secundaria" (cerrada en sobre para abrirla en su primer día de 1º de secundaria).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Compartir las metas más inspiradoras en el mural "El Futuro en Nuestras Manos".
2. Metacognición en libreta: "¿Qué compromiso con mi propio estudio asumo a partir de este momento?".
3. Entrega de evidencia: Brújula de Vida y Carta al Futuro.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Autoconocimiento y Valoración de Logros Personales (Sobresaliente [3.5 pts]: Identifica fortalezas, áreas de oportunidad y retos superados con honestidad y madurez | Satisfactorio [2.5 pts]: Describe logros básicos | En Proceso [1.5 pts]: Dificultad para reconocer talentos propios).
• Criterio 2 - Formulación de Metas Claras y Viables (Sobresaliente [3.5 pts]: Diseña un plan de vida estructurado con metas a corto, mediano y largo plazo con acciones concretas | Satisfactorio [2.5 pts]: Metas generales | En Proceso [1.5 pts]: Metas vagas sin plan de acción).
• Criterio 3 - Actitud Proactiva ante la Transición Escolar (Sobresaliente [3 pts]: Expresa motivación, resiliencia y estrategias para adaptarse a la secundaria | Satisfactorio [2 pts]: Aceptación básica | En Proceso [1 pt]: Ansiedad o desinterés).
• Instrumento: Rúbrica de orientación vocacional y proyecto de vida.`,
    materiales: `• Hojas de formato "Brújula de Vida y Metas SMART".
• Sobres de papel carta para la carta al futuro.
• Marcadores y colores.`,
    evidenciaEntregable: `Proyecto de Vida Integral "Mi Brújula hacia la Secundaria: Metas, Hábitos y Carta al Futuro".`
  },
  {
    id: 'fase5-com-35',
    campo: 'De lo Humano y lo Comunitario',
    campoTag: 'de_lo_humano_y_lo_comunitario',
    materia: 'Vida Saludable / Cívica',
    materiaFolder: 'Vida_Saludable',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 35,
    temaTitulo: 'Estilos de vida activos, saludables y hábitos alimentarios sostenibles',
    tituloProyecto: 'Circuito Vital: Activación Física Diaria, Higiene Sostenible y Prevención del Sedentarismo',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 5 (6º Primaria) - Evalúa los factores que limitan la práctica constante de actividades físicas, para implementar opciones que permitan superarlos a lo largo de la vida. Comprende los riesgos del consumo de alimentos procesados y ultraprocesados en la salud y el medio ambiente, para favorecer la adopción de prácticas alimentarias saludables y sostenibles. Promueve alternativas de hábitos de higiene personal y limpieza de los espacios en la comunidad, para impulsar la toma de decisiones informadas que contribuyan a asumir prácticas saludables y sostenibles.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué pasar más de 4 horas diarias pegados a pantallas de celulares o videojuegos (sedentarismo digital) daña nuestra columna, vista y salud mental?',
      '¿Cómo podemos lograr la meta diaria recomendada por la OMS de 60 minutos de actividad física moderada a intensa de forma divertida?',
      '¿Qué relación existe entre la comida chatarra empaquetada y la gigantesca cantidad de basura plástica que inunda los drenajes de nuestra colonia?',
      '¿Cómo fabricamos productos de limpieza e higiene personal caseros y ecológicos (jabón neutro, desinfectante con vinagre y cítricos)?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Auditoría del "Reloj Diario de Actividad vs Pantalla": Los alumnos dividen un círculo de 24 horas en: Sueño (horas), Escuela (horas), Pantalla/Sentado (horas) y Movimiento físico real (horas).
2. Pregunta detonadora: "¿Cuánto tiempo le dedicamos a alimentar nuestro cuerpo con movimiento y cuánto tiempo estamos inmóviles?".
3. Explicación de los beneficios de la endorfina, serotonina y el fortalecimiento óseo por el ejercicio.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller del "Reto 60 Minutos Activos" en Equipos:
   • Diseñan una rutina de pausas activas de 5 minutos para realizar entre clases escolares (estiramientos, sentadillas, coordinación con palmadas).
   • Elaboran el "Semáforo del Consumo Sostenible": Clasifican colaciones escolares por su impacto en la salud y en la generación de basura plástica.
2. Taller de Limpieza Ecológica Escolar:
   • Preparan una fórmula ecológica para limpiar pizarrones y bancas (agua, vinagre blanco y cáscaras de limón maceradas) evitando químicos tóxicos en aerosol.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Demostración y práctica grupal de una rutina de pausa activa de 3 minutos guiada por los alumnos.
2. Metacognición: "¿Qué actividad física al aire libre disfrutaré hacer este fin de semana con mi familia?".
3. Entrega de evidencia: Plan semanal de activación física y decálogo de consumo sustentable.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Evaluación del Sedentarismo y Hábitos Saludables (Sobresaliente [3.5 pts]: Analiza críticamente su rutina diaria y diseña un plan de 60 min de actividad física viable | Satisfactorio [2.5 pts]: Planifica actividad física básica | En Proceso [1.5 pts]: No reconoce el impacto del sedentarismo).
• Criterio 2 - Prácticas Alimentarias e Higiene Sostenible (Sobresaliente [3.5 pts]: Argumenta la relación entre nutrición fresca, reducción de plásticos y productos ecológicos | Satisfactorio [2.5 pts]: Buenas prácticas generales | En Proceso [1.5 pts]: Descuido en la sustentabilidad).
• Criterio 3 - Liderazgo y Pausas Activas Escolares (Sobresaliente [3 pts]: Conduce pausas activas con entusiasmo y claridad de movimientos | Satisfactorio [2 pts]: Participa activamente | En Proceso [1 pt]: Apatía).
• Instrumento: Rúbrica de vida saludable y sustentabilidad comunitaria.`,
    materiales: `• Formatos del reloj de 24 horas de actividad diaria.
• Ingredientes para limpiador ecológico: vinagre, agua, atomizadores, cáscaras de cítricos.
• Música rítmica para pausas activas.`,
    evidenciaEntregable: `Pasaporte de Vida Activa y Sustentable: Plan de Pausas Activas y Rutina de Hábitos Saludables.`
  },
  {
    id: 'fase5-com-36',
    campo: 'De lo Humano y lo Comunitario',
    campoTag: 'de_lo_humano_y_lo_comunitario',
    materia: 'Educación Socioemocional',
    materiaFolder: 'Educacion_Socioemocional',
    grado: '6to_Grado',
    gradoDisplay: '6º de Primaria',
    temaNum: 36,
    temaTitulo: 'Los afectos, gestión emocional, autorregulación y asertividad',
    tituloProyecto: 'El Semáforo de las Emociones: Autorregulación, Empatía y Comunicación Asertiva',
    ejes: ['Inclusión', 'Pensamiento Crítico', 'Igualdad de Género'],
    pda: 'Fase 5 (6º Primaria) - Reflexiona sobre hábitos que afectan positiva o negativamente en el estado de ánimo para lograr el bienestar personal y social. Crea estrategias que ayudan a la expresión adecuada de las emociones, y que favorecen la interacción y el bienestar personal y social. Evalúa la asertividad para expresar sus emociones sin perjudicar a otra persona. Dramatiza una propuesta de juicio crítico en la toma de decisiones para discernir la solución de los problemas de la vida.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia entre reaccionar de forma PASIVA (guardarse el enojo hasta explotar), AGRESIVA (herir o insultar) y ASERTIVA (decir con firmeza y calma lo que sentimos y necesitamos)?',
      '¿Por qué todas las emociones (incluidas la tristeza, el enojo y el miedo) son válidas y necesarias, pero nuestra conducta al expresarlas es nuestra total responsabilidad?',
      '¿Cómo ayuda la técnica del "Semáforo Emocional" (Rojo: Alto/Respira, Amarillo: Piensa alternativas, Verde: Actúa con asertividad) en momentos de crisis?',
      '¿De qué manera el juicio crítico nos permite tomar decisiones inteligentes ante la presión negativa de amigos o redes sociales?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Dinámica del "Termómetro del Ánimo": Los alumnos colocan un pin en la rueda de las emociones (Alegría, Frustración, Ansiedad, Calma, Tristeza, Asombro).
2. Pregunta detonadora: "¿Qué pasa en nuestro cerebro y cuerpo cuando la amígdala 'secuestra' a la corteza prefrontal en un ataque de ira?".
3. Definición de Inteligencia Emocional y Autorregulación Asertiva.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de "Dilemas de Asertividad y Presión Social" en Equipos de 4:
   • Analizan 3 escenarios de conflicto ético (ej. amigos que presionan para burlarse de un compañero nuevo, una calificación injusta percibida, un desacuerdo con los padres sobre salidas).
   • Dramatizan las 3 respuestas posibles:
     - Respuesta Pasiva (sumisa).
     - Respuesta Agresiva (violenta).
     - Respuesta Asertiva con la fórmula: "Cuando ocurre [X], me siento [Y], y te pido que [Z]".
2. Construcción de la "Caja de Herramientas de Calma" (técnicas de respiración 4x4, diario de gratitud, diálogo interno positivo).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria: Presentación de la mejor dramatización asertiva y análisis de los aprendizajes.
2. Metacognición: "¿En qué situación de mi vida diaria necesito ser más asertivo y menos agresivo o tímido?".
3. Entrega de evidencia: Ficha del Semáforo Emocional y libreto de respuesta asertiva.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión y Gestión de Emociones (Sobresaliente [3.5 pts]: Identifica estados de ánimo, factores detonantes y aplica técnicas de autorregulación con éxito | Satisfactorio [2.5 pts]: Reconoce emociones básicas | En Proceso [1.5 pts]: Dificultad para regular impulsos).
• Criterio 2 - Comunicación Asertiva sin Violencia (Sobresaliente [3.5 pts]: Expresa opiniones y desacuerdos con firmeza, respeto y empatía sin herir ni someterse | Satisfactorio [2.5 pts]: Comunicación adecuada | En Proceso [1.5 pts]: Respuestas pasivas o agresivas).
• Criterio 3 - Juicio Crítico ante la Presión Social (Sobresaliente [3 pts]: Toma decisiones éticas y autónomas resistiendo la presión de grupo | Satisfactorio [2 pts]: Decisiones correctas con apoyo | En Proceso [1 pt]: Se deja influenciar fácilmente).
• Instrumento: Rúbrica de inteligencia socioemocional y toma de decisiones asertivas.`,
    materiales: `• Rueda de las emociones plastificada.
• Tarjetas de dilemas morales y situaciones de presión social.
• Formato del Semáforo de Autorregulación.`,
    evidenciaEntregable: `Bitácora de Inteligencia Emocional "Mi Semáforo de Autorregulación y Respuestas Asertivas".`
  }
];

export function buildFase5MasterIndex() {
  console.log(`🗺️ Construyendo Índice Maestro de Nodos Curriculares de Primaria Fase 5 (SEP 2024)...`);

  function getFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath));
      } else if (file.endsWith('.md') && !file.startsWith('00_')) {
        results.push(fullPath);
      }
    });
    return results;
  }

  const files = getFiles(FASE5_VAULT_BASE);
  console.log(`Total de nodos encontrados en Primaria Fase 5: ${files.length}`);

  interface ParsedNode {
    relPath: string;
    fileNameNoExt: string;
    title: string;
    campo: string;
    materia: string;
    grado: string;
    tema: string;
    duracion: string;
    pda: string;
  }

  const nodes: ParsedNode[] = [];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(FASE5_VAULT_BASE, f).replace(/\\/g, '/');
    const fileNameNoExt = path.basename(f, '.md');

    const campoMatch = content.match(/campo_formativo:\s*"([^"]+)"/);
    const materiaMatch = content.match(/materia:\s*"([^"]+)"/);
    const gradoMatch = content.match(/grado:\s*"([^"]+)"/);
    const temaMatch = content.match(/tema:\s*"([^"]+)"/);
    const titleMatch = content.match(/#\s+(.+)/);
    const duracionMatch = content.match(/- \*\*Duración Estimada:\*\*\s*(.+)/);
    const pdaMatch = content.match(/## 🎯 I\. Proceso de Desarrollo de Aprendizaje \(PDA Oficial SEP\)\s+>\s+\*\*([^\*]+)\*\*/);

    nodes.push({
      relPath,
      fileNameNoExt,
      title: titleMatch ? titleMatch[1].trim() : fileNameNoExt,
      campo: campoMatch ? campoMatch[1].trim() : 'General',
      materia: materiaMatch ? materiaMatch[1].trim() : 'General',
      grado: gradoMatch ? gradoMatch[1].trim() : 'Fase 5',
      tema: temaMatch ? temaMatch[1].trim() : '',
      duracion: duracionMatch ? duracionMatch[1].trim() : '2 sesiones de 50 minutos',
      pda: pdaMatch ? pdaMatch[1].trim() : ''
    });
  }

  const camposOrder = [
    'Lenguajes',
    'Saberes y Pensamiento Científico',
    'Ética, Naturaleza y Sociedades',
    'De lo Humano y lo Comunitario'
  ];

  let indexMarkdown = `---
tags: [iskool, indice_maestro, moc, segundo_cerebro, fase5_primaria]
titulo: "Mapa de Nodos Curriculares: Primaria Fase 5 NEM 2024"
docente: "Prof. Israel López Ángeles"
total_planeaciones: ${nodes.length}
fecha_actualizacion: "${new Date().toISOString()}"
---

# 🗺️ Mapa de Nodos Curriculares: Primaria Fase 5 NEM 2024 (5º y 6º Grado)
**Super Usuario Docente:** Prof. Israel López Ángeles  
**Institución:** Plataforma Académica ISkool / Programa Sintético Oficial SEP 2024  
**Total de Nodos Curriculares Activos:** ${nodes.length} Planeaciones Especializadas  

Este nodo actúa como el **Centro de Enlace Maestro (Map of Content - MOC)** y Segundo Cerebro en la Bóveda de Obsidian, articulando los 4 Campos Formativos de la **Fase 5 de Educación Primaria** con dosificación didáctica por bloques de **50 minutos**, Procesos de Desarrollo de Aprendizaje (PDA) oficiales al 100%, rúbricas formativas analíticas e integración comunitaria.

---

## 📊 Resumen Ejecutivo del Ecosistema Curricular Fase 5

| Campo Formativo | Asignaturas / Áreas | Nodos Activos | Dosificación |
| :--- | :--- | :---: | :---: |
| **🗣️ Lenguajes** | Español, Artes, Diversidad Lingüística, Literatura | ${nodes.filter(n => n.campo.includes('Lenguajes')).length} | Bloques de 50 min |
| **🧬 Saberes y Pensamiento Científico** | Ciencias Naturales, Biología, Salud, Matemáticas | ${nodes.filter(n => n.campo.includes('Saberes')).length} | Bloques de 50 min |
| **🌍 Ética, Naturaleza y Sociedades** | Historia, Geografía, Formación Cívica y Ética, Megadiversidad | ${nodes.filter(n => n.campo.includes('Etica') || n.campo.includes('Ética')).length} | Bloques de 50 min |
| **🤝 De lo Humano y lo Comunitario** | Educación Socioemocional, Educación Física, Vida Saludable | ${nodes.filter(n => n.campo.includes('Humano')).length} | Bloques de 50 min |
| **TOTAL** | **Fase 5 Completa (5º y 6º Primaria)** | **${nodes.length} Nodos** | **100% Cobertura SEP 2024** |

---
`;

  for (const campo of camposOrder) {
    const campoNodes = nodes.filter(n => n.campo.toLowerCase().includes(campo.toLowerCase().substring(0, 5)));
    const icon = campo.includes('Lenguajes') ? '🗣️' : campo.includes('Saberes') ? '🧬' : campo.includes('Etica') || campo.includes('Ética') ? '🌍' : '🤝';

    indexMarkdown += `\n## ${icon} Campo Formativo: ${campo}\n\n`;

    const materias = Array.from(new Set(campoNodes.map(n => n.materia)));
    for (const mat of materias) {
      indexMarkdown += `### 📖 ${mat}\n\n`;
      const matNodes = campoNodes.filter(n => n.materia === mat);

      for (const node of matNodes) {
        indexMarkdown += `- **${node.grado}:** [[${node.relPath.replace(/\.md$/, '')}|${node.title}]]  \n`;
        indexMarkdown += `  - *Tema:* ${node.tema}  \n`;
        indexMarkdown += `  - *Duración:* ${node.duracion}  \n`;
        if (node.pda) {
          indexMarkdown += `  - *PDA:* \`${node.pda.substring(0, 110)}...\`  \n`;
        }
        indexMarkdown += `\n`;
      }
    }
  }

  indexMarkdown += `\n---
## 🌐 Conexiones en el Grafo del Segundo Cerebro (Red MOC)
- [[../../Secundaria/00_Indice_Maestro_Secundaria_NEM|Índice Maestro de Secundaria (Fase 6)]]
- Tags Globales: #fase5_primaria #iskool #planeacion_nem #segundo_cerebro #sep2024

*Generado, validado y sincronizado automáticamente para la cuenta del Prof. Israel López Ángeles & Bóveda Obsidian ISkool.*
`;

  const masterIndexPath = path.join(FASE5_VAULT_BASE, '00_Indice_Maestro_Primaria_Fase5_NEM.md');
  fs.writeFileSync(masterIndexPath, indexMarkdown, 'utf8');
  console.log(`⭐ Índice Maestro Fase 5 Creado con éxito en: ${masterIndexPath}`);
}

export async function runVaultGeneration() {
  console.log(`🚀 Iniciando generación completa de las 36 Planeaciones de Primaria Fase 5 (SEP 2024)...`);
  console.log(`📂 Destino: ${FASE5_VAULT_BASE}\n`);

  if (fs.existsSync(FASE5_VAULT_BASE)) {
    fs.rmSync(FASE5_VAULT_BASE, { recursive: true, force: true });
  }
  fs.mkdirSync(FASE5_VAULT_BASE, { recursive: true });

  let count = 0;
  for (const node of fase5Curriculum) {
    const targetDir = path.join(FASE5_VAULT_BASE, node.grado, node.campoTag, node.materiaFolder);
    fs.mkdirSync(targetDir, { recursive: true });

    const safeTitle = node.tituloProyecto
      .split(':')[0]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 40);
    const numStr = String(node.temaNum).padStart(2, '0');
    const fileName = `Plan_${numStr}_${safeTitle}.md`;
    const filePath = path.join(targetDir, fileName);

    const tagCampo = node.campoTag.toLowerCase();
    const tagGrado = node.grado.toLowerCase();
    const tagMateria = node.materiaFolder.toLowerCase();
    const timestamp = new Date().toISOString();

    const markdown = `---
tags: [iskool, planeacion_nem, segundo_cerebro, campo_${tagCampo}, grado_${tagGrado}, materia_${tagMateria}, fase5_primaria]
campo_formativo: "${node.campo}"
materia: "${node.materia}"
grado: "${node.gradoDisplay}"
nivel: "Primaria (Fase 5)"
tema: "${node.temaTitulo}"
docente: "Prof. Israel López Ángeles"
fecha_creacion: "${timestamp}"
---

# ${node.tituloProyecto}

> [!INFO] **Ficha Técnica NEM 2024 (Fase 5)**
> - **Docente Titular:** Prof. Israel López Ángeles
> - **Nivel / Fase:** ${node.gradoDisplay} • Fase 5 (Primaria)
> - **Campo Formativo:** ${node.campo}
> - **Asignatura / Área:** ${node.materia}
> - **Duración Estimada:** ${node.duracion}
> - **Ejes Articuladores:** ${node.ejes.join(' • ')}

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Oficial SEP)

> **${node.pda}**

---

## ❓ II. Preguntas Detonadoras para el Salón (Conflicto Cognitivo y Apertura)

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

### Evidencia de Aprendizaje Entregable
**${node.evidenciaEntregable}**

---

## 🔗 VI. Conexiones en el Grafo del Segundo Cerebro (Obsidian Wikilinks)
- [[00_Indice_Maestro_Primaria_Fase5_NEM|Índice Maestro de Primaria Fase 5]]
- [[../../00_Indice_Maestro_Primaria_Fase5_NEM|MOC Segundo Cerebro ISkool]]
`;

    fs.writeFileSync(filePath, markdown, 'utf8');
    console.log(`✅ [${node.grado}] ${node.materia}: ${node.tituloProyecto}`);
    count++;
  }

  console.log(`\n🎉 Generadas ${count} planeaciones con éxito.`);
  buildFase5MasterIndex();

  // Git Sincronización en la Bóveda de Obsidian
  try {
    console.log(`\n🔄 Sincronizando con Git en la Bóveda de Obsidian...`);
    await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" add -A`);
    await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" commit -m "feat(planeaciones): 36 planeaciones completas Primaria Fase 5 (SEP 2024) - Prof. Israel Lopez Angeles"`).catch((e) => {
      console.log('Git commit notice:', e.message);
    });
    console.log(`🚀 Enviando cambios a GitHub (git push origin main)...`);
    const pushRes = await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" push origin main`);
    console.log(`✅ Git Push exitoso en Obsidian Vault:`, pushRes.stdout || 'Actualizado en remoto.');
  } catch (gitErr: any) {
    console.warn(`⚠️ Aviso de Git Push en Obsidian: ${gitErr?.message || gitErr}`);
  }
}

runVaultGeneration();
