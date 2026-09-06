import { CanvasActivityJSON, CommunityActivity } from '@/types';

export interface LogicActivityPreset {
  id: string;
  templateType: 'logic_math';
  title: string;
  level: 'primaria_baja' | 'primaria_media' | 'primaria_alta' | 'secundaria';
  faseNem: 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Fase 6';
  levelLabel: string;
  targetAge: string;
  description: string;
  problemLore: string;
  pdaNem: string;
  campoFormativo: string;
  badgeReward: {
    name: string;
    icon: string;
    description: string;
  };
  gamificationSettings: {
    timeLimitSeconds: number;
    lives: number;
    streakMultiplier: boolean;
    passScorePercentage: number;
    xpBaseReward: number;
    coinsReward: number;
  };
  logicType: 
    | 'conditions' 
    | 'patterns' 
    | 'binary' 
    | 'queues_stacks' 
    | 'graphs_networks' 
    | 'state_automaton' 
    | 'greedy_optimization' 
    | 'csp_scheduler' 
    | 'database_relational' 
    | 'boolean_algebra'
    | 'sorting'
    | 'binary_search'
    | string;
  simulationConfig: {
    engine: 'interactive_switches' | 'step_automaton' | 'graph_explorer' | 'binary_counter' | 'grid_selector' | 'sorter_tray' | 'circuit_gates';
    initialState: any;
    targetState: any;
    options: {
      id: string;
      label: string;
      isCorrect: boolean;
      icon?: string;
      detail?: string;
    }[];
    steps?: string[];
  };
  pedagogicalExplanation: string; // ¿Cómo es informática / pensamiento computacional?
  classroomActivity: string;       // Continúa aprendiendo (actividad física en el aula)
  hints: string[];
}

/**
 * ============================================================================
 * CATÁLOGO DE 40 RETOS DE LÓGICA MATEMÁTICA & PENSAMIENTO COMPUTACIONAL
 * 10 Retos por Nivel Educativo (Fases 3, 4, 5 y 6 de la Nueva Escuela Mexicana)
 * ============================================================================
 */
export const MATHEMATICAL_LOGIC_ACTIVITIES: LogicActivityPreset[] = [
  // ==========================================================================
  // NIVEL 1: FASE 3 (1º Y 2º DE PRIMARIA) - EXPLORADORES (10 RETOS)
  // ==========================================================================
  {
    id: 'log-f3-01',
    templateType: 'logic_math',
    title: '1. La Hora del Lunch (Condicionales)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Aprende a seguir y evaluar reglas condicionales (SI... ENTONCES) para armar un menú semanal sin repetir alimentos restringidos.',
    problemLore: 'Lala lleva lunch a la escuela y su mamá le permite llevar 4 tipos de alimento: Manzanas, Peras, Mangos o Dulces. Reglas: 1) No puede comer mango dos días seguidos. 2) Si hoy lleva dulces, mañana debe llevar manzana o pera.',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Identifica y describe patrones y secuencias en actividades cotidianas, formulando reglas sencillas de elección.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Maestro del Menú Lógico', icon: '🍎', description: '¡Dominaste las condiciones y reglas de decisión!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'conditions',
    simulationConfig: {
      engine: 'interactive_switches',
      initialState: { monday: '🥭 Mango', thursday: '🥭 Mango', friday: '🍐 Pera' },
      targetState: { tuesday: '🍬 Dulce', wednesday: '🍎 Manzana' },
      options: [
        { id: 'opt-a', label: 'Martes: Dulce, Miércoles: Manzana', isCorrect: true, icon: '✅', detail: 'Cumple: tras dulce va manzana, y no hay mangos seguidos.' },
        { id: 'opt-b', label: 'Martes: Mango, Miércoles: Dulce', isCorrect: false, icon: '❌', detail: 'Rompe la regla 1: come mango dos días seguidos (lunes y martes).' },
        { id: 'opt-c', label: 'Martes: Dulce, Miércoles: Dulce', isCorrect: false, icon: '❌', detail: 'Rompe la regla 2: tras dulces debe ir manzana o pera, no otro dulce.' },
        { id: 'opt-d', label: 'Martes: Dulce, Miércoles: Mango', isCorrect: false, icon: '❌', detail: 'Rompe la regla 2 y deja mango el miércoles antes del jueves.' }
      ]
    },
    pedagogicalExplanation: 'Las computadoras son obedientes y siguen reglas llamadas "Condiciones" (SI pasa esto, ENTONCES haz aquello). Toda la lógica de programación se basa en combinar condiciones para tomar decisiones correctas.',
    classroomActivity: 'El Juego de Si... Entonces...: Los niños se ponen de pie en el aula. El docente da órdenes condicionales ("¡SI traes tenis blancos, ENTONCES da un salto!"). Los alumnos evalúan la condición en su mente antes de actuar.',
    hints: ['Revisa qué pasa inmediatamente después del día que se comen dulces.', 'El lunes ya hay mango, por lo que el martes no puede haberlo.']
  },
  {
    id: 'log-f3-02',
    templateType: 'logic_math',
    title: '2. Dibujos Arreglados (Reconocimiento de Patrones)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Descifra figuras ocultas debajo de manchas de pintura analizando pequeños trazos visibles y bordes característicos.',
    problemLore: 'Lars hizo unos dibujos de plantas y su hermana pequeña colocó pintura de dedos encima. Observando las líneas negras que sobresalen de las manchas, identifica qué dibujo original corresponde a cada mancha.',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Observa, reconoce y clasifica figuras y formas a partir de sus atributos visuales esenciales.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Detective de Patrones', icon: '🔍', description: '¡Reconstruiste imágenes completas con solo pequeñas pistas!' },
    gamificationSettings: { timeLimitSeconds: 50, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'patterns',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { spots: ['Azul Claro', 'Roja', 'Morada', 'Azul Oscuro'] },
      targetState: { match: 'Tallo Curvado Izquierda-Derecha' },
      options: [
        { id: 'opt-a', label: 'Mancha Morada: Tallo con ramificación doble', isCorrect: true, icon: '🌱', detail: 'Deja ver trazos tanto a la izquierda como a la derecha.' },
        { id: 'opt-b', label: 'Mancha Roja: Flor central con pétalos', isCorrect: false, icon: '🌸', detail: 'La mancha roja solo tiene una línea vertical abajo.' },
        { id: 'opt-c', label: 'Mancha Azul Claro: Tallo doble', isCorrect: false, icon: '🌿', detail: 'La mancha azul claro solo muestra curvatura a la derecha.' }
      ]
    },
    pedagogicalExplanation: 'Esto se llama Reconocimiento de Patrones en Visión Computacional. Las computadoras analizan bordes y sombras para identificar rostros, objetos y señales de tránsito incluso en fotos borrosas.',
    classroomActivity: 'El Detective de Dibujos: El docente tapa casi todo un dibujo en el pizarrón dejando ver solo un trazo pequeño. Los niños deducen qué objeto completo es reconstruyendo mentalmente la figura.',
    hints: ['Fíjate en las líneas que se escapan fuera de la mancha de pintura.', 'Compara si la línea va a la izquierda, a la derecha o hacia arriba.']
  },
  {
    id: 'log-f3-03',
    templateType: 'logic_math',
    title: '3. Caja de Pulseras (Filtros de Color)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Encuentra qué pulsera no encaja en ningún compartimento de la caja clasificando patrones circulares de cuentas.',
    problemLore: 'Victoria guarda sus pulseras en una caja con compartimentos decorados con patrones de colores. Una de las pulseras no tiene ningún compartimento con su mismo patrón.',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Organiza y clasifica colecciones de objetos atendiendo a criterios de color, forma y repetición.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Clasificador Experto', icon: '📿', description: '¡Filtraste y detectaste anomalías en conjuntos de datos!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'patterns',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { bracelets: ['A (Rojo/Negro)', 'B (Todo Rojo)', 'C (Negro/Blanco)', 'D (Rojo/Blanco)'] },
      targetState: { unmatched: 'C' },
      options: [
        { id: 'opt-c', label: 'Pulsera C (Patrón Negro y Blanco)', isCorrect: true, icon: '⚪⚫', detail: 'No existe ningún espacio en la caja con el patrón bicolor negro-blanco.' },
        { id: 'opt-a', label: 'Pulsera A (Rojo y Negro)', isCorrect: false, icon: '🔴⚫', detail: 'Sí tiene compartimento asignado en la caja.' },
        { id: 'opt-b', label: 'Pulsera B (Todo Rojo)', isCorrect: false, icon: '🔴', detail: 'Existe un espacio completamente rojo.' }
      ]
    },
    pedagogicalExplanation: 'En bases de datos y algoritmos de búsqueda, filtramos y descartamos datos que no cumplen con los esquemas válidos del sistema.',
    classroomActivity: 'Organizando mis Juguetes: Diseñar reglas de clasificación con bloques de colores y separar elementos que no coincidan con la regla.',
    hints: ['Compara el color de las cuentas con los fondos de cada compartimento.', 'Busca la pulsera que tenga una combinación de colores ausente en la caja.']
  },
  {
    id: 'log-f3-04',
    templateType: 'logic_math',
    title: '4. La Pelota de Fiona (Eliminación Lógica)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Aplica tres filtros lógicos simultáneos para descartar opciones incorrectas y seleccionar el objeto exacto.',
    problemLore: 'Fiona busca una pelota de regalo con 3 condiciones estrictas: 1) NO debe tener rayas, 2) DEBE tener una estrella, 3) NO debe tener una luna.',
    pdaNem: 'Fase 3 - Lenguajes / Saberes: Utiliza criterios lógicos de inclusión y exclusión para resolver situaciones problemáticas sencillas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Filtro de Precisión', icon: '⚽', description: '¡Aplicaste filtros booleanos de inclusión y exclusión!' },
    gamificationSettings: { timeLimitSeconds: 45, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'conditions',
    simulationConfig: {
      engine: 'interactive_switches',
      initialState: { options: ['Pelota A (Estrella)', 'Pelota B (Rayas)', 'Pelota C (Lisa)', 'Pelota D (Luna/Rayas)', 'Pelota E (Luna)'] },
      targetState: { selected: 'Pelota A' },
      options: [
        { id: 'opt-a', label: 'Pelota A (Azul con estrella, sin rayas ni lunas)', isCorrect: true, icon: '⭐', detail: 'Cumple las 3 condiciones a la perfección.' },
        { id: 'opt-b', label: 'Pelota B (Con rayas)', isCorrect: false, icon: '〰️', detail: 'Rompe la condición: "NO tener rayas".' },
        { id: 'opt-e', label: 'Pelota E (Con luna)', isCorrect: false, icon: '🌙', detail: 'Rompe la condición: "NO tener luna".' }
      ]
    },
    pedagogicalExplanation: 'En motores de búsqueda aplicamos operadores de inclusión (+estrella) y exclusión (-rayas, -luna) para obtener resultados exactos.',
    classroomActivity: 'El Objeto Misterioso: Un alumno describe un objeto del salón diciendo solo lo que NO tiene y lo que SÍ tiene para que el grupo lo adivine.',
    hints: ['Descarta primero todas las pelotas que tengan rayas.', 'De las que quedan, elimina las que tengan luna.']
  },
  {
    id: 'log-f3-05',
    templateType: 'logic_math',
    title: '5. Caminando por el Bosque (Secuencia Inversa)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Reconstruye un camino algorítmico en orden secuencial e inverso observando los puntos de referencia.',
    problemLore: 'Alia caminó de una esquina del bosque hacia el centro. En su camino vio en este orden: 1) Flores rojas y amarillas, 2) Árbol con frutas rojas, 3) Nido de pájaro en un árbol. ¿Cuál fue el camino exacto que utilizó?',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Describe y representa trayectorias y recorridos espaciales siguiendo secuencias ordenadas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Guía de Caminos', icon: '🌲', description: '¡Dominaste la ejecución secuencial e inversa de algoritmos!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'state_automaton',
    simulationConfig: {
      engine: 'graph_explorer',
      initialState: { paths: ['Camino A', 'Camino B', 'Camino C', 'Camino D'] },
      targetState: { validPath: 'Camino B' },
      options: [
        { id: 'opt-b', label: 'Camino B (Flores -> Manzano -> Nido)', isCorrect: true, icon: '🛤️', detail: 'Encuentra los tres objetos en el orden cronológico exacto.' },
        { id: 'opt-a', label: 'Camino A (Flores -> Manzano -> Sin nido)', isCorrect: false, icon: '❌', detail: 'Falta el nido del pájaro en el último tramo.' },
        { id: 'opt-c', label: 'Camino C (Inicia en piedras)', isCorrect: false, icon: '❌', detail: 'No inicia con flores rojas y amarillas.' }
      ]
    },
    pedagogicalExplanation: 'Los programas ejecutan instrucciones en secuencia estricta. Si necesitamos deshacer una acción (Ctrl+Z o Backtrack), el sistema recorre los pasos en orden inverso.',
    classroomActivity: 'El Camino del Salón: Caminar de la puerta al pizarrón anotando los objetos vistos; luego pedir a otro niño que regrese siguiendo las notas al revés.',
    hints: ['Verifica qué objeto aparece primero saliendo de la esquina.', 'Asegúrate de que el último objeto antes de llegar al centro sea el nido.']
  },
  {
    id: 'log-f3-06',
    templateType: 'logic_math',
    title: '6. Pintando el Paisaje (Ordenamiento por Volumen)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Ordena datos según el nivel de consumo y relaciona la mayor cantidad de pintura con el área de superficie correspondiente.',
    problemLore: 'Bea pintó un cuadro usando 5 botes de pintura. El bote más gastado fue el Verde (pasto), seguido del Azul (cielo), luego Café (castores) y finalmente Amarillo (sol) y Morado (flores) con poco uso.',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Compara cantidades y magnitudes, ordenándolas de mayor a menor según su valor relativo.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Pintor Algorítmico', icon: '🎨', description: '¡Ordenaste datos por frecuencia y uso de recursos!' },
    gamificationSettings: { timeLimitSeconds: 50, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'sorting',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { levels: { green: 80, blue: 60, brown: 40, yellow: 15, purple: 15 } },
      targetState: { painting: 'Cuadro A' },
      options: [
        { id: 'opt-a', label: 'Cuadro A: Pasto verde grande, cielo mediano, castores pequeños', isCorrect: true, icon: '🖼️', detail: 'La proporción de color coincide con el nivel de gasto de los botes.' },
        { id: 'opt-b', label: 'Cuadro B: Cielo gigante y pasto diminuto', isCorrect: false, icon: '❌', detail: 'El bote azul debió gastarse más que el verde, lo cual es falso.' },
        { id: 'opt-d', label: 'Cuadro D: Castores gigantes que ocupan todo el lienzo', isCorrect: false, icon: '❌', detail: 'El color café debió ser el más gastado.' }
      ]
    },
    pedagogicalExplanation: 'En informática, optimizar y ordenar listas de datos por frecuencia de uso (Histogramas) permite ahorrar memoria y procesar información prioritaria.',
    classroomActivity: 'La Torre de Colores: Medir cuántos lápices de cada color hay en la cartuchera y ordenarlos de mayor a menor cantidad en el pupitre.',
    hints: ['Identifica cuál es el color que tiene el bote más vacío (más usado).', 'El color con mayor área en el dibujo debe ser el verde.']
  },
  {
    id: 'log-f3-07',
    templateType: 'logic_math',
    title: '7. Tréboles Giratorios (Normalización y Rotación)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Aprende a normalizar figuras rotándolas en una misma orientación base para encontrar coincidencias y diferencias.',
    problemLore: 'A Seamus se le cayó su trébol favorito al suelo entre otros tréboles girados. Al girar todos los tréboles con el tallo hacia abajo, encuentra cuál es el idéntico a su modelo original.',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Experimenta con giros y rotaciones espaciales para verificar congruencia en figuras geométricas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Ojo de Águila Espacial', icon: '🍀', description: '¡Aplicaste normalización geométrica para comparar datos!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'patterns',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { targetAngle: 0 },
      targetState: { clover: 'Trébol D' },
      options: [
        { id: 'opt-d', label: 'Trébol D (Hojas completas y muescas idénticas)', isCorrect: true, icon: '🍀', detail: 'Al alinearlo con el tallo abajo, coincide exactamente en todas las hojas.' },
        { id: 'opt-a', label: 'Trébol A (Hoja derecha rota)', isCorrect: false, icon: '🌿', detail: 'Tiene una muesca faltante en la hoja superior derecha.' },
        { id: 'opt-b', label: 'Trébol B (Tallo corto)', isCorrect: false, icon: '🌱', detail: 'El tallo tiene diferente longitud y curvatura.' }
      ]
    },
    pedagogicalExplanation: 'En procesamiento de imágenes, las computadoras rotan y alinean datos (Normalización) a una misma escala para poder compararlos bit a bit sin errores.',
    classroomActivity: 'Alinear y Comparar: Colocar 5 tijeras o lápices en diferentes ángulos sobre una mesa. Pedir a los niños que los giren en la misma dirección para compararlos.',
    hints: ['Imagina que rotas cada trébol para que su tallo apunte recto hacia abajo.', 'Examina con cuidado los bordes de cada una de las tres hojas.']
  },
  {
    id: 'log-f3-08',
    templateType: 'logic_math',
    title: '8. Fiesta de Brochetas (Satisfacción de Restricciones)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Reparte brochetas a 4 comensales cumpliendo con las preferencias y restricciones alimentarias de cada uno.',
    problemLore: 'Cuatro castores quieren su brocheta ideal: A quiere que tenga cebolla; B NO puede comer cebolla; C quiere el máximo de ajos posible; D quiere el máximo de carne posible.',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Resuelve problemas de reparto y correspondencia uno a uno respetando condiciones dadas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Chef de Restricciones', icon: '🍢', description: '¡Resolviste un problema de asignación sin conflictos!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'csp_scheduler',
    simulationConfig: {
      engine: 'interactive_switches',
      initialState: { brochetas: ['1: 3 carnes', '2: Verduras sin cebolla', '3: Con cebolla', '4: 3 ajos'] },
      targetState: { A: 'Brocheta 3', B: 'Brocheta 2', C: 'Brocheta 4', D: 'Brocheta 1' },
      options: [
        { id: 'opt-sol', label: 'A -> Brocheta 3, B -> Brocheta 2, C -> Brocheta 4, D -> Brocheta 1', isCorrect: true, icon: '🎉', detail: 'Todos los comensales reciben su combinación exacta sin romper restricciones.' },
        { id: 'opt-err1', label: 'B -> Brocheta 3 (Con cebolla)', isCorrect: false, icon: '❌', detail: 'B no puede comer cebolla.' },
        { id: 'opt-err2', label: 'D -> Brocheta 4 (3 ajos)', isCorrect: false, icon: '❌', detail: 'D quiere carne, mientras que C necesita los ajos.' }
      ]
    },
    pedagogicalExplanation: 'Esto es un Problema de Satisfacción de Restricciones (CSP). En logística y sistemas de entrega, se asignan recursos asegurando que ninguna regla crítica sea violada.',
    classroomActivity: 'Reparto en el Recreo: Con 4 tarjetas de merienda y 4 amigos con gustos diferentes, encontrar la única forma de que todos queden felices.',
    hints: ['Empieza por el comensal que tiene la regla más estricta (el que tiene más ajos o no come cebolla).', 'Asigna primero a C y a D, luego resuelve entre A y B.']
  },
  {
    id: 'log-f3-09',
    templateType: 'logic_math',
    title: '9. Collares de Amistad (Subconjuntos y Conteo)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Deduce los elementos de un nuevo conjunto a partir de la resta de elementos de dos conjuntos originales.',
    problemLore: 'Mónika tenía un collar con 9 cuentas amarillas y Verónika uno con 9 cuentas rojas. Le regalaron cuentas a Anastasia para hacerle un collar nuevo. A Mónika le quedaron 6 amarillas y a Verónika 6 rojas. ¿Cómo quedó el collar de Anastasia?',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Realiza operaciones básicas de adición y sustracción identificando elementos transferidos entre colecciones.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Joyero Matemático', icon: '✨', description: '¡Comprendiste la conservación de datos en subconjuntos!' },
    gamificationSettings: { timeLimitSeconds: 50, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'conditions',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { monikaRest: 3, veronikaRest: 3 },
      targetState: { anastasiaBeads: { yellow: 3, red: 3 } },
      options: [
        { id: 'opt-a', label: 'Collar con 3 cuentas amarillas y 3 rojas', isCorrect: true, icon: '🟡🔴', detail: '9 - 6 = 3 amarillas y 9 - 6 = 3 rojas transferidas.' },
        { id: 'opt-b', label: 'Collar con 4 amarillas y 2 rojas', isCorrect: false, icon: '❌', detail: 'La suma no coincide con las cuentas faltantes en los collares.' },
        { id: 'opt-c', label: 'Collar con cuentas azules y verdes', isCorrect: false, icon: '❌', detail: 'No había cuentas azules ni verdes en los collares originales.' }
      ]
    },
    pedagogicalExplanation: 'En teoría de conjuntos y memoria informática, los datos no se destruyen: se transfieren entre subconjuntos conservando el balance total.',
    classroomActivity: 'Intercambio de Fichas: En parejas con 10 fichas cada uno, transferir fichas a una tercera caja y calcular cuántas quedaron en cada contenedor.',
    hints: ['Calcula cuántas cuentas le faltan a Mónika (9 - 6).', 'Calcula cuántas le faltan a Verónika (9 - 6) y júntalas.']
  },
  {
    id: 'log-f3-10',
    templateType: 'logic_math',
    title: '10. La Sonaja de Oliver (Listas Circulares)',
    level: 'primaria_baja',
    faseNem: 'Fase 3',
    levelLabel: '1º y 2º Primaria (Fase 3)',
    targetAge: '6-8 años',
    description: 'Predice el orden de elementos en una estructura circular que gira continuamente sin perder la secuencia relativa.',
    problemLore: 'Oliver tiene una sonaja circular con bolitas de colores en orden: Roja, Amarilla, Verde, Azul y Rosa. Al girarla, las bolitas se desplazan pero conservan su orden cíclico. ¿Qué bolitas faltan en los espacios vacíos?',
    pdaNem: 'Fase 3 - Saberes y Pensamiento Científico: Reconoce y extiende patrones de repetición en arreglos circulares y secuencias periódicas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Maestro del Ciclo', icon: '⭕', description: '¡Entendiste el funcionamiento de listas circulares y buffers!' },
    gamificationSettings: { timeLimitSeconds: 50, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 120, coinsReward: 25 },
    logicType: 'queues_stacks',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { sequence: ['🔴 Roja', '🟡 Amarilla', '🟢 Verde', '🔵 Azul', '🟣 Rosa'] },
      targetState: { missingBetweenGreenAndPink: '🔵 Azul' },
      options: [
        { id: 'opt-blue', label: 'Falta la bolita Azul entre la Verde y la Rosa', isCorrect: true, icon: '🔵', detail: 'La secuencia fija siempre mantiene a la azul entre la verde y la rosa.' },
        { id: 'opt-yellow', label: 'Falta la bolita Amarilla', isCorrect: false, icon: '🟡', detail: 'La amarilla va después de la roja, no entre verde y rosa.' },
        { id: 'opt-red', label: 'Falta la bolita Roja', isCorrect: false, icon: '🔴', detail: 'La roja va antes de la amarilla.' }
      ]
    },
    pedagogicalExplanation: 'En reproductores de música y buffers de memoria se usan Listas Circulares, donde el último elemento apunta de nuevo al primero formando un ciclo sin fin.',
    classroomActivity: 'La Rueda Musical: Los alumnos se sientan en círculo con nombres de colores y se pasan una pelota manteniendo el turno cíclico.',
    hints: ['Observa el orden original: Roja -> Amarilla -> Verde -> Azul -> Rosa.', 'Busca qué color está siempre al lado de la Verde antes de la Rosa.']
  },

  // ==========================================================================
  // NIVEL 2: FASE 4 (3º Y 4º DE PRIMARIA) - CREADORES (10 RETOS)
  // ==========================================================================
  {
    id: 'log-f4-01',
    templateType: 'logic_math',
    title: '11. Luces y Palos (Sistema Binario)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Comprende el valor posicional de las potencias de 2 (1, 2, 4) activando focos para sumar cantidades exactas en sistema binario.',
    problemLore: 'Bi-taro carga palos de madera guiado por tres focos: el foco derecho vale 1, el foco central vale 2 y el foco izquierdo vale 4. Si están encendidos el foco izquierdo y el del centro (apagado el derecho), ¿cuántos palos cargará?',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Construye y comprende sistemas de numeración posicionales y descomposiciones aditivas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Pionero Binario', icon: '💡', description: '¡Descifraste cómo cuentan y suman los procesadores digitales!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'binary',
    simulationConfig: {
      engine: 'binary_counter',
      initialState: { bits: [1, 1, 0], weights: [4, 2, 1] },
      targetState: { sum: 6 },
      options: [
        { id: 'opt-6', label: '6 Palos (4 + 2 = 6)', isCorrect: true, icon: '🪵', detail: 'Foco izquierdo (4) + Foco central (2) = 6 palos.' },
        { id: 'opt-7', label: '7 Palos (4 + 2 + 1)', isCorrect: false, icon: '❌', detail: 'El foco derecho (1) está apagado.' },
        { id: 'opt-5', label: '5 Palos (4 + 1)', isCorrect: false, icon: '❌', detail: 'El foco central (2) sí está encendido.' },
        { id: 'opt-3', label: '3 Palos (2 + 1)', isCorrect: false, icon: '❌', detail: 'No toma en cuenta el foco izquierdo de valor 4.' }
      ]
    },
    pedagogicalExplanation: 'Las computadoras usan el Sistema Binario (0 = apagado, 1 = encendido). Con combinaciones de bits en potencias de 2 (1, 2, 4, 8, 16...) representan cualquier número, letra o imagen.',
    classroomActivity: 'La Calculadora Humana: 3 alumnos sostienen carteles con 4, 2 y 1. Si están de pie están encendidos; el resto del grupo debe gritar la suma binaria al instante.',
    hints: ['Suma solo los valores de los focos que tengan luz amarilla (encendidos).', 'Izquierdo = 4, Centro = 2, Derecho = 1.']
  },
  {
    id: 'log-f4-02',
    templateType: 'logic_math',
    title: '12. Aviones en Fila (Estructura de Cola FIFO)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Aplica el principio de atención por turnos en una fila única de despegue donde el primero en llegar es el primero en salir.',
    problemLore: 'Siete aviones esperan en una pista angosta de un solo carril. Ningún avión puede saltarse la fila. Reconstruye el orden de despegue sabiendo qué avión está inmediatamente delante de los demás.',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Modela relaciones de orden temporal y prioridad en sistemas de atención secuencial.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Controlador Aéreo', icon: '✈️', description: '¡Implementaste la estructura de datos Cola FIFO!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'queues_stacks',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { queue: ['Verde (10:45)', 'Azul (10:52)', 'Rojo (10:55)', 'Rayado (10:59)', 'Amarillo Puntos (11:00)', 'Rosa (11:10)', 'Morado (11:11)'] },
      targetState: { first: 'Verde', second: 'Azul' },
      options: [
        { id: 'opt-v', label: 'El avión Verde despega primero a las 10:45', isCorrect: true, icon: '🛫', detail: 'Está en la punta de la pista y bloquea a todos los que están detrás.' },
        { id: 'opt-m', label: 'El avión Morado despega primero', isCorrect: false, icon: '❌', detail: 'Está al final de la fila; debe esperar a los otros 6.' },
        { id: 'opt-r', label: 'El avión Rojo despega a las 10:45', isCorrect: false, icon: '❌', detail: 'Tiene al avión verde y al azul por delante.' }
      ]
    },
    pedagogicalExplanation: 'En informática esto se llama Cola o FIFO (First In, First Out). Los servidores web, impresoras y procesos de CPU atienden las solicitudes en el estricto orden en que fueron recibidas.',
    classroomActivity: 'El Túnel Estrecho: Crear una hilera estrecha con sillas donde los alumnos solo pueden salir por el frente en orden de llegada.',
    hints: ['El avión que está hasta el frente de la pista tiene que salir forzosamente primero.', 'Ningún avión puede sobrevolar a los que tiene delante.']
  },
  {
    id: 'log-f4-03',
    templateType: 'logic_math',
    title: '13. La Puerta Mágica (Filtro de Atributos Opuestos)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Compara múltiples atributos independientes (forma, color, ventana y manija) para encontrar la opción completamente diferente.',
    problemLore: 'Josie quedó atrapada en una casa mágica y para salir debe cruzar una puerta que sea COMPLETAMENTE DIFERENTE a la última (Verde, con forma de arco, ventana rectangular y manija redonda).',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Analiza y discrimina atributos geométricos y visuales en colecciones complejas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Llave Maestra', icon: '🚪', description: '¡Realizaste comparaciones multivariables sin falsos positivos!' },
    gamificationSettings: { timeLimitSeconds: 50, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'patterns',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { lastDoor: { shape: 'Arco', color: 'Verde', window: 'Rectangular', handle: 'Redonda' } },
      targetState: { correctDoor: 'Puerta C (Roja, Cuadrada, Ventana Circular, Manija Rectangular)' },
      options: [
        { id: 'opt-c', label: 'Puerta C: Cuadrada, Roja, Ventana Redonda, Manija Rectangular', isCorrect: true, icon: '🚪', detail: 'Es diferente en los 4 atributos respecto a la puerta anterior.' },
        { id: 'opt-a', label: 'Puerta A: Amarilla con forma de Arco', isCorrect: false, icon: '❌', detail: 'Comparte la misma forma de arco.' },
        { id: 'opt-b', label: 'Puerta B: Verde', isCorrect: false, icon: '❌', detail: 'Comparte el mismo color verde.' },
        { id: 'opt-d', label: 'Puerta D: Azul con forma de Arco', isCorrect: false, icon: '❌', detail: 'Comparte la forma de arco y ventana.' }
      ]
    },
    pedagogicalExplanation: 'En programación orientada a objetos, cada entidad posee Atributos. Al realizar consultas complejas filtramos objetos que no comparten ninguna propiedad con el registro previo.',
    classroomActivity: 'El Gemelo Opuesto: El docente dibuja una figura con 3 atributos (Triángulo, Azul, Grande). Los niños deben dibujar su gemelo opuesto en todo (Cuadrado, Rojo, Pequeño).',
    hints: ['Si una puerta tiene aunque sea UN solo atributo igual a la anterior, queda descartada.', 'Verifica los 4 atributos: marco, color, ventana y picaporte.']
  },
  {
    id: 'log-f4-04',
    templateType: 'logic_math',
    title: '14. Castores Educados (Turnos Intercalados Round-Robin)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Simula la sincronización y alternancia equitativa de dos flujos de datos en un canal compartido.',
    problemLore: 'Los autos entran a una avenida principal alternando estrictamente un auto de la Calle Corazón y uno de la Calle Sol (uno y uno). Si antes del auto naranja con estrella de Corazón ya pasaron 3 autos, ¿cuál auto de la Calle Sol entra inmediatamente después?',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Identifica y formaliza patrones de alternancia y proporcionalidad en secuencias combinadas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Semáforo Inteligente', icon: '🚗', description: '¡Modelaste el algoritmo de planificación Round-Robin!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'csp_scheduler',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { rule: '1 de Corazón, 1 de Sol' },
      targetState: { nextCar: 'Auto A (4º de Calle Sol)' },
      options: [
        { id: 'opt-a', label: 'Auto A (El cuarto en la fila de Calle Sol)', isCorrect: true, icon: '🚙', detail: 'Al ser el 4º auto de Corazón, le sigue el 4º auto de Sol.' },
        { id: 'opt-b', label: 'Auto B (El quinto de Calle Sol)', isCorrect: false, icon: '❌', detail: 'Se salta el turno del cuarto auto.' },
        { id: 'opt-c', label: 'Auto C (Un auto de la misma Calle Corazón)', isCorrect: false, icon: '❌', detail: 'Rompe la regla de alternancia uno y uno.' }
      ]
    },
    pedagogicalExplanation: 'En redes informáticas y sistemas operativos, el algoritmo Round-Robin asigna turnos intercalados a paquetes de datos para evitar colisiones y congestión en el canal.',
    classroomActivity: 'El Cruce Seguro: Formar dos filas de alumnos que deben fusionarse en una sola puerta alternando un alumno de cada fila sin amontonarse.',
    hints: ['Cuenta cuántos autos de la Calle Corazón han pasado antes del auto con estrella.', 'Debe haber pasado exactamente el mismo número de autos de la Calle Sol.']
  },
  {
    id: 'log-f4-05',
    templateType: 'logic_math',
    title: '15. La Fruta de la Reina (Ordenamiento Jerárquico)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Ordena registros aplicando un criterio primario (manzanas) y un criterio de desempate secundario (plátanos).',
    problemLore: 'La Reina recibe 5 canastas de fruta. Su regla: atiende primero a quien tenga MÁS manzanas. En caso de empate en manzanas, atiende a quien tenga MÁS plátanos. ¿En qué orden atenderá las canastas?',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Ordena y organiza colecciones de datos utilizando criterios de orden jerárquico múltiple.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Mayordomo Real', icon: '👑', description: '¡Dominaste el ordenamiento multicriterio con desempates!' },
    gamificationSettings: { timeLimitSeconds: 65, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'sorting',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { baskets: { A: [3, 2], B: [5, 1], C: [2, 4], D: [3, 3], E: [1, 5] } },
      targetState: { order: ['B', 'D', 'A', 'C', 'E'] },
      options: [
        { id: 'opt-bda-ce', label: 'B -> D -> A -> C -> E', isCorrect: true, icon: '🧺', detail: 'B (5 manzan.) -> D (3 manzan., 3 plát.) -> A (3 manzan., 2 plát.) -> C (2) -> E (1).' },
        { id: 'opt-bad-ce', label: 'B -> A -> D -> C -> E', isCorrect: false, icon: '❌', detail: 'En el empate de 3 manzanas, D tiene más plátanos que A (3 vs 2).' },
        { id: 'opt-edc-ab', label: 'E -> C -> A -> D -> B', isCorrect: false, icon: '❌', detail: 'Ordenó al revés (de menor a mayor).' }
      ]
    },
    pedagogicalExplanation: 'En bases de datos relacionales ejecutamos consultas SQL con múltiples ordenamientos (ej. `ORDER BY manzanas DESC, platanos DESC`) para desempatar clasificaciones automáticamente.',
    classroomActivity: 'Fila por Estatura y Edad: Formar a los niños por estatura; si dos miden lo mismo, desempatar por quién tiene más meses cumplidos.',
    hints: ['Primero busca la canasta que tenga la mayor cantidad de manzanas (esa va primera).', 'Cuando dos canastas tengan las mismas manzanas, mira los plátanos.']
  },
  {
    id: 'log-f4-06',
    templateType: 'logic_math',
    title: '16. Tubo de Canicas (Cola de Doble Extremo Deque)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Modela la entrada y expulsión de elementos por los extremos izquierdo y derecho en una estructura de capacidad limitada.',
    problemLore: 'En un tubo donde solo caben 3 canicas, al insertar una canica por un extremo, se empuja y sale una por el extremo opuesto. Rastrea el estado final tras insertar 4 canicas en diferentes direcciones.',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Simula y predice estados finales en secuencias de desplazamiento espacial restringido.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Mecánico de Deque', icon: '🔮', description: '¡Simulaste una cola de doble extremo con precisión!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'queues_stacks',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { tube: ['Azul', 'Verde', 'Gris'], capacity: 3 },
      targetState: { finalTube: ['Blanco', 'Gris', 'Blanco'] },
      options: [
        { id: 'opt-wgw', label: 'Canicas: Blanca, Gris, Blanca', isCorrect: true, icon: '⚪🔘⚪', detail: 'El desplazamiento por izquierda y derecha expulsa las bolas iniciales dejando este arreglo.' },
        { id: 'opt-bgb', label: 'Canicas: Azul, Gris, Verde', isCorrect: false, icon: '❌', detail: 'No considera las 4 nuevas canicas insertadas.' },
        { id: 'opt-allw', label: 'Canicas: 3 Blancas', isCorrect: false, icon: '❌', detail: 'Una de las canicas insertadas era gris.' }
      ]
    },
    pedagogicalExplanation: 'En computación esto es un Deque (Double Ended Queue). Permite insertar y eliminar datos por ambos extremos, usado en algoritmos de ventana deslizante y buffers.',
    classroomActivity: 'El Tubo de Cartón: Con un cilindro de cartón y 3 pelotitas, meter pelotitas por turnos y observar cuál sale disparada por el otro lado.',
    hints: ['Dibuja el tubo en cada paso anotando la canica que entra y la que es expulsada.', 'Presta atención a la dirección de la flecha de cada inserción.']
  },
  {
    id: 'log-f4-07',
    templateType: 'logic_math',
    title: '17. Videollamada en el Salón (Mapeo de Vecinos)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Reconstruye la disposición lineal de 9 estudiantes en un salón a partir de la cuadrícula de una videollamada.',
    problemLore: 'Ava ve a sus 9 amigos en una pantalla 3x3 de videollamada. Sin embargo, en el salón real se sientan en una sola fila larga. Observando quién está a la izquierda y derecha de quién en sus cámaras, reconstruye la fila del salón.',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Traduce y relaciona representaciones espaciales en dos dimensiones hacia estructuras lineales unidimensionales.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Topógrafo Digital', icon: '💻', description: '¡Mapeaste relaciones de vecindad entre dos dimensiones!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'patterns',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { screenGrid: [['James', 'Emma', 'Diana'], ['Lee', 'Hannah', 'Bella'], ['Alice', 'Raul', 'Maya']] },
      targetState: { classroomRow: ['James', 'Emma', 'Diana', 'Lee', 'Hannah', 'Bella', 'Alice', 'Raul', 'Maya'] },
      options: [
        { id: 'opt-row', label: 'James, Emma, Diana, Lee, Hannah, Bella, Alice, Raul, Maya', isCorrect: true, icon: '👥', detail: 'Cada trío de la pantalla mantiene su continuidad de vecinos en la fila.' },
        { id: 'opt-err', label: 'Diana, James, Emma, Bella, Lee, Hannah...', isCorrect: false, icon: '❌', detail: 'Invierte las posiciones relativas de los compañeros.' }
      ]
    },
    pedagogicalExplanation: 'Las computadoras manejan matrices bidimensionales (filas y columnas) y las aplanan en arreglos lineales de memoria RAM mediante fórmulas de indexación.',
    classroomActivity: 'El Salón en Foto: Tomar una foto en grupo de 3 filas y luego formarse en una sola fila respetando quién tenía a sus lados.',
    hints: ['Emma está entre James y Diana, por lo que van juntos en ese orden.', 'Conecta el final de la primera fila de la pantalla con el inicio de la segunda.']
  },
  {
    id: 'log-f4-08',
    templateType: 'logic_math',
    title: '18. Dibujando Barquitos (Senderos de Euler)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Encuentra el punto de partida para trazar una figura completa de un solo trazo sin repetir ninguna línea.',
    problemLore: 'Sofía quiere dibujar un barco de un solo trazo sin despegar el lápiz y sin pasar dos veces por la misma línea. ¿En cuál de los vértices del barco debe comenzar obligatoriamente?',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Analiza redes de caminos y vértices identificando nodos pares e impares.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Navegante de Euler', icon: '⛵', description: '¡Descubriste el teorema de los caminos eulerianos en grafos!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'graphs_networks',
    simulationConfig: {
      engine: 'graph_explorer',
      initialState: { oddNodes: 2, evenNodes: 4 },
      targetState: { validStarts: ['Vértice Inferior Izquierdo', 'Vértice Inferior Derecho'] },
      options: [
        { id: 'opt-odd', label: 'En uno de los 2 vértices donde se unen un número impar (3) de líneas', isCorrect: true, icon: '📍', detail: 'Un grafo solo se puede trazar de un trazo si inicias en un nodo de grado impar.' },
        { id: 'opt-top', label: 'En la punta más alta de la vela (grado par)', isCorrect: false, icon: '❌', detail: 'Al tener grado par, no permite salir, recorrer y regresar sin atorarse.' },
        { id: 'opt-any', label: 'En cualquier vértice del barco', isCorrect: false, icon: '❌', detail: 'Si inicias en un vértice par, la figura quedará incompleta.' }
      ]
    },
    pedagogicalExplanation: 'Leonhard Euler demostró que para recorrer un grafo sin repetir aristas, solo puede haber 0 o 2 nodos con número impar de conexiones, y el recorrido debe iniciar en uno impar.',
    classroomActivity: 'Figuras de un Solo Trazo: Intentar dibujar estrellas y casas en papel sin levantar el lápiz y contar cuántas líneas se unen en cada esquina.',
    hints: ['Cuenta cuántas líneas se conectan en cada esquina del dibujo.', 'Busca los únicos dos vértices que tienen un número impar (3) de líneas.']
  },
  {
    id: 'log-f4-09',
    templateType: 'logic_math',
    title: '19. Días Soleados y Lógica (Conectores Y, O, NO)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Evalúa la veracidad de enunciados compuestos utilizando operadores lógicos booleanos.',
    problemLore: 'Alfred fue fotografiado con sombrero y bastón (sin corbata). Cuatro amigos hicieron afirmaciones. ¿Cuál de los enunciados es VERDADERO?',
    pdaNem: 'Fase 4 - Lenguajes / Saberes: Evalúa el valor de verdad de argumentos combinados con conectores lógicos.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Lógico Filosófico', icon: '🎩', description: '¡Dominaste las tablas de verdad de la conjunción y disyunción!' },
    gamificationSettings: { timeLimitSeconds: 55, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'boolean_algebra',
    simulationConfig: {
      engine: 'interactive_switches',
      initialState: { hasHat: true, hasCane: true, hasTie: false },
      targetState: { trueStatement: 'Opción B' },
      options: [
        { id: 'opt-b', label: 'B) "Alfred llevaba corbata (Falso) O usaba bastón (Verdadero)"', isCorrect: true, icon: '✅', detail: 'En una disyunción "O", basta con que una parte sea verdadera (FALSO O VERDADERO = VERDADERO).' },
        { id: 'opt-a', label: 'A) "Llevaba sombrero Y NO llevaba bastón"', isCorrect: false, icon: '❌', detail: 'Verdadero Y Falso = Falso.' },
        { id: 'opt-c', label: 'C) "Llevaba sombrero Y llevaba corbata de moño"', isCorrect: false, icon: '❌', detail: 'Verdadero Y Falso = Falso.' },
        { id: 'opt-d', label: 'D) "Llevaba corbata de moño O NO llevaba bastón"', isCorrect: false, icon: '❌', detail: 'Falso O Falso = Falso.' }
      ]
    },
    pedagogicalExplanation: 'En lógica booleana: el operador Y exige que ambas premisas se cumplan; el operador O es verdadero si al menos una se cumple; el operador NO invierte el valor.',
    classroomActivity: 'Tres Mentiras y una Verdad: Crear 4 enunciados sobre el aula usando Y y O para que los compañeros descubran cuál es matemáticamente verdadero.',
    hints: ['Recuerda: con "O", con que una sola parte sea cierta, toda la frase es verdadera.', 'Verifica qué prendas llevaba puestas Alfred en la foto.']
  },
  {
    id: 'log-f4-10',
    templateType: 'logic_math',
    title: '20. Creando un Videojuego (Autómatas Finitos)',
    level: 'primaria_media',
    faseNem: 'Fase 4',
    levelLabel: '3º y 4º Primaria (Fase 4)',
    targetAge: '8-10 años',
    description: 'Verifica transiciones válidas entre estados de un autómata generador de escenarios infinitos.',
    problemLore: 'Un motor de videojuego genera el fondo conectando piezas según un diagrama de flechas. La pieza con diamante solo puede ser seguida por pasto y cielo. ¿Cuál de las secuencias contiene un error de transición?',
    pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Modela secuencias de generación procedimental siguiendo grafos de transición.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Diseñador de Motores', icon: '🎮', description: '¡Validaste autómatas de estados finitos en videojuegos!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 150, coinsReward: 30 },
    logicType: 'state_automaton',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { currentPiece: 'Diamante' },
      targetState: { invalidSequence: 'Secuencia C' },
      options: [
        { id: 'opt-c', label: 'Secuencia C (Diamante seguido de plataforma de ladrillos)', isCorrect: true, icon: '🚫', detail: 'El diagrama prohíbe que los ladrillos sigan directamente al diamante.' },
        { id: 'opt-a', label: 'Secuencia A (Pasto -> Cielo -> Diamante -> Pasto)', isCorrect: false, icon: '✅', detail: 'Todas las transiciones de A son completamente válidas según las flechas.' },
        { id: 'opt-b', label: 'Secuencia B (Ladrillos -> Pasto -> Diamante -> Pasto)', isCorrect: false, icon: '✅', detail: 'Sigue estrictamente las flechas permitidas.' }
      ]
    },
    pedagogicalExplanation: 'En programación de videojuegos y compiladores, un Autómata Finito determina qué estados o animaciones pueden suceder a continuación sin provocar bugs.',
    classroomActivity: 'El Generador de Niveles: Dibujar tarjetas de suelo, obstáculos y monedas con flechas permitidas para crear niveles infinitos en equipo.',
    hints: ['Sigue con el dedo la pieza con diamante en el diagrama.', 'Mira qué pieza viene justo después del diamante en cada opción.']
  },

  // ==========================================================================
  // NIVEL 3: FASE 5 (5º Y 6º DE PRIMARIA) - INNOVADORES (10 RETOS)
  // ==========================================================================
  {
    id: 'log-f5-01',
    templateType: 'logic_math',
    title: '21. Zancos y Equilibrio (Algoritmos Voraces Greedy)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Empareja elementos opuestos para lograr sumas constantes aplicando una estrategia voraz de optimización.',
    problemLore: 'Un grupo de castores con diferentes alturas y sombreros van a un desfile y quieren quedar exactamente a la misma altura total (13 unidades). Para lograrlo, al castor más alto le tocan los zancos más bajos y al más bajo los más altos.',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Resuelve problemas de optimización y equilibrio aditivo mediante estrategias heurísticas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Estratega Voraz', icon: '🎪', description: '¡Aplicaste algoritmos Greedy y ordenamiento complementario!' },
    gamificationSettings: { timeLimitSeconds: 65, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'greedy_optimization',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { beavers: [12, 10, 8, 4], stilts: [1, 3, 5, 9], targetSum: 13 },
      targetState: { pairs: [[12, 1], [10, 3], [8, 5], [4, 9]] },
      options: [
        { id: 'opt-greedy', label: 'Emparejar el mayor castor con el menor zanco (12+1=13, 10+3=13, 8+5=13, 4+9=13)', isCorrect: true, icon: '⚖️', detail: 'Cada pareja suma exactamente 13 unidades de altura.' },
        { id: 'opt-rand', label: 'Asignar los zancos al azar por orden de llegada', isCorrect: false, icon: '❌', detail: 'Provoca alturas desiguales de 21 y 5 unidades.' }
      ]
    },
    pedagogicalExplanation: 'Los Algoritmos Voraces (Greedy) toman la decisión óptima en cada paso local (el más grande con el más pequeño) para llegar rápidamente a la solución global.',
    classroomActivity: 'La Torre Equilibrada: Con bloques de diferentes grosores y juguetes de distintas alturas, lograr que todos alcancen la misma línea en la pared.',
    hints: ['Empieza emparejando al castor de altura 12 con el zanco de altura 1.', 'Verifica que todas las parejas sumen exactamente 13.']
  },
  {
    id: 'log-f5-02',
    templateType: 'logic_math',
    title: '22. Evitando las Nubes (Búsqueda en Espacio 3D)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Navega a través de capas sucesivas en una cuadrícula tridimensional encontrando el único camino sin obstáculos.',
    problemLore: 'Un piloto atraviesa una cuadrícula 3x3 dividida en 3 capas de nubes. En cada paso avanza una capa y puede moverse a casillas adyacentes o diagonales. ¿Qué secuencia de movimientos le permite cruzar al cielo despejado?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Modela y resuelve problemas de trayectoria en espacios tridimensionales representados por capas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Piloto Tridimensional', icon: '🛩️', description: '¡Navegaste matrices multicapa en 3D!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'graphs_networks',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { layer: 1, position: [1, 1] },
      targetState: { path: ['Diagonal Derecha-Arriba (Capa 1)', 'Abajo Centro (Capa 2)', 'Fila 2 Derecha (Capa 3)'] },
      options: [
        { id: 'opt-3d', label: 'Capa 1: Diagonal -> Capa 2: Abajo Centro -> Capa 3: Fila 2 Derecha', isCorrect: true, icon: '🌤️', detail: 'Es la única ruta que atraviesa los huecos libres sin colisionar.' },
        { id: 'opt-straight', label: 'Avanzar en línea recta por el centro', isCorrect: false, icon: '💥', detail: 'Choca de inmediato contra la nube blanca de la Capa 1.' }
      ]
    },
    pedagogicalExplanation: 'En motores de física 3D y videojuegos, el espacio se divide en capas o vóxeles para calcular rutas de colisión y trayectorias libres de obstáculos.',
    classroomActivity: 'El Túnel de Aros: Tres filas de alumnos forman obstáculos con brazos abiertos dejando un hueco en diferente posición en cada fila para que un "avión" cruce.',
    hints: ['Identifica el único cuadro vacío en la primera capa de nubes blancas.', 'Revisa hacia dónde te puedes mover en la capa 2 desde esa posición.']
  },
  {
    id: 'log-f5-03',
    templateType: 'logic_math',
    title: '23. Hojas, Frutos y Madera (JOINs de Bases de Datos)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Conecta dos tablas de datos utilizando una clave común (Primary/Foreign Key) para resolver una consulta relacional.',
    problemLore: 'Emil encontró una hoja de árbol y quiere saber si su madera sirve para construir. Severin tiene la tabla de Hojas -> Especie; Ladina tiene la tabla de Especie -> Calidad de Madera; Quirina tiene Frutos -> Piñas. ¿A quiénes debe consultar y en qué orden?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Organiza datos en tablas relacionales y extrae conclusiones conectando campos comunes.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Arquitecto de Datos', icon: '🗄️', description: '¡Ejecutaste una unión JOIN en bases de datos relacionales!' },
    gamificationSettings: { timeLimitSeconds: 65, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'database_relational',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { hasItem: 'Forma de Hoja' },
      targetState: { step1: 'Severin', step2: 'Ladina' },
      options: [
        { id: 'opt-c', label: 'C) Primero a Severin, luego a Ladina', isCorrect: true, icon: '🔗', detail: 'Severin traduce Hoja -> Especie (Llave), y Ladina traduce Especie -> Madera.' },
        { id: 'opt-a', label: 'A) Primero a Quirina, luego a Severin, luego a Ladina', isCorrect: false, icon: '❌', detail: 'Quirina necesita el fruto, el cual Emil no tiene.' },
        { id: 'opt-b', label: 'B) Sólo a Ladina', isCorrect: false, icon: '❌', detail: 'Ladina no conoce la forma de las hojas, solo los nombres de especies.' }
      ]
    },
    pedagogicalExplanation: 'Las bases de datos relacionales (SQL) no guardan todo en una sola tabla gigante. Usan un dato común llamado Llave (Key) para conectar tablas mediante un JOIN.',
    classroomActivity: 'Base de Datos en Papel: Crear Tabla 1 (Alumnos: ID, Nombre) y Tabla 2 (Notas: ID, Calificación) para que busquen el nombre del promedio más alto uniendo por ID.',
    hints: ['¿Quién tiene la tabla que acepta "forma de hoja" como dato de entrada?', '¿Qué dato te entrega Severin que le sirve a Ladina?']
  },
  {
    id: 'log-f5-04',
    templateType: 'logic_math',
    title: '24. Construyendo una Presa (Optimización de Subsecuencias)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Encuentra la subsecuencia decreciente que maximiza la suma total de madera respetando la dirección de avance.',
    problemLore: 'Los castores cortan árboles alineados [8m, 6m, 9m, 7m, 10m, 5m]. Reglas: 1) Solo pueden cortar árboles que estén más a la derecha, 2) Cada árbol cortado debe ser MÁS BAJO que el anterior. ¿Cuál es la cantidad máxima de madera que pueden obtener?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Formula y evalúa algoritmos de optimización combinatoria en secuencias numéricas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Ingeniero Hidráulico', icon: '🪵', description: '¡Resolviste un problema de programación dinámica y subsecuencias!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'greedy_optimization',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { trees: [8, 6, 9, 7, 10, 5] },
      targetState: { maxPath: [9, 7, 5], sum: 21 },
      options: [
        { id: 'opt-21', label: '21 metros (Cortando los árboles de 9m, 7m y 5m)', isCorrect: true, icon: '🏆', detail: '9 + 7 + 5 = 21m (es estrictamente decreciente y hacia la derecha).' },
        { id: 'opt-20', label: '20 metros (Cortando 8m, 7m y 5m)', isCorrect: false, icon: '❌', detail: 'Rinde 20m, menor que la combinación que inicia en 9m.' },
        { id: 'opt-15', label: '15 metros (Iniciando en el más alto de 10m + 5m)', isCorrect: false, icon: '❌', detail: 'Irse por el más alto (10m) elimina a los árboles intermedios.' }
      ]
    },
    pedagogicalExplanation: 'En optimización matemática, no siempre empezar por el valor individual más grande (10) da el mejor resultado global; se evalúan todas las rutas de subsecuencia.',
    classroomActivity: 'El Río de Números: Pegar hojas numeradas en el piso; los niños deben cruzar saltando solo a números menores para acumular la máxima suma posible.',
    hints: ['Compara qué pasa si inicias en el árbol de 8m vs si inicias en el de 9m.', 'Si eliges el de 10m, a su derecha solo queda el de 5m (suma 15m).']
  },
  {
    id: 'log-f5-05',
    templateType: 'logic_math',
    title: '25. Robot Agrícola (Máquina de Turing en Cinta)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Ejecuta el ciclo de lectura, escritura y desplazamiento de un cabezal sobre una cinta de memoria unidimensional.',
    problemLore: 'Un robot agrícola tiene una cinta con letreros y espacios vacíos. Instrucciones: 1) Lee el letrero central, 2) Siembra esa flor en su lugar, 3) Camina a la derecha al primer espacio vacío y siembra la misma flor, 4) Regresa a la izquierda al siguiente letrero y repite. ¿Cómo queda la cinta al final?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Modela el funcionamiento de programas y autómatas iterativos sobre cintas de estados.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Mecánico de Turing', icon: '🤖', description: '¡Simulaste la máquina universal de Alan Turing!' },
    gamificationSettings: { timeLimitSeconds: 75, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'state_automaton',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { tape: ['Tulipán', 'Rosa', 'Girasol', 'Violeta', 'X', '_', '_', '_', '_'] },
      targetState: { finalTape: 'Espejo simétrico de flores a partir del centro' },
      options: [
        { id: 'opt-mirror', label: 'La línea final será un espejo de las flores a partir de la X', isCorrect: true, icon: '🌸🌷🌻', detail: 'El cabezal copia y refleja cada flor en orden inverso en el lado derecho.' },
        { id: 'opt-same', label: 'La línea se llena únicamente con violetas', isCorrect: false, icon: '❌', detail: 'El robot regresa a leer las otras flores de la izquierda.' }
      ]
    },
    pedagogicalExplanation: 'Alan Turing diseñó la Máquina de Turing: un cabezal que lee, escribe y se mueve sobre una cinta de memoria. Es el modelo matemático de todas las computadoras modernas.',
    classroomActivity: 'Cinta Humana de Turing: Dibujar casillas en el piso; un alumno con antifaz ejecuta las órdenes de leer símbolo, cambiarlo y dar pasos a izquierda/derecha.',
    hints: ['Sigue los pasos del robot con el primer letrero de Violeta.', 'Observa que al regresar a la izquierda va tomando una flor diferente cada vez.']
  },
  {
    id: 'log-f5-06',
    templateType: 'logic_math',
    title: '26. Tour por el Bosque (Ordenamiento Topológico)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Deduce el orden lineal completo de un conjunto de elementos a partir de comparaciones parciales de precedencia.',
    problemLore: 'Bea analiza qué árboles son más populares que otros en 3 paseos previos: A < B < C < D, B < E < C < F, G < D < F. En el siguiente paseo quiere mostrar 5 árboles en orden estricto de popularidad ascendente.',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Resuelve problemas de ordenamiento topológico combinando relaciones de orden parcial.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Especialista Topológico', icon: '🗺️', description: '¡Resolviste un grafo de precedencias topológicas!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'graphs_networks',
    simulationConfig: {
      engine: 'graph_explorer',
      initialState: { relations: ['A < B', 'B < E', 'E < C', 'C < D', 'D < F', 'G < D'] },
      targetState: { validSort: ['A', 'B', 'E', 'C', 'D', 'F'] },
      options: [
        { id: 'opt-abecdf', label: 'Orden: A -> B -> E -> C -> D -> F', isCorrect: true, icon: '📈', detail: 'Satisface todas las desigualdades parciales de los 3 paseos.' },
        { id: 'opt-wrong', label: 'Orden: A -> C -> B -> D...', isCorrect: false, icon: '❌', detail: 'Viola que B debe ser visitado antes que C.' }
      ]
    },
    pedagogicalExplanation: 'El Ordenamiento Topológico organiza tareas en un proyecto de software según sus dependencias previas (por ejemplo: compilar código antes de ejecutar pruebas).',
    classroomActivity: 'Ruta de Dependencias: Anotar actividades diarias (ponerse calcetines antes de los zapatos) y construir un diagrama de flechas de precedencia.',
    hints: ['Conecta los árboles con flechas según quién es menor que quién.', 'El árbol que no tenga ninguna flecha apuntándole por la izquierda debe ir primero.']
  },
  {
    id: 'log-f5-07',
    templateType: 'logic_math',
    title: '27. El Siguiente por Favor (Planificación SJF)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Calcula el orden de atención en una biblioteca aplicando el algoritmo de trabajo más corto primero (Shortest Job First).',
    problemLore: 'En la biblioteca, cada libro toma 1 minuto en registrarse. Regla: siempre pasa quien tenga MENOS libros en la fila. Andrea llegó a las 9:00 (4 libros); Beto a las 9:02 (6 libros); Cony a las 9:03 (2 libros); David a las 9:05 (4 libros); Emilia a las 9:11 (1 libro). ¿En qué orden terminan?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Modela y compara algoritmos de calendarización y gestión eficiente de colas de espera.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Planificador Maestro', icon: '📚', description: '¡Maximizaste el rendimiento del despachador con SJF!' },
    gamificationSettings: { timeLimitSeconds: 75, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'csp_scheduler',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { arrivals: [{ name: 'Andrea', t: '9:00', b: 4 }, { name: 'Beto', t: '9:02', b: 6 }, { name: 'Cony', t: '9:03', b: 2 }, { name: 'David', t: '9:05', b: 4 }, { name: 'Emilia', t: '9:11', b: 1 }] },
      targetState: { order: ['Andrea', 'Cony', 'David', 'Beto', 'Emilia'] },
      options: [
        { id: 'opt-acbde', label: 'Andrea -> Cony -> David -> Beto -> Emilia', isCorrect: true, icon: '📋', detail: 'Andrea (9:00-9:04), luego Cony (2 libros a las 9:04), luego David (4 libros a las 9:06), luego Beto (6 libros a las 9:10), luego Emilia (9:16).' },
        { id: 'opt-fifo', label: 'Andrea -> Beto -> Cony -> David -> Emilia (Por orden de llegada)', isCorrect: false, icon: '❌', detail: 'No respeta la regla de atender al que tiene menos libros.' }
      ]
    },
    pedagogicalExplanation: 'En sistemas operativos, el algoritmo Shortest Job First (SJF) minimiza el tiempo promedio de espera de los usuarios al priorizar procesos rápidos.',
    classroomActivity: 'Atención en la Cooperativa: Simular compras rápidas vs compras largas y comparar cuánto tiempo espera la fila total con diferentes reglas de atención.',
    hints: ['Calcula a qué hora termina Andrea sus 4 libros (9:04).', 'A las 9:04, mira quiénes están esperando y quién tiene menos libros.']
  },
  {
    id: 'log-f5-08',
    templateType: 'logic_math',
    title: '28. Moviendo Bloques (Ordenamiento Gnomo)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Sigue y predice el número de pasos de un algoritmo de ordenamiento que intercambia elementos y retrocede.',
    problemLore: 'Una máquina ordena bloques con una charola: 1) Si el bloque izquierdo es menor, avanza a la derecha. 2) Si el izquierdo es mayor, los intercambia y retrocede un paso a la izquierda. ¿Cuál configuración inicial requiere MENOR número de movimientos?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Analiza la complejidad temporal y número de operaciones en algoritmos de ordenamiento.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Optimizador de Algoritmos', icon: '🧱', description: '¡Comprendiste el costo computacional del Gnome Sort!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'sorting',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { configs: ['A: 1-2-6-5-3-4', 'B: 1-6-2-5-3-4', 'C: 1-5-6-2-3-4', 'D: 1-2-5-6-3-4'] },
      targetState: { bestConfig: 'D' },
      options: [
        { id: 'opt-d', label: 'Configuración D (1 - 2 - 5 - 6 - 3 - 4)', isCorrect: true, icon: '⚡', detail: 'Tiene sus primeros 4 bloques ya ordenados, requiriendo el mínimo de retrocesos.' },
        { id: 'opt-b', label: 'Configuración B (1 - 6 - 2 - 5 - 3 - 4)', isCorrect: false, icon: '❌', detail: 'El 6 al inicio obliga a múltiples intercambios y retrocesos.' }
      ]
    },
    pedagogicalExplanation: 'El Gnome Sort es un algoritmo similar al Insertion Sort. Cuanto más cerca esté la lista de estar ordenada inicialmente, menor será el número de instrucciones ejecutadas.',
    classroomActivity: 'El Gnomo del Salón: Ordenar 5 alumnos por estatura caminando hacia adelante y retrocediendo un paso cada vez que se haga un intercambio.',
    hints: ['Busca la opción que tenga la mayor cantidad de bloques ya ordenados al principio.', 'En la opción D, el 1, 2, 5 y 6 ya están en orden creciente.']
  },
  {
    id: 'log-f5-09',
    templateType: 'logic_math',
    title: '29. Encontrando el Tesoro (Búsqueda Binaria)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Aplica el principio de división y conquista para localizar un elemento en 16 regiones con el número mínimo garantizado de preguntas.',
    problemLore: 'Luffy busca un tesoro en una isla de 16 cuadrículas. Tiene un sensor que le dice SI o NO al consultar cualquier grupo de casillas. ¿Cuál es el número mínimo de preguntas que necesita para garantizar encontrar el tesoro?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Resuelve problemas de búsqueda y partición logarítmica utilizando el método divide y vencerás.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Explorador Logarítmico', icon: '🏴‍☠️', description: '¡Aplicaste Búsqueda Binaria O(log N) con éxito!' },
    gamificationSettings: { timeLimitSeconds: 60, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'binary',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { totalCells: 16 },
      targetState: { minQuestions: 4 },
      options: [
        { id: 'opt-4', label: '4 Preguntas (16 -> 8 -> 4 -> 2 -> 1)', isCorrect: true, icon: '🎯', detail: '2^4 = 16. Dividiendo el espacio a la mitad en cada paso se garantiza la respuesta en 4 preguntas.' },
        { id: 'opt-8', label: '8 Preguntas', isCorrect: false, icon: '❌', detail: 'Es una estrategia lineal ineficiente.' },
        { id: 'opt-16', label: '16 Preguntas', isCorrect: false, icon: '❌', detail: 'Preguntar casilla por casilla es fuerza bruta innecesaria.' }
      ]
    },
    pedagogicalExplanation: 'La Búsqueda Binaria (Divide y Vencerás) descarta la mitad de las posibilidades en cada paso. Con solo 20 preguntas se puede localizar un dato entre más de 1,000,000 de registros.',
    classroomActivity: 'Adivina el Número Secreto: Un niño piensa un número del 1 al 100; los demás hacen preguntas de "¿Es mayor que...?" dividiendo siempre el rango a la mitad.',
    hints: ['En cada pregunta, Luffy debe consultar exactamente por la mitad de las casillas restantes.', '16 dividido entre 2 = 8; luego 4; luego 2; luego 1.']
  },
  {
    id: 'log-f5-10',
    templateType: 'logic_math',
    title: '30. La Pulsera Más Larga (Subsecuencia Creciente LIS)',
    level: 'primaria_alta',
    faseNem: 'Fase 5',
    levelLabel: '5º y 6º Primaria (Fase 5)',
    targetAge: '10-12 años',
    description: 'Encuentra la longitud máxima de una secuencia estrictamente creciente a partir de un tubo de cuentas numeradas.',
    problemLore: 'Ale fabrica una pulsera con cuentas que salen en orden [5, 1, 3, 2, 4, 8, 6, 7, 9]. Cada nueva cuenta agregada al hilo debe tener un número estrictamente MAYOR que la anterior. ¿Cuál es la cantidad máxima de cuentas que puede tener la pulsera?',
    pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Resuelve problemas de optimización de cadenas utilizando programación dinámica.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Maestro de Secuencias', icon: '📿', description: '¡Resolviste la Longest Increasing Subsequence!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 35 },
    logicType: 'greedy_optimization',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { tube: [5, 1, 3, 2, 4, 8, 6, 7, 9] },
      targetState: { maxLen: 6, bestSequence: [1, 2, 4, 6, 7, 9] },
      options: [
        { id: 'opt-6', label: '6 Cuentas (ej. 1 -> 2 -> 4 -> 6 -> 7 -> 9)', isCorrect: true, icon: '💎', detail: 'Es la subsecuencia incremental más larga posible en el arreglo dado.' },
        { id: 'opt-4', label: '4 Cuentas (iniciando en 5: 5 -> 6 -> 7 -> 9)', isCorrect: false, icon: '❌', detail: 'Tomar el 5 al inicio descarta el 1, 2, 3 y 4.' },
        { id: 'opt-8', label: '8 Cuentas', isCorrect: false, icon: '❌', detail: 'No es posible ya que hay elementos desordenados que se bloquean entre sí.' }
      ]
    },
    pedagogicalExplanation: 'Este problema clásico de ciencias computacionales se llama Longest Increasing Subsequence (LIS), resuelto eficientemente con Programación Dinámica.',
    classroomActivity: 'Fila de Cartas Creciente: Repartir 10 cartas numéricas boca arriba en una fila; los alumnos deben encontrar la cadena más larga que crezca de izquierda a derecha.',
    hints: ['Si tomas el 5 al principio, ya no podrás usar el 1, 2, 3 ni 4.', 'Prueba armando la pulsera empezando con el número 1.']
  },

  // ==========================================================================
  // NIVEL 4: FASE 6 (1º A 3º DE SECUNDARIA) - MAESTROS DE ALGORITMIA (10 RETOS)
  // ==========================================================================
  {
    id: 'log-f6-01',
    templateType: 'logic_math',
    title: '31. Tobogán Cambiante (Circuitos Biestables Flip-Flop)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Modela el almacenamiento de estado en compuertas conmutadoras que cambian de dirección tras cada evento.',
    problemLore: 'Un tobogán acuático tiene cruces con interruptores que cambian de dirección (izquierda <-> derecha) cada vez que pasa un castor. El primer castor salió por B y el segundo por C. ¿Por cuál salida (A, B, C, D) saldrá el cuarto castor (Dan)?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Modela sistemas secuenciales y compuertas biestables (Flip-Flops) mediante máquinas de estado finito.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Arquitecto de Flip-Flops', icon: '🎛️', description: '¡Comprendiste los circuitos biestables que guardan bits en memoria RAM!' },
    gamificationSettings: { timeLimitSeconds: 75, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'state_automaton',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { switchTop: 'left', switchRight: 'right', switchLeft: 'right' },
      targetState: { danExit: 'D' },
      options: [
        { id: 'opt-d', label: 'Salida D', isCorrect: true, icon: '🚪', detail: 'El 3º castor cambia el cruce superior hacia la derecha y Dan se enruta hacia la salida D.' },
        { id: 'opt-a', label: 'Salida A', isCorrect: false, icon: '❌', detail: 'Por A sale el tercer castor.' },
        { id: 'opt-b', label: 'Salida B', isCorrect: false, icon: '❌', detail: 'Por B salió el primer castor.' },
        { id: 'opt-c', label: 'Salida C', isCorrect: false, icon: '❌', detail: 'Por C salió el segundo castor.' }
      ]
    },
    pedagogicalExplanation: 'Los interruptores que conmutan y recuerdan su estado previo se llaman Flip-Flops (biestables). Millones de estos circuitos conforman los registros de memoria SRAM y la lógica digital.',
    classroomActivity: 'El Circuito de Relevos: Simular una pista de relevos donde cada corredor gira un cartel indicador de flecha al pasar, alterando la ruta del compañero.',
    hints: ['Rastrea cómo quedaron los 3 cruces después de que salió el segundo castor.', 'Deduce por dónde bajará el tercer castor y cómo dejará los cruces listos para Dan.']
  },
  {
    id: 'log-f6-02',
    templateType: 'logic_math',
    title: '32. Razonamiento Espacial (Matrices y Transformaciones 2D)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Evalúa la composición no conmutativa de transformaciones matriciales (Rotación 90° y Reflexión Horizontal).',
    problemLore: 'Xavier programa un motor gráfico usando dos operaciones: (R) Rotación 90° a la derecha y (E) Espejo horizontal. Quiere transformar un personaje a una orientación final. ¿Cuál de las secuencias de operaciones NO produce el resultado deseado?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Analiza la no conmutatividad de transformaciones geométricas y composiciones matriciales.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Master de Matrices Gráficas', icon: '📐', description: '¡Demostraste que el orden de las transformaciones altera el resultado!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'patterns',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { angle: 0, mirrored: false },
      targetState: { invalidSequence: 'Opción D (R E)' },
      options: [
        { id: 'opt-d', label: 'D) R E (Primero Rotar y luego Espejo)', isCorrect: true, icon: '🚫', detail: 'R E deja al personaje mirando en sentido opuesto al objetivo deseado (R E != E R).' },
        { id: 'opt-a', label: 'A) R R R E', isCorrect: false, icon: '✅', detail: 'Sí produce la orientación final correcta.' },
        { id: 'opt-b', label: 'B) E R', isCorrect: false, icon: '✅', detail: 'Sí produce el resultado deseado.' },
        { id: 'opt-c', label: 'C) E R E R E R', isCorrect: false, icon: '✅', detail: 'Equivale algebraicamente a la transformación requerida.' }
      ]
    },
    pedagogicalExplanation: 'En gráficos por computadora y álgebra lineal, la multiplicación de matrices de transformación no es conmutativa (A × B ≠ B × A). El orden de las operaciones modifica el objeto final.',
    classroomActivity: 'El Robot de Papel: Dibujar una letra "F" asimétrica en una hoja y ejecutar en orden físico las instrucciones: Rotar, Espejo, Rotar.',
    hints: ['Prueba con una flecha en una hoja de papel qué pasa al hacer E -> R vs R -> E.', 'La pregunta te pide la opción que NO funciona.']
  },
  {
    id: 'log-f6-03',
    templateType: 'logic_math',
    title: '33. El Mensaje en la Red (Búsqueda en Amplitud BFS)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Calcula los días de propagación ola por ola en una red de 18 nodos conectados mediante BFS.',
    problemLore: 'En una isla hay 18 pueblos conectados por caminos. Cuando un pueblo recibe un mensaje, sus carteros lo entregan al día siguiente a todos sus vecinos directos. Si el mensaje inicia en el pueblo J, ¿cuántos días tarda en llegar a todos los pueblos?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Implementa algoritmos de recorrido en grafos para resolver problemas de difusión y distancia mínima.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Comandante de Redes', icon: '📡', description: '¡Simulaste la propagación por capas de Breadth-First Search!' },
    gamificationSettings: { timeLimitSeconds: 75, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'graphs_networks',
    simulationConfig: {
      engine: 'graph_explorer',
      initialState: { startNode: 'J', totalNodes: 18 },
      targetState: { maxDays: 4, lastNode: 'Q' },
      options: [
        { id: 'opt-4', label: '4 Días (El pueblo Q es el último en recibirlo en el día 4)', isCorrect: true, icon: '🌊', detail: 'Día 1: E, G, H, M -> Día 2: B, C, D, I, K, N, O, L -> Día 3: A, F, P, R -> Día 4: Q.' },
        { id: 'opt-3', label: '3 Días', isCorrect: false, icon: '❌', detail: 'Al día 3 el pueblo Q aún no ha recibido el mensaje.' },
        { id: 'opt-5', label: '5 Días', isCorrect: false, icon: '❌', detail: 'No toma 5 días ya que Q se conecta en el 4º salto.' }
      ]
    },
    pedagogicalExplanation: 'Breadth-First Search (BFS) explora un grafo capa por capa. Se utiliza para calcular sugerencias de amistad en redes sociales (grados de separación) y el relleno por inundación (Flood Fill).',
    classroomActivity: 'Grados de Separación: Dibujar una red de contactos entre alumnos en el pizarrón y contar cuántos saltos toma propagar una noticia de un extremo a otro.',
    hints: ['Anota los pueblos que reciben el mensaje en el Día 1 (vecinos directos de J).', 'Encuentra cuál es el pueblo más alejado (Q) y cuántos saltos requiere.']
  },
  {
    id: 'log-f6-04',
    templateType: 'logic_math',
    title: '34. Llantas en el Río Lento (Corrimiento de Memoria)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Calcula el costo computacional total de reacomodo de memoria al eliminar elementos intermedios de un arreglo contiguo.',
    problemLore: 'Ocho llantas [A, B, C, D, E, F, G, H] flotan en fila en un río lento. Al sacar una llanta, todas las que están detrás se desplazan un espacio hacia adelante. Si se sacan en orden B, G, E, D y H, ¿cuántos desplazamientos individuales ocurren en total?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Analiza la complejidad y operaciones de inserción/eliminación en estructuras de datos contiguas (Arrays).',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Arquitecto de Memoria', icon: '💾', description: '¡Comprendiste el costo de fragmentación y desplazamiento en memoria!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'queues_stacks',
    simulationConfig: {
      engine: 'step_automaton',
      initialState: { array: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] },
      targetState: { totalShifts: 11 },
      options: [
        { id: 'opt-11', label: '11 Desplazamientos (6 + 1 + 2 + 2 + 0 = 11)', isCorrect: true, icon: '🔢', detail: 'Al sacar B (6 detrás), luego G (1 detrás), luego E (2 detrás), luego D (2 detrás), luego H (0 detrás).' },
        { id: 'opt-8', label: '8 Desplazamientos', isCorrect: false, icon: '❌', detail: 'Cálculo incompleto de los elementos restantes en la cola.' },
        { id: 'opt-15', label: '15 Desplazamientos', isCorrect: false, icon: '❌', detail: 'Cuenta elementos ya eliminados.' }
      ]
    },
    pedagogicalExplanation: 'En lenguajes de programación, eliminar elementos al inicio o en medio de un Array contiguo obliga a la CPU a desplazar en memoria todos los elementos posteriores (O(N)).',
    classroomActivity: 'La Fila Compacta: Sentar 6 alumnos en sillas; al pedir que el alumno de en medio se levante, todos los de la derecha deben recorrerse una silla a la izquierda.',
    hints: ['Cuenta cuántas llantas quedan detrás de la que se retira en cada turno.', 'Suma los 5 valores: (tras B) + (tras G) + (tras E) + (tras D) + (tras H).']
  },
  {
    id: 'log-f6-05',
    templateType: 'logic_math',
    title: '35. Líneas de Decisión (Clasificadores Lineales en IA)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Determina la pertenencia categórica de un dato no etiquetado utilizando hiperplanos y fronteras de decisión lineal.',
    problemLore: 'En Machine Learning se busca una línea recta para separar dos clases de puntos (verdes y azules). Para un nuevo punto (?) no etiquetado, ¿en cuál de las configuraciones podemos garantizar con total certeza a qué grupo pertenece sin importar la pendiente de la frontera?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Modela métodos de clasificación supervisada y fronteras de decisión lineal en Inteligencia Artificial.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Ingeniero de Machine Learning', icon: '🤖', description: '¡Comprendiste las fronteras de decisión y clasificadores lineales!' },
    gamificationSettings: { timeLimitSeconds: 65, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'boolean_algebra',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { points: 'Distribución 2D de puntos de entrenamiento' },
      targetState: { safeClassification: 'Opción C' },
      options: [
        { id: 'opt-c', label: 'Opción C (El punto (?) está totalmente inmerso en el grupo inferior)', isCorrect: true, icon: '🎯', detail: 'Cualquier línea válida que separe ambos grupos dejará siempre al punto (?) del lado del grupo inferior.' },
        { id: 'opt-a', label: 'Opción A (El punto está en el pasillo central)', isCorrect: false, icon: '❌', detail: 'Una línea puede pasar a la izquierda o a la derecha del punto, generando ambigüedad.' },
        { id: 'opt-b', label: 'Opción B', isCorrect: false, icon: '❌', detail: 'El punto queda dentro de la zona de margen separable.' }
      ]
    },
    pedagogicalExplanation: 'Los clasificadores lineales (como Support Vector Machines o Perceptrones) buscan una frontera que separe clases de datos para predecir si un correo es Spam o No Spam.',
    classroomActivity: 'Fronteras de Cuerda: Dos grupos de objetos en el suelo; dos alumnos estiran una cuerda recta para separarlos y analizan si un objeto nuevo queda inequívocamente clasificado.',
    hints: ['Visualiza el "pasillo" vacío por donde puede pasar la línea recta divisoria.', 'Si el punto (?) está dentro del pasillo, no hay certeza. En la opción C está fuera del pasillo.']
  },
  {
    id: 'log-f6-06',
    templateType: 'logic_math',
    title: '36. Escritura Hibovu (Notación Postfija y Pilas Stack)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Decodifica y evalúa lenguajes formales estructurados en notación polaca inversa (Postfija) utilizando una pila de datos.',
    problemLore: 'En el idioma formal Hibovu cada figura es un sonido (Rectángulo = RAH, Círculo = OH, Triángulo = TEH) y la relación espacial es el operador final: CO si están sobrepuestos, DU si están en vertical. ¿Cómo se representa la expresión "TEH OH CO"?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Interpreta y traduce gramáticas formales y notaciones de evaluación en estructuras de tipo Pila (Stack).',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Compilador de Lenguajes', icon: '📜', description: '¡Evaluaste expresiones en Notación Polaca Inversa y Pilas LIFO!' },
    gamificationSettings: { timeLimitSeconds: 65, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'queues_stacks',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { vocab: { RAH: 'Rectángulo', OH: 'Círculo', TEH: 'Triángulo', CO: 'Sobrepuesto', DU: 'Vertical' } },
      targetState: { selected: 'Opción B (Triángulo enfrente de Círculo)' },
      options: [
        { id: 'opt-b', label: 'Opción B: Triángulo sobrepuesto delante del Círculo', isCorrect: true, icon: '📐⭕', detail: 'Primer dato TEH (Triángulo), segundo dato OH (Círculo), operador CO (Sobrepuesto).' },
        { id: 'opt-a', label: 'Opción A: Círculo delante del Triángulo (OH TEH CO)', isCorrect: false, icon: '❌', detail: 'Invierte el orden de los operandos en la pila.' },
        { id: 'opt-c', label: 'Opción C: Círculo arriba del Triángulo (OH TEH DU)', isCorrect: false, icon: '❌', detail: 'Usa el operador vertical DU en lugar de CO.' }
      ]
    },
    pedagogicalExplanation: 'Las calculadoras científicas y los procesadores usan Notación Polaca Inversa (Postfija: `5 3 + 2 *`) y una Pila (Stack) para evaluar operaciones sin necesidad de paréntesis.',
    classroomActivity: 'La Calculadora Humana con Pila: Escribir cadenas como `10 2 / 4 +` en el pizarrón y simular cómo la pila introduce números y aplica operadores.',
    hints: ['Identifica primero qué figura representa TEH (Triángulo) y cuál OH (Círculo).', 'El sufijo CO indica figuras encimadas / sobrepuestas.']
  },
  {
    id: 'log-f6-07',
    templateType: 'logic_math',
    title: '37. Velas de Adviento (Balanceo de Carga en Procesadores)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Resuelve un problema de partición equitativa y balanceo de carga en 5 núcleos de procesamiento a lo largo de 5 ciclos.',
    problemLore: 'Chris tiene 5 velas (A, B, C, D, E). En 5 domingos enciende 1, 2, 3, 4 y 5 velas respectivamente (15 encendidas en total). Quiere que al final todas las velas se hayan encendido exactamente el mismo número de veces (3 veces cada una). ¿Cómo debe planificar el encendido?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Modela algoritmos de balanceo de carga y partición equitativa en sistemas paralelos.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Maestro de Paralelismo', icon: '🕯️', description: '¡Equilibraste la carga de trabajo en procesadores multinúcleo!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'csp_scheduler',
    simulationConfig: {
      engine: 'sorter_tray',
      initialState: { sundays: [1, 2, 3, 4, 5], totalLights: 15, targetPerCandle: 3 },
      targetState: { solution: 'Estrategia de pares complementarios' },
      options: [
        { id: 'opt-pairs', label: 'Estrategia de Pares: D1(A) + D4(B,C,D,E) y D2(B,C) + D3(A,D,E) y D5(Todas)', isCorrect: true, icon: '🔥', detail: 'Cada vela se enciende exactamente 1 + 1 + 1 = 3 veces en los 5 domingos.' },
        { id: 'opt-rand', label: 'Encender siempre las velas A, B y C primero', isCorrect: false, icon: '❌', detail: 'Genera desgaste desigual (A se gastaría 5 veces y E solo 1).' }
      ]
    },
    pedagogicalExplanation: 'En supercomputadoras y servidores en la nube, el Balanceo de Carga (Load Balancing) reparte tareas entre múltiples núcleos de CPU para evitar sobrecalentamiento y cuellos de botella.',
    classroomActivity: 'Los Servidores del Aula: 6 alumnos mensajeros deben repartir paquetes en 4 rondas de modo que al final todos hayan hecho el mismo número de viajes.',
    hints: ['Total de encendidas: 1 + 2 + 3 + 4 + 5 = 15. Dividido entre 5 velas = 3 por vela.', 'Combina días complementarios: el día de 1 vela con el día de 4 velas para usar todas 1 vez.']
  },
  {
    id: 'log-f6-08',
    templateType: 'logic_math',
    title: '38. Árbol Genealógico (Recursión y Funciones Anidadas)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Modela la composición de funciones y llamadas recursivas de primer orden sobre estructuras arbóreas.',
    problemLore: 'En un árbol familiar, padre(x) y madre(x) son funciones que devuelven el progenitor de x. Si padre(madre(Annika)) = Emil, ¿cómo se expresa el mismo parentesco hacia Emil partiendo de Daniel: ___ ( ___ ( ___ ( Daniel ) ) )?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Modela la composición funcional, anidamiento de expresiones y recorrido de árboles jerárquicos.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Programador Funcional', icon: '🌳', description: '¡Dominaste la composición de funciones y árboles recursivos!' },
    gamificationSettings: { timeLimitSeconds: 70, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'state_automaton',
    simulationConfig: {
      engine: 'interactive_switches',
      initialState: { target: 'Emil (Bisabuelo de Daniel)' },
      targetState: { equation: 'padre( madre( madre( Daniel ) ) )' },
      options: [
        { id: 'opt-pmm', label: 'padre( madre( madre( Daniel ) ) )', isCorrect: true, icon: '🌲', detail: 'Madre de Daniel -> Abuela de Daniel -> Padre de la abuela = Emil.' },
        { id: 'opt-mmm', label: 'madre( madre( madre( Daniel ) ) )', isCorrect: false, icon: '❌', detail: 'Llega a la bisabuela Gerda, no al bisabuelo Emil.' },
        { id: 'opt-ppm', label: 'padre( padre( madre( Daniel ) ) )', isCorrect: false, icon: '❌', detail: 'Ruta incorrecta en el árbol genealógico.' }
      ]
    },
    pedagogicalExplanation: 'En programación funcional, las funciones anidadas `f(g(h(x)))` se evalúan de adentro hacia afuera, idéntico a cómo los sistemas de archivos navegan carpetas anidadas.',
    classroomActivity: 'Cajas Dentro de Cajas: Colocar 3 cajas anidadas con un premio y escribir la llamada de función `Abrir( Abrir( Abrir( CajaGrande ) ) )`.',
    hints: ['Comienza por el dato interior: ¿quién es madre(Daniel)?', 'Luego sube a la abuela y finalmente al bisabuelo Emil (hombre = función padre).']
  },
  {
    id: 'log-f6-09',
    templateType: 'logic_math',
    title: '39. Du-re y Asignación (Problema de Satisfacción CSP)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Resuelve un sistema de restricciones simultáneas de disponibilidad laboral con búsqueda y poda de candidatos.',
    problemLore: 'En la tradición Du-re se eligen 3 días de la semana para trabajo agrícola cooperativo: 1) Mínimo 4 personas por día, 2) Todos deben participar en al menos 1 día, 3) Nadie puede trabajar los 3 días elegidos. ¿Cuáles 3 días cumplen todas las restricciones?',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Implementa algoritmos de poda y satisfacción de restricciones complejas (CSP) en matrices booleanas.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Especialista en Logística CSP', icon: '📅', description: '¡Resolviste un sistema de restricciones con poda de soluciones!' },
    gamificationSettings: { timeLimitSeconds: 75, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'csp_scheduler',
    simulationConfig: {
      engine: 'grid_selector',
      initialState: { daysAvailable: { Lunes: 4, Martes: 4, Miercoles: 4, Jueves: 2, Viernes: 3, Sabado: 4, Domingo: 2 } },
      targetState: { selectedDays: ['Lunes', 'Martes', 'Sábado'] },
      options: [
        { id: 'opt-lms', label: 'Lunes, Martes y Sábado', isCorrect: true, icon: '🗓️', detail: 'Cumple las 3 reglas: Eunwoo solo puede lunes, Chaewon martes, y el sábado evita que Boa trabaje 3 días.' },
        { id: 'opt-lmm', label: 'Lunes, Martes y Miércoles', isCorrect: false, icon: '❌', detail: 'Obliga a Boa a trabajar los 3 días, rompiendo la regla 3.' },
        { id: 'opt-jvd', label: 'Jueves, Viernes y Domingo', isCorrect: false, icon: '❌', detail: 'Tienen menos de 4 personas disponibles.' }
      ]
    },
    pedagogicalExplanation: 'En logística aeroportuaria y asignación de horarios escolares, los algoritmos CSP prueban combinaciones y podan ramas inválidas para encontrar soluciones viables.',
    classroomActivity: 'El Organizador de Torneos: Asignar 6 jugadores a 3 consolas con reglas de exclusión y disponibilidad sin que nadie quede sin jugar.',
    hints: ['Descarta primero los días que tienen menos de 4 personas disponibles (Jueves, Viernes, Domingo).', 'Revisa la regla 3: si eliges Miércoles, Boa tendría que trabajar 3 días seguidos.']
  },
  {
    id: 'log-f6-10',
    templateType: 'logic_math',
    title: '40. Figuras Booleanas CAD (Geometría Constructiva CSG)',
    level: 'secundaria',
    faseNem: 'Fase 6',
    levelLabel: '1º a 3º Secundaria (Fase 6)',
    targetAge: '12-15 años',
    description: 'Construye formas geométricas complejas en 2D/3D combinando primitivas con operaciones booleanas AND, OR y NOT.',
    problemLore: 'En software de diseño CAD se crean figuras combinando primitivas: Unión (OR), Intersección (AND) y Resta (NOT). Combina un cuadrado, un triángulo y dos círculos con las operaciones correspondientes para generar la figura deseada.',
    pdaNem: 'Fase 6 - Saberes y Pensamiento Científico: Modela geometría constructiva de sólidos (CSG) utilizando álgebra booleana de conjuntos.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Modelador CAD', icon: '🔷', description: '¡Dominaste la Geometría Constructiva de Sólidos con álgebra booleana!' },
    gamificationSettings: { timeLimitSeconds: 75, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 40 },
    logicType: 'boolean_algebra',
    simulationConfig: {
      engine: 'circuit_gates',
      initialState: { primitives: ['Cuadrado (A)', 'Triángulo (B)', 'Círculo Interior (C)', 'Círculo Exterior (D)'] },
      targetState: { order: ['Cuadrado', 'Triángulo', 'Círculo C', 'Círculo D'] },
      options: [
        { id: 'opt-cad', label: '(Cuadrado OR Triángulo) NOT Círculo C AND Círculo D', isCorrect: true, icon: '📐', detail: 'Une las bases rectas, resta el hueco circular interior y acota con el círculo exterior.' },
        { id: 'opt-err', label: '(Cuadrado AND Triángulo) OR Círculos', isCorrect: false, icon: '❌', detail: 'La intersección inicial produce un área vacía.' }
      ]
    },
    pedagogicalExplanation: 'Los programas de modelado 3D, arquitectura e impresión 3D usan CSG (Constructive Solid Geometry) combinando cubos y esferas mediante operaciones booleanas.',
    classroomActivity: 'Modelado en Papel con Booleano: Recortar círculos y rectángulos en cartulinas de colores y encimarlos (OR) o recortarles partes (NOT) para crear logotipos.',
    hints: ['Las líneas rectas de la figura provienen del cuadrado y el triángulo unidos por OR.', 'La curvatura blanca es una resta (NOT) con un círculo.']
  }
];

/**
 * Función auxiliar para convertir los retos de Lógica Matemática en CommunityActivity compatibles con ISkool
 */
export function getMathematicalLogicCommunityActivities(): CommunityActivity[] {
  return MATHEMATICAL_LOGIC_ACTIVITIES.map((activity, index) => {
    return {
      id: `comm-logic-${activity.id}`,
      teacher_id: 'usr-pedagogical-system',
      teacher_name: 'Comité de Pensamiento Computacional ISkool',
      title: activity.title,
      template_type: 'logic_math',
      upvotes: 45 + (index * 3) + ((index % 5) * 7),
      created_at: new Date(Date.now() - (index * 3600000 * 12)).toISOString(),
      content_json: {
        title: activity.title,
        description: activity.description,
        subject: 'Pensamiento Computacional & Lógica',
        targetAge: activity.targetAge,
        campoFormativo: activity.campoFormativo,
        faseNem: activity.faseNem,
        pdaNem: activity.pdaNem,
        badgeReward: activity.badgeReward,
        gamificationSettings: activity.gamificationSettings,
        logicChallengeData: {
          problemLore: activity.problemLore,
          logicType: activity.logicType,
          simulationConfig: activity.simulationConfig,
          pedagogicalExplanation: activity.pedagogicalExplanation,
          classroomActivity: activity.classroomActivity,
          hints: activity.hints
        }
      } as unknown as CanvasActivityJSON
    };
  });
}
