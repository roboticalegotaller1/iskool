import fs from 'fs';
import path from 'path';

const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';
const VAULT_PLANNINGS = path.join(OBSIDIAN_VAULT_PATH, 'planeaciones');

// =============================================================================
// METODOLOGÍAS, CONTEXTOS, PROBLEMÁTICAS Y ENTREGABLES NEM 2024 PARA FASE 3
// =============================================================================

const METHODOLOGIES = [
  {
    name: 'Aprendizaje Basado en Proyectos Comunitarios (ABPC)',
    fases: [
      '1. Nos ponemos de acuerdo y reconocemos la situación en el aula',
      '2. Indagamos con nuestras familias y exploramos con material concreto',
      '3. Creamos nuestra producción lúdica colectiva y jugamos en equipos',
      '4. Compartimos nuestros logros con la comunidad escolar y reflexionamos'
    ]
  },
  {
    name: 'STEAM con Enfoque de Indagación Lúdica y Manipulativa',
    fases: [
      '1. Pregunta curiosa y exploración sensorial del fenómeno',
      '2. Experimentación con materiales concretos, conteo y registro gráfico',
      '3. Construcción de modelos, figuras y artefactos sencillos',
      '4. Explicación con nuestras palabras y feria de descubrimientos'
    ]
  },
  {
    name: 'Aprendizaje Basado en Problemas (ABP Lúdico)',
    fases: [
      '1. Planteamiento del reto o dilema en el rincón de aprendizaje',
      '2. Búsqueda de pistas y recopilación de saberes previos',
      '3. Prueba de soluciones mediante juegos de rol y dinámicas grupales',
      '4. Asamblea escolar y acuerdos de convivencia o acción'
    ]
  },
  {
    name: 'Aprendizaje Servicio (AS Infantil)',
    fases: [
      '1. Punto de partida: Miramos lo que necesita nuestra escuela o salón',
      '2. Organización del plan de ayuda con apoyo de la maestra o maestro',
      '3. Manos a la obra: Realizamos la acción solidaria en la escuela',
      '4. Celebración del aprendizaje y agradecimientos colectivos'
    ]
  }
];

const CONTEXTS = [
  { tipo: 'Urbano Escolar', reto: 'Cuidado del agua en los bebederos, convivencia sana en los recreos y separación de basura en botes de colores.' },
  { tipo: 'Rural y Milpa', reto: 'Conteo de semillas de maíz y frijol, cuidado de los huertos escolares y respeto a los animales del campo.' },
  { tipo: 'Comunitario Originario', reto: 'Escucha de leyendas de los abuelos, palabras en lengua materna y respeto a las faenas escolares.' },
  { tipo: 'Costero y Ribereño', reto: 'Conteo de conchas y caracoles, protección de tortugas marinas y limpieza de la playa escolar.' },
  { tipo: 'Semiurbano y Vecinal', reto: 'Juegos tradicionales en el patio (avioncito, stop, cuerda), seguridad peatonal y respeto mutuo.' },
  { tipo: 'Boscoso y Montañoso', reto: 'Recolección de hojas secas, identificación de árboles locales y prevención de basura en los senderos.' },
  { tipo: 'Altiplano y Valle', reto: 'Cultivo de hortalizas en macetas recicladas, hábitos del Plato del Bien Comer y ahorro de energía en casa.' },
  { tipo: 'Intercultural Inclusivo', reto: 'Bienvenida a nuevos compañeros de diversas regiones, empatía, rondas infantiles y cooperación sin exclusión.' }
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
  'Libro ilustrado de conteo y problemas matemáticos de la tiendita escolar',
  'Mural colectivo de plastilina, semillas y material reciclado del aula',
  'Fichero lúdico de rimas, adivinanzas y palabras en tarjetas de colores',
  'Balanza rústica y registro pictográfico de pesos y medidas de objetos del salón',
  'Maqueta sensorial del hábitat de animales locales con material moldeable',
  'Álbum ilustrado "Mi Familia, Mi Escuela y Mi Comunidad"',
  'Cápsula de teatro guiñol con títeres de calcetín sobre la resolución de conflictos',
  'Semáforo ilustrado de hábitos de higiene y alimentación saludable',
  'Mural de la paz con huellas dactilares y acuerdos de convivencia ilustrados',
  'Feria de juegos matemáticos tradicionales con dados, taparroscas y tableros'
];

interface CurriculumBase {
  campo: string;
  materia: string;
  grado: string;
  gradoDisplay: string;
  tema: string;
  pda: string;
}

const CURRICULUM_FASE_3: CurriculumBase[] = [
  // ── 1ER GRADO DE PRIMARIA ──
  // Saberes y Pensamiento Científico (Matemáticas)
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Construcción de la noción de suma y resta con agrupaciones concretas', pda: 'Reconoce, a partir de la resolución de situaciones que implican agregar, quitar, juntar, comparar y completar, que la suma es el total de dos o más cantidades y la resta como la pérdida de elementos. Resuelve problemas vinculados a su contexto que implican sumas o restas (sin hacer uso del algoritmo convencional) con cantidades de hasta dos dígitos usando agrupaciones de decenas y unidades, material concreto y recta numérica.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Estudio de los números, conteo y valor posicional hasta 100', pda: 'Expresa oralmente la sucesión numérica en su lengua materna y en español, primero hasta 20, luego hasta 40, posteriormente hasta 60 y finalmente hasta 100, de manera ascendente y descendente a partir de un número dado. A través de situaciones cotidianas cuenta, ordena, representa de diferentes formas, interpreta, lee y escribe la cantidad de elementos de colecciones con menos de 100 elementos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Cuerpos geométricos y figuras planas con el tangram', pda: 'Observa y manipula objetos de su entorno y los clasifica de acuerdo con sus características geométricas (caras planas o curvas, lados rectos o curvos). Representa animales, plantas u objetos utilizando el tangram y otras figuras geométricas planas, reconociendo el círculo, cuadrado, triángulo y rectángulo.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Medición de longitud, peso y capacidad con patrones no convencionales', pda: 'Estima, mide, compara y ordena longitudes y distancias, pesos y capacidades con el uso de intermediarios no convencionales (pasos, cuartas, listones, clips, recipientes de arena y agua); explica en su lengua materna y en español los resultados obtenidos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Organización e interpretación de datos mediante pictogramas y tablas', pda: 'Elabora registros de datos mediante distintos recursos como pictogramas o tablas para responder preguntas de su interés escolar y comunitario; comparte sus hallazgos de forma oral y gráfica.' },

  // Saberes y Pensamiento Científico (Conocimiento del Medio / Ciencias)
  { campo: 'Saberes y Pensamiento Científico', materia: 'Conocimiento_del_Medio', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Exploración de la diversidad natural, plantas y animales locales', pda: 'Reconoce que es parte de la naturaleza e identifica características de plantas y animales de su comunidad (tamaño, forma de desplazamiento, cobertura corporal); propone y practica acciones para su cuidado y respeto.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Conocimiento_del_Medio', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'El cuerpo humano, los cinco sentidos y hábitos de higiene', pda: 'Reconoce y describe los órganos de los sentidos y su función en la interacción con el entorno; explica y pone en práctica acciones de higiene personal y cuidado corporal para mantenerse sano.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Conocimiento_del_Medio', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Cambios en la naturaleza del lugar donde vive (Día, noche y estaciones)', pda: 'Reconoce que el día y la noche, las estaciones del año y los cambios del estado del tiempo influyen en las actividades que realizan las personas, plantas y animales en su comunidad.' },

  // Lenguajes (Español)
  { campo: 'Lenguajes', materia: 'Espanol', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Escritura de nombres propios y correspondencia grafofonética', pda: 'Escribe su nombre y lo compara con los nombres de sus compañeros; lo usa para indicar la autoría de sus trabajos y marcar sus útiles. Reconoce la correspondencia entre la forma oral y escrita de las palabras y espacios entre ellas.' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Lectura compartida en voz alta de cuentos, coplas y rimas infantiles', pda: 'Reconoce que se lee de izquierda a derecha y de arriba abajo; sigue la lectura en voz alta que hace el docente, expresa sus emociones sobre las historias y anticipa contenidos a partir de ilustraciones.' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Narración de vivencias y eventos cotidianos en orden cronológico', pda: 'Narra actividades y eventos relevantes que han tenido lugar en su familia, la escuela o la comunidad en un orden cronológico coherente, apoyándose en dibujos y notas sencillas.' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Descripción de objetos, lugares y seres vivos mediante dibujo y texto', pda: 'Describe de manera oral y/o escrita, en su lengua materna, objetos, personas, seres vivos y lugares de su entorno natural y social, utilizando adjetivos sencillos y detalles gráficos.' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Uso del dibujo y la escritura colectiva por dictado al docente', pda: 'Produce textos mediante el dictado al docente para registrar acuerdos del aula, mensajes para su familia o notas informativas, revisando colectivamente que el mensaje sea claro.' },

  // Lenguajes (Artes)
  { campo: 'Lenguajes', materia: 'Artes', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Expresión de emociones a través del color, la textura y el modelado', pda: 'Explora y experimenta con diversas técnicas y materiales plásticos (pintura dactilar, crayolas, masa, plastilina, papel rasgado) para expresar libremente emociones, sensaciones e ideas sobre su entorno.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Apreciación de canciones, rondas infantiles y juegos sonoros', pda: 'Escucha, canta y se mueve al ritmo de rondas, canciones tradicionales y juegos sonoros de su comunidad y de México, reconociendo timbres, intensidades y tempos rápidos o lentos.' },

  // Ética, Naturaleza y Sociedades
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica_y_Etica', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'La comunidad escolar como espacio seguro y acuerdos de convivencia', pda: 'Identifica que es parte de una comunidad escolar y dialoga sobre la importancia de construir acuerdos y normas de convivencia basados en el respeto, la empatía y la no discriminación.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica_y_Etica', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Historia personal y familiar, árbol genealógico e identidad', pda: 'Reconoce su historia personal y familiar mediante fotografías, relatos y objetos significativos; valora la diversidad de estructuras familiares presentes en su comunidad.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica_y_Etica', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Derechos de las niñas y los niños a la salud, juego y educación', pda: 'Reconoce que niñas y niños tienen derecho a ser cuidados, alimentados, jugar, asistir a la escuela y ser tratados con dignidad y cariño en su familia y escuela.' },

  // De lo Humano y lo Comunitario
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Capacidades y habilidades motrices en juegos colaborativos', pda: 'Explora y coordina sus patrones básicos de movimiento (caminar, correr, saltar, reptar, lanzar y atrapar) en juegos individuales y colectivos para favorecer el conocimiento de su esquema corporal.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Socioemocional', grado: '1er_Grado', gradoDisplay: '1º de Primaria', tema: 'Reconocimiento y expresión de emociones básicas en el aula', pda: 'Identifica emociones básicas (alegría, tristeza, enojo, miedo, calma) en sí mismo y en los demás; expresa lo que siente mediante el diálogo y busca soluciones pacíficas ante conflictos.' },

  // ── 2DO GRADO DE PRIMARIA ──
  // Saberes y Pensamiento Científico (Matemáticas)
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Sumas y restas con reagrupación y estrategias de cálculo mental hasta 1000', pda: 'Representa y resuelve problemas de suma y resta vinculados a su contexto que implican transformar decenas en unidades o reagrupar decenas y centenas; utiliza algoritmos convencionales, la recta numérica y estrategias de cálculo mental con números de hasta tres cifras (hasta 1000).' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Multiplicación como suma repetida y arreglos rectangulares', pda: 'Resuelve problemas que implican calcular la cantidad total de elementos en arreglos rectangulares o colecciones de grupos iguales; comprende la multiplicación como sumas iteradas de sumandos iguales y utiliza el signo "×" en situaciones de la vida cotidiana.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Estudio de los números hasta 1000 y valor posicional (C, D, U)', pda: 'Cuenta, lee, escribe y ordena números naturales hasta 1000; identifica el valor posicional de centenas, decenas y unidades y compone o descompone números de diversas formas aditivas.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Figuras geométricas compuestas, simetría y cuerpos geométricos', pda: 'Construye y describe figuras geométricas complejas a partir de polígonos simples; identifica líneas de simetría y analiza las propiedades de prismas, cilindros y conos en objetos cotidianos.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Matematicas', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Medición de tiempo con reloj y calendario, y longitud con el metro', pda: 'Lee y registra la hora en relojes de manecillas y digitales (horas y medias horas); utiliza el calendario para ubicar fechas cívicas y festivas y mide longitudes empleando el metro y el centímetro.' },

  // Saberes y Pensamiento Científico (Conocimiento del Medio / Ciencias)
  { campo: 'Saberes y Pensamiento Científico', materia: 'Conocimiento_del_Medio', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Propiedades de los materiales y estados físicos del agua', pda: 'Experimenta con diferentes objetos para reconocer sus propiedades físicas (dureza, flexibilidad, permeabilidad); describe los estados físicos del agua (sólido, líquido, gas) en su entorno natural.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Conocimiento_del_Medio', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Ecosistemas locales, plantas medicinales y protección ambiental', pda: 'Describe las interacciones entre plantas, animales y el medio físico de su comunidad; valora el uso tradicional de plantas medicinales y participa en proyectos escolares de reciclaje y cuidado de áreas verdes.' },
  { campo: 'Saberes y Pensamiento Científico', materia: 'Conocimiento_del_Medio', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Los órganos de los sentidos y prevención de riesgos en el hogar y escuela', pda: 'Explica la importancia de los cinco sentidos para percibir el mundo y proteger la integridad física; identifica zonas y situaciones de riesgo en el hogar, la escuela y la calle, formulando reglas de prevención.' },

  // Lenguajes (Español)
  { campo: 'Lenguajes', materia: 'Espanol', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Producción e interpretación de instructivos y recetas ilustradas', pda: 'Comprende y produce textos instructivos breves (recetas de cocina saludable, instructivos de armado de juguetes, reglas de juegos); emplea verbos en infinitivo o imperativo y organiza pasos secuenciados con números e ilustraciones.' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Registro, resumen y exposición oral de temas de interés comunitario', pda: 'Registra información sobre un tema investigado en diversas fuentes orales y escritas; elabora notas breves y esquemas ilustrados para apoyar su exposición clara ante sus compañeros de clase.' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Lectura, reescritura y escenificación de fábulas y obras de teatro', pda: 'Lee y recrea fábulas y obras de teatro infantil; distingue entre diálogos y acotaciones, diseña títeres o vestuarios sencillos y participa en dramatizaciones escolares con modulación de voz.' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Creación de poemas, coplas, caligramas y rimas infantiles', pda: 'Lee y produce composiciones poéticas breves (coplas, poemas infantiles, caligramas, adivinanzas); identifica juegos de palabras, ritmo sonoro y figuras retóricas sencillas (comparaciones).' },
  { campo: 'Lenguajes', materia: 'Espanol', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Uso de signos de puntuación (punto, coma, interrogación) y mayúsculas', pda: 'Aplica el uso de mayúsculas al inicio de textos y en nombres propios; emplea el punto y seguido, punto final, la coma en enumeraciones y los signos de interrogación y admiración para dar entonación adecuada.' },

  // Lenguajes (Artes)
  { campo: 'Lenguajes', materia: 'Artes', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Creación plástica comunitaria con texturas, formas y collage', pda: 'Experimenta con diferentes combinaciones de color, luz, textura y materiales tridimensionales para elaborar composiciones plásticas individuales y colectivas inspiradas en las tradiciones de su pueblo o ciudad.' },
  { campo: 'Lenguajes', materia: 'Artes', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Expresión corporal, danza folclórica y rondas tradicionales', pda: 'Explora secuencias de movimiento corporal, ritmo y desplazamientos espaciales a través de danzas tradicionales mexicanas y juegos coreográficos, expresando vivencias y sentimientos.' },

  // Ética, Naturaleza y Sociedades
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica_y_Etica', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Cambios en la comunidad a través del tiempo, oficios y tradiciones', pda: 'Indaga con personas mayores sobre cómo era su comunidad en el pasado; identifica cambios en el paisaje, las construcciones, los medios de transporte y los oficios tradicionales, reconociendo el valor de la memoria histórica.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica_y_Etica', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Impacto de las actividades humanas en la naturaleza y sustentabilidad', pda: 'Analiza el impacto que tienen las actividades cotidianas en el suelo, agua y aire de su localidad; propone y lleva a cabo acciones colectivas de ahorro de agua, reciclaje y cuidado de la flora y fauna escolar.' },
  { campo: 'Ética, Naturaleza y Sociedades', materia: 'Formacion_Civica_y_Etica', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Igualdad de género, diálogo intercultural y cultura de paz', pda: 'Reconoce que todas las personas tienen los mismos derechos sin importar género, origen cultural o capacidades; practica el diálogo y la escucha activa para resolver desacuerdos cotidianos de forma no violenta.' },

  // De lo Humano y lo Comunitario
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Fisica', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Retos motores colaborativos, lateralidad y ritmo en equipo', pda: 'Adapta sus capacidades y destrezas motrices a las demandas de retos lúdicos individuales y en equipo; afianza su noción de lateralidad (derecha-izquierda), equilibrio y ritmo en juegos cooperativos.' },
  { campo: 'De lo Humano y lo Comunitario', materia: 'Educacion_Socioemocional', grado: '2do_Grado', gradoDisplay: '2º de Primaria', tema: 'Empatía, autorregulación y proyecto de vida en el aula', pda: 'Reconoce cómo sus emociones y acciones influyen en el bienestar propio y de los demás; establece metas sencillas de aprendizaje y convivencia y ofrece apoyo a compañeros que lo necesitan.' }
];

function sanitizeFilename(str: string): string {
  const clean = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return clean.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 75);
}

function generatePhase3PlaneacionMarkdown(
  curr: CurriculumBase,
  index: number,
  serie: string,
  methodology: typeof METHODOLOGIES[0],
  context: typeof CONTEXTS[0],
  ejes: string[],
  deliverable: string
): string {
  const code = `F3-${curr.materia.slice(0, 3).toUpperCase()}-${curr.grado.slice(0, 3).toUpperCase()}-${serie}V${String(index + 1).padStart(5, '0')}`;
  const filename = `Planeacion_${code}_${sanitizeFilename(curr.tema)}.md`;

  const situacionProblema = `En la comunidad escolar (${context.tipo}), los estudiantes de ${curr.gradoDisplay} han observado un reto cotidiano: ${context.reto}. A través del abordaje del tema "${curr.tema}", los alumnos se involucrarán de forma activa y lúdica aplicando la metodología de ${methodology.name}, logrando una experiencia formativa significativa que culminará en el desarrollo de un producto tangible: ${deliverable}.`;

  const sessionsMarkdown = Array.from({ length: 10 }, (_, i) => {
    const sNum = i + 1;
    const faseIdx = sNum <= 2 ? 0 : sNum <= 5 ? 1 : sNum <= 8 ? 2 : 3;
    const faseName = methodology.fases[faseIdx];

    return `### 📌 SESIÓN ${sNum} (50 min): ${faseName}
- **⏱️ Inicio (10 min):**
  - Recuperación lúdica de saberes previos con material concreto, dinámicas de movimiento, ronda o pregunta detonadora: *"¿Qué sabemos sobre ${curr.tema.toLowerCase()} y cómo lo usamos en nuestra casa o escuela?"*.
  - Organización del salón en parejas o equipos colaborativos mixtos ("Pequeños Investigadores") y presentación del objetivo lúdico de la sesión.
- **🔬 Desarrollo (30 min):**
  - **Actividad Situada Principal:** Exploración manipulativa guiada utilizando materiales didácticos concretos (regletas Cuisenaire, fichas de colores de decenas y unidades, máquina de sumar, tangram, títeres o tarjetas ilustradas).
  - Modelado y resolución colectiva de problemas contextualizados a la comunidad (${context.tipo}): los alumnos registran sus descubrimientos en su libreta con dibujos, tablas de conteo o textos breves.
  - Dinámica interactiva: estaciones de aprendizaje lúdico donde cada equipo prueba hipótesis, experimenta y colabora activamente.
- **🌟 Cierre (10 min):**
  - Puesta en común en semicírculo: cada equipo comparte un hallazgo o solución al reto del día.
  - Reflexión metacognitiva infantil: *"¿Qué aprendí hoy jugando?", "¿Qué fue lo más fácil y en qué necesité ayuda de mi compañero?"*.
  - Registro en el semáforo de autoevaluación y resguardo ordenado del material concreto.`;
  }).join('\n\n');

  return `---
title: "Proyecto Didáctico: ${curr.tema} (${curr.gradoDisplay})"
docente: "Prof. Israel López Ángeles"
docente_email: "israel.lopez@iskool.edu.mx"
nivel: "Primaria Baja (Fase 3)"
fase_nem: "Fase 3"
grado: "${curr.gradoDisplay}"
campo_formativo: "${curr.campo}"
materia: "${curr.materia}"
tema: "${curr.tema}"
codigo_curricular: "${code}"
metodologia: "${methodology.name}"
contexto_comunitario: "${context.tipo}"
problematica_situada: "${context.reto}"
duracion: "10 sesiones de 50 minutos (Total: 500 min / 2 semanas lectivas)"
ejes_articuladores: [${ejes.map(e => `"${e}"`).join(', ')}]
producto_entregable: "${deliverable}"
created_at: "2026-08-24"
updated_at: "2026-08-24"
tags:
  - iskool
  - planeacion_docente
  - nem_2024
  - fase_3
  - ${curr.grado.toLowerCase()}
  - ${curr.materia.toLowerCase()}
  - profesor_israel_lopez
---

# 📚 Proyecto Didáctico Integral: ${curr.tema}

> **Docente Titular:** [[Prof_Israel_Lopez_Angeles|Prof. Israel López Ángeles]]  
> **Nivel y Fase Educativa:** Educación Primaria Baja • Fase 3 (${curr.gradoDisplay})  
> **Campo Formativo:** ${curr.campo}  
> **Disciplina / Asignatura:** ${curr.materia.replace(/_/g, ' ')}  
> **Metodología Sociocrítica:** ${methodology.name}  
> **Ejes Articuladores:** ${ejes.join(' • ')}  
> **Temporalidad:** 10 sesiones de 50 minutos (2 semanas lectivas)  
> **Producto Central Integrador:** *${deliverable}*  

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Oficial SEP 2024)

\`\`\`yaml
PDA: "${curr.pda}"
\`\`\`

---

## 🏘️ II. Diagnóstico Comunitario y Situación Problemática

${situacionProblema}

### Preguntas Detonadoras del Proyecto:
1. ¿De qué manera el aprendizaje de **${curr.tema}** nos ayuda a comprender mejor el mundo que nos rodea y convivir en armonía?
2. ¿Cómo podemos resolver juntos el reto comunitario: *${context.reto}* usando material concreto y la creatividad del grupo?
3. ¿Por qué es importante colaborar en equipo con respeto, empatía y alegría en cada juego y actividad?

---

## 📅 III. Secuencia Didáctica Completa (Dosificación en 10 Bloques de 50 Minutos)

${sessionsMarkdown}

---

## 📊 IV. Rúbrica Analítica de Evaluación Formativa

| Criterio Pedagógico | Nivel Sobresaliente (3 pts) | Nivel Satisfactorio (2 pts) | Nivel En Proceso (1 pt) |
| :--- | :--- | :--- | :--- |
| **Dominio Conceptual y Aplicación:** *${curr.tema}* | Demuestra comprensión profunda del PDA; manipula con destreza el material concreto y resuelve situaciones problemáticas con autonomía y creatividad. | Comprende las ideas esenciales del contenido; utiliza el material manipulativo de forma adecuada con apoyo ocasional del docente. | Muestra dificultad para relacionar el material concreto con el concepto; requiere acompañamiento docente continuo. |
| **Pensamiento Crítico y Resolución de Retos** | Propone soluciones creativas ante retos cotidianos; explica con sus propias palabras sus procedimientos y formula preguntas curiosas. | Resuelve retos siguiendo las pautas dadas; explica de forma básica cómo llegó al resultado o descubrimiento. | Se limita a repetir procedimientos sin reflexionar sobre el significado o resultado de la actividad. |
| **Colaboración, Empatía y Producto Entregable** | Trabaja con gran entusiasmo y solidaridad en su equipo; cuida los materiales del aula y completa con excelencia el producto: *${deliverable}*. | Participa activamente en su equipo respetando turnos; entrega su producto en tiempo y forma mostrando dedicación. | Presenta dificultad para colaborar en equipo o concluir su producto; requiere mediación docente para regular su participación. |

---

## 📦 V. Recursos, Materiales y Evidencias Tangibles

- **Materiales Didácticos Manipulativos:** Fichas de colores (decenas y unidades), taparroscas, semillas, regletas Cuisenaire, tangram de madera/plástico, máquina de sumar, balanza de dos platos, dados, tarjetas numéricas y alfabéticas.
- **Materiales Gráficos y de Arte:** Papel bond, cartulinas de colores, plastilina no tóxica, crayolas, tijeras de punta redonda, pegamento lavable, revistas para recortar y recipientes reciclados.
- **Instrumentos de Evaluación Docente:** Lista de cotejo de observación directa, rúbrica analítica formativa, diario de campo del docente y semáforo de autoevaluación infantil.

---

*Planeación generada y sincronizada automáticamente para el ecosistema educativo ISkool NEM 2024.*
`;
}

async function generateMassiveFase3() {
  console.log('🚀 Iniciando Generación Masiva para PRIMARIA FASE 3 (1º y 2º de Primaria)...');
  console.log('📁 Destino: ' + VAULT_PLANNINGS);

  const fase3Dir = path.join(VAULT_PLANNINGS, 'Primaria_Fase_3');
  if (!fs.existsSync(fase3Dir)) fs.mkdirSync(fase3Dir, { recursive: true });

  const grade1Curriculum = CURRICULUM_FASE_3.filter(c => c.grado === '1er_Grado');
  const grade2Curriculum = CURRICULUM_FASE_3.filter(c => c.grado === '2do_Grado');

  const TARGET_PER_GRADE = 10000;
  let totalGenerated = 0;

  // GENERAR 1ER GRADO (10,000 planeaciones)
  console.log(`\n📚 Generando ${TARGET_PER_GRADE} planeaciones para 1º de Primaria (Fase 3)...`);
  for (let i = 0; i < TARGET_PER_GRADE; i++) {
    const curr = grade1Curriculum[i % grade1Curriculum.length];
    const meth = METHODOLOGIES[i % METHODOLOGIES.length];
    const ctx = CONTEXTS[i % CONTEXTS.length];
    const ejes = EJES_ARTICULADORES_LIST[i % EJES_ARTICULADORES_LIST.length];
    const deliv = DELIVERABLES_LIST[i % DELIVERABLES_LIST.length];

    const subDir = path.join(fase3Dir, '1er_Grado', curr.materia);
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });

    const code = `F3-${curr.materia.slice(0, 3).toUpperCase()}-1ER-V${String(i + 1).padStart(5, '0')}`;
    const filename = `Planeacion_${code}_${sanitizeFilename(curr.tema)}.md`;
    const filePath = path.join(subDir, filename);

    const content = generatePhase3PlaneacionMarkdown(curr, i, '', meth, ctx, ejes, deliv);
    fs.writeFileSync(filePath, content, 'utf-8');
    totalGenerated++;

    if ((i + 1) % 2500 === 0) {
      console.log(`   ✅ 1º de Primaria: ${i + 1}/${TARGET_PER_GRADE} planeaciones generadas.`);
    }
  }

  // GENERAR 2DO GRADO (10,000 planeaciones)
  console.log(`\n📚 Generando ${TARGET_PER_GRADE} planeaciones para 2º de Primaria (Fase 3)...`);
  for (let i = 0; i < TARGET_PER_GRADE; i++) {
    const curr = grade2Curriculum[i % grade2Curriculum.length];
    const meth = METHODOLOGIES[(i + 1) % METHODOLOGIES.length];
    const ctx = CONTEXTS[(i + 2) % CONTEXTS.length];
    const ejes = EJES_ARTICULADORES_LIST[(i + 3) % EJES_ARTICULADORES_LIST.length];
    const deliv = DELIVERABLES_LIST[(i + 4) % DELIVERABLES_LIST.length];

    const subDir = path.join(fase3Dir, '2do_Grado', curr.materia);
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });

    const code = `F3-${curr.materia.slice(0, 3).toUpperCase()}-2DO-V${String(i + 1).padStart(5, '0')}`;
    const filename = `Planeacion_${code}_${sanitizeFilename(curr.tema)}.md`;
    const filePath = path.join(subDir, filename);

    const content = generatePhase3PlaneacionMarkdown(curr, i, '', meth, ctx, ejes, deliv);
    fs.writeFileSync(filePath, content, 'utf-8');
    totalGenerated++;

    if ((i + 1) % 2500 === 0) {
      console.log(`   ✅ 2º de Primaria: ${i + 1}/${TARGET_PER_GRADE} planeaciones generadas.`);
    }
  }

  // GENERAR ÍNDICE MAESTRO MOC PARA FASE 3
  const mocFase3Path = path.join(VAULT_PLANNINGS, '00_Indice_Maestro_Primaria_Fase_3.md');
  const mocFase3Content = `---
title: "MOC Maestro: Planeaciones Didácticas Primaria Fase 3 (1º y 2º Grado) NEM 2024"
docente: "Prof. Israel López Ángeles"
total_planeaciones: 20000
nivel: "Primaria Baja • Fase 3"
tags: [iskool, moc_maestro, primaria_fase_3, nem2024, segundo_cerebro]
created_at: "2026-08-24"
---

# 🏫 Índice Maestro Curricular: Primaria Fase 3 (1º y 2º Grado) NEM 2024

**Responsable Curricular:** [[Prof_Israel_Lopez_Angeles|Prof. Israel López Ángeles]]  
**Total de Proyectos Didácticos Oficiales:** 20,000 planeaciones curriculares activas.

---

## 📌 Distribución por Grados y Disciplinas

### 🎒 1er Grado de Primaria (10,000 Planeaciones)
- **Saberes y Pensamiento Científico:** [[Primaria_Fase_3/1er_Grado/Matematicas|Matemáticas (Suma, Resta, Conteo, Tangram)]] • [[Primaria_Fase_3/1er_Grado/Conocimiento_del_Medio|Conocimiento del Medio (Cuerpo, Ecosistemas, Higiene)]]
- **Lenguajes:** [[Primaria_Fase_3/1er_Grado/Espanol|Español (Lectoescritura, Cuentos, Rimas)]] • [[Primaria_Fase_3/1er_Grado/Artes|Artes Plásticas y Musicales]]
- **Ética, Naturaleza y Sociedades:** [[Primaria_Fase_3/1er_Grado/Formacion_Civica_y_Etica|Formación Cívica, Convivencia y Derechos]]
- **De lo Humano y lo Comunitario:** [[Primaria_Fase_3/1er_Grado/Educacion_Fisica|Educación Física]] • [[Primaria_Fase_3/1er_Grado/Educacion_Socioemocional|Educación Socioemocional]]

### 🎒 2do Grado de Primaria (10,000 Planeaciones)
- **Saberes y Pensamiento Científico:** [[Primaria_Fase_3/2do_Grado/Matematicas|Matemáticas (Reagrupación, Multiplicación, Medidas)]] • [[Primaria_Fase_3/2do_Grado/Conocimiento_del_Medio|Conocimiento del Medio (Materiales, Sentidos, Ecosistemas)]]
- **Lenguajes:** [[Primaria_Fase_3/2do_Grado/Espanol|Español (Instructivos, Poemas, Fábulas, Signos de Puntuación)]] • [[Primaria_Fase_3/2do_Grado/Artes|Artes y Expresión Corporal]]
- **Ética, Naturaleza y Sociedades:** [[Primaria_Fase_3/2do_Grado/Formacion_Civica_y_Etica|Historia Local, Tradiciones y Cultura de Paz]]
- **De lo Humano y lo Comunitario:** [[Primaria_Fase_3/2do_Grado/Educacion_Fisica|Educación Física y Retos Motores]] • [[Primaria_Fase_3/2do_Grado/Educacion_Socioemocional|Educación Socioemocional y Empatía]]

---
*Bóveda Curricular Oficial ISkool Segundo Cerebro — Docente: Prof. Israel López Ángeles.*
`;
  fs.writeFileSync(mocFase3Path, mocFase3Content, 'utf-8');

  console.log(`\n🎉 ¡GENERACIÓN COMPLETADA EXITOSAMENTE!`);
  console.log(`📊 Total de nuevas planeaciones Fase 3 generadas: ${totalGenerated}`);
  console.log(`📄 Índice MOC creado en: ${mocFase3Path}`);
}

generateMassiveFase3().catch(console.error);
