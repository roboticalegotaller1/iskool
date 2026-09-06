import fs from 'fs';
import path from 'path';

const VAULT_BASE = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool\\planeaciones\\Secundaria';

interface DetailedPlanning {
  campo: string;
  materia: string;
  materiaFolder: string;
  grado: string;
  gradoDisplay: string;
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

const officialPlannings: DetailedPlanning[] = [
  // =========================================================================
  // PLANEACIÓN 1: BIOLOGÍA (1º DE SECUNDARIA) - Pág. 63 del Programa Sintético Oficial
  // =========================================================================
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biología',
    materiaFolder: 'Biologia',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaTitulo: 'Prevención de enfermedades relacionadas con la alimentación y el consumo de alimentos ultraprocesados',
    tituloProyecto: 'Radiografía de los Ultraprocesados: Etiquetado Frontal, Balance Calórico y Huella Metabólica',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Identifica causas de la obesidad y la diabetes relacionadas con la dieta y el sedentarismo, a fin de formular su proyecto de vida saludable; incluye factores protectores y propone acciones para reducir factores de riesgo, incluyendo su entorno familiar y comunitario. Formula hipótesis acerca de las consecuencias de carencia o exceso de nutrimentos en la dieta; interpreta datos que muestran la correlación entre la incidencia de enfermedades como la caries e hipertensión y el consumo de exceso de sal, azúcar y grasas saturadas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué los alimentos ultraprocesados están diseñados para ser hiperpalatables (adictivos al paladar) mediante mezclas de azúcar, grasas saturadas y sodio?',
      '¿Qué significan exactamente los octágonos negros de la NOM-051 ("Exceso Calorías", "Exceso Azúcares", "Exceso Sodio", "Contiene Edulcorantes - No recomendable en niños") y cómo nos ayudan a tomar decisiones?',
      '¿Cómo se relaciona el consumo crónico de bebidas azucaradas y harinas refinadas con la resistencia a la insulina, el hígado graso y la diabetes tipo 2 en adolescentes?',
      '¿Qué alimentos naturales de la milpa mexicana (frijol, maíz nixtamalizado, calabacita, quelites) pueden sustituir a las botanas procesadas de la cooperativa escolar?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Demostración Visual del "Azúcar Oculto": El docente coloca sobre la mesa botellas de refresco (600 ml), jugos comerciales y galletas, acompañadas de bolsas transparentes con la cantidad equivalente en gramos de azúcar refinada (ej. 12 cucharadas de azúcar para un refresco).
2. Pregunta detonadora central: "Si nos sirvieran un vaso con 12 cucharadas soperas de azúcar pura jamás nos la comeríamos sola... ¿por qué sí nos la tomamos disuelta en un refresco frío?".
3. Recuperación de saberes previos: Diferencia biológica entre alimentos frescos/mínimamente procesados vs productos ultraprocesados con conservadores y colorantes artificiales.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Auditoría de Empaques en Equipos de 4:
   • Cada equipo analiza 3 empaques reales de botanas y refrescos populares traídos de la tienda escolar.
   • Calculan el porcentaje del Valor Nutrimental de Referencia (%VNR) para sodio, azúcar y grasas saturadas por porción.
   • Comparan con el límite diario recomendado por la Organización Mundial de la Salud (OMS: máx. 25 g de azúcares libres y 2 g de sodio al día).
2. Modelado Metabólico Celular:
   • Explicar en esquema cómo el exceso de glucosa en sangre satura los receptores de insulina en las células musculares y hepáticas, obligando al páncreas a sobretrabajar (hiperinsulinemia) y convirtiendo el excedente en triglicéridos.
3. Diseño de la "Canasta de Alimentos Protectores":
   • En la ficha de trabajo, proponen 3 colaciones escolares saludables, económicas y de origen local (fruta de temporada con limón y chile piquín sin sal excesiva, palomitas de maíz caseras sin mantequilla industrial, semillas de calabaza/cacahuates tostados).`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Plenaria y Síntesis: Conclusiones del grupo sobre el impacto del marketing dirigido a adolescentes y la importancia de defender el derecho a una alimentación sana.
2. Metacognición en Bitácora: Responder: "¿Qué hábito alimenticio concreto puedo modificar a partir de hoy en mi desayuno escolar?".
3. Entrega de evidencia: Ficha técnica de auditoría nutrimental y diseño de colación protectora.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión Fisiológica y Metabólica (Sobresaliente [3 pts]: Explica con rigor la correlación entre consumo de ultraprocesados, resistencia a la insulina y enfermedades crónicas | Satisfactorio [2 pts]: Describe la relación general entre dieta y obesidad con detalles menores | En Proceso [1 pt]: Confunde calorías con nutrientes sin explicar el impacto orgánico).
• Criterio 2 - Interpretación del Etiquetado Frontal NOM-051 (Sobresaliente [3 pts]: Calcula gramos y %VNR de sellos de advertencia y argumenta su elección informada | Satisfactorio [2 pts]: Reconoce los sellos pero tiene dificultades en el cálculo matemático | En Proceso [1 pt]: Desconoce el significado de los octágonos de advertencia).
• Criterio 3 - Propuesta Comunitaria de Factores Protectores (Sobresaliente [4 pts]: Diseña un plan de colaciones saludables basado en alimentos locales sustentables | Satisfactorio [2.5 pts]: Propuesta viable con opciones limitadas | En Proceso [1 pt]: Propone alternativas poco saludables o genéricas).
• Instrumento: Rúbrica analítica y lista de cotejo coevaluativa de clase.`,
    materiales: `• Empaques vacíos de alimentos ultraprocesados comerciales con sellos NOM-051.
• Bolsitas con azúcar y sal de mesa pesadas con balanza para demostración sensorial.
• Hojas de trabajo impresas "Auditoría Metabólica de la Dieta Juvenil".
• Cinta métrica para medición de perímetro abdominal y tablas de la OMS.`,
    evidenciaEntregable: `Reporte de Auditoría Nutrimental "Radiografía de un Alimento Ultraprocesado" con propuesta de colación protectora basada en la dieta de la milpa.`
  },

  // =========================================================================
  // PLANEACIÓN 2: QUÍMICA (3º DE SECUNDARIA) - Pág. 70 del Programa Sintético Oficial
  // =========================================================================
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Química',
    materiaFolder: 'Quimica',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaTitulo: 'Presencia de contaminantes y su concentración, relacionada con la degradación y contaminación ambiental en la comunidad',
    tituloProyecto: 'Química Ambiental: Medición en Partes por Millón (ppm) y Mitigación de Contaminantes en Agua y Suelo',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (3º Secundaria) - Indaga situaciones problemáticas relacionadas con la degradación y contaminación en la comunidad, vinculadas con el uso de productos y procesos químicos. Sistematiza la información de diferentes fuentes de consulta, orales y escritas, acerca de la concentración de contaminantes (partes por millón <ppm>) en aire, agua y suelo. Diseña y lleva a cabo proyectos comunitarios con la intención de proponer medidas preventivas o alternativas de solución, factibles y sustentables para el cuidado de la salud y el medio ambiente.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué una sustancia altamente tóxica (como el plomo, arsénico o pesticidas) puede ser letal incluso en concentraciones invisibles de unas pocas "partes por millón" (ppm)?',
      '¿Cómo calculamos matemáticamente la concentración en ppm ($\\text{ppm} = \\frac{\\text{mg de soluto}}{\\text{kg de disolución}}$ o $\\frac{\\text{mg}}{\\text{L}}$) en una muestra de agua de río o pozo?',
      '¿Qué es la bioacumulación y biomagnificación de metales pesados en las cadenas tróficas acuáticas que terminan en los peces que consumimos?',
      '¿Qué procesos químicos sencillos (floculación con sales de aluminio, carbón activado, aireación) permiten reducir los contaminantes en el agua comunitaria?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Demostración de Dilución Seriada de Colorante en 6 Vasos:
   • Vaso 1: Solución concentrada al 10% (100,000 ppm).
   • Vaso 6: Solución diluida a 1 ppm (el agua se ve completamente transparente e inodora a simple vista, pero contiene moléculas del soluto).
2. Pregunta detonadora: "Si una muestra de agua de río se ve cristalina y no huele mal... ¿garantiza eso que sea potable y esté libre de contaminantes químicos como plaguicidas o metales pesados?".
3. Definición formal de Partes por Millón (ppm) y límites máximos permisibles según la Norma Oficial Mexicana NOM-127-SSA1 para agua de uso humano.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Cálculo Estequiométrico de ppm en Equipos de 3:
   • Caso A: Un análisis de laboratorio en un pozo detecta $0.05\\text{ mg}$ de plomo ($Pb$) en una muestra de $2\\text{ litros}$ de agua. Calcular la concentración en ppm ($\\text{ppm} = 0.05 / 2 = 0.025\\text{ ppm}$) y contrastar con la norma (límite: $0.01\\text{ ppm}$). Determinar si el agua es apta para consumo.
   • Caso B: Concentración de partículas $PM_{2.5}$ en el aire durante una contingencia ambiental urbana ($150\\ \\mu\\text{g}/\\text{m}^3$).
2. Práctica de Tratamiento Químico de Agua por Floculación y Filtración:
   • En un vaso con agua turbia y arcilla, los alumnos agregan una pizca de sulfato de aluminio o cal para aglutinar partículas coloidales (flóculos).
   • Pasan la muestra por un filtro casero de grava, arena silica y carbón activado, midiendo el cambio de turbidez y pH antes y después del tratamiento.
3. Propuesta Comunitaria: Diseño de un protocolo de captación y filtración de agua pluvial para la escuela.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Puesta en común de los cálculos de concentración y eficiencia del filtro casero.
2. Metacognición en libreta: "¿Por qué el concepto de concentración en ppm es indispensable para la legislación ambiental?".
3. Entrega de evidencia: Reporte de problemas de cálculo en ppm y resultados del filtrado químico.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Dominio Matemático y Químico de Concentración en ppm (Sobresaliente [3 pts]: Resuelve conversiones de unidades y fórmulas de ppm con exactitud matemática y rigor conceptual | Satisfactorio [2 pts]: Aplica la fórmula pero comete errores menores en conversión de mg a kg | En Proceso [1 pt]: Dificultad para comprender la relación soluto-disolvente).
• Criterio 2 - Experimentación y Separación Química (Sobresaliente [3 pts]: Realiza el proceso de floculación y filtración con destreza técnica y registro de variables | Satisfactorio [2 pts]: Desarrolla el experimento con apoyo docente | En Proceso [1 pt]: No logra separar las fases coloidales).
• Criterio 3 - Propuesta Ambiental y Salud Pública (Sobresaliente [4 pts]: Argumenta soluciones sustentables para el tratamiento de agua en su comunidad | Satisfactorio [2.5 pts]: Propuesta viable básica | En Proceso [1 pt]: No propone alternativas de solución).
• Instrumento: Rúbrica de laboratorio químico y resolución de problemas.`,
    materiales: `• Colorante vegetal, 6 vasos de precipitado de 100 ml y goteros.
• Sulfato de aluminio o alumbre comercial, cal, carbón activado triturado, arena sílica, grava.
• Muestras de agua turbia simulada.
• Calculadoras científicas y hojas de trabajo con problemas de la NOM-127-SSA1.`,
    evidenciaEntregable: `Reporte de Práctica de Laboratorio "Determinación de Concentración en ppm y Purificación de Agua por Floculación y Carbón Activado".`
  },

  // =========================================================================
  // PLANEACIÓN 3: HISTORIA (2º DE SECUNDARIA) - Pág. 96 del Programa Sintético Oficial
  // =========================================================================
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Historia',
    materiaFolder: 'Historia',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaTitulo: 'Las tensiones en el siglo XX: El Movimiento Estudiantil de 1968 y la Lucha por las Libertades Democráticas',
    tituloProyecto: 'Voces de Tlatelolco: Juventudes, Crónicas Testimoniales y el Movimiento Estudiantil de 1968',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Recupera información de crónicas y narrativas de participantes del movimiento estudiantil de 1968, la analiza y construye hipótesis propias sobre sus causas y consecuencias. Reflexiona a partir de su condición de estudiante, acerca de la perspectiva histórica de las y los jóvenes que participaron en este movimiento. Emite juicios acerca del trato y la respuesta que el gobierno de Gustavo Díaz Ordaz dio al movimiento estudiantil de 1968.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué un pleito callejero entre estudiantes de una vocacional del IPN y una preparatoria de la UNAM en julio de 1968 escaló hasta convertirse en un movimiento nacional por las libertades democráticas?',
      '¿Cuáles eran los 6 puntos centrales del Pliego Petitorio del Consejo Nacional de Huelga (CNH: libertad a presos políticos, derogación del delito de disolución social, disolución del cuerpo de granaderos)?',
      '¿Cómo utilizaron los jóvenes del 68 la gráfica popular, las brigadas relámpago y la "Marcha del Silencio" para desafiar el cerco informativo del gobierno autoritario?',
      '¿Qué impacto tuvo la masacre del 2 de octubre en la Plaza de las Tres Culturas de Tlatelolco en la apertura democrática y en los derechos ciudadanos de nuestro México actual?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Audición de la grabación histórica del Poema "Memorial de Tlatelolco" de Rosario Castellanos y proyección de fotografías de volantes y mantas del movimiento de 1968.
2. Pregunta detonadora: "¿Por qué para el gobierno de 1968 unos jóvenes universitarios con pancartas pacíficas eran considerados una 'amenaza a la seguridad nacional' en vísperas de los Juegos Olímpicos?".
3. Activación de conocimientos previos: Contexto internacional de la Guerra Fría, Mayo Francés de 1968 y el régimen unipartidista autoritario en México.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Análisis de Fuentes Testimoniales en Equipos de 4:
   • Lectura y contrastación de fragmentos de "La noche de Tlatelolco" de Elena Poniatowska (testimonios de estudiantes, madres de familia y soldados) vs el Discurso del Informe Presidencial de Gustavo Díaz Ordaz del 1 de septiembre de 1969.
   • Identificación de las contradicciones entre la versión oficial gubernamental ("conspiración comunista extranjera") y la realidad de una protesta estudiantil pacífica por derechos constitucionales.
2. Taller de Gráfica Popular y Brigadas del 68:
   • Los alumnos analizan los grabados y carteles de la Academia de San Carlos (el uso de la paloma de la paz atravesada por una bayoneta, el bote de basura olímpico).
   • En equipos, diseñan un cartel conmemorativo o volante informativo que represente las demandas legítimas del CNH aplicando técnicas de grabado o dibujo con tinta.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Montaje de la Galería de la Memoria del 68 en el salón de clases.
2. Metacognición en libreta: "Como estudiante de secundaria del siglo XXI... ¿qué libertades disfruto hoy que fueron conquistadas por la juventud de 1968?".
3. Entrega de evidencia: Cuadro comparativo de testimonios y cartel conmemorativo con justificación histórica.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Pensamiento Histórico y Análisis de Fuentes Primarias (Sobresaliente [3 pts]: Contrasta con rigor crítico los testimonios de participantes y el discurso oficial gubernamental | Satisfactorio [2 pts]: Describe los hechos cronológicos con análisis básico de fuentes | En Proceso [1 pt]: Repite información sin contrastar perspectivas históricas).
• Criterio 2 - Juicio Crítico sobre el Autoritarismo y los DDHH (Sobresaliente [3 pts]: Emite juicios fundamentados sobre el impacto de la represión del Estado y la lucha por las libertades civiles | Satisfactorio [2 pts]: Expresa una postura ética general | En Proceso [1 pt]: Muestra indiferencia ante la vulneración de derechos).
• Criterio 3 - Expresión y Comunicación Visual de la Memoria (Sobresaliente [4 pts]: Diseña un cartel con simbolismo histórico potente y justificación contextualizada | Satisfactorio [2.5 pts]: Cartel claro con simbolismo básico | En Proceso [1 pt]: Trabajo incompleto sin relación al tema).
• Instrumento: Rúbrica de análisis historiográfico y producción gráfica conmemorativa.`,
    materiales: `• Antología de crónicas testimoniales de "La noche de Tlatelolco" (Elena Poniatowska).
• Reproducciones de carteles y volantes del Consejo Nacional de Huelga (1968).
• Cartulinas blancas, tinta china / plumones negros y rojos, rodillos o esponjas de estarcido.
• Audio con discursos históricos y poemas de Rosario Castellanos y Jaime Sabines.`,
    evidenciaEntregable: `Dossier Histórico "Voces de la Memoria: 1968 y el Despertar Ciudadano en México" con cartel de gráfica popular y análisis crítico de fuentes testimoniales.`
  },

  // =========================================================================
  // PLANEACIÓN 4: GEOGRAFÍA (1º DE SECUNDARIA) - Pág. 78 del Programa Sintético Oficial
  // =========================================================================
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Geografía',
    materiaFolder: 'Geografia',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaTitulo: 'La relación de las placas tectónicas con el relieve, la sismicidad y el vulcanismo',
    tituloProyecto: 'La Tierra en Movimiento: Dinámica de Placas Tectónicas, Cinturón de Fuego del Pacífico y Cultura Sísmica en México',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (1º Secundaria) - Identifica qué son las placas tectónicas, cuáles son sus características y dinámica. Argumenta la relación entre las placas tectónicas con las regiones sísmicas y volcánicas en México y el mundo, para fortalecer la cultura de la prevención. Relaciona los movimientos de las placas tectónicas con la distribución del relieve de la superficie terrestre y reconoce otros agentes que lo modelan.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué México es uno de los países con mayor actividad sísmica y volcánica del mundo debido a la interacción de 5 placas tectónicas (Norteamérica, Cocos, Pacífico, Rivera y Caribe)?',
      '¿Cuál es la diferencia física y geomorfológica entre los límites convergentes (subducción), divergentes (dorsales oceánicas) y transformantes (Falla de San Andrés)?',
      '¿Cómo el proceso de subducción de la Placa de Cocos bajo la Placa Norteamericana formó el Eje Neovolcánico Transversal (Popocatépetl, Iztaccíhuatl, Pico de Orizaba)?',
      '¿Qué protocolos de Protección Civil y diseño sismorresistente debemos aplicar en la escuela y el hogar para mitigar riesgos ante un sismo de gran magnitud?'
    ],
    inicio: `⏱️ SESIÓN 1 (50 min) — INICIO (10 min):
1. Proyección del sismograma en tiempo real del Servicio Sismológico Nacional (SSN) y video breve de la erupción del volcán Popocatépetl ("Don Goyo").
2. Pregunta detonadora: "¿Por qué el suelo de nuestro país nunca está completamente quieto y por qué tiembla con mayor intensidad en las costas de Guerrero y Oaxaca?".
3. Recuperación de saberes previos: Estructura interna de la Tierra (Corteza, Manto y Núcleo) y corrientes de convección del magma en la astenosfera.`,
    desarrollo: `⏱️ SESIÓN 1 — DESARROLLO (30 min):
1. Taller de Simulación Tectónica con Galletas y Crema en Equipos de 4:
   • Dos galletas rectangulares representan placas continentales/oceánicas y la crema intermedia representa el manto viscoso (astenosfera).
   • Simulan los tres límites de placas:
     - Divergente (separación con ascenso de magma y formación de corteza oceánica).
     - Convergente con Subducción (una galleta se desliza por debajo de la otra, arrugando el borde y formando fosas marinas y volcanes).
     - Transformante (fricción lateral con acumulación de energía elástica que se libera súbitamente como un terremoto).
2. Cartografía Tectónica y Volcánica de México en Papel Albanene / Mudo:
   • Trazar los límites de las 5 placas tectónicas que inciden en México.
   • Ubicar el Eje Volcánico Transversal, la Falla de San Andrés y la Fosa Mesoamericana, identificando las zonas de alta, media y baja sismicidad.
3. Taller de Protección Civil: Diseñar el croquis de evacuación sismo-seguro del aula con identificación de zonas de menor riesgo y triángulo de la vida.`,
    cierre: `⏱️ SESIÓN 1 — CIERRE (10 min):
1. Puesta en común del mapa tectónico nacional y los protocolos de seguridad.
2. Metacognición en libreta: "¿Por qué los sismos no se pueden predecir pero sí podemos prevenir sus consecuencias mediante la preparación ciudadana?".
3. Entrega de evidencia: Mapa tectónico rotulado y Plan Familiar de Prevención Sísmica.`,
    evaluacion: `📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios de Evaluación):
• Criterio 1 - Comprensión de la Dinámica Tectónica y Modelado (Sobresaliente [3 pts]: Explica con exactitud los 3 tipos de límites de placas, corrientes de convección y formación del relieve | Satisfactorio [2 pts]: Identifica los límites de placas con confusiones menores en subducción | En Proceso [1 pt]: No relaciona las placas con el relieve).
• Criterio 2 - Cartografía y Localización Geográfica (Sobresaliente [3 pts]: Ubica con precisión las 5 placas tectónicas de México, el Eje Volcánico y zonas sísmicas | Satisfactorio [2 pts]: Mapa comprensible con errores de ubicación | En Proceso [1 pt]: Mapa incompleto sin simbología).
• Criterio 3 - Cultura de la Prevención y Protección Civil (Sobresaliente [4 pts]: Diseña un protocolo de evacuación y plan familiar fundamentado en la gestión del riesgo | Satisfactorio [2.5 pts]: Protocolo básico | En Proceso [1 pt]: Desconoce las medidas de seguridad ante sismos).
• Instrumento: Rúbrica de análisis geomorfológico y lista de cotejo de prevención sísmica.`,
    materiales: `• Galletas tipo sándwich y crema batida para la simulación tectónica.
• Mapas mudos de la República Mexicana y planisferios con relieve continental y oceánico.
• Datos y sismogramas del Servicio Sismológico Nacional (SSN) y CENAPRED.
• Papel albanene, colores, plumones finos y reglas.`,
    evidenciaEntregable: `Lámina Cartográfica "México y el Cinturón de Fuego: Tectónica de Placas, Vulcanismo y Plan Escolar de Prevención Sísmica".`
  }
];

export function runBuildOfficialPlans() {
  console.log(`🚀 Generando las 4 planeaciones oficiales de la Fase 6 de la NEM en Obsidian...`);

  const createdPaths: string[] = [];

  for (const plan of officialPlannings) {
    const targetDir = path.join(VAULT_BASE, plan.grado, plan.materiaFolder);
    fs.mkdirSync(targetDir, { recursive: true });

    const safeTitle = plan.tituloProyecto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const fileName = `Planeacion_${safeTitle}.md`;
    const filePath = path.join(targetDir, fileName);

    const tagCampo = plan.campo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const tagGrado = plan.grado.toLowerCase();
    const tagMateria = plan.materiaFolder.toLowerCase();
    const timestamp = new Date().toISOString();

    const markdown = `---
tags: [iskool, planeacion_nem, segundo_cerebro, campo_${tagCampo}, grado_${tagGrado}, materia_${tagMateria}, fase6_secundaria, programa_sintetico_oficial_2024]
campo_formativo: "${plan.campo}"
materia: "${plan.materia}"
grado: "${plan.gradoDisplay}"
nivel: "Secundaria (Fase 6)"
tema: "${plan.temaTitulo}"
docente: "Prof. Israel López Ángeles"
fecha_creacion: "${timestamp}"
---

# ${plan.tituloProyecto}

> [!INFO] **Ficha Técnica Oficial NEM 2024 (Fase 6)**
> - **Docente Titular:** Prof. Israel López Ángeles
> - **Nivel / Fase:** ${plan.gradoDisplay} • Fase 6
> - **Campo Formativo:** ${plan.campo}
> - **Asignatura:** ${plan.materia}
> - **Duración Estimada:** ${plan.duracion}
> - **Ejes Articuladores:** ${plan.ejes.join(' • ')}

---

## 🎯 I. Proceso de Desarrollo de Aprendizaje (PDA Oficial SEP)

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

    fs.writeFileSync(filePath, markdown, 'utf8');
    createdPaths.push(filePath);
    console.log(`✅ Nodo Oficial Generado: ${filePath}`);
  }

  return createdPaths;
}

runBuildOfficialPlans();
