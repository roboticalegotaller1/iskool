import fs from 'fs';
import path from 'path';

const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const VAULT_PLANNINGS = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones');

// =============================================================================
// METODOLOGÍAS, CONTEXTOS, PROBLEMÁTICAS Y ENTREGABLES NEM 2024
// =============================================================================

const METHODOLOGIES = [
  {
    name: 'Aprendizaje Basado en Proyectos Comunitarios (ABPC)',
    fases: ['1. Nos ponemos de acuerdo e identificamos la problemática', '2. Indagamos y recolectamos saberes comunitarios', '3. Diseñamos la solución y elaboramos el producto', '4. Presentamos a la comunidad y evaluamos formativamente']
  },
  {
    name: 'STEAM con Enfoque de Indagación Científica y Robótica',
    fases: ['1. Planteamiento de hipótesis y exploración del fenómeno', '2. Experimentación y modelado técnico-matemático', '3. Construcción del prototipo tecnológico', '4. Comunicación de conclusiones y aplicaciones sustentables']
  },
  {
    name: 'Aprendizaje Basado en Problemas (ABP)',
    fases: ['1. Presentación de la situación problemática real', '2. Definición del problema y búsqueda de información', '3. Análisis crítico y formulación de alternativas', '4. Socialización de resultados y toma de acuerdos colectivos']
  },
  {
    name: 'Aprendizaje Servicio (AS)',
    fases: ['1. Punto de partida y diagnóstico solidario', '2. Organización y preparación del servicio comunitario', '3. Creatividad en marcha: acción en territorio', '4. Evaluación compartida y reconocimiento del impacto social']
  }
];

const CONTEXTS = [
  { tipo: 'Urbano Metropolitano', reto: 'Manejo de residuos plásticos, movilidad sustentable y uso crítico de redes sociales en escuelas de alta densidad urbana.' },
  { tipo: 'Rural Agrícola', reto: 'Conservación de suelos fértiles, tecnificación de riego en milpas y preservación de semillas nativas frente al cambio climático.' },
  { tipo: 'Comunitario Indígena y Bilingüe', reto: 'Rescate de saberes ancestrales de la lengua originaria, medicina tradicional y faenas comunitarias (tequio).' },
  { tipo: 'Costero y Ribereño', reto: 'Protección de manglares, fauna marina, consumo responsable de agua dulce y gestión ante ciclones tropicales.' },
  { tipo: 'Semiurbano e Industrial', reto: 'Prevención de contaminación del aire y mantos freáticos, eficiencia energética y comercio justo local.' },
  { tipo: 'Zona Montañosa y Boscosa', reto: 'Prevención de incendios forestales, reforestación con especies endémicas y protección de cuencas hidrológicas.' },
  { tipo: 'Altiplano Central', reto: 'Cosecha de agua de lluvia, huertos escolares verticales y soberanía alimentaria con cultivos de amaranto y nopal.' },
  { tipo: 'Fronterizo e Intercultural', reto: 'Integración comunitaria de estudiantes migrantes, diálogo intercultural y cultura de paz en zonas de alta movilidad humana.' }
];

const EJES_ARTICULADORES_LIST = [
  ['Inclusión', 'Pensamiento Crítico'],
  ['Interculturalidad Crítica', 'Igualdad de Género'],
  ['Vida Saludable', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
  ['Artes y Experiencias Estéticas', 'Pensamiento Crítico'],
  ['Inclusión', 'Vida Saludable', 'Interculturalidad Crítica'],
  ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura']
];

const DELIVERABLES_LIST = [
  'Periódico mural interactivo con códigos QR y fichas informativas ilustradas',
  'Manual de divulgación científica comunitaria y guía de campo ilustrada',
  'Podcast escolar y cápsula radiofónica comunitaria en audio digital',
  'Maqueta funcional a escala y prototipo con materiales reciclados del entorno',
  'Folleto tríptico de prevención y campaña de sensibilización escolar',
  'Antología ilustrada de crónicas, relatos orales y ensayos reflexivos',
  'Huerto escolar biointensivo con bitácora de observación y mediciones métricas',
  'Dramatización teatral comunitaria y lectura de atril ante padres de familia',
  'Cartografía social y mapa temático de riesgos y recursos de la localidad',
  'Feria escolar de ciencias, tecnologías y expresiones artísticas comunitarias'
];

// =============================================================================
// CURRÍCULO BASE FASE 4 (Primaria: 3º y 4º Grado)
// =============================================================================
interface CurriculumBase {
  campo: string;
  materia: string;
  grado: string;
  gradoDisplay: string;
  tema: string;
  pda: string;
}

const CURRICULUM_FASE_4: CurriculumBase[] = [
  // LENGUAJES 3º
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Narración de sucesos del pasado y del presente', pda: 'Identifica y comprende la función y las características principales de la narración; reconoce y usa estructuras narrativas (lineal, circular, in media res), estableciendo relaciones causa-efecto y utilizando el punto y seguido en párrafos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Descripción de personas, lugares, hechos y procesos', pda: 'Comprende textos descriptivos detallados, reflexiona sobre el uso de adjetivos, adverbios y frases adverbiales, y planea descripciones cronológicas con mayúsculas y comas.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Diálogo para la toma de acuerdos y el intercambio de puntos de vista', pda: 'Reconoce y usa pautas que norman los intercambios orales, respeta turnos de palabra, escucha con respeto y expresa ideas con claridad para tomar acuerdos colectivos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Comprensión y producción de textos expositivos (problema-solución, comparación-contraste, causa-consecuencia)', pda: 'Recurre a soportes con textos expositivos y diccionarios, comprendiendo estructuras de problema-solución y causa-consecuencia para redactar textos informativos del entorno.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Búsqueda y manejo reflexivo de información', pda: 'Formula preguntas de indagación con signos de interrogación, usa variadas fuentes de consulta, reflexiona sobre el orden alfabético y comprende el sentido general de textos informativos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Comprensión y producción de textos discontinuos para organizar información', pda: 'Identifica características de esquemas, partes de seres vivos y calendarios de actividades, reflexionando sobre la utilidad de formatos visuales.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Comprensión y producción de resúmenes', pda: 'Reflexiona sobre las funciones del resumen conciso y objetivo, registrando ideas principales con sus propias palabras y empleando punto y aparte por párrafos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Textos instructivos para realizar actividades escolares y juegos', pda: 'Identifica la estructura de instructivos: datos, numerales de secuencia cronológica, verbos en infinitivo o imperativo y diagramas de procesos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Exposición sobre temas diversos', pda: 'Reconoce recursos expresivos y paralingüísticos en la oralidad, elabora guiones y apoyos visuales y participa como presentador y audiencia activa.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Indagación sobre la diversidad lingüística en su comunidad y país', pda: 'Reconoce nombres de lugares y objetos con raíces en lenguas indígenas originarias, identificando variantes lingüísticas del español en México.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Reconocimiento y reflexión sobre elementos de los lenguajes artísticos', pda: 'Realiza recreaciones con dibujos, cómics y flip-books a partir de manifestaciones culturales, comparando formas, colores, sonidos y movimientos de su comunidad.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Lectura y creación de poemas, canciones y juegos de palabras', pda: 'Lee y escucha poemas reconociendo rima, aliteración y ritmo melódico, explorando adivinanzas, trabalenguas y canciones tradicionales.' },

  // LENGUAJES 4º
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Narración de sucesos del pasado y del presente', pda: 'Reconoce estilos y recursos narrativos, establece relaciones causales y temporales entre acontecimientos y reflexiona sobre el uso de pretérito y copretérito.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Descripción de personas, lugares, hechos y procesos', pda: 'Planea y redacta descripciones lógicas de procesos comunitarios utilizando conectores secuenciales (en primer lugar, posteriormente, finalmente) y temporales (simultáneamente, antes, después).' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Comprensión y producción de textos expositivos', pda: 'Planea, escribe, revisa y corrige textos expositivos de tipo problema-solución y causa-efecto empleando nexos de comparación y contraste (en cambio, a diferencia de, por un lado).' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Búsqueda y manejo reflexivo de información', pda: 'Elabora preguntas con acentuación gráfica (qué, cómo, cuándo, dónde, por qué), emplea títulos y viñetas y diversifica fuentes impresas y digitales.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Comprensión y producción de resúmenes', pda: 'Explora y relaciona el contenido de textos con tablas, recuadros y gráficas, registrando información sustantiva con sus propias palabras.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Análisis e intercambio de comentarios sobre empaques y anuncios publicitarios', pda: 'Comprende advertencias e instrucciones de productos, identifica la intención persuasiva de la publicidad y desarrolla un pensamiento crítico ante el consumo.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Experimentación con elementos visuales y sonoros en producciones colectivas', pda: 'Crea animaciones y secuencias fotográficas (cortometrajes o stop motion), transformando objetos cotidianos y sonorizándolos para incidir en el entorno escolar.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Lectura dramatizada y representación teatral', pda: 'Explora el gesto, la forma y el sonido en obras de teatro de títeres, sombras y teatro de atril, identificando acotaciones, diálogos y personajes.' },

  // SABERES Y PENSAMIENTO CIENTÍFICO 3º
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Estructura y funcionamiento del cuerpo humano: sistema locomotor y digestivo', pda: 'Identifica que el sistema locomotor está conformado por el sistema óseo y muscular; explica la coordinación neuromuscular y describe prácticas para su cuidado y prevención de lesiones.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Alimentación saludable: Plato del Bien Comer y prácticas culturales', pda: 'Explica la importancia de consumir verduras, frutas, cereales y leguminosas acorde al Plato del Bien Comer, bebiendo agua simple potable y reduciendo grasas y azúcares.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Interacciones entre plantas, animales y el entorno natural: locomoción y nutrición', pda: 'Clasifica animales en vertebrados e invertebrados con base en su locomoción, reconociendo que los seres humanos pertenecen al grupo de vertebrados.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Propiedades de los materiales: masa y longitud; relación con temperatura', pda: 'Describe la masa (kg) y la longitud (m, cm) como propiedades medibles de los materiales usando balanza y regla, relacionando tamaño, forma y estado físico.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Formación de mezclas y propiedades del agua como disolvente', pda: 'Identifica al agua como disolvente universal al experimentar con aceite, sal, azúcar y arena, clasificando sustancias en solubles e insolubles en actividades cotidianas.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Sistema Tierra-Luna-Sol: movimientos de rotación y traslación', pda: 'Indaga y representa con modelos tridimensionales los movimientos de rotación y traslación de la Tierra y la Luna, asociándolos con el día, la noche, las fases lunares y las estaciones.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Estudio de los números naturales y fracciones en el contexto', pda: 'Expresa la sucesión numérica hasta cuatro cifras en orden ascendente y descendente; representa fracciones (medios, cuartos, octavos, dieciseisavos) con material concreto en situaciones cotidianas.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Suma y resta, su relación como operaciones inversas', pda: 'Resuelve problemas de suma y resta con números naturales de hasta tres cifras usando algoritmo convencional y cálculo mental, además de fracciones con igual denominador.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Multiplicación y división como operaciones inversas', pda: 'Resuelve multiplicaciones cuyo producto sea de hasta tres cifras y divisiones mediante procedimientos de reparto y agrupamiento, expresando a ÷ b = c.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Cuerpos y figuras geométricas: simetría y características', pda: 'Construye prismas rectos cuadrangulares y rectangulares; clasifica triángulos y cuadriláteros a partir de retículas analizando lados, ángulos y ejes de simetría.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Medición de tiempo, longitud, masa y capacidad', pda: 'Lee relojes de manecillas y digitales con horas y cuartos de hora; resuelve problemas de estimación y cálculo de capacidad y masa con litros y kilogramos.' },

  // SABERES Y PENSAMIENTO CIENTÍFICO 4º
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Estructura del sistema digestivo y su relación con el circulatorio', pda: 'Identifica la ruta de los alimentos en la ingestión, digestión, absorción y transporte de nutrimentos, experimentando con la saliva y jugos digestivos (ácidos).' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Caracteres sexuales primarios y secundarios en pubertad', pda: 'Indaga mediante modelos los caracteres sexuales y los cambios físicos y emocionales durante la pubertad, comprendiendo el ciclo menstrual y los hábitos de higiene y autocuidado.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Nutrición de plantas, cadenas alimentarias y ecosistemas', pda: 'Explica la nutrición vegetal (fotosíntesis con luz solar, agua y CO2) y describe cadenas alimentarias estructuradas en productores, consumidores y descomponedores.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Ciclo del agua, cambios de estado y variación de temperatura', pda: 'Describe los cambios de estado del agua (evaporación, condensación, solidificación, fusión) relacionándolos con la temperatura y el diseño de termómetros precisos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Efectos del calor y la fricción sobre los objetos', pda: 'Comprende la generación de calor por fricción y contacto, reconociendo que la transferencia térmica fluye del cuerpo de mayor temperatura al de menor temperatura.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Eclipses solares y lunares en el Sistema Tierra-Luna-Sol', pda: 'Indaga y modela la formación de eclipses solares y lunares considerando distancias, tamaños relativos de cuerpos celestes y la propagación rectilínea de la luz.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Estudio de números naturales hasta cinco cifras y decimales hasta centésimos', pda: 'Ordena, lee y escribe números naturales hasta cinco cifras; interpreta y representa números decimales hasta centésimos (equivalencia décimos-centésimos-unidad) y fracciones (tercios, quintos, sextos, décimos).' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Suma y resta con números decimales y fracciones con distinto denominador', pda: 'Resuelve problemas de suma y resta con números decimales hasta centésimos y fracciones con distinto denominador mediante procedimientos de fracciones equivalentes.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Multiplicación y división con algoritmos convencionales', pda: 'Resuelve situaciones de multiplicación de números de hasta tres por dos cifras y división con cociente y residuo exactos e inexactos en problemas de contexto.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Cálculo de perímetro y área con retículas cuadradas', pda: 'Distingue entre contorno (perímetro) y superficie (área) en figuras geométricas planas, estimando y calculando áreas mediante retículas y unidades cuadradas (m², cm²).' },

  // ÉTICA, NATURALEZA Y SOCIEDADES 3º & 4º
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Representaciones cartográficas de la localidad y cuidado de ecosistemas', pda: 'Elabora croquis y mapas con puntos cardinales de la localidad, reconociendo las interdependencias de los componentes vivos y no vivos para la sustentabilidad.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Interculturalidad y sustentabilidad en pueblos originarios', pda: 'Reconoce y analiza las cosmovisiones de respeto y reciprocidad con la naturaleza practicadas por pueblos originarios y campesinos en el manejo de la tierra.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Pueblos originarios antes de la llegada de los españoles', pda: 'Indaga sobre las culturas originarias de México (Olmecas, Mayas, Zapotecas, Mexicas), su vida cotidiana, organización comunitaria y aportes bioculturales.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Derechos humanos y protección de la integridad física y emocional', pda: 'Identifica situaciones que vulneran la dignidad e integridad de niñas y niños (maltrato, acoso), reconociendo instituciones y redes de apoyo y denuncia.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Caracterización y localización del territorio de México', pda: 'Localiza y describe características físicas del territorio nacional (relieve, climas, cuerpos de agua, límites marítimos y terrestres) y la división política estatal.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'La vida cotidiana en el México Colonial y el sistema de castas', pda: 'Indaga las consecuencias de la conquista y el virreinato, analizando el sistema de castas colonial como raíz histórica del racismo y la desigualdad en México.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Construcción colectiva de la paz y resolución no violenta de conflictos', pda: 'Comprende que los conflictos son inherentes a la convivencia humana y propone estrategias de mediación, diálogo empático y asertividad para la no violencia.' },

  // DE LO HUMANO Y LO COMUNITARIO 3º & 4º
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica_Vida_Saludable', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Capacidades y habilidades motrices en situaciones de juego', pda: 'Adapta sus patrones básicos de movimiento en juegos cooperativos y deportivos para favorecer la coordinación motriz, la sana convivencia y el autoconcepto positivo.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Socioemocional', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Los afectos y su influencia en el bienestar y la convivencia', pda: 'Reconoce factores contextuales que influyen en las emociones, adoptando reacciones asertivas y empáticas para la resolución pacífica de desacuerdos.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica_Vida_Saludable', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Estilos de vida activos y hábitos saludables', pda: 'Organiza juegos y actividades físicas para superar el sedentarismo, adoptando prácticas de hidratación saludable y consumo responsable de alimentos nutritivos.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Socioemocional', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Construcción del proyecto de vida y toma de decisiones asertivas', pda: 'Reconoce cambios en intereses y habilidades para ajustar metas personales y colectivas, valorando la equidad de género en el aula y la familia.' }
];

// =============================================================================
// CURRÍCULO BASE FASE 5 (Primaria: 5º y 6º Grado)
// =============================================================================
const CURRICULUM_FASE_5: CurriculumBase[] = [
  // LENGUAJES 5º & 6º
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Narración de sucesos autobiográficos', pda: 'Lee textos autobiográficos en primera persona, organiza hechos cronológicamente con signos de puntuación (comas, puntos y seguido, dos puntos) y usa frases adjetivas y símiles.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Comprensión y producción de textos explicativos', pda: 'Diferencia entre descripción y explicación, recupera información de fuentes científicas y emplea relaciones causales (en consecuencia, por lo tanto, debido a).' },
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Participación en debates sobre temas de interés común', pda: 'Conoce la organización de un debate, investiga argumentos fundamentados con citas textuales y utiliza nexos de subordinación reconociendo el valor de cambiar de postura.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Comprensión y producción de textos argumentativos', pda: 'Lee textos sobre temas polémicos distinguiendo opiniones de datos objetivos y expresa argumentos orales respetuosos con premisas y conclusiones claras.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Comprensión y producción de textos discontinuos (tablas y líneas del tiempo)', pda: 'Analiza características de tablas de doble entrada, líneas del tiempo y cuadros cronológicos para sintetizar y presentar información legible al público.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Elaboración de un tríptico sobre prevención de problemas colectivos', pda: 'Indaga problemas comunitarios de salud o violencia e integra información en un tríptico con portada, causas, medidas preventivas y directorios de apoyo.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Narración de sucesos autobiográficos y memoria colectiva', pda: 'Identifica relaciones temporales de simultaneidad y duración con nexos adverbiales; edita un compendio autobiográfico colaborativo para la biblioteca escolar.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Comprensión y producción de textos explicativos avanzados', pda: 'Localiza textos científicos, elabora resúmenes estructurados de causa-efecto y emplea vocabulario técnico especializado para divulgar saberes a la comunidad.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Debates estructurados y textos argumentativos con rigor crítico', pda: 'Prepara intervenciones en debates formales formulando argumentos claros con referencias bibliográficas APA y moderando mesas redondas escolares.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Seguimiento crítico de noticias en diversos medios de comunicación', pda: 'Compara cómo se aborda un hecho noticioso en periódicos, radio e internet, analizando sesgos, opiniones de autoras y veracidad informativa.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Apropiación e intervención artística en el espacio comunitario', pda: 'Representa problemáticas comunitarias mediante historietas, maquetas, danzas y canciones populares con letras modificadas, interviniendo espacios escolares.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Combinación de lenguajes visuales, sonoros y teatrales', pda: 'Crea producciones artísticas con videoarte, instalaciones, murales colectivos y representaciones teatrales para transformar espacios públicos a favor del bienestar social.' },

  // SABERES Y PENSAMIENTO CIENTÍFICO 5º & 6º
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Sistemas circulatorio, respiratorio e inmunológico y salud ambiental', pda: 'Describe con modelos la relación entre pulmones, corazón y vasos sanguíneos en el intercambio de gases; mide la frecuencia cardiaca en pulso y previene afecciones respiratorias.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Reproducción humana: fecundación, embarazo y parto responsable', pda: 'Comprende el proceso biológico del embarazo y parto como resultado de relaciones sexuales consentidas, valorando los derechos reproductivos y la prevención.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Alimentación sustentable, riesgos de ultraprocesados y agua virtual', pda: 'Explica las características de la dieta correcta (completa, equilibrada, inocua, suficiente) y calcula el agua virtual utilizada en la producción de bienes de consumo.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Propiedades de los materiales: dureza, flexibilidad y permeabilidad', pda: 'Experimenta con dureza, flexibilidad y permeabilidad de materiales (vidrio, cartón, plástico), analizando el impacto ecológico de su sobreexplotación.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Transferencia de energía térmica: conducción y convección', pda: 'Describe y experimenta la transferencia de calor por conducción y convección, identificando sus aplicaciones en tecnologías térmicas y motores sustentables.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Sistema inmunológico, vacunas y prevención epidemiológica', pda: 'Explica la función de células y anticuerpos del sistema inmune ante virus y bacterias, argumentando la importancia científica de las vacunas y la Cartilla Nacional de Salud.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Fósiles, extinción de especies y evolución de seres vivos', pda: 'Comprende la importancia de los fósiles como evidencia de la evolución biológica y extinciones masivas del pasado, construyendo modelos de fosilización.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Efecto invernadero, gases contaminantes y cambio climático global', pda: 'Explica el efecto invernadero natural y su alteración antropogénica por quema de combustibles fósiles, proponiendo proyectos comunitarios de mitigación.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Electricidad estática, circuitos eléctricos y conductores', pda: 'Experimenta con cargas positivas y negativas, atracción y repulsión electrostática, construyendo circuitos eléctricos en serie y paralelo con interruptores seguros.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'El Universo y la Vía Láctea: componentes astronómicos y telescopios', pda: 'Describe galaxias, estrellas y el Sistema Solar en la Vía Láctea, valorando el papel histórico del telescopio, satélites y sondas espaciales.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Estudio de números naturales hasta 9 cifras, decimales y fracciones', pda: 'Ordena, lee y escribe números naturales hasta nueve cifras y decimales hasta diezmilésimos; resuelve problemas de fracciones equivalentes y conversión decimal.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Proporcionalidad y porcentajes (50%, 25%, 20%, 10%)', pda: 'Determina valores faltantes en tablas de proporcionalidad directa con valor unitario y calcula porcentajes vinculándolos con fracciones (1/2, 1/4, 1/5, 1/10).' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Perímetro, área de polígonos y volumen de prismas rectos', pda: 'Construye fórmulas para calcular áreas de triángulos, romboides y rectángulos (m², cm²), estimando volúmenes de prismas rectangulares mediante conteo de cubos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Números naturales hasta billones, números romanos y mayas', pda: 'Expresa sucesiones numéricas hasta billones; compara el sistema decimal posicional con sistemas de numeración maya (vigesimal) y romano.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Operaciones con decimales y fracciones con distinto denominador', pda: 'Resuelve problemas complejos de división de decimales entre naturales y fracciones entre naturales con estrategias de equivalencia y cálculo mental de porcentajes (1%, 10%, 25%).' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Geometría circular, valor aproximado de Pi y plano cartesiano', pda: 'Comprueba la relación constante entre circunferencia y diámetro (π ≈ 3.1416); ubica coordenadas en el primer cuadrante del plano cartesiano.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Estadística: media aritmética, mediana, moda y probabilidad teórica', pda: 'Interpreta gráficas circulares y de barras, calculando medidas de tendencia central (media, mediana, moda) y clasificando eventos probabilísticos (seguro, imposible, probable).' },

  // ÉTICA, NATURALEZA Y SOCIEDADES 5º & 6º
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Megadiversidad mexicana y patrimonio biocultural', pda: 'Comprende por qué México es un país megadiverso en sus regiones biogeográficas, reconociendo la estrecha relación entre biodiversidad y tradiciones de los pueblos.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Movimiento de Independencia de México (1810-1821)', pda: 'Indaga causas del movimiento independentista (injusticia virreinal, castas), analizando el papel de Hidalgo, Morelos, Allende, Leona Vicario y grupos no visibilizados.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'México Independiente, intervenciones extranjeras y Leyes de Reforma', pda: 'Analiza la invasión estadounidense (1846-1848), la intervención francesa y el papel de Benito Juárez en la consolidación del Estado laico mediante las Leyes de Reforma.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Revolución Mexicana de 1910 y Constitución de 1917', pda: 'Indaga las causas del levantamiento revolucionario (despojo agrario, Porfiriato, huelgas de Cananea y Río Blanco), analizando los artículos 3º, 27 y 123 constitucionales.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'México Posrevolucionario, Cardenismo y voto de las mujeres en 1953', pda: 'Analiza la reforma agraria y expropiación petrolera de Lázaro Cárdenas, así como las luchas por la equidad política que culminaron en el reconocimiento del voto femenino en 1953.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Migración mundial y nacional, derechos humanos y refugiados', pda: 'Explica causas socioeconómicas y climáticas de los flujos migratorios mundiales y en México, promoviendo la defensa inalienable de los derechos de las personas migrantes.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Cultura de paz, derechos humanos y no discriminación', pda: 'Analiza casos de discriminación y racismo en México, proponiendo acciones de solidaridad, equidad de género y mecanismos institucionales de denuncia.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Democracia, transparencia y rendición de cuentas en servicios públicos', pda: 'Comprende los principios del gobierno democrático representativo y federal, valorando el derecho a la información pública, la transparencia y el combate a la corrupción.' },

  // DE LO HUMANO Y LO COMUNITARIO 5º & 6º
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica_Vida_Saludable', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Capacidades motrices, juego estratégico y trabajo colaborativo', pda: 'Planifica estrategias en juegos de iniciación deportiva y tradicionales para fomentar la inclusión, el pensamiento creativo y la actividad física cotidiana.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Socioemocional', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Gestión emocional, autoconcepto y toma de decisiones éticas', pda: 'Identifica causas de estados de ánimo y reacciones emocionales complejas, desarrollando asertividad, empatía y metas a mediano plazo en su proyecto de vida.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica_Vida_Saludable', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Estilos de vida saludables y prevención de enfermedades crónicas', pda: 'Propone alternativas comunitarias de higiene y alimentación saludable baja en sal y azúcares, previniendo diabetes, hipertensión y obesidad infantil.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Socioemocional', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Construcción del proyecto de vida y transición a la secundaria', pda: 'Evalúa logros personales en la primaria y formula metas formativas para el ingreso a la secundaria, fortaleciendo la autonomía y el sentido comunitario.' }
];

// =============================================================================
// CURRÍCULO BASE FASE 6 (Secundaria: 1º, 2º y 3º Grado)
// =============================================================================
const CURRICULUM_FASE_6: CurriculumBase[] = [
  // LENGUAJES (Español, Inglés, Artes, Lenguas Indígenas)
  { campo: 'Lenguajes', materia: 'Español', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'La diversidad de lenguas y su uso en la comunicación familiar y comunitaria', pda: 'Reconoce la riqueza lingüística de México y el mundo a partir de obras literarias y testimonios orales, identificando variantes lingüísticas en la comunidad.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'La función creativa del español en la expresión de necesidades comunitarias', pda: 'Identifica problemáticas comunitarias con pensamiento crítico para plantear propuestas creativas de solución mediante cuentos y ensayos breves.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'La diversidad étnica, cultural y lingüística a favor de una sociedad intercultural', pda: 'Compara y contrasta textos sobre tensiones y aportaciones culturales de México, redactando textos argumentativos para la convivencia armónica.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Los recursos estéticos de la lengua española en textos narrativos y poéticos', pda: 'Analiza recursos estéticos (metáforas, hipérboles, prosopopeyas) en novelas y poemas universales, adaptándolos a la sensibilización comunitaria.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Textos literarios escritos en español o traducidos y creación lírica', pda: 'Crea textos literarios y guiones audiovisuales con base en el análisis formal de géneros literarios universales y mexicanos, manifestando una postura crítica.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Comunicación asertiva y dialógica para erradicar la violencia', pda: 'Diseña y difunde textos informativos y proyectos colectivos que sensibilicen sobre la erradicación de la violencia escolar y de género en la comunidad.' },
  { campo: 'Lenguajes', materia: 'Ingles', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'La diversidad lingüística y cultural en países de habla inglesa', pda: 'Recupera datos fácticos y expresiones básicas en inglés sobre la diversidad cultural y lingüística de México y el mundo en organizadores gráficos.' },
  { campo: 'Lenguajes', materia: 'Ingles', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'El uso del inglés para expresar necesidades y problemas de la comunidad', pda: 'Elabora ensayos argumentativos cortos en inglés sobre propuestas de acción ciudadana para resolver problemas ambientales y sociales.' },
  { campo: 'Lenguajes', materia: 'Ingles', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Relatos y debates en inglés sobre hechos comunitarios y no violencia', pda: 'Participa en debates estructurados en inglés y diseña campañas multimodales de sensibilización sobre la paz y la vida saludable.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Diversidad de lenguajes artísticos en la riqueza pluricultural', pda: 'Reconoce en obras plásticas, dancísticas y musicales el uso del cuerpo, espacio y tiempo para valorar la identidad y el patrimonio biocultural.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Los lenguajes artísticos en la expresión de problemas comunitarios', pda: 'Analiza el ritmo, armonía, contraste y repetición en instalaciones artísticas y teatro comunitario para manifestar una postura crítica social.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Intervención artística en el espacio público y memoria colectiva', pda: 'Interviene espacios escolares y comunitarios mediante murales, performances y piezas audiovisuales que expresan la memoria histórica y la cultura de paz.' },

  // SABERES Y PENSAMIENTO CIENTÍFICO (Matemáticas, Biología, Física, Química)
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Expresión de fracciones como decimales y números con signo', pda: 'Usa estrategias para convertir fracciones a decimales y viceversa; reconoce números negativos en la recta numérica y propiedades de densidad.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Introducción al álgebra y ecuaciones lineales', pda: 'Plantea problemas del lenguaje común al algebraico; resuelve ecuaciones lineales de la forma Ax+B=Cx+D usando propiedades de igualdad.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Sistemas de dos ecuaciones lineales con dos incógnitas', pda: 'Modela y soluciona sistemas de 2x2 por métodos algebraicos (sustitución, igualación, reducción) y gráficos para resolver problemas reales.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Teorema de Pitágoras y trigonometría básica', pda: 'Formula, justifica y usa el Teorema de Pitágoras y razones trigonométricas en problemas geométricos y topográficos del entorno.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Ecuaciones cuadráticas y fórmula general', pda: 'Resuelve ecuaciones cuadráticas de la forma Ax²+Bx+C=0 mediante factorización y fórmula general, interpretando el discriminante en modelos parabólicos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Funciones y variación cuadrática en fenómenos físicos', pda: 'Relaciona e interpreta la variación cuadrática de dos magnitudes en tablas, gráficas y expresiones algebraicas aplicadas a la cinemática.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Biologia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Funcionamiento del sistema nervioso y endocrino en el cuerpo humano', pda: 'Explica la coordinación neuroendocrina en las funciones corporales y maduración sexual, argumentando el impacto de sustancias adictivas.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Biologia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Célula, microscopio y modelos de Darwin-Wallace de evolución', pda: 'Describe organelos celulares (membrana, citoplasma, núcleo) y explica la selección natural de Darwin y Wallace en el origen de la biodiversidad.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Biologia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Ciclos biogeoquímicos del carbono y nitrógeno y calentamiento global', pda: 'Representa redes y pirámides tróficas, explicando cómo la actividad industrial humana altera los ciclos biogeoquímicos del carbono y nitrógeno.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Fisica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Leyes de Newton y conceptos de fuerza, velocidad y aceleración', pda: 'Experimenta e interpreta las interacciones mecánicas con base en las tres Leyes de Newton, resolviendo problemas de cinemática y dinámica cotidiana.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Fisica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Principios de Pascal y Arquímedes en fluidos', pda: 'Aplica el Principio de Pascal en prensas hidráulicas y el Principio de Arquímedes en la flotabilidad de cuerpos y densidad de líquidos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Fisica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Electricidad, magnetismo y ondas electromagnéticas', pda: 'Experimenta con circuitos eléctricos, inducción electromagnética y explica la propagación de la luz y telecomunicaciones mediante ondas.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Quimica', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Tabla periódica, modelos de Bohr y estructuras de Lewis', pda: 'Interpreta la Tabla Periódica por número atómico, grupos y periodos, representando electrones de valencia mediante diagramas de Lewis y Bohr.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Quimica', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Reacciones químicas y Ley de Conservación de la Materia', pda: 'Balancea ecuaciones químicas por tanteo verificando la Ley de Lavoisier, clasificando reacciones endotérmicas y exotérmicas en el entorno.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Quimica', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Ácidos, bases, escala de pH y reacciones de neutralización', pda: 'Distingue propiedades ácidas y básicas con indicadores naturales, deduciendo productos de reacciones de neutralización y remediación ambiental.' },

  // ÉTICA, NATURALEZA Y SOCIEDADES (Geografía, Historia, Formación Cívica y Ética)
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'El espacio geográfico, placas tectónicas y relieve terrestre', pda: 'Comprende el espacio geográfico como construcción social; relaciona la dinámica de placas tectónicas con sismicidad, vulcanismo y prevención de riesgos.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Aguas continentales, cuencas hídricas y cambio climático', pda: 'Analiza la distribución hídrica en México, valorando la gestión integral de cuencas y proponiendo alternativas sustentables ante la sequía.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Historia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Pueblos originarios de Mesoamérica, Aridoamérica y Oasisamérica', pda: 'Ubica en el tiempo y espacio las civilizaciones mesoamericanas, analizando el cultivo del maíz, cosmovisión y diversidad cultural ancestral.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Historia', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Conquista de México, Virreinato y Guerra de Independencia', pda: 'Contextualiza las campañas de conquista, la imposición del régimen colonial novohispano y las causas populares de la Independencia de 1810.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Historia', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Leyes de Reforma, Guerra de Reforma e Intervención Francesa', pda: 'Analiza el enfrentamiento liberales-conservadores, la Constitución de 1857 y la victoria republicana de Juárez en la defensa de la soberanía.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Historia', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Revolución Industrial, Guerras Mundiales y Guerra Fría', pda: 'Explica el desarrollo del capitalismo moderno, las causas y consecuencias de la Primera y Segunda Guerra Mundial y el mundo bipolar.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Historia', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'México Contemporáneo: Cardenismo, Movimiento del 68 y EZLN 1994', pda: 'Analiza las transformaciones sociales del siglo XX, las demandas democráticas del 68 y el surgimiento del zapatismo indígena por autonomía y justicia.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Derechos humanos en México y el mundo como valores universales', pda: 'Asume una postura crítica sobre la vigencia de los derechos humanos, igualdad sustantiva y la defensa de poblaciones históricamente vulneradas.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Cultura de paz y resolución no violenta de conflictos sociales', pda: 'Propone estrategias de mediación comunitaria y diálogo asertivo para transformar conflictos sociales y erradicar la violencia escolar.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Democracia representativa, participación ciudadana y rendición de cuentas', pda: 'Participa en proyectos ciudadanos democráticos, evaluando el desempeño de autoridades y exigiendo transparencia en el manejo de recursos públicos.' },

  // DE LO HUMANO Y LO COMUNITARIO (Tecnología, Tutoría/Socioemocional, Educación Física)
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tecnologia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Herramientas, máquinas e instrumentos como extensión corporal', pda: 'Explora la delegación de funciones en herramientas y máquinas para resolver problemas técnicos comunitarios con criterios de ergonomía y seguridad.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tecnologia', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Sistemas técnicos, energía y sustentabilidad en la comunidad', pda: 'Analiza sistemas artesanales e industriales, identificando fuentes de energía limpias para disminuir el impacto ecológico de la producción técnica.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tecnologia', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Innovación técnica, pensamiento estratégico y evaluación de proyectos', pda: 'Diseña, implementa y evalúa proyectos tecnológicos sustentables que atienden necesidades reales del contexto con enfoque de economía circular.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tutoria_Socioemocional', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Autoconocimiento, regulación emocional y relaciones interpersonales', pda: 'Distingue emociones y estados de ánimo, reconociendo fortalezas individuales para construir relaciones afectivas respetuosas y proyecto de vida.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tutoria_Socioemocional', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Toma de decisiones asertivas y prevención de adicciones', pda: 'Gestiona afectos ante la presión social, valorando factores de protección para evitar adicciones y situaciones de riesgo físico y digital.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tutoria_Socioemocional', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Proyecto de vida y transición a la Educación Media Superior', pda: 'Visualiza escenarios vocacionales futuros, analizando opciones educativas de bachillerato y trazando planes de acción con compromiso social.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Condición física, capacidades motrices y estilos de vida activos', pda: 'Pone a prueba su potencial motriz en actividades recreativas y predeportivas, valorando el ejercicio físico diario para la salud integral.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Pensamiento estratégico y juego limpio en el deporte educativo', pda: 'Reestructura tácticas individuales y colectivas en juegos deportivos, fomentando el juego limpio, la resolución asertiva y el compañerismo.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Liderazgo deportivo y proyectos de actividad física comunitaria', pda: 'Diseña torneos recreativos y circuitos de acondicionamiento físico comunitarios para combatir el sedentarismo en su entorno escolar.' }
];

// =============================================================================
// GENERADOR PROCEDURAL Y MASIVO (10,000 POR FASE = 30,000 TOTAL)
// =============================================================================

function sanitizeName(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

function generatePlanningMarkdown(
  faseNum: number,
  faseName: string,
  base: CurriculumBase,
  index: number,
  metIndex: number,
  ctxIndex: number,
  ejeIndex: number,
  delIndex: number
): { markdown: string; relativeDir: string; fileName: string; title: string } {
  const met = METHODOLOGIES[metIndex % METHODOLOGIES.length];
  const ctx = CONTEXTS[ctxIndex % CONTEXTS.length];
  const ejes = EJES_ARTICULADORES_LIST[ejeIndex % EJES_ARTICULADORES_LIST.length];
  const deliverable = DELIVERABLES_LIST[delIndex % DELIVERABLES_LIST.length];

  const uniqueId = `F${faseNum}-${sanitizeName(base.materia).substring(0, 3).toUpperCase()}-${base.grado.substring(0, 3).toUpperCase()}-V${String(index + 1).padStart(5, '0')}`;
  const title = `Proyecto Didáctico Integral: ${base.tema} - Variante ${index + 1} (${ctx.tipo})`;
  
  const tagCampo = sanitizeName(base.campo).toLowerCase();
  const tagGrado = sanitizeName(base.grado).toLowerCase();
  const tagMateria = sanitizeName(base.materia).toLowerCase();
  const tagMetodologia = sanitizeName(met.name).toLowerCase();
  const tagContexto = sanitizeName(ctx.tipo).toLowerCase();

  const fileName = `Planeacion_${uniqueId}_${sanitizeName(base.tema).substring(0, 35)}.md`;

  const relativeDir = path.join(faseName, base.grado, base.materia);

  const markdown = `---
tags: [iskool, planeacion_nem, segundo_cerebro, fase${faseNum}, campo_${tagCampo}, grado_${tagGrado}, materia_${tagMateria}, metodologia_${tagMetodologia}, contexto_${tagContexto}]
id_planeacion: "${uniqueId}"
campo_formativo: "${base.campo}"
materia: "${base.materia}"
grado: "${base.gradoDisplay}"
nivel: "${faseName.replace(/_/g, ' ')}"
tema: "${base.tema}"
docente: "Prof. Israel López Ángeles"
docente_email: "israel.lopez@iskool.edu.mx"
metodologia: "${met.name}"
contexto_comunitario: "${ctx.tipo}"
problematica_situada: "${ctx.reto}"
ejes_articuladores: [${ejes.map(e => `"${e}"`).join(', ')}]
duracion: "10 sesiones de 50 minutos (Total: 500 min)"
fecha_creacion: "${new Date().toISOString()}"
---

# 📚 ${title}

> [!INFO] **Ficha Técnica Oficial NEM 2024 • ISkool Academic System**
> - **Docente Titular / Super Usuario:** [[Prof. Israel López Ángeles]] (\`usr-teacher-israel\`)
> - **Nivel y Fase Curricular:** ${base.gradoDisplay} • ${faseName.replace(/_/g, ' ')}
> - **Campo Formativo:** ${base.campo}
> - **Asignatura / Disciplina:** ${base.materia.replace(/_/g, ' ')}
> - **Metodología Sociocrítica:** ${met.name}
> - **Contexto de Aplicación:** ${ctx.tipo} (Enfoque: *${ctx.reto}*)
> - **Ejes Articuladores SEP:** ${ejes.join(' • ')}
> - **Temporalidad:** 10 sesiones de 50 min (500 minutos lectivos)

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Oficial SEP 2024)

> **"${base.pda}"**

---

## ❓ II. Preguntas Detonadoras y Conflicto Cognitivo Situado

1. **¿De qué manera el contenido de *"${base.tema}"* impacta directamente en nuestra vida diaria y en los retos de nuestro entorno (${ctx.tipo})?**
2. **¿Qué saberes previos de nuestras familias y comunidad podemos rescatar para comprender mejor esta problemática?**
3. **¿Cómo podemos utilizar el pensamiento crítico y la colaboración para diseñar una solución tangible que transforme nuestra escuela?**
4. **¿Por qué es fundamental que nuestras propuestas respeten los principios de equidad, inclusión y sustentabilidad comunitaria?**

---

## ⏱️ III. Secuencia Didáctica Oficial (Desglose en 10 Sesiones de 50 Minutos)

### 📌 FASE 1: Identificación del Problema y Recuperación de Saberes (Sesiones 1 y 2 - 100 min)
- **Sesión 1: Apertura y Encuadre Cognitivo (50 min)**
  - *Inicio (10 min):* Presentación de la situación problemática en el contexto ${ctx.tipo}. El docente Prof. Israel López Ángeles plantea las preguntas detonadoras.
  - *Desarrollo (30 min):* Lluvia de ideas estructurada y debate guiado sobre experiencias comunitarias vinculadas a: *${ctx.reto}*. Organización de equipos de trabajo colaborativo heterogéneos.
  - *Cierre (10 min):* Registro de expectativas y formulación del propósito colectivo en el cuaderno de trabajo.
- **Sesión 2: Diagnóstico y Registro de Saberes Previos (50 min)**
  - *Inicio (10 min):* Lectura compartida de un texto informativo/crítico relacionado con el PDA.
  - *Desarrollo (30 min):* Elaboración de un mapa conceptual grupal con los conceptos clave de *"${base.tema}"*.
  - *Cierre (10 min):* Puesta en común y asignación de roles para la fase de indagación.

### 🔬 FASE 2: Indagación, Experimentación y Recolección de Evidencias (Sesiones 3 a 5 - 150 min)
- **Sesión 3: Búsqueda y Análisis Crítico de Fuentes (50 min)**
  - *Inicio (10 min):* Definición de preguntas específicas de investigación por equipo.
  - *Desarrollo (30 min):* Consulta de fuentes impresas, digitales o testimonios orales comunitarios. Registro en fichas de trabajo.
  - *Cierre (10 min):* Coevaluación del avance de investigación con lista de cotejo.
- **Sesión 4: Trabajo Experimental / Modelado / Taller Práctico (50 min)**
  - *Inicio (10 min):* Preparación de materiales y normas de seguridad en el aula o laboratorio.
  - *Desarrollo (30 min):* Ejecución de dinámicas prácticas, cálculos, experimentos o redacción de borradores orientados al PDA.
  - *Cierre (10 min):* Sistematización de datos obtenidos y análisis de regularidades o patrones.
- **Sesión 5: Discusión y Vinculación Interdisciplinar (50 min)**
  - *Inicio (10 min):* Conexión del tema con los ejes articuladores: *${ejes.join(', ')}*.
  - *Desarrollo (30 min):* Mesa de trabajo para relacionar los hallazgos con el contexto socioambiental y los derechos humanos.
  - *Cierre (10 min):* Elaboración de conclusiones preliminares por escrito.

### 💡 FASE 3: Integración, Creación y Elaboración del Producto (Sesiones 6 a 8 - 150 min)
- **Sesión 6: Diseño y Bocetaje del Entregable (50 min)**
  - *Inicio (10 min):* Presentación de criterios de calidad y rúbrica analítica del entregable final.
  - *Desarrollo (30 min):* Taller creativo en equipos: diseño del primer prototipo o borrador de: *${deliverable}*.
  - *Cierre (10 min):* Retroalimentación formativa inmediata entre pares ("Dos estrellas y un deseo").
- **Sesión 7: Producción y Consolidación del Trabajo (50 min)**
  - *Inicio (10 min):* Ajuste de detalles a partir de la retroalimentación recibida.
  - *Desarrollo (30 min):* Fabricación final, redacción pulida, maquetación o ensayo de la presentación.
  - *Cierre (10 min):* Verificación de cumplimiento de estándares del PDA oficial.
- **Sesión 8: Ensayo y Preparación de la Divulgación (50 min)**
  - *Inicio (10 min):* Organización del espacio de exposición en el aula o patio escolar.
  - *Desarrollo (30 min):* Ensayo general de presentaciones orales, modulación de voz y manejo de recursos gráficos.
  - *Cierre (10 min):* Autoevaluación individual del desempeño en el equipo.

### 🌟 FASE 4: Socialización Comunitaria y Evaluación Formativa (Sesiones 9 y 10 - 100 min)
- **Sesión 9: Presentación Pública y Diálogo Comunitario (50 min)**
  - *Inicio (10 min):* Bienvenida e introducción del evento de presentación por el Prof. Israel López Ángeles.
  - *Desarrollo (30 min):* Exposición de los proyectos terminados ante la comunidad escolar y padres de familia.
  - *Cierre (10 min):* Sesión de preguntas, comentarios y diálogo reflexivo con los asistentes.
- **Sesión 10: Metacognición, Evaluación Integral y Compromisos (50 min)**
  - *Inicio (10 min):* Dinámica de reflexión individual: "¿Qué aprendí, cómo lo aprendí y para qué me sirve en mi comunidad?".
  - *Desarrollo (30 min):* Aplicación de la Rúbrica Analítica Formativa y valoración del impacto del producto en el entorno.
  - *Cierre (10 min):* Firma del mural de compromisos ciudadanos y entrega formal de evidencias al docente.

---

## 📋 IV. Evaluación Formativa y Rúbrica Analítica

| Criterio Curricular NEM | Nivel Sobresaliente (3.5 - 4.0 pts) | Nivel Satisfactorio (2.5 - 3.4 pts) | Nivel En Proceso (1.0 - 2.4 pts) |
| :--- | :--- | :--- | :--- |
| **Dominio del PDA Oficial** | Demuestra comprensión profunda y aplicación autónoma del contenido *"${base.tema}"*, argumentando con solvencia técnica. | Comprende las ideas esenciales del PDA y las aplica correctamente con guía del docente. | Muestra nociones iniciales del tema pero requiere apoyo continuo para estructurar sus explicaciones. |
| **Vinculación Situada (${ctx.tipo})** | Conecta de forma crítica y original el aprendizaje con la problemática *"${ctx.reto}"*, proponiendo mejoras viables. | Relaciona adecuadamente el tema con situaciones de su entorno escolar o familiar. | Describe el contexto de forma superficial sin conectar plenamente con el tema de estudio. |
| **Calidad del Entregable Tangible** | El producto (*${deliverable}*) es impecable, creativo, riguroso y comunica con impacto a la comunidad. | El producto cumple con la mayoría de los requerimientos formales y comunica con claridad el mensaje. | El producto está incompleto o carece de elementos clave de presentación y contenido. |
| **Colaboración y Ética Ciudadana** | Ejerce liderazgo positivo, escucha activa, respeto a la diversidad y compromiso solidario en el equipo. | Participa activamente en su equipo respetando los acuerdos y turnos de trabajo. | Presenta dificultades para integrarse al trabajo colaborativo o respetar normas de convivencia. |

---

## 📦 V. Materiales, Recursos y Evidencias Tangibles

### 🛠️ Materiales y Recursos Didácticos
- Libros de Texto Gratuitos (SEP / NEM 2024), fuentes digitales confiables y ficheros didácticos.
- Materiales manipulables y de papelería: cartulinas, plumones, reglas graduadas, tijeras, pegamento, hojas recicladas.
- Recursos tecnológicos: proyector, bocina bluetooth, dispositivos para consulta de fuentes y grabación de audio.

### 📄 Producto Tangible Entregable
> **${deliverable}** enfocado en la resolución situada de: *${ctx.reto}*.

---

## 🔗 Nodos Relacionados y Segundo Cerebro
- [[00_Indice_Maestro_${faseName}|Índice Maestro ${faseName.replace(/_/g, ' ')}]]
- [[Prof_Israel_Lopez_Angeles|Perfil del Docente Titular: Prof. Israel López Ángeles]]
- Etiquetas: #${tagCampo} • #${tagMateria} • #${tagGrado} • #${tagMetodologia}
`;

  return { markdown, relativeDir, fileName, title };
}

async function runMassiveGeneration() {
  console.log('🚀 ============================================================');
  console.log('🚀 GENERADOR MASIVO DE PLANEACIONES NEM 2024 - OBSIDIAN VAULT');
  console.log('🚀 Docente Titular: Prof. Israel López Ángeles');
  console.log('🚀 Objetivo: 10,000 planeaciones por Fase (Total: 30,000)');
  console.log('🚀 ============================================================\n');

  const FASES_CONFIG = [
    { num: 4, name: 'Primaria_Fase_4', curriculum: CURRICULUM_FASE_4, targetCount: 10000 },
    { num: 5, name: 'Primaria_Fase_5', curriculum: CURRICULUM_FASE_5, targetCount: 10000 },
    { num: 6, name: 'Secundaria_Fase_6_NEM2024', curriculum: CURRICULUM_FASE_6, targetCount: 10000 }
  ];

  let grandTotal = 0;

  for (const fase of FASES_CONFIG) {
    console.log(`\n📂 Procesando Fase ${fase.num}: ${fase.name} (Meta: ${fase.targetCount} planeaciones)...`);
    const startTime = Date.now();
    let faseCount = 0;
    const baseLen = fase.curriculum.length;

    // Crear subdirectorios requeridos
    const grades = Array.from(new Set(fase.curriculum.map(c => c.grado)));
    for (const g of grades) {
      const materias = Array.from(new Set(fase.curriculum.filter(c => c.grado === g).map(c => c.materia)));
      for (const m of materias) {
        const dir = path.join(VAULT_PLANNINGS, fase.name, g, m);
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Generación por lotes para máximo rendimiento I/O
    for (let i = 0; i < fase.targetCount; i++) {
      const base = fase.curriculum[i % baseLen];
      const metIdx = Math.floor(i / baseLen);
      const ctxIdx = i % CONTEXTS.length;
      const ejeIdx = i % EJES_ARTICULADORES_LIST.length;
      const delIdx = i % DELIVERABLES_LIST.length;

      const plan = generatePlanningMarkdown(fase.num, fase.name, base, i, metIdx, ctxIdx, ejeIdx, delIdx);
      const fullPath = path.join(VAULT_PLANNINGS, plan.relativeDir, plan.fileName);

      fs.writeFileSync(fullPath, plan.markdown, 'utf8');
      faseCount++;
      grandTotal++;

      if (faseCount % 2000 === 0 || faseCount === fase.targetCount) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`   ⏳ [Fase ${fase.num}] Generadas ${faseCount}/${fase.targetCount} planeaciones (${elapsed}s)...`);
      }
    }

    // Generar Índice Maestro MOC para la Fase
    const mocContent = `---
tags: [iskool, indice_maestro, moc, segundo_cerebro, fase${fase.num}]
title: "Índice Maestro - ${fase.name.replace(/_/g, ' ')}"
docente: "Prof. Israel López Ángeles"
total_planeaciones: ${faseCount}
fecha_actualizacion: "${new Date().toISOString()}"
---

# 🗺️ Índice Maestro Curricular: ${fase.name.replace(/_/g, ' ')}
**Docente Titular y Administrador:** [[Prof_Israel_Lopez_Angeles|Prof. Israel López Ángeles]]  
**Total de Nodos Curriculares Generados:** \`${faseCount} planeaciones únicas y funcionales\`  
**Alineación Oficial:** Plan de Estudio y Programas Sintéticos SEP NEM 2024  

## 📊 Resumen por Grado y Campos Formativos
${grades.map(g => {
  const materias = Array.from(new Set(fase.curriculum.filter(c => c.grado === g).map(c => c.materia)));
  return `### 🎓 Grado: ${g.replace(/_/g, ' ')}\n${materias.map(m => `- **${m.replace(/_/g, ' ')}:** Carpeta \`planeaciones/${fase.name}/${g}/${m}/\``).join('\n')}`;
}).join('\n\n')}

---
*Generado y sincronizado automáticamente para el ecosistema ISkool y Obsidian Brain.*
`;

    const mocPath = path.join(VAULT_PLANNINGS, `00_Indice_Maestro_${fase.name}.md`);
    fs.writeFileSync(mocPath, mocContent, 'utf8');
    console.log(`✅ [Fase ${fase.num}] MOC creado: 00_Indice_Maestro_${fase.name}.md`);
  }

  // Generar Perfil del Docente Israel López Ángeles en Obsidian
  const teacherProfileContent = `---
tags: [iskool, docente, super_usuario, perfil]
nombre: "Israel López Ángeles"
titulo: "Prof. Israel López Ángeles"
cargo: "Docente Titular y Desarrollador Curricular"
email: "israel.lopez@iskool.edu.mx"
total_planeaciones_boveda: ${grandTotal}
fecha_registro: "${new Date().toISOString()}"
---

# 👨‍🏫 Perfil Docente: Prof. Israel López Ángeles

> [!NOTE] **Credencial de Docente y Super Usuario ISkool**
> - **Nombre Completo:** Prof. Israel López Ángeles
> - **Identificador:** \`usr-teacher-israel\`
> - **Correo Institucional:** \`israel.lopez@iskool.edu.mx\`
> - **Bóveda Curricular Gestionada:** \`${grandTotal} planeaciones didácticas activas\`
> - **Cobertura Curricular:** Educación Primaria (Fase 4 y Fase 5) y Secundaria (Fase 6)

## 🗺️ Índices Maestros Asignados
- [[00_Indice_Maestro_Primaria_Fase_4|Índice Maestro Primaria Fase 4 (3º y 4º)]]
- [[00_Indice_Maestro_Primaria_Fase_5|Índice Maestro Primaria Fase 5 (5º y 6º)]]
- [[00_Indice_Maestro_Secundaria_Fase_6_NEM2024|Índice Maestro Secundaria Fase 6 (1º, 2º y 3º)]]
`;
  fs.writeFileSync(path.join(VAULT_PLANNINGS, 'Prof_Israel_Lopez_Angeles.md'), teacherProfileContent, 'utf8');

  console.log(`\n🎉 ============================================================`);
  console.log(`🎉 GENERACIÓN COMPLETADA CON ÉXITO: ${grandTotal} PLANEACIONES`);
  console.log(`🎉 Todas estructuradas y listas en la bóveda de Obsidian.`);
  console.log(`🎉 ============================================================`);
}

runMassiveGeneration().catch(console.error);
