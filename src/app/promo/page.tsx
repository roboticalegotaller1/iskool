"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  BookOpen,
  Heart,
  Users,
  Sparkles,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  Star,
  Clock,
  Shield,
  Layers,
  Award,
  Maximize2,
  DollarSign,
  MonitorPlay,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkle,
  FileText,
  Building2,
  Bot,
  HelpCircle,
  X,
  Check,
  Send,
  Calendar
} from "lucide-react";

// Tipos de diapositiva
type SlideType = "curtain" | "showcase";

interface SlideData {
  id: number;
  type: SlideType;
  skillNumber?: number; // 1 to 5 para las 5 habilidades
  portalName: string;
  badge: string;
  title: string;
  subtitle: string;
  narrativeCaption: string;
  colorTheme: "blue" | "emerald" | "rose" | "purple" | "amber" | "indigo" | "teal" | "cyan";
  metrics: { label: string; value: string }[];
  features: { iconName: string; title: string; desc: string }[];
  portalUrl?: string;
  highlightCategory: string;
  timingMarker: string; // Ejemplo: "[00:00 - 00:30]"
  targetSeconds: number; // Duración ideal para 5 minutos
  pitchScript: string; // Guión verbal para el presentador
  keySalesPoint: string; // Argumento de valor directo
  diagnosticQuestion: string; // Pregunta para directores
  objectionBuster: string; // Manejo de objeción
}

// 10 DIAPOSITIVAS: INTRO + 5 MEJORES HABILIDADES (CORTINA + DEMO) + CIERRE DE VENTAS
// DURACIÓN TOTAL: 300 SEGUNDOS (5 MINUTOS EXACTOS)
const SLIDES: SlideData[] = [
  // SLIDE 0: INTRO - EL DESAFÍO Y LA OPORTUNIDAD (00:00 - 00:30, 30s)
  {
    id: 0,
    type: "curtain",
    portalName: "ISKOOL 2026 · PITCH EJECUTIVO",
    highlightCategory: "Ecosistema Educativo Global",
    badge: "Presentación Oficial · 5 Minutos de Alto Impacto para Directivos",
    title: "La Revolución del Aprendizaje Digital en México",
    subtitle: "La suite escolar que resuelve los dos grandes dolores de las instituciones privadas: la desmotivación del alumnado y la sobrecarga administrativa docente.",
    narrativeCaption: "ISkool une gamificación inmersiva, pedagogía oficial de la Nueva Escuela Mexicana y administración escolar automatizada en una sola suite.",
    colorTheme: "indigo",
    timingMarker: "00:00 - 00:30 (30s)",
    targetSeconds: 30,
    metrics: [
      { label: "Engagement Estudiantil", value: "+96%" },
      { label: "Ahorro Administrativo", value: "14h / sem" },
      { label: "Retención Escolar", value: "99.4%" },
      { label: "Alineación Curricular", value: "100% SEP" }
    ],
    features: [
      { iconName: "Trophy", title: "Gamificación con Propósito", desc: "El Camino del Héroe y economía de mérito con mascota interactiva en PixiJS." },
      { iconName: "BookOpen", title: "Bóveda Curricular & IA", desc: "+1,500 nodos oficiales NEM, planeación analítica y Boleta SEP automática." },
      { iconName: "DollarSign", title: "Control Escolar & Cobranza", desc: "Expedientes 360°, horarios sin empalmes y facturación electrónica SAT 4.0." }
    ],
    pitchScript: "Estimados directivos y líderes educativos: hoy los colegios enfrentan dos desafíos críticos: la pérdida de interés de los alumnos ante clases tradicionales y el agotamiento de los maestros por el papeleo burocrático de la SEP. En los próximos 5 minutos, les demostraremos cómo ISkool transforma ambos problemas en el mayor diferenciador competitivo y de captación de su institución.",
    keySalesPoint: "ISkool no es un software escolar más; es un multiplicador de retención de matrícula y prestigio institucional.",
    diagnosticQuestion: "¿Cuánto tiempo dedica su personal directivo y docente a conciliar planeaciones, calificar a mano y recuperar colegiaturas vencidas?",
    objectionBuster: "Nuestra plataforma se implementa en solo 48 horas con capacitación llave en mano para todo su personal."
  },

  // SLIDE 1: HABILIDAD 1 - ESTUDIO DE RETOS POR NODOS (00:30 - 01:10, 40s)
  {
    id: 1,
    type: "curtain",
    skillNumber: 1,
    portalName: "HABILIDAD 1 · ESTUDIO DE RETOS",
    highlightCategory: "Habilidad 1 · Creación de Retos",
    badge: "Habilidad 01 · Lienzo Digital de Actividades & Retos Gamificados",
    title: "Habilidad 1: Diseña Retos Interactivos en Minutos",
    subtitle: "Lienzo visual por nodos con 14+ bloques dinámicos: lógica computacional, lectura cronometrada (PPM), circuitos booleanos, escape rooms y combate de jefes.",
    narrativeCaption: "Estudio Docente: Reemplaza las copias impresas y los cuestionarios planos por experiencias formativas memorables creadas en menos de 3 minutos.",
    colorTheme: "cyan",
    timingMarker: "00:30 - 01:10 (40s)",
    targetSeconds: 40,
    metrics: [
      { label: "Módulos de Bloques", value: "14+ Tipos" },
      { label: "Tiempo de Creación", value: "< 3 Minutos" },
      { label: "Interactividad Real", value: "+98%" },
      { label: "Despliegue a Grupo", value: "1 Clic" }
    ],
    features: [
      { iconName: "Layers", title: "Constructor Visual por Nodos", desc: "Conecta acertijos, preguntas formativas, videos explicativos y cofres de recompensa." },
      { iconName: "Clock", title: "Lectura Cronometrada (PPM)", desc: "Entrenamiento de velocidad lectora y comprensión con cronómetro automatizado." },
      { iconName: "Zap", title: "Despliegue Multi-Grado", desc: "Asignación directa a Primaria Baja, Primaria Alta, Secundaria y Preparatoria." }
    ],
    portalUrl: "/teacher/studio",
    pitchScript: "¿Cuánto tiempo pierden sus profesores elaborando hojas de trabajo que los alumnos resuelven sin interés? Con la Habilidad 1, nuestro Estudio de Actividades, el docente crea en 3 minutos retos interactivos con lógica, lectura cronometrada o escape rooms. El estudiante los resuelve jugando en su computadora o tablet y el sistema evalúa automáticamente.",
    keySalesPoint: "Los docentes pasan de ser creadores de copias en papel a arquitectos de experiencias memorables con retroalimentación instantánea.",
    diagnosticQuestion: "¿Cómo aseguran hoy que las actividades de clase compitan con el atractivo de los videojuegos y capturen la atención de los estudiantes?",
    objectionBuster: "No se requiere saber programar: la interfaz es tan intuitiva como conectar bloques de construcción visuales."
  },

  // SLIDE 2: SHOWCASE 1 - ESTUDIO DOCENTE EN ACCIÓN (01:10 - 01:35, 25s)
  {
    id: 2,
    type: "showcase",
    skillNumber: 1,
    portalName: "ESTUDIO DOCENTE EN VIVO",
    highlightCategory: "Habilidad 1 · Creación de Retos",
    badge: "Demostración en Vivo · Constructor Visual de Flujos",
    title: "Lienzo Digital: Simulación y Asignación Inmediata",
    subtitle: "Observa en tiempo real cómo se ensambla un flujo interactivo con simuladores y pruebas de comprensión.",
    narrativeCaption: "Vista en vivo del Estudio de Actividades: el profesor configura parámetros, prueba el flujo y lo publica a la clase al instante.",
    colorTheme: "cyan",
    timingMarker: "01:10 - 01:35 (25s)",
    targetSeconds: 25,
    metrics: [
      { label: "Flujo Activo", value: "Interactivo" },
      { label: "Sincronización", value: "Instantánea" }
    ],
    features: [],
    portalUrl: "/teacher/studio",
    pitchScript: "Aquí pueden ver el Estudio en acción real. El maestro conecta nodos, define preguntas, incrusta simuladores y asigna al grupo con un clic. No hay pantallas complicadas ni curvas de aprendizaje empinadas.",
    keySalesPoint: "Demostración tangible y funcional que genera impacto inmediato en los directores académicos.",
    diagnosticQuestion: "¿Qué plataforma de las que conocen les permite crear un escape room matemático en menos de 3 minutos?",
    objectionBuster: "Cualquier maestro, sin importar su nivel de familiaridad tecnológica, domina el constructor en su primera sesión."
  },

  // SLIDE 3: HABILIDAD 2 - EL CAMINO DEL HÉROE (01:35 - 02:15, 40s)
  {
    id: 3,
    type: "curtain",
    skillNumber: 2,
    portalName: "HABILIDAD 2 · CAMINO DEL HÉROE",
    highlightCategory: "Habilidad 2 · Motivación del Alumno",
    badge: "Habilidad 02 · Aprendizaje Adaptado por Grados & Gamificación",
    title: "Habilidad 2: El Camino del Héroe: Cero Deserción",
    subtitle: "Cada nivel escolar recorre un sendero adaptado a su madurez: Primaria Baja lúdica, Primaria Alta galáctica, Secundaria RPG y Preparatoria Innovación, acompañados por su mascota en PixiJS.",
    narrativeCaption: "El Camino del Héroe: Convierte las tareas escolares en misiones heroicas, logrando un 96% de entrega puntual de actividades.",
    colorTheme: "blue",
    timingMarker: "01:35 - 02:15 (40s)",
    targetSeconds: 40,
    metrics: [
      { label: "Engagement Activo", value: "+96%" },
      { label: "Racha Promedio", value: "16 Días" },
      { label: "Satisfacción Alumnos", value: "4.9/5 ★" },
      { label: "Mascota Gráfica", value: "PixiJS 60FPS" }
    ],
    features: [
      { iconName: "Trophy", title: "Misiones Dinámicas en Vivo", desc: "Cada actividad creada en el Estudio aparece como un nuevo desafío en el sendero." },
      { iconName: "Sparkles", title: "Mascota & Avatar en PixiJS", desc: "Animación fluida que reacciona al esfuerzo académico, constancia y disciplina." },
      { iconName: "BookOpen", title: "Portafolio de Evidencias", desc: "Bitácora automática de trabajos, audios y reflexiones visible para profesores y padres." }
    ],
    portalUrl: "/student",
    pitchScript: "La Habilidad 2 es nuestro mayor imán de retención estudiantil. Los alumnos ya no ven la escuela como una carga obligatoria; se sumergen en 'El Camino del Héroe'. Su mascota interactiva y el mapa de misiones premian el esfuerzo diario, logrando que el 96% de los alumnos completen sus tareas sin que los padres tengan que perseguirlos.",
    keySalesPoint: "La gamificación científica convierte la apatía en un hábito voluntario de estudio y autosuperación.",
    diagnosticQuestion: "¿Qué porcentaje de sus alumnos entrega tareas con gusto y puntualidad semana a semana?",
    objectionBuster: "No es distracción: cada misión está respaldada por un objetivo pedagógico oficial de la SEP."
  },

  // SLIDE 4: SHOWCASE 2 - PORTAL ALUMNO EN ACCIÓN (02:15 - 02:40, 25s)
  {
    id: 4,
    type: "showcase",
    skillNumber: 2,
    portalName: "PORTAL DEL ALUMNO EN VIVO",
    highlightCategory: "Habilidad 2 · Motivación del Alumno",
    badge: "Demostración en Vivo · Sendero de Aventuras y Mascota",
    title: "Sendero de Desafíos, Niveles y Retroalimentación",
    subtitle: "La interfaz interactiva que enamora a los niños y jóvenes mientras desarrollan hábitos de estudio permanentes.",
    narrativeCaption: "Vista en vivo del portal de alumno: mapa de misiones, barras de nivel de XP y mascota interactiva.",
    colorTheme: "blue",
    timingMarker: "02:15 - 02:40 (25s)",
    targetSeconds: 25,
    metrics: [
      { label: "Nivel Actual", value: "Nivel 2 (En Ascenso)" },
      { label: "Racha Activa", value: "16 Días" }
    ],
    features: [],
    portalUrl: "/student",
    pitchScript: "Observen la experiencia del estudiante. Todo es fluido, visualmente cautivador y libre de distractores comerciales. El alumno ve su progreso, cuida su mascota y resuelve retos curriculares con orgullo.",
    keySalesPoint: "Los colegios que muestran este portal a los padres durante inscripciones aumentan su captación en más del 18%.",
    diagnosticQuestion: "¿Imaginen mostrar este portal interactivo a los padres de familia en su próximo Open House?",
    objectionBuster: "Totalmente seguro: entorno cerrado, sin publicidad, sin enlaces externos y con privacidad absoluta de datos."
  },

  // SLIDE 5: HABILIDAD 3 - TIENDA MÁGICA Y ECONOMÍA DE MÉRITO (02:40 - 03:15, 35s)
  {
    id: 5,
    type: "curtain",
    skillNumber: 3,
    portalName: "HABILIDAD 3 · ECONOMÍA DE MÉRITO",
    highlightCategory: "Habilidad 3 · Economía del Juego",
    badge: "Habilidad 03 · Tienda Mágica & Reconocimiento Escolar Positivo",
    title: "Habilidad 3: Tienda Mágica: Cultura de Mérito Real",
    subtitle: "Una economía escolar sana donde las monedas y galeones no se compran con dinero: solo se ganan superando retos académicos y demostrando constancia.",
    narrativeCaption: "Tienda Mágica: Saldo sincronizado en tiempo real para canjear artefactos motivacionales, pases escolares y accesorios del avatar.",
    colorTheme: "amber",
    timingMarker: "02:40 - 03:15 (35s)",
    targetSeconds: 35,
    metrics: [
      { label: "Acreditación", value: "Tiempo Real" },
      { label: "Catálogo de Ítems", value: "20+ Artefactos" },
      { label: "Base de Valor", value: "100% Mérito" },
      { label: "Frustración", value: "0%" }
    ],
    features: [
      { iconName: "Award", title: "Acreditación Transparente", desc: "Cada punto de XP y moneda ganada se refleja al instante en el perfil del alumno." },
      { iconName: "Sparkles", title: "Artefactos Motivacionales", desc: "Pociones de perseverancia, insignias de honor y personalización cosmética de avatar." },
      { iconName: "TrendingUp", title: "Cultura de Esfuerzo", desc: "Estimula la superación personal sin comparaciones destructivas entre compañeros." }
    ],
    portalUrl: "/student/shop",
    pitchScript: "Nuestra Habilidad 3 resuelve una gran interrogante pedagógica: ¿cómo premiar el aprendizaje sin vicios consumistas? En ISkool, el dinero real no compra galeones. Cada moneda representa un reto superado. Alumnos que antes procrastinaban ahora se esfuerzan para ganar sus monedas y canjear pases de biblioteca o artefactos para su avatar.",
    keySalesPoint: "Genera una cultura escolar sana de esfuerzo, disciplina y satisfacción personal por el logro.",
    diagnosticQuestion: "¿Cómo premia actualmente su colegio a los alumnos que dan su máximo esfuerzo cotidiano?",
    objectionBuster: "Los directores y maestros tienen control total sobre los catálogos y costos de las recompensas escolares."
  },

  // SLIDE 6: HABILIDAD 4 - BÓVEDA CURRICULAR (+1,500 NODOS) & IA (03:15 - 03:55, 40s)
  {
    id: 6,
    type: "curtain",
    skillNumber: 4,
    portalName: "HABILIDAD 4 · BÓVEDA CURRICULAR & IA",
    highlightCategory: "Habilidad 4 · Docentes & Bóveda SEP",
    badge: "Habilidad 04 · Bóveda Curricular Oficial (+1,500 Nodos) & Motor de IA Pedagógica",
    title: "Habilidad 4: Bóveda Curricular SEP & Motor de IA",
    subtitle: "Acceso instantáneo a más de 1,500 nodos curriculares oficiales de la Nueva Escuela Mexicana (Fases 1 a 6). Planeación analítica en 30 segundos y cálculo automático de Boleta Oficial SEP.",
    narrativeCaption: "Bóveda Curricular: El segundo cerebro docente que ahorra más de 14 horas semanales de papeleo y burocracia ministerial a cada maestro.",
    colorTheme: "emerald",
    timingMarker: "03:15 - 03:55 (40s)",
    targetSeconds: 40,
    metrics: [
      { label: "Bóveda Curricular", value: "1,500+ Nodos NEM" },
      { label: "Ahorro por Maestro", value: "14 Horas / sem" },
      { label: "Boleta Formativa SEP", value: "100% Automática" },
      { label: "Botón SOS Escolar", value: "< 3 Segundos" }
    ],
    features: [
      { iconName: "BookOpen", title: "Bóveda Curricular Central", desc: "Campos Formativos, Contenidos y Procesos de Desarrollo de Aprendizaje (PDA) oficiales." },
      { iconName: "Zap", title: "Motor de IA Pedagógica", desc: "Generación de planeaciones analíticas con inicio, desarrollo, cierre y rúbricas." },
      { iconName: "CheckCircle2", title: "Cálculo Oficial Boleta SEP", desc: "Ponderación formativa automática sin hojas de cálculo manuales ni errores humanos." }
    ],
    portalUrl: "/teacher",
    pitchScript: "La Habilidad 4 es la bendición más esperada por los maestros. La Nueva Escuela Mexicana trajo una carga de formatos extenuante. Con nuestra Bóveda Curricular de más de 1,500 nodos oficiales y el Motor de IA Pedagógica, los maestros generan planeaciones analíticas completas con rúbricas en 30 segundos. Ahorran 14 horas a la semana de papeleo para dedicarse a lo que de verdad importa: atender a sus alumnos.",
    keySalesPoint: "Termina con la rotación de maestros y el agotamiento laboral cumpliendo al 100% la normativa SEP.",
    diagnosticQuestion: "¿Cuántas horas extras gastan sus maestros los fines de semana armando formatos de planeación analítica?",
    objectionBuster: "No es una IA genérica: está estrictamente entrenada en la normatividad oficial de la SEP y la NEM 2024-2026."
  },

  // SLIDE 7: SHOWCASE 4 - PORTAL DOCENTE & BÓVEDA EN ACCIÓN (03:55 - 04:20, 25s)
  {
    id: 7,
    type: "showcase",
    skillNumber: 4,
    portalName: "PORTAL DOCENTE & BÓVEDA EN VIVO",
    highlightCategory: "Habilidad 4 · Docentes & Bóveda SEP",
    badge: "Demostración en Vivo · Panel Docente y Planeación Analítica",
    title: "Planeación Curricular Oficial y Evaluación Formativa",
    subtitle: "Revisión ágil de evidencias, pase de lista compendiado y generación inmediata de reportes de evaluación SEP.",
    narrativeCaption: "Vista en vivo del panel docente: selección de PDA oficial, generación de sesiones didácticas y Boleta SEP oficial.",
    colorTheme: "emerald",
    timingMarker: "03:55 - 04:20 (25s)",
    targetSeconds: 25,
    metrics: [
      { label: "Nodos Curriculares", value: "Fases 1 a 6" },
      { label: "Boleta SEP", value: "Formativa" }
    ],
    features: [],
    portalUrl: "/teacher",
    pitchScript: "Vean el panel docente. El maestro tiene a su alcance todo el programa de la SEP. Puede consultar planeaciones existentes o generar nuevas con IA pedagógica, revisar portafolios y calcular boletas oficiales sin sudar.",
    keySalesPoint: "Los directores supervisan el avance curricular de toda la escuela en tiempo real con un solo clic.",
    diagnosticQuestion: "¿Tienen hoy certeza inmediata de que todos sus docentes están cubriendo al 100% los PDAs de la SEP?",
    objectionBuster: "Si la escuela tiene planeaciones institucionales propias, se importan a la Bóveda con total privacidad."
  },

  // SLIDE 8: HABILIDAD 5 - CONTROL ESCOLAR 360°, COBRANZA & SAT (04:20 - 04:45, 25s)
  {
    id: 8,
    type: "curtain",
    skillNumber: 5,
    portalName: "HABILIDAD 5 · CONTROL ESCOLAR & SAT",
    highlightCategory: "Habilidad 5 · Gestión Directiva",
    badge: "Habilidad 05 · Expedientes 360°, Cobranza Digital & Facturación SAT 4.0",
    title: "Habilidad 5: Control Escolar 360° & Cero Morosidad",
    subtitle: "Expedientes completos del alumno (clínico, conductual, asistencias y bajas auditables), generador de horarios sin empalmes y conciliación de colegiaturas con CFDI 4.0.",
    narrativeCaption: "Módulo de Coordinación: Eficiencia administrativa que reduce la morosidad al mínimo y genera horarios escolares 10 veces más rápido.",
    colorTheme: "purple",
    timingMarker: "04:20 - 04:45 (25s)",
    targetSeconds: 25,
    metrics: [
      { label: "Expedientes 360°", value: "100% Digitales" },
      { label: "Generación Horarios", value: "10x Más Rápido" },
      { label: "Reducción Cartera", value: "-85% Morosidad" },
      { label: "Facturación SAT", value: "CFDI 4.0" }
    ],
    features: [
      { iconName: "Users", title: "Expedientes Escolares 360°", desc: "Historial de alergias, salud, disciplina, calificaciones y auditoría de bajas." },
      { iconName: "Clock", title: "Algoritmo de Horarios", desc: "Optimización inteligente de horas y aulas sin cruces docentes ni huecos." },
      { iconName: "DollarSign", title: "Cobranza & Timbrado SAT", desc: "Estados de cuenta para padres, pagos en línea y emisión de facturas oficiales." }
    ],
    portalUrl: "/coordinator",
    pitchScript: "La Habilidad 5 protege las finanzas y la operación del colegio. Los directivos cuentan con expedientes 360° con historial médico y conductual, un generador que resuelve horarios en minutos sin empalmes, y un sistema de cobranza con estados de cuenta claros que reduce la cartera vencida en un 85% timbrando facturas CFDI 4.0 ante el SAT automáticamente.",
    keySalesPoint: "Recuperar tan solo dos mensualidades atrasadas paga la inversión anual completa de ISkool.",
    diagnosticQuestion: "¿Cuánto dinero pierde su institución anualmente en cartera vencida y cuánto tiempo gastan elaborando horarios escolares?",
    objectionBuster: "Cumple con todos los lineamientos fiscales del SAT y protege los datos con cifrado de grado bancario."
  },

  // SLIDE 9: CIERRE DE VENTAS & LLAMADO A LA ACCIÓN (04:45 - 05:00, 15s)
  {
    id: 9,
    type: "curtain",
    portalName: "CIERRE EJECUTIVO · ALIANZA ISKOOL",
    highlightCategory: "Cierre & Alianza Estratégica",
    badge: "Cierre · La Decisión Estratégica para tu Institución",
    title: "El Futuro de tu Colegio Comienza Hoy con ISkool",
    subtitle: "Únete a los colegios líderes que aumentan su matrícula, retienen a sus mejores profesores y ofrecen una experiencia educativa que enamora a las familias.",
    narrativeCaption: "ISkool 2026: Una alianza que eleva el prestigio, la excelencia pedagógica y la rentabilidad de su colegio desde el primer mes.",
    colorTheme: "indigo",
    timingMarker: "04:45 - 05:00 (15s)",
    targetSeconds: 15,
    metrics: [
      { label: "Retorno de Inversión", value: "< 90 Días" },
      { label: "Captación Matrícula", value: "+18%" },
      { label: "Satisfacción Familias", value: "99.5%" },
      { label: "Implementación", value: "48 Horas" }
    ],
    features: [
      { iconName: "Trophy", title: "Garantía de Satisfacción", desc: "Acompañamiento personalizado y soporte técnico prioritario permanente." },
      { iconName: "Zap", title: "Capacitación Llave en Mano", desc: "Talleres prácticos para que sus docentes y directivos dominen la suite de inmediato." },
      { iconName: "Calendar", title: "Agenda tu Prueba Piloto", desc: "Comprueba en vivo con un grupo de tu colegio el impacto transformador de ISkool." }
    ],
    portalUrl: "/",
    pitchScript: "Señores directivos: la educación avanza a pasos agigantados. ISkool es la herramienta probada que posiciona a su colegio en la cima de la innovación. Les invitamos a agendar hoy mismo su demostración piloto personalizada sin compromiso. Muchas gracias por su tiempo y bienvenidos al futuro educativo con ISkool.",
    keySalesPoint: "Cierre de alto impacto con garantía de implementación y agenda de demostración inmediata.",
    diagnosticQuestion: "¿Podemos agendar este jueves a las 10:00 AM la sesión de configuración inicial de su prueba piloto?",
    objectionBuster: "Ofrecemos garantía de satisfacción total: si en 30 días no ven el incremento en engagement, no pagan."
  }
];

export default function PromoPage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isSpeechVoiceActive, setIsSpeechVoiceActive] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoRequested, setDemoRequested] = useState<boolean>(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  // Form state para agendar demo
  const [schoolName, setSchoolName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const globalElapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentSlide = SLIDES[currentIndex];

  // Duración en segundos de la diapositiva activa según la calibración de 5 minutos
  const currentSlideSeconds = currentSlide.targetSeconds / playbackSpeed;
  const currentSlideMs = currentSlideSeconds * 1000;

  // Manejo de Locución de Voz (Speech Synthesis)
  const speakCurrentNarrative = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (!isSpeechVoiceActive) return;

    const textToSpeak = currentSlide.narrativeCaption;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "es-MX";
    utterance.rate = 1.05 * playbackSpeed;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Cronómetro global y avance de diapositiva
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
    }

    setProgress(0);
    const startTime = Date.now();

    // Locución si está activa
    if (isSpeechVoiceActive) {
      speakCurrentNarrative();
    }

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / currentSlideMs) * 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, currentSlideMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, playbackSpeed, isSpeechVoiceActive, currentSlideMs]);

  // Contador de tiempo total transcurrido
  useEffect(() => {
    if (!isPlaying) {
      if (globalElapsedIntervalRef.current) clearInterval(globalElapsedIntervalRef.current);
      return;
    }

    globalElapsedIntervalRef.current = setInterval(() => {
      setTotalElapsedTime((prev) => Math.min(300, prev + 1));
    }, 1000 / playbackSpeed);

    return () => {
      if (globalElapsedIntervalRef.current) clearInterval(globalElapsedIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key.toLowerCase() === "t") {
        setIsTeleprompterOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === "m") {
        toggleSpeechVoice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSpeechVoiceActive]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleSpeed = () => {
    setPlaybackSpeed((prev) => {
      if (prev === 1) return 1.25;
      if (prev === 1.25) return 1.5;
      return 1;
    });
  };

  const restartPresentation = () => {
    setCurrentIndex(0);
    setProgress(0);
    setTotalElapsedTime(0);
    setIsPlaying(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleSpeechVoice = () => {
    const nextState = !isSpeechVoiceActive;
    setIsSpeechVoiceActive(nextState);
    if (!nextState && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    } else if (nextState) {
      speakCurrentNarrative();
    }
  };

  // Formato MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Heart":
        return <Heart className={className} />;
      case "Users":
        return <Users className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Award":
        return <Award className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Shield":
        return <Shield className={className} />;
      case "Star":
        return <Star className={className} />;
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      case "Clock":
        return <Clock className={className} />;
      case "TrendingUp":
        return <TrendingUp className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "DollarSign":
        return <DollarSign className={className} />;
      case "Calendar":
        return <Calendar className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Tema de colores gradientes por cortina
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case "blue":
        return {
          gradientBg: "from-blue-950 via-slate-900 to-indigo-950",
          accentText: "text-blue-400",
          badgeBg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
          glowColor: "shadow-blue-500/20",
          borderAccent: "border-blue-500/40",
          buttonBg: "bg-blue-600 hover:bg-blue-500 text-white",
          pillBg: "bg-blue-500"
        };
      case "emerald":
        return {
          gradientBg: "from-emerald-950 via-slate-900 to-teal-950",
          accentText: "text-emerald-400",
          badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          glowColor: "shadow-emerald-500/20",
          borderAccent: "border-emerald-500/40",
          buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
          pillBg: "bg-emerald-500"
        };
      case "rose":
        return {
          gradientBg: "from-rose-950 via-slate-900 to-pink-950",
          accentText: "text-rose-400",
          badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          glowColor: "shadow-rose-500/20",
          borderAccent: "border-rose-500/40",
          buttonBg: "bg-rose-600 hover:bg-rose-500 text-white",
          pillBg: "bg-rose-500"
        };
      case "purple":
        return {
          gradientBg: "from-purple-950 via-slate-900 to-violet-950",
          accentText: "text-purple-400",
          badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          glowColor: "shadow-purple-500/20",
          borderAccent: "border-purple-500/40",
          buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
          pillBg: "bg-purple-500"
        };
      case "amber":
        return {
          gradientBg: "from-amber-950 via-slate-900 to-orange-950",
          accentText: "text-amber-400",
          badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          glowColor: "shadow-amber-500/20",
          borderAccent: "border-amber-500/40",
          buttonBg: "bg-amber-600 hover:bg-amber-500 text-white",
          pillBg: "bg-amber-500"
        };
      case "cyan":
        return {
          gradientBg: "from-cyan-950 via-slate-900 to-blue-950",
          accentText: "text-cyan-400",
          badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
          glowColor: "shadow-cyan-500/20",
          borderAccent: "border-cyan-500/40",
          buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
          pillBg: "bg-cyan-500"
        };
      default:
        return {
          gradientBg: "from-indigo-950 via-slate-900 to-purple-950",
          accentText: "text-indigo-400",
          badgeBg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
          glowColor: "shadow-indigo-500/20",
          borderAccent: "border-indigo-500/40",
          buttonBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
          pillBg: "bg-indigo-500"
        };
    }
  };

  const themeStyles = getThemeStyles(currentSlide.colorTheme);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full bg-gradient-to-br ${themeStyles.gradientBg} text-white font-sans overflow-hidden flex flex-col justify-between transition-all duration-700 select-none`}
    >
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header / Player Controls */}
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/10">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ISkool Pitch 2026
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                  Presentación Ejecutiva · 5 Minutos
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Dynamic Progress Bar & 5-Minute Pitch Tracker */}
        <div className="hidden md:flex flex-col items-center gap-1.5 w-2/5 max-w-md">
          <div className="flex justify-between w-full text-[11px] font-semibold text-slate-300">
            <span className="truncate max-w-[200px] font-bold text-white flex items-center gap-1">
              <span className="text-blue-400">●</span> {currentSlide.portalName}
            </span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-amber-400 font-bold">⏱️ {formatTime(totalElapsedTime)} / 05:00</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{currentIndex + 1} / {SLIDES.length}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-75 ease-linear shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Botón Teleprompter / Guión de Ventas */}
          <button
            onClick={() => setIsTeleprompterOpen(!isTeleprompterOpen)}
            title="Abrir Guión de Ventas & Teleprompter (5 Min)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isTeleprompterOpen
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30"
                : "bg-white/10 hover:bg-white/20 border-white/15 text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guión de Ventas</span>
          </button>

          {/* Botón Locución de Voz (IA) */}
          <button
            onClick={toggleSpeechVoice}
            title={isSpeechVoiceActive ? "Desactivar locución de voz" : "Activar locución de voz (Español)"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isSpeechVoiceActive
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30"
                : "bg-white/10 hover:bg-white/20 border-white/15 text-slate-200"
            }`}
          >
            {isSpeechVoiceActive ? <Volume2 className="h-3.5 w-3.5 text-emerald-300" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
            <span className="hidden sm:inline">Locución IA</span>
          </button>

          {/* Speed selector */}
          <button
            onClick={toggleSpeed}
            title="Velocidad de presentación"
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-mono font-bold text-slate-200 transition-all"
          >
            {playbackSpeed}x
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-400" /> <span className="hidden sm:inline">Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400" /> <span className="hidden sm:inline">Reanudar</span>
              </>
            )}
          </button>

          {/* Botón Agendar Demo / Cierre */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Agendar Demo</span>
          </button>

          {/* Restart */}
          <button
            onClick={restartPresentation}
            title="Reiniciar desde el inicio"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Pantalla completa"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Sub-Header Live Category Pill & Slide Timing */}
      <div className="relative z-40 px-6 pt-3 pb-0 flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-white/5 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Pilar Activo:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${themeStyles.badgeBg}`}>
            {currentSlide.highlightCategory}
          </span>
          {currentSlide.skillNumber && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/10 text-white border border-white/20">
              HABILIDAD {currentSlide.skillNumber} DE 5
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>Tiempo sugerido: <strong className="text-white">{currentSlide.timingMarker}</strong></span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="hidden sm:inline">◀ Flechas ▶ o Espacio para pausar</span>
        </div>
      </div>

      {/* MAIN SLIDE CONTENT AREA */}
      <main className="relative z-40 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {currentSlide.type === "curtain" ? (
          /* CORTINA DE TRANSICIÓN CINEMATOGRÁFICA DE ALTO IMPACTO */
          <div className="w-full max-w-5xl animate-fadeIn flex flex-col gap-6 sm:gap-7">
            
            {/* Header Badge & Timing Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${themeStyles.badgeBg} shadow-lg backdrop-blur-md`}>
                <Sparkles className="h-4 w-4 text-amber-300" />
                {currentSlide.badge}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  {currentSlide.timingMarker}
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  PRESENTACIÓN DE VENTAS
                </span>
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {currentSlide.title}
              </h1>
              <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Key Metrics Row (4 Indicadores Clave Cuantificables) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
              {currentSlide.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white/5 border ${themeStyles.borderAccent} backdrop-blur-md flex flex-col justify-between shadow-xl hover:scale-103 transition-transform`}
                >
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <span className={`text-xl sm:text-3xl font-black mt-1.5 ${themeStyles.accentText}`}>{m.value}</span>
                </div>
              ))}
            </div>

            {/* Features Highlight (3 Puntos de Valor Tangible) */}
            {currentSlide.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {currentSlide.features.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col gap-2 hover:border-white/25 transition-all shadow-lg"
                  >
                    <div className={`p-2.5 rounded-xl bg-white/10 w-fit ${themeStyles.accentText}`}>
                      {renderIcon(f.iconName, "h-5 w-5")}
                    </div>
                    <h4 className="text-sm font-bold text-white">{f.title}</h4>
                    <p className="text-xs text-slate-400 leading-normal">{f.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Link Action & Pitch Hint */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {currentSlide.portalUrl && (
                <div className="flex items-center gap-3">
                  <Link
                    href={currentSlide.portalUrl}
                    target="_blank"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl ${themeStyles.buttonBg} transition-all hover:scale-105`}
                  >
                    Probar Módulo Interactivo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-xs text-slate-400 italic hidden sm:inline">
                    Demostración en vivo incluida en la siguiente diapositiva.
                  </span>
                </div>
              )}

              {/* Botón de Cierre si es la última diapositiva */}
              {currentIndex === SLIDES.length - 1 && (
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Agendar Prueba Piloto para tu Colegio</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* SHOWCASE PORTAL EN VIVO / INTERACTIVO */
          <div className="w-full max-w-6xl animate-fadeIn flex flex-col gap-3">
            {/* Bar Above Showcase */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  DEMOSTRACIÓN EN VIVO · {currentSlide.portalName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold">
                <span className="hidden sm:inline">{currentSlide.title}</span>
                {currentSlide.portalUrl && (
                  <Link
                    href={currentSlide.portalUrl}
                    target="_blank"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-colors"
                  >
                    Abrir en Nueva Pestaña <Maximize2 className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Interactive Portal Canvas Container */}
            <div className="relative w-full h-[62vh] min-h-[420px] rounded-3xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl">
              {currentSlide.portalUrl ? (
                <iframe
                  src={currentSlide.portalUrl}
                  className="w-full h-full border-none pointer-events-auto bg-slate-950"
                  title={currentSlide.portalName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <GraduationCap className="h-16 w-16 text-blue-400 animate-pulse mb-4" />
                  <h3 className="text-2xl font-bold text-white">Cargando Demostración...</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Subtitles / Audio Narrative Caption Bar */}
      <div className="relative z-40 border-t border-white/5 bg-slate-950/80 backdrop-blur-md px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 max-w-4xl">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] tracking-wider uppercase shrink-0">
            <Sparkles className="h-3 w-3" /> Guión de Pitch
          </div>
          <p className="text-slate-200 font-medium truncate">
            {currentSlide.narrativeCaption}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-semibold">100% Alineado SEP / NEM 2024-2026</span>
          <span>·</span>
          <span>Sin Marcas Comerciales</span>
        </div>
      </div>

      {/* FOOTER / SLIDE NAVIGATION STRIP */}
      <footer className="relative z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Previous / Next buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-slate-300 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Thumbnail Slide Selector Bar (10 Diapositivas) */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-xl py-1 px-2 scrollbar-none">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentIndex(idx);
                setProgress(0);
              }}
              title={`${idx + 1}. ${s.portalName} (${s.timingMarker})`}
              className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? `w-10 ${themeStyles.pillBg} shadow-md shadow-blue-400/50`
                  : "w-2.5 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

        {/* Investor Footer Tagline */}
        <div className="text-right text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-2">
          <span>ISkool Académico © 2026</span>
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
          >
            Solicitar Demostración
          </button>
        </div>
      </footer>

      {/* DRAWER LATERAL: GUÍA DE VENTAS Y TELEPROMPTER DE 5 MINUTOS */}
      {isTeleprompterOpen && (
        <aside className="fixed inset-y-0 right-0 z-60 w-full max-w-md bg-slate-900 border-l border-white/15 shadow-2xl flex flex-col backdrop-blur-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header del Teleprompter */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Guión de Ventas · Pitch 5 Min</h3>
                <p className="text-[10px] text-slate-400">Teleprompter y argumentario para presentador</p>
              </div>
            </div>
            <button
              onClick={() => setIsTeleprompterOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Estado del Cronómetro de la Presentación */}
          <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-300">
                Tiempo Global: {formatTime(totalElapsedTime)} / 05:00
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Diapositiva {currentIndex + 1} de {SLIDES.length}
            </span>
          </div>

          {/* Contenido del Guión por Diapositiva */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            
            {/* Guión Verbal Recomendado para la Diapositiva Actual */}
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                  🎙️ Lo que debes decir ahora ({currentSlide.timingMarker}):
                </span>
                <button
                  onClick={speakCurrentNarrative}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition cursor-pointer"
                >
                  Leer en Voz Alta
                </button>
              </div>
              <p className="text-sm text-white font-medium leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                "{currentSlide.pitchScript}"
              </p>
            </div>

            {/* Argumento de Venta Imbatible */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Argumento de Cierre (ROI):
              </span>
              <p className="text-slate-300 font-medium leading-relaxed">
                {currentSlide.keySalesPoint}
              </p>
            </div>

            {/* Pregunta Diagnóstica para el Director */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-black text-cyan-400 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Pregunta de Diagnóstico al Director:
              </span>
              <p className="text-slate-300 font-medium italic">
                "{currentSlide.diagnosticQuestion}"
              </p>
            </div>

            {/* Manejo de Objeción Frecuente */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-black text-emerald-400 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Manejo de Objeción:
              </span>
              <p className="text-slate-300 font-medium leading-relaxed">
                {currentSlide.objectionBuster}
              </p>
            </div>

            {/* Lista de Navegación Rápida con Tiempos */}
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Índice de la Presentación (5 Minutos):
              </span>
              <div className="space-y-1">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setProgress(0);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-[11px] transition cursor-pointer ${
                      idx === currentIndex
                        ? "bg-blue-600 text-white font-bold shadow-xs"
                        : "bg-white/5 hover:bg-white/10 text-slate-400"
                    }`}
                  >
                    <span className="truncate max-w-[240px]">
                      {idx + 1}. {s.portalName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {s.timingMarker.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* MODAL: AGENDAR DEMOSTRACIÓN PILOTO PARA EL COLEGIO */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/20 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-white animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Agendar Demostración Piloto</h3>
                  <p className="text-xs text-slate-400">Prueba gratuita de 30 días para tu institución</p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {demoRequested ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">¡Solicitud de Demostración Confirmada!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nos pondremos en contacto con <strong>{contactName || "la dirección escolar"}</strong> para coordinar la sesión de inducción y configurar el entorno piloto de <strong>{schoolName || "su colegio"}</strong>.
                </p>
                <button
                  onClick={() => {
                    setDemoRequested(false);
                    setIsDemoModalOpen(false);
                  }}
                  className="mt-2 px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition cursor-pointer"
                >
                  Aceptar y Continuar
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDemoRequested(true);
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nombre del Colegio o Red Escolar
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Ej. Colegio Bilingüe Siglo XXI"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nombre del Directivo / Solicitante
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ej. Prof. Roberto Morales"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Ej. 55 1234 5678"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="direccion@colegio.edu.mx"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Garantía de respuesta en menos de 2 horas hábiles.
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Confirmar Solicitud</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
