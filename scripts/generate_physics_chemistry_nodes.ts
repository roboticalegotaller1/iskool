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

export const remainingCurriculum: NodeDef[] = [
  // =========================================================================
  // ⚡ FÍSICA (Exclusivo 2º de Secundaria - 6 Temas)
  // =========================================================================
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Fisica',
    materiaNombre: 'Física',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Estructura, propiedades y estados de agregación de la materia',
    tituloProyecto: 'El Universo Microscópico: Modelo Cinético de Partículas y Estados de Agregación',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (2º Secundaria) - Experimenta e interpreta los modelos atómicos y de partículas para explicar las propiedades macroscópicas de la materia (densidad, temperatura, presión y compresibilidad) en los estados sólido, líquido, gaseoso y plasma.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué podemos comprimir el aire dentro de una jeringa tapada pero es imposible comprimir el agua líquida?',
      '¿Qué ocurre con la energía cinética de las moléculas de agua cuando pasa de hielo a vapor hirviendo?',
      '¿Por qué el plasma se considera el cuarto estado de agregación más abundante en el universo (estrellas y relámpagos)?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Experimento con jeringas sin aguja con aire y agua.\n2. Pregunta detonadora sobre los espacios intermoleculares.\n3. Recuperación de saberes: Modelo Cinético Molecular.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de modelado con simulador PhET "Estados de la Materia".\n2. Gráficas de cambio de fase (curvas de calentamiento) identificando puntos de fusión y ebullición.\n3. Cálculo de la densidad ($\rho = m/V$) de sólidos regulares e irregulares con probeta.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización de cálculos de densidad.\n2. Metacognición sobre el movimiento browniano.\n3. Entrega de evidencia: Reporte de práctica de estados de la materia.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Explicación mediante el modelo cinético de partículas.\n• Criterio 2: Precisión en el cálculo de densidad.\n• Criterio 3: Interpretación de curvas de cambio de fase.',
    materiales: 'Jeringas, balanza, probetas, cubos metálicos, simulador PhET.',
    evidenciaEntregable: 'Reporte Experimental "Propiedades y Estados de la Materia" con curvas térmicas.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Fisica',
    materiaNombre: 'Física',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Interacciones en fenómenos macroscópicos, fuerzas y fricción',
    tituloProyecto: 'Leyes de Newton en Acción: Dinámica, Fricción y Seguridad Vial',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (2º Secundaria) - Experimenta e interpreta las Leyes de Newton (inercia, relación fuerza-masa-aceleración y acción-reacción) y la fuerza de fricción en situaciones cotidianas y de seguridad en el transporte.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué cuando un camión frena bruscamente salimos disparados hacia adelante?',
      '¿Cómo calculamos la aceleración que adquiere un objeto con la Segunda Ley de Newton ($F = m \cdot a$)?',
      '¿Por qué sin la fuerza de fricción sería imposible caminar o detener un automóvil?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración de inercia con mantel y platos / moneda sobre tarjeta y vaso.\n2. Pregunta detonadora sobre el uso obligatorio del cinturón de seguridad.\n3. Activación de conceptos: masa, peso, aceleración y vector de fuerza.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller con carritos dinamométricos y rampas con distintas superficies (madera, lija, hielo).\n2. Diagramas de cuerpo libre (DCL) identificando Fuerza Normal, Peso, Tensión y Fricción ($F_r = \mu \cdot N$).\n3. Resolución de problemas de $F = m \cdot a$ aplicados al frenado de vehículos.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común de coeficientes de fricción calculados.\n2. Metacognición sobre la física y la prevención de accidentes viales.\n3. Entrega de evidencia: Diagramas de cuerpo libre y problemario de Newton.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Trazo y análisis de Diagramas de Cuerpo Libre (DCL).\n• Criterio 2: Resolución matemática de las Leyes de Newton.\n• Criterio 3: Conciencia sobre seguridad en el transporte.',
    materiales: 'Dinamómetros, carritos, planos inclinados, superficies con lija, masas graduadas.',
    evidenciaEntregable: 'Problemario de Dinámica "Leyes de Newton y Seguridad Vial" con DCL resueltos.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Fisica',
    materiaNombre: 'Física',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Principios de Pascal y de Arquímedes',
    tituloProyecto: 'La Fuerza de los Fluidos: De los Frenos Hidráulicos a los Barcos Gigantes',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (2º Secundaria) - Experimenta e interpreta los principios de Pascal y Arquímedes en fenómenos cotidianos y aplicaciones tecnológicas (gatos hidráulicos, sistemas de frenado, flotabilidad de cuerpos y submarinos), calculando presión, fuerza y empuje hidrostático.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué un barco de acero de miles de toneladas flota pero una moneda de metal se hunde?',
      '¿Cómo un pequeño pedal de freno detiene un auto de dos toneladas?',
      '¿Qué relación existe entre la densidad del fluido y el empuje de Arquímedes?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración de prensa hidráulica con jeringas comunicadas.\n2. Pregunta detonadora sobre la multiplicación de fuerza.\n3. Definición de Presión ($P = F/A$) e incompresibilidad de líquidos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Práctica experimental de Pascal: cálculo de áreas y fuerzas multiplicadas.\n2. Práctica de Arquímedes: medición de volumen desalojado y cálculo de Empuje ($E = \rho \cdot g \cdot V$).\n3. Resolución de problemas de flotabilidad de submarinos.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización de resultados de flotabilidad.\n2. Metacognición sobre el funcionamiento de presas y barcos.\n3. Entrega de evidencia: Reporte de laboratorio.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Aplicación del Principio de Pascal y cálculo de presiones.\n• Criterio 2: Medición y cálculo de Empuje de Arquímedes.\n• Criterio 3: Rigor experimental en laboratorio.',
    materiales: 'Jeringas de 5 y 20 ml, mangueras, dinamómetro, probetas, plastilina, balanza.',
    evidenciaEntregable: 'Reporte de Laboratorio "Fuerza Hidráulica y Flotabilidad" con datos y cálculos.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Fisica',
    materiaNombre: 'Física',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Aprovechamiento de energías y la sustentabilidad',
    tituloProyecto: 'Transición Energética: De los Combustibles Fósiles a las Energías Limpias',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (2º Secundaria) - Analiza las características, ventajas y desventajas de las fuentes de energía renovables (solar, eólica, geotérmica, biomasa) y no renovables, valorando su impacto socioambiental para proponer alternativas energéticas sustentables.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué la quema de carbón y petróleo no es sustentable a largo plazo?',
      '¿Cómo transforma un panel solar fotovoltaico la radiación electromagnética en electricidad?',
      '¿Qué potencial de energía solar y eólica tiene nuestra región en México?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración de celda solar encendiendo un pequeño motor eléctrico.\n2. Pregunta detonadora sobre la matriz energética de México.\n3. Activación de conceptos de conservación y transformación de energía.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Construcción de un prototipo de calentador solar casero con botellas PET y manguera negra.\n2. Medición térmica del agua antes y después de 20 minutos de exposición solar.\n3. Cálculo del ahorro económico y reducción de emisiones de $CO_2$ familiares.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Presentación de prototipos solares.\n2. Metacognición sobre la soberanía energética sustentable.\n3. Entrega de evidencia: Ficha técnica del calentador solar.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Comprensión de las transformaciones de energía.\n• Criterio 2: Eficiencia del prototipo solar construido.\n• Criterio 3: Propuestas de sustentabilidad energética comunitaria.',
    materiales: 'Celdas solares didácticas, botellas PET, manguera negra, termómetros, cartón.',
    evidenciaEntregable: 'Prototipo y Memoria Técnica de "Calentador Solar Escolar Sustentable".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Fisica',
    materiaNombre: 'Física',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 5,
    temaTitulo: 'Interacciones de la electricidad y el magnetismo',
    tituloProyecto: 'Electromagnetismo: De la Brújula de Oersted al Motor Eléctrico',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (2º Secundaria) - Experimenta con la interacción entre electricidad y magnetismo (experimento de Oersted, electroimanes e inducción electromagnética de Faraday), explicando el funcionamiento de motores y generadores eléctricos.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué una corriente eléctrica que pasa por un cable desvía la aguja de una brújula cercana?',
      '¿Cómo convertimos un tornillo de hierro ordinario en un potente imán usando solo un cable y una pila?',
      '¿Cómo generan electricidad las presas hidroeléctricas mediante imanes giratorios?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Recreación en vivo del histórico Experimento de Hans Christian Oersted (1820).\n2. Pregunta detonadora sobre la unión entre dos fuerzas antes consideradas independientes.\n3. Visualización de líneas de campo magnético con limadura de hierro e imanes.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Construcción de un Electroimán: Enrollar cable de cobre esmaltado en un tornillo y medir cuántos clips levanta al variar el número de vueltas (espiras) y voltaje.\n2. Construcción de un Motor Eléctrico Homopolar simple (pila AA + imán de neodimio + alambre de cobre doblado).\n3. Ley de Inducción de Faraday: Mover un imán dentro de una bobina y medir corriente con galvanómetro.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Competencia amistosa de fuerza de electroimanes construidos.\n2. Metacognición sobre la dependencia tecnológica de los motores y generadores.\n3. Entrega de evidencia: Esquema funcional del electroimán y motor.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Explicación de la relación entre corriente eléctrica y campo magnético.\n• Criterio 2: Funcionamiento correcto del electroimán y motor homopolar.\n• Criterio 3: Aplicación de la Ley de Faraday en generadores.',
    materiales: 'Pilas AA y 9V, cable de cobre esmaltado, tornillos de hierro, imanes de neodimio, brújulas, clips, galvanómetro.',
    evidenciaEntregable: 'Reporte Experimental "Construcción de Electroimán y Motor Eléctrico Homopolar".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Fisica',
    materiaNombre: 'Física',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 6,
    temaTitulo: 'Composición del Universo y el Sistema Solar',
    tituloProyecto: 'Cosmología y Gravedad: Del Big Bang a los Exoplanetas',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (2º Secundaria) - Indaga sobre las características de los componentes del Sistema Solar y el Universo (estrellas, galaxias, nebulosas y agujeros negros), explicando la gravitación universal y los avances de la tecnología espacial.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo sabemos de qué elementos químicos están hechas las estrellas lejanas usando la espectroscopía?',
      '¿Por qué la Ley de Gravitación Universal de Newton ($F = G \cdot \frac{m_1 m_2}{r^2}$) explica tanto la caída de una manzana como la órbita de la Luna?',
      '¿Qué avances tecnológicos (Telescopio James Webb, satélites) han revolucionado nuestra visión del cosmos?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de imágenes de campo ultra-profundo del Telescopio James Webb (galaxias primordiales).\n2. Pregunta detonadora: "¿Por qué al mirar las estrellas estamos mirando literalmente hacia el pasado?".\n3. Activación de conocimientos sobre el Big Bang y la expansión del universo.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Escala Astronómica: Construir una línea de distancias relativas del Sistema Solar en el patio escolar usando escala métrica.\n2. Taller de Espectroscopía Casera: Usar un CD y una caja de cartón para descomponer la luz solar y de lámparas en espectros de emisión.\n3. Modelo de Gravitación: Simular órbitas planetarias y pozos gravitatorios con tela elástica tensada y canicas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Galería astronómica de espectros observados.\n2. Metacognición sobre nuestro lugar en la inmensidad cósmica.\n3. Entrega de evidencia: Mapa a escala del Sistema Solar con análisis gravitatorio.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Comprensión de la Ley de Gravitación Universal y dinámica orbital.\n• Criterio 2: Precisión en el cálculo de escalas astronómicas.\n• Criterio 3: Valoración de la tecnología de exploración espacial.',
    materiales: 'CDs reciclados, cajas de cartón, cinta métrica, tela elástica, canicas y balines, imágenes astronómicas de la NASA.',
    evidenciaEntregable: 'Infografía Astronómica "El Sistema Solar a Escala y la Ley de Gravitación Universal".'
  },

  // =========================================================================
  // 🧪 QUÍMICA (Exclusivo 3º de Secundaria - 6 Temas)
  // =========================================================================
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Quimica',
    materiaNombre: 'Química',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Propiedades extensivas e intensivas y composición de las mezclas (homogéneas y heterogéneas)',
    tituloProyecto: 'Laboratorio de Materia: Propiedades Físicas y Métodos de Separación de Mezclas',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (3º Secundaria) - Experimenta con las propiedades extensivas (masa, volumen) e intensivas (densidad, temperatura de ebullición y fusión, solubilidad) para identificar y clasificar sustancias, diseñando métodos de separación de mezclas aplicados al tratamiento del agua.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué la masa de un lingote de oro cambia según su tamaño pero su densidad y punto de fusión permanecen exactamente iguales?',
      '¿Cuál es la diferencia a nivel microscópico entre una disolución homogénea y una suspensión heterogénea?',
      '¿Cómo podemos potabilizar agua contaminada con tierra, sal y aceite utilizando métodos de separación secuenciales?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Presentación de 3 mezclas cotidianas: agua con sal disuelta, agua con aceite y leche.\n2. Pregunta detonadora sobre las fases visibles y el Efecto Tyndall con puntero láser.\n3. Diferenciación entre propiedades que dependen de la cantidad de materia (extensivas) y las que caracterizan a la sustancia (intensivas).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Reto Experimental en Equipos: Separar una mezcla compleja de 4 componentes (arena + limadura de hierro + sal + agua).\n2. Ejecución secuencial de métodos físicos: Imantación $\\rightarrow$ Filtración $\\rightarrow$ Evaporación/Cristalización.\n3. Medición de masas en cada etapa para comprobar la recuperación de masa.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Comparación de la pureza de las sustancias recuperadas por cada equipo.\n2. Metacognición sobre los procesos industriales de desalinización de agua de mar.\n3. Entrega de evidencia: Diagrama de flujo de separación de mezclas.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Distinción entre propiedades extensivas e intensivas.\n• Criterio 2: Eficacia y técnica en la separación física de mezclas.\n• Criterio 3: Aplicación a problemas de tratamiento de agua.',
    materiales: 'Imanes, papel filtro, embudos, sal, arena, limadura de hierro, vasos de precipitados, balanza digital.',
    evidenciaEntregable: 'Reporte de Práctica de Laboratorio "Purificación y Separación de Mezclas Complejas".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Quimica',
    materiaNombre: 'Química',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 2,
    temaTitulo: 'El modelo corpuscular de la materia en sólidos, líquidos y gases',
    tituloProyecto: 'El Baile de los Átomos: Modelo Corpuscular y Presión de los Gases',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (3º Secundaria) - Explica las propiedades macroscópicas de sólidos, líquidos y gases (forma, volumen, fluidez, compresibilidad y difusión) a partir de la estructura microscópica del modelo corpuscular y las fuerzas de atracción y repulsión.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el aroma de un perfume destapado en una esquina del salón se propaga en minutos hasta el rincón opuesto?',
      '¿Qué ocurre con la distancia y las colisiones entre moléculas de un gas cuando aumentamos la temperatura a volumen constante?',
      '¿Por qué los sólidos tienen volumen y forma fijos mientras que los líquidos adaptan la forma del recipiente?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración de difusión de una gota de colorante en agua fría vs agua caliente.\n2. Pregunta detonadora sobre la velocidad molecular y la energía térmica.\n3. Representación gráfica inicial de partículas en los tres estados.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Simulación Corpuscular con Esferas en Recipientes Transparentes.\n2. Experimentación con las Leyes de los Gases (Boyle y Gay-Lussac) usando jeringas térmicas y malvaviscos al vacío.\n3. Elaboración de un cuadro comparativo corpuscular (fuerzas de cohesión vs energía cinética).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de conclusiones corpusculares.\n2. Metacognición sobre la presión atmosférica en ollas de presión.\n3. Entrega de evidencia: Lámina ilustrada del modelo corpuscular.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Rigor en la representación del modelo corpuscular.\n• Criterio 2: Explicación de las Leyes de los Gases ideales.\n• Criterio 3: Deducción de propiedades macroscópicas desde lo microscópico.',
    materiales: 'Jeringas de 50 ml, malvaviscos, colorante vegetal, vasos con agua fría y caliente, simulador de partículas.',
    evidenciaEntregable: 'Lámina Corpuscular "La Materia a Escala Nanoscópica: Sólidos, Líquidos y Gases".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Quimica',
    materiaNombre: 'Química',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 3,
    temaTitulo: 'La Tabla periódica: criterios de clasificación de los elementos químicos y sus propiedades',
    tituloProyecto: 'El Mapa de la Materia: Dmitri Mendeléyev y la Tabla Periódica de los Elementos',
    ejes: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    pda: 'Fase 6 (3º Secundaria) - Reconoce la organización de la Tabla Periódica en grupos y periodos según el número atómico ($Z$), electrones de valencia y propiedades periódicas (radio atómico, electronegatividad, reactividad y carácter metálico), valorando los bioelementos indispensables para la vida.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo logró Mendeléyev predecir con exactitud las propiedades de elementos que aún no habían sido descubiertos?',
      '¿Por qué los metales alcalinos del Grupo 1 reaccionan violentamente con el agua mientras que los gases nobles del Grupo 18 son inertes?',
      '¿Cuáles son los 6 bioelementos primordiales (CHONPS) que constituyen más del 96% de nuestro cuerpo?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Reto de clasificación con barajas químicas de elementos.\n2. Pregunta detonadora sobre los electrones de valencia y la regla del octeto de Lewis.\n3. Recorrido visual por los periodos (filas) y grupos/familias (columnas).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Estructura de Lewis y Configuración de Bohr para los primeros 20 elementos ($Z = 1$ a $Z = 20$).\n2. Mapeo de Propiedades Periódicas en una tabla muda (marcar con degradados de color la electronegatividad y radio atómico).\n3. Ficha Bioquímica: Investigar el papel del Calcio ($Ca$), Hierro ($Fe$) y Sodio/Potasio ($Na/K$) en la salud humana.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Dinámica "Adivina el Elemento Misterioso" por pistas periódicas.\n2. Metacognición sobre la elegancia organizativa de la química moderna.\n3. Entrega de evidencia: Tabla Periódica comentada con estructuras de Lewis.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Ubicación y justificación de familias y periodos.\n• Criterio 2: Trazo correcto de estructuras de Lewis y electrones de valencia.\n• Criterio 3: Valoración de los bioelementos en el cuerpo humano.',
    materiales: 'Tablas periódicas mudas e impresas, colores, fichas de elementos, plastilina para modelos atómicos.',
    evidenciaEntregable: 'Dossier Químico "Familias Periódicas, Estructuras de Lewis y Bioelementos Esenciales".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Quimica',
    materiaNombre: 'Química',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Los compuestos iónicos y moleculares',
    tituloProyecto: 'Enlaces Químicos: De la Sal de Mesa a las Moléculas Orgánicas',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (3º Secundaria) - Experimenta y diferencia las propiedades de los compuestos iónicos (altos puntos de fusión, solubilidad y conductividad eléctrica en disolución) y moleculares/covalentes (bajos puntos de fusión, no conductores), a partir de la transferencia o compartición de electrones.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el agua pura destilada no conduce electricidad, pero al agregarle una cucharada de sal común ($NaCl$) enciende un foco de inmediato?',
      '¿Cuál es la diferencia entre un enlace iónico (transferencia de electrones con formación de iones) y un enlace covalente (compartición de pares electrónicos)?',
      '¿Por qué el azúcar ($C_{12}H_{22}O_{11}$) se derrite fácilmente con poco calor mientras que la sal soporta más de 800 °C sin fundirse?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Circuito probador de conductividad eléctrica con foco LED y electrodos en tres vasos: agua destilada, agua con sal y agua con azúcar.\n2. Pregunta detonadora sobre la presencia de iones libres ($Na^+$ y $Cl^-$).\n3. Definición de enlace iónico, covalente polar y covalente no polar.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Práctica de Laboratorio de Propiedades Comparativas:\n   • Ensayo de solubilidad en agua y alcohol.\n   • Ensayo de punto de fusión relativo en cucharas metálicas sobre mechero.\n   • Prueba de conductividad eléctrica en estado sólido vs disuelto.\n2. Modelado de Enlaces con Estructuras de Lewis en libreta.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común de la tabla de propiedades iónicas vs covalentes.\n2. Metacognición sobre la importancia de los electrolitos en la hidratación deportiva.\n3. Entrega de evidencia: Reporte experimental de enlaces.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Diferenciación experimental de compuestos iónicos y covalentes.\n• Criterio 2: Modelado de transferencia y compartición de electrones con Lewis.\n• Criterio 3: Rigor y seguridad en el manejo de sustancias en laboratorio.',
    materiales: 'Circuito con LED, pila de 9V, sal de mesa, azúcar, parafina, sulfato de cobre, alcohol, vasos, mecheros.',
    evidenciaEntregable: 'Reporte de Laboratorio "Conductividad y Enlaces Químicos: Iónicos vs Covalentes".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Quimica',
    materiaNombre: 'Química',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 5,
    temaTitulo: 'Las reacciones químicas: ecuaciones, manifestaciones y propiedades',
    tituloProyecto: 'La Alquimia Moderna: Ley de Conservación de la Materia y Balanceo Químico',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (3º Secundaria) - Reconoce y modela reacciones químicas mediante el lenguaje simbólico de las ecuaciones químicas, identifica manifestaciones de cambio químico (desprendimiento de gas, cambio de color, precipitado y variación de temperatura) y comprueba la Ley de Conservación de la Materia de Lavoisier mediante balanceo por tanteo.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'Cuando quemamos leña y queda solo ceniza, ¿desapareció la materia o se convirtió en gases invisibles?',
      '¿Cuáles son las 4 manifestaciones inequívocas de que ha ocurrido una reacción química?',
      '¿Por qué una ecuación química debe estar perfectamente balanceada respetando a Lavoisier?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración en matraz cerrado con globo: bicarbonato + vinagre sobre balanza digital.\n2. Pregunta detonadora: "$m_{\\text{reactivos}} = m_{\\text{productos}}$".\n3. Postulado de Antoine Lavoisier.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de simbología química: reactivos, productos, coeficientes y subíndices.\n2. Taller de balanceo por tanteo con modelos corpusculares de plastilina tricolor.\n3. Balanceo de 5 reacciones fundamentales (combustión, fotosíntesis, neutralización).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Reto en pizarrón de balanceo en tiempo récord.\n2. Metacognición: "¿Por qué nunca alteramos los subíndices al balancear?".\n3. Entrega de evidencia: Problemario de balanceo químico verificado.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Distinción de componentes en ecuaciones químicas.\n• Criterio 2: Balanceo exacto por método de tanteo.\n• Criterio 3: Comprobación cuantitativa de la Ley de Conservación de Masa.',
    materiales: 'Balanza digital, bicarbonato, vinagre, globos, plastilina de colores, hojas de trabajo.',
    evidenciaEntregable: 'Problemario de Balanceo Químico por Tanteo con Modelado Atómico Corpuscular.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Quimica',
    materiaNombre: 'Química',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 6,
    temaTitulo: 'Propiedades de los ácidos y bases, y reacciones de óxido-reducción (redox)',
    tituloProyecto: 'Ácidos, Bases y Redox: La Escala de pH y la Química de la Vida Diaria',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (3º Secundaria) - Diseña y realiza experimentos con indicadores de pH naturales para clasificar sustancias de uso cotidiano en ácidas, neutras o básicas, explicando las reacciones de neutralización y los procesos de óxido-reducción (redox) en la corrosión y respiración celular.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué tomamos antiácidos (como hidróxido de magnesio o bicarbonato) cuando sufrimos acidez estomacal?',
      '¿Cómo un extracto vegetal de col morada cambia de color desde el rojo intenso hasta el verde-amarillo según el pH?',
      '¿Qué significa que un átomo se "oxide" (pierde electrones) mientras otro se "reduce" (gana electrones) en las pilas y en la corrosión de metales?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Demostración con extracto de col morada: agregar unas gotas a limón (se vuelve rojo) y a limpiador de pisos con amoniaco (se vuelve verde/amarillo).\n2. Pregunta detonadora sobre la escala de pH de 0 a 14 y el carácter corrosivo o alcalino.\n3. Recuperación de saberes: iones hidronio ($H^+$) e hidroxilo ($OH^-$).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Laboratorio de pH Cotidiano en Equipos: Determinar el pH de 8 sustancias (jugo de naranja, refresco de cola, leche, café, jabón, vinagre, saliva, antiácido).\n2. Reacción de Neutralización: Titular vinagre con bicarbonato midiendo el viraje de color y la formación de agua y sal ($\text{Ácido} + \text{Base} \rightarrow \text{Sal} + \text{Agua}$).\n3. Introducción a Reacciones Redox: Observar la oxidación de un clavo en agua oxigenada y el funcionamiento de una pila electroquímica casera (cobre + zinc en limón).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Elaboración colectiva de la Escala Cromática de pH en pizarrón.\n2. Metacognición sobre el impacto de la lluvia ácida en monumentos y suelos agrícolas.\n3. Entrega de evidencia: Reporte de escala de pH y neutralización.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Clasificación precisa de sustancias en la escala de pH (0-14).\n• Criterio 2: Explicación química de la reacción de neutralización.\n• Criterio 3: Comprensión de los estados de oxidación en procesos redox.',
    materiales: 'Extracto de col morada, tubos de ensayo o vasitos transparentes, tiras reactivas de pH, sustancias cotidianas, clavos de hierro, placas de cobre y zinc.',
    evidenciaEntregable: 'Reporte de Laboratorio "Escala Cromática de pH de Sustancias Cotidianas y Reacción de Neutralización".'
  }
];

export function runSciencesBuild() {
  console.log(`🚀 Construyendo nodos curriculares de Física y Química en Obsidian...`);

  let count = 0;
  for (const node of remainingCurriculum) {
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

  console.log(`✨ Se han estructurado y escrito ${count} nodos de Física y Química en la bóveda de Obsidian.`);
}

runSciencesBuild();
