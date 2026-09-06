import fs from 'fs';
import path from 'path';

const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const VAULT_PLANNINGS = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones');

// =============================================================================
// METODOLOGÍAS Y CONTEXTOS INNOVADORES - SERIE 2 (CODISEÑO NEM 2024 / ISKOOL)
// =============================================================================

const METHODOLOGIES_S2 = [
  {
    name: 'STEAM con Robótica, Pensamiento Computacional e Indagación',
    fases: ['1. Formulación del desafío y modelado conceptual', '2. Experimentación cuantitativa y programación de soluciones', '3. Construcción del prototipo funcional', '4. Validación empírica, comunicación comunitaria y evaluación']
  },
  {
    name: 'Aprendizaje Basado en Proyectos Comunitarios con Enfoque Socioambiental',
    fases: ['1. Diagnóstico participativo en territorio', '2. Indagación comunitaria y diálogo de saberes', '3. Creación y desarrollo del entregable social', '4. Socialización comunitaria y retroalimentación formativa']
  },
  {
    name: 'Aprendizaje Basado en Problemas con Pensamiento Crítico y Bioética',
    fases: ['1. Presentación de la disyuntiva socioética real', '2. Búsqueda de evidencia y análisis multicausal', '3. Formulación de alternativas de solución viables', '4. Debate fundamentado y acuerdos para el bienestar común']
  },
  {
    name: 'Aprendizaje Servicio con Innovación Social y Solidaria',
    fases: ['1. Mapeo de necesidades escolares y barriales', '2. Planificación estratégica de la intervención comunitaria', '3. Ejecución de la acción solidaria en campo', '4. Evaluación del impacto social y metacognición']
  }
];

const CONTEXTS_S2 = [
  { tipo: 'Ecosistema Urbano Sostenible', reto: 'Implementación de huertos verticales, captación pluvial urbana y mitigación de islas de calor en escuelas metropolitanas.' },
  { tipo: 'Comunidad Rural Agroecológica', reto: 'Transición hacia biofertilizantes, conservación de maíces nativos y rescate de técnicas milperas sustentables.' },
  { tipo: 'Pueblo Originario y Bilingüe de Tradición Ancestral', reto: 'Revitalización de la lengua originaria, preservación de la medicina tradicional y fortalecimiento del tequio.' },
  { tipo: 'Zona Costera y de Humedales', reto: 'Protección de arrecifes, reforestación de manglares y gestión del agua potable ante el impacto del cambio climático.' },
  { tipo: 'Entorno Industrial y Tecnológico', reto: 'Economía circular, monitoreo ciudadano de la calidad del aire y gestión de residuos electrónicos.' },
  { tipo: 'Región Forestal y de Alta Montaña', reto: 'Monitoreo de fauna endémica, prevención comunitaria de incendios y conservación de bosques de niebla.' },
  { tipo: 'Zona Lacustre y de Riberas', reto: 'Saneamiento de cuerpos de agua, agricultura en chinampas y preservación de la biodiversidad acuática.' },
  { tipo: 'Comunidad Escolar Multicultural y Migrante', reto: 'Integración inclusiva de familias en tránsito, cultura de paz y erradicación de toda forma de discriminación.' }
];

const EJES_ARTICULADORES_S2 = [
  ['Pensamiento Crítico', 'Interculturalidad Crítica', 'Vida Saludable'],
  ['Inclusión', 'Igualdad de Género', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
  ['Artes y Experiencias Estéticas', 'Pensamiento Crítico', 'Inclusión'],
  ['Vida Saludable', 'Pensamiento Crítico', 'Interculturalidad Crítica'],
  ['Interculturalidad Crítica', 'Artes y Experiencias Estéticas', 'Igualdad de Género'],
  ['Inclusión', 'Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura']
];

const DELIVERABLES_S2 = [
  'Cápsula audiovisual interactiva y documental en video con testimonios de la comunidad',
  'Prototipo tecnológico sustentable con circuitos, sensores ambientales y materiales reciclados',
  'Guía de campo ilustrada y herbario digital interactivo con fichas botánicas',
  'Campaña comunitaria multiplataforma con carteles infográficos y spots de audio',
  'Gaceta escolar de investigación científica y fanzine literario comunitario',
  'Simulador físico-matemático a escala y modelo tridimensional interactivo',
  'Recetario tradicional ilustrado con cálculo de aportes nutricionales y costo económico',
  'Obra de teatro guiñol y libreto dramático original sobre resolución pacífica de conflictos',
  'Cartografía social y mapa digital de riesgos, recursos y zonas de seguridad',
  'Feria estudiantil de ciencias aplicadas, tecnologías comunitarias y arte colectivo'
];

// =============================================================================
// CURRÍCULOS BASE FASE 4, FASE 5, FASE 6 (SEP NEM 2024)
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
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Narración de sucesos del pasado y del presente', pda: 'Identifica y comprende la función y las características principales de la narración; reconoce y usa estructuras narrativas (lineal, circular, in media res), estableciendo relaciones causa-efecto y utilizando el punto y seguido en párrafos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Descripción de personas, lugares, hechos y procesos', pda: 'Comprende textos descriptivos detallados, reflexiona sobre el uso de adjetivos, adverbios y frases adverbiales, y planea descripciones cronológicas con mayúsculas y comas.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Diálogo para la toma de acuerdos y el intercambio de puntos de vista', pda: 'Reconoce y usa pautas que norman los intercambios orales, respeta turnos de palabra, escucha con respeto y expresa ideas con claridad para tomar acuerdos colectivos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Comprensión y producción de textos expositivos', pda: 'Recurre a soportes con textos expositivos y diccionarios, comprendiendo estructuras de problema-solución y causa-consecuencia para redactar textos informativos del entorno.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Búsqueda y manejo reflexivo de información', pda: 'Formula preguntas de indagación con signos de interrogación, usa variadas fuentes de consulta, reflexiona sobre el orden alfabético y comprende el sentido general de textos informativos.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Narración de sucesos del pasado y del presente', pda: 'Reconoce estilos y recursos narrativos, establece relaciones causales y temporales entre acontecimientos y reflexiona sobre el uso de pretérito y copretérito.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Descripción de personas, lugares, hechos y procesos', pda: 'Planea y redacta descripciones lógicas de procesos comunitarios utilizando conectores secuenciales (en primer lugar, posteriormente, finalmente) y temporales (simultáneamente, antes, después).' },
  { campo: 'Lenguajes', materia: 'Español', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Comprensión y producción de resúmenes', pda: 'Explora y relaciona el contenido de textos con tablas, recuadros y gráficas, registrando información sustantiva con sus propias palabras.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Reconocimiento y reflexión sobre elementos de los lenguajes artísticos', pda: 'Realiza recreaciones con dibujos, cómics y flip-books a partir de manifestaciones culturales, comparando formas, colores, sonidos y movimientos de su comunidad.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Experimentación con elementos visuales y sonoros en producciones colectivas', pda: 'Crea animaciones y secuencias fotográficas (cortometrajes o stop motion), transformando objetos cotidianos y sonorizándolos para incidir en el entorno escolar.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Estructura y funcionamiento del cuerpo humano: sistema locomotor y digestivo', pda: 'Identifica que el sistema locomotor está conformado por el sistema óseo y muscular; explica la coordinación neuromuscular y describe prácticas para su cuidado y prevención de lesiones.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Alimentación saludable: Plato del Bien Comer y prácticas culturales', pda: 'Explica la importancia de consumir verduras, frutas, cereales y leguminosas acorde al Plato del Bien Comer, bebiendo agua simple potable y reduciendo grasas y azúcares.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Interacciones entre plantas, animales y el entorno natural', pda: 'Clasifica animales en vertebrados e invertebrados con base en su locomoción, reconociendo que los seres humanos pertenecen al grupo de vertebrados.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Estructura del sistema digestivo y su relación con el circulatorio', pda: 'Identifica la ruta de los alimentos en la ingestión, digestión, absorción y transporte de nutrimentos, experimentando con la saliva y jugos digestivos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Caracteres sexuales primarios y secundarios en pubertad', pda: 'Indaga mediante modelos los caracteres sexuales y los cambios físicos y emocionales durante la pubertad, comprendiendo el ciclo menstrual y los hábitos de higiene y autocuidado.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Nutrición de plantas, cadenas alimentarias y ecosistemas', pda: 'Explica la nutrición vegetal (fotosíntesis con luz solar, agua y CO2) y describe cadenas alimentarias estructuradas en productores, consumidores y descomponedores.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Estudio de los números naturales y fracciones en el contexto', pda: 'Expresa la sucesión numérica hasta cuatro cifras en orden ascendente y descendente; representa fracciones (medios, cuartos, octavos, dieciseisavos) con material concreto en situaciones cotidianas.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Suma y resta, su relación como operaciones inversas', pda: 'Resuelve problemas de suma y resta con números naturales de hasta tres cifras usando algoritmo convencional y cálculo mental, además de fracciones con igual denominador.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Estudio de números naturales hasta cinco cifras y decimales hasta centésimos', pda: 'Ordena, lee y escribe números naturales hasta cinco cifras; interpreta y representa números decimales hasta centésimos y fracciones en situaciones de reparto.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Cálculo de perímetro y área con retículas cuadradas', pda: 'Distingue entre contorno (perímetro) y superficie (área) en figuras geométricas planas, estimando y calculando áreas mediante retículas y unidades cuadradas (m², cm²).' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Representaciones cartográficas de la localidad y cuidado de ecosistemas', pda: 'Elabora croquis y mapas con puntos cardinales de la localidad, reconociendo las interdependencias de los componentes vivos y no vivos para la sustentabilidad.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Caracterización y localización del territorio de México', pda: 'Localiza y describe características físicas del territorio nacional (relieve, climas, cuerpos de agua, límites marítimos y terrestres) y la división política estatal.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica_Vida_Saludable', grado: '3er_Grado', gradoDisplay: '3º de Primaria', tema: 'Capacidades y habilidades motrices en situaciones de juego', pda: 'Adapta sus patrones básicos de movimiento en juegos cooperativos y deportivos para favorecer la coordinación motriz, la sana convivencia y el autoconcepto positivo.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Socioemocional', grado: '4to_Grado', gradoDisplay: '4º de Primaria', tema: 'Construcción del proyecto de vida y toma de decisiones asertivas', pda: 'Reconoce cambios en intereses y habilidades para ajustar metas personales y colectivas, valorando la equidad de género en el aula y la familia.' }
];

const CURRICULUM_FASE_5: CurriculumBase[] = [
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Narración de sucesos autobiográficos', pda: 'Lee textos autobiográficos en primera persona, organiza hechos cronológicamente con signos de puntuación (comas, puntos y seguido, dos puntos) y usa frases adjetivas y símiles.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Comprensión y producción de textos explicativos', pda: 'Diferencia entre descripción y explicación, recupera información de fuentes científicas y emplea relaciones causales (en consecuencia, por lo tanto, debido a).' },
  { campo: 'Lenguajes', materia: 'Español', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Participación en debates sobre temas de interés común', pda: 'Conoce la organización de un debate, investiga argumentos fundamentados con citas textuales y utiliza nexos de subordinación reconociendo el valor de cambiar de postura.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Narración de sucesos autobiográficos y memoria colectiva', pda: 'Identifica relaciones temporales de simultaneidad y duración con nexos adverbiales; edita un compendio autobiográfico colaborativo para la biblioteca escolar.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Comprensión y producción de textos explicativos avanzados', pda: 'Localiza textos científicos, elabora resúmenes estructurados de causa-efecto y emplea vocabulario técnico especializado para divulgar saberes a la comunidad.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Apropiación e intervención artística en el espacio comunitario', pda: 'Representa problemáticas comunitarias mediante historietas, maquetas, danzas y canciones populares con letras modificadas, interviniendo espacios escolares.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Combinación de lenguajes visuales, sonoros y teatrales', pda: 'Crea producciones artísticas con videoarte, instalaciones, murales colectivos y representaciones teatrales para transformar espacios públicos a favor del bienestar social.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Sistemas circulatorio, respiratorio e inmunológico y salud ambiental', pda: 'Describe con modelos la relación entre pulmones, corazón y vasos sanguíneos en el intercambio de gases; mide la frecuencia cardiaca en pulso y previene afecciones respiratorias.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Reproducción humana: fecundación, embarazo y parto responsable', pda: 'Comprende el proceso biológico del embarazo y parto como resultado de relaciones sexuales consentidas, valorando los derechos reproductivos y la prevención.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Sistema inmunológico, vacunas y prevención epidemiológica', pda: 'Explica la función de células y anticuerpos del sistema inmune ante virus y bacterias, argumentando la importancia científica de las vacunas y la Cartilla Nacional de Salud.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Ciencias_Naturales', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Efecto invernadero, gases contaminantes y cambio climático global', pda: 'Explica el efecto invernadero natural y su alteración antropogénica por quema de combustibles fósiles, proponiendo proyectos comunitarios de mitigación.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Estudio de números naturales hasta 9 cifras, decimales y fracciones', pda: 'Ordena, lee y escribe números naturales hasta nueve cifras y decimales hasta diezmilésimos; resuelve problemas de fracciones equivalentes y conversión decimal.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Proporcionalidad y porcentajes (50%, 25%, 20%, 10%)', pda: 'Determina valores faltantes en tablas de proporcionalidad directa con valor unitario y calcula porcentajes vinculándolos con fracciones (1/2, 1/4, 1/5, 1/10).' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Operaciones con decimales y fracciones con distinto denominador', pda: 'Resuelve problemas complejos de división de decimales entre naturales y fracciones entre naturales con estrategias de equivalencia y cálculo mental de porcentajes.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Geometría circular, valor aproximado de Pi y plano cartesiano', pda: 'Comprueba la relación constante entre circunferencia y diámetro (π ≈ 3.1416); ubica coordenadas en el primer cuadrante del plano cartesiano.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Megadiversidad mexicana y patrimonio biocultural', pda: 'Comprende por qué México es un país megadiverso en sus regiones biogeográficas, reconociendo la estrecha relación entre biodiversidad y tradiciones de los pueblos.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia_Historia', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Revolución Mexicana de 1910 y Constitución de 1917', pda: 'Indaga las causas del levantamiento revolucionario (despojo agrario, Porfiriato, huelgas de Cananea y Río Blanco), analizando los artículos 3º, 27 y 123 constitucionales.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Democracia, transparencia y rendición de cuentas en servicios públicos', pda: 'Comprende los principios del gobierno democrático representativo y federal, valorando el derecho a la información pública, la transparencia y el combate a la corrupción.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica_Vida_Saludable', grado: '5to_Grado', gradoDisplay: '5º de Primaria', tema: 'Capacidades motrices, juego estratégico y trabajo colaborativo', pda: 'Planifica estrategias en juegos de iniciación deportiva y tradicionales para fomentar la inclusión, el pensamiento creativo y la actividad física cotidiana.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Socioemocional', grado: '6to_Grado', gradoDisplay: '6º de Primaria', tema: 'Construcción del proyecto de vida y transición a la secundaria', pda: 'Evalúa logros personales en la primaria y formula metas formativas para el ingreso a la secundaria, fortaleciendo la autonomía y el sentido comunitario.' }
];

const CURRICULUM_FASE_6: CurriculumBase[] = [
  { campo: 'Lenguajes', materia: 'Español', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'La diversidad de lenguas y su uso en la comunicación familiar y comunitaria', pda: 'Reconoce la riqueza lingüística de México y el mundo a partir de obras literarias y testimonios orales, identificando variantes lingüísticas en la comunidad.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'La diversidad étnica, cultural y lingüística a favor de una sociedad intercultural', pda: 'Compara y contrasta textos sobre tensiones y aportaciones culturales de México, redactando textos argumentativos para la convivencia armónica.' },
  { campo: 'Lenguajes', materia: 'Español', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Textos literarios escritos en español o traducidos y creación lírica', pda: 'Crea textos literarios y guiones audiovisuales con base en el análisis formal de géneros literarios universales y mexicanos, manifestando una postura crítica.' },
  { campo: 'Lenguajes', materia: 'Ingles', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'La diversidad lingüística y cultural en países de habla inglesa', pda: 'Recupera datos fácticos y expresiones básicas en inglés sobre la diversidad cultural y lingüística de México y el mundo en organizadores gráficos.' },
  { campo: 'Lenguajes', materia: 'Ingles', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'El uso del inglés para expresar necesidades y problemas de la comunidad', pda: 'Elabora ensayos argumentativos cortos en inglés sobre propuestas de acción ciudadana para resolver problemas ambientales y sociales.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Diversidad de lenguajes artísticos en la riqueza pluricultural', pda: 'Reconoce en obras plásticas, dancísticas y musicales el uso del cuerpo, espacio y tiempo para valorar la identidad y el patrimonio biocultural.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Intervención artística en el espacio público y memoria colectiva', pda: 'Interviene espacios escolares y comunitarios mediante murales, performances y piezas audiovisuales que expresan la memoria histórica y la cultura de paz.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Expresión de fracciones como decimales y números con signo', pda: 'Usa estrategias para convertir fracciones a decimales y viceversa; reconoce números negativos en la recta numérica y propiedades de densidad.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Sistemas de dos ecuaciones lineales con dos incógnitas', pda: 'Modela y soluciona sistemas de 2x2 por métodos algebraicos (sustitución, igualación, reducción) y gráficos para resolver problemas reales.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Ecuaciones cuadráticas y fórmula general', pda: 'Resuelve ecuaciones cuadráticas de la forma Ax²+Bx+C=0 mediante factorización y fórmula general, interpretando el discriminante en modelos parabólicos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Biologia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Funcionamiento del sistema nervioso y endocrino en el cuerpo humano', pda: 'Explica la coordinación neuroendocrina en las funciones corporales y maduración sexual, argumentando el impacto de sustancias adictivas.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Biologia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Ciclos biogeoquímicos del carbono y nitrógeno y calentamiento global', pda: 'Representa redes y pirámides tróficas, explicando cómo la actividad industrial humana altera los ciclos biogeoquímicos del carbono y nitrógeno.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Fisica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Leyes de Newton y conceptos de fuerza, velocidad y aceleración', pda: 'Experimenta e interpreta las interacciones mecánicas con base en las tres Leyes de Newton, resolviendo problemas de cinemática y dinámica cotidiana.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Fisica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Principios de Pascal y Arquímedes en fluidos', pda: 'Aplica el Principio de Pascal en prensas hidráulicas y el Principio de Arquímedes en la flotabilidad de cuerpos y densidad de líquidos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Quimica', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Tabla periódica, modelos de Bohr y estructuras de Lewis', pda: 'Interpreta la Tabla Periódica por número atómico, grupos y periodos, representando electrones de valencia mediante diagramas de Lewis y Bohr.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Quimica', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Reacciones químicas y Ley de Conservación de la Materia', pda: 'Balancea ecuaciones químicas por tanteo verificando la Ley de Lavoisier, clasificando reacciones endotérmicas y exotérmicas en el entorno.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Geografia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'El espacio geográfico, placas tectónicas y relieve terrestre', pda: 'Comprende el espacio geográfico como construcción social; relaciona la dinámica de placas tectónicas con sismicidad, vulcanismo y prevención de riesgos.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Historia', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Leyes de Reforma, Guerra de Reforma e Intervención Francesa', pda: 'Analiza el enfrentamiento liberales-conservadores, la Constitución de 1857 y la victoria republicana de Juárez en la defensa de la soberanía.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Historia', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'México Contemporáneo: Cardenismo, Movimiento del 68 y EZLN 1994', pda: 'Analiza las transformaciones sociales del siglo XX, las demandas democráticas del 68 y el surgimiento del zapatismo indígena por autonomía y justicia.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Cultura de paz y resolución no violenta de conflictos sociales', pda: 'Propone estrategias de mediación comunitaria y diálogo asertivo para transformar conflictos sociales y erradicar la violencia escolar.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tecnologia', grado: '1er_Grado', gradoDisplay: '1º de Secundaria', tema: 'Herramientas, máquinas e instrumentos como extensión corporal', pda: 'Explora la delegación de funciones en herramientas y máquinas para resolver problemas técnicos comunitarios con criterios de ergonomía y seguridad.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tecnologia', grado: '3er_Grado', gradoDisplay: '3º de Secundaria', tema: 'Innovación técnica, pensamiento estratégico y evaluación de proyectos', pda: 'Diseña, implementa y evalúa proyectos tecnológicos sustentables que atienden necesidades reales del contexto con enfoque de economía circular.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Tutoria_Socioemocional', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Toma de decisiones asertivas y prevención de adicciones', pda: 'Gestiona afectos ante la presión social, valorando factores de protección para evitar adicciones y situaciones de riesgo físico y digital.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica', grado: '2do_Grado', gradoDisplay: '2º de Secundaria', tema: 'Pensamiento estratégico y juego limpio en el deporte educativo', pda: 'Reestructura tácticas individuales y colectivas en juegos deportivos, fomentando el juego limpio, la resolución asertiva y el compañerismo.' }
];

function sanitizeName(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

function generateSerie2PlanningMarkdown(
  faseNum: number,
  faseName: string,
  base: CurriculumBase,
  index: number,
  metIndex: number,
  ctxIndex: number,
  ejeIndex: number,
  delIndex: number
): { markdown: string; relativeDir: string; fileName: string; title: string; uniqueId: string } {
  const met = METHODOLOGIES_S2[metIndex % METHODOLOGIES_S2.length];
  const ctx = CONTEXTS_S2[ctxIndex % CONTEXTS_S2.length];
  const ejes = EJES_ARTICULADORES_S2[ejeIndex % EJES_ARTICULADORES_S2.length];
  const deliverable = DELIVERABLES_S2[delIndex % DELIVERABLES_S2.length];

  // Identificador único garantizado para la Serie 2
  const uniqueId = `SERIE2-F${faseNum}-${sanitizeName(base.materia).substring(0, 3).toUpperCase()}-${base.grado.substring(0, 3).toUpperCase()}-V${String(index + 10001).padStart(5, '0')}`;
  const title = `Proyecto de Codiseño Comunitario: ${base.tema} - Modalidad Innovadora ${index + 1} (${ctx.tipo})`;
  
  const tagCampo = sanitizeName(base.campo).toLowerCase();
  const tagGrado = sanitizeName(base.grado).toLowerCase();
  const tagMateria = sanitizeName(base.materia).toLowerCase();
  const tagMetodologia = sanitizeName(met.name).toLowerCase();
  const tagContexto = sanitizeName(ctx.tipo).toLowerCase();

  const fileName = `Planeacion_${uniqueId}_${sanitizeName(base.tema).substring(0, 32)}.md`;
  const relativeDir = path.join(faseName, base.grado, base.materia);

  const markdown = `---
tags: [iskool, planeacion_nem_serie2, segundo_cerebro, fase${faseNum}, campo_${tagCampo}, grado_${tagGrado}, materia_${tagMateria}, metodologia_${tagMetodologia}, contexto_${tagContexto}, codiseno_2026]
id_planeacion: "${uniqueId}"
serie: "Serie 2 - Innovación y Codiseño Curricular"
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

# 🚀 ${title}

> [!INFO] **Ficha Técnica Oficial NEM 2024 • Serie 2 de Codiseño ISkool**
> - **Docente Titular / Super Usuario:** [[Prof. Israel López Ángeles]] (\`usr-teacher-israel\`)
> - **Nivel y Fase Curricular:** ${base.gradoDisplay} • ${faseName.replace(/_/g, ' ')}
> - **Campo Formativo:** ${base.campo}
> - **Asignatura / Disciplina:** ${base.materia.replace(/_/g, ' ')}
> - **Metodología Activa:** ${met.name}
> - **Contexto Territorial:** ${ctx.tipo} (Reto Central: *${ctx.reto}*)
> - **Ejes Articuladores SEP:** ${ejes.join(' • ')}
> - **Temporalidad del Bloque:** 10 sesiones de 50 min (500 minutos de trabajo situado)

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Oficial SEP 2024)

> **"${base.pda}"**

---

## ❓ II. Preguntas Detonadoras y Conflicto Cognitivo Innovador

1. **¿Cómo podemos transformar el estudio de *"${base.tema}"* en una solución práctica para atender el reto de: *${ctx.reto}*?**
2. **¿Qué tecnologías accesibles, modelos experimentales o saberes locales podemos integrar para investigar con rigor científico y humanista?**
3. **¿De qué manera nuestro equipo colaborativo puede promover la equidad de género, la inclusión y la sustentabilidad en cada fase del proyecto?**
4. **¿Cuál es el impacto a largo plazo de nuestra propuesta en el bienestar de la comunidad escolar y barrial?**

---

## ⏱️ III. Secuencia Didáctica Oficial en 10 Sesiones de 50 Minutos (Estructura de 4 Fases)

### 📌 FASE 1: Diagnóstico Situado y Encuadre Cognitivo (Sesiones 1 y 2 - 100 min)
- **Sesión 1: Apertura del Desafío y Planteamiento Situado (50 min)**
  - *Inicio (10 min):* Presentación del caso detonador en el entorno ${ctx.tipo}. El Prof. Israel López Ángeles contextualiza la problemática con imágenes y datos de campo.
  - *Desarrollo (30 min):* Debate abierto en asamblea escolar sobre *"${ctx.reto}"*. Conformación de equipos de trabajo con roles asignados (coordinación, bitácora, materiales, divulgación).
  - *Cierre (10 min):* Registro de la meta de aprendizaje individual y colectiva en el cuaderno de proyectos.
- **Sesión 2: Mapeo Conceptual y Rescate de Saberes Previos (50 min)**
  - *Inicio (10 min):* Dinámica de preguntas cruzadas entre equipos sobre conceptos clave de *"${base.tema}"*.
  - *Desarrollo (30 min):* Construcción de un esquema visual colaborativo en papel o pizarra digital relacionando el PDA con la vida cotidiana.
  - *Cierre (10 min):* Acuerdos de indagación y lista de insumos para la fase experimental.

### 🔬 FASE 2: Indagación Crítica, Modelado y Experimentación (Sesiones 3 a 5 - 150 min)
- **Sesión 3: Protocolo de Investigación y Recolección de Datos (50 min)**
  - *Inicio (10 min):* Definición de variables o categorías de análisis documental y de campo.
  - *Desarrollo (30 min):* Consulta guiada en libros de texto SEP, artículos de divulgación o entrevistas con personas de la comunidad.
  - *Cierre (10 min):* Validación de fuentes y organización de fichas de síntesis informativa.
- **Sesión 4: Laboratorio Práctico / Experimentación y Prototipado (50 min)**
  - *Inicio (10 min):* Normas de seguridad y verificación de materiales didácticos disponibles.
  - *Desarrollo (30 min):* Realización de experimentos, mediciones matemáticas, cálculos o modelado concreto enfocado en *"${base.tema}"*.
  - *Cierre (10 min):* Registro de observaciones y tablas comparativas en la bitácora de ciencias.
- **Sesión 5: Análisis Interdisciplinario y Síntesis Crítica (50 min)**
  - *Inicio (10 min):* Articulación del proyecto con los ejes rectores: *${ejes.join(' y ')}*.
  - *Desarrollo (30 min):* Discusión en mesas redondas para interpretar los resultados y formular alternativas sustentables.
  - *Cierre (10 min):* Redacción del informe técnico preliminar por equipo.

### 💡 FASE 3: Integración Tecnológica, Creación y Elaboración del Entregable (Sesiones 6 a 8 - 150 min)
- **Sesión 6: Bocetaje y Diseño del Producto Tangible (50 min)**
  - *Inicio (10 min):* Revisión de los estándares de calidad de la rúbrica formativa analítica.
  - *Desarrollo (30 min):* Taller creativo: modelado, estructuración o redacción del primer prototipo de: *${deliverable}*.
  - *Cierre (10 min):* Sesión de coevaluación intermedia con retroalimentación formativa constructiva.
- **Sesión 7: Producción, Ensamblaje y Pulido del Entregable (50 min)**
  - *Inicio (10 min):* Incorporación de mejoras sugeridas por pares y por el Prof. Israel López Ángeles.
  - *Desarrollo (30 min):* Fabricación final, edición de textos o ensamblado técnico del producto.
  - *Cierre (10 min):* Control de calidad pedagógico y verificación del cumplimiento del PDA oficial.
- **Sesión 8: Ensayo de Presentación y Estrategia de Comunicación (50 min)**
  - *Inicio (10 min):* Diseño del guion expositivo y distribución de turnos de voz.
  - *Desarrollo (30 min):* Ensayo general de la socialización ante el grupo, afinando lenguaje técnico y apoyos visuales.
  - *Cierre (10 min):* Autovaloración del nivel de preparación del equipo.

### 🌟 FASE 4: Socialización Comunitaria, Rúbrica Analítica y Compromisos (Sesiones 9 y 10 - 100 min)
- **Sesión 9: Exposición y Diálogo Abierto con la Comunidad Escolar (50 min)**
  - *Inicio (10 min):* Instalación de la muestra interactiva y bienvenida por el Prof. Israel López Ángeles.
  - *Desarrollo (30 min):* Demostración pública de los proyectos ante compañeros, docentes y padres de familia.
  - *Cierre (10 min):* Espacio de preguntas, reflexiones compartidas y felicitaciones entre la comunidad.
- **Sesión 10: Metacognición, Evaluación Formativa y Transformación Social (50 min)**
  - *Inicio (10 min):* Cuestionario metacognitivo individual: "¿Cómo mejoró mi comprensión del entorno y qué habilidades desarrollé?".
  - *Desarrollo (30 min):* Aplicación de la Rúbrica Analítica Formativa y valoración global del aprendizaje.
  - *Cierre (10 min):* Firma del pacto comunitario de sustentabilidad y archivo de evidencias en el Segundo Cerebro.

---

## 📋 IV. Rúbrica Analítica Formativa (Criterios Oficiales NEM)

| Criterio Curricular NEM | Nivel Sobresaliente (3.5 - 4.0 pts) | Nivel Satisfactorio (2.5 - 3.4 pts) | Nivel En Proceso (1.0 - 2.4 pts) |
| :--- | :--- | :--- | :--- |
| **Apropiación del PDA Oficial** | Aplica con solvencia y rigor teórico el contenido *"${base.tema}"*, integrando conceptos clave y explicaciones fundamentadas. | Comprende y explica los elementos esenciales del PDA con adecuado nivel de detalle. | Identifica nociones generales del contenido pero requiere apoyo para su explicación sistemática. |
| **Pertinencia Situada (${ctx.tipo})** | Diseña respuestas innovadoras que atienden directamente el desafío *"${ctx.reto}"*, demostrando conciencia social y ecológica. | Vincula de manera correcta el proyecto con las condiciones de su comunidad o escuela. | Hace mención al contexto de forma aislada sin articularlo a la propuesta técnica. |
| **Calidad del Entregable (${deliverable})** | El entregable es riguroso, funcional, estéticamente cuidado y comunica con gran claridad su propósito transformador. | El entregable cumple los requisitos técnicos y didácticos solicitados en la planeación. | El entregable presenta inconsistencias o se encuentra parcialmente incompleto. |
| **Trabajo Colaborativo y Valores Éticos** | Fomenta la inclusión activa, el diálogo empático, la equidad de género y el compromiso solidario en todo momento. | Colabora de forma armónica en las tareas del equipo respetando acuerdos. | Muestra dificultad para coordinarse con sus pares o cumplir con sus responsabilidades asignadas. |

---

## 📦 V. Recursos, Materiales y Entregable Tangible

### 🛠️ Materiales y Recursos Didácticos
- Libros de Texto Gratuitos (SEP 2024), plataformas de consulta digital y guías metodológicas.
- Materiales de experimentación, reciclaje y papelería: cartón, madera reciclada, componentes sencillos, pinturas no tóxicas.
- Dispositivos de registro: cámara, grabadora de voz, proyector audiovisual y herramientas de software libre.

### 📄 Producto Tangible Entregable
> **${deliverable}** aplicado a la atención situada de: *${ctx.reto}*.

---

## 🔗 Nodos Relacionados y Conexiones en el Segundo Cerebro
- [[00_Indice_Maestro_${faseName}|Índice Maestro ${faseName.replace(/_/g, ' ')}]]
- [[Prof_Israel_Lopez_Angeles|Perfil del Docente Titular: Prof. Israel López Ángeles]]
- Etiquetas: #${tagCampo} • #${tagMateria} • #${tagGrado} • #${tagMetodologia} • #codiseno_2026
`;

  return { markdown, relativeDir, fileName, title, uniqueId };
}

async function runSerie2MassiveGeneration() {
  console.log('🚀 =========================================================================');
  console.log('🚀 GENERADOR MASIVO SERIE 2: 10,000 NUEVAS PLANEACIONES POR DOCUMENTO');
  console.log('🚀 Docente Titular: Prof. Israel López Ángeles (usr-teacher-israel)');
  console.log('🚀 Objetivo: 30,000 Nuevas Planeaciones Diferenciadas (Total Bóveda: ~60,400)');
  console.log('🚀 =========================================================================\n');

  const FASES_CONFIG = [
    { num: 4, name: 'Primaria_Fase_4', curriculum: CURRICULUM_FASE_4, targetCount: 10000 },
    { num: 5, name: 'Primaria_Fase_5', curriculum: CURRICULUM_FASE_5, targetCount: 10000 },
    { num: 6, name: 'Secundaria_Fase_6_NEM2024', curriculum: CURRICULUM_FASE_6, targetCount: 10000 }
  ];

  let grandTotal = 0;

  for (const fase of FASES_CONFIG) {
    console.log(`\n📂 Generando 10,000 NUEVAS planeaciones para Fase ${fase.num} (${fase.name})...`);
    const startTime = Date.now();
    let faseCount = 0;
    const baseLen = fase.curriculum.length;

    // Crear subdirectorios si no existen
    const grades = Array.from(new Set(fase.curriculum.map(c => c.grado)));
    for (const g of grades) {
      const materias = Array.from(new Set(fase.curriculum.filter(c => c.grado === g).map(c => c.materia)));
      for (const m of materias) {
        const dir = path.join(VAULT_PLANNINGS, fase.name, g, m);
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    for (let i = 0; i < fase.targetCount; i++) {
      const base = fase.curriculum[i % baseLen];
      const metIdx = Math.floor(i / baseLen) + 2; // Offset para metodologías diferentes
      const ctxIdx = (i + 3) % CONTEXTS_S2.length;
      const ejeIdx = (i + 1) % EJES_ARTICULADORES_S2.length;
      const delIdx = (i + 4) % DELIVERABLES_S2.length;

      const plan = generateSerie2PlanningMarkdown(fase.num, fase.name, base, i, metIdx, ctxIdx, ejeIdx, delIdx);
      const fullPath = path.join(VAULT_PLANNINGS, plan.relativeDir, plan.fileName);

      fs.writeFileSync(fullPath, plan.markdown, 'utf8');
      faseCount++;
      grandTotal++;

      if (faseCount % 2000 === 0 || faseCount === fase.targetCount) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`   ⏳ [Fase ${fase.num} - Serie 2] Generadas ${faseCount}/${fase.targetCount} planeaciones (${elapsed}s)...`);
      }
    }

    console.log(`✅ [Fase ${fase.num} - Serie 2] 10,000 nuevas planeaciones escritas exitosamente.`);
  }

  // Actualizar perfil del docente con nuevo gran total
  const teacherProfileContent = `---
tags: [iskool, docente, super_usuario, perfil]
nombre: "Israel López Ángeles"
titulo: "Prof. Israel López Ángeles"
cargo: "Docente Titular y Desarrollador Curricular"
email: "israel.lopez@iskool.edu.mx"
total_planeaciones_boveda: 60408
fecha_registro: "${new Date().toISOString()}"
---

# 👨‍🏫 Perfil Docente: Prof. Israel López Ángeles

> [!NOTE] **Credencial de Docente y Super Usuario ISkool**
> - **Nombre Completo:** Prof. Israel López Ángeles
> - **Identificador:** \`usr-teacher-israel\`
> - **Correo Institucional:** \`israel.lopez@iskool.edu.mx\`
> - **Bóveda Curricular Gestionada:** \`60,400+ planeaciones didácticas activas (Serie 1 y Serie 2 de Codiseño)\`
> - **Cobertura Curricular:** Educación Primaria (Fase 4 y Fase 5) y Secundaria (Fase 6)

## 🗺️ Índices Maestros Asignados
- [[00_Indice_Maestro_Primaria_Fase_4|Índice Maestro Primaria Fase 4 (3º y 4º)]]
- [[00_Indice_Maestro_Primaria_Fase_5|Índice Maestro Primaria Fase 5 (5º y 6º)]]
- [[00_Indice_Maestro_Secundaria_Fase_6_NEM2024|Índice Maestro Secundaria Fase 6 (1º, 2º y 3º)]]
`;
  fs.writeFileSync(path.join(VAULT_PLANNINGS, 'Prof_Israel_Lopez_Angeles.md'), teacherProfileContent, 'utf8');

  console.log(`\n🎉 =========================================================================`);
  console.log(`🎉 GENERACIÓN SERIE 2 FINALIZADA: ${grandTotal} NUEVAS PLANEACIONES CREADAS`);
  console.log(`🎉 Gran total en Bóveda Obsidian: ~60,400 archivos listos y funcionales.`);
  console.log(`🎉 =========================================================================`);
}

runSerie2MassiveGeneration().catch(console.error);
