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

export const humanitiesCurriculum: NodeDef[] = [
  // =========================================================================
  // 🌍 3. CAMPO FORMATIVO: ÉTICA, NATURALEZA Y SOCIEDADES
  // =========================================================================

  // GEOGRAFÍA (Exclusivo 1º de Secundaria - 5 Temas)
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Geografia',
    materiaNombre: 'Geografía',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'El espacio geográfico como un producto social',
    tituloProyecto: 'Diagnóstico Territorial: Nuestra Colonia a Través del Espacio Geográfico',
    ejes: ['Pensamiento Crítico', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Comprende que el espacio geográfico es una construcción social dinámica integrada por componentes naturales, sociales, culturales, económicos y políticos, y analiza las relaciones e interacciones entre ellos en su entorno local.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el espacio geográfico no es solo el terreno físico, sino el resultado de cómo la sociedad lo transforma a lo largo del tiempo?',
      '¿Cómo han cambiado las actividades económicas y la urbanización el paisaje natural de nuestra comunidad en los últimos 25 años?',
      '¿Qué componentes generan mayores desigualdades territoriales en el acceso a agua potable, transporte y áreas verdes?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección comparativa satelital de la localidad (Google Earth histórico: hace 25 años vs hoy).\n2. Pregunta detonadora sobre los cambios en el uso del suelo.\n3. Clasificación de elementos en 5 componentes geográficos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller Cartográfico en Equipos: Trazar un croquis temático de la colonia con simbología estandarizada.\n2. Matriz de Interacción Geográfica: Analizar cómo el relieve y clima condicionan la economía y asentamientos humanos.\n3. Diagnóstico de Necesidades Urbanas y Ambientales.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de socialización de los croquis territoriales.\n2. Metacognición sobre el derecho a una ciudad sustentable e inclusiva.\n3. Entrega de evidencia: Croquis comunitario analítico.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Clasificación de los 5 componentes geográficos.\n• Criterio 2: Precisión en el trazo y simbología cartográfica.\n• Criterio 3: Análisis crítico de problemas socioespaciales locales.',
    materiales: 'Mapas satelitales impresos, papel bond milimétrico, reglas, colores, simbología INEGI.',
    evidenciaEntregable: 'Croquis Cartográfico Comunitario con Matriz de Interacción de Componentes Geográficos.'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Geografia',
    materiaNombre: 'Geografía',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Crecimiento, distribución, composición y migración de la población',
    tituloProyecto: 'Mundo en Movimiento: Pirámides Poblacionales, Dinámicas Demográficas y Migración',
    ejes: ['Inclusión', 'Pensamiento Crítico', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Analiza las causas y consecuencias sociales, culturales, económicas y políticas del crecimiento, distribución y composición de la población mediante pirámides demográficas, reflexionando con empatía sobre los flujos migratorios en México y el mundo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué nos revela la forma de una pirámide de población (progresiva, estacionaria o regresiva) sobre las necesidades de salud y educación de un país?',
      '¿Por qué millones de personas se ven forzadas a migrar cada año dejando atrás su tierra, familia e idioma?',
      '¿Cuáles son las principales causas y desafíos de los migrantes en tránsito por territorio mexicano?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Testimonio audiovisual o literario de una familia migrante.\n2. Pregunta detonadora: "¿La migración es un delito o un derecho humano a buscar una vida digna?".\n3. Activación de conceptos: natalidad, mortalidad, esperanza de vida, saldo migratorio.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Construcción de Pirámides Demográficas: Graficar en papel milimétrico la pirámide de México (2020) vs Japón.\n2. Mapeo de Rutas Migratorias Globales y Nacionales (Corredor México-Estados Unidos, Mediterráneo, Centroamérica).\n3. Análisis de las causas estructurales (violencia, cambio climático, falta de empleo) y remesas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Debate en círculo de paz sobre la no discriminación hacia los migrantes en la escuela.\n2. Metacognición en libreta sobre la empatía intercultural.\n3. Entrega de evidencia: Pirámide poblacional graficada con reporte interpretativo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Trazo e interpretación analítica de pirámides poblacionales.\n• Criterio 2: Comprensión multicausal de los flujos migratorios.\n• Criterio 3: Postura ética de respeto y solidaridad hacia personas migrantes.',
    materiales: 'Datos censales del INEGI, papel milimétrico, mapa planisferio mudo, colores, plumones.',
    evidenciaEntregable: 'Lámina Demográfica "Pirámides Poblacionales y Rutas de la Migración Humana".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Geografia',
    materiaNombre: 'Geografía',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Procesos productivos y sus consecuencias ambientales y sociales',
    tituloProyecto: 'La Ruta de los Objetos: Cadenas Productivas, Comercio Justo y Huella Ecológica',
    ejes: ['Vida Saludable', 'Pensamiento Crítico', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Compara procesos productivos (sectores primario, secundario y terciario) en diversos espacios económicos de México y el mundo, evaluando sus impactos ambientales y sociales para promover el consumo responsable y el comercio justo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la ruta completa que sigue un teléfono inteligente o una barra de chocolate desde la extracción de materia prima hasta nuestras manos?',
      '¿Por qué los pequeños productores agrícolas reciben una mínima fracción del precio final que pagamos en el supermercado?',
      '¿Cómo puede el comercio justo y el consumo local mitigar la degradación ambiental provocada por la sobreproducción?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Exhibición de una prenda de ropa o celular: rastrear las etiquetas de procedencia de sus componentes.\n2. Pregunta detonadora sobre los sectores primario (extracción), secundario (manufactura) y terciario (distribución/venta).\n3. Lluvia de ideas sobre la obsolescencia programada.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Mapeo de Cadena de Suministro en Equipos: Elegir un producto (café, mezclilla, aguacate, litio) y rastrear su huella geográfica global.\n2. Análisis de Impacto Socioambiental: Identificar deforestación, sobreexplotación hídrica y condiciones laborales en la cadena.\n3. Decálogo del Consumidor Ético: Proponer 5 criterios de consumo consciente para el hogar y la cooperativa escolar.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización de las cadenas de suministro mapeadas.\n2. Metacognición: "¿Cómo mis decisiones de compra diarias impactan a comunidades lejanas?".\n3. Entrega de evidencia: Infografía de la ruta productiva.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Desglose de las etapas de los sectores productivos primario, secundario y terciario.\n• Criterio 2: Evaluación crítica de los costos socioambientales.\n• Criterio 3: Viabilidad del Decálogo de Consumo Responsable.',
    materiales: 'Mapamundis impresos, etiquetas comerciales, cartulinas, marcadores.',
    evidenciaEntregable: 'Infografía "La Biografía Oculta de un Producto: De la Extracción al Consumo Ético".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Geografia',
    materiaNombre: 'Geografía',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Desigualdades socioeconómicas y conflictos territoriales actuales',
    tituloProyecto: 'Geopolítica de la Desigualdad: Índice de Desarrollo Humano (IDH) y Disputas por los Recursos',
    ejes: ['Inclusión', 'Pensamiento Crítico', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Analiza las desigualdades socioeconómicas en México y el mundo a partir del Índice de Desarrollo Humano (IDH), interpretando las causas de los conflictos territoriales por la posesión de recursos estratégicos (agua, minerales, energéticos).',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué mide el Índice de Desarrollo Humano (IDH: salud, educación e ingreso) y por qué existen contrastes abismales entre municipios de un mismo estado en México?',
      '¿Por qué el agua dulce y los yacimientos de litio se han convertido en el centro de las mayores disputas territoriales del siglo XXI?',
      '¿Cómo pueden las comunidades defender legítimamente sus territorios frente a proyectos extractivos sin consulta previa?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección del mapa municipal del IDH en México (PNUD): contrastar municipios con IDH europeo vs IDH de países en extrema pobreza.\n2. Pregunta detonadora: "¿Por qué nacer en un determinado código postal condiciona las oportunidades de vida de una persona?".\n3. Activación de conceptos: marginación, desigualdad estructural, recursos estratégicos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Estudio de Caso en Equipos: Analizar un conflicto territorial real en México (ej. defensa del agua en el Valle de México, minería a cielo abierto en la Sierra Norte de Puebla).\n2. Matriz de Actores Sociales: Identificar posturas de comunidades indígenas, empresas trasnacionales, gobiernos y organismos de derechos humanos.\n3. Propuesta de Resolución de Conflictos mediante Consulta Previa, Libre e Informada (Convenio 169 de la OIT).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Mesa redonda de análisis geopolítico por equipos.\n2. Metacognición sobre la distribución equitativa de la riqueza natural.\n3. Entrega de evidencia: Ficha técnica de conflicto territorial.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Interpretación cuantitativa del IDH y factores de desigualdad.\n• Criterio 2: Análisis multicausal de conflictos por recursos naturales.\n• Criterio 3: Propuestas éticas basadas en marcos de derechos humanos.',
    materiales: 'Mapas temáticos de marginación del CONEVAL/PNUD, noticias impresas de conflictos socioambientales, cartulinas.',
    evidenciaEntregable: 'Expediente Geopolítico "Diagnóstico de Desigualdad y Defensa Comunitaria del Territorio".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Geografia',
    materiaNombre: 'Geografía',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 5,
    temaTitulo: 'La diversidad de grupos sociales y culturales en México',
    tituloProyecto: 'México Pluricultural: Identidades Juveniles, Pueblos Originarios y Cohesión Social',
    ejes: ['Interculturalidad Crítica', 'Inclusión', 'Igualdad de Género'],
    pda: 'Fase 6 (1º Secundaria) - Valora la diversidad de grupos sociales, étnicos, lingüísticos y culturales en México, reconociendo las identidades juveniles y promoviendo la convivencia armónica, la no discriminación y la interculturalidad.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué elementos construyen nuestra identidad social y cómo influye el grupo de amigos, la música y las tradiciones familiares?',
      '¿Por qué las identidades juveniles (skaters, gamers, colectivos artísticos, activistas ambientales) son expresiones legítimas de la diversidad cultural?',
      '¿Cómo podemos construir una escuela verdaderamente inclusiva donde nadie sea discriminado por su origen étnico, género o apariencia?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Collage fotográfico de colectivos juveniles, pueblos originarios y comunidades urbanas de México.\n2. Pregunta detonadora: "¿Qué nos hace únicos como individuos y qué nos une como miembros de una sociedad?".\n3. Registro en pizarra de elementos identitarios (lenguaje, vestimenta, música, valores compartidos).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Mapeo de Identidades en el Aula: En equipos, diseñar un "Árbol de las Identidades Escolares" que represente la diversidad del grupo.\n2. Análisis de Situaciones de Estigmatización y Prejuicio: Desmontar estereotipos sobre pueblos indígenas, jóvenes de periferia y personas con discapacidad.\n3. Creación del "Manifiesto por la Interculturalidad Escolar": Redactar compromisos colectivos de respeto a la diversidad.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Lectura comunitaria del Manifiesto Intercultural.\n2. Metacognición sobre el valor de la empatía y la riqueza de las diferencias.\n3. Entrega de evidencia: Árbol de identidades y Manifiesto firmado.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Valoración de la pluralidad étnica, cultural y de identidades juveniles.\n• Criterio 2: Desarticulación crítica de estereotipos y prejuicios sociales.\n• Criterio 3: Compromiso activo con la convivencia armónica e inclusiva.',
    materiales: 'Fotografías de diversidad cultural en México, papel kraft, plumones, post-its de colores.',
    evidenciaEntregable: 'Mural Colectivo "Árbol de Nuestras Identidades" y Manifiesto Escolar por la Interculturalidad.'
  },

  // HISTORIA (1°, 2° y 3° - 5 Temas)
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Historia',
    materiaNombre: 'Historia',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Los albores de la humanidad: los pueblos antiguos del mundo y su devenir',
    tituloProyecto: 'El Amanecer de la Civilización: Del Nomadismo a las Primeras Ciudades de Mesopotamia y Mesoamérica',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (1º Secundaria) - Analiza el proceso de hominización, la revolución agrícola del Neolítico y el surgimiento de las primeras civilizaciones fluviales (Mesopotamia, Egipto, Valle del Indo, China) y originarias (Mesoamérica, Andes), comparando sus aportaciones tecnológicas y culturales.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo cambió la invención de la agricultura y la domesticación del fuego el destino de la especie humana?',
      '¿Por qué las primeras grandes civilizaciones se desarrollaron forzosamente junto a grandes cuencas de ríos (Tigris, Éufrates, Nilo, Amarillo)?',
      '¿Qué inventos fundamentales (la escritura cuneiforme, la rueda, el calendario, la metalurgia) heredamos de estos pueblos ancestrales?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de pinturas rupestres de las Cuevas de Altamira y réplicas de herramientas líticas (bifaces de sílex).\n2. Pregunta detonadora sobre la transición de cazadores-recolectores nómadas a sociedades sedentarias complejas.\n3. Línea del tiempo cronológica: Paleolítico $\\rightarrow$ Neolítico $\\rightarrow$ Edad de los Metales.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Análisis Comparativo en Equipos: Contrastar la civilización de Mesopotamia (Cuna entre dos ríos) con la civilización Olmeca (Cultura madre mesoamericana).\n2. Tabla de Innovaciones: Escritura (cuneiforme vs jeroglífica), Sistemas de Riego y Leyes (Código de Hammurabi vs Leyes consuetudinarias).\n3. Taller de Escritura en Tablillas de Barro: Elaborar una tablilla con pictogramas cuneiformes usando plastilina y un estilete de madera.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Exposición de tablillas cuneiformes elaboradas por los alumnos.\n2. Metacognición: "¿Por qué el registro escrito transformó la memoria histórica de la humanidad?".\n3. Entrega de evidencia: Cuadro comparativo civilizatorio y tablilla de barro.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Comprensión del impacto de la Revolución Neolítica.\n• Criterio 2: Comparación analítica entre civilizaciones fluviales y mesoamericanas.\n• Criterio 3: Recreación histórica y manejo de fuentes documentales.',
    materiales: 'Plastilina o barro para modelar, palillos estiletes, mapas históricos de la Media Luna Fértil y Mesoamérica.',
    evidenciaEntregable: 'Tablilla Cuneiforme Modelada con Cuadro Comparativo de Innovaciones de las Civilizaciones Antiguas.'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Historia',
    materiaNombre: 'Historia',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'La conformación de las metrópolis y los sistemas de dominación (La Colonia)',
    tituloProyecto: 'El Virreinato de la Nueva España: Mestizaje, Barroco y Sistemas de Castas',
    ejes: ['Interculturalidad Crítica', 'Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Analiza las formas de dominación, evangelización, extracción económica (encomienda, minería) y estratificación social (sistema de castas) durante el Virreinato de la Nueva España, valorando el mestizaje cultural en el arte, gastronomía y vida cotidiana.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo se transformó la traza urbana de Tenochtitlan en la Ciudad de México virreinal tras la caída en 1521?',
      '¿Qué era el sistema de castas novo hispano y cómo institucionalizó la discriminación social según el origen racial?',
      '¿Qué elementos de nuestra comida actual (mole, tacos al pastor, aguas frescas) son el resultado del mestizaje culinario novo hispano?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Análisis de una pintura de castas virreinal del siglo XVIII y música barroca novo hispana (Manuel de Sumaya).\n2. Pregunta detonadora sobre los privilegios de los españoles peninsulares vs criollos, indígenas y afrodescendientes.\n3. Contextualización del orden colonial y la Inquisición.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis de Fuentes Históricas en Equipos: Lectura de crónicas coloniales (Bernal Díaz del Castillo, Sor Juana Inés de la Cruz).\n2. Mapeo de la Ruta de la Plata (Camino Real de Tierra Adentro) y los centros mineros (Zacatecas, Guanajuato, Taxco).\n3. Taller Gastronómico Histórico: Identificar los ingredientes de origen americano (maíz, chile, jitomate, cacao) y los de origen europeo/asiático (trigo, cerdo, arroz, canela) en un platillo tradicional.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización del árbol genealógico del mestizaje culinario.\n2. Metacognición sobre las raíces virreinales que perviven en nuestra lengua y costumbres.\n3. Entrega de evidencia: Ficha de análisis colonial con receta mestiza.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Análisis crítico de los sistemas de dominación y estratificación virreinal.\n• Criterio 2: Interpretación de fuentes primarias y obras pictóricas coloniales.\n• Criterio 3: Reconocimiento del mestizaje cultural y patrimonial.',
    materiales: 'Láminas de pinturas de castas, textos de Sor Juana Inés de la Cruz, mapas coloniales, fichas de trabajo.',
    evidenciaEntregable: 'Ensayo Breve "Luces y Sombras del Virreinato Novo hispano: Del Sistema de Castas al Barroco Mestizo".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Historia',
    materiaNombre: 'Historia',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Las revoluciones modernas y sus tendencias (Independencia y Revolución Mexicana)',
    tituloProyecto: 'Diálogos con la Historia: Juicio Crítico a los Caudillos y las Causas Sociales',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Analiza las causas económicas, políticas y sociales de los movimientos revolucionarios en México, examina fuentes primarias y secundarias, y asume una postura crítica sobre las demandas agrarias, laborales y de justicia social.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué las revoluciones armadas no surgen de la nada, sino tras décadas de desigualdad y falta de libertades?',
      '¿Cuáles eran las diferencias irreconciliables entre el Plan de Ayala (Zapata) y el proyecto de Carranza?',
      '¿Qué ideales de la Revolución Mexicana siguen vigentes en los Artículos 3º, 27º y 123º de nuestra Constitución?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Audición de corridos revolucionarios y fotografías del Archivo Casasola.\n2. Pregunta detonadora sobre las demandas de campesinos, mujeres y obreros.\n3. Contextualización del Porfiriato y las huelgas precursoras.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis de fuentes primarias (Plan de San Luis, Plan de Ayala, Plan de Guadalupe).\n2. Cuadro comparativo de facciones (Maderismo, Zapatismo, Villismo, Constitucionalismo).\n3. Simulación de la Convención de Aguascalientes de 1914.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común del debate de la Convención.\n2. Metacognición sobre las deudas históricas con el campo mexicano.\n3. Entrega de evidencia: Cuadro comparativo de facciones.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Contrastación de fuentes históricas primarias.\n• Criterio 2: Argumentación sólida en el debate simulado.\n• Criterio 3: Comprensión de los artículos sociales de la Constitución de 1917.',
    materiales: 'Copias de planes revolucionarios, fotografías históricas, fichas de debate.',
    evidenciaEntregable: 'Periódico Histórico Ilustrado "El Clarín de la Revolución" con análisis de fuentes primarias.'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Historia',
    materiaNombre: 'Historia',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Las tensiones en siglo XX (Guerras Mundiales y Guerra Fría)',
    tituloProyecto: 'El Siglo de los Conflictos Globales: Fascismo, Holocausto y la Guerra Fría',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (3º Secundaria) - Explica las causas y consecuencias de la Primera y Segunda Guerra Mundial, el auge de los regímenes totalitarios, el Holocausto y las tensiones bipolares de la Guerra Fría, reflexionando éticamente sobre el valor supremo de la paz y los derechos humanos.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo el Tratado de Versalles y la Gran Depresión de 1929 facilitaron el ascenso del nazismo y el fascismo en Europa?',
      '¿Por qué es indispensable mantener viva la memoria histórica del Holocausto para evitar que el odio y el racismo se repitan?',
      '¿Qué significó que el mundo quedara dividido en dos bloques ideológicos antagónicos (Capitalismo vs Comunismo) con amenaza nuclear constante?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de discursos propagandísticos históricos y fotografías de la liberación de los campos de concentración.\n2. Pregunta detonadora: "¿Cómo una sociedad culta y educada pudo caer en la barbarie del totalitarismo?".\n3. Línea del tiempo comparativa: 1914 $\\rightarrow$ 1939 $\\rightarrow$ 1945 $\\rightarrow$ 1989.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis de Fuentes Primarias en Equipos: Fragmentos de "El diario de Ana Frank", cartas desde el frente de batalla y propaganda de la Guerra Fría.\n2. Mapeo Geopolítico: Trazar la Cortina de Hierro, el Muro de Berlín y los conflictos satélite (Guerra de Corea, Crisis de los Misiles en Cuba, Guerra de Vietnam).\n3. Creación del Tribunal de la Memoria y la Paz: Juicio reflexivo a las consecuencias de las armas nucleares en Hiroshima y Nagasaki.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Declaración escolar por el desarme nuclear y la paz mundial.\n2. Metacognición en libreta: "¿Por qué la democracia debe defenderse activamente todos los días?".\n3. Entrega de evidencia: Mapa geopolítico de la Guerra Fría con memoria reflexiva.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Comprensión multicausal de las Guerras Mundiales y el totalitarismo.\n• Criterio 2: Sensibilidad ética y condena al genocidio y crímenes de lesa humanidad.\n• Criterio 3: Análisis de las dinámicas de poder bipolar de la Guerra Fría.',
    materiales: 'Mapas de Europa y el mundo en el siglo XX, fuentes testimoniales impresas, cartulinas, marcadores.',
    evidenciaEntregable: 'Dossier Histórico "Lecciones del Siglo XX: Memoria, Holocausto y la Búsqueda de la Paz".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Historia',
    materiaNombre: 'Historia',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 5,
    temaTitulo: 'Las luchas de las mujeres y grupos históricamente discriminados por sus derechos',
    tituloProyecto: 'Voces por la Igualdad: Las Sufragistas, los Derechos Civiles y la Lucha Feminista en México',
    ejes: ['Igualdad de Género', 'Inclusión', 'Pensamiento Crítico'],
    pda: 'Fase 6 (3º Secundaria) - Valora la trayectoria histórica de los movimientos feministas y de grupos históricamente discriminados (indígenas, afromexicanos, comunidad LGBT+) en México y el mundo por el reconocimiento del voto, la igualdad laboral, la no violencia y la justicia social.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué las mujeres en México tuvieron que luchar hasta 1953 para que se reconociera su derecho constitucional al voto?',
      '¿Qué líderes fundamentales (Hermila Galindo, Elvia Carrillo Puerto, Rosa Parks, Martin Luther King) desafiaron el orden establecido para exigir igualdad?',
      '¿Qué brechas salariales y retos de equidad de género siguen pendientes en el siglo XXI?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de fotografías de las Sufragistas mexicanas en el Primer Congreso Feminista de Yucatán (1916).\n2. Pregunta detonadora: "¿Por qué los derechos no se conceden como favores, sino que se conquistan mediante la organización social?".\n3. Activación de conocimientos sobre el sufragio universal y la paridad de género.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller Biográfico en Equipos: Investigar la vida y legado de una mujer o activista transformadora (Hermila Galindo, Sor Juana, Rigoberta Menchú, Malala Yousafzai).\n2. Línea del Tiempo de los Derechos de las Mujeres: 1916 (Primer Congreso Feminista) $\\rightarrow$ 1953 (Voto de la mujer en México) $\\rightarrow$ 1975 (Primera Conferencia Mundial de la Mujer en México) $\\rightarrow$ 2019 (Paridad en Todo).\n3. Elaboración de una Galería de "Heroínas de la Igualdad" con retratos y manifiestos.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Recorrido por la galería de heroínas en el aula.\n2. Metacognición: "¿De qué forma contribuyo a la equidad de género en mis relaciones cotidianas?".\n3. Entrega de evidencia: Ficha biográfica con análisis histórico.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Reconstrucción histórica de los movimientos por los derechos civiles y feministas.\n• Criterio 2: Reconocimiento de las transformaciones legales e institucionales.\n• Criterio 3: Compromiso ético con la igualdad de género y la no discriminación.',
    materiales: 'Biografías históricas, cartulinas, plumones, fotografías de archivo hemerográfico.',
    evidenciaEntregable: 'Galería Biográfica Ilustrada "Heroínas del Voto y la Igualdad de Género en México".'
  },

  // FORMACIÓN CÍVICA Y ÉTICA (1°, 2° y 3° - 5 Temas)
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Formacion_Civica_y_Etica',
    materiaNombre: 'Formación Cívica y Ética',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Los derechos humanos en México y en el mundo como valores compartidos',
    tituloProyecto: 'Defensores de la Dignidad: Juicio Ciudadano y Mecanismos de Protección de DDHH',
    ejes: ['Pensamiento Crítico', 'Inclusión', 'Igualdad de Género'],
    pda: 'Fase 6 (3º Secundaria) - Asume una postura crítica y comprometida ante situaciones de vulneración de los derechos humanos en México y el mundo, evalúa la eficacia de las leyes e instituciones garantes (CNDH, ONU) y propone mecanismos de exigibilidad ciudadana.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué decimos que los Derechos Humanos son inalienables, universales, indivisibles y progresivos?',
      '¿Qué ocurre cuando una ley o una costumbre vulnera la dignidad de las personas?',
      '¿Qué pasos debemos seguir para interponer una queja formal ante la CNDH?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Presentación de tres noticias reales de discriminación y vulneración de derechos.\n2. Pregunta detonadora sobre la no negociabilidad de la dignidad humana.\n3. Recuperación de saberes: Artículo 1º Constitucional.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de análisis de expedientes simulados de quejas de derechos humanos.\n2. Mapeo de la ruta de exigibilidad legal ciudadana.\n3. Redacción del tríptico "Guía Ciudadana de Denuncia y Protección de DDHH".',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización de los trípticos ciudadanos.\n2. Metacognición sobre el papel de defensores de derechos en la escuela.\n3. Entrega de evidencia: Tríptico de exigibilidad ciudadana.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Fundamentación legal en la Constitución y tratados de DDHH.\n• Criterio 2: Claridad y viabilidad de la ruta de denuncia ciudadana.\n• Criterio 3: Postura ética y compromiso con la dignidad humana.',
    materiales: 'Constitución Política de los EUM, folletos CNDH, marcadores, hojas para trípticos.',
    evidenciaEntregable: 'Tríptico Comunitario "Guía de Bolsillo para la Defensa y Denuncia de los Derechos Humanos".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Formacion_Civica_y_Etica',
    materiaNombre: 'Formación Cívica y Ética',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Normas, leyes e instituciones encargadas de proteger y defender los derechos humanos',
    tituloProyecto: 'Estado de Derecho y Justicia: El Papel de las Leyes e Instituciones en México',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (2º Secundaria) - Analiza el papel de las normas, leyes, el Poder Judicial y las instituciones de procuración de justicia en México para garantizar el Estado de derecho, la seguridad ciudadana y la defensa de los derechos fundamentales.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia entre una norma moral o de convivencia social y una norma jurídica obligatoria respaldada por el Estado?',
      '¿Cómo funciona la división de poderes (Ejecutivo, Legislativo y Judicial) para evitar el abuso de autoridad?',
      '¿Por qué el principio de presunción de inocencia y el debido proceso son pilares de la justicia democrática?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Caso hipotético de un conflicto vecinal: ¿Qué pasa cuando no existen normas claras o nadie las respeta?\n2. Pregunta detonadora: "¿Por qué las leyes deben aplicarse a todos por igual sin privilegios (Principio de Legalidad)?".\n3. Diferenciación entre justicia retributiva y justicia restaurativa.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Simulación de un Juicio Oral en el Salón: Roles (Juez, Fiscal, Abogado Defensor, Víctima, Testigos y Jurado).\n2. Análisis del caso: Delimitación de pruebas, argumentos jurídicos y aplicación de la norma.\n3. Mapeo Institucional: Identificar las funciones de la Suprema Corte de Justicia (SCJN), el Ministerio Público, el CONAPRED y el INAI.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Emisión de la sentencia reflexiva por parte del tribunal escolar.\n2. Metacognición: "¿Cómo fortalece la legalidad la convivencia armónica en la escuela?".\n3. Entrega de evidencia: Expediente del juicio simulado con justificación legal.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Distinción formal de tipos de normas e instituciones jurídicas.\n• Criterio 2: Argumentación jurídica sólida en la simulación de juicio oral.\n• Criterio 3: Valoración de la legalidad y el Estado de Derecho.',
    materiales: 'Códigos de leyes escolares, guion de juicio oral, mazo de juez, expedientes de casos simulados.',
    evidenciaEntregable: 'Expediente Jurídico Escolar "Simulación de Juicio Oral y Aplicación del Estado de Derecho".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Formacion_Civica_y_Etica',
    materiaNombre: 'Formación Cívica y Ética',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 3,
    temaTitulo: 'El conflicto en la convivencia humana y la cultura de la paz',
    tituloProyecto: 'Constructores de Paz: Mediación, Negociación y Resolución No Violenta de Conflictos',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Reconoce el conflicto como una oportunidad de aprendizaje y transformación en las relaciones interpersonales y sociales, aplicando la mediación, la negociación y la cultura de paz para resolver desacuerdos sin recurrir a la violencia.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el conflicto es natural e inevitable en la convivencia humana, pero la violencia SIEMPRE es una elección que podemos evitar?',
      '¿Qué es la negociación "ganar-ganar" y cómo podemos alcanzar acuerdos donde ambas partes queden satisfechas?',
      '¿Qué habilidades de mediación comunitaria (escucha activa, neutralidad, parafraseo) son indispensables en un líder de paz?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dinámica "El nudo humano": Desatar un entrelazado de manos sin soltarse mediante comunicación estratégica.\n2. Pregunta detonadora: "¿Qué actitudes dificultan resolver un problema cuando las emociones están encendidas?".\n3. Visualización de la Escalera del Conflicto (Incomodidad $\\rightarrow$ Malentendido $\\rightarrow$ Incidente $\\rightarrow$ Tensión $\\rightarrow$ Crisis).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Mediación Escolar en Parejas: Aplicar las 4 fases de la mediación (Cuéntame, Aclarar el problema, Proponer soluciones, Firmar el acuerdo).\n2. Análisis del Iceberg del Conflicto: Distinguir las "Posiciones visibles" (lo que se exige) de los "Intereses y Necesidades profundas" (lo que realmente se desea).\n3. Redacción del Contrato de Conciliación Escolar.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común de acuerdos de mediación exitosos.\n2. Metacognición: "¿Cómo puedo frenar un conflicto antes de que llegue a una crisis?".\n3. Entrega de evidencia: Ficha de caso de mediación resuelto.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Identificación de intereses y necesidades en el conflicto.\n• Criterio 2: Aplicación del protocolo de mediación y escucha activa.\n• Criterio 3: Fomento activo de la cultura de paz y no violencia.',
    materiales: 'Tarjetas de conflictos escolares, formatos de acuerdos de mediación, rotafolios.',
    evidenciaEntregable: 'Protocolo de Mediación Escolar "Contrato de Conciliación y Paz Comunitaria".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Formacion_Civica_y_Etica',
    materiaNombre: 'Formación Cívica y Ética',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Principios éticos como referente para un desarrollo sustentable',
    tituloProyecto: 'Ética Planetaria: Responsabilidad Ambiental, Justicia Intergeneracional y Ecosistemas',
    ejes: ['Pensamiento Crítico', 'Vida Saludable', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (2º Secundaria) - Evalúa la aplicación de principios éticos (responsabilidad, solidaridad, precaución y justicia intergeneracional) en las acciones humanas hacia la naturaleza, proponiendo proyectos comunitarios de desarrollo sustentable.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué es la "justicia intergeneracional" y qué derecho ético tienen las futuras generaciones a heredar un planeta limpio?',
      '¿Por qué el principio de precaución ambiental exige detener una actividad industrial cuando existe sospecha fundada de daño irreversible?',
      '¿Cómo integran los pueblos originarios la ética del "Buen Vivir" (Sumak Kawsay) en armonía con la Madre Tierra?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de la "Carta de la Tierra" y dilemas éticos ecológicos (ej. construir una presa que destruye un bosque sagrado para dar luz a una ciudad).\n2. Pregunta detonadora sobre los límites éticos del crecimiento económico ilimitado.\n3. Recuperación de saberes: sustentabilidad ambiental, social y económica.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Juicio a Dilemas Bioéticos Ambientales en Equipos.\n2. Aplicación de los 4 Principios Éticos Ambientales a un proyecto local (gestión de residuos, ahorro de agua en la escuela).\n3. Diseño de la "Propuesta Escolar de Desarrollo Sustentable": Objetivos, acciones concretas, indicadores de logro y presupuesto verde.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Presentación de las iniciativas verdes escolares.\n2. Metacognición sobre el compromiso bioético individual.\n3. Entrega de evidencia: Proyecto de desarrollo sustentable fundamentado.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Fundamentación ética sólida en principios de bioética y justicia intergeneracional.\n• Criterio 2: Viabilidad técnica y pertinencia comunitaria del proyecto sustentable.\n• Criterio 3: Compromiso con estilos de vida ecológicamente responsables.',
    materiales: 'Texto de la Carta de la Tierra, formatos de diseño de proyectos ecológicos, cartulinas.',
    evidenciaEntregable: 'Proyecto Escolar de Sustentabilidad "Ética y Compromiso con Nuestra Casa Común".'
  },
  {
    campo: 'Etica, Naturaleza y Sociedades',
    materia: 'Formacion_Civica_y_Etica',
    materiaNombre: 'Formación Cívica y Ética',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 5,
    temaTitulo: 'Medidas de protección y mecanismos de denuncia en el rechazo a la violencia',
    tituloProyecto: 'Espacios Seguros y Libres de Violencia: Redes de Apoyo y Denuncia Ciudadana',
    ejes: ['Inclusión', 'Igualdad de Género', 'Pensamiento Crítico'],
    pda: 'Fase 6 (3º Secundaria) - Diseña estrategias de prevención y protocolos de actuación ante situaciones de acoso escolar, violencia de género, violencia digital (ciberacoso) y trata de personas, identificando los canales institucionales de denuncia y protección integral.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué es la Ley Olimpia en México y cómo sanciona penalmente la difusión no consentida de contenido íntimo digital?',
      '¿Cómo podemos identificar las primeras señales del "Violentómetro" (bromas hirientes, chantaje, control de redes sociales) antes de que la violencia escale?',
      '¿Qué teléfonos de emergencia (911, Línea de la Vida, DIF, SIPINNA) y protocolos escolares existen para denunciar con seguridad?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Presentación gráfica del "Violentómetro" del Instituto Politécnico Nacional (IPN).\n2. Pregunta detonadora: "¿Por qué normalizar los celos, las burlas o el control digital en el noviazgo es el inicio de la violencia?".\n3. Definición de tipos de violencia: psicológica, física, económica, sexual y digital.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Análisis del Marco Legal en Equipos: Ley General de los Derechos de Niñas, Niños y Adolescentes y Ley Olimpia.\n2. Diseño de una "Ruta de Actuación y Red de Apoyo Escolar" ante casos de ciberacoso y violencia de género.\n3. Campaña Gráfica de Denuncia Segura: Elaborar infografías digitales o carteles con números de auxilio y derechos de las víctimas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Montaje de la campaña de prevención en los pasillos escolares.\n2. Metacognición en libreta sobre la cultura de la denuncia y la no revictimización.\n3. Entrega de evidencia: Protocolo de actuación y cartel de prevención.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Conocimiento del marco legal y tipologías del Violentómetro.\n• Criterio 2: Claridad de la ruta institucional de auxilio y denuncia.\n• Criterio 3: Promoción activa de espacios seguros y libres de violencia.',
    materiales: 'Láminas del Violentómetro del IPN, infografías de la Ley Olimpia, cartulinas, marcadores.',
    evidenciaEntregable: 'Protocolo de Actuación y Cartel Comunitario "Red Segura: Cero Tolerancia a la Violencia Escolar y Digital".'
  },

  // =========================================================================
  // 🤝 4. CAMPO FORMATIVO: DE LO HUMANO Y LO COMUNITARIO
  // =========================================================================

  // TECNOLOGÍA (1°, 2° y 3° - 4 Temas)
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tecnologia',
    materiaNombre: 'Tecnología',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Herramientas, máquinas e instrumentos como extensión corporal',
    tituloProyecto: 'Evolución Técnica: De la Mano Humana a los Sistemas Automatizados',
    ejes: ['Pensamiento Crítico', 'Igualdad de Género'],
    pda: 'Fase 6 (1º Secundaria) - Analiza las funciones y delegación de funciones en herramientas, máquinas e instrumentos en distintos procesos productivos, evaluando su impacto ergonómico, ambiental y social para diseñar propuestas de mejora técnica comunitaria.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿De qué manera una pinza, una palanca o un software especializado amplifican las capacidades del cuerpo humano?',
      '¿Cuál es la diferencia técnica entre una herramienta manual, una máquina compuesta y un instrumento de medición digital?',
      '¿Cómo ha cambiado la automatización los oficios tradicionales de nuestra comunidad?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Exhibición de objetos: piedra afilada, cuchillo, tijeras, licuadora y sensor electrónico.\n2. Pregunta detonadora sobre la delegación de funciones técnicas.\n3. Recuperación de saberes sobre medios técnicos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Análisis Funcional y Ergonómico en Parejas de un artefacto cotidiano.\n2. Diagrama de Flujo Técnico: entrada de energía $\\rightarrow$ mecanismos de transmisión $\\rightarrow$ trabajo útil.\n3. Rediseño Ergonómico para personas con discapacidad motriz.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Exposición tipo feria de inventores escolares.\n2. Metacognición sobre la tecnología y la accesibilidad universal.\n3. Entrega de evidencia: Boceto técnico de rediseño ergonómico.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Comprensión del concepto de delegación de funciones.\n• Criterio 2: Calidad técnica del dibujo y diagrama de flujo.\n• Criterio 3: Innovación ergonómica y accesibilidad.',
    materiales: 'Herramientas manuales seguras, papel milimétrico, reglas, guía ergonómica.',
    evidenciaEntregable: 'Boceto de Dibujo Técnico y Ficha Ergonómica de Mejora Técnica.'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tecnologia',
    materiaNombre: 'Tecnología',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Materiales, procesos técnicos y comunidad',
    tituloProyecto: 'Materiales Inteligentes y Sustentables: De la Materia Prima al Ecodiseño',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (2º Secundaria) - Explora el origen, transformación y características técnicas de los materiales (metales, polímeros, cerámicos, maderas y biomateriales), evaluando el impacto ambiental de su ciclo de vida para proponer soluciones de ecodiseño y economía circular.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué los plásticos derivados del petróleo tardan hasta 500 años en degradarse y qué alternativas de bioplásticos existen?',
      '¿Cuáles son las propiedades mecánicas (dureza, tenacidad, maleabilidad, conductividad) que determinan el uso de un material en la industria?',
      '¿Cómo podemos aplicar el modelo de Economía Circular (Reducir, Reusar, Rediseñar, Reciclar) en los proyectos tecnológicos de la escuela?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Exhibición de muestras de materiales: cobre, aluminio, madera, acrílico, bioplástico de fécula de maíz y fibra de vidrio.\n2. Pregunta detonadora: "¿Por qué elegimos un material específico para construir un puente y otro totalmente distinto para una prótesis médica?".\n3. Ciclo de vida de los materiales (Cradle to Cradle).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Laboratorio de Ensayos de Materiales en Equipos: Probar dureza (resistencia al rayado), conductividad térmica/eléctrica y flexibilidad.\n2. Taller de Fabricación de Bioplástico Casero: Mezclar fécula de maíz + agua + vinagre + glicerina a fuego suave hasta formar una lámina biodegradable.\n3. Diseño de un Empaque Sustentable para un producto local.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Comparación de las propiedades del bioplástico obtenido.\n2. Metacognición sobre la responsabilidad ecológica del diseñador técnico.\n3. Entrega de evidencia: Muestra de biomaterial con ficha técnica.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Clasificación y ensayo de propiedades mecánicas de materiales.\n• Criterio 2: Elaboración técnica y sustentabilidad del biomaterial.\n• Criterio 3: Propuesta de ecodiseño en economía circular.',
    materiales: 'Fécula de maíz, glicerina, vinagre blanco, parrilla eléctrica, vasos de precipitados, probetas de materiales diversos.',
    evidenciaEntregable: 'Prototipo de Empaque Biodegradable con Ficha Técnica de Propiedades de los Materiales.'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tecnologia',
    materiaNombre: 'Tecnología',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Usos e implicaciones de la energía en los procesos técnicos',
    tituloProyecto: 'Energía en los Sistemas Técnicos: Eficiencia, Termodinámica y Automatización',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (3º Secundaria) - Analiza los tipos de energía (térmica, eléctrica, mecánica, química, solar) y sus transformaciones en los sistemas técnicos y de manufactura, evaluando la eficiencia energética y proponiendo alternativas de bajo impacto de carbono.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué en cualquier máquina técnica parte de la energía siempre se disipa en forma de calor no aprovechable (Segunda Ley de la Termodinámica)?',
      '¿Cómo calculamos la potencia ($P = V \cdot I$) y el consumo eléctrico en kilowatts-hora ($kWh$) de los aparatos de nuestro hogar?',
      '¿Qué tecnologías de automatización y sensores inteligentes permiten reducir el consumo energético en edificios e industrias?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Análisis de un recibo real de luz de la CFE: lectura de kilowatts-hora consumidos y tarifa escalonada.\n2. Pregunta detonadora: "¿Cuánta energía desperdician los aparatos en modo de espera (consumo vampiro)?".\n3. Transformaciones energéticas en electrodomésticos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Auditoría Energética Escolar en Equipos: Inventariar lámparas, computadoras y ventiladores del aula calculando su consumo mensual en $kWh$.\n2. Construcción de un Circuito con Sensor de Movimiento (PIR) o Fotorresistencia (LDR) para encendido/apagado automático de luces.\n3. Propuesta de Plan de Eficiencia Energética Escolar con cálculo de amortización de inversión.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Presentación de las auditorías energéticas y circuitos construidos.\n2. Metacognición sobre el ahorro energético y la mitigación del cambio climático.\n3. Entrega de evidencia: Reporte de auditoría energética y diagrama de circuito.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Cálculo exacto de potencia, energía ($kWh$) y costos de consumo eléctrico.\n• Criterio 2: Ensamble funcional del circuito de control automático con sensor.\n• Criterio 3: Viabilidad económica y ambiental del plan de eficiencia energética.',
    materiales: 'Recibos de luz de CFE, multímetros digitales, sensores LDR / PIR didácticos, protoboards, LEDs, pilas de 9V.',
    evidenciaEntregable: 'Reporte Técnico "Auditoría de Eficiencia Energética Escolar" con prototipo de sensor de apagado automático.'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tecnologia',
    materiaNombre: 'Tecnología',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Comunicación, representación técnica y evaluación de sistemas tecnológicos',
    tituloProyecto: 'Diseño e Innovación Tecnológica: Planos Técnicos, Diagramación y Evaluación Social',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (3º Secundaria) - Emplea el lenguaje de la representación técnica (dibujo normalizado a escala, diagramas de bloques, simbología eléctrica y modelado digital 3D) para comunicar proyectos tecnológicos, evaluando su factibilidad técnica, económica y social.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el dibujo técnico es un lenguaje universal comprensible para ingenieros y arquitectos de cualquier país?',
      '¿Cómo se representan las tres vistas ortogonales principales (planta, alzado y perfil) de un objeto tridimensional?',
      '¿Qué criterios de evaluación técnica (eficacia, eficiencia, factibilidad, fiabilidad y aceptabilidad social) determinan el éxito de un proyecto?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Presentación de un plano técnico arquitectónico e industrial normalizado.\n2. Pregunta detonadora: "¿Por qué un croquis a mano alzada sin escala no es suficiente para construir una pieza mecánica de precisión?".\n3. Reglas de acotación, escalas y tipos de líneas (continua, segmentada, de centro).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Dibujo Técnico en Papel Milimétrico / Software CAD: Trazar las vistas ortogonales y la perspectiva isométrica a escala 1:1 y 1:2 de una pieza técnica.\n2. Matriz de Evaluación de Sistemas Tecnológicos: Evaluar un artefacto escolar bajo 5 dimensiones (Eficacia, Eficiencia, Factibilidad, Fiabilidad y Huella Ambiental).\n3. Elaboración de la Memoria Técnica de Proyecto de Innovación.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Revisión de planos con escalímetro entre pares.\n2. Metacognición sobre la disciplina y rigor en la comunicación técnica.\n3. Entrega de evidencia: Plano técnico normalizado con matriz de evaluación.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Precisión en el trazo de vistas ortogonales, escalas y acotaciones normalizadas.\n• Criterio 2: Rigor en la evaluación sistémica del proyecto tecnológico.\n• Criterio 3: Claridad en la memoria técnica descriptiva.',
    materiales: 'Papel milimétrico, escuadras de 45° y 60°, escalímetros, lápices técnicos (2H, HB), software de modelado 3D (Tinkercad).',
    evidenciaEntregable: 'Plano de Representación Técnica Normalizado con Matriz de Evaluación Sistémica de Proyecto.'
  },

  // EDUCACIÓN FÍSICA (1°, 2° y 3° - 4 Temas)
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Educacion_Fisica',
    materiaNombre: 'Educación Física',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Capacidades, habilidades y destrezas motrices',
    tituloProyecto: 'Dominio Corporal y Retos Motores: Coordinación, Equilibrio y Agilidad',
    ejes: ['Vida Saludable', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Pone a prueba sus capacidades perceptivo-motrices (equilibrio, ritmo, lateralidad, orientación espacial) y físico-motrices en situaciones de juego individual y colectivo, ajustando sus patrones básicos de movimiento.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo influye la coordinación óculo-manual y óculo-pédica en nuestro desempeño deportivo y en las actividades cotidianas?',
      '¿Por qué el equilibrio estático y dinámico depende de la integración sensorial entre la vista, el oído interno y la propiocepción?',
      '¿Cómo podemos adaptar los juegos motores para que todos los compañeros participen sin importar su nivel de habilidad?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. En la cancha: Calentamiento neuromuscular dinámico con música y cambios de ritmo.\n2. Pregunta detonadora sobre el ajuste postural y la propiocepción.\n3. Juegos de lateralidad y orientación espacial.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Circuito de Destrezas Motrices Complejas en 4 Estaciones:\n   • Estación 1: Saltos pliométricos coordinados en aros y conos.\n   • Estación 2: Conducción y pase de balón con pie no dominante y mano no dominante.\n   • Estación 3: Equilibrio dinámico sobre vigas bajas y bancos suecos con recepción de objetos.\n   • Estación 4: Desplazamientos multidireccionales de velocidad y reacción con señales visuales y auditivas.\n2. Retos Cooperativos de Malabares con pelotas de tenis y pañuelos.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Vuelta a la calma: Estiramientos musculares profundos y respiración diafragmática.\n2. Metacognición en círculo: "¿Qué movimiento con mi lado no dominante representó el mayor desafío motor?".\n3. Entrega de evidencia: Ficha de autoevaluación motriz.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Coordinación, fluidez y ajuste de patrones motores.\n• Criterio 2: Control del equilibrio y orientación espacial.\n• Criterio 3: Actitud colaborativa e incluyente.',
    materiales: 'Conos, aros, pelotas de tenis, pañuelos, bancos suecos, cuerdas para saltar, silbato.',
    evidenciaEntregable: 'Ficha de Valoración Motriz y Registro de Desafíos de Coordinación Superados.'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Educacion_Fisica',
    materiaNombre: 'Educación Física',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Estilos de vida activos y saludables',
    tituloProyecto: 'Circuito de Condición Física y Salud Integral: Mi Plan de Vida Activa',
    ejes: ['Vida Saludable', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Diseña y organiza actividades lúdicas y físico-deportivas para evaluar sus capacidades condicionales (resistencia, fuerza, velocidad y flexibilidad), proponiendo un plan personalizado de vida activa y saludable.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el sedentarismo es uno de los mayores factores de riesgo cardiovascular en adolescentes?',
      '¿Cómo calculamos nuestra frecuencia cardíaca máxima ($F_{c\\text{máx}} = 220 - \\text{edad}$) y zona aeróbica saludable?',
      '¿Qué componentes debe tener un plan de entrenamiento semanal equilibrado?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Toma de pulso basal en reposo ($F_c$ basal).\n2. Pregunta detonadora sobre la recuperación cardiovascular.\n3. Calentamiento articular dinámico.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Circuito de 5 estaciones de aptitud física (Flexibilidad, Sentadillas, Lagartijas, Escalera de agilidad, Trote aeróbico).\n2. Registro de marcas individuales en ficha de condición física estandarizada.\n3. Elaboración de metas semanales de actividad física.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Ejercicios de respiración y vuelta a la calma.\n2. Metacognición sobre hábitos de hidratación y descanso.\n3. Entrega de evidencia: Ficha de aptitud física completa.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Técnica correcta y seguridad en ejercicios condicionales.\n• Criterio 2: Medición y control de frecuencia cardíaca.\n• Criterio 3: Viabilidad del plan personalizado de vida activa.',
    materiales: 'Cronómetros, conos, colchonetas, escalera pliométrica, cintas métricas.',
    evidenciaEntregable: 'Ficha de Valoración de Capacidades Físicas y Plan de Acción Semanal de Vida Saludable.'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Educacion_Fisica',
    materiaNombre: 'Educación Física',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Pensamiento lúdico, estratégico y creativo (juegos y deportes)',
    tituloProyecto: 'Estrategia en la Cancha: Tácticas de Juego, Toma de Decisiones y Deportes Alternativos',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (2º Secundaria) - Aplica el pensamiento estratégico y la toma de decisiones asertiva en juegos modificados y deportes alternativos (Ultimate Frisbee, Korfbal, Duni), adaptando tácticas ofensivas y defensivas ante situaciones imprevistas.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia entre jugar de forma reactiva/individualista y jugar con pensamiento estratégico colectivo?',
      '¿Por qué los deportes alternativos como el Ultimate Frisbee no tienen árbitro y se basan en el "Espíritu de Juego" (autoarbitraje ético)?',
      '¿Cómo reorganizamos la defensa y el ataque de un equipo cuando el rival cambia de táctica?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. En la cancha: Presentación de las reglas del Ultimate Frisbee y Korfbal.\n2. Pregunta detonadora sobre el juego limpio (Fair Play) y la resolución dialógica de faltas en la cancha.\n3. Calentamiento dinámico con pases de disco y desplazamientos sin balón.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Pases y Desmarques en Tríos (Pase de revés, pase de derecha, corte en V).\n2. Partidos Modificados de Ultimate Frisbee en Equipos Mixtos (5 vs 5):\n   • Táctica Ofensiva: Ocupación de espacios vacíos y progresión escalonada.\n   • Táctica Defensiva: Marcaje individual y defensa en zona.\n3. Tiempo Fuera Estratégico: Cada equipo se reúne 2 minutos para rediseñar su estrategia de ataque según el marcador.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Círculo del Espíritu de Juego: Ambos equipos se reúnen al centro para felicitarse y dialogar sobre las jugadas clave.\n2. Metacognición: "¿Cómo me sentí al autoarbitrar mis propias faltas con honestidad?".\n3. Entrega de evidencia: Pizarra táctica de juego con análisis estratégico.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Aplicación efectiva de tácticas ofensivas y defensivas en el juego.\n• Criterio 2: Toma de decisiones rápida y creativa bajo presión.\n• Criterio 3: Compromiso ético con el Espíritu de Juego y el autoarbitraje.',
    materiales: 'Discos voladores (Frisbees reglamentarios de 175g), conos de delimitación, casacas de colores mixtos.',
    evidenciaEntregable: 'Pizarra Táctica y Memoria Estratégica de Deportes Alternativos con evaluación de Fair Play.'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Educacion_Fisica',
    materiaNombre: 'Educación Física',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Interacción motriz y fomento a la convivencia',
    tituloProyecto: 'Comunidad en Movimiento: Juegos Cooperativos Tradicionales y Convivencia Escolar',
    ejes: ['Inclusión', 'Interculturalidad Crítica', 'Igualdad de Género'],
    pda: 'Fase 6 (3º Secundaria) - Promueve relaciones asertivas, equitativas e incluyentes a partir de la interacción motriz en juegos cooperativos y juegos tradicionales y autóctonos de México (Pelota Purépecha, Ulama, Carrera de Bola Rarámuri), valorando el patrimonio lúdico.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo los juegos tradicionales indígenas transmitían valores comunitarios de cooperación en lugar de competencia destructiva?',
      '¿Qué se siente jugar un partido de Pelota Purépecha (P’asákua) con bastón de madera y pelota encendida/simulada?',
      '¿Cómo la actividad física fortalece los lazos afectivos y la empatía en nuestro salón de clases?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. En la cancha: Exhibición de bastones de Pelota Purépecha (Uárhukua) y explicación de su origen ceremonial prehispánico.\n2. Pregunta detonadora: "¿Por qué en los juegos cooperativos nadie gana a menos que todos ganen juntos?".\n3. Calentamiento tradicional con cantos y desplazamientos colectivos coordinados.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Práctica de Juegos Tradicionales y Autóctonos de México en Equipos Mixtos:\n   • Juego 1: Pelota Purépecha con pelota de trapo y bastones de cartón reforzado.\n   • Juego 2: Carrera de Bola y Ariweta (Juegos Rarámuris de resistencia y destreza).\n   • Juego 3: "La telaraña cooperativa" con paracaídas didáctico gigante.\n2. Adaptación de reglas para incluir a compañeros con cualquier limitación física.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Círculo de la Palabra y vuelta a la calma con respiración rítmica.\n2. Metacognición sobre el valor de rescatar nuestras raíces lúdicas ancestrales.\n3. Entrega de evidencia: Bitácora de convivencia lúdica e intercultural.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Participación activa e incluyente en dinámicas de cooperación motriz.\n• Criterio 2: Respeto y valoración del patrimonio lúdico y juegos autóctonos de México.\n• Criterio 3: Fomento activo de la convivencia pacífica y el compañerismo.',
    materiales: 'Bastones de Pelota Purépecha adaptados, pelotas de esponja/trapo, aros, paracaídas didáctico.',
    evidenciaEntregable: 'Bitácora Lúdica Intercultural "Rescate de Juegos Tradicionales y Convivencia Escolar".'
  },

  // TUTORÍA / EDUCACIÓN SOCIOEMOCIONAL (1°, 2° y 3° - 4 Temas)
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tutoria_Socioemocional',
    materiaNombre: 'Tutoría y Educación Socioemocional',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Identidad y sentido de pertenencia a favor de una convivencia equitativa e inclusiva',
    tituloProyecto: 'El Mosaico de Mi Identidad: Autoestima, Pertenencia y Diversidad en el Grupo',
    ejes: ['Inclusión', 'Igualdad de Género', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Reconoce y valora los rasgos de su identidad personal, familiar y cultural, fortaleciendo su autoestima y sentido de pertenencia al grupo escolar para construir relaciones de respeto, empatía y no discriminación.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué aspectos de tu personalidad, gustos y valores te hacen sentir orgulloso de quién eres?',
      '¿Por qué la necesidad de encajar en un grupo a veces nos orilla a ocultar lo que verdaderamente pensamos o sentimos?',
      '¿Cómo podemos crear un salón donde cada persona se sienta bienvenida y valorada tal como es?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dinámica de la "Caja del Tesoro Secreto": Cada alumno mira dentro de una caja con un espejo al fondo.\n2. Pregunta detonadora: "¿Quién es la persona más valiosa e irrepetible que acabas de ver?".\n3. Lluvia de ideas sobre la autoestima y el autoconcepto.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller del "Escudo Personal de Identidad": Dibujar un escudo heráldico de 4 cuadrantes (Mis mayores virtudes, Lo que más amo de mi familia, Mi sueño para el futuro y Mi mayor reto superado).\n2. Dinámica del "Bazar de Cualidades": Escribir cartas breves y anónimas de reconocimiento positivo a 3 compañeros del salón.\n3. Construcción del Mosaico Colectivo de Identidades en la pared del aula.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Lectura voluntaria de mensajes de reconocimiento recibidos.\n2. Metacognición: "¿Cómo cambia mi día cuando alguien reconoce mis cualidades?".\n3. Entrega de evidencia: Escudo personal de identidad completado.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Autoconocimiento y valoración positiva de su identidad personal.\n• Criterio 2: Capacidad de reconocer y validar las cualidades de sus pares.\n• Criterio 3: Fomento de un ambiente de confianza e inclusión.',
    materiales: 'Formatos de escudo personal, post-its de colores, sobres, cartulina mural, colores.',
    evidenciaEntregable: 'Lámina de Autoconcepto "Mi Escudo de Identidad y Sentido de Pertenencia Escolar".'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tutoria_Socioemocional',
    materiaNombre: 'Tutoría y Educación Socioemocional',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Los sentimientos y su influencia en la toma de decisiones',
    tituloProyecto: 'Navegando las Emociones: Autorregulación, Inteligencia Emocional y Decisiones Asertivas',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (2º Secundaria) - Identifica y nombra el espectro de sus emociones y sentimientos (ansiedad, enojo, frustración, alegría, tristeza), analizando cómo influyen en sus pensamientos y decisiones cotidianas, y aplicando técnicas de autorregulación emocional.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué ocurre en nuestro cerebro (amígdala vs corteza prefrontal) cuando sufrimos un "secuestro emocional" por ira o miedo?',
      '¿Por qué nunca es una buena idea tomar decisiones permanentes basadas en emociones temporales e intensas?',
      '¿Qué técnicas de respiración (Respiración 4-7-8, técnica del semáforo) nos ayudan a recuperar la calma antes de actuar?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Presentación de la "Rueda de las Emociones" de Robert Plutchik.\n2. Pregunta detonadora: "¿Por qué no existen emociones buenas ni malas, sino formas constructivas o destructivas de expresarlas?".\n3. Reconocimiento de sensaciones somáticas de la ira y la ansiedad en el cuerpo.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller del Semáforo Emocional: Rojo (Alto, respiro y calmo), Amarillo (Pienso en consecuencias y opciones) y Verde (Actúo asertivamente).\n2. Análisis de Dilemas de Toma de Decisiones en Parejas (ej. presión de amigos para hacer una broma pesada o publicar algo indebido en redes).\n3. Creación del "Botiquín de Primeros Auxilios Emocionales" (música relajante, dibujo, caminata, diálogo con amigos).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Práctica grupal de respiración guiada 4-7-8.\n2. Metacognición: "¿Qué estrategia de mi botiquín emocional aplicaré la próxima vez que sienta frustración?".\n3. Entrega de evidencia: Ficha del Semáforo Emocional con dilemas resueltos.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Identificación y vocabulario amplio de emociones y sentimientos.\n• Criterio 2: Aplicación consciente de estrategias de autorregulación emocional.\n• Criterio 3: Análisis crítico de las consecuencias de las decisiones tomadas.',
    materiales: 'Rueda de emociones impresa, formatos de semáforo emocional, hojas de diseño de botiquín.',
    evidenciaEntregable: 'Manual Personal "Mi Botiquín de Autorregulación Emocional y Toma de Decisiones Asertivas".'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tutoria_Socioemocional',
    materiaNombre: 'Tutoría y Educación Socioemocional',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Construcción del proyecto de vida',
    tituloProyecto: 'Brújula de Futuro: Proyecto de Vida, Metas Vocacionales y Resiliencia',
    ejes: ['Pensamiento Crítico', 'Igualdad de Género', 'Inclusión'],
    pda: 'Fase 6 (3º Secundaria) - Valora sus logros, intereses, habilidades socioemocionales y áreas de oportunidad para diseñar de manera autónoma un proyecto de vida con metas a corto, mediano y largo plazo que favorezca su autorrealización personal y comunitaria.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Quién soy hoy, qué talentos me distinguen y quién deseo ser al terminar la secundaria y el bachillerato?',
      '¿Cómo podemos tomar decisiones vocacionales libres de estereotipos de género o presiones externas?',
      '¿Qué estrategias de resiliencia podemos aplicar cuando un plan no resulta como lo esperábamos?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dinámica del "Árbol de Mi Identidad y Futuro".\n2. Pregunta detonadora sobre la flexibilidad del proyecto de vida.\n3. Recuperación de saberes sobre opciones de bachillerato general y tecnológico.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Matriz de Autodiagnóstico FODA Personal (Fortalezas, Oportunidades, Debilidades y Amenazas).\n2. Taller de Metas SMART a 1, 3 y 5 años (Corto, Mediano y Largo Plazo).\n3. Plan de Contingencia, Red de Apoyo y Carta de Compromiso a mi Yo del Futuro.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Círculo de la Palabra: compartir en una frase su mayor aspiración de vida.\n2. Metacognición sobre los hábitos diarios requeridos para alcanzar sus metas.\n3. Entrega de evidencia: Dossier del Proyecto de Vida.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Autoconocimiento y formulación de metas SMART viables.\n• Criterio 2: Identificación de redes de apoyo y planes de contingencia.\n• Criterio 3: Compromiso ético y autorrealización personal.',
    materiales: 'Formatos de matriz FODA, hojas de metas SMART, sobres para cartas cápsula del tiempo.',
    evidenciaEntregable: 'Dossier "Mi Brújula de Vida: Matriz FODA, Metas SMART y Carta de Compromiso Personal".'
  },
  {
    campo: 'De lo Humano y lo Comunitario',
    materia: 'Tutoria_Socioemocional',
    materiaNombre: 'Tutoría y Educación Socioemocional',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Prevención de situaciones de riesgo y educación integral en sexualidad',
    tituloProyecto: 'Autocuidado y Protección: Prevención de Adicciones, Riesgos Digitales y Vínculos Sanos',
    ejes: ['Vida Saludable', 'Pensamiento Crítico', 'Igualdad de Género'],
    pda: 'Fase 6 (3º Secundaria) - Evalúa situaciones de riesgo en la adolescencia (consumo de sustancias psicoactivas, apuestas digitales, relaciones afectivas nocivas y violencia en redes), diseñando estrategias de autocuidado y redes de apoyo seguras.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo actúan las sustancias adictivas (vapeadores, alcohol, tabaco, drogas) en el sistema de recompensa y dopamina del cerebro adolescente?',
      '¿Cuáles son las señales de advertencia (red flags) de una relación afectiva o de noviazgo tóxica y controladora?',
      '¿Qué habilidades de asertividad y rechazo a la presión de grupo podemos entrenar para cuidar nuestra integridad física y emocional?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Análisis de estadísticas oficiales sobre adicciones y riesgos en la juventud mexicana.\n2. Pregunta detonadora sobre los mitos de los vapeadores ("humo inocuo con sabor") y su daño pulmonar real.\n3. Activación de conocimientos sobre el autocuidado y la autoestima como factores de protección.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Role-Playing en Equipos: Escenificar situaciones de presión social para consumir sustancias o compartir contenido íntimo, aplicando la técnica del "Disco Rayado" y la "Salida Estratégica Asertiva".\n2. Mapeo de Factores de Riesgo vs Factores de Protección en la comunidad escolar y familiar.\n3. Elaboración de la "Guía de Autocuidado y Red de Seguridad": Directorio con líneas de ayuda confidenciales (Línea de la Vida 800 911 2000, Centros de Integración Juvenil CIJ).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Compromiso grupal de protección mutua y empatía.\n2. Metacognición: "¿A qué persona de confianza puedo acudir cuando siento que estoy en peligro?".\n3. Entrega de evidencia: Guía de autocuidado y directorios de auxilio.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Análisis crítico de riesgos asociados a adicciones y conductas lesivas.\n• Criterio 2: Demostración de habilidades asertivas ante la presión de grupo.\n• Criterio 3: Identificación clara de redes de apoyo y líneas institucionales de ayuda.',
    materiales: 'Infografías de la Secretaría de Salud y CIJ, folletos de prevención, cartulinas, tarjetas de role-playing.',
    evidenciaEntregable: 'Guía de Bolsillo "Mi Escudo de Protección: Prevención de Riesgos y Redes de Apoyo Juvenil".'
  }
];

export function runHumanitiesBuild() {
  console.log(`🚀 Construyendo nodos curriculares de Ética, Naturaleza y Sociedades y De lo Humano y lo Comunitario...`);

  let count = 0;
  for (const node of humanitiesCurriculum) {
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

  console.log(`✨ Se han estructurado y escrito ${count} nodos de Humanidades, Geografía, Historia, FCyE, Tecnología, Educación Física y Tutoría.`);
}

runHumanitiesBuild();
