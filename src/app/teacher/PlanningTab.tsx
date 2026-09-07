"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, BookOpen, FileText, Activity, Users, Brain, 
  Scale, Globe, Palette, Download, Save, Trash2, Plus, 
  ChevronRight, Image, FileDown, CheckCircle2, Wand2, Eye, 
  RefreshCw, Settings, Check, HelpCircle, Edit3, Lock,
  ChevronDown, ChevronLeft, Shield, Award, Compass, Swords, Info,
  Clock, Layers, Target, BookMarked, CheckSquare, Calendar, Bookmark, FolderCheck
} from 'lucide-react';
import { UserProfile, Subject, ClassSchedule, Group, Quest } from '@/types';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { usePlanningStore } from '@/store/usePlanningStore';
import { supabase } from '@/lib/supabaseClient';
import { 
  generateChronometerSessions,
  generateChronometer10Sessions, 
  getArticulatedPdas, 
  detectCurriculumPdasForTopic,
  generateFinalProjectProposal, 
  generateDetonatingQuestions,
  getSepBookForSession, 
  cleanCoreTopicName,
  sanitizeSpanishPedagogicalGrammar,
  LEVEL_BASE_SUBJECTS,
  BaseSubjectDef,
  SessionPlanItem, 
  ArticulatedPda, 
  FinalProjectProposal,
  CompleteNEMPlanning
} from '@/lib/curriculumEngine';
import { PedagogicalSuggestionsSection } from '@/components/teacher/PedagogicalSuggestionsSection';

// ==========================================
// BASE DE DATOS CURRICULAR DE LA NEM 2022
// ==========================================

export function formatSpanishDateInLetters(dateInput?: string | Date): string {
  const d = dateInput ? (typeof dateInput === 'string' && dateInput.includes('de') ? null : new Date(dateInput)) : new Date();
  if (!d || isNaN(d.getTime())) {
    if (typeof dateInput === 'string' && dateInput.length > 0) return dateInput;
    return formatSpanishDateInLetters(new Date());
  }
  const day = d.getDate();
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${day} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

interface NemContent {
  campoFormativo: string;
  ejesArticuladores: string[];
  pda: string;
  inicio: string;
  desarrollo: string;
  cierre: string;
  evaluacion: string;
  materiales: string;
}

const NEM_CURRICULUM_DATABASE: Record<string, Record<string, NemContent>> = {
  'matematicas': {
    'primaria-baja': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Inclusión'],
      pda: 'Fase 3 - Expresa de manera oral y escrita números de hasta dos cifras, e identifica fracciones sencillas como mitades y cuartos en situaciones cotidianas de reparto.',
      inicio: 'Reunir a los alumnos en semicírculo. Presentar una manzana y plantear la pregunta detonadora: ¿Cómo podemos compartir esta manzana de manera justa entre dos niños? ¿Y entre cuatro? Escuchar y anotar sus respuestas en el pizarrón.',
      desarrollo: 'Entregar hojas de papel de colores y círculos de cartulina a cada equipo de tres integrantes. Pedirles que los doblen y corten en 2 y 4 partes iguales. Jugar al "Restaurante de Fracciones", donde deben atender pedidos de clientes que solicitan "media pizza" o "un cuarto de pastel" utilizando sus figuras de papel. Completar una hoja de registro ilustrada.',
      cierre: 'Ronda de reflexión metacognitiva: ¿Qué pasa si las partes no son iguales? ¿Sigue siendo una fracción? Juego de retos rápidos en el pizarrón dibujando figuras divididas y pidiendo al grupo que identifique si representan fracciones reales.',
      evaluacion: 'Lista de cotejo: Coherencia en el reparto de material concreto, representación escrita correcta de 1/2 y 1/4, y participación en el trabajo en equipo.',
      materiales: 'Manzanas de plástico o reales, círculos de cartulina de colores, tijeras, pegamento, hojas de registro del "Restaurante de Fracciones".'
    },
    'primaria-alta': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
      pda: 'Fase 5 - Resuelve problemas de suma y resta con fracciones de diferente denominador utilizando la equivalencia, y representa gráficamente las operaciones en su contexto diario.',
      inicio: 'Presentar una receta de cocina que requiere 1/2 taza de leche y 3/4 de taza de agua. Plantear el conflicto cognitivo: ¿Cómo podemos saber cuánta cantidad de líquido necesitamos en total? ¿Podemos sumar directamente 1/2 + 3/4?',
      desarrollo: 'En parejas, construir tiras de fracciones equivalentes en cartoncillo de colores. Utilizar las tiras para resolver una serie de desafíos prácticos donde deben sumar y restar porciones de ingredientes escolares. Representar las sumas de fracciones de forma gráfica coloreando vitrales didácticos (diseños artísticos divididos en cuadrículas).',
      cierre: 'Plenaria para explicar el método del mínimo común denominador y de la equivalencia gráfica. Resolver un problema integrador de forma colaborativa en el pizarrón. Escribir en su bitácora la mayor dificultad que tuvieron.',
      evaluacion: 'Rúbrica de evaluación formativa: Dominio en la conversión a fracciones equivalentes, precisión en las sumas gráficas, y análisis del significado de la suma en contextos reales.',
      materiales: 'Tiras de fracciones impresas en cartulina, colores, reglas, problemas de aplicación contextualizados, vitrales didácticos en papel bond.'
    },
    'secundaria': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico'],
      pda: 'Fase 6 - Resuelve ecuaciones lineales de primer grado utilizando propiedades de la igualdad, y calcula proporciones y porcentajes aplicados a situaciones de la vida económica local.',
      inicio: 'Analizar un recibo de luz real o una nota de compra de abarrotes de la comunidad. Preguntar cómo se calcula el IVA (16%) y de qué manera se podría formular matemáticamente para calcular el costo base antes del impuesto.',
      desarrollo: 'Resolver un taller de desafíos basados en la economía local (negocios familiares, producción agrícola o comercial). Modelar las relaciones matemáticas en forma de ecuaciones de la forma ax + b = c. En equipos de 4, crear un "Tablero de Comercio Sostenible" donde calculan costos, ofertas del 20% de descuento y ganancias netas formulando ecuaciones.',
      cierre: 'Exposición breve del método algebraico de balanzas para despejar la incógnita. Autoevaluación en su bitácora de aprendizaje: ¿Cómo me ayuda el álgebra a entender los cobros diarios?',
      evaluacion: 'Examen rápido formativo de 3 reactivos contextualizados, revisión del planteamiento formal de las ecuaciones en el portafolio, y coevaluación del trabajo en equipo.',
      materiales: 'Notas de compra simuladas, hojas de ejercicios "El Álgebra en la Tiendita", calculadora científica, plumones y pizarrón.'
    },
    'preparatoria': {
      campoFormativo: 'Pensamiento Matemático (Nivel Medio Superior)',
      ejesArticuladores: ['Pensamiento Crítico', 'Igualdad de Género'],
      pda: 'Estructuras algebraicas y trigonométricas: Modela situaciones reales y calcula variaciones proporcionales y funciones mediante sistemas de ecuaciones lineales y vectores en 2D.',
      inicio: 'Presentar un mapa de vientos de la región o trayectorias de navegación de embarcaciones/aviones. Discutir qué propiedades físicas y matemáticas se requieren para describir una fuerza que tiene magnitud y dirección.',
      desarrollo: 'Explicación teórica de vectores y descomposición trigonométrica. Resolver ejercicios en parejas donde deben calcular la fuerza resultante sobre una estructura física escolar sometida a tensiones. Desarrollar un simulador analógico en papel milimétrico empleando reglas y transportadores para contrastar el método gráfico y el analítico.',
      cierre: 'Presentación grupal de los resultados de fuerza resultantes. Reflexión sobre la equidad de género en las carreras de ingeniería y STEM (Ciencia, Tecnología, Ingeniería y Matemáticas) fomentando el diálogo.',
      evaluacion: 'Reporte técnico en parejas con la resolución detallada de un sistema vectorial y una propuesta de mejora estructural utilizando vectores.',
      materiales: 'Papel milimétrico, reglas, transportadores, hojas de problemas vectoriales de física aplicada, presentación digital de conceptos trigonométricos.'
    }
  },
  'ciencias': {
    'primaria-baja': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Vida Saludable', 'Inclusión'],
      pda: 'Fase 3 - Reconoce la importancia del agua, el aire y el suelo para la vida silvestre y humana, y propone acciones cotidianas para su cuidado y preservación en la escuela.',
      inicio: 'Realizar una caminata de observación por el huerto o jardines de la escuela. Pedir a los niños que toquen la tierra, sientan el aire y observen las plantas. Al volver al salón, registrar en un mapa conceptual gigante qué elementos son necesarios para que la vida florezca.',
      desarrollo: 'Crear en equipos pequeños un "Miniecosistema de Germinación" en vasos transparentes reciclados utilizando tierra, semillas de frijol y agua. Experimentar con tres variables controladas: uno con sol y agua, otro a oscuras, y otro sin agua. Registrar diariamente los cambios en una tabla con dibujos.',
      cierre: 'Conversatorio grupal sobre los resultados del experimento de germinación. Concluir por qué la luz, el agua y la tierra son indispensables. Elaborar carteles coloridos para promover el ahorro de agua en los lavabos del colegio.',
      evaluacion: 'Bitácora del experimento de germinación con registro gráfico continuo de cambios, y calidad y creatividad del cartel escolar.',
      materiales: 'Vasos transparentes reciclados, tierra fértil, algodón, semillas de frijol rápido, atomizadores con agua, cartulinas y colores de cera.'
    },
    'primaria-alta': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Vida Saludable'],
      pda: 'Fase 5 - Describe las características de los ecosistemas locales, analiza la huella ecológica humana en la biodiversidad y diseña prototipos sencillos de ecotecnias (como biodigestores o deshidratadores solares).',
      inicio: 'Observar un video corto sobre cómo los desechos orgánicos generan gases nocivos si no se tratan adecuadamente. Introducir el concepto de "Ecotecnias" y preguntar: ¿Qué podemos hacer con las cáscaras de fruta de la cafetería de la escuela?',
      desarrollo: 'Construir en parejas un prototipo escolar de Biodigestor Anaeróbico a escala utilizando una botella PET de 2 litros, un globo resistente, residuos orgánicos machacados (plátano, manzana) y levadura. Sellar herméticamente con plastilina y registrar la inflación del globo (producción de biogás) durante los días subsecuentes.',
      cierre: 'Plenaria explicativa de la digestión anaerobia y la transformación bacteriana de residuos en gas metano y biofertilizante. Discutir la viabilidad económica y ecológica de un biodigestor escolar real.',
      evaluacion: 'Reporte ilustrado del prototipo del biodigestor, correcto sellado técnico de la botella, y justificación ecológica del proyecto redactada individualmente.',
      materiales: 'Botellas de plástico de 2 litros limpias, globos, embudos, residuos orgánicos blandos, levadura en polvo, plastilina, cintas métricas.'
    },
    'secundaria': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Interculturalidad Crítica'],
      pda: 'Fase 6 - Valora la importancia de los procesos de oxidación y combustión en la producción de gases de efecto invernadero (GEI) y propone alternativas tecnológicas sustentables como el biogás para mitigar el cambio climático.',
      inicio: 'Analizar gráficas globales de aumento de emisiones de CO2 y Metano en los últimos 50 años. Preguntar qué actividades en sus hogares y escuelas contribuyen directamente a esta tendencia y qué alternativas energéticas existen en comunidades rurales del país.',
      desarrollo: 'Investigar en equipos los fundamentos químicos del biogás (composición del biogás, bacterias metanogénicas, fases de hidrólisis, acidogénesis y metanogénesis). Elaborar un reporte técnico de balance de masas y estimar el potencial calorífico del biogás escolar en comparación con el gas LP convencional.',
      cierre: 'Mesa redonda: "Soberanía energética y ecotecnologías en México". Discutir cómo los biodigestores benefician el desarrollo de comunidades indígenas y marginadas, reduciendo la tala de árboles para leña.',
      evaluacion: 'Bitácora científica grupal con el marco teórico químico de la digestión anaeróbica, cálculos de rendimiento térmico simulados y coevaluación del desempeño.',
      materiales: 'Artículos de investigación científica impresos, laptop/tablet para investigación, pliego de papel bond, marcadores de colores.'
    },
    'preparatoria': {
      campoFormativo: 'Ciencias Experimentales (Nivel Medio Superior)',
      ejesArticuladores: ['Pensamiento Crítico', 'Vida Saludable'],
      pda: 'Estequiometría y Termoquímica: Analiza el rendimiento térmico de reacciones químicas exotérmicas y endotérmicas, y calcula el balance calórico de sistemas biológicos y tecnológicos cerrados.',
      inicio: 'Presentar el dilema de la eficiencia de la biomasa frente a los hidrocarburos. Discutir qué variables físicas (entalpía, entropía, energía libre de Gibbs) regulan la viabilidad termodinámica de un combustible biológico.',
      desarrollo: 'Explicación del calorímetro y cálculo de calor liberado en reacciones de combustión de alcoholes y gases orgánicos. En el laboratorio escolar, simular el rendimiento térmico de una celda de combustión de gas orgánico midiendo la temperatura de agua. Realizar el balance termoquímico formal planteando ecuaciones estequiométricas.',
      cierre: 'Plenaria sobre termodinámica aplicada a procesos industriales ecológicos. Debate rápido: ¿Es el biogás una solución definitiva o de transición para la descarbonización industrial?',
      evaluacion: 'Práctica de laboratorio estequiométrica redactada con formato de artículo científico breve que incluya cálculos matemáticos rigurosos de entalpía.',
      materiales: 'Termómetros de alta precisión, calorímetros caseros o escolares, vasos de precipitados, mecheros, simulaciones teóricas de combustión de metano.'
    }
  },
  'lenguajes': {
    'primaria-baja': {
      campoFormativo: 'Lenguajes',
      ejesArticuladores: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Artes y Experiencias Estéticas'],
      pda: 'Fase 3 - Lee en voz alta poemas y textos de la lírica tradicional, identifica patrones de rima y ritmo, e inventa sus propias estrofas de forma lúdica.',
      inicio: 'Cantar colectivamente una canción tradicional infantil mexicana (como "Naranja dulce, limón partido"). Pedir a los niños que palmoteen siguiendo el ritmo de los versos e identifiquen qué palabras suenan parecido al final.',
      desarrollo: 'Jugar a la "Fábrica de Rimas": dar tarjetas de palabras a cada alumno y pedirles que busquen a un compañero que tenga una palabra que rime con la suya. En parejas, escribir un poema breve de cuatro versos ilustrado sobre sus mascotas o su escuela y decorarlo artísticamente.',
      cierre: 'Micrófono Abierto: Invitar a los alumnos a recitar sus creaciones poéticas frente a sus compañeros con entonación y expresión corporal. Dar aplausos afectuosos.',
      evaluacion: 'Participación activa en el canto y ritmo, escritura de al menos una rima lógica por pareja, y lectura expresiva en voz alta.',
      materiales: 'Tarjetas con palabras ilustradas que riman, hojas de papel decorativas, colores, micrófono de juguete o real para la recitación.'
    },
    'primaria-alta': {
      campoFormativo: 'Lenguajes',
      ejesArticuladores: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Interculturalidad Crítica'],
      pda: 'Fase 4 - Identifica las características estructurales de las leyendas y mitos de tradición oral, reconoce su valor cultural para la comunidad y elabora narraciones escritas creativas.',
      inicio: 'Sentar al grupo en círculo. Contar una versión dramatizada de una leyenda prehispánica (como "La llorona" o "El callejón del beso"). Preguntar: ¿Es una historia real? ¿Cómo ha llegado hasta nosotros hoy en día?',
      desarrollo: 'Visitar la biblioteca o realizar una investigación en clase sobre leyendas regionales mexicanas. En equipos de 4, seleccionar una leyenda, analizar sus personajes, elementos mágicos y reales, y estructurarla en un guion teatral corto. Ensayar la lectura dramática de los personajes asignados.',
      cierre: 'Puesta en escena simulada en el aula de las lecturas dramáticas de las leyendas. Compartir opiniones sobre los valores o creencias comunitarias que transmite cada historia.',
      evaluacion: 'Rúbrica: Comprensión de los elementos de la leyenda (magia vs realidad), fluidez en la lectura dramática, y trabajo armónico en el equipo.',
      materiales: 'Textos impresos de leyendas populares mexicanas, hojas blancas para redactar guiones, elementos de utilería simples (sombreros, mantas).'
    },
    'secundaria': {
      campoFormativo: 'Lenguajes',
      ejesArticuladores: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Pensamiento Crítico'],
      pda: 'Fase 6 - Analiza la intención comunicativa de textos líricos, narrativos e históricos en lengua española de distintas épocas, y redacta ensayos argumentativos estructurados sobre temáticas sociales.',
      inicio: 'Proyectar un fragmento de una obra literaria barroca y una canción de protesta social contemporánea. Discutir: ¿Qué mensaje buscan transmitir? ¿Cómo influye el momento histórico en la forma de escribir del autor?',
      desarrollo: 'Analizar individualmente la estructura de un ensayo argumentativo (Tesis, Argumentos, Conclusión). Elegir una problemática social (ej. igualdad de género, conservación ecológica o migración) y redactar un ensayo breve de 3 cuartillas, citando de manera formal al menos dos fuentes de consulta confiables.',
      cierre: 'Ronda de debate en mesa redonda donde cada estudiante expone la tesis de su ensayo y responde preguntas críticas de sus compañeros de manera respetuosa.',
      evaluacion: 'Ensayo argumentativo impreso (estructura formal, cohesión, coherencia y ortografía) y defensa de su tesis oral durante la mesa redonda.',
      materiales: 'Guía de redacción de ensayos, textos literarios de ejemplo, fichas de referencias bibliográficas, plumones de colores.'
    },
    'preparatoria': {
      campoFormativo: 'Lengua y Comunicación (Nivel Medio Superior)',
      ejesArticuladores: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
      pda: 'Redacción avanzada e interpretación literaria: Desarrolla el pensamiento crítico mediante el análisis literario comparativo de textos líricos y redacta discursos persuasivos de impacto comunitario.',
      inicio: 'Ver un video de un discurso persuasivo célebre (como el de Martin Luther King o Malala Yousafzai). Identificar qué recursos lingüísticos y emocionales utilizan para conectar con la audiencia.',
      desarrollo: 'Exposición de figuras retóricas avanzadas (metáfora, anáfora, hipérbole, ironía). Redactar de forma individual un discurso persuasivo sobre una problemática del plantel escolar o de la colonia. Grabar un video o realizar una oratoria de 3 minutos aplicando modulación vocal y expresión ad hoc.',
      cierre: 'Taller de retroalimentación literaria entre pares (taller de escritores). Evaluar el discurso del compañero utilizando una escala estimativa.',
      evaluacion: 'Manuscrito del discurso con uso explícito de figuras retóricas y video de la oratoria final del alumno.',
      materiales: 'Manual de retórica y oratoria, videos de discursos históricos, rúbrica de coevaluación escolar.'
    }
  }
};

// ==========================================
// CAMPOS FORMATIVOS Y EJES ARTICULADORES
// ==========================================

const CAMPOS_FORMATIVOS = [
  'Lenguajes',
  'Saberes y Pensamiento Científico',
  'Ética, Naturaleza y Sociedades',
  'De lo Humano y lo Comunitario'
];

const EJES_ARTICULADORES = [
  { name: 'Pensamiento Crítico', icon: Brain, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/40' },
  { name: 'Inclusión', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200/40' },
  { name: 'Vida Saludable', icon: Activity, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/40' },
  { name: 'Artes y Exp. Estéticas', icon: Palette, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200/40' },
  { name: 'Fomento a la Lectura', icon: BookOpen, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200/40' },
  { name: 'Igualdad de Género', icon: Scale, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200/40' },
  { name: 'Interculturalidad Crítica', icon: Globe, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/40' }
];

interface PlanningTabProps {
  currentTeacher: UserProfile;
  subjects: Subject[];
  schedulesList: ClassSchedule[];
  groupsList: Group[];
}

const getPdaMap = (rawTopic: string): Record<string, Record<string, string>> => {
  const capitalizedTopic = cleanCoreTopicName(rawTopic);
  const isTradition = /muert|difunt|ofrend|calaver|altar|cempasuchil|pan de muerto|costumbre|festividad|tradicion|patrimonio biocultural|celebrac|panteon|copal|sahumerio|alfeñique|papel picado|fiesta patronal|guelaguetza|posada|navidad/i.test(capitalizedTopic);
  const isIndependence = /independ|hidalgo|morelos|allende|aldama|josefa|iturbide|dolores/i.test(capitalizedTopic);
  const isRevolution = !isIndependence && /revoluci|madero|zapata|villa|carranza|porfir/i.test(capitalizedTopic);
  const isHistory = isIndependence || isRevolution || /reforma|mexic|histori|constituc|juarez|virrein|prehispan|colonia|patrimon|cultura|efemerid|civilizac|conquista|batalla|heroes|monumento|patria/i.test(capitalizedTopic);
  const isParabola = /parabol|cuadrat|segundo grado|tiro parab/i.test(capitalizedTopic);
  const isAdditionOrSubtraction = /suma|resta|agregar|quitar|conteo|numero|agrupacion|reagrupa/i.test(capitalizedTopic);
  const isGeometry = /figura|cuerpo|geometric|tangram|plano|cara|arista/i.test(capitalizedTopic);
  const isEpistolar = /carta|epistol|mensaje|buzon|cartero|correspondencia|sobre\b|postal/i.test(capitalizedTopic);
  const isReading = /lectura|cuento|escribir|nombre|poema|rima|dictado|fabula|instructivo|carta|epistol|mensaje|buzon|correo/i.test(capitalizedTopic);
  const isScience = /planta|animal|cuerpo|sentido|higiene|agua|ecosistem|materia|salud|huerto|filtr/i.test(capitalizedTopic);
  const isCivicsLocal = isHistory || /comunidad|acuerdo|convivencia|familia|derecho|paz|tradicion|historia/i.test(capitalizedTopic);

  return {
    'preescolar': {
      ecology:   `Fase 2 (Preescolar) - Saberes y Pensamiento Científico: Observa con atención seres vivos y elementos naturales en la naturaleza, describe sus características y propone formas sencillas de cuidarla.`,
      health:    `Fase 2 (Preescolar) - De lo Humano y lo Comunitario: Practica hábitos de higiene, hidratación y alimentación sana del Plato del Bien Comer para mantenerse sano.`,
      history:   isTradition
        ? `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos, costumbres y tradiciones familiares sobre Día de Muertos y festividades de su comunidad, reconociendo la diversidad cultural.`
        : isIndependence
        ? `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos y dibujos sobre la Independencia de México, Miguel Hidalgo y los símbolos patrios, reconociendo el valor de la libertad.`
        : isRevolution
        ? `Fase 2 (Preescolar) - Lenguajes: Expresa mediante dibujos y canciones relatos sobre personajes de la Revolución Mexicana.`
        : `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos, costumbres y tradiciones familiares sobre "${capitalizedTopic}", reconociendo la historia de su entorno y festividades de su comunidad.`,
      art:       `Fase 2 (Preescolar) - Lenguajes (Artes): Representa de forma creativa ideas y sentimientos sobre "${capitalizedTopic}" usando pintura, modelado con plastilina o música.`,
      tech:      `Fase 2 (Preescolar) - Reconoce herramientas y objetos de "${capitalizedTopic}" que se usan en casa y en la escuela de forma segura.`,
      math:      `Fase 2 (Preescolar) - Saberes y Pensamiento Científico: Cuenta objetos de su entorno, reconoce números en su contexto y utiliza nociones espaciales en juegos relacionados con "${capitalizedTopic}".`,
      civics:    `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Colabora con sus compañeros en actividades sobre "${capitalizedTopic}" respetando las reglas y acuerdos del salón.`,
      language:  `Fase 2 (Preescolar) - Lenguajes: Expresa oralmente sus ideas y emociones sobre "${capitalizedTopic}" y disfruta de narraciones, rimas y cantos infantiles.`,
      social:    `Fase 2 (Preescolar) - Conoce lugares de su comunidad que se relacionan con "${capitalizedTopic}" y platica sobre lo que hacen ahí.`,
      default:   isTradition
        ? `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos y costumbres familiares sobre Día de Muertos y festividades locales, conviviendo con respeto.`
        : isIndependence
        ? `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos y dibujos sobre la Independencia de México, Miguel Hidalgo y los símbolos patrios.`
        : (isHistory ? `Fase 2 (Preescolar) - Ética, Naturaleza y Sociedades: Comparte relatos y costumbres familiares sobre "${capitalizedTopic}", reconociendo elementos y festividades históricas de su comunidad.` : `Fase 2 (Preescolar) - Explora su entorno descubriendo aspectos de "${capitalizedTopic}", y los comparte con sus compañeros mediante expresiones orales y producciones gráficas.`)
    },
    'primaria-baja': {
      ecology:   isTradition
        ? `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Describe y clasifica elementos naturales de temporada (cempasúchil, mandarinas, calabaza, copal) y observa sus transformaciones físicas cotidianas.`
        : (isScience ? `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Reconoce las características de plantas, animales y estados físicos del agua en relación con "${capitalizedTopic}"; propone y practica acciones colectivas de cuidado ambiental en su escuela.` : `Fase 3 (1º y 2º Primaria) - Reconoce la importancia de "${capitalizedTopic}" en su entorno inmediato mediante exploración sensorial y elabora registros gráficos.`),
      health:    isTradition
        ? `Fase 3 (1º y 2º Primaria) - De lo Humano y lo Comunitario: Reconoce que las tradiciones y festividades familiares fortalecen los lazos afectivos, el respeto intergeneracional y el sentido de pertenencia colectiva.`
        : `Fase 3 (1º y 2º Primaria) - De lo Humano y lo Comunitario: Reconoce los órganos de los sentidos y hábitos del Plato del Bien Comer vinculados a "${capitalizedTopic}" para favorecer el bienestar escolar y familiar.`,
      history:   isTradition
        ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga en relatos familiares, fotografías y testimonios comunitarios el origen y los cambios en las tradiciones y festividades de su localidad (como Día de Muertos y fiestas patronales), reconociendo el patrimonio biocultural.`
        : isIndependence
        ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga a través de relatos históricos, lecturas compartidas e imágenes los acontecimientos y personajes del inicio de la Independencia de México (Miguel Hidalgo, Josefa Ortiz de Domínguez, Ignacio Allende), reconociendo por qué conmemoramos esta fecha cívica y valorando la libertad y la justicia.`
        : isRevolution
        ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga en relatos familiares, fotografías y testimonios de su comunidad los hechos de la Revolución Mexicana, reconociendo cómo transformaron la vida cotidiana, la escuela y los derechos de las personas.`
        : (isHistory ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga a través de relatos orales, fotografías familiares y testimonios comunitarios los acontecimientos y personajes de "${capitalizedTopic}", reconociendo cómo transformaron la vida cotidiana, la escuela y los derechos de las familias.` : `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga la historia personal, familiar y comunitaria sobre "${capitalizedTopic}" a través de relatos orales, fotografías y acuerdos de convivencia pacífica.`),
      art:       `Fase 3 (1º y 2º Primaria) - Lenguajes (Artes): Explora texturas, formas, colores, rondas tradicionales y modelado con plastilina sobre "${capitalizedTopic}" para expresar emociones libremente.`,
      tech:      `Fase 3 (1º y 2º Primaria) - Identifica usos cotidianos de herramientas y materiales en "${capitalizedTopic}", construyendo artefactos sencillos con material reciclable.`,
      math:      isAdditionOrSubtraction ? `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico (Construcción de la noción de suma y resta): Resuelve problemas vinculados a su contexto que implican agregar, quitar, juntar, comparar y completar cantidades mediante material concreto (fichas base 10, semillas, taparroscas), recta numérica y cálculo mental con números de hasta dos y tres cifras.` : isGeometry ? `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Figuras geométricas y sus características: Manipula objetos del entorno y construye composiciones geométricas y tangram identificando lados rectos y curvos.` : `Fase 3 (1º y 2º Primaria) - Saberes y Pensamiento Científico: Estudio de los números: Cuenta, lee, escribe y representa colecciones vinculadas a "${capitalizedTopic}" mediante valor posicional (centenas, decenas y unidades) y resolución de problemas cotidianos.`,
      civics:    `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Construye normas y acuerdos de convivencia en el aula inspirados en "${capitalizedTopic}", fomentando el diálogo, la inclusión y la cultura de paz.`,
      language:  isTradition
        ? `Fase 3 (1º y 2º Primaria) - Lenguajes: Escribe de manera autónoma y mediante dictado al docente coplas, rimas y descripciones sencillas sobre las ofrendas y personajes tradicionales de su comunidad.`
        : (isEpistolar ? `Fase 3 (1º y 2º Primaria) - Lenguajes (Producción y lectura de textos epistolares): Reconoce la estructura de la carta (lugar, fecha, destinatario, saludo, cuerpo, despedida, firma y remitente), escribe cartas a familiares y compañeros con propósitos reales y utiliza el buzón escolar para la entrega de correspondencia comunitaria.` : isReading ? `Fase 3 (1º y 2º Primaria) - Lenguajes: Produce e interpreta textos breves, cuentos, coplas, instructivos y descripciones sobre "${capitalizedTopic}"; aplica la correspondencia grafofonética, el dictado colectivo y signos de puntuación básicos.` : `Fase 3 (1º y 2º Primaria) - Lenguajes: Describe de forma oral y escrita objetos, personas y eventos relacionados con "${capitalizedTopic}" mediante el dibujo y la escritura autónoma.`),
      social:    `Fase 3 (1º y 2º Primaria) - Identifica los cambios y tradiciones de su localidad relacionados con "${capitalizedTopic}" a través de entrevistas familiares y cartografía infantil.`,
      default:   isTradition
        ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga en relatos familiares y testimonios de su comunidad el origen de las tradiciones y celebraciones locales.`
        : isIndependence
        ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga a través de relatos históricos, lecturas compartidas e imágenes los acontecimientos y personajes del inicio de la Independencia de México (Miguel Hidalgo, Josefa Ortiz de Domínguez, Ignacio Allende), reconociendo por qué conmemoramos esta fecha cívica y valorando la libertad y la justicia.`
        : isRevolution
        ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga en relatos familiares, fotografías y testimonios de su comunidad los hechos de la Revolución Mexicana, reconociendo cómo transformaron la vida cotidiana, la escuela y los derechos de las personas.`
        : (isHistory ? `Fase 3 (1º y 2º Primaria) - Ética, Naturaleza y Sociedades: Indaga en relatos familiares, fotografías y testimonios de su comunidad los hechos de "${capitalizedTopic}", reconociendo cómo transformaron la vida cotidiana, la escuela y los derechos de las personas.` : `Fase 3 (1º y 2º Primaria) - Identifica y describe con sus palabras las principales características de "${capitalizedTopic}" en su contexto escolar y comunitario, registrando sus observaciones con material manipulativo y gráfico.`)
    },
    'primaria-media': {
      ecology:   isTradition
        ? `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Indaga y describe las propiedades botánicas y usos de flores tradicionales (cempasúchil, terciopelo), semillas y frutos de temporada en las expresiones culturales de la región, reconociendo su ciclo biológico y cambios de estado físico (cera y copal).`
        : `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Analiza las relaciones entre factores bióticos y abióticos en relación con "${capitalizedTopic}", diseñando acciones de conservación de la biodiversidad local.`,
      health:    isTradition
        ? `Fase 4 (3º y 4º Primaria) - De lo Humano y lo Comunitario: Identifica eventos y celebraciones importantes de la historia familiar y comunitaria, reconociendo que fortalecen la identidad colectiva, el sentido de pertenencia y la transmisión intergeneracional de saberes y afectos.`
        : `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Describe el funcionamiento de los sistemas del cuerpo humano e investiga la influencia de "${capitalizedTopic}" en la salud comunitaria.`,
      history:   isTradition
        ? `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades (La Entidad donde Vivo): Reconoce y valora las prácticas culturales, expresiones artísticas, rituales, ofrendas y celebraciones tradicionales (como Día de Muertos) como parte del patrimonio biocultural y la memoria colectiva de su entidad federativa y pueblos originarios.`
        : `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Investiga la historia regional y el legado cívico y cultural vinculado a "${capitalizedTopic}", valorando la justicia y los derechos de todos.`,
      art:       isTradition
        ? `Fase 4 (3º y 4º Primaria) - Lenguajes (Artes): Analiza las características estéticas, cromáticas y simbólicas de las manifestaciones artísticas del Día de Muertos (altares, tapetes florales, catrinas y arte efímero), interpretando sus significados culturales.`
        : `Fase 4 (3º y 4º Primaria) - Lenguajes (Artes): Crea producciones visuales y escénicas que resignifican el tema "${capitalizedTopic}" con técnicas mixtas.`,
      tech:      `Fase 4 (3º y 4º Primaria) - Diseña prototipos tecnológicos y circuitos sencillos aplicando conceptos de "${capitalizedTopic}".`,
      math:      `Fase 4 (3º y 4º Primaria) - Saberes y Pensamiento Científico: Resuelve problemas de fracciones equivalentes, multiplicación, división y geometría aplicados a "${capitalizedTopic}".`,
      civics:    isTradition
        ? `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Identifica la composición pluricultural de su entidad federativa, reconociendo el aporte de los pueblos indígenas y afromexicanos en la preservación de costumbres y fiestas comunitarias.`
        : `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Analiza los derechos de la niñez y diseña propuestas colectivas sobre "${capitalizedTopic}".`,
      language:  isTradition
        ? `Fase 4 (3º y 4º Primaria) - Lenguajes: Lee, comprende y produce calaveritas literarias y coplas populares, explorando la rima, el ritmo lírico, la sátira humorística y las figuras retóricas de la tradición lírica mexicana.`
        : `Fase 4 (3º y 4º Primaria) - Lenguajes: Redacta textos expositivos, narrativos y resúmenes estructurados sobre "${capitalizedTopic}".`,
      social:    `Fase 4 (3º y 4º Primaria) - Analiza la diversidad geográfica y socioeconómica de México en torno a "${capitalizedTopic}".`,
      default:   isTradition
        ? `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades (La Entidad donde Vivo): Reconoce y valora las prácticas culturales, expresiones artísticas, rituales, ofrendas y celebraciones tradicionales (como Día de Muertos) como parte del patrimonio biocultural y la memoria colectiva de su entidad federativa y pueblos originarios.`
        : (isHistory ? `Fase 4 (3º y 4º Primaria) - Ética, Naturaleza y Sociedades: Investiga en fuentes primarias y secundarias las causas, personajes y consecuencias de "${capitalizedTopic}" en su entidad federativa y en México.` : `Fase 4 (3º y 4º Primaria) - Indaga, sistematiza y comunica hallazgos sobre "${capitalizedTopic}" con herramientas formales de la NEM.`)
    },
    'primaria-alta': {
      ecology:   `Fase 5 (5º y 6º Primaria) - Saberes y Pensamiento Científico: Analiza el impacto de "${capitalizedTopic}" en los ecosistemas locales, plantea hipótesis sobre causas y consecuencias, y diseña propuestas sustentables.`,
      health:    `Fase 5 (5º y 6º Primaria) - De lo Humano y lo Comunitario: Investiga la relación entre "${capitalizedTopic}" y la salud pública, analiza datos estadísticos y propone campañas informativas escolares.`,
      history:   `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades: Analiza críticamente las causas económicas, políticas y sociales de "${capitalizedTopic}", la promulgación de leyes y la vigencia de los derechos colectivos.`,
      art:       `Fase 5 (5º y 6º Primaria) - Lenguajes (Artes): Analiza manifestaciones estéticas sobre "${capitalizedTopic}" y crea producciones artísticas originales.`,
      tech:      `Fase 5 (5º y 6º Primaria) - Analiza el impacto social de "${capitalizedTopic}" y diseña proyectos colaborativos digitales.`,
      math:      `Fase 5 (5º y 6º Primaria) - Saberes y Pensamiento Científico: Resuelve problemas de proporcionalidad, porcentajes, números decimales y áreas vinculados a "${capitalizedTopic}".`,
      civics:    `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades: Debate dilemas éticos y democráticos sobre "${capitalizedTopic}" formulando propuestas ciudadanas.`,
      language:  `Fase 5 (5º y 6º Primaria) - Lenguajes: Produce textos argumentativos, reseñas y debates académicos sobre "${capitalizedTopic}".`,
      social:    `Fase 5 (5º y 6º Primaria) - Investiga características geoespaciales y económicas de "${capitalizedTopic}" en México y el mundo.`,
      default:   isHistory ? `Fase 5 (5º y 6º Primaria) - Ética, Naturaleza y Sociedades: Analiza críticamente las causas del estallido histórico de "${capitalizedTopic}", la promulgación de leyes y las garantías sociales en el México actual.` : `Fase 5 (5º y 6º Primaria) - Desarrolla proyectos de indagación científica y comunitaria sobre "${capitalizedTopic}" aplicando la metodología NEM.`
    },
    'secundaria': {
      ecology:   `Fase 6 (Secundaria) - Saberes y Pensamiento Científico: Evalúa críticamente el impacto de "${capitalizedTopic}" en los ecosistemas y diseña estrategias de intervención comunitaria sustentable.`,
      health:    `Fase 6 (Secundaria) - De lo Humano y lo Comunitario: Analiza científicamente factores de riesgo y protección relacionados con "${capitalizedTopic}" e interpreta datos epidemiológicos.`,
      history:   `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades (Historia): Analiza críticamente desde diversas corrientes historiográficas las contradicciones socioeconómicas y los procesos de "${capitalizedTopic}".`,
      art:       `Fase 6 (Secundaria) - Lenguajes (Artes): Desarrolla proyectos artísticos interdisciplinarios que abordan problemáticas sobre "${capitalizedTopic}".`,
      tech:      `Fase 6 (Secundaria) - Diseña soluciones tecnológicas y prototipos automatizados en respuesta a problemáticas de "${capitalizedTopic}".`,
      math:      isParabola ? `Fase 6 (3º Secundaria) - Saberes y Pensamiento Científico: Modela y resuelve problemas de la vida cotidiana y fenómenos físicos mediante funciones cuadráticas y parábolas (y = ax² + bx + c). Analiza e interpreta vértice, concavidad, eje de simetría y raíces.` : `Fase 6 (Secundaria) - Saberes y Pensamiento Científico: Aplica el pensamiento algebraico y el razonamiento matemático para modelar y resolver situaciones reales vinculadas a "${capitalizedTopic}".`,
      civics:    `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades: Analiza problemáticas de derechos humanos y estado de derecho relacionadas con "${capitalizedTopic}".`,
      language:  `Fase 6 (Secundaria) - Lenguajes: Analiza discursos, argumentación y produce ensayos críticos sobre "${capitalizedTopic}".`,
      social:    `Fase 6 (Secundaria) - Analiza dinámicas geopolíticas, económicas y ambientales sobre "${capitalizedTopic}".`,
      default:   isHistory ? `Fase 6 (Secundaria) - Ética, Naturaleza y Sociedades: Analiza críticamente desde diversas corrientes historiográficas las contradicciones socioeconómicas y los planes de "${capitalizedTopic}".` : `Fase 6 (Secundaria) - Desarrolla proyectos sociocríticos integrales sobre "${capitalizedTopic}" con rigor pedagógico NEM 2024.`
    },
    'preparatoria': {
      ecology:   `Bachillerato (MCCEMS) - Ciencias Naturales: Modela interacciones ecosistémicas complejas sobre "${capitalizedTopic}" con metodología científica y enfoque bioético.`,
      health:    `Bachillerato (MCCEMS) - Recursos Socioemocionales: Analiza determinantes de salud comunitaria y formula protocolos de intervención sobre "${capitalizedTopic}".`,
      history:   `Bachillerato (MCCEMS) - Conciencia Histórica: Construye interpretaciones historiográficas fundamentadas con aparato crítico sobre "${capitalizedTopic}".`,
      art:       `Bachillerato (MCCEMS) - Artes: Desarrolla proyectos conceptuales y estéticos contemporáneos en torno a "${capitalizedTopic}".`,
      tech:      `Bachillerato (MCCEMS) - Desarrolla soluciones de ingeniería e innovación aplicadas a "${capitalizedTopic}".`,
      math:      `Bachillerato (MCCEMS) - Pensamiento Matemático: Modela fenómenos continuos y discretos mediante cálculo y herramientas analíticas sobre "${capitalizedTopic}".`,
      civics:    `Bachillerato (MCCEMS) - Humanidades: Diseña proyectos de política pública e incidencia democrática sobre "${capitalizedTopic}".`,
      language:  `Bachillerato (MCCEMS) - Lengua y Comunicación: Produce textos académicos y discursos argumentativos formales sobre "${capitalizedTopic}".`,
      social:    `Bachillerato (MCCEMS) - Modela escenarios económicos y demográficos sobre "${capitalizedTopic}".`,
      default:   `Bachillerato (MCCEMS) - Integra marcos teóricos y cuantitativos para formular proyectos de investigación sobre "${capitalizedTopic}".`
    }
  };
};

export function PlanningTab({ currentTeacher, subjects, schedulesList, groupsList }: PlanningTabProps) {
  const subjectsList = useSchoolAdminStore(state => state.subjectsList);
  const normalizedTeacherId = currentTeacher?.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55' ? 'usr-teacher-1' : currentTeacher?.id;

  // Filter subjects taught by the current teacher
  const teacherSubjectIds = schedulesList
    .filter(s => s.teacherId === normalizedTeacherId)
    .map(s => s.subjectId);

  // Helper to map subject ID/name to curriculum database category keys
  const mapSubjectToCurriculumKey = (subjectId: string, subjectName: string): string => {
    const cleanId = (subjectId || '').toLowerCase();
    const cleanName = (subjectName || '').toLowerCase();
    
    if (cleanId.includes('math') || cleanId.includes('matemat') || cleanName.includes('matemat') || cleanId.includes('-mat')) {
      return 'matematicas';
    }
    if (cleanId.includes('sci') || cleanId.includes('cienc') || cleanName.includes('cienc') || cleanName.includes('quim') || cleanName.includes('fisic') || cleanName.includes('biolog') || cleanName.includes('natural') || cleanId.includes('-cie') || cleanId.includes('-con')) {
      return 'ciencias';
    }
    if (cleanId.includes('ent') || cleanId.includes('his') || cleanId.includes('geo') || cleanId.includes('soc') || cleanName.includes('historia') || cleanName.includes('entidad') || cleanName.includes('geografia') || cleanName.includes('civica') || cleanName.includes('sociedades') || cleanId.includes('-ent') || cleanId.includes('-his') || cleanId.includes('-civ')) {
      return 'historia';
    }
    if (cleanId.includes('art') || cleanName.includes('arte') || cleanName.includes('musica') || cleanId.includes('-art')) {
      return 'artes';
    }
    if (cleanId.includes('hum') || cleanId.includes('fisic') || cleanName.includes('fisica') || cleanName.includes('salud') || cleanName.includes('emocional') || cleanId.includes('-hum') || cleanId.includes('-efi')) {
      return 'humano';
    }
    return 'lenguajes';
  };

  // --- Estados de Programa Analítico (SEP / NEM) ---
  const [activeModule, setActiveModule] = useState<'generator' | 'programa-analitico'>('generator');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  
  // Paso 1: Lectura de la realidad
  const [realityDiagnosis, setRealityDiagnosis] = useState('');
  const [problematic, setProblematic] = useState('');
  const [studentNeeds, setStudentNeeds] = useState('');

  // Paso 2: Contextualización
  const [camposFormativos, setCamposFormativos] = useState<any[]>([]);
  const [pdasList, setPdasList] = useState<any[]>([]);
  const [selectedCampoId, setSelectedCampoId] = useState('');
  const [selectedPdaIds, setSelectedPdaIds] = useState<string[]>([]);
  const [selectedNEMSubject, setSelectedNEMSubject] = useState('');
  const [selectedNEMLevel, setSelectedNEMLevel] = useState('primaria-alta');

  // Paso 3: Formulación (Campañas de Gremio)
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignQuests, setCampaignQuests] = useState<any[]>([]);
  const [isPublishingCampaign, setIsPublishingCampaign] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cargar campos formativos al montar
  useEffect(() => {
    const fetchNemData = async () => {
      try {
        const { data, error } = await supabase
          .from('nem_campos_formativos')
          .select('*')
          .order('name');
        if (error) throw error;
        if (data) {
          setCamposFormativos(data);
          if (data.length > 0) {
            setSelectedCampoId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching nem_campos_formativos:', err);
      }
    };
    fetchNemData();
  }, []);

  // Cargar PDAs cuando cambia el campo formativo
  useEffect(() => {
    if (!selectedCampoId) return;
    const fetchPdas = async () => {
      try {
        const { data, error } = await supabase
          .from('nem_pdas')
          .select('*')
          .eq('campo_formativo_id', selectedCampoId)
          .order('code');
        if (error) throw error;
        if (data) {
          setPdasList(data);
        }
      } catch (err) {
        console.error('Error fetching nem_pdas:', err);
      }
    };
    fetchPdas();
  }, [selectedCampoId]);


  const handlePublishCampaign = async () => {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (!campaignTitle.trim()) {
      alert('Por favor introduce un título para la campaña del gremio.');
      return;
    }
    if (campaignQuests.length === 0) {
      alert('Por favor agrega al menos una misión a la campaña.');
      return;
    }

    setIsPublishingCampaign(true);
    try {
      let subjectUuid = selectedNEMSubject;
      if (!isUuid(subjectUuid)) {
        const subjectObj = displaySubjects.find(s => s.id === selectedNEMSubject);
        const name = subjectObj ? subjectObj.name : 'Matemáticas';
        const { data: existingSubject } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', name)
          .maybeSingle();
        if (existingSubject) {
          subjectUuid = existingSubject.id;
        } else {
          subjectUuid = '00000000-0000-0000-0000-000000000000'; // fallback
        }
      }

      // Insertar misión (campaña)
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .insert({
          school_id: '00000000-0000-0000-0000-000000000000',
          subject_id: subjectUuid,
          level_grade_id: '1111c019-61c7-4097-8aca-03cc0c4db68a', // Default to 4º Primaria
          title: campaignTitle,
          description: `Campaña del Programa Analítico: ${problematic || 'Plan de estudios'}`,
          story_intro: `¡Atención Gremio! Se ha desplegado una nueva campaña basada en: ${realityDiagnosis.slice(0, 100)}...`,
          map_position_x: Math.floor(Math.random() * 80) + 10,
          map_position_y: Math.floor(Math.random() * 80) + 10,
          campo_formativo_id: selectedCampoId,
          pda_ids: selectedPdaIds,
          is_active: true
        })
        .select('id')
        .single();

      if (missionError) throw missionError;
      const missionId = missionData.id;

      // Insertar Quests vinculadas
      const questsToInsert = campaignQuests.map((q, idx) => ({
        mission_id: missionId,
        title: q.title,
        description: q.description,
        type: q.type,
        sequence_order: idx + 1,
        xp_reward: q.xp_reward,
        coins_reward: q.coins_reward,
        campo_formativo_id: selectedCampoId,
        pda_ids: q.pda_ids,
        content: q.type === 'quiz' ? {
          questions: [
            {
              id: `q-${Date.now()}-${idx}-1`,
              question: `Pregunta sobre: ${q.title}`,
              options: ["Opción A", "Opción B", "Opción C", "Opción D"],
              correctAnswerIndex: 0,
              explanation: "Respuesta correcta por defecto para la campaña."
            }
          ]
        } : {
          instructions: q.description,
          acceptedFormats: ["image", "audio", "video", "pdf", "link"]
        }
      }));

      const { error: questsError } = await supabase
        .from('quests')
        .insert(questsToInsert);

      if (questsError) throw questsError;

      // Actualizar store de Zustand local
      const campaignInfo = {
        id: missionId,
        subject_id: selectedNEMSubject,
        subject_name: displaySubjects.find(s => s.id === selectedNEMSubject)?.name || 'Materia',
        level: selectedNEMLevel,
        reality_diagnosis: realityDiagnosis,
        problematic: problematic,
        student_needs: studentNeeds,
        campo_formativo_id: selectedCampoId,
        campo_formativo_name: camposFormativos.find(cf => cf.id === selectedCampoId)?.name || 'Campo Formativo',
        selected_pda_ids: selectedPdaIds,
        quests: campaignQuests,
        published_at: new Date().toISOString()
      };
      
      const { addCampaign } = usePlanningStore.getState();
      addCampaign(campaignInfo);

      // Recargar misiones en el store de gamificación
      const gamificationStore = useGamificationStore.getState();
      if (gamificationStore.fetchMissions) {
        await gamificationStore.fetchMissions();
      }

      // Mostrar toast
      setToastMessage('¡Campaña del Programa Analítico desplegada al Gremio!');
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);

      // Reiniciar estados del wizard
      setWizardStep(1);
      setRealityDiagnosis('');
      setProblematic('');
      setStudentNeeds('');
      setSelectedPdaIds([]);
      setCampaignTitle('');
      setCampaignQuests([]);
    } catch (err: any) {
      console.error('Error al publicar campaña del programa analítico:', err.message || err);
      alert(`Error al publicar la campaña: ${err.message || err}`);
    } finally {
      setIsPublishingCampaign(false);
    }
  };

  // --- Estados de Entrada ---
  const [inputText, setInputText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('primaria-baja');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionCount, setSessionCount] = useState<number>(3);
  const [pdaSuggestions, setPdaSuggestions] = useState<string[]>([]);
  const [isLoadingPDAs, setIsLoadingPDAs] = useState(false);
  const [selectedSuggestedPda, setSelectedSuggestedPda] = useState('');

  // Materias oficiales base según el nivel educativo seleccionado (Preescolar a Preparatoria)
  const displaySubjects = LEVEL_BASE_SUBJECTS[selectedLevel] || LEVEL_BASE_SUBJECTS['primaria-baja'];

  // Referencias para rastrear el último nivel y materia seleccionados
  const lastLevelRef = useRef(selectedLevel);
  const lastSubjectRef = useRef(selectedSubject);

  // Recálculo inmediato en tiempo real de sugerencias de PDAs oficiales según nivel y asignatura
  const recalculatePdasNow = (topic: string, level: string, subjectId: string) => {
    if (!topic || topic.trim().length < 2) {
      setPdaSuggestions([]);
      setSelectedSuggestedPda('');
      return;
    }
    const subjects = LEVEL_BASE_SUBJECTS[level] || LEVEL_BASE_SUBJECTS['primaria-baja'];
    const subjectObj = subjects.find(s => s.id === subjectId);
    const subjectName = subjectObj ? subjectObj.name : subjectId;
    const freshPdas = detectCurriculumPdasForTopic(topic, level, subjectName);
    setPdaSuggestions(freshPdas);
    if (freshPdas.length > 0) {
      setSelectedSuggestedPda(freshPdas[0]);
    } else {
      setSelectedSuggestedPda('');
    }
    lastLevelRef.current = level;
    lastSubjectRef.current = subjectId;
  };

  // Sincronizar materia seleccionada automáticamente al cambiar de nivel educativo
  useEffect(() => {
    const validSubjects = LEVEL_BASE_SUBJECTS[selectedLevel] || LEVEL_BASE_SUBJECTS['primaria-baja'];
    if (!selectedSubject || !validSubjects.some(s => s.id === selectedSubject)) {
      const fallbackSubject = validSubjects[0]?.id || '';
      setSelectedSubject(fallbackSubject);
      if (inputText && inputText.trim().length >= 2) {
        recalculatePdasNow(inputText, selectedLevel, fallbackSubject);
      }
    }
  }, [selectedLevel, selectedSubject, inputText]);

  // Sincronizar materia seleccionada
  useEffect(() => {
    if (selectedSubject && !selectedNEMSubject) {
      setSelectedNEMSubject(selectedSubject);
    }
  }, [selectedSubject, selectedNEMSubject]);
  
  // --- Estado de Archivos ---
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: 'image' | 'pdf'; size: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sugerencias inteligentes y contextuales de PDAs (Debounce para escritura fluida en el input)
  useEffect(() => {
    if (!inputText || inputText.trim().length < 2) {
      setPdaSuggestions([]);
      setSelectedSuggestedPda('');
      return;
    }

    setIsLoadingPDAs(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const queryWords = inputText.trim().split(/\s+/).filter(w => w.length >= 2);
        let dbSuggestions: string[] = [];

        if (queryWords.length > 0) {
          const word = queryWords[0];
          try {
            const { data } = await supabase
              .from('pdas')
              .select('pda_text')
              .ilike('pda_text', `%${word}%`)
              .limit(5);
              
            if (data && data.length > 0) {
              dbSuggestions = data.map((d: any) => d.pda_text).filter(Boolean);
            }
          } catch (e) {
            // Ignorar fallas de conexión a Supabase
          }
        }

        // Detección curricular pedagógica oficial NEM 2024 adaptada exactamente al nivel y materia
        const subjectObj = displaySubjects?.find(s => s.id === selectedSubject);
        const subjectName = subjectObj ? subjectObj.name : selectedSubject;
        const detectedPdas = detectCurriculumPdasForTopic(inputText, selectedLevel, subjectName);

        // Los detectados según la asignatura siempre van al principio
        const combined = Array.from(new Set([...detectedPdas, ...dbSuggestions]));
        setPdaSuggestions(combined);

        // Si cambió el nivel o la materia seleccionada, seleccionar el PDA principal de la materia nueva
        const subjectChanged = lastSubjectRef.current !== selectedSubject;
        const levelChanged = lastLevelRef.current !== selectedLevel;
        lastSubjectRef.current = selectedSubject;
        lastLevelRef.current = selectedLevel;

        if (combined.length > 0) {
          if (subjectChanged || levelChanged || !selectedSuggestedPda || !combined.includes(selectedSuggestedPda)) {
            setSelectedSuggestedPda(combined[0]);
          }
        } else {
          setSelectedSuggestedPda('');
        }
      } catch (err) {
        console.error("Error buscando PDAs en PlanningTab:", err);
      } finally {
        setIsLoadingPDAs(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [inputText, selectedLevel, selectedSubject, displaySubjects, selectedSuggestedPda]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Estados de Clave de IA ---
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [aiApiKey, setAiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('iskool_ai_api_key') || '';
    }
    return '';
  });

  // --- Estados de Ejecución/IA ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [bypassVault, setBypassVault] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const generationSteps = [
    'Analizando texto e insumos...',
    'Buscando correspondencia en el plan de estudios NEM...',
    'Generando PDA y ejes articuladores adecuados...',
    'Estructurando secuencia didáctica y criterios de evaluación...',
    'Finalizando planeación...'
  ];

  // --- Estados de Resultado ---
  const [activePlanning, setActivePlanning] = useState<any | null>(null);
  const [planningsHistory, setPlanningsHistory] = useState<any[]>([]);

  // Inicializar Asignatura según las disponibles para el maestro si aún no hay una seleccionada
  useEffect(() => {
    if (!selectedSubject) {
      const validSubjects = LEVEL_BASE_SUBJECTS[selectedLevel] || LEVEL_BASE_SUBJECTS['primaria-baja'];
      const teacherSchedules = schedulesList.filter(s => s.teacherId === currentTeacher.id);
      const matchedTeacherSubject = teacherSchedules.find(ts => validSubjects.some(vs => vs.id === ts.subjectId));
      if (matchedTeacherSubject) {
        setSelectedSubject(matchedTeacherSubject.subjectId);
      } else if (validSubjects.length > 0) {
        setSelectedSubject(validSubjects[0].id);
      }
    }
  }, [schedulesList, currentTeacher, selectedLevel, selectedSubject]);

  // Cargar historial de planeaciones al montar
  useEffect(() => {
    const saved = localStorage.getItem('iskool_generated_plannings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlanningsHistory(parsed);
        if (parsed.length > 0) {
          setActivePlanning(parsed[0]);
        }
      } catch (e) {
        console.error("Error al cargar historial de planeaciones", e);
      }
    }
  }, []);

  // Guardar historial en localStorage
  const saveHistory = (newHistory: any[]) => {
    setPlanningsHistory(newHistory);
    localStorage.setItem('iskool_generated_plannings', JSON.stringify(newHistory));
  };

  // --- Manejadores de Archivos ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const type: 'image' | 'pdf' = file.type.includes('pdf') ? 'pdf' : 'image';
    
    setUploadedFile({
      name: file.name,
      type,
      size: sizeMB
    });

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Auto-rellenar input con el nombre del archivo solo si es un nombre descriptivo (no un nombre genérico de cámara)
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "") // Quitar extensión
      .replace(/[_-]/g, " ");   // Reemplazar guiones por espacios
    
    const isGenericFileName = /^(IMG|photo|foto|image|whatsapp|captura|screenshot|scan|doc|file|[0-9_\-\s]+$)/i.test(cleanName);
    if (!inputText && !isGenericFileName) {
      setInputText(cleanName);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- Guardar API Key ---
  const handleSaveApiKey = (key: string) => {
    setAiApiKey(key);
    localStorage.setItem('iskool_ai_api_key', key);
    alert('Clave de Inteligencia Artificial guardada de forma segura en tu navegador.');
    setApiSettingsOpen(false);
  };

  const teacherFullName = `${currentTeacher?.first_name || ''} ${currentTeacher?.last_name || ''}`.trim();
  const isIsraelLopez = 
    teacherFullName.toLowerCase().includes('israel') ||
    (currentTeacher?.email || '').toLowerCase().includes('israel') ||
    currentTeacher?.id === 'usr-teacher-1' ||
    currentTeacher?.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55';

  // --- Generador Didáctico de Planeación ---
  const handleGenerate = async () => {
    if (!inputText.trim() && !uploadedFile) {
      alert("Por favor introduce una idea, palabra clave o sube una fotografía o documento.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setActivePlanning(null); // Limpiar resultado previo para garantizar que no se mezcle estado anterior

    // Animación de pasos de IA
    const interval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < generationSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    let resultPlanning: any = null;
    let foundInVault = false;
    const currentSubjectObj = displaySubjects.find(s => s.id === selectedSubject);
    const currKey = mapSubjectToCurriculumKey(selectedSubject, currentSubjectObj?.name || '');

    // Step 1: Si hay texto específico y NO hay imagen nueva para analizar, consultar prioritariamente la Bóveda Curricular
    if (!bypassVault && inputText.trim() && !imagePreview) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const authHeaders: Record<string, string> = {};
        if (sessionData?.session?.access_token) {
          authHeaders['Authorization'] = `Bearer ${sessionData.session.access_token}`;
        }

        const obsRes = await fetch(`/api/vault?q=${encodeURIComponent(inputText.trim())}&level=${encodeURIComponent(selectedLevel)}&subject=${encodeURIComponent(currKey)}&sessions=${encodeURIComponent(sessionCount.toString())}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: authHeaders
        });
        if (obsRes.ok) {
          const obsData = await obsRes.json();
          if (obsData.found && obsData.planning) {
            // VERIFICACIÓN ESTRICTA DE COINCIDENCIA TEMÁTICA PARA PREVENIR MEZCLAS:
            const inputTopicCore = cleanCoreTopicName(inputText).toLowerCase();
            const retrievedTitle = (obsData.planning.title || '').toLowerCase();
            const retrievedPda = (obsData.planning.pda || '').toLowerCase();

            const inputIsIndep = /independ/i.test(inputTopicCore);
            const inputIsRev = !inputIsIndep && /revoluc/i.test(inputTopicCore);

            const retrievedIsIndep = /independ|hidalgo|morelos|allende|aldama|josefa/i.test(retrievedTitle) || /independ|hidalgo|morelos|allende|aldama|josefa/i.test(retrievedPda);
            const retrievedIsRev = /revoluc|madero|zapata|villa|carranza|porfir/i.test(retrievedTitle) || /revoluc|madero|zapata|villa|carranza|porfir/i.test(retrievedPda);

            const isThemeMismatched = 
              (inputIsIndep && retrievedIsRev) ||
              (inputIsRev && retrievedIsIndep) ||
              (inputIsIndep && !retrievedIsIndep) ||
              (inputIsRev && !retrievedIsRev);

            if (isThemeMismatched) {
              console.warn("⚠️ [Bóveda Curricular]: Discordancia temático-curricular detectada y descartada para evitar mezclas:", retrievedTitle);
            } else {
              resultPlanning = obsData.planning;
              foundInVault = true;
              console.log("📚 [Bóveda Curricular]: Planeación existente recuperada con éxito:", obsData.filename);
            }
          }
        }
      } catch (e) {
        console.warn("Aviso de consulta a Bóveda Curricular:", e);
      }
    } else if (imagePreview) {
      console.log("📸 [Análisis Multimodal]: Procesando imagen adjunta con Inteligencia Artificial Pedagógica...");
    } else {
      console.log("⚡ [Modo Innovación IA]: Bypass activado. Generando nueva propuesta pedagógica...");
    }

    // Esperar a que la simulación termine visualmente
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Si NO existe en Bóveda o se subió una imagen, activar motor de Inteligencia Artificial Pedagógica
    if (!resultPlanning) {
      console.log(`🤖 [IA NEM 2024]: Generando nueva planeación didáctica (${sessionCount} sesiones)...`);
      if (aiApiKey.trim()) {
        try {
          resultPlanning = await callAiService(inputText, selectedLevel, currKey, sessionCount, imagePreview, selectedSuggestedPda);
        } catch (err) {
          console.error("Fallo llamada al servicio de IA, usando motor pedagógico local", err);
          resultPlanning = generateLocalNEMPlanning(inputText, selectedLevel, currKey, sessionCount, selectedSuggestedPda, currentSubjectObj);
        }
      } else {
        resultPlanning = generateLocalNEMPlanning(inputText, selectedLevel, currKey, sessionCount, selectedSuggestedPda, currentSubjectObj);
      }
    }

    if (resultPlanning) {
      const levelNames: Record<string, string> = {
        'preescolar':     'Preescolar (Fase 2: 1º a 3º)',
        'primaria-baja':  'Primaria Baja (Fase 3: 1º y 2º Grado)',
        'primaria-media': 'Primaria Media (Fase 4: 3º y 4º Grado)',
        'primaria-alta':  'Primaria Alta (Fase 5: 5º y 6º Grado)',
        'secundaria':     'Secundaria (Fase 6: 1º a 3º Grado)',
        'preparatoria':   'Preparatoria / Bachillerato General'
      };

      resultPlanning.subjectId = selectedSubject;
      resultPlanning.subjectName = currentSubjectObj?.name || displaySubjects.find(s => s.id === selectedSubject)?.name || 'Asignatura';
      if (currentSubjectObj?.campoFormativo) {
        resultPlanning.campoFormativo = currentSubjectObj.campoFormativo;
      }
      resultPlanning.levelId = selectedLevel;
      resultPlanning.levelName = levelNames[selectedLevel] || selectedLevel;
      resultPlanning.duration = `${sessionCount} ${sessionCount === 1 ? 'sesión' : 'sesiones'} de 50 minutos (Total: ${sessionCount * 50} min)`;
      if (selectedSuggestedPda && !foundInVault) {
        resultPlanning.pda = selectedSuggestedPda;
      }

      // Proponer y actualizar el nombre en la interfaz si el usuario subió imagen o no tenía título descriptivo
      if (resultPlanning.title && (!inputText.trim() || /^(IMG|photo|foto|image|whatsapp|captura|screenshot|scan|doc|file|[0-9_\-\s]+$)/i.test(inputText.trim()))) {
        const cleanTitleDisplay = resultPlanning.title.replace(/^(Proyecto Didáctico:|Planeación:|📚 Proyecto Didáctico Integral:)\s*/i, '').trim();
        setInputText(cleanTitleDisplay);
      }

      // Step 3: Guardar automáticamente en la Bóveda Curricular y Sincronización Remota
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (sessionData?.session?.access_token) {
          headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
        }

        const obsSaveRes = await fetch('/api/vault', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...resultPlanning,
            teacherName: isIsraelLopez ? 'Prof. Israel López Ángeles' : `${currentTeacher.first_name} ${currentTeacher.last_name}`,
            syncGit: isIsraelLopez || true,
            isSuperUser: isIsraelLopez
          })
        });

        if (obsSaveRes.ok) {
          const obsData = await obsSaveRes.json();
          if (obsData.gitSyncStatus === 'synced_and_pushed') {
            console.log("🚀 Planeación guardada en Bóveda Curricular y sincronizada en repositorio remoto.");
            resultPlanning.gitSynced = true;
          }
        }
      } catch (e) {
        console.warn("No se pudo auto-guardar en Bóveda Curricular:", e);
      }
    }

    clearInterval(interval);
    setIsGenerating(false);

    // Guardar en Historial y seleccionar
    const updatedHistory = [resultPlanning, ...planningsHistory.filter(p => p.id !== resultPlanning.id)];
    saveHistory(updatedHistory);
    setActivePlanning(resultPlanning);
  };

  // --- Llamada al Servicio de Inteligencia Artificial Pedagógica (con Soporte Multimodal para Fotos y Libros) ---
  const callAiService = async (
    promptText: string, 
    level: string, 
    subject: string, 
    totalSessions: number = 10,
    imageBase64?: string | null,
    targetPda?: string
  ) => {
    const count = Math.max(1, Math.min(30, Number(totalSessions) || 10));
    const durationStr = `${count} ${count === 1 ? 'sesión' : 'sesiones'} de 50 minutos (Total: ${count * 50} min)`;
    const isParabola = /parabol|cuadrat|segundo grado|tiro parab/i.test(promptText);
    const levelNames: Record<string, string> = {
      'preescolar': 'Preescolar (Fase 2: 1º a 3º)',
      'primaria-baja': 'Primaria Baja (Fase 3: 1º y 2º Grado)',
      'primaria-media': 'Primaria Media (Fase 4: 3º y 4º Grado)',
      'primaria-alta': 'Primaria Alta (Fase 5: 5º y 6º Grado)',
      'secundaria': isParabola ? '3º de Secundaria • Fase 6 (14-15 años)' : 'Secundaria (1º a 3º Grado) • Fase 6',
      'preparatoria': 'Preparatoria / Bachillerato General'
    };

    const levelLabel = levelNames[level] || 'Nivel Educativo';
    const subjectLabel = subject === 'matematicas' ? 'Matemáticas (Saberes y Pensamiento Científico)' :
                         subject === 'ciencias' ? 'Ciencias / Física y Química (Saberes y Pensamiento Científico)' : 'Lenguajes (Español y Comunicación)';

    const systemPrompt = `Eres un Asesor Pedagógico y Diseñador Curricular Nacional de la SEP, experto en la Nueva Escuela Mexicana (NEM 2024).
Debes generar una planeación didáctica RIGUROSA, CONCRETA, ALTAMENTE PRÁCTICA Y 100% APLICABLE en el aula para un profesor.

${targetPda ? `🎯 PDA OFICIAL SELECCIONADO POR EL DOCENTE:
"${targetPda}"
Debes respetar y utilizar este PDA textual oficial para estructurar todas las actividades, entregables y preguntas detonadoras de las sesiones.` : ''}

${imageBase64 ? `📸 INSTRUCCIÓN MULTIMODAL VISUAL:
Se adjunta una imagen o fotografía subida por el docente (página de libro de texto SEP, apunte, ejercicio, diagrama o foto de pizarrón).
1. ANALIZA MINUCIOSAMENTE el contenido visual, los textos, fórmulas, diagramas y conceptos presentes en la imagen.
2. Identifica con precisión el TEMA CENTRAL y propón un TÍTULO PEDAGÓGICO FORMAL, INSPIRADOR Y MOTIVADOR para el proyecto didáctico (en "title", ej. "La Magia de la Fotosíntesis y la Vida Comunitaria", "Explorando las Ecuaciones Cuadráticas en la Arquitectura").
3. Escribe en "detectedTopic" el tema pedagógico exacto detectado en la imagen.
4. Identifica y redacta el Proceso de Desarrollo de Aprendizaje (PDA) oficial y riguroso de la NEM 2024 correspondiente a la Fase y Grado indicados.` : ''}

REGLAS PEDAGÓGICAS ESTRICTAS (NEM 2024):
1. DOSIFICACIÓN EXACTA EN ${count} SESIONES DE 50 MINUTOS (Total: ${count * 50} min):
   - Cada sesión debe incluir:
     • Minutero exacto: Inicio (10 min), Desarrollo (30 min) y Cierre (10 min).
     • Preguntas detonadoras/clave (2 preguntas por sesión).
     • Libro de texto gratuito oficial de la SEP y página exacta (ej. "Nuestros Saberes 2º Grado, págs. 48-52" o correspondiente al nivel/fase).
     • Materiales manipulables y recursos.
     • Entregable parcial de la sesión (producto tangible).
2. ARTICULACIÓN CURRICULAR (PDAs ENLAZADOS):
   - Proporciona el PDA Principal y al menos 2 a 3 PDAs Articulados de otros campos formativos.
3. PROPUESTA DE PROYECTO FINAL INTEGRADOR:
   - Título formal, problemática comunitaria real, propósito, entregable final tangible y rúbrica analítica cualitativa de 3 niveles (Sobresaliente, Satisfactorio, En Proceso).

Nivel educativo: ${levelLabel}.
Asignatura: ${subjectLabel}.
Tema/Instrucción del docente: "${promptText || 'Identificar y planificar a partir de la imagen adjunta'}".
Número de sesiones solicitadas: ${count}.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "title": "Título pedagógico formal y motivador del proyecto",
  "detectedTopic": "Tema educativo central detectado",
  "campoFormativo": "Saberes y Pensamiento Científico",
  "ejesArticuladores": ["Pensamiento Crítico", "Apropiación de las Culturas a través de la Lectura y la Escritura", "Inclusión", "Vida Saludable"],
  "pda": "${targetPda || 'Redacción formal del PDA oficial de la NEM 2024 correspondiente a la Fase y grado'}",
  "duration": "${durationStr}",
  "preguntasDetonadoras": [
    "Pregunta detonadora 1",
    "Pregunta detonadora 2",
    "Pregunta detonadora 3"
  ]
}`;

    // Construir partes del contenido (incluyendo imagen base64 si existe)
    const requestParts: any[] = [];
    
    if (imageBase64 && imageBase64.startsWith('data:')) {
      const [header, data] = imageBase64.split(';base64,');
      const mimeType = header.replace('data:', '') || 'image/jpeg';
      requestParts.push({
        inline_data: {
          mime_type: mimeType,
          data: data
        }
      });
    }

    requestParts.push({
      text: `${systemPrompt}\n\nGenera la planeación didáctica completa en español con ${count} sesiones exactas.`
    });

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
      }

      const response = await fetch('/api/ai/planning', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          promptText,
          level,
          subject,
          count,
          imageBase64,
          targetPda,
          userApiKey: aiApiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = data.planning;
        if (!parsed) throw new Error('No planning data returned');

        const effectiveTopic = cleanCoreTopicName(parsed.detectedTopic || promptText || parsed.title || 'Tema Curricular Situado');
        const fallbackSessions = generateChronometerSessions(level, subject, effectiveTopic, count);
        const fallbackPdas = getArticulatedPdas(level, subject, effectiveTopic);
        const fallbackProject = generateFinalProjectProposal(level, subject, effectiveTopic);

        const proposedTitle = sanitizeSpanishPedagogicalGrammar(parsed.title || `Proyecto Didáctico: ${effectiveTopic} — ${levelLabel}`);
        const detonatingQs = Array.isArray(parsed.preguntasDetonadoras) && parsed.preguntasDetonadoras.length >= 2 
          ? parsed.preguntasDetonadoras.map((q: string) => sanitizeSpanishPedagogicalGrammar(q))
          : generateDetonatingQuestions(effectiveTopic, level, subject);

        return {
          id: 'plan-' + Date.now(),
          title: proposedTitle,
          subjectId: subject,
          subjectName: subjectLabel,
          levelId: level,
          levelName: levelLabel,
          campoFormativo: parsed.campoFormativo || (subject === 'lenguajes' ? 'Lenguajes' : 'Saberes y Pensamiento Científico'),
          ejesArticuladores: parsed.ejesArticuladores || ['Pensamiento Crítico', 'Inclusión', 'Vida Saludable'],
          pda: sanitizeSpanishPedagogicalGrammar(targetPda || parsed.pda || fallbackPdas[0]?.pda || 'PDA Oficial NEM'),
          pdasArticulados: fallbackPdas,
          duration: durationStr,
          preguntasDetonadoras: detonatingQs,
          sesiones: fallbackSessions,
          proyectoIntegrador: fallbackProject,
          inicio: fallbackSessions[0]?.actividadInicio + '\n' + fallbackSessions[0]?.actividadDesarrollo + '\n' + fallbackSessions[0]?.actividadCierre,
          desarrollo: fallbackSessions.length > 2
            ? fallbackSessions.slice(1, -1).map(s => `📌 SESIÓN ${s.numero} (${s.duracionTotal}): ${s.titulo}\n${s.actividadInicio}\n${s.actividadDesarrollo}\n${s.actividadCierre}\n📖 Libro SEP: ${s.libroSep.titulo}, ${s.libroSep.paginas}\n📄 Entregable: ${s.entregableSesion}`).join('\n\n')
            : (fallbackSessions[1] ? `📌 SESIÓN ${fallbackSessions[1].numero}: ${fallbackSessions[1].titulo}\n${fallbackSessions[1].actividadDesarrollo}` : 'Desarrollo en sesión única.'),
          cierre: fallbackSessions.length > 1
            ? `📌 SESIÓN FINAL ${fallbackSessions[fallbackSessions.length - 1].numero} (${fallbackSessions[fallbackSessions.length - 1].duracionTotal}): ${fallbackSessions[fallbackSessions.length - 1].titulo}\n${fallbackSessions[fallbackSessions.length - 1].actividadInicio}\n${fallbackSessions[fallbackSessions.length - 1].actividadDesarrollo}\n${fallbackSessions[fallbackSessions.length - 1].actividadCierre}\n📖 Libro SEP: ${fallbackSessions[fallbackSessions.length - 1].libroSep.titulo}, ${fallbackSessions[fallbackSessions.length - 1].libroSep.paginas}\n📄 Entregable: ${fallbackSessions[fallbackSessions.length - 1].entregableSesion}`
            : fallbackSessions[0]?.actividadCierre || '',
          evaluacion: `RÚBRICA FORMATIVA ANALÍTICA (NIVELES NEM 2024):\n• ${fallbackProject.rubrica.criterio1.nombre}:\n  - Sobresaliente: ${fallbackProject.rubrica.criterio1.sobresaliente}\n  - Satisfactorio: ${fallbackProject.rubrica.criterio1.satisfactorio}\n  - En Proceso: ${fallbackProject.rubrica.criterio1.enProceso}\n• ${fallbackProject.rubrica.criterio2.nombre}:\n  - Sobresaliente: ${fallbackProject.rubrica.criterio2.sobresaliente}\n  - Satisfactorio: ${fallbackProject.rubrica.criterio2.satisfactorio}\n  - En Proceso: ${fallbackProject.rubrica.criterio2.enProceso}\n• ${fallbackProject.rubrica.criterio3.nombre}:\n  - Sobresaliente: ${fallbackProject.rubrica.criterio3.sobresaliente}\n  - Satisfactorio: ${fallbackProject.rubrica.criterio3.satisfactorio}\n  - En Proceso: ${fallbackProject.rubrica.criterio3.enProceso}`,
          materiales: `MATERIALES POR SESIÓN Y RECURSOS DIDÁCTICOS:\n• Libros de Texto Gratuitos de la SEP asignados con páginas específicas.\n• Materiales manipulables (fichas, regletas, instrumentos de medición, papel bond, colores).\n• Entregables parciales acumulables en la bitácora escolar.\n\nEVIDENCIA ENTREGABLE DEL PROYECTO:\n• ${fallbackProject.productoFinal}`,
          createdAt: formatSpanishDateInLetters(new Date())
        };
      }
    } catch (err) {
      console.warn("Fallo llamada al servicio de IA, usando generador curricular integral", err);
    }

    return generateLocalNEMPlanning(promptText, level, subject, count, targetPda);
  };

  // --- Generador Heurístico Local Integral (NEM 2024) ---
  const generateLocalNEMPlanning = (
    promptText: string, 
    level: string, 
    subject: string, 
    totalSessions: number = 10,
    customPda?: string,
    customSubjectObj?: BaseSubjectDef
  ): CompleteNEMPlanning => {
    const count = Math.max(1, Math.min(30, Number(totalSessions) || 10));
    const durationStr = `${count} ${count === 1 ? 'sesión' : 'sesiones'} de 50 minutos (Total: ${count * 50} min)`;
    
    // Si el texto es genérico (de cámara o vacío), asignar un tema situado auténtico según la materia y nivel
    const isGeneric = !promptText.trim() || /^(IMG|photo|foto|image|whatsapp|captura|screenshot|scan|doc|file|[0-9_\-\s]+$)/i.test(promptText.trim());
    
    let effectiveTopic = promptText.trim();
    if (isGeneric) {
      if (subject === 'matematicas') {
        effectiveTopic = level.includes('secundaria') ? 'Modelación y Exploración de Funciones Cuadráticas' : 'Fracciones y Pensamiento Numérico con Material Concreto';
      } else if (subject === 'ciencias') {
        effectiveTopic = level.includes('secundaria') ? 'Indagación Científica y Fenómenos Químicos del Entorno' : 'Ecosistemas Locales y Conservación Ambiental';
      } else if (subject === 'historia' || (customSubjectObj && (customSubjectObj.id.includes('ent') || customSubjectObj.id.includes('his')))) {
        effectiveTopic = 'Costumbres, Paisajes y Tradiciones de Nuestra Entidad y Localidad';
      } else {
        effectiveTopic = level.includes('secundaria') ? 'Textos Argumentativos y Expresión Dialéctica' : 'Narración y Creación de Cuentos Colectivos';
      }
    }

    const cleanTopic = cleanCoreTopicName(effectiveTopic);
    const capitalizedTopic = cleanTopic;

    const levelNames: Record<string, string> = {
      'preescolar':     'Preescolar (Fase 2: 1º a 3º)',
      'primaria-baja':  'Primaria Baja (Fase 3: 1º y 2º Grado)',
      'primaria-media': 'Primaria Media (Fase 4: 3º y 4º Grado)',
      'primaria-alta':  'Primaria Alta (Fase 5: 5º y 6º Grado)',
      'secundaria':     'Secundaria (Fase 6: 1º a 3º Grado)',
      'preparatoria':   'Preparatoria / Bachillerato General'
    };

    const subjectNames: Record<string, string> = {
      'matematicas': 'Matemáticas (Saberes y Pensamiento Científico)',
      'ciencias':    'Ciencias Naturales y Conocimiento del Medio (Saberes y Pensamiento Científico)',
      'lenguajes':   'Español / Lenguajes (Lenguajes)',
      'historia':    'Historia y La Entidad donde Vivo (Ética, Naturaleza y Sociedades)',
      'artes':       'Artes (Lenguajes)',
      'humano':      'De lo Humano y lo Comunitario'
    };

    const subName = customSubjectObj?.name || subjectNames[subject] || 'Asignatura';
    const subCampo = customSubjectObj?.campoFormativo;

    const isLanguage = subCampo === 'Lenguajes' || subject === 'lenguajes' || (!subCampo && (!subject && /cuento|fabula|leyenda|mito|carta|epistol|mensaje|buzon|correo|poema|narrat|lectura|escrib/i.test(cleanTopic)));
    const isMath = (subCampo === 'Saberes y Pensamiento Científico' && (subject.includes('mat') || /num|suma|resta|multiplic|fracc|geom|parabol|cuadrat|conteo|tangram/i.test(cleanTopic)));
    const isScience = subCampo === 'Saberes y Pensamiento Científico' && !isMath;
    const isHistory = subCampo === 'Ética, Naturaleza y Sociedades' || subject === 'historia';
    const isHuman = subCampo === 'De lo Humano y lo Comunitario' || subject === 'humano';

    const campo = subCampo || (isLanguage ? 'Lenguajes' : isHistory ? 'Ética, Naturaleza y Sociedades' : isHuman ? 'De lo Humano y lo Comunitario' : 'Saberes y Pensamiento Científico');
    const ejes = ['Pensamiento Crítico', 'Inclusión', 'Vida Saludable', 'Apropiación de las Culturas a través de la Lectura y la Escritura'];

    const isTradition = /muert|difunt|ofrend|calaver|altar|cempasuchil|pan de muerto|costumbre|festividad|tradicion|patrimonio biocultural|celebrac|panteon|copal|alfeñique|papel picado|fiesta patronal|guelaguetza|posada|navidad/i.test(cleanTopic);
    const pdaMap = getPdaMap(capitalizedTopic);
    const pdaKey = isTradition
      ? (isLanguage ? 'language' : isHuman ? 'health' : isScience ? 'ecology' : 'history')
      : (isHistory ? 'history' : isHuman ? 'health' : isLanguage ? 'language' : isMath ? 'math' : isScience ? 'ecology' : 'default');
    const rawPda = customPda || pdaMap[level]?.[pdaKey] || pdaMap['primaria-baja']?.['default'] || `Fase correspondiente: Desarrolla y aplica habilidades prácticas y conceptuales sobre "${capitalizedTopic}" para resolver retos comunitarios.`;
    const pda = sanitizeSpanishPedagogicalGrammar(rawPda);

    const sesionesList = generateChronometerSessions(level, subName, cleanTopic, count);
    const pdasArticulados = getArticulatedPdas(level, subName, cleanTopic);
    const proyectoIntegrador = generateFinalProjectProposal(level, subName, cleanTopic);
    const preguntasDetonadoras = generateDetonatingQuestions(cleanTopic, level, subName);

    return {
      id: 'plan-' + Date.now(),
      title: sanitizeSpanishPedagogicalGrammar(`Proyecto didáctico: ${capitalizedTopic} — ${levelNames[level] || level}`),
      subjectId: customSubjectObj?.id || subject,
      subjectName: subName,
      levelId: level,
      levelName: levelNames[level] || 'Nivel Educativo',
      campoFormativo: campo,
      ejesArticuladores: ejes,
      pda,
      pdasArticulados,
      duration: durationStr,
      preguntasDetonadoras: preguntasDetonadoras.map(p => sanitizeSpanishPedagogicalGrammar(p)),
      sesiones: sesionesList,
      proyectoIntegrador,
      inicio: sesionesList[0]?.actividadInicio + '\n' + sesionesList[0]?.actividadDesarrollo + '\n' + sesionesList[0]?.actividadCierre,
      desarrollo: sesionesList.length > 2
        ? sesionesList.slice(1, -1).map(s => `📌 SESIÓN ${s.numero} (${s.duracionTotal}): ${s.titulo}\n${s.actividadInicio}\n${s.actividadDesarrollo}\n${s.actividadCierre}\n📖 Libro SEP: ${s.libroSep.titulo}, ${s.libroSep.paginas}\n📄 Entregable: ${s.entregableSesion}`).join('\n\n')
        : (sesionesList[1] ? `📌 SESIÓN ${sesionesList[1].numero}: ${sesionesList[1].titulo}\n${sesionesList[1].actividadDesarrollo}` : 'Desarrollo en sesión única.'),
      cierre: sesionesList.length > 1
        ? `📌 SESIÓN FINAL ${sesionesList[sesionesList.length - 1].numero} (${sesionesList[sesionesList.length - 1].duracionTotal}): ${sesionesList[sesionesList.length - 1].titulo}\n${sesionesList[sesionesList.length - 1].actividadInicio}\n${sesionesList[sesionesList.length - 1].actividadDesarrollo}\n${sesionesList[sesionesList.length - 1].actividadCierre}\n📖 Libro SEP: ${sesionesList[sesionesList.length - 1].libroSep.titulo}, ${sesionesList[sesionesList.length - 1].libroSep.paginas}\n📄 Entregable: ${sesionesList[sesionesList.length - 1].entregableSesion}`
        : sesionesList[0]?.actividadCierre || '',
      evaluacion: `RÚBRICA FORMATIVA ANALÍTICA (NIVELES NEM 2024):\n• ${proyectoIntegrador.rubrica.criterio1.nombre}:\n  - Sobresaliente: ${proyectoIntegrador.rubrica.criterio1.sobresaliente}\n  - Satisfactorio: ${proyectoIntegrador.rubrica.criterio1.satisfactorio}\n  - En Proceso: ${proyectoIntegrador.rubrica.criterio1.enProceso}\n• ${proyectoIntegrador.rubrica.criterio2.nombre}:\n  - Sobresaliente: ${proyectoIntegrador.rubrica.criterio2.sobresaliente}\n  - Satisfactorio: ${proyectoIntegrador.rubrica.criterio2.satisfactorio}\n  - En Proceso: ${proyectoIntegrador.rubrica.criterio2.enProceso}\n• ${proyectoIntegrador.rubrica.criterio3.nombre}:\n  - Sobresaliente: ${proyectoIntegrador.rubrica.criterio3.sobresaliente}\n  - Satisfactorio: ${proyectoIntegrador.rubrica.criterio3.satisfactorio}\n  - En Proceso: ${proyectoIntegrador.rubrica.criterio3.enProceso}`,
      materiales: `MATERIALES POR SESIÓN Y RECURSOS DIDÁCTICOS:\n• Libros de Texto Gratuitos de la SEP asignados con páginas específicas.\n• Materiales manipulables (fichas, regletas, instrumentos de medición, papel bond, colores).\n• Entregables parciales acumulables en la bitácora escolar.\n\nEVIDENCIA ENTREGABLE DEL PROYECTO:\n• ${proyectoIntegrador.productoFinal}`,
      createdAt: formatSpanishDateInLetters(new Date())
    };
  };

  // --- Actualizar campos editados ---
  const updateActivePlanningField = (key: string, value: any) => {
    if (!activePlanning) return;
    const updated = { ...activePlanning, [key]: value };
    setActivePlanning(updated);
    
    // Actualizar también en el historial
    const updatedHistory = planningsHistory.map(p => p.id === activePlanning.id ? updated : p);
    saveHistory(updatedHistory);
  };

  // --- Borrar Planeación ---
  const handleDeletePlanning = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Seguro que deseas eliminar esta planeación del historial?")) {
      const updatedHistory = planningsHistory.filter(p => p.id !== id);
      saveHistory(updatedHistory);
      if (activePlanning?.id === id) {
        setActivePlanning(updatedHistory.length > 0 ? updatedHistory[0] : null);
      }
    }
  };

  // --- Descarga a PDF usando window.print ---
  const handlePrint = () => {
    if (!activePlanning) return;
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-6 py-4 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 flex items-center gap-3 animate-bounce">
          <Award className="h-6 w-6 text-yellow-500 animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500 text-left">Gremio Actualizado</span>
            <span className="text-xs font-bold text-left">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Selector de Módulo */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-px gap-4 no-print">
        <button
          type="button"
          onClick={() => setActiveModule('generator')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeModule === 'generator'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300'
          }`}
        >
          <Wand2 className="h-4.5 w-4.5" />
          Generador de Planeación Didáctica
        </button>
        <button
          type="button"
          onClick={() => setActiveModule('programa-analitico')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeModule === 'programa-analitico'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300'
          }`}
        >
          <BookOpen className="h-4.5 w-4.5" />
          Programa Analítico (SEP)
        </button>
      </div>

      {activeModule === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* -------------------- COLUMNA IZQUIERDA: INPUTS (lg:col-span-4) -------------------- */}
      <div className="lg:col-span-4 flex flex-col gap-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm text-left no-print">
        
        {/* Banner de Derechos Únicos / Super Usuario: Prof. Israel López Ángeles */}
        {isIsraelLopez && (
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-3.5 rounded-2xl text-white shadow-md shadow-purple-500/20 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-300" />
                Super Usuario Creador
              </span>
              <span className="text-[9px] font-mono text-purple-200 bg-black/20 px-1.5 py-0.5 rounded-md">
                Población Masiva
              </span>
            </div>
            <h4 className="text-xs font-black">
              Prof. Israel López Ángeles
            </h4>
            <div className="text-[10px] text-purple-100 leading-snug space-y-0.5">
              <p>⚡ <strong>Bypass Bóveda:</strong> Directo a consulta y generación con Inteligencia Artificial.</p>
              <p>🚀 <strong>Auto-Sincronización:</strong> Persistencia en Bóveda Curricular y Sincronización Remota.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Wand2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Configurar Insumos
          </h3>
          <button 
            onClick={() => setApiSettingsOpen(!apiSettingsOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 transition-colors"
            title="Configurar Clave de Inteligencia Artificial"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario API Key */}
        {apiSettingsOpen && (
          <div className="bg-blue-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-blue-150/40 dark:border-zinc-850 flex flex-col gap-3">
            <h4 className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide">Clave de Acceso para Inteligencia Artificial</h4>
            <p className="text-[9.5px] text-zinc-500 leading-normal">
              Opcional. Si deseas usar el motor de inteligencia artificial en la nube en lugar del motor pedagógico local, introduce tu clave de acceso. Se almacena únicamente en tu navegador de forma segura.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder="Clave de API..."
                className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-mono focus:outline-none"
              />
              <button
                onClick={() => handleSaveApiKey(aiApiKey)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Nivel Educativo y Asignatura */}
        <div className="grid grid-cols-2 gap-4 font-bold text-xs text-zinc-800 dark:text-zinc-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider">Nivel Educativo</label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                const newLevel = e.target.value;
                setSelectedLevel(newLevel);
                const validSubjects = LEVEL_BASE_SUBJECTS[newLevel] || LEVEL_BASE_SUBJECTS['primaria-baja'];
                const newSubId = validSubjects.some(s => s.id === selectedSubject) 
                  ? selectedSubject 
                  : (validSubjects[0]?.id || '');
                setSelectedSubject(newSubId);
                recalculatePdasNow(inputText, newLevel, newSubId);
              }}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value="preescolar">Preescolar (Fase 2: 1º a 3º)</option>
              <option value="primaria-baja">Primaria Baja (Fase 3: 1º y 2º Grado)</option>
              <option value="primaria-media">Primaria Media (Fase 4: 3º y 4º Grado)</option>
              <option value="primaria-alta">Primaria Alta (Fase 5: 5º y 6º Grado)</option>
              <option value="secundaria">Secundaria (Fase 6: 1º a 3º Grado)</option>
              <option value="preparatoria">Preparatoria / Bachillerato</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider">Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const newSubId = e.target.value;
                setSelectedSubject(newSubId);
                recalculatePdasNow(inputText, selectedLevel, newSubId);
              }}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-bold"
            >
              {displaySubjects?.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector en Lista de Número de Sesiones Disponibles */}
        <div className="flex flex-col gap-1.5 font-bold text-xs text-zinc-800 dark:text-zinc-200">
          <div className="flex items-center justify-between">
            <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Número de Sesiones Disponibles
            </label>
            <span className="text-[9.5px] font-black text-blue-600 dark:text-blue-400">
              Total: {sessionCount * 50} min ({sessionCount <= 5 ? `${sessionCount} días` : `${Math.ceil(sessionCount / 5)} sem`})
            </span>
          </div>

          <select
            value={sessionCount}
            onChange={(e) => setSessionCount(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-bold"
          >
            <option value={1}>1 sesión (50 min • Sesión única / Taller intensivo)</option>
            <option value={2}>2 sesiones (100 min • 2 días / Apertura y Cierre)</option>
            <option value={3}>3 sesiones (150 min • 3 días / Secuencia didáctica corta)</option>
            <option value={4}>4 sesiones (200 min • 4 días / Desarrollo temático)</option>
            <option value={5}>5 sesiones (250 min • 1 semana lectiva completa)</option>
            <option value={6}>6 sesiones (300 min • Secuencia extendida)</option>
            <option value={8}>8 sesiones (400 min • Proyecto quincenal)</option>
            <option value={10}>10 sesiones (500 min • 2 semanas lectivas / Proyecto integrado)</option>
            <option value={12}>12 sesiones (600 min • Unidad temática avanzada)</option>
          </select>
        </div>

        {/* Toggle Bypass Bóveda / Forzar Nueva Variante IA */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 text-xs mt-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">Modo Innovación IA (Generar Nueva Propuesta)</p>
              <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400">Forzar una planeación didáctica diferente sin reutilizar registros previos de la Bóveda</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBypassVault(!bypassVault)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bypassVault ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${bypassVault ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Entrada de Texto o Párrafo */}
        <div className="flex flex-col gap-1.5 text-xs relative">
          <label className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">Idea, Palabra Clave o Párrafo (Tema)</label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => {
              const newText = e.target.value;
              setInputText(newText);
              // Al modificar el tema, desvincular la planeación activa previa si ya no concuerda para evitar mezclas
              if (activePlanning) {
                const prevTitle = (activePlanning.title || '').toLowerCase();
                const newTextCore = cleanCoreTopicName(newText).toLowerCase();
                if (newTextCore.length >= 3 && !prevTitle.includes(newTextCore) && !newTextCore.includes(cleanCoreTopicName(prevTitle).toLowerCase())) {
                  setActivePlanning(null); // Evitar mostrar o mezclar con la planeación anterior en pantalla
                }
              }
              if (newText.trim().length >= 2) {
                recalculatePdasNow(newText, selectedLevel, selectedSubject);
              } else {
                setPdaSuggestions([]);
                setSelectedSuggestedPda('');
              }
            }}
            placeholder="Escribe el tema de la clase, ejemplo: 'fracciones equivalentes con pizza', 'cuidado del agua', 'biodigestores', 'leyendas prehispánicas'..."
            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 leading-relaxed font-semibold resize-none"
          />
          {/* Sugerencias Inteligentes de PDAs Oficiales de la NEM */}
          {pdaSuggestions.length > 0 && (
            <div className="mt-2 flex flex-col gap-2 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <label className="text-[9.5px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  PDAs Oficiales Detectados ({pdaSuggestions.length})
                </label>
                <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                  {selectedLevel === 'preescolar' ? 'Fase 2 (Preescolar)' :
                   selectedLevel === 'primaria-baja' ? 'Fase 3 (1º y 2º)' :
                   selectedLevel === 'primaria-media' ? 'Fase 4 (3º y 4º)' :
                   selectedLevel === 'primaria-alta' ? 'Fase 5 (5º y 6º)' :
                   selectedLevel === 'secundaria' ? 'Fase 6 (Secundaria)' : 'Bachillerato'}
                </span>
              </div>
              
              <select
                onChange={(e) => {
                  setSelectedSuggestedPda(e.target.value);
                }}
                className="w-full text-[10.5px] p-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer shadow-xs"
                value={selectedSuggestedPda}
              >
                {pdaSuggestions.map((pda, idx) => (
                  <option key={idx} value={pda}>
                    {pda.length > 95 ? `${pda.substring(0, 92)}...` : pda}
                  </option>
                ))}
              </select>

              {selectedSuggestedPda && (
                <div className="text-[10px] text-blue-950 dark:text-blue-100 bg-white dark:bg-zinc-900/90 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/70 shadow-xs flex flex-col gap-1 leading-relaxed">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                    PDA Activo para la Planeación:
                  </div>
                  <p className="font-medium italic text-zinc-700 dark:text-zinc-300 leading-snug">
                    "{selectedSuggestedPda}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subida de Archivos (Imagen o PDF) */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">Subir Fotografía o Archivo PDF</label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          {!uploadedFile ? (
            <button
              type="button"
              onClick={triggerFileSelect}
              className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-950/30 transition-all group"
            >
              <div className="p-2.5 rounded-full bg-zinc-50 dark:bg-zinc-950 text-zinc-400 group-hover:text-blue-500 group-hover:scale-105 transition-all">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Seleccionar imagen o PDF</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">Formatos aceptados: JPG, PNG, PDF (Máx. 10MB)</p>
              </div>
            </button>
          ) : (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {uploadedFile.type === 'image' ? (
                  imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Miniatura" 
                      className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-zinc-150 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center flex-shrink-0">
                      <Image className="h-5 w-5" />
                    </div>
                  )
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{uploadedFile.name}</p>
                  <p className="text-[9px] text-zinc-400 mt-0.5 uppercase font-bold">{uploadedFile.type} • {uploadedFile.size}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Botón de Enviar */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!inputText.trim() && !uploadedFile)}
          className={`w-full py-3 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all ${
            isGenerating 
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'
              : !inputText.trim() && !uploadedFile
                ? 'bg-zinc-100 dark:bg-zinc-950 text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:scale-[1.01]'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generando Planeación...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generar con IA NEM
            </>
          )}
        </button>

        {/* HISTORIAL DE PLANEACIONES */}
        {planningsHistory.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Historial de Planeaciones</span>
            <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1">
              {planningsHistory.map((plan) => {
                const isActive = activePlanning?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex justify-between items-center transition-all ${
                      isActive
                        ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'bg-white dark:bg-zinc-900 border-zinc-150 hover:border-zinc-250 dark:border-zinc-800/80 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <button
                      onClick={() => setActivePlanning(plan)}
                      className="flex items-center gap-2 overflow-hidden flex-1 text-left"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0 text-zinc-400 dark:text-zinc-500" />
                      <span className="truncate">{plan.title}</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleDeletePlanning(plan.id, e)}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* -------------------- COLUMNA DERECHA: DOCUMENTO / LOADING (lg:col-span-8) -------------------- */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* PANTALLA DE CARGA DE IA */}
        {isGenerating ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-6 shadow-sm min-h-[480px] no-print">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 dark:border-blue-500/5" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-base font-black text-zinc-950 dark:text-white">Procesando Insumos Pedagógicos</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-normal">
                Nuestra IA está estructurando la planeación didáctica de acuerdo a los campos formativos de la NEM actual.
              </p>
            </div>

            {/* Pasos Visuales */}
            <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-150 dark:border-zinc-850 p-5 flex flex-col gap-3.5">
              {generationSteps.map((step, idx) => {
                const isActive = generationStep === idx;
                const isCompleted = generationStep > idx;
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                    ) : isActive ? (
                      <div className="h-4.5 w-4.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-4.5 w-4.5 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                    )}
                    
                    <span className={isCompleted ? 'text-zinc-400 line-through' : isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-zinc-400'}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : !activePlanning ? (
          /* PANTALLA INICIAL SIN PLAN */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-5 shadow-sm min-h-[480px] no-print">
            <div className="p-4.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-3xl">
              <FileDown className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-950 dark:text-white">Generador de Planeación Escolar</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm leading-normal">
                Usa el formulario lateral para ingresar la idea de tu clase. El generador estructurará una planeación pedagógica NEM editable y descargable en PDF al instante.
              </p>
            </div>
          </div>
        ) : (
          /* VISTA DEL DOCUMENTO GENERADO (HOJA A4) */
          <>
            {/* Barra de Acciones del Documento */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-3 shadow-xs flex justify-between items-center no-print">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 px-2">
                  <Edit3 className="h-4 w-4 text-zinc-400" />
                  Haz clic sobre cualquier texto para editar directamente la planeación
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm shadow-blue-500/10 flex items-center gap-1.5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar PDF / Imprimir
                </button>
              </div>
            </div>

            {/* Aviso de Insumos Modificados en Tiempo Real */}
            {activePlanning && (activePlanning.levelId !== selectedLevel || activePlanning.subjectId !== selectedSubject || (activePlanning.sesiones?.length !== sessionCount)) && (
              <div className="bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950 dark:text-blue-100 no-print animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-pulse" />
                  <div>
                    <span className="font-black text-blue-700 dark:text-blue-300">Insumos Actualizados en Tiempo Real:</span>{' '}
                    <span>
                      {displaySubjects.find(s => s.id === selectedSubject)?.name || 'Nueva Asignatura'} • {sessionCount} {sessionCount === 1 ? 'sesión' : 'sesiones'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerar con Nuevos Insumos
                </button>
              </div>
            )}

            {/* Contenedor Imprimible */}
            <div 
              id="nem-print-container" 
              className="print-page bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm text-left relative text-zinc-800 dark:text-zinc-100 font-sans"
            >
              {/* Estilos CSS Locales e Incrustados para Impresión */}
              <style>{`
                @page {
                  size: letter portrait;
                  margin: 10mm 12mm 10mm 12mm;
                }
                @media print {
                  /* Reset total del HTML y BODY para que no haya margen superior en blanco */
                  html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    height: auto !important;
                    min-height: 0 !important;
                    overflow: visible !important;
                  }

                  /* Ocultar elementos no imprimibles */
                  .no-print, header, nav, aside, footer, button {
                    display: none !important;
                  }

                  /* Eliminar contextos de posición relativa y padding de todos los contenedores padre */
                  #__next, main, div, section, article {
                    position: static !important;
                    transform: none !important;
                    filter: none !important;
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                  }

                  body * {
                    visibility: hidden;
                  }

                  #nem-print-container, #nem-print-container * {
                    visibility: visible !important;
                  }

                  #nem-print-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    overflow: visible !important;
                    font-size: 10pt !important;
                    line-height: 1.4 !important;
                  }
                  .print-badge {
                    border: 1px solid #d4d4d8 !important;
                    background: #f4f4f5 !important;
                    color: #18181b !important;
                    padding: 2px 7px !important;
                    border-radius: 9999px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                    margin: 2px !important;
                    white-space: normal !important;
                    word-break: break-word !important;
                    font-size: 8pt !important;
                    font-weight: 700 !important;
                    max-width: 100% !important;
                  }
                  .print-hide-input, .print-hide-textarea {
                    display: none !important;
                  }
                  .print-show-text {
                    display: block !important;
                    overflow: visible !important;
                    height: auto !important;
                    max-height: none !important;
                    white-space: pre-wrap !important;
                    word-break: break-word !important;
                    overflow-wrap: break-word !important;
                    color: black !important;
                  }
                  .print-show-inline {
                    display: inline !important;
                    word-break: break-word !important;
                    overflow-wrap: break-word !important;
                    color: black !important;
                  }
                  .print-metadata-grid {
                    display: grid !important;
                    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    gap: 10px !important;
                    background: #fafafa !important;
                    border: 1px solid #e4e4e7 !important;
                    padding: 10px 14px !important;
                    border-radius: 8px !important;
                  }
                  textarea, .editable-field-wrap {
                    border: none !important;
                    resize: none !important;
                    overflow: visible !important;
                    height: auto !important;
                    min-height: unset !important;
                    max-height: none !important;
                    white-space: pre-wrap !important;
                    word-break: break-word !important;
                    overflow-wrap: break-word !important;
                    display: block !important;
                    width: 100% !important;
                  }
                  .print-avoid-break {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }
                  .print-section {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    margin-bottom: 12px !important;
                    overflow: visible !important;
                  }
                  * {
                    overflow: visible !important;
                    max-height: none !important;
                    word-break: break-word !important;
                    overflow-wrap: break-word !important;
                  }
                }
              `}</style>

              {/* Membrete Oficial */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 border-b-2 border-double border-zinc-200 dark:border-zinc-800 pb-5 mb-5 print-section">
                <div className="text-center sm:text-left flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">Secretaría de Educación Pública</span>
                  <h2 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white leading-tight">COLEGIO ANGLO MEXICANO</h2>
                  <p className="text-[10.5px] font-medium text-zinc-500">Módulo Académico Gamificado • Planeación Didáctica NEM</p>
                </div>
                
                {/* Sello Escolar */}
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-[8.5px] font-black text-zinc-400 text-center uppercase leading-tight p-1 flex-shrink-0 tracking-wider">
                  <span>Sello</span>
                  <span>Escolar</span>
                </div>
              </div>

              {/* Título de la Sesión (Auto-ajustable en múltiples líneas para títulos largos) */}
              <div className="mb-5 flex flex-col gap-1.5 print-section">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Título del Proyecto Didáctico</span>
                {/* Pantalla: Textarea auto-expandible */}
                <textarea
                  value={activePlanning.title}
                  onChange={(e) => updateActivePlanningField('title', e.target.value)}
                  rows={2}
                  className="w-full text-xl sm:text-2xl font-black text-zinc-950 dark:text-white border-b border-transparent hover:border-zinc-200 focus:border-blue-500 outline-none pb-1.5 focus:px-2 rounded resize-none overflow-hidden leading-snug break-words print-hide-textarea"
                />
                {/* Impresión / PDF: Elemento de texto con ajuste de línea completo sin recortes */}
                <h1 className="print-show-text hidden text-xl font-black text-zinc-950 dark:text-white leading-snug break-words">
                  {activePlanning.title}
                </h1>
              </div>

              {/* Tabla de Metadatos Didácticos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-zinc-50/70 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 mb-6 font-semibold text-xs leading-normal print-metadata-grid">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Docente Titular</span>
                  <span className="text-zinc-850 dark:text-zinc-200 break-words">{currentTeacher.first_name} {currentTeacher.last_name}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Nivel / Fase</span>
                  <span className="text-zinc-850 dark:text-zinc-200 break-words">{activePlanning.levelName}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Asignatura</span>
                  <span className="text-zinc-850 dark:text-zinc-200 break-words">{activePlanning.subjectName}</span>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Campo Formativo (NEM)</span>
                  <input
                    type="text"
                    value={activePlanning.campoFormativo}
                    onChange={(e) => updateActivePlanningField('campoFormativo', e.target.value)}
                    className="bg-transparent text-zinc-850 dark:text-zinc-200 border-b border-transparent hover:border-zinc-200 focus:border-blue-500 outline-none w-full print-hide-input"
                  />
                  <span className="print-show-inline hidden text-zinc-850 dark:text-zinc-200 break-words font-semibold">
                    {activePlanning.campoFormativo}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Duración Estimada</span>
                  <input
                    type="text"
                    value={activePlanning.duration}
                    onChange={(e) => updateActivePlanningField('duration', e.target.value)}
                    className="bg-transparent text-zinc-850 dark:text-zinc-200 border-b border-transparent hover:border-zinc-200 focus:border-blue-500 outline-none w-full print-hide-input"
                  />
                  <span className="print-show-inline hidden text-zinc-850 dark:text-zinc-200 break-words font-semibold">
                    {activePlanning.duration}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Fecha de Elaboración</span>
                  <span className="text-zinc-850 dark:text-zinc-200 font-semibold break-words">
                    {formatSpanishDateInLetters(activePlanning.createdAt)}
                  </span>
                </div>
              </div>

              {/* Ejes Articuladores */}
              <div className="mb-6 flex flex-col gap-2">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Ejes Articuladores Vigentes</span>
                <div className="flex flex-wrap gap-2">
                  {activePlanning.ejesArticuladores.map((ejeName: string, idx: number) => {
                    const matchedEje = EJES_ARTICULADORES.find(e => e.name.toLowerCase().includes(ejeName.toLowerCase().substring(0, 8)));
                    const IconComp = matchedEje?.icon || BookOpen;
                    return (
                      <span 
                        key={idx}
                        className={`print-badge flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          matchedEje?.color || 'text-zinc-650 bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <IconComp className="h-3.5 w-3.5 flex-shrink-0" />
                        {ejeName}
                      </span>
                    );
                  })}
                  
                  {/* Selector rápido para añadir Eje (solo en pantalla) */}
                  <div className="relative inline-block no-print">
                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        if (!activePlanning.ejesArticuladores.includes(e.target.value)) {
                          updateActivePlanningField('ejesArticuladores', [...activePlanning.ejesArticuladores, e.target.value]);
                        }
                      }}
                      className="px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold bg-zinc-50 dark:bg-zinc-950 text-zinc-500 outline-none cursor-pointer"
                    >
                      <option value="">+ Agregar Eje</option>
                      {EJES_ARTICULADORES.map((e, idx) => (
                        <option key={idx} value={e.name}>{e.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Limpiar Ejes (solo en pantalla) */}
                  {activePlanning.ejesArticuladores.length > 0 && (
                    <button
                      onClick={() => updateActivePlanningField('ejesArticuladores', [])}
                      className="no-print text-[9px] font-bold text-rose-500 hover:underline px-2"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* I. Proceso de Desarrollo de Aprendizaje (PDA) */}
              <div className="mb-6 border-l-4 border-blue-600 pl-4 py-0.5 flex flex-col gap-1.5 print-avoid-break">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="h-4 w-4" />
                  I. Proceso de Desarrollo de Aprendizaje (PDA Principal)
                </span>
                <EditableField
                  value={activePlanning.pda}
                  onChange={(val) => updateActivePlanningField('pda', val)}
                  placeholder="Proceso de Desarrollo de Aprendizaje..."
                />
              </div>

              {/* II. Articulación Curricular (PDAs Transversales y Enlazados) */}
              {activePlanning.pdasArticulados && activePlanning.pdasArticulados.length > 0 && (
                <div className="mb-6 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-blue-950/30 p-5 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col gap-3 print-avoid-break">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    II. Articulación Curricular (PDAs Enlazados y Transversales)
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {activePlanning.pdasArticulados.map((item: ArticulatedPda, pIdx: number) => (
                      <div key={pIdx} className="bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-black text-[9.5px]">
                            {item.campoFormativo}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400">Vinculación Interdisciplinaria</span>
                        </div>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-snug mt-0.5">{item.pda}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 italic">🎯 {item.relacion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* III. Propuesta del Proyecto Final Integrador */}
              {activePlanning.proyectoIntegrador && (
                <div className="mb-6 bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 flex flex-col gap-3 print-avoid-break">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-amber-600" />
                    III. Propuesta de Proyecto Final Integrador (NEM 2024)
                  </span>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-amber-900/70 dark:text-amber-400 uppercase">Título del Proyecto Comunitario</span>
                      <span className="font-black text-sm text-zinc-950 dark:text-white">{activePlanning.proyectoIntegrador.titulo}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="bg-white/90 dark:bg-zinc-900/90 p-3 rounded-xl border border-amber-150 dark:border-amber-900/30">
                        <span className="text-[9px] font-black text-amber-700 uppercase block mb-0.5">Problemática Comunitaria</span>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{activePlanning.proyectoIntegrador.problematicaComunitaria}</p>
                      </div>
                      <div className="bg-white/90 dark:bg-zinc-900/90 p-3 rounded-xl border border-amber-150 dark:border-amber-900/30">
                        <span className="text-[9px] font-black text-amber-700 uppercase block mb-0.5">Propósito Formativo</span>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{activePlanning.proyectoIntegrador.proposito}</p>
                      </div>
                    </div>
                    <div className="bg-amber-100/60 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-2.5 mt-1">
                      <FolderCheck className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9.5px] font-black uppercase tracking-wide text-amber-900 dark:text-amber-200 block">Producto Final Entregable</span>
                        <p className="text-zinc-800 dark:text-zinc-200 font-semibold leading-snug">{activePlanning.proyectoIntegrador.productoFinal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IV. Preguntas Detonadoras para el Aula */}
              {activePlanning.preguntasDetonadoras && activePlanning.preguntasDetonadoras.length > 0 && (
                <div className="mb-6 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 flex flex-col gap-2.5 print-avoid-break">
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    IV. Preguntas Detonadoras para el Salón (Apertura y Conflicto Cognitivo)
                  </span>
                  <ul className="space-y-2 text-xs text-zinc-850 dark:text-zinc-150 font-medium pl-1">
                    {activePlanning.preguntasDetonadoras.map((preg: string, pIdx: number) => (
                      <li key={pIdx} className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-blue-600 text-white font-black text-[10px] shrink-0 mt-0.5">
                          {pIdx + 1}
                        </span>
                        <span className="leading-snug">{preg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* V. Dosificación Cronometrada de las Sesiones */}
              <div className="mb-8 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-[11px] text-zinc-950 dark:text-white font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                    V. Dosificación Cronometrada en {activePlanning.sesiones?.length || sessionCount} {activePlanning.sesiones?.length === 1 ? 'Sesión' : 'Sesiones'} de 50 minutos (Total: {(activePlanning.sesiones?.length || sessionCount) * 50} min)
                  </span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black border border-blue-200/50">
                    {(activePlanning.sesiones?.length || sessionCount) <= 5 ? '1 Semana' : `${Math.ceil((activePlanning.sesiones?.length || sessionCount) / 5)} Semanas`} Lectivas (50 min/sesión)
                  </span>
                </div>

                {/* Renderizado de las Sesiones Individuales */}
                {activePlanning.sesiones && activePlanning.sesiones.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {activePlanning.sesiones.map((sesion: SessionPlanItem, sIdx: number) => (
                      <div 
                        key={sIdx}
                        className="p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col gap-3 print-avoid-break"
                      >
                        {/* Header de la Sesión */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                              {sesion.numero}
                            </span>
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                              Sesión {sesion.numero}: {sesion.titulo}
                            </h4>
                          </div>

                          {/* Insignias de Minutero */}
                          <div className="flex items-center gap-1.5 text-[9px] font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                              🟢 Inicio: {sesion.tiempos?.inicio || '10 min'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                              🔵 Desarrollo: {sesion.tiempos?.desarrollo || '30 min'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50">
                              🟠 Cierre: {sesion.tiempos?.cierre || '10 min'}
                            </span>
                          </div>
                        </div>

                        {/* Actividades Desglosadas por Tiempo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850">
                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase block mb-1">
                              🟢 Inicio (10 min) — Activación
                            </span>
                            <p className="text-zinc-700 dark:text-zinc-300">{sesion.actividadInicio}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850">
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase block mb-1">
                              🔵 Desarrollo (30 min) — Construcción
                            </span>
                            <p className="text-zinc-700 dark:text-zinc-300">{sesion.actividadDesarrollo}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850">
                            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase block mb-1">
                              🟠 Cierre (10 min) — Síntesis
                            </span>
                            <p className="text-zinc-700 dark:text-zinc-300">{sesion.actividadCierre}</p>
                          </div>
                        </div>

                        {/* Preguntas Detonadoras de la Sesión */}
                        {sesion.preguntasClave && sesion.preguntasClave.length > 0 && (
                          <div className="bg-blue-50/40 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30 text-[11px] text-zinc-700 dark:text-zinc-300">
                            <span className="font-black text-[9px] text-blue-700 dark:text-blue-300 uppercase block mb-1">
                              ❓ Preguntas Clave de la Sesión:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {sesion.preguntasClave.map((q, qIdx) => (
                                <li key={qIdx}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Referencia a Libros de la SEP y Entregable */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] pt-1">
                          <div className="flex items-start gap-2 bg-purple-50/50 dark:bg-purple-950/20 p-2 rounded-xl border border-purple-100 dark:border-purple-900/30">
                            <BookMarked className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-[9px] text-purple-700 dark:text-purple-300 uppercase block">Libro de Texto Oficial SEP:</span>
                              <span className="font-bold text-zinc-850 dark:text-zinc-150">{sesion.libroSep?.titulo}</span>
                              <span className="text-purple-600 dark:text-purple-400 font-extrabold ml-1">({sesion.libroSep?.paginas})</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <CheckSquare className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-[9px] text-emerald-700 dark:text-emerald-300 uppercase block">Entregable Parcial de la Sesión:</span>
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{sesion.entregableSesion}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback clásico para planeaciones previas */
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 pl-2 print-avoid-break">
                      <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Inicio (Anticipación / Lluvia de ideas)</span>
                      <EditableField
                        value={activePlanning.inicio}
                        onChange={(val) => updateActivePlanningField('inicio', val)}
                        placeholder="Actividades de inicio..."
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 pl-2 print-avoid-break">
                      <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Desarrollo (Indagación / Aplicación práctica)</span>
                      <EditableField
                        value={activePlanning.desarrollo}
                        onChange={(val) => updateActivePlanningField('desarrollo', val)}
                        placeholder="Actividades de desarrollo..."
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 pl-2 print-avoid-break">
                      <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Cierre (Reflexión / Metacognición)</span>
                      <EditableField
                        value={activePlanning.cierre}
                        onChange={(val) => updateActivePlanningField('cierre', val)}
                        placeholder="Actividades de cierre..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* VI. Evaluación Formativa y Rúbrica Analítica de 3 Niveles */}
              <div className="mb-6 flex flex-col gap-2.5 print-avoid-break">
                <span className="text-[10px] text-zinc-950 dark:text-white font-black uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850 pb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  VI. Evaluación Formativa, Criterios y Rúbrica Analítica (3 Niveles NEM)
                </span>
                <div className="pl-2">
                  <EditableField
                    value={activePlanning.evaluacion}
                    onChange={(val) => updateActivePlanningField('evaluacion', val)}
                    placeholder="Criterios y evidencias de evaluación..."
                  />
                </div>
              </div>

              {/* VII. Materiales y Recursos Didácticos */}
              <div className="mb-8 flex flex-col gap-2.5 print-avoid-break">
                <span className="text-[10px] text-zinc-950 dark:text-white font-black uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850 pb-1.5 flex items-center gap-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                  VII. Materiales, Recursos y Evidencias Entregables Globales
                </span>
                <div className="pl-2">
                  <EditableField
                    value={activePlanning.materiales}
                    onChange={(val) => updateActivePlanningField('materiales', val)}
                    placeholder="Materiales y recursos didácticos..."
                  />
                </div>
              </div>

              {/* Bloque de firmas */}
              <div className="grid grid-cols-2 gap-12 border-t border-zinc-100 dark:border-zinc-850 pt-8 mt-12 text-center text-xs font-semibold text-zinc-400 leading-normal print-avoid-break">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-36 border-b border-zinc-300 dark:border-zinc-700 h-10" />
                  <span className="text-zinc-600 dark:text-zinc-300 mt-2">Prof. {currentTeacher.first_name} {currentTeacher.last_name}</span>
                  <span className="text-[9px] uppercase tracking-wider">Docente Titular</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="w-36 border-b border-zinc-300 dark:border-zinc-700 h-10" />
                  <span className="text-zinc-650 dark:text-zinc-350 mt-2">Coordinación Académica</span>
                  <span className="text-[9px] uppercase tracking-wider">Firma de Aprobación</span>
                </div>
              </div>

              {/* Pie de página institucional del documento */}
              <div className="flex justify-between items-center text-[8.5px] text-zinc-400 font-mono pt-4 mt-8 border-t border-zinc-200 dark:border-zinc-800 print-avoid-break">
                <span>ISkool — Sistema Integral de Planeación Pedagógica NEM</span>
                <span>Fecha de Emisión: {formatSpanishDateInLetters(activePlanning.createdAt)}</span>
              </div>

            </div>

            {/* SECCIÓN DE SUGERENCIAS PEDAGÓGICAS (5 VIDEOS, PORTAL Y 3 FUENTES CON PURGA INMEDIATA) */}
            <PedagogicalSuggestionsSection 
              planning={activePlanning}
              currentTeacherName={`${currentTeacher.first_name} ${currentTeacher.last_name}`}
            />
          </>
        )}

      </div>
    </div>
  ) : (
        /* VISTA DEL PROGRAMA ANALÍTICO (CAMPAÑA DE GREMIO) */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-left no-print">
          {/* Header de la Campaña de Gremio */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800 pb-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <Swords className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-950 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                  Planificador de Programa Analítico
                </h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Campaña de Gremio Escolar • Planes de la SEP</p>
              </div>
            </div>

            {/* Pasos del Mago / Timeline */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-150 dark:border-zinc-850 p-2 text-[10px] font-black uppercase tracking-wider">
              <button 
                type="button"
                onClick={() => setWizardStep(1)}
                className={`px-3 py-1.5 rounded-xl transition-all ${wizardStep === 1 ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
              >
                1. Lectura
              </button>
              <ChevronRight className="h-3 w-3 text-zinc-300" />
              <button 
                type="button"
                onClick={() => { if (realityDiagnosis.trim()) setWizardStep(2); else alert('Por favor llena la lectura de la realidad primero.'); }}
                className={`px-3 py-1.5 rounded-xl transition-all ${wizardStep === 2 ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'text-zinc-400 hover:text-zinc-650'}`}
              >
                2. Contextualizar
              </button>
              <ChevronRight className="h-3 w-3 text-zinc-300" />
              <button 
                type="button"
                onClick={() => { if (realityDiagnosis.trim() && selectedPdaIds.length > 0) setWizardStep(3); else alert('Por favor selecciona al menos un PDA en la fase de contextualización.'); }}
                className={`px-3 py-1.5 rounded-xl transition-all ${wizardStep === 3 ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'text-zinc-400 hover:text-zinc-650'}`}
              >
                3. Formulación
              </button>
            </div>
          </div>

          {/* PASO 1: LECTURA DE LA REALIDAD */}
          {wizardStep === 1 && (
            <div className="flex flex-col gap-5">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-amber-800 dark:text-amber-400">
                <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide text-[10px] block mb-1">Plano 1: Lectura de la realidad</span>
                  Analiza la situación de tu comunidad, la problemática del entorno escolar y familiar de tus estudiantes para trazar las metas de la campaña de aprendizaje.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-450 uppercase tracking-wider text-left">Bitácora de Exploración (Diagnóstico de la Comunidad)</label>
                  <textarea
                    rows={6}
                    value={realityDiagnosis}
                    onChange={(e) => setRealityDiagnosis(e.target.value)}
                    placeholder="Analiza las condiciones socioeconómicas, familiares, geográficas o culturales de tu comunidad que impactan el aprendizaje de tus alumnos..."
                    className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-amber-500 leading-relaxed font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-450 uppercase tracking-wider text-left">Amenazas del Reino (Problemáticas del Entorno)</label>
                    <textarea
                      rows={2}
                      value={problematic}
                      onChange={(e) => setProblematic(e.target.value)}
                      placeholder="Ej. Malos hábitos de alimentación, acoso escolar, escasez de áreas verdes, falta de agua..."
                      className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-amber-500 leading-relaxed font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-450 uppercase tracking-wider text-left">Atributos del Gremio (Intereses y Necesidades de Alumnos)</label>
                    <textarea
                      rows={2}
                      value={studentNeeds}
                      onChange={(e) => setStudentNeeds(e.target.value)}
                      placeholder="Ej. Interés por videojuegos, artes escénicas, deportes grupales, necesidad de apoyo socioemocional..."
                      className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-amber-500 leading-relaxed font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    if (!realityDiagnosis.trim()) {
                      alert('Por favor describe el diagnóstico comunitario.');
                      return;
                    }
                    setWizardStep(2);
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm shadow-amber-500/10 flex items-center gap-2 hover:scale-[1.01] transition-all"
                >
                  Continuar a Contextualización
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: CONTEXTUALIZACIÓN */}
          {wizardStep === 2 && (
            <div className="flex flex-col gap-5">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-amber-800 dark:text-amber-400">
                <Compass className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide text-[10px] block mb-1">Plano 2: Contextualización</span>
                  Alinea los insumos comunitarios del paso anterior con los planes de estudio. Selecciona el Campo Formativo y marca las habilidades (PDAs) que desbloquearán tus alumnos en esta campaña.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {/* Configuración de Materia y Campo Formativo */}
                <div className="md:col-span-1 flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-950/30 p-4.5 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                  <div className="flex flex-col gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <label className="text-[10px] text-zinc-455 uppercase tracking-wider text-left">Asignatura de la Campaña</label>
                    <select
                      value={selectedNEMSubject}
                      onChange={(e) => setSelectedNEMSubject(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-855 dark:text-zinc-150 font-bold focus:outline-none"
                    >
                      {displaySubjects?.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <label className="text-[10px] text-zinc-455 uppercase tracking-wider text-left">Nivel / Fase</label>
                    <select
                      value={selectedNEMLevel}
                      onChange={(e) => setSelectedNEMLevel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-855 dark:text-zinc-150 font-bold focus:outline-none"
                    >
                      <option value="preescolar">Preescolar (Fase 2: 1º a 3º)</option>
                      <option value="primaria-baja">Primaria Baja (Fase 3: 1º y 2º Grado)</option>
                      <option value="primaria-media">Primaria Media (Fase 4: 3º y 4º Grado)</option>
                      <option value="primaria-alta">Primaria Alta (Fase 5: 5º y 6º Grado)</option>
                      <option value="secundaria">Secundaria (Fase 6: 1º a 3º Grado)</option>
                      <option value="preparatoria">Preparatoria / Bachillerato</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <label className="text-[10px] text-zinc-455 uppercase tracking-wider text-left">Campo Formativo Asociado</label>
                    <select
                      value={selectedCampoId}
                      onChange={(e) => {
                        setSelectedCampoId(e.target.value);
                        setSelectedPdaIds([]); // Reset pdas selection
                      }}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-855 dark:text-zinc-150 font-bold focus:outline-none"
                    >
                      {camposFormativos.map(cf => (
                        <option key={cf.id} value={cf.id}>{cf.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lista de PDAs del Campo Formativo */}
                <div className="md:col-span-2 flex flex-col gap-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Habilidades del Códice (Seleccionar PDAs a Trabajar)</span>
                    <span className="text-amber-500 font-black">{selectedPdaIds.length} seleccionados</span>
                  </label>

                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {pdasList.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-xs">
                        No hay PDAs registrados para este campo formativo.
                      </div>
                    ) : (
                      pdasList.map(pda => {
                        const isChecked = selectedPdaIds.includes(pda.id);
                        return (
                          <div 
                            key={pda.id}
                            onClick={() => {
                              if (isChecked) {
                                setSelectedPdaIds(selectedPdaIds.filter(id => id !== pda.id));
                              } else {
                                setSelectedPdaIds([...selectedPdaIds, pda.id]);
                              }
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 text-xs leading-normal font-medium text-left ${isChecked ? 'bg-amber-500/10 border-amber-400 text-zinc-850 dark:text-zinc-100' : 'bg-white dark:bg-zinc-950 border-zinc-150 dark:border-zinc-850 text-zinc-500 hover:border-zinc-300'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-amber-500 h-4.5 w-4.5 flex-shrink-0 mt-0.5 rounded-lg cursor-pointer"
                            />
                            <div>
                              <span className="font-mono text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">{pda.code || 'PDA'}</span>
                              <span>{pda.description}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Regresar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedPdaIds.length === 0) {
                      alert('Por favor selecciona al menos un PDA (habilidad) del códice.');
                      return;
                    }
                    setWizardStep(3);
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm shadow-amber-500/10 flex items-center gap-2 hover:scale-[1.01] transition-all"
                >
                  Continuar a Formulación
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: FORMULACIÓN (CODISEÑO DE CAMPAÑA) */}
          {wizardStep === 3 && (
            <div className="flex flex-col gap-6">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-amber-800 dark:text-amber-400">
                <Swords className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide text-[10px] block mb-1">Plano 3: Formulación (Despliegue de Campaña)</span>
                  Define el nombre de la Campaña de Gremio y agrega las misiones (Quests) que resolverán tus alumnos. Los alumnos ganarán XP elemental correspondiente en base al campo formativo seleccionado.
                </div>
              </div>

              {/* Titulo de Campaña */}
              <div className="flex flex-col gap-1.5 text-xs font-bold">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider text-left">Título de la Campaña de Gremio</label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Ej. Campaña del Bosque Nutrido (Alimentación Sostenible)"
                  className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              {/* Grid: Misiones Creadas (Izquierda) y Crear Misión (Derecha) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Panel Izquierdo: Lista de Quests agregadas */}
                <div className="lg:col-span-6 flex flex-col gap-4.5">
                  <span className="text-[10px] font-black text-zinc-450 uppercase tracking-wider text-left block">
                    Misiones Desplegadas en esta Campaña ({campaignQuests.length})
                  </span>

                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {campaignQuests.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 text-xs bg-zinc-50/20">
                        Aún no has agregado misiones de gremio. Configura una misión en el formulario lateral y agrégala.
                      </div>
                    ) : (
                      campaignQuests.map((quest, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-2xl p-4.5 text-left flex gap-4 items-start shadow-xs relative">
                          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                            {quest.type === 'quiz' ? <Brain className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-xs font-black text-zinc-850 dark:text-zinc-100 flex items-center gap-2">
                              <span>Misión {idx + 1}: {quest.title}</span>
                              <span className="text-[8.5px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-1.5 py-0.5 rounded text-zinc-450 uppercase font-bold">{quest.type === 'quiz' ? 'Quiz' : 'Portafolio'}</span>
                            </h4>
                            <p className="text-[10.5px] text-zinc-450 mt-1 line-clamp-2">{quest.description}</p>
                            
                            {/* Recompensas */}
                            <div className="flex items-center gap-3 mt-3 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              <span>💎 {quest.xp_reward} XP</span>
                              <span>🪙 {quest.coins_reward} Monedas</span>
                              <span>•</span>
                              <span>🎯 {quest.pda_ids.length} PDA(s) Vinculados</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCampaignQuests(campaignQuests.filter((_, qIdx) => qIdx !== idx))}
                            className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-zinc-400 transition-colors self-start cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Panel Derecho: Formulario para añadir misión */}
                <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 p-4.5 rounded-3xl flex flex-col gap-4 text-xs font-bold text-zinc-855 dark:text-zinc-150">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 tracking-wider text-left pb-2 border-b border-zinc-200/60 dark:border-zinc-850 block uppercase">
                    + Configurar Misión de Gremio
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider text-left">Nombre de la Misión</label>
                    <input
                      id="new-quest-title"
                      type="text"
                      placeholder="Ej. Cuestionario de los Microbios Beneficiosos"
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider text-left">Objetivo / Bitácora de Misión</label>
                    <textarea
                      id="new-quest-desc"
                      rows={2}
                      placeholder="Explica qué deben investigar o responder en esta misión..."
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider text-left">Tipo de Reto</label>
                      <select
                        id="new-quest-type"
                        className="p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold focus:outline-none"
                      >
                        <option value="quiz">Quiz RPG</option>
                        <option value="portfolio_submission">Portafolio</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider text-left">💎 Recompensa XP</label>
                      <input
                        id="new-quest-xp"
                        type="number"
                        defaultValue={50}
                        min={10}
                        max={500}
                        className="p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono font-bold focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider text-left">🪙 Monedas</label>
                      <input
                        id="new-quest-coins"
                        type="number"
                        defaultValue={10}
                        min={1}
                        max={100}
                        className="p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Asignación de PDAs de los elegidos en el Paso 2 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider text-left">Habilidades Vinculadas (PDAs a Acreditar)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      {selectedPdaIds.map(pdaId => {
                        const pdaObj = pdasList.find(p => p.id === pdaId);
                        if (!pdaObj) return null;
                        return (
                          <div 
                            key={pdaId}
                            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-lg text-[9px] text-amber-700 dark:text-amber-400"
                          >
                            <span>{pdaObj.code || 'PDA'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const titleEl = document.getElementById('new-quest-title') as HTMLInputElement;
                      const descEl = document.getElementById('new-quest-desc') as HTMLTextAreaElement;
                      const typeEl = document.getElementById('new-quest-type') as HTMLSelectElement;
                      const xpEl = document.getElementById('new-quest-xp') as HTMLInputElement;
                      const coinsEl = document.getElementById('new-quest-coins') as HTMLInputElement;

                      if (!titleEl.value.trim() || !descEl.value.trim()) {
                        alert('Por favor llena el nombre y objetivo de la misión.');
                        return;
                      }

                      const newQ = {
                        title: titleEl.value.trim(),
                        description: descEl.value.trim(),
                        type: typeEl.value as 'quiz' | 'portfolio_submission',
                        xp_reward: parseInt(xpEl.value) || 50,
                        coins_reward: parseInt(coinsEl.value) || 10,
                        pda_ids: [...selectedPdaIds]
                      };

                      setCampaignQuests([...campaignQuests, newQ]);

                      // Limpiar campos
                      titleEl.value = '';
                      descEl.value = '';
                    }}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 rounded-xl text-xs font-black shadow-sm transition-all"
                  >
                    Añadir Misión al Gremio
                  </button>
                </div>
              </div>

              {/* Botones de Navegación del Wizard */}
              <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Regresar
                </button>

                <button
                  type="button"
                  onClick={handlePublishCampaign}
                  disabled={isPublishingCampaign || campaignQuests.length === 0}
                  className={`px-6 py-3 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition-all ${
                    isPublishingCampaign || campaignQuests.length === 0
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 hover:scale-[1.01]'
                  }`}
                >
                  {isPublishingCampaign ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Desplegando Campaña...
                    </>
                  ) : (
                    <>
                      <Award className="h-4.5 w-4.5" />
                      Publicar Campaña de Gremio
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE AUXILIAR CAMPO DE TEXTO AUTO-EXPANDIBLE
// ==========================================

function EditableField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
    // Añadir manejador de cambio de tamaño de ventana para ajustar el alto
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [value]);

  return (
    <div className="editable-field-wrap w-full">
      {/* Textarea: visible only on screen */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); adjustHeight(); }}
        placeholder={placeholder}
        rows={1}
        className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/5 dark:focus:bg-zinc-950/20 py-2.5 px-3 rounded-xl text-xs text-zinc-700 dark:text-zinc-350 font-medium outline-none resize-none overflow-hidden transition-all leading-relaxed print-hide-textarea"
      />
      {/* Plain text div: visible only when printing — no scroll arrows, no borders */}
      <div className="print-show-text hidden py-1 px-0 text-xs text-zinc-700 font-medium leading-relaxed whitespace-pre-wrap break-words">
        {value || <span className="text-zinc-400">{placeholder}</span>}
      </div>
    </div>
  );
}
