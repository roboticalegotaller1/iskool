export interface SimulatorItem {
  id: string;
  name: string;
  organization: string;
  category: 'physics' | 'math' | 'chemistry' | 'biology' | 'robotics' | 'humanities';
  categoryLabel: string;
  description: string;
  embedUrl: string;
  pedagogicalTip: string;
  recommendedGrades: string;
  tags: string[];
}

export const SIMULATORS_DIRECTORY: SimulatorItem[] = [
  // ================= 1. FÍSICA Y MECÁNICA (10) =================
  {
    id: 'phet-forces',
    name: 'PhET: Fuerzas y Movimiento Básico',
    organization: 'University of Colorado Boulder',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Simula planos inclinados, fricción, fuerzas netas y vectores de aceleración con objetos interactivos.',
    embedUrl: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html',
    pedagogicalTip: 'Pide a los alumnos aplicar 100 N de fuerza sobre una caja de 50 kg y registrar cómo varía la velocidad con y sin fricción.',
    recommendedGrades: 'Primaria Alta y Secundaria',
    tags: ['Leyes de Newton', 'Fricción', 'Vectores', 'Fuerza Neta']
  },
  {
    id: 'phet-energy-skate',
    name: 'PhET: Parque de Energía para Patinaje',
    organization: 'University of Colorado Boulder',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Explora la conservación de la energía mecánica, energía cinética, potencial gravitatoria y térmica en pistas de skate.',
    embedUrl: 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_es.html',
    pedagogicalTip: 'Permite diseñar bucles y analizar gráficos de barras de energía cinética vs potencial en tiempo real.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Energía Cinética', 'Energía Potencial', 'Conservación de Energía']
  },
  {
    id: 'walter-fendt-optics',
    name: 'Walter Fendt: Refracción y Reflexión de la Luz',
    organization: 'Walter Fendt Applets',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Demostración geométrica de la Ley de Snell, ángulo crítico y reflexión total interna en prismas.',
    embedUrl: 'https://www.walter-fendt.de/html5/phes/refraction_es.htm',
    pedagogicalTip: 'Cambia los índices de refracción n1 y n2 para observar el ángulo de refracción.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Óptica', 'Ley de Snell', 'Refracción', 'Luz']
  },
  {
    id: 'ophysics-kinematics',
    name: 'oPhysics: Cinemática y Movimiento en 1D/2D',
    organization: 'oPhysics Simulations',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Gráficas de posición, velocidad y aceleración vs tiempo en movimiento rectilíneo y tiro parabólico.',
    embedUrl: 'https://www.ophysics.com/k1.html',
    pedagogicalTip: 'Compara trayectorias balísticas modificando el ángulo de disparo inicial.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Tiro Parabólico', 'Cinemática', 'Velocidad', 'Aceleración']
  },
  {
    id: 'falstad-circuit',
    name: 'Falstad: Simulador de Circuitos Eléctricos',
    organization: 'Falstad Web Tools',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Simulador en tiempo real con osciloscopio animado para circuitos en serie, paralelo, capacitores y transistores.',
    embedUrl: 'https://www.falstad.com/circuit/',
    pedagogicalTip: 'Construye un puente de diodos o analiza la Ley de Ohm cambiando voltajes y resistencias.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Circuitos', 'Ley de Ohm', 'Electrónica', 'Resistencias']
  },
  {
    id: 'myphysicslab-springs',
    name: 'MyPhysicsLab: Oscilaciones y Péndulos Acoplados',
    organization: 'MyPhysicsLab',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Simulaciones numéricas precisas de osciladores armónicos, amortiguamiento y caos en péndulos dobles.',
    embedUrl: 'https://www.myphysicslab.com/pendulum/double-pendulum-en.html',
    pedagogicalTip: 'Demuestra cómo una pequeña variación inicial produce trayectorias totalmente divergentes (Efecto Mariposa).',
    recommendedGrades: 'Preparatoria',
    tags: ['Oscilaciones', 'Péndulo Doble', 'Caos', 'Energía']
  },
  {
    id: 'physics-classroom-interactives',
    name: 'The Physics Classroom: Construcción de Vectores',
    organization: 'The Physics Classroom',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Herramienta interactiva para sumar vectores con método gráfico y analítico componente por componente.',
    embedUrl: 'https://www.physicsclassroom.com/Physics-Interactives/Vectors-and-Projectiles/Vector-Addition/Vector-Addition-Interactive',
    pedagogicalTip: 'Excelente para ejercicios de descomposición de fuerzas en ejes X e Y.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Vectores', 'Trigonometría', 'Fuerzas Resultantes']
  },
  {
    id: 'falstad-ripple-waves',
    name: 'Falstad: Tanque de Ondas e Interferencia 3D',
    organization: 'Falstad Web Tools',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Simula fuentes de ondas acústicas y ópticas con interferencia constructiva, destructiva y difracción.',
    embedUrl: 'https://www.falstad.com/ripple/',
    pedagogicalTip: 'Coloca dos fuentes sincronizadas para visualizar el patrón de franjas de Young.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Ondas', 'Interferencia', 'Acústica', 'Efecto Doppler']
  },
  {
    id: 'phet-circuit-construction',
    name: 'PhET: Kit de Construcción de Circuitos DC',
    organization: 'University of Colorado Boulder',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Construye circuitos con baterías, bombillas, interruptores y amperímetros con electrones animados.',
    embedUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_es.html',
    pedagogicalTip: 'Comprueba por qué una bombilla brilla menos en serie que en paralelo con el mismo voltaje.',
    recommendedGrades: 'Primaria, Secundaria y Prepa',
    tags: ['Electricidad', 'Circuitos DC', 'Corriente', 'Voltaje']
  },
  {
    id: 'labxchange-gravity',
    name: 'LabXchange: Caída Libre y Gravedad Terrestre',
    organization: 'Harvard University / LabXchange',
    category: 'physics',
    categoryLabel: 'Física y Mecánica',
    description: 'Laboratorio virtual para medir la aceleración de la gravedad g = 9.8 m/s² eliminando la resistencia del aire.',
    embedUrl: 'https://www.labxchange.org/',
    pedagogicalTip: 'Compara la caída simultánea de una pluma y una bola de metal en el vacío.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Caída Libre', 'Gravedad', 'Experimento de Galileo']
  },

  // ================= 2. MATEMÁTICAS, ÁLGEBRA Y GEOMETRÍA (10) =================
  {
    id: 'geogebra-classic',
    name: 'GeoGebra Clásico: Geometría & Álgebra',
    organization: 'GeoGebra / International GeoGebra Institute',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Construcciones geométricas interactivas, cálculo de derivadas, integrales y representación de funciones.',
    embedUrl: 'https://www.geogebra.org/calculator',
    pedagogicalTip: 'Crea deslizadores paramétricos para mostrar cómo cambia la parábola y = a(x - h)² + k.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Geometría', 'Álgebra', 'Funciones', 'Cálculo']
  },
  {
    id: 'desmos-graphing',
    name: 'Desmos: Calculadora Gráfica Interactiva',
    organization: 'Desmos Studio',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Graficador rápido de polinomios, funciones trigonométricas, sistemas de ecuaciones lineales y regresiones.',
    embedUrl: 'https://www.desmos.com/calculator',
    pedagogicalTip: 'Usa tablas de valores y animaciones de variables para graficar familias de curvas.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Graficación', 'Polinomios', 'Trigonometría', 'Estadística']
  },
  {
    id: 'mathigon-polypad',
    name: 'Mathigon Polypad: Manipulativos Matemáticos',
    organization: 'Mathigon / Amplify',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Mural interactivo con bloques algebraicos, fracciones circulares, mosaicos poligonales y ruletas de probabilidad.',
    embedUrl: 'https://mathigon.org/polypad',
    pedagogicalTip: 'Ideal para visualizar fracciones equivalentes y área de polígonos irregulares en primaria y secundaria.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Fracciones', 'Mosaicos', 'Geometría', 'Probabilidad']
  },
  {
    id: 'graspable-math',
    name: 'Graspable Math: Álgebra Táctil y Manipulativa',
    organization: 'Graspable Inc.',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Transforma ecuaciones algebraicas arrastrando términos para aplicar operaciones inversas paso a paso.',
    embedUrl: 'https://graspablemath.com/',
    pedagogicalTip: 'Ayuda a los alumnos que confunden signos al transponer términos en ecuaciones de primer grado.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Ecuaciones', 'Despejes', 'Álgebra', 'Paso a Paso']
  },
  {
    id: 'visualgo-algorithms',
    name: 'VisuAlgo: Estructuras de Datos y Grafos',
    organization: 'National University of Singapore',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Animación visual paso a paso de algoritmos de ordenamiento (QuickSort, MergeSort), árboles binarios y caminos mínimos.',
    embedUrl: 'https://visualgo.net/es',
    pedagogicalTip: 'Perfecto para pensamiento algorítmico y materias de computación matemática.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Algoritmos', 'Ordenamiento', 'Grafos', 'Lógica']
  },
  {
    id: 'wolfram-fractals',
    name: 'Wolfram Demonstrations: Fractales & Geometría Fractal',
    organization: 'Wolfram Research',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Simulador del Conjunto de Mandelbrot, Triángulo de Sierpinski y geometría no euclidiana.',
    embedUrl: 'https://demonstrations.wolfram.com/',
    pedagogicalTip: 'Muestra a los alumnos cómo una regla iterativa simple genera patrones de complejidad infinita.',
    recommendedGrades: 'Preparatoria',
    tags: ['Fractales', 'Recursión', 'Complejidad', 'Geometría']
  },
  {
    id: 'nctm-illuminations',
    name: 'NCTM Illuminations: Explorador de Fracciones',
    organization: 'National Council of Teachers of Mathematics',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Modelos visuales de barras y sectores circulares para suma, resta y multiplicación de números racionales.',
    embedUrl: 'https://illuminations.nctm.org/',
    pedagogicalTip: 'Compara números mixtos y fracciones impropias visualmente.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Fracciones', 'Aritmética', 'Racionales']
  },
  {
    id: 'toytheater-clock',
    name: 'Toy Theater: Reloj y Tiempo Didáctico',
    organization: 'Toy Theater Learning Tools',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Reloj analógico interactivo con manecillas ajustables para aprender lectura de horas, minutos y conversión a formato digital.',
    embedUrl: 'https://toytheater.com/clock/',
    pedagogicalTip: 'Ideal para los primeros grados de primaria en lectura de horarios y tiempo transcurrido.',
    recommendedGrades: 'Primaria Baja',
    tags: ['Reloj Didáctico', 'Horarios', 'Primaria', 'Medición']
  },
  {
    id: 'mathopenref-constructions',
    name: 'Math Open Reference: Construcciones Euclidianas',
    organization: 'Math Open Reference Project',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Simulador animado de compás y regla para bisectrices, mediatrices y triángulos equiláteros.',
    embedUrl: 'https://www.mathopenref.com/',
    pedagogicalTip: 'Instrucción paso a paso sobre cómo trazar la mediatriz de un segmento con precisión matemática.',
    recommendedGrades: 'Secundaria',
    tags: ['Regla y Compás', 'Bisectriz', 'Construcciones']
  },
  {
    id: 'geogebra-pythagoras',
    name: 'GeoGebra: Demostración Visual del Teorema de Pitágoras',
    organization: 'GeoGebra Community',
    category: 'math',
    categoryLabel: 'Matemáticas y Geometría',
    description: 'Rompecabezas geométrico de áreas cuadradas que demuestra que a² + b² = c².',
    embedUrl: 'https://www.geogebra.org/m/e8d5qzgk',
    pedagogicalTip: 'Los alumnos reordenan las piezas de los cuadrados pequeños para llenar exactamente el cuadrado de la hipotenusa.',
    recommendedGrades: 'Secundaria',
    tags: ['Teorema de Pitágoras', 'Áreas', 'Triángulos Rectángulos']
  },

  // ================= 3. QUÍMICA Y ESTRUCTURA MOLECULAR (8) =================
  {
    id: 'molview-3d',
    name: 'MolView: Modelador Molecular 3D',
    organization: 'MolView Project (Herman Bergwerf)',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Dibuja estructuras de Lewis en 2D y el motor las convierte instantáneamente en modelos tridimensionales interactivos.',
    embedUrl: 'https://molview.org/',
    pedagogicalTip: 'Pide a los alumnos construir la molécula del agua (H₂O) y medir el ángulo de enlace de 104.5°.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Moléculas 3D', 'Estructuras de Lewis', 'Geometría Molecular']
  },
  {
    id: 'ptable-interactive',
    name: 'Ptable: Tabla Periódica Dinámica',
    organization: 'Michael Dayah / Ptable.com',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Tabla periódica con control de temperatura, configuraciones electrónicas en orbitales y propiedades periódicas.',
    embedUrl: 'https://ptable.com/?lang=es',
    pedagogicalTip: 'Aumenta la barra de temperatura a 1000 K para ver qué elementos cambian de sólido a líquido o gas.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Tabla Periódica', 'Elementos', 'Orbitales', 'Estados de Materia']
  },
  {
    id: 'phet-reactants-products',
    name: 'PhET: Reactivos, Productos y Sobrantes',
    organization: 'University of Colorado Boulder',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Conceptos de estequiometría y reactivo limitante utilizando analogías de sándwiches y síntesis de agua.',
    embedUrl: 'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_es.html',
    pedagogicalTip: 'Excelente para eliminar la dificultad de comprender qué sobra en una reacción química.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Estequiometría', 'Reactivo Limitante', 'Reacciones Químicas']
  },
  {
    id: 'chemcollective-vlab',
    name: 'ChemCollective: Laboratorio Virtual de Titulaciones',
    organization: 'Carnegie Mellon University',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Maneja matraces, buretas, pipetas y reactivos químicos con cálculo de pH en tiempo real.',
    embedUrl: 'http://chemcollective.org/vlabs',
    pedagogicalTip: 'Realiza una titulación ácido fuerte - base fuerte y observa la curva de neutralización.',
    recommendedGrades: 'Preparatoria',
    tags: ['Titulaciones', 'Ácido-Base', 'pH', 'Laboratorio Virtual']
  },
  {
    id: 'rsc-periodic-table',
    name: 'Royal Society of Chemistry: Tabla Interactiva',
    organization: 'Royal Society of Chemistry (RSC)',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Historia de los descubrimientos, usos en la vida real, abundancia en la corteza terrestre y toxicidad.',
    embedUrl: 'https://www.rsc.org/periodic-table',
    pedagogicalTip: 'Asigna a cada alumno un elemento químico para investigar su aplicación en la tecnología moderna.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Historia de Elementos', 'Química Aplicada', 'Sostenibilidad']
  },
  {
    id: 'pubchem-3d',
    name: 'PubChem: Explorador Tridimensional NIH',
    organization: 'National Institutes of Health (NIH)',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Visualizador de más de 100 millones de compuestos orgánicos e inorgánicos con propiedades farmacológicas.',
    embedUrl: 'https://pubchem.ncbi.nlm.nih.gov/',
    pedagogicalTip: 'Busca la molécula de la cafeína o la aspirina y rota su conformación en el espacio.',
    recommendedGrades: 'Preparatoria',
    tags: ['Farmacología', 'Química Orgánica', 'Compuestos']
  },
  {
    id: 'rcsb-pdb-molstar',
    name: 'RCSB PDB: Visor Mol* de Macromoléculas',
    organization: 'Protein Data Bank',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Estructuras 3D de proteínas, enzimas, ribosomas y la doble hélice del ADN a nivel atómico.',
    embedUrl: 'https://www.rcsb.org/',
    pedagogicalTip: 'Examina la estructura de la hemoglobina y localiza los 4 grupos hemo con átomos de hierro.',
    recommendedGrades: 'Preparatoria',
    tags: ['Proteínas', 'ADN', 'Bioquímica', 'Enzimas']
  },
  {
    id: 'phet-ph-scale',
    name: 'PhET: Escala de pH y Concentración',
    organization: 'University of Colorado Boulder',
    category: 'chemistry',
    categoryLabel: 'Química y Moléculas',
    description: 'Mide el pH de sustancias cotidianas (café, sangre, jabón, jugo gástrico) y observa el efecto de dilución con agua.',
    embedUrl: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_es.html',
    pedagogicalTip: 'Pide a los alumnos predecir si agregar agua a un ácido fuerte cambia el pH hacia 7.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Escala de pH', 'Ácidos y Bases', 'Soluciones', 'Dilución']
  },

  // ================= 4. BIOLOGÍA, MEDICINA Y ASTRONOMÍA (8) =================
  {
    id: 'biodigital-human',
    name: 'BioDigital Human: Anatomía Humana 3D',
    organization: 'BioDigital Inc.',
    category: 'biology',
    categoryLabel: 'Biología y Salud',
    description: 'Exploración interactiva por capas de los sistemas muscular, esquelético, cardiovascular y respiratorio.',
    embedUrl: 'https://human.biodigital.com/',
    pedagogicalTip: 'Aísla el corazón humano para observar la sístole y diástole con flujo sanguíneo en 3D.',
    recommendedGrades: 'Primaria, Secundaria y Prepa',
    tags: ['Anatomía', 'Cuerpo Humano', 'Corazón', 'Salud']
  },
  {
    id: 'learn-genetics-dna',
    name: 'Learn.Genetics: Extracción Virtual de ADN',
    organization: 'University of Utah',
    category: 'biology',
    categoryLabel: 'Biología y Salud',
    description: 'Procedimiento paso a paso para lisar células, precipitar proteínas y aislar hebras de ADN con etanol.',
    embedUrl: 'https://learn.genetics.utah.edu/',
    pedagogicalTip: 'Guía la práctica virtual previa antes de realizar la extracción de ADN de fresas en el laboratorio escolar.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Genética', 'ADN', 'Biotecnología', 'Célula']
  },
  {
    id: 'stellarium-web',
    name: 'Stellarium Web: Planetario Astronómico en Vivo',
    organization: 'Stellarium Observatory Project',
    category: 'biology',
    categoryLabel: 'Astronomía y Tierra',
    description: 'Muestra el cielo nocturno en tiempo real para cualquier coordenada del planeta, satélites y constelaciones.',
    embedUrl: 'https://stellarium-web.org/',
    pedagogicalTip: 'Configura la ubicación en CDMX y busca la posición de Marte, Júpiter y la Estación Espacial Internacional.',
    recommendedGrades: 'Todas las edades',
    tags: ['Astronomía', 'Constelaciones', 'Planetas', 'Cielo Nocturno']
  },
  {
    id: 'solar-system-scope',
    name: 'Solar System Scope: Modelo 3D del Sistema Solar',
    organization: 'INO Games Space Tools',
    category: 'biology',
    categoryLabel: 'Astronomía y Tierra',
    description: 'Modelo heliocéntrico 3D con velocidades orbitales relativas reales, lunas y misiones espaciales históricas.',
    embedUrl: 'https://www.solarsystemscope.com/',
    pedagogicalTip: 'Compara el tamaño y la distancia entre los planetas rocosos y los gigantes gaseosos.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Sistema Solar', 'Órbitas', 'Planetas', 'Espacio']
  },
  {
    id: 'hhmi-biointeractive',
    name: 'HHMI BioInteractive: Selección Natural y Evolución',
    organization: 'Howard Hughes Medical Institute',
    category: 'biology',
    categoryLabel: 'Biología y Salud',
    description: 'Simulaciones poblacionales de mutaciones, camuflaje y supervivencia del más apto con pinzones y ratones de bolsillo.',
    embedUrl: 'https://www.biointeractive.org/',
    pedagogicalTip: 'Modifica el color del terreno de claro a oscuro y observa el cambio en las frecuencias alélicas tras 50 generaciones.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Evolución', 'Selección Natural', 'Genética de Poblaciones']
  },
  {
    id: 'earth-nullschool',
    name: 'Earth Nullschool: Clima y Vientos Globales en Vivo',
    organization: 'Cameron Beccario Project',
    category: 'biology',
    categoryLabel: 'Astronomía y Tierra',
    description: 'Mapa interactivo con datos meteorológicos satelitales en tiempo real de huracanes, corrientes oceánicas y niveles de CO₂.',
    embedUrl: 'https://earth.nullschool.net/',
    pedagogicalTip: 'Localiza ciclones activos en el Golfo de México y rastrea la Corriente del Golfo hacia Europa.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Meteorología', 'Corrientes Marinas', 'Huracanes', 'Clima Global']
  },
  {
    id: 'nasa-eyes-space',
    name: 'NASA Eyes on the Solar System',
    organization: 'NASA Jet Propulsion Laboratory',
    category: 'biology',
    categoryLabel: 'Astronomía y Tierra',
    description: 'Trayectorias de sondas espaciales de la NASA (Voyager, James Webb, Perseverance en Marte) en tiempo real.',
    embedUrl: 'https://eyes.nasa.gov/',
    pedagogicalTip: 'Sigue el viaje de la sonda New Horizons al pasar cerca de Plutón.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['NASA', 'Exploración Espacial', 'Marte', 'Satélites']
  },
  {
    id: 'phet-natural-selection',
    name: 'PhET: Selección Natural y Conejos',
    organization: 'University of Colorado Boulder',
    category: 'biology',
    categoryLabel: 'Biología y Salud',
    description: 'Simula el crecimiento poblacional de conejos con mutaciones de pelaje, colmillos y presión de depredadores (lobos).',
    embedUrl: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_es.html',
    pedagogicalTip: 'Comprueba qué pelaje predomina cuando el entorno cambia al Polo Ártico.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Selección Natural', 'Adaptación', 'Depredación', 'Ecosistemas']
  },

  // ================= 5. ROBÓTICA, ELECTRÓNICA Y PROGRAMACIÓN (8) =================
  {
    id: 'tinkercad-circuits',
    name: 'Autodesk Tinkercad: Simulador de Arduino & Circuitos',
    organization: 'Autodesk Education',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Conecta servomotores, sensores ultrasónicos, LEDs y programa placas Arduino UNO con bloques o código C++.',
    embedUrl: 'https://www.tinkercad.com/circuits',
    pedagogicalTip: 'Programa un semáforo inteligente con temporizadores sin requerir comprar componentes físicos.',
    recommendedGrades: 'Primaria Alta, Secundaria y Prepa',
    tags: ['Arduino', 'Robótica', 'Sensores', 'Microcontroladores']
  },
  {
    id: 'wokwi-embedded',
    name: 'Wokwi: Simulador ESP32 & Raspberry Pi Pico',
    organization: 'Wokwi Systems',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Simulador en la nube para proyectos IoT con Wi-Fi simulado, pantallas OLED y sensores DHT22 en MicroPython y C++.',
    embedUrl: 'https://wokwi.com/',
    pedagogicalTip: 'Ideal para proyectos de estación meteorológica escolar conectada a la nube.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['ESP32', 'Raspberry Pi', 'MicroPython', 'IoT']
  },
  {
    id: 'makecode-microbit',
    name: 'Microsoft MakeCode: Micro:bit Virtual',
    organization: 'Microsoft / Micro:bit Foundation',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Entorno de bloques y simulador de la matriz de 25 LEDs, brújula, acelerómetro y pines GPIO de Micro:bit.',
    embedUrl: 'https://makecode.microbit.org/',
    pedagogicalTip: 'Crea un dado digital que genera un número aleatorio al agitar la placa.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Microbit', 'Bloques', 'Programación', 'Acelerómetro']
  },
  {
    id: 'makecode-arcade',
    name: 'Microsoft MakeCode Arcade: Videojuegos Retro',
    organization: 'Microsoft Education',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Crea videojuegos de plataformas, laberintos y físicas 2D con sprites retro pixel art.',
    embedUrl: 'https://arcade.makecode.com/',
    pedagogicalTip: 'Enseña lógica de colisiones, contadores de puntuación y bucles de juego.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Videojuegos', 'Pixel Art', 'Lógica', 'Sprites']
  },
  {
    id: 'scratch-mit',
    name: 'Scratch Embed: Historias & Animaciones MIT',
    organization: 'MIT Media Lab',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Incrusta proyectos interactivos, simuladores y juegos creados por la comunidad educativa de Scratch.',
    embedUrl: 'https://scratch.mit.edu/',
    pedagogicalTip: 'Integra proyectos de ciencias creados por tus propios alumnos directamente en la lección de ISkool.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Scratch', 'MIT', 'Animación', 'Creatividad Digital']
  },
  {
    id: 'circuitverse-logic',
    name: 'CircuitVerse: Simulador de Lógica Digital',
    organization: 'CircuitVerse Open Source',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Diseña circuitos lógicos con compuertas AND, OR, NOT, multiplexores, sumadores y displays de 7 segmentos.',
    embedUrl: 'https://circuitverse.org/simulator',
    pedagogicalTip: 'Demuestra cómo se construye un sumador binario de 4 bits a partir de compuertas básicas.',
    recommendedGrades: 'Preparatoria',
    tags: ['Compuertas Lógicas', 'Álgebra Booleana', 'Binario', 'Electrónica']
  },
  {
    id: 'snap-berkeley',
    name: 'Snap!: Programación Visual Avanzada',
    organization: 'UC Berkeley / SAP',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Extensión de bloques con funciones de orden superior, estructuras de datos anidadas y conexión con IA.',
    embedUrl: 'https://snap.berkeley.edu/',
    pedagogicalTip: 'Excelente para proyectos de ciencias de la computación universitaria y media superior.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Snap', 'Ciencias Computacionales', 'Funciones', 'IA']
  },
  {
    id: 'trinket-python',
    name: 'Trinket.io: Python & Turtle Gráficos',
    organization: 'Trinket Interactive Tools',
    category: 'robotics',
    categoryLabel: 'Robótica y Código',
    description: 'Ejecuta scripts interactivos de Python con librerías gráficas Turtle y Matplotlib sin instalar nada.',
    embedUrl: 'https://trinket.io/python',
    pedagogicalTip: 'Programa fractales o figuras geométricas usando bucles for y giros angulares en Python.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Python', 'Turtle Graphics', 'Programación Textual']
  },

  // ================= 6. GEOGRAFÍA, HISTORIA, MÚSICA Y ARTE (6) =================
  {
    id: 'chrome-music-lab',
    name: 'Chrome Music Lab: Song Maker & Espectrograma',
    organization: 'Google Creative Lab',
    category: 'humanities',
    categoryLabel: 'Artes y Geografía',
    description: 'Laboratorio interactivo para explorar la física acústica, armonía, timbre, ondas sonoras y ritmo musical.',
    embedUrl: 'https://musiclab.chromeexperiments.com/',
    pedagogicalTip: 'Relaciona la frecuencia de onda (Hz) con la altura de las notas musicales en el espectrograma.',
    recommendedGrades: 'Todas las edades',
    tags: ['Música', 'Física del Sonido', 'Armonía', 'Arte Digital']
  },
  {
    id: 'geacron-history-atlas',
    name: 'GeaCron: Atlas Histórico Mundial Interactivo',
    organization: 'GeaCron Historical Data',
    category: 'humanities',
    categoryLabel: 'Artes y Geografía',
    description: 'Mapa geopolítico interactivo que muestra las fronteras de todos los imperios y naciones año por año desde 3000 a.C.',
    embedUrl: 'http://geacron.com/home-es/',
    pedagogicalTip: 'Ingresa el año 1810 para ver la extensión del Virreinato de la Nueva España y el Imperio Napoleónico.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Historia Universal', 'Fronteras', 'Mapas Históricos', 'Geopolítica']
  },
  {
    id: 'seterra-maps',
    name: 'Seterra: Juegos de Mapas y Geografía',
    organization: 'GeoGuessr / Seterra',
    category: 'humanities',
    categoryLabel: 'Artes y Geografía',
    description: 'Retos interactivos para localizar estados de México, capitales de América, cordilleras y ríos del mundo.',
    embedUrl: 'https://www.geoguessr.com/seterra/es',
    pedagogicalTip: 'Aplica una prueba rápida de 3 minutos para ubicar las 32 entidades federativas de México.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Geografía', 'Estados de México', 'Capitales', 'Mapas']
  },
  {
    id: 'gapminder-tools',
    name: 'Gapminder: Visualizador de Desarrollo Humano',
    organization: 'Hans Rosling / Gapminder Foundation',
    category: 'humanities',
    categoryLabel: 'Artes y Geografía',
    description: 'Gráficos dinámicos de burbujas que relacionan esperanza de vida, ingresos económicos y emisiones de CO₂ por país desde 1800.',
    embedUrl: 'https://www.gapminder.org/tools/',
    pedagogicalTip: 'Muestra a los alumnos la correlación entre el nivel educativo y la esperanza de vida mundial.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Demografía', 'Economía Global', 'Estadística Social', 'NEM']
  },
  {
    id: 'beepbox-synth',
    name: 'BeepBox: Laboratorio de Composición Sonora',
    organization: 'John Nesky BeepBox Project',
    category: 'humanities',
    categoryLabel: 'Artes y Geografía',
    description: 'Sintetizador digital por compases para componer melodías chiptune y bandas sonoras de videojuegos educativos.',
    embedUrl: 'https://www.beepbox.co/',
    pedagogicalTip: 'Enseña la estructura de compases 4/4 y escalas pentatónicas a través de la creación musical interactiva.',
    recommendedGrades: 'Primaria y Secundaria',
    tags: ['Composición Musical', 'Chiptune', 'Artes', 'Sintetizador']
  },
  {
    id: 'google-teachable-machine',
    name: 'Google Teachable Machine: Laboratorio de IA',
    organization: 'Google AI Experiments',
    category: 'humanities',
    categoryLabel: 'Artes y Geografía',
    description: 'Entrena modelos de visión por computadora y reconocimiento de audio directamente en el navegador sin programar.',
    embedUrl: 'https://teachablemachine.withgoogle.com/',
    pedagogicalTip: 'Crea un clasificador que reconozca si un alumno está levantando la mano derecha o izquierda.',
    recommendedGrades: 'Secundaria y Preparatoria',
    tags: ['Inteligencia Artificial', 'Machine Learning', 'Visión por Computadora']
  }
];
