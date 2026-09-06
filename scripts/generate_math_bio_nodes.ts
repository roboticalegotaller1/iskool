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

export const secondaryCurriculum: NodeDef[] = [
  // =========================================================================
  // 🧬 2. CAMPO FORMATIVO: SABERES Y PENSAMIENTO CIENTÍFICO
  // =========================================================================

  // MATEMÁTICAS (7 Temas)
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    materiaNombre: 'Matemáticas',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Extensión de los números a positivos y negativos y su orden',
    tituloProyecto: 'El Termómetro Financiero: Dominando los Enteros en la Vida Diaria',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Reconoce la necesidad de los números negativos a partir de situaciones reales (temperaturas bajo cero, altitudes marinas, balances contables y deudas), y los ubica y ordena en la recta numérica justificando las reglas de comparación.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué significa que una cuenta bancaria tenga saldo -150 pesos o que la temperatura en Chihuahua sea de -8 °C?',
      '¿Por qué el número -10 es MENOR que -2 si el número 10 es mayor que 2?',
      '¿Cómo nos ayuda la recta numérica a tomar decisiones financieras responsables?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Dinámica del elevador subterráneo y el buceador en el plano cartesiano.\n2. Pregunta detonadora sobre los saldos negativos en compras y deudas.\n3. Recuperación de saberes: recta numérica simétrica alrededor del cero.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Recta Numérica Graduada de -15 a +15 en parejas.\n2. Desafíos de orden y comparación usando símbolos >, < y = con valor absoluto.\n3. Simulación contable "La Tiendita del Barrio" con 5 transacciones de ingresos y egresos.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Formalización de la regla de oro: el número más a la derecha en la recta siempre es el mayor.\n2. Metacognición en libreta sobre errores comunes en números negativos.\n3. Entrega de evidencia: Hoja de balance contable con recta numérica verificada.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Ubicación y orden en la recta numérica.\n• Criterio 2: Modelado de situaciones financieras y térmicas.\n• Criterio 3: Justificación formal de desigualdades.',
    materiales: 'Tiras de papel milimétrico, reglas, fichas de saldo financiero simuladas.',
    evidenciaEntregable: 'Bitácora Contable "Mi Primer Negocio" con 5 balances y recta numérica rotulada.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    materiaNombre: 'Matemáticas',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Regularidades, Patrones e Introducción al álgebra (Ecuaciones lineales y cuadráticas)',
    tituloProyecto: 'El Lenguaje Secreto de las Ecuaciones: Del Patrón Visual a la Incógnita Despejada',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (2º Secundaria) - Representa algebraicamente sucesiones con progresión aritmética y cuadrática, y modela situaciones problemáticas de la vida cotidiana mediante ecuaciones lineales de la forma ax + b = cx + d.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo podemos predecir cuántos bloques tendrá la figura número 100 de una serie sin tener que dibujarla?',
      '¿Por qué el álgebra utiliza letras como incógnitas y cuál es la diferencia entre una variable y una constante?',
      '¿Cómo equilibramos una ecuación como si fuera una balanza de dos platos de justicia?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Reto visual de patrones con figuras geométricas en progresión.\n2. Pregunta detonadora: "¿Cuál es la regla matemática oculta que hace crecer la figura?".\n3. Introducción a la notación algebraica de sucesiones ($an + b$).',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de sucesiones aritméticas: calcular la diferencia común ($d$) y la regla general.\n2. Modelado de problemas reales mediante ecuaciones lineales (ej. planes de telefonía móvil comparativos: $50 + 2x = 20 + 3x$).\n3. Taller de despeje paso a paso mediante operaciones inversas en balanza algebraica.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Reto relámpago de despejes en pizarrón por parejas.\n2. Metacognición: "¿Por qué lo que hacemos de un lado de la igualdad debemos hacerlo exactamente igual del otro?".\n3. Entrega de evidencia: Hoja de resolución algebraica con comprobación.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Deducción de la regla general de sucesiones.\n• Criterio 2: Planteamiento algebraico del problema real.\n• Criterio 3: Despeje y comprobación de la solución.',
    materiales: 'Fichas de patrones geométricos, balanza de equilibrio didáctica, hojas cuadriculadas.',
    evidenciaEntregable: 'Problemario de Modelado Algebraico con verificación por sustitución.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    materiaNombre: 'Matemáticas',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Funciones, proporcionalidad y reparto',
    tituloProyecto: 'Modelando el Crecimiento: Funciones Lineales y No Lineales en la Economía',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (3º Secundaria) - Relaciona e interpreta la variación de dos cantidades a partir de su representación tabular, gráfica y algebraica, identificando la razón de cambio (pendiente) en funciones lineales y no lineales en contextos científicos y sociales.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué significa que la velocidad de un automóvil o el llenado de un tinaco sea constante vs exponencial?',
      '¿Cómo calculamos la pendiente ($m = \\Delta y / \\Delta x$) en una gráfica de variación económica?',
      '¿Cuál es la diferencia gráfica entre una función de proporcionalidad directa y una función afín con ordenada al origen ($y = mx + b$)?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Comparación visual de dos gráficas de llenado de agua (recipiente cilíndrico vs recipiente cónico).\n2. Pregunta detonadora sobre la razón de cambio y la velocidad de llenado.\n3. Recuperación de saberes: tabla de valores e intercepto con el eje $y$.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Tabulación y graficación de tres funciones reales: costo de servicio de taxi ($y = 15 + 8x$), consumo de energía eléctrica y caída libre.\n2. Cálculo de la pendiente y significado de la tasa de cambio en cada caso.\n3. Simulación de reparto proporcional justo en una cooperativa escolar.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Socialización de interpretaciones gráficas.\n2. Metacognición sobre la utilidad de las funciones en finanzas personales.\n3. Entrega de evidencia: Lámina de análisis funcional comparativo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Tabulación y graficación precisa en el plano cartesiano.\n• Criterio 2: Cálculo e interpretación de la pendiente como razón de cambio.\n• Criterio 3: Aplicación a problemas de reparto proporcional justo.',
    materiales: 'Papel milimétrico, reglas, calculadoras, hojas de trabajo de funciones.',
    evidenciaEntregable: 'Informe Gráfico-Funcional "El Costo de la Variación" con análisis de pendientes.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    materiaNombre: 'Matemáticas',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 4,
    temaTitulo: 'Construcción y propiedades de las figuras planas, cuerpos, circunferencia, círculo y esfera',
    tituloProyecto: 'Geometría del Espacio: De los Polígonos Regulares a la Esfera Terrestre',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (2º Secundaria) - Construye con regla y compás polígonos regulares con información diversa, e identifica las relaciones entre los ángulos inscritos y centrales en la circunferencia, deduciendo las fórmulas de perímetro y área.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué el número Pi ($\\pi \\approx 3.1416$) aparece siempre que dividimos el perímetro de cualquier círculo entre su diámetro?',
      '¿Qué relación existe entre la medida de un ángulo central y un ángulo inscrito que subtienden el mismo arco?',
      '¿Cómo construimos un hexágono o un octágono regular perfecto usando únicamente compás y regla no graduada?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Experimento con tapas circulares de diferentes tamaños e hilo para medir perímetro y diámetro.\n2. Pregunta detonadora: "¿Por qué el cociente $P / D$ siempre da 3.14 independientemente del tamaño del objeto?".\n3. Definición de radio, cuerda, secante, tangente y arco.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de trazo geométrico con regla y compás: construcción de polígonos regulares inscritos (triángulo equilátero, cuadrado, hexágono regular).\n2. Demostración del Teorema del Ángulo Inscrito (el ángulo inscrito mide exactamente la mitad del ángulo central correspondiente: $\\theta_{\\text{ins}} = \\theta_{\\text{cen}} / 2$).\n3. Cálculo de áreas sombreadas y coronas circulares en aplicaciones de diseño arquitectónico.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Galería de mandalas y polígonos regulares trazados con precisión.\n2. Metacognición sobre la belleza de la exactitud geométrica.\n3. Entrega de evidencia: Lámina de trazo con demostración de ángulos.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Precisión en el manejo de regla y compás.\n• Criterio 2: Demostración formal del ángulo inscrito y central.\n• Criterio 3: Cálculo correcto de áreas y perímetros de figuras compuestas.',
    materiales: 'Compás metálico de precisión, reglas graduadas, transportador de 360°, papel marquilla.',
    evidenciaEntregable: 'Lámina de Trazo Geométrico "Geometría Sagrada y Circunferencia" con demostraciones angulares.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    materiaNombre: 'Matemáticas',
    grado: '2do_Grado',
    gradoDisplay: '2º de Secundaria',
    temaNum: 5,
    temaTitulo: 'Medición y cálculo en diferentes contextos (Teorema de Pitágoras y razones trigonométricas)',
    tituloProyecto: 'Ingeniería en el Patio Escolar: Teorema de Pitágoras y Razones Trigonométricas',
    ejes: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
    pda: 'Fase 6 (2º Secundaria) - Formula, justifica y usa el Teorema de Pitágoras y las razones trigonométricas básicas (seno, coseno y tangente) al resolver problemas de medición indirecta en contextos reales (cálculo de alturas y distancias inaccesibles).',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo calculaban los constructores antiguos la altura de las pirámides midiendo solo su sombra en el suelo?',
      '¿Qué relación guardan los catetos y la hipotenusa en un triángulo rectángulo ($a^2 + b^2 = c^2$)?',
      '¿Cómo usamos el clinómetro escolar y la tangente ($\\tan \\theta = \\text{opuesto} / \\text{adyacente}$) para medir la altura del asta bandera?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Rompecabezas geométrico de áreas sobre los lados de un triángulo rectángulo.\n2. Pregunta detonadora sobre la medición de alturas imposibles de escalar directamente.\n3. Identificación de cateto opuesto, cateto adyacente e hipotenusa.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Práctica de campo en el patio escolar con clinómetro casero (transportador + hilo + tuerca).\n2. Medición del ángulo de elevación hacia la punta del edificio escolar y distancia al pie de la estructura.\n3. Cálculo algebraico de la altura total usando razones trigonométricas y comprobación con Teorema de Pitágoras.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Comparación de alturas calculadas por los distintos equipos de trabajo.\n2. Metacognición sobre el poder del razonamiento trigonométrico.\n3. Entrega de evidencia: Reporte de medición indirecta.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Aplicación del Teorema de Pitágoras y despeje algebraico.\n• Criterio 2: Uso correcto de razones trigonométricas (seno, coseno, tangente).\n• Criterio 3: Precisión en la toma de datos de campo.',
    materiales: 'Clinómetros escolares, cinta métrica de 30 m, calculadora científica, papel milimétrico.',
    evidenciaEntregable: 'Reporte Técnico "Medición Topográfica Escolar" con esquemas trigonométricos a escala.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    materiaNombre: 'Matemáticas',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 6,
    temaTitulo: 'Obtención, representación de información y medidas de tendencia central',
    tituloProyecto: 'Estadística para la Toma de Decisiones: Media, Mediana, Moda y Rango',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Usa e interpreta las medidas de tendencia central (media, mediana y moda) y el rango de un conjunto de datos poblacionales y muestrales para fundamentar la toma de decisiones informada.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      'Si una persona gana 100 mil pesos y nueve ganan 5 mil pesos, ¿por qué el "promedio" salarial nos da una falsa impresión de riqueza?',
      '¿En qué situaciones es más representativo usar la Mediana en lugar de la Media aritmética?',
      '¿Cómo nos ayuda el Rango y la desviación a entender qué tan dispersos o parejos están los datos?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Presentación de dos distribuciones de calificaciones con el mismo promedio pero diferente dispersión.\n2. Pregunta detonadora sobre los datos atípicos o extremos.\n3. Definición formal de Media, Mediana, Moda y Rango.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Levantamiento de una encuesta rápida en el salón: horas diarias de sueño, gasto diario en transporte o estatura.\n2. Organización de datos en tablas de frecuencias e histogramas.\n3. Cálculo analítico de las medidas de tendencia central y redacción de conclusiones sobre los hábitos del grupo.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común del perfil estadístico del grupo.\n2. Metacognición: "¿Por qué no debemos confiar ciegamente en un promedio sin conocer la dispersión?".\n3. Entrega de evidencia: Reporte estadístico con gráficos.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Cálculo exacto de media, mediana, moda y rango.\n• Criterio 2: Elaboración de tablas de frecuencia e histogramas.\n• Criterio 3: Interpretación crítica de la representatividad de los datos.',
    materiales: 'Formatos de encuesta, papel cuadriculado, reglas, calculadoras.',
    evidenciaEntregable: 'Informe Estadístico Comunitario "Radiografía de Hábitos Escolares" con gráficos e interpretación.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Matematicas',
    materiaNombre: 'Matemáticas',
    grado: '3er_Grado',
    gradoDisplay: '3º de Secundaria',
    temaNum: 7,
    temaTitulo: 'Azar y probabilidad',
    tituloProyecto: 'El Casino Matemático: Probabilidad Clásica, Frecuencial y Juegos de Azar Justos',
    ejes: ['Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (3º Secundaria) - Resuelve problemas donde calcula la probabilidad de ocurrencia de eventos mutuamente excluyentes, independientes y complementarios en situaciones lúdicas y experimentos aleatorios.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Por qué en los casinos y loterías a largo plazo la casa siempre gana matemáticamente?',
      '¿Cuál es la diferencia entre la probabilidad teórica o clásica ($P = \\text{favorables} / \\text{totales}$) y la probabilidad frecuencial tras 100 lanzamientos?',
      '¿Qué significa que dos eventos sean mutuamente excluyentes o independientes?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Simulación de lanzamiento de 2 dados: apostar a qué suma (del 2 al 12) saldrá más veces.\n2. Pregunta detonadora: "¿Por qué el 7 tiene más probabilidades de salir que el 2 o el 12?".\n3. Construcción del espacio muestral de 36 resultados posibles.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de experimentación aleatoria: 50 lanzamientos de monedas y dados registrando frecuencias relativas.\n2. Comparación entre la curva frecuencial empírica y la distribución teórica (Ley de los Grandes Números).\n3. Diseño de un juego de mesa con reglas de probabilidad matemáticamente justas.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Prueba de los juegos de mesa creados entre equipos.\n2. Metacognición sobre los peligros de la ludopatía y la falacia del jugador.\n3. Entrega de evidencia: Tabla de espacio muestral y juego probabilístico.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Construcción y cálculo del espacio muestral y probabilidades clásicas.\n• Criterio 2: Análisis comparativo entre probabilidad teórica y frecuencial.\n• Criterio 3: Diseño lógico de reglas de juego equitativas.',
    materiales: 'Dados de 6 caras, monedas, barajas, fichas, hojas de registro de frecuencias.',
    evidenciaEntregable: 'Tablero de Juego "El Desafío del Azar" con análisis de probabilidades de cada casilla.'
  },

  // BIOLOGÍA (Exclusivo 1º de Secundaria - 6 Temas)
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biologia',
    materiaNombre: 'Biología',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 1,
    temaTitulo: 'Funcionamiento del cuerpo humano coordinado por los sistemas nervioso y endocrino',
    tituloProyecto: 'Redes de Control: Cómo el Cerebro y las Hormonas Gobiernan Nuestro Cuerpo',
    ejes: ['Vida Saludable', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Explica la participación de los sistemas nervioso y endocrino en la coordinación de las funciones del cuerpo humano, reconoce el papel de las hormonas y neurotransmisores en la respuesta a estímulos y valora la importancia de estilos de vida saludables para su cuidado.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Qué ocurre en tu cuerpo en milésimas de segundo cuando tocas por accidente una olla caliente?',
      '¿Por qué cuando te asustas o tienes una emoción fuerte el corazón late más rápido y sudan las manos?',
      '¿Cómo afecta el uso excesivo de pantallas y la falta de sueño a la producción de melatonina?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Experimento de tiempo de reacción con regla graduada en parejas.\n2. Pregunta detonadora sobre la ruta del impulso eléctrico desde los ojos hasta los dedos.\n3. Lluvia de ideas: estímulo, receptor, centro de control y efector.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Modelado de una neurona y el arco reflejo con plastilina o esquemas.\n2. Cuadro comparativo: Sistema Nervioso (eléctrico rápido) vs Sistema Endocrino (químico duradero).\n3. Estudio de caso "Estrés y Salud": análisis de los efectos del cortisol crónico.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de síntesis sobre el sistema neuroendocrino.\n2. Metacognición: elaboración de un decálogo para el cuidado cerebral.\n3. Entrega de evidencia: Diagrama del arco reflejo y cuadro comparativo.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Comprensión del mecanismo neuroendocrino.\n• Criterio 2: Relación con hábitos de vida saludable.\n• Criterio 3: Calidad del modelado anatómico.',
    materiales: 'Reglas de 30 cm, plastilina de colores, pliegos de papel bond, infografías médicas.',
    evidenciaEntregable: 'Infografía Científica "El Arco Reflejo y la Respuesta Neuroendocrina ante el Estrés".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biologia',
    materiaNombre: 'Biología',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 2,
    temaTitulo: 'Salud sexual y reproductiva (prevención de ITS y embarazo adolescente)',
    tituloProyecto: 'Decisiones Informadas: Sexualidad Responsable, Consentimiento y Prevención de ITS',
    ejes: ['Vida Saludable', 'Igualdad de Género', 'Pensamiento Crítico'],
    pda: 'Fase 6 (1º Secundaria) - Compara la efectividad de los métodos anticonceptivos y de barrera, analiza la importancia del consentimiento, el autocuidado y la toma de decisiones informada para prevenir infecciones de transmisión sexual (ITS) y embarazos no planificados en la adolescencia.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cuál es la diferencia entre sexualidad, sexo biológico, género y afectividad?',
      '¿Por qué el condón (masculino y femenino) es el ÚNICO método que brinda doble protección (embarazo e ITS como VIH y VPH)?',
      '¿Cómo influye la presión social y los mitos en la toma de decisiones sobre la sexualidad adolescente?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Buzón anónimo de preguntas sobre sexualidad y mitos populares.\n2. Pregunta detonadora: "¿Por qué la información científica y laica es el mejor escudo para nuestro proyecto de vida?".\n3. Desmitificación de creencias erróneas sobre métodos anticonceptivos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Métodos Anticonceptivos: Clasificar en hormonales, de barrera, naturales y quirúrgicos evaluando su porcentaje de efectividad.\n2. Demostración práctica del uso correcto del condón con modelo anatómico.\n3. Análisis de situaciones de consentimiento y asertividad para decir "NO" ante presiones de pareja.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común de conclusiones éticas y de autocuidado.\n2. Metacognición: "¿A qué instituciones de salud pública puedo acudir para recibir orientación confidencial y gratuita?".\n3. Entrega de evidencia: Matriz comparativa de métodos anticonceptivos.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Conocimiento científico de métodos anticonceptivos y prevención de ITS.\n• Criterio 2: Valoración ética del consentimiento y la equidad de género.\n• Criterio 3: Claridad del plan de autocuidado en el proyecto de vida.',
    materiales: 'Muestrario de métodos anticonceptivos didácticos, modelos anatómicos, trípticos de la Secretaría de Salud.',
    evidenciaEntregable: 'Guía de Salud Sexual Integral y Prevención "Decido con Responsabilidad".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biologia',
    materiaNombre: 'Biología',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 3,
    temaTitulo: 'Los procesos vitales de los seres vivos: nutrición, relación con el medio y reproducción',
    tituloProyecto: 'El Enigma de la Vida: Adaptaciones para la Nutrición, Relación y Supervivencia',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (1º Secundaria) - Compara las formas de nutrición (autótrofa y heterótrofa), relación con el medio y reproducción (sexual y asexual) en diversos seres vivos, reconociéndolas como procesos biológicos adaptativos que sostienen la biodiversidad.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo logran las plantas fabricar su propio alimento a partir de luz solar, agua y dióxido de carbono?',
      '¿Cuáles son las ventajas evolutivas de la reproducción sexual (variabilidad genética) frente a la asexual (rapidez)?',
      '¿Cómo han evolucionado los sentidos de los depredadores y presas para sobrevivir en su hábitat?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Observación de muestras biológicas al microscopio o lupas (células de cebolla y hojas de elodea con cloroplastos).\n2. Pregunta detonadora sobre los 3 pilares indispensables que definen a todo ser vivo.\n3. Recuperación de saberes: autótrofos vs heterótrofos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Modelado de Procesos Vitales: Esquematizar el flujo de energía en la fotosíntesis y respiración celular.\n2. Cuadro Comparativo de Estrategias Reproductivas: Fisión binaria, esporulación, gemación vs fecundación interna y externa.\n3. Estudio de adaptaciones morfológicas en animales locales (picos de aves, camuflaje, termorregulación).',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Exposición de cuadros comparativos.\n2. Metacognición sobre la interdependencia ecológica de todos los reinos biológicos.\n3. Entrega de evidencia: Matriz de procesos vitales ilustrada.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Diferenciación rigurosa entre nutrición autótrofa y heterótrofa.\n• Criterio 2: Análisis adaptativo de la reproducción sexual y asexual.\n• Criterio 3: Calidad de los esquemas biológicos explicativos.',
    materiales: 'Microscopios escolares, portaobjetos, muestras vegetales, hojas de esquemas biológicos.',
    evidenciaEntregable: 'Cartel Científico "La Maquinaria de la Vida: Procesos Adaptativos de los Seres Vivos".'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biologia',
    materiaNombre: 'Biología',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 4,
    temaTitulo: 'La biodiversidad como expresión del cambio de los seres vivos en el tiempo',
    tituloProyecto: 'Huellas del Pasado: Evolución, Selección Natural de Darwin y Fósiles',
    ejes: ['Pensamiento Crítico', 'Interculturalidad Crítica'],
    pda: 'Fase 6 (1º Secundaria) - Analiza información sobre el cambio de los seres vivos a través del tiempo a partir del registro fósil, la anatomía comparada y la teoría de la evolución por selección natural de Charles Darwin, valorando a México como país megadiverso.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo sabemos que los dinosaurios y los ancestros de las ballenas caminaban sobre la tierra hace millones de años?',
      '¿Qué significa que los organismos mejor adaptados a su entorno tengan mayor probabilidad de sobrevivir y reproducirse?',
      '¿Por qué México alberga más del 10% de las especies del planeta y cuál es nuestra responsabilidad biológica?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Exhibición de réplicas de fósiles (trilobites, dientes de tiburón, ámbar) y huesos comparados.\n2. Pregunta detonadora: "¿Por qué el brazo humano, la aleta de un delfín y el ala de un murciélago tienen exactamente los mismos huesos homólogos?".\n3. Contexto histórico del viaje de Darwin en el HMS Beagle.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Simulación de Selección Natural en Equipos: Dinámica de los "Picos de Pinzones" con diferentes herramientas (pinzas, cucharas, palillos) para recolectar semillas.\n2. Análisis de datos de supervivencia y frecuencia fenotípica a lo largo de 3 generaciones simuladas.\n3. Mapeo de la Megadiversidad en México: Identificar especies endémicas (ajolote, vaquita marina, jaguar) y causas de amenaza.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Puesta en común de los resultados de la simulación evolutiva.\n2. Metacognición sobre el impacto del cambio antropogénico en la extinción de especies.\n3. Entrega de evidencia: Reporte de simulación de selección natural.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Comprensión de los mecanismos de selección natural y adaptación.\n• Criterio 2: Interpretación del registro fósil y evidencias anatómicas.\n• Criterio 3: Compromiso con la conservación de la biodiversidad mexicana.',
    materiales: 'Réplicas de fósiles, semillas diversas, pinzas y recipientes para la simulación, mapas de biodiversidad.',
    evidenciaEntregable: 'Informe de Laboratorio Evolutivo "La Selección Natural en Acción" con mapa de endemismos en México.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biologia',
    materiaNombre: 'Biología',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 5,
    temaTitulo: 'El calentamiento global por la alteración de los ciclos biogeoquímicos',
    tituloProyecto: 'Planeta en Crisis: Los Ciclos del Carbono, Agua y Nitrógeno ante el Cambio Climático',
    ejes: ['Pensamiento Crítico', 'Vida Saludable'],
    pda: 'Fase 6 (1º Secundaria) - Representa y explica la transferencia de materia y energía en los ciclos biogeoquímicos (carbono, nitrógeno y agua), argumentando cómo la actividad humana (deforestación, quema de combustibles fósiles) altera el equilibrio e incrementa el calentamiento global.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿De qué manera el dióxido de carbono ($CO_2$) y el metano ($CH_4$) atrapan el calor en la atmósfera como un invernadero de cristal?',
      '¿Qué ocurre con el ciclo del agua cuando talamos un bosque entero?',
      '¿Qué acciones locales y comunitarias podemos implementar para reducir nuestra huella de carbono?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Experimento demostrativo de efecto invernadero: dos frascos con termómetros bajo una lámpara (uno abierto y otro cerrado con $CO_2$ generado).\n2. Pregunta detonadora sobre la diferencia de temperatura registrada en ambos frascos.\n3. Recuperación de saberes: ciclo del carbono y fotosíntesis.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Taller de Diagramación de Ciclos Biogeoquímicos en Papel Bond en equipos de 4.\n2. Trazado de los reservorios y flujos naturales del carbono y agua, marcando en rojo los puntos de disrupción humana (industria, ganadería intensiva, plásticos).\n3. Cálculo de la Huella Ecológica Escolar y propuesta de un plan de sustentabilidad.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Exposición de murales biogeoquímicos.\n2. Metacognición sobre la justicia climática intergeneracional.\n3. Entrega de evidencia: Diagrama del ciclo del carbono con balance antrópico.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Rigor en la representación de los ciclos biogeoquímicos.\n• Criterio 2: Argumentación científica sobre las causas del calentamiento global.\n• Criterio 3: Viabilidad del plan escolar de reducción de emisiones.',
    materiales: 'Frascos de vidrio, termómetros de laboratorio, bicarbonato, vinagre, lámpara incandescente, papel bond.',
    evidenciaEntregable: 'Mural Infográfico "Ciclos Biogeoquímicos y Emergencia Climática" con plan de acción escolar.'
  },
  {
    campo: 'Saberes y Pensamiento Científico',
    materia: 'Biologia',
    materiaNombre: 'Biología',
    grado: '1er_Grado',
    gradoDisplay: '1º de Secundaria',
    temaNum: 6,
    temaTitulo: 'Las vacunas y su relevancia en el control de enfermedades infecciosas',
    tituloProyecto: 'Escudos Biológicos: El Sistema Inmunológico y el Impacto Social de las Vacunas',
    ejes: ['Vida Saludable', 'Pensamiento Crítico', 'Inclusión'],
    pda: 'Fase 6 (1º Secundaria) - Describe las características del sistema inmune (glóbulos blancos, anticuerpos, memoria inmunológica), explica cómo actúan las vacunas en la prevención y erradicación de enfermedades epidémicas y valora su trascendencia en la salud pública.',
    duracion: '2 sesiones de 50 minutos (Total: 100 min)',
    preguntasDetonadoras: [
      '¿Cómo "recuerda" tu cuerpo a un virus contra el que ya te vacunaste para destruirlo antes de que te enferme?',
      '¿Qué es la "inmunidad de rebaño o comunitaria" y por qué vacunarse es un acto de solidaridad hacia personas vulnerables?',
      '¿Por qué las vacunas han sido uno de los mayores inventos científicos de la humanidad para salvar millones de vidas?'
    ],
    inicio: '⏱️ SESIÓN 1 (50 min) — INICIO (10 min):\n1. Proyección de la línea histórica: la viruela humana (erradicada gracias a la vacunación global de Edward Jenner).\n2. Pregunta detonadora sobre los mitos antivacunas en redes sociales.\n3. Activación de conocimientos sobre antígenos, anticuerpos y glóbulos blancos.',
    desarrollo: '⏱️ SESIÓN 1 — DESARROLLO (30 min):\n1. Modelado de la Respuesta Inmune: Esquematizar en historieta gráfica la batalla celular (Macrófagos, Linfocitos T, Linfocitos B productores de anticuerpos y Células de Memoria).\n2. Taller de Análisis de la Cartilla Nacional de Salud: Identificar las vacunas obligatorias para adolescentes (VPH, Tétanos-Difteria, Hepatitis B).\n3. Simulación Matemática de Inmunidad de Rebaño: Demostrar cómo una alta cobertura de vacunación detiene el contagio exponencial.',
    cierre: '⏱️ SESIÓN 1 — CIERRE (10 min):\n1. Plenaria de verificación de la Cartilla de Vacunación.\n2. Metacognición sobre la importancia de la medicina preventiva.\n3. Entrega de evidencia: Historieta explicativa del sistema inmune y las vacunas.',
    evaluacion: '📋 RÚBRICA FORMATIVA ANALÍTICA (3 Criterios):\n• Criterio 1: Explicación científica del mecanismo de memoria inmunológica.\n• Criterio 2: Valoración social de la inmunidad comunitaria.\n• Criterio 3: Desmitificación de falsas creencias con evidencia médica.',
    materiales: 'Cartillas de vacunación modelo, formatos de historieta, infografías de la OMS y Secretaría de Salud.',
    evidenciaEntregable: 'Historieta Científica "El Ejército Inmune y la Vacuna Protectora" con verificación de cartilla.'
  }
];

export function runMassiveCurriculumBuild() {
  console.log(`🚀 Construyendo base curricular masiva de Secundaria en Obsidian...`);

  let count = 0;
  for (const node of secondaryCurriculum) {
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

  console.log(`✨ Se han estructurado y escrito ${count} nodos de Matemáticas y Biología en la bóveda de Obsidian.`);
}

runMassiveCurriculumBuild();
