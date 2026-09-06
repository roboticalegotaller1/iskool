import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const FASE4_VAULT_BASE = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones', 'Primaria_Fase_4');

export interface NodeMetadata {
  id: string;
  campo: string;
  campoTag: string;
  materia: string;
  materiaFolder: string;
  grado: '3er_Grado' | '4to_Grado';
  gradoDisplay: string;
  temaNum: number;
  temaTitulo: string;
  tituloProyecto: string;
  ejes: string[];
  pda: string;
  detonadoras: string[];
  inicioDetalle: string;
  desarrolloDetalle: string;
  cierreDetalle: string;
  evaluacionCriterios: string[];
  materiales: string;
  entregable: string;
}

// 80 planeaciones (20 por cada uno de los 4 Campos Formativos de Fase 4)
export const fase4Data: NodeMetadata[] = [
  // ==========================================
  // CAMPO 1: LENGUAJES (20 PLANEACIONES)
  // ==========================================
  {
    id: 'fase4-len-01',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 1,
    temaTitulo: 'Narración de sucesos del pasado y del presente',
    tituloProyecto: 'El Baúl de los Cuentacuentos: Estructuras Narrativas Circulares y Recuerdos Escolares',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Inclusión'],
    pda: 'Fase 4 (3º Primaria) - Identifica y comprende la función y las características principales de la narración. Reconoce y usa las estructuras narrativas: lineal, circular, in media res y otras, de acuerdo con su propia cultura y gusto para narrar. Identifica y establece relaciones causa-efecto en una narración. Usa el punto y el punto y seguido para separar oraciones en un párrafo.',
    detonadoras: [
      '¿Por qué nos fascina que nos cuenten historias y cómo sabemos cuándo una historia empieza por el final o en medio de la acción?',
      '¿Qué ocurre cuando olvidamos poner puntos y seguidos en un texto largo?',
      '¿Cómo se relacionan los motivos de un personaje con las consecuencias de sus acciones en un cuento?',
      '¿Qué relato emocionante de tu vida escolar te gustaría transformar en leyenda escrita?'
    ],
    inicioDetalle: 'Dinámica "El Relato Desordenado": Lectura de tiras narrativas en desorden temporal (in media res) para ordenarlas cronológicamente. Presentación de estructuras lineales y circulares.',
    desarrolloDetalle: 'Taller de Escritura en Parejas: Redacción de una anécdota escolar con estructura circular. Aplicación de la regla de los 3 puntos y seguidos por párrafo y distinción de causa-efecto.',
    cierreDetalle: 'Lectura en voz alta en el Círculo de Cuentacuentos. Metacognición sobre la importancia del punto y seguido. Entrega del primer borrador evaluado.',
    evaluacionCriterios: [
      'Estructura narrativa circular y relaciones lógicas de causa-efecto',
      'Uso normativo de punto y seguido y mayúsculas iniciales',
      'Fluidez lectora y expresión oral en la socialización'
    ],
    materiales: 'Tiras de papel kraft, hojas de colores, plumones y tarjetas de conectores temporales.',
    entregable: 'Cuento ilustrado "La Aventura Circular de Nuestro Salón" con puntuación normativa.'
  },
  {
    id: 'fase4-len-02',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 2,
    temaTitulo: 'Descripción de personas, lugares, hechos y procesos',
    tituloProyecto: 'Retratos Vivos: Adjetivos, Adverbios y Paisajes de Mi Localidad',
    ejes: ['Artes y Experiencias Estéticas', 'Apropiación de las Culturas'],
    pda: 'Fase 4 (3º Primaria) - Comprende, a partir de la lectura de textos descriptivos, que hay formas detalladas para describir a las personas y los lugares, señalando características que van más allá de su apariencia. Reflexiona sobre el uso de adjetivos, adverbios y frases adverbiales. Planea, escribe y corrige textos en orden cronológico. Usa la coma al enumerar y mayúsculas.',
    detonadoras: [
      '¿Cómo describimos a un ser querido destacando su bondad y valentía además de sus rasgos físicos?',
      '¿Qué diferencia existe entre "caminó" y "caminó lentamente hacia la vieja arboleda"?',
      '¿Por qué usamos comas en una lista de cualidades o ingredientes?',
      '¿Qué rincón especial de nuestra colonia merece un poema descriptivo?'
    ],
    inicioDetalle: 'Juego "El Personaje Secreto": Adivinar personas a partir de descripciones de carácter y fisionomía. Clasificación de sustantivos, adjetivos y adverbios.',
    desarrolloDetalle: 'Taller de Retrato Literario: Describir a un personaje entrañable del barrio y su lugar de trabajo usando al menos 4 comas enumerativas y frases adverbiales.',
    cierreDetalle: 'Montaje de la Galería de Retratos Vivos en el aula. Coevaluación con lista de cotejo ortográfica.',
    evaluacionCriterios: [
      'Riqueza adjetiva y descripción de cualidades internas y externas',
      'Empleo normativo de la coma enumerativa y mayúsculas',
      'Ilustración estética contextualizada'
    ],
    materiales: 'Hojas opalina, acuarelas, pinceles y fichas de vocabulario descriptivo.',
    entregable: 'Lámina Descriptiva Ilustrada "Rostros y Rincones Entrañables de Mi Comunidad".'
  },
  {
    id: 'fase4-len-03',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 3,
    temaTitulo: 'Diálogo para la toma de acuerdos y el intercambio de puntos de vista',
    tituloProyecto: 'La Asamblea Infantil: El Bastón de la Palabra y la Escucha Activa',
    ejes: ['Inclusión', 'Pensamiento Crítico', 'Igualdad de Género'],
    pda: 'Fase 4 (3º Primaria) - Reconoce y usa pautas que norman los intercambios orales: turnos de palabra, escucha activa, volumen de voz, fórmulas de cortesía. Expresa ideas con claridad y razones que las sustentan. Participa activamente en diálogos para tomar acuerdos de beneficio común.',
    detonadoras: [
      '¿Por qué cuando todos hablamos a la vez nadie se entiende?',
      '¿Qué palabras mágicas de cortesía abren puertas y resuelven desacuerdos?',
      '¿Cómo expresamos un desacuerdo sin ofender a un compañero?',
      '¿Por qué es necesario dar una razón al proponer una regla?'
    ],
    inicioDetalle: 'Dinámica del Bastón de la Palabra: Respeto estricto del turno de habla. Reflexión sobre la cortesía en la comunicación.',
    desarrolloDetalle: 'Simulación de Asamblea de Aula: Debate sobre la organización de juegos en el recreo. Argumentación con la fórmula "Yo opino... porque...". Registro de acuerdos por el secretario infantil.',
    cierreDetalle: 'Firma simbólica del Acta de Acuerdos del Salón. Reflexión sobre la empatía y la escucha respetuosa.',
    evaluacionCriterios: [
      'Respeto a los turnos de habla y fórmulas de cortesía',
      'Claridad y argumentación lógica de posturas personales',
      'Capacidad de consenso y escucha activa'
    ],
    materiales: 'Bastón de la palabra adornado, pliego de papel bond, marcadores.',
    entregable: 'Acta de Acuerdos y Decálogo de Convivencia Escolar.'
  },
  {
    id: 'fase4-len-04',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 4,
    temaTitulo: 'Comprensión y producción de textos instructivos y recetas',
    tituloProyecto: 'El Taller de los Instructivos: Juegos de Patio, Recetas Saludables y Verbos en Infinitivo',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 4 (3º Primaria) - Identifica y reflexiona sobre la función de textos instructivos: organización de datos, numerales cronológicos, brevedad y precisión. Comprende recursos gráficos (diagramas, símbolos). Usa verbos en infinitivo o imperativo y términos secuenciales. Emplea signos de puntuación y dos puntos.',
    detonadoras: [
      '¿Qué ocurre si armamos un mueble o preparamos comida saltándonos pasos del instructivo?',
      '¿Cómo identificamos verbos en infinitivo (-ar, -er, -ir) vs imperativo?',
      '¿Qué función tienen los diagramas y flechas en un manual?',
      '¿Cómo redactarías las instrucciones de tu juego favorito para alguien que no lo conoce?'
    ],
    inicioDetalle: 'Reto de doblar una figura de papel con instrucciones confusas vs instructivo ilustrado y secuenciado.',
    desarrolloDetalle: 'Taller de Redacción de Instructivo: Escribir la receta de un platillo saludable o reglamento de juego tradicional con materiales, numerales, verbos en infinitivo y diagramas.',
    cierreDetalle: 'Prueba cruzada de instructivos entre equipos para verificar la claridad de las instrucciones. Ajustes ortográficos.',
    evaluacionCriterios: [
      'Estructura técnica de instructivo con materiales y pasos numerados',
      'Uso adecuado de verbos en infinitivo o imperativo y conectores temporales',
      'Claridad de diagramas visuales complementarios'
    ],
    materiales: 'Formatos de recetario, papel para manualidades, tijeras y colores.',
    entregable: 'Fichero Ilustrado "Manual de Juegos Tradicionales y Recetas de 3º".'
  },
  {
    id: 'fase4-len-05',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 5,
    temaTitulo: 'Búsqueda y manejo reflexivo de información',
    tituloProyecto: 'Detectives del Saber: El Diccionario, Signos de Interrogación y Fuentes Vivas',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas'],
    pda: 'Fase 4 (3º Primaria) - Formula preguntas para realizar la búsqueda de información y las responde tras localizarla. Emplea signos de interrogación ¿?. Usa variadas fuentes de consulta (libros, medios, personas). Reflexiona sobre el orden alfabético en diccionarios e índices para localizar información.',
    detonadoras: [
      '¿Por qué en español abrimos y cerramos signos de interrogación (¿ ?)?',
      '¿Cómo nos ayuda el abecedario a encontrar palabras rápidamente en el diccionario?',
      '¿A quién de nuestra comunidad podemos entrevistar como fuente viva de conocimiento?',
      '¿Cómo verificamos si una información responde a lo que investigamos?'
    ],
    inicioDetalle: 'Carrera de palabras en el diccionario usando palabras guía superiores. Reflexión sobre el orden alfabético.',
    desarrolloDetalle: 'Taller de Preguntas de Indagación: Elegir un tema de ciencias, formular 5 preguntas con ¿...? y buscar respuestas en la biblioteca escolar registrando fuentes y glosario.',
    cierreDetalle: 'Mesa de sabios para compartir hallazgos. Evaluación de fuentes consultadas y síntesis con paráfrasis.',
    evaluacionCriterios: [
      'Formulación de preguntas con signos de interrogación normativos',
      'Manejo ágil del diccionario y orden alfabético',
      'Extracción y síntesis de información de fuentes diversas'
    ],
    materiales: 'Diccionarios escolares, libros de biblioteca de aula, fichas bibliográficas.',
    entregable: 'Fichero de Investigación con 5 Preguntas Resueltas y Glosario Alfabético.'
  },
  {
    id: 'fase4-len-06',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 6,
    temaTitulo: 'Comprensión y producción de textos expositivos (problema-solución, causa-consecuencia)',
    tituloProyecto: 'Eco-Periodistas: Textos Expositivos de Problema-Solución en la Escuela',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 4 (4º Primaria) - Identifica efectos en textos expositivos. Planea, escribe y corrige textos expositivos de tipo: problema-solución, comparación-contraste, causa-consecuencia y enumeración. Selecciona fuentes y propone soluciones. Usa nexos comparativos y secuenciales.',
    detonadoras: [
      '¿Qué problema ambiental de nuestra escuela requiere una propuesta escrita?',
      '¿Cómo usamos nexos de contraste (en cambio, a diferencia de, por otro lado)?',
      '¿Por qué los textos expositivos deben basarse en evidencias y datos comprobables?',
      '¿Cómo estructuramos causas, consecuencias y soluciones en párrafos claros?'
    ],
    inicioDetalle: 'Proyección del Árbol de Problemas (Raíces: causas, Tronco: problema, Ramas: efectos). Análisis de nexos gramaticales.',
    desarrolloDetalle: 'Redacción de Artículo Expositivo: Estructurar causas y consecuencias del desperdicio de agua en la escuela y proponer una solución viable con nexos secuenciales y comparativos.',
    cierreDetalle: 'Lectura de propuestas comunitarias ante el grupo. Coevaluación con rúbrica analítica.',
    evaluacionCriterios: [
      'Estructura lógica de problema-solución y causa-consecuencia',
      'Uso variado y correcto de nexos comparativos y de secuencia',
      'Viabilidad y fundamentación de las soluciones planteadas'
    ],
    materiales: 'Textos expositivos muestra, cartulinas, tarjetas de conectores.',
    entregable: 'Artículo Expositivo Ilustrado "Soluciones Sustentables para Nuestra Escuela".'
  },
  {
    id: 'fase4-len-07',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 7,
    temaTitulo: 'Comprensión y producción de resúmenes',
    tituloProyecto: 'El Arte de la Síntesis: Ideas Principales, Paráfrasis y Gráficos Informativos',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas'],
    pda: 'Fase 4 (4º Primaria) - Explora y analiza el contenido de textos por resumir. Relaciona el texto con recursos complementarios (tablas, gráficas, recuadros). Registra con sus propias palabras la información relevante con paráfrasis. Revisa concordancia de género y número.',
    detonadoras: [
      '¿Por qué resumir no es copiar pedazos al azar sino entender la idea central?',
      '¿Cómo nos ayudan los recuadros y esquemas a sintetizar un texto largo?',
      '¿Qué es la concordancia de género y número y cómo evitar errores?',
      '¿Cómo explicamos un texto complejo usando nuestras propias palabras?'
    ],
    inicioDetalle: 'Dinámica del Telegrama Informativo: Reducir un texto largo a su esencia básica sin perder el sentido.',
    desarrolloDetalle: 'Taller de Resumen con Paráfrasis: Lectura de un texto sobre ecosistemas mexicanos, extracción de una idea principal por subtítulo y redacción fluida con concordancia gramatical.',
    cierreDetalle: 'Comparación de resúmenes entre pares. Metacognición sobre la utilidad del resumen para el estudio.',
    evaluacionCriterios: [
      'Identificación de ideas principales y paráfrasis propia',
      'Concordancia gramatical de género y número',
      'Integración de esquemas gráficos de apoyo'
    ],
    materiales: 'Artículos de divulgación infantil, marcatextos, fichas de trabajo.',
    entregable: 'Ficha de Resumen Académico con Paráfrasis y Esquema Visual.'
  },
  {
    id: 'fase4-len-08',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 8,
    temaTitulo: 'Entrevistas con personas de la comunidad para conocer diversos temas',
    tituloProyecto: 'Micrófono Abierto: Planificación, Preguntas Abiertas y Reporte de Entrevista Testimonial',
    ejes: ['Interculturalidad Crítica', 'Inclusión', 'Pensamiento Crítico'],
    pda: 'Fase 4 (4º Primaria) - Participa en entrevistas a personajes comunitarios sobre problemáticas y soluciones. Elabora preguntas pertinentes y evita redundancias. Usa signos de interrogación. Planifica propósito, entrevistados, duración y fecha. Aplica normas de cortesía y escucha activa.',
    detonadoras: [
      '¿Cuál es la diferencia entre una pregunta abierta y una cerrada?',
      '¿Cómo debemos presentarnos y escuchar con respeto a un entrevistado?',
      '¿Qué personas de nuestra comunidad tienen historias valiosas que compartir?',
      '¿Cómo citamos textualmente las palabras de un entrevistado usando comillas?'
    ],
    inicioDetalle: 'Role-play de entrevista en el aula. Análisis de preguntas interesantes vs preguntas repetitivas.',
    desarrolloDetalle: 'Diseño del Guion de Entrevista: Seleccionar a un personaje comunitario (artesana, médico, agricultor), redactar 6 preguntas abiertas y ensayar la conducción oral con modulación de voz.',
    cierreDetalle: 'Simulación de entrevistas y retroalimentación entre pares. Revisión del cronograma de aplicación.',
    evaluacionCriterios: [
      'Diseño de preguntas abiertas pertinentes y no redundantes',
      'Planificación formal y aplicación de normas de cortesía',
      'Registro testimonial fidedigno y reporte escrito'
    ],
    materiales: 'Formatos de guion de entrevista, gafetes de prensa, grabadora didáctica.',
    entregable: 'Guion y Reporte de Entrevista Comunitaria "Voces Vivas de Nuestra Tierra".'
  },
  {
    id: 'fase4-len-09',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 9,
    temaTitulo: 'Lectura y creación de poemas, canciones y juegos de palabras',
    tituloProyecto: 'Juglares y Poetas: Rima, Aliteración, Metáforas y Cancionero Tradicional',
    ejes: ['Artes y Experiencias Estéticas', 'Apropiación de las Culturas'],
    pda: 'Fase 4 (4º Primaria) - Reconoce el contexto de creación de poemas y canciones para interpretar su significado. Establece relaciones con experiencias de vida (metáforas). Identifica ritmo, aliteración y métrica. Experimenta con la creación de poemas y canciones en verso y prosa sobre temas significativos.',
    detonadoras: [
      '¿Cómo crean ritmo y musicalidad los trabalenguas y canciones populares?',
      '¿Qué emociones despierta un poema al recitarlo con la entonación adecuada?',
      '¿Cómo transformamos una emoción en una metáfora poética?',
      '¿Qué coplas tradicionales se cantan en nuestra región?'
    ],
    inicioDetalle: 'Recital de coplas tradicionales mexicanas con percusión corporal. Identificación de estrofas y versos.',
    desarrolloDetalle: 'Taller de Creación Lírica: Redactar un poema de 2 estrofas con rima consonante, aliteraciones y metáforas sobre la naturaleza o la amistad. Ensayos de modulación de voz.',
    cierreDetalle: 'Círculo de Poesía Coral. Reflexión sobre el lenguaje poético y entrega de textos ilustrados.',
    evaluacionCriterios: [
      'Creación poética con rima, métrica y figuras figuradas',
      'Identificación de ritmo, aliteración y pausas expresivas',
      'Declamación oral emotiva y respetuosa'
    ],
    materiales: 'Cancioneros populares, hojas decoradas, instrumentos de percusión menores.',
    entregable: 'Poema Ilustrado para el "Cancionero y Poemario de 4º Grado".'
  },
  {
    id: 'fase4-len-10',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Artes / Español',
    materiaFolder: 'Artes',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 10,
    temaTitulo: 'Lectura dramatizada y representación teatral con títeres y sombras',
    tituloProyecto: 'Sombras Legendarias: Teatro de Sombras y Lectura Dramatizada de Mitos',
    ejes: ['Artes y Experiencias Estéticas', 'Interculturalidad Crítica'],
    pda: 'Fase 4 (4º Primaria) - Explora en colectivo el movimiento, gesto, color y sonido para recrear lecturas mediante títeres y sombras. Realiza lectura dramatizada o teatro de atril modulando tonos y ritmos. Identifica estructura dramática: diálogos, personajes y acotaciones. Conoce cómics y onomatopeyas.',
    detonadoras: [
      '¿Cómo cobran vida las siluetas de cartón proyectadas con luz contra una tela?',
      '¿Cómo usamos onomatopeyas y sonidos caseros para generar suspenso?',
      '¿Qué función tienen las acotaciones para orientar a los actores?',
      '¿Por qué el teatro de sombras es una tradición milenaria mágica?'
    ],
    inicioDetalle: 'Demostración en vivo de teatro de sombras con lámparas y siluetas. Análisis del guion dramático.',
    desarrolloDetalle: 'Taller de Producción Escénica: Adaptar un mito indígena, fabricar títeres de silueta negra en varillas y ensayar la sincronía entre lectores de atril y titiriteros.',
    cierreDetalle: 'Representación de 2 minutos por equipo en el teatrino de sombras. Coevaluación del montaje.',
    evaluacionCriterios: [
      'Estructura formal del libreto con diálogos y acotaciones claras',
      'Manejo creativo de sombras, contrastes de luz y movimiento',
      'Expresión vocal dramatizada y efectos sonoros Foley'
    ],
    materiales: 'Cartulina negra, palillos de madera, lámparas LED, pantalla de tela blanca.',
    entregable: 'Guion Teatral Acotado y Montaje de Teatro de Sombras de Leyendas Mexicanas.'
  },
  {
    id: 'fase4-len-11',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 11,
    temaTitulo: 'Comunicación a distancia con personas y propósitos diversos',
    tituloProyecto: 'El Correo Escolar: Cartas Personales, Estampillas y Protección de Datos',
    ejes: ['Inclusión', 'Apropiación de las Culturas'],
    pda: 'Fase 4 (3º Primaria) - Lee y comenta cartas reales y literarias. Identifica partes de la carta postal o electrónica. Intercambia mensajes epistolares con propósitos definidos. Reflexiona sobre la protección de datos personales al comunicarse a distancia.',
    detonadoras: [
      '¿Qué datos lleva un sobre postal y por qué no debemos dar datos privados en redes?',
      '¿Cuál es la diferencia entre un mensaje digital y una carta escrita a mano?',
      '¿Qué partes forman una carta formal o familiar?',
      '¿A quién te gustaría enviar una carta de agradecimiento o felicitación?'
    ],
    inicioDetalle: 'Apertura del buzón postal del salón con sobres y timbres postales. Identificación de remitente y destinatario.',
    desarrolloDetalle: 'Taller Epistolar: Redacción de una carta afectuosa, diseño de estampilla postal con flora local y rotulación de sobre. Taller de protección de datos personales.',
    cierreDetalle: 'Depósito de cartas en el buzón escolar. Reflexión sobre la calidez de la correspondencia.',
    evaluacionCriterios: [
      'Estructura epistolar completa (fecha, saludo, cuerpo, despedida, firma)',
      'Rotulación precisa de sobre (remitente vs destinatario)',
      'Compromiso con la privacidad y protección de datos'
    ],
    materiales: 'Sobres, papel membretado, colores, estampillas didácticas.',
    entregable: 'Carta Manuscrita en Sobre Rotulado y Decálogo de Protección de Datos.'
  },
  {
    id: 'fase4-len-12',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 12,
    temaTitulo: 'Análisis e intercambio de comentarios sobre empaques y publicidad',
    tituloProyecto: 'Consumidores Críticos: Sellos de Advertencia y Contra-Publicidad',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 4 (3º Primaria) - Reconoce información en empaques y anuncios publicitarios. Comprende advertencias en el etiquetado. Analiza recursos persuasivos gráficos y audiovisuales. Reflexiona sobre beneficios, perjuicios y consumo responsable.',
    detonadoras: [
      '¿Qué significan los octágonos negros en la comida chatarra?',
      '¿Cómo usan los comerciales dibujos animados para convencernos de comprar?',
      '¿Por qué revisar la fecha de caducidad e ingredientes nos cuida?',
      '¿Cómo diseñamos un anuncio honesto para promover frutas naturales?'
    ],
    inicioDetalle: 'Comparación de empaques ultraprocesados vs alimentos frescos. Reflexión sobre la publicidad seductora.',
    desarrolloDetalle: 'Auditoría de Empaques: Analizar sellos NOM-051 de 3 productos comerciales y crear un cartel de contra-publicidad que informe la verdad nutricional.',
    cierreDetalle: 'Exposición en el Muro del Consumo Inteligente. Metacognición sobre elecciones saludables.',
    evaluacionCriterios: [
      'Interpretación de sellos de advertencia y fechas de caducidad',
      'Análisis crítico del lenguaje persuasivo en anuncios',
      'Creatividad en propuestas de consumo sustentable'
    ],
    materiales: 'Empaques vacíos limpios, cartulinas, plumones y tijeras.',
    entregable: 'Cartel de Contra-Publicidad y Ficha de Auditoría de Etiquetado Nutricional.'
  },
  {
    id: 'fase4-len-13',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 13,
    temaTitulo: 'Indagación, reelaboración y difusión de notas informativas',
    tituloProyecto: 'La Gaceta Escolar: Hechos, Opiniones y Estructura de la Noticia',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 4 (3º Primaria) - Interactúa con medios de comunicación y comenta noticias. Identifica las 6 preguntas clave (qué, quién, cómo, cuándo, dónde, por qué). Distingue entre hechos objetivos y opiniones. Difunde notas en periódico mural o boletín escolar.',
    detonadoras: [
      '¿Cuáles son las 6 preguntas fundamentales que responde una noticia?',
      '¿Cómo diferenciamos un hecho comprobable de una opinión subjetiva?',
      '¿Qué secciones integran un periódico escolar?',
      '¿Qué acontecimiento valioso de nuestra escuela queremos reportar?'
    ],
    inicioDetalle: 'Lectura de una noticia comunitaria destacada. Identificación de hechos y opiniones.',
    desarrolloDetalle: 'Redacción Periodística: Escribir una nota escolar respondiendo a las 6 preguntas, agregando fotografía con pie de foto y comentario editorial del equipo.',
    cierreDetalle: 'Armado del Periódico Mural Escolar en el patio. Reflexión sobre la veracidad periodística.',
    evaluacionCriterios: [
      'Cobertura completa de las 6 preguntas básicas del periodismo',
      'Distinción clara y argumentada entre hecho y opinión',
      'Redacción concisa, ortografía y diagramación atractiva'
    ],
    materiales: 'Papel periódico, cartulinas, tijeras, pegamento y plumones.',
    entregable: 'Nota Informativa Ilustrada y Sección para el Periódico Mural Escolar.'
  },
  {
    id: 'fase4-len-14',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 14,
    temaTitulo: 'Uso de textos formales para asuntos personales o comunitarios',
    tituloProyecto: 'Identidad Ciudadana: Actas de Nacimiento, CURP y Formularios Escolares',
    ejes: ['Inclusión', 'Pensamiento Crítico'],
    pda: 'Fase 4 (3º Primaria) - Reconoce características de documentos personales (acta de nacimiento, cartilla, credenciales). Comprende el valor de siglas (SEP, CURP, IMSS), sellos oficiales y firmas de autorización. Identifica su utilidad para trámites y derechos.',
    detonadoras: [
      '¿Por qué el acta de nacimiento es la llave de nuestra identidad legal?',
      '¿Qué significan siglas oficiales como CURP, SEP o IMSS?',
      '¿Qué validez otorgan los sellos y firmas en un certificado?',
      '¿Qué trámites requieren mostrar nuestros documentos personales?'
    ],
    inicioDetalle: 'Exploración de facsímiles de documentos de identidad oficiales. Identificación de sellos y siglas.',
    desarrolloDetalle: 'Taller de Documentación: Diseñar una credencial escolar con foto, firma y siglas institucionales; y llenar un formulario de inscripción sin tachaduras.',
    cierreDetalle: 'Sellado y validación de credenciales. Reflexión sobre el derecho a la identidad.',
    evaluacionCriterios: [
      'Identificación y análisis de datos en documentos oficiales',
      'Comprensión de siglas, sellos de seguridad y firmas',
      'Llenado pulcro y exacto de formularios formales'
    ],
    materiales: 'Formatos didácticos de actas y credenciales, sellos de tinta.',
    entregable: 'Credencial Escolar Oficial Diseñada y Formulario de Trámite Llenado.'
  },
  {
    id: 'fase4-len-15',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 15,
    temaTitulo: 'Indagación sobre la diversidad lingüística de la comunidad y del país',
    tituloProyecto: 'Raíces Vivas: Toponimias Indígenas y Palabras de Origen Originario',
    ejes: ['Interculturalidad Crítica', 'Apropiación de las Culturas'],
    pda: 'Fase 4 (3º Primaria) - Reconoce nombres de lugares (toponimias), objetos y palabras de origen indígena (náhuatl, maya, mixteco). Emplea expresiones lingüísticas indígenas en forma oral y escrita. Identifica variantes dialectales y valora las lenguas originarias.',
    detonadoras: [
      '¿Por qué pueblos como Chapultepec o Coyoacán tienen nombres en náhuatl?',
      '¿Qué indigenismos usamos todos los días al hablar español (chocolate, comal, papalote)?',
      '¿Qué lenguas originarias se hablan en nuestro estado?',
      '¿Cómo representamos el significado de los pueblos en glifos estilo códice?'
    ],
    inicioDetalle: 'Mapeo toponímico: Descubrir etimologías prehispánicas de municipios del estado.',
    desarrolloDetalle: 'Taller de Códices y Vocabulario: Elaborar tarjetas léxicas con palabras indígenas, su significado etimológico e ilustración con glifos tradicionales.',
    cierreDetalle: 'Mural Colectivo "El Árbol de las Lenguas de México". Reflexión sobre el orgullo plurilingüe.',
    evaluacionCriterios: [
      'Identificación y análisis etimológico de toponimias e indigenismos',
      'Valoración y respeto hacia las lenguas originarias de México',
      'Creatividad visual en el trazo de glifos y tarjetas léxicas'
    ],
    materiales: 'Mapas estatales, diccionarios de náhuatl/maya, papel kraft.',
    entregable: 'Mapa Toponímico Ilustrado y Fichero de Indigenismos de Uso Diario.'
  },
  {
    id: 'fase4-len-16',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español / Geografía',
    materiaFolder: 'Espanol',
    grado: '3er_Grado',
    gradoDisplay: '3º de Primaria',
    temaNum: 16,
    temaTitulo: 'Uso de croquis y mapas para describir trayectos o localizar lugares',
    tituloProyecto: 'Mi Barrio en un Plano: Croquis, Puntos Cardinales y Rutas Seguras',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 4 (3º Primaria) - Observa croquis e identifica características y convenciones (Rosa de los Vientos, símbolos, referencias). Usa palabras espaciales (esquina, paralelo, perpendicular, girar al Norte). Elabora croquis y describe trayectos claros.',
    detonadoras: [
      '¿Cómo ayuda un croquis a quien no conoce nuestra colonia a llegar sin perderse?',
      '¿Por qué la Rosa de los Vientos es la brújula indispensable de todo mapa?',
      '¿Qué símbolos universales usamos para ubicar escuelas, parques y hospitales?',
      '¿Cómo describimos una ruta segura de la casa a la escuela?'
    ],
    inicioDetalle: 'Dinámica de orientación espacial con brújula y puntos cardinales en el patio escolar.',
    desarrolloDetalle: 'Taller Cartográfico: Dibujar el croquis de la ruta a la escuela con cuadrícula, Rosa de los Vientos, simbología a color y guía escrita con vocabulario espacial normativo.',
    cierreDetalle: 'Prueba de rutas entre parejas para verificar precisión. Metacognición sobre la orientación.',
    evaluacionCriterios: [
      'Diseño correcto de croquis con puntos cardinales y cuadro de simbología',
      'Uso adecuado de términos de orientación espacial y trayectorias',
      'Identificación de zonas seguras y rutas de tránsito escolar'
    ],
    materiales: 'Hojas cuadriculadas, reglas, brújulas didácticas, colores.',
    entregable: 'Plano Croquis Ilustrado "Mi Ruta Segura" y Guía de Trayectorias.'
  },
  {
    id: 'fase4-len-17',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Artes',
    materiaFolder: 'Artes',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 17,
    temaTitulo: 'Reconocimiento y reflexión sobre el uso de elementos de los lenguajes artísticos',
    tituloProyecto: 'Colores y Texturas de México: Apreciación Estética y Danzas Tradicionales',
    ejes: ['Artes y Experiencias Estéticas', 'Interculturalidad Crítica'],
    pda: 'Fase 4 (4º Primaria) - Distingue movimientos, vestuarios, aromas, sonidos y objetos en manifestaciones artísticas y culturales de la comunidad y del mundo. Compara expresiones compartiendo conclusiones mediante escritos o dibujos. Aprecia la diversidad cultural.',
    detonadoras: [
      '¿Cómo un traje típico bordado expresa la cosmovisión de un pueblo?',
      '¿Qué emociones transmiten los contrastes entre colores cálidos y fríos?',
      '¿Cómo se integran música, vestuario y danza en una fiesta patronal?',
      '¿Qué manifestaciones artísticas locales te llenan de orgullo?'
    ],
    inicioDetalle: 'Muestrario sensorial de música tradicional, textiles bordados y paletas de color folclórico.',
    desarrolloDetalle: 'Folio de Apreciación Estética: Analizar una danza tradicional mexicana (Danza del Venado o Huapango) describiendo vestuario, ritmo, gestos y significado cultural con dibujo en técnica mixta.',
    cierreDetalle: 'Galería del Arte Popular en el salón. Reflexión sobre el respeto a las tradiciones.',
    evaluacionCriterios: [
      'Identificación y análisis de elementos plásticos, musicales y dancísticos',
      'Comprensión del valor simbólico e histórico de las manifestaciones',
      'Expresión gráfica con variedad de texturas y colores'
    ],
    materiales: 'Muestras textiles, gises pastel, cartoncillo brístol, grabadora de audio.',
    entregable: 'Folio Curatorial Ilustrado "El Latido del Arte Tradicional Mexicano".'
  },
  {
    id: 'fase4-len-18',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Artes',
    materiaFolder: 'Artes',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 18,
    temaTitulo: 'Creación de propuestas con intención artística para mejorar la escuela',
    tituloProyecto: 'Urbanismo Lúdico: Maquetas e Intervenciones Artísticas en el Patio Escolar',
    ejes: ['Artes y Experiencias Estéticas', 'Inclusión', 'Vida Saludable'],
    pda: 'Fase 4 (4º Primaria) - Crea producciones con lenguajes visuales y espaciales para la mejora comunitaria. Elabora en colectivo propuestas con intención artística (murales, juegos en piso, esculturas recicladas) para resolver situaciones de convivencia escolar.',
    detonadoras: [
      '¿Cómo puede el arte visual mejorar la convivencia en el recreo?',
      '¿Qué juegos geométricos podemos diseñar en el piso del patio?',
      '¿Cómo convertimos materiales reciclados en esculturas útiles?',
      '¿Por qué cuidar y embellecer la escuela beneficia a todos?'
    ],
    inicioDetalle: 'Recorrido de observación por el patio escolar detectando espacios grises o conflictivos.',
    desarrolloDetalle: 'Taller de Maquetas: Diseñar un proyecto artístico escolar (juegos de piso, mural de paz o señalética creativa) con boceto a escala, materiales reutilizables y justificación social.',
    cierreDetalle: 'Feria de Proyectos Artísticos Escolares. Coevaluación de propuestas viables.',
    evaluacionCriterios: [
      'Propuesta artística enfocada en la convivencia y mejora escolar',
      'Creatividad en el diseño espacial y uso de materiales sustentables',
      'Trabajo colaborativo y argumentación comunitaria'
    ],
    materiales: 'Cartón reciclado, plastilina, pinturas acrílicas, gises de colores.',
    entregable: 'Maqueta y Proyecto de Intervención Artística "Patio Lúdico de Convivencia".'
  },
  {
    id: 'fase4-len-19',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Artes / Español',
    materiaFolder: 'Artes',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 19,
    temaTitulo: 'Experimentación con elementos visuales y sonoros en producciones colectivas',
    tituloProyecto: 'El Cuaderno Mágico: Animación Cuadro por Cuadro y Folioscopio (Flipbook)',
    ejes: ['Artes y Experiencias Estéticas', 'Pensamiento Crítico'],
    pda: 'Fase 4 (4º Primaria) - Crea animaciones colectivas con secuencias fotográficas o folioscopios (flip books) y sonorización casera. Recrea experiencias mediante objetos intervenidos y elementos visuales/sonoros para transmitir ideas constructivas.',
    detonadoras: [
      '¿Cómo percibe el ojo la ilusión de movimiento al pasar dibujos rápidos?',
      '¿Cómo dibujamos transformaciones cuadro por cuadro en un flipbook?',
      '¿Cómo creamos efectos de sonido caseros (Foley) para ambientar una historia?',
      '¿Qué mensaje sobre el medio ambiente podemos animar en 25 páginas?'
    ],
    inicioDetalle: 'Demostración de un flipbook artesanal mostrando una metamorfosis fluida.',
    desarrolloDetalle: 'Taller de Animación: Elaborar un folioscopio de 25 tarjetas dibujando una secuencia de cambios milimétricos y grabar efectos de sonido Foley con objetos cotidianos.',
    cierreDetalle: 'Muestra de Mini-Cine en el aula con cámara digital. Reflexión sobre la paciencia creadora.',
    evaluacionCriterios: [
      'Continuidad y fluidez en la secuencia de animación cuadro a cuadro',
      'Creatividad en la narrativa visual y transformación del personaje',
      'Integración armónica de efectos sonoros caseros'
    ],
    materiales: 'Blocks de notas gruesas, grapadoras, lápices de dibujo, objetos sonoros.',
    entregable: 'Folioscopio (Flipbook) Artesanal de 25 Cuadros Sonorizado.'
  },
  {
    id: 'fase4-len-20',
    campo: 'Lenguajes',
    campoTag: 'lenguajes',
    materia: 'Español',
    materiaFolder: 'Espanol',
    grado: '4to_Grado',
    gradoDisplay: '4º de Primaria',
    temaNum: 20,
    temaTitulo: 'Comprensión y producción de cuentos para su disfrute',
    tituloProyecto: 'Escritores Fantásticos: El Pretérito, el Copretérito y los Diálogos Directos',
    ejes: ['Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 4 (4º Primaria) - Selecciona y lee cuentos de diversos orígenes. Reflexiona sobre el uso del pretérito y copretérito (-aba, -ía) para narrar el pasado y el presente en diálogos directos. Planea, escribe y corrige cuentos sobre temas de su interés con personajes originales.',
    detonadoras: [
      '¿Cuál es la diferencia entre una acción puntual en pretérito y una descripción en copretérito?',
      '¿Por qué los verbos en copretérito llevan terminación -aba o -ía con acento?',
      '¿Cómo construimos un conflicto emocionante en un cuento?',
      '¿Cómo usamos guiones largos (—) para dar voz a los personajes?'
    ],
    inicioDetalle: 'Lectura de fragmentos literarios identificando tiempos verbales del pasado.',
    desarrolloDetalle: 'Taller Literario: Escribir un cuento en 3 actos usando descripciones en copretérito, eventos clave en pretérito y diálogos con guion largo. Revisión ortográfica de acentuación.',
    cierreDetalle: 'Lectura dramatizada de cuentos en la fogata artificial del aula.',
    evaluacionCriterios: [
      'Uso adecuado y diferenciado de pretérito, copretérito y presente',
      'Estructura narrativa sólida con inicio, nudo, clímax y desenlace',
      'Puntuación normativa en diálogos y ortografía acentual'
    ],
    materiales: 'Hojas membretadas, guías de conjugación verbal, colores.',
    entregable: 'Cuento Fantástico Ilustrado para la Antología de Aula.'
  }
];

import { saberesData } from './fase4_data_saberes';
import { eticaData } from './fase4_data_etica';
import { humanoData } from './fase4_data_humano';

export const allFase4Curriculum: NodeMetadata[] = [
  ...fase4Data,
  ...saberesData,
  ...eticaData,
  ...humanoData
];

export function buildFase4MasterIndex() {
  console.log(`🗺️ Construyendo Índice Maestro de Nodos Curriculares de Primaria Fase 4 (SEP 2024)...`);

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

  const files = getFiles(FASE4_VAULT_BASE);
  console.log(`Total de nodos encontrados en Primaria Fase 4: ${files.length}`);

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
    const relPath = path.relative(FASE4_VAULT_BASE, f).replace(/\\/g, '/');
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
      grado: gradoMatch ? gradoMatch[1].trim() : 'Fase 4',
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
tags: [iskool, indice_maestro, moc, segundo_cerebro, fase4_primaria]
titulo: "Mapa de Nodos Curriculares: Primaria Fase 4 NEM 2024"
docente: "Prof. Israel López Ángeles"
total_planeaciones: ${nodes.length}
fecha_actualizacion: "${new Date().toISOString()}"
---

# 🗺️ Mapa de Nodos Curriculares: Primaria Fase 4 NEM 2024 (3º y 4º Grado)
**Super Usuario Docente:** Prof. Israel López Ángeles  
**Institución:** Plataforma Académica ISkool / Programa Sintético Oficial SEP 2024  
**Total de Nodos Curriculares Activos:** ${nodes.length} Planeaciones Didácticas Especializadas  

Este nodo actúa como el **Centro de Enlace Maestro (Map of Content - MOC)** y Segundo Cerebro en la Bóveda de Obsidian, articulando los 4 Campos Formativos de la **Fase 4 de Educación Primaria (3º y 4º Grado)** con dosificación didáctica por bloques de **50 minutos**, Procesos de Desarrollo de Aprendizaje (PDA) oficiales al 100%, rúbricas formativas analíticas e integración con la comunidad escolar.

---

## 📊 Resumen Ejecutivo del Ecosistema Curricular Fase 4

| Campo Formativo | Asignaturas / Áreas | Nodos Activos | Dosificación |
| :--- | :--- | :---: | :---: |
| **🗣️ Lenguajes** | Español, Artes, Narración, Expositivos, Poesía, Teatro | ${nodes.filter(n => n.campo.includes('Lenguajes')).length} | Bloques de 50 min |
| **🧬 Saberes y Pensamiento Científico** | Ciencias Naturales, Cuerpo Humano, Ecosistemas, Matemáticas | ${nodes.filter(n => n.campo.includes('Saberes')).length} | Bloques de 50 min |
| **🌍 Ética, Naturaleza y Sociedades** | Geografía, Historia, Formación Cívica y Ética, Comunidades | ${nodes.filter(n => n.campo.includes('Etica') || n.campo.includes('Ética')).length} | Bloques de 50 min |
| **🤝 De lo Humano y lo Comunitario** | Educación Socioemocional, Educación Física, Vida Saludable | ${nodes.filter(n => n.campo.includes('Humano')).length} | Bloques de 50 min |
| **TOTAL** | **Fase 4 Completa (3º y 4º Primaria)** | **${nodes.length} Nodos** | **100% Cobertura SEP 2024** |

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
- [[../../Primaria_Fase_5/00_Indice_Maestro_Primaria_Fase5_NEM|Índice Maestro de Primaria Fase 5]]
- [[../../Secundaria/00_Indice_Maestro_Secundaria_NEM|Índice Maestro de Secundaria (Fase 6)]]
- Tags Globales: #fase4_primaria #iskool #planeacion_nem #segundo_cerebro #sep2024

*Generado, validado y sincronizado automáticamente para la cuenta del Prof. Israel López Ángeles & Bóveda Obsidian ISkool.*
`;

  const masterIndexPath = path.join(FASE4_VAULT_BASE, '00_Indice_Maestro_Primaria_Fase4_NEM.md');
  fs.writeFileSync(masterIndexPath, indexMarkdown, 'utf8');
  console.log(`⭐ Índice Maestro Fase 4 Creado con éxito en: ${masterIndexPath}`);
}

// Generador de Nodos y MOC
export async function runFase4Generation() {
  console.log(`🚀 Iniciando generación completa de las 80 Planeaciones de Primaria Fase 4 (SEP 2024)...`);
  console.log(`📂 Destino: ${FASE4_VAULT_BASE}\n`);

  if (fs.existsSync(FASE4_VAULT_BASE)) {
    fs.rmSync(FASE4_VAULT_BASE, { recursive: true, force: true });
  }
  fs.mkdirSync(FASE4_VAULT_BASE, { recursive: true });

  let count = 0;
  for (const node of allFase4Curriculum) {
    const targetDir = path.join(FASE4_VAULT_BASE, node.grado, node.campoTag, node.materiaFolder);
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
tags: [iskool, planeacion_nem, segundo_cerebro, campo_${tagCampo}, grado_${tagGrado}, materia_${tagMateria}, fase4_primaria]
campo_formativo: "${node.campo}"
materia: "${node.materia}"
grado: "${node.gradoDisplay}"
nivel: "Primaria (Fase 4)"
tema: "${node.temaTitulo}"
docente: "Prof. Israel López Ángeles"
fecha_creacion: "${timestamp}"
---

# ${node.tituloProyecto}

> [!INFO] **Ficha Técnica NEM 2024 (Fase 4)**
> - **Docente Titular:** Prof. Israel López Ángeles
> - **Nivel / Fase:** ${node.gradoDisplay} • Fase 4 (Primaria)
> - **Campo Formativo:** ${node.campo}
> - **Asignatura / Área:** ${node.materia}
> - **Duración Estimada:** 2 sesiones de 50 minutos (Total: 100 min)
> - **Ejes Articuladores:** ${node.ejes.join(' • ')}

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Oficial SEP)

> **${node.pda}**

---

## ❓ II. Preguntas Detonadoras para el Salón (Conflicto Cognitivo y Apertura)

${node.detonadoras.map((preg, idx) => `${idx + 1}. **${preg}**`).join('\n\n')}

---

## ⏱️ III. Secuencia Didáctica (Dosificación en Bloques de 50 minutos)

### 📌 Inicio (10 minutos)
${node.inicioDetalle}

### 🔬 Desarrollo (30 minutos)
${node.desarrolloDetalle}

### 💡 Cierre (10 minutos)
${node.cierreDetalle}

---

## 📋 IV. Evaluación Formativa y Rúbrica Analítica

### Criterios de Evaluación y Niveles de Logro
${node.evaluacionCriterios.map((crit, idx) => `• **Criterio ${idx + 1}:** ${crit}\n  - *Sobresaliente (3.5 - 3 pts):* Demuestra dominio integral y autónomo.\n  - *Satisfactorio (2.5 - 2 pts):* Aplica los conceptos con orientación básica.\n  - *En Proceso (1.5 - 1 pt):* Requiere mediación y acompañamiento docente.`).join('\n\n')}

---

## 📦 V. Materiales, Recursos y Evidencias Entregables

### Materiales y Recursos Didácticos
${node.materiales}

### Evidencia de Aprendizaje Entregable
**${node.entregable}**

---

## 🔗 VI. Conexiones en el Grafo del Segundo Cerebro (Obsidian Wikilinks)
- [[00_Indice_Maestro_Primaria_Fase4_NEM|Índice Maestro de Primaria Fase 4]]
- [[../../00_Indice_Maestro_Primaria_Fase4_NEM|MOC Segundo Cerebro ISkool]]
`;

    fs.writeFileSync(filePath, markdown, 'utf8');
    console.log(`✅ [${node.grado}] ${node.materia}: ${node.tituloProyecto}`);
    count++;
  }

  console.log(`\n🎉 Generadas ${count} planeaciones con éxito.`);
  buildFase4MasterIndex();

  // Git Sincronización en la Bóveda de Obsidian
  try {
    console.log(`\n🔄 Sincronizando con Git en la Bóveda de Obsidian...`);
    await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" add -A`);
    await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" commit -m "feat(planeaciones): 80 planeaciones completas Primaria Fase 4 (SEP 2024) - Prof. Israel Lopez Angeles"`).catch((e) => {
      console.log('Git commit notice:', e.message);
    });
    console.log(`🚀 Enviando cambios a GitHub (git push origin main)...`);
    const pushRes = await execPromise(`git -C "${OBSIDIAN_VAULT_PATH}" push origin main`);
    console.log(`✅ Git Push exitoso en Obsidian Vault:`, pushRes.stdout || 'Actualizado en remoto.');
  } catch (gitErr: any) {
    console.warn(`⚠️ Aviso de Git Push en Obsidian: ${gitErr?.message || gitErr}`);
  }
}

runFase4Generation();

