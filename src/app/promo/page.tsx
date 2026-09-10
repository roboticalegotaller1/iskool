"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  BookOpen,
  Users,
  Sparkles,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Layers,
  Award,
  Maximize2,
  DollarSign,
  RotateCcw,
  FileText,
  HelpCircle,
  X,
  Send,
  Calendar,
  MessageSquare,
  Key,
  Receipt,
  Compass,
  Check
} from "lucide-react";

// Tipos de diapositiva
type SlideType = "curtain" | "showcase";

interface SlideData {
  id: number;
  type: SlideType;
  portalName: string;
  badge: string;
  title: string;
  subtitle: string;
  narrativeCaption: string;
  metrics: { label: string; value: string }[];
  features: { iconName: string; title: string; desc: string }[];
  portalUrl?: string;
  highlightCategory: string;
  pitchScript: string;
  keySalesPoint: string;
  diagnosticQuestion: string;
  objectionBuster: string;
}

// SECUENCIA DE DIAPOSITIVAS: DATOS 100% COMPROBABLES DEL SISTEMA
// Portales destacados: Docente, Estudio Gamificado, Alumno, Tutores (WhatsApp & Magic Link), Finanzas (SAT), Dirección & Coordinación.
// Super Usuario queda estrictamente excluido.
const SLIDES: SlideData[] = [
  // SLIDE 0: VISIÓN GENERAL · LA SUITE ACADÉMICA INTEGRAL
  {
    id: 0,
    type: "curtain",
    portalName: "ISKOOL SUITE · VISIÓN GLOBAL",
    highlightCategory: "Ecosistema Educativo Integral",
    badge: "Plataforma Escolar Integral · Presentación Ejecutiva para Directores",
    title: "La Suite Digital Diseñada para Colegios de Excelencia",
    subtitle: "Una solución comprobable que unifica la gestión escolar, la pedagogía oficial y la motivación estudiantil en una plataforma institucional sin dependencias externas.",
    narrativeCaption: "ISkool unifica planeaciones curriculares oficiales y de Cambridge, comunicación familiar directa por WhatsApp y control de finanzas con timbrado SAT.",
    metrics: [
      { label: "Bóveda Curricular", value: "NEM (Fases 1-6) + Cambridge" },
      { label: "Velocidad de Planeación", value: "Generación en Segundos" },
      { label: "Comunicación Familiar", value: "WhatsApp + Magic Link" },
      { label: "Control de Cobranza", value: "Timbrado SAT CFDI 4.0" }
    ],
    features: [
      { iconName: "BookOpen", title: "Bóveda Curricular & Cambridge", desc: "Contenidos oficiales NEM más alineación con el programa internacional Cambridge para ciencias e inglés." },
      { iconName: "MessageSquare", title: "Notificaciones por WhatsApp", desc: "Reportes inmediatos al teléfono del padre de familia sobre asistencias, tareas y calificaciones." },
      { iconName: "DollarSign", title: "Portal de Finanzas y Facturación", desc: "Gestión de colegiaturas, estados de cuenta transparentes y timbrado digital oficial ante el SAT." }
    ],
    pitchScript: "Estimados directores y directivos escolares: les presentamos ISkool, una plataforma institucional construida para resolver los desafíos operativos y académicos más apremiantes de su colegio. Aquí no encontrarán promesas abstractas, sino herramientas comprobables: planeaciones oficiales y Cambridge generadas en segundos, comunicación directa a los padres por WhatsApp sin contraseñas engorrosas, y un portal financiero que automatiza la cobranza y la facturación electrónica SAT.",
    keySalesPoint: "Una única plataforma para toda la comunidad escolar que reemplaza múltiples suscripciones dispersas y centraliza la operación del colegio.",
    diagnosticQuestion: "¿Cuántas plataformas o sistemas distintos utiliza hoy su colegio para gestionar calificaciones, planeaciones de maestros y cobranza de colegiaturas?",
    objectionBuster: "ISkool se despliega en 48 horas con migración de grupos y acompañamiento institucional completo para todo su personal."
  },

  // SLIDE 1: PORTAL DOCENTE · PLANEACIONES NEM Y CAMBRIDGE EN SEGUNDOS
  {
    id: 1,
    type: "curtain",
    portalName: "PORTAL DOCENTE · BÓVEDA & PLANEACIONES",
    highlightCategory: "Portal Docente · Excelencia Curricular",
    badge: "Portal Docente · Planeaciones Analíticas Oficiales & Estándar Internacional",
    title: "Planeaciones NEM y Cambridge Creadas en Segundos",
    subtitle: "El docente accede a la Bóveda Curricular con el programa oficial de la SEP y el estándar internacional Cambridge. Genera planeaciones analíticas listas con inicio, desarrollo, cierre y rúbricas.",
    narrativeCaption: "Bóveda Curricular: El segundo cerebro docente que entrega planeaciones analíticas completas y boletas de evaluación formativa al instante.",
    metrics: [
      { label: "Currículo Integrado", value: "NEM 2024 + Cambridge" },
      { label: "Estructura Didáctica", value: "Inicio, Desarrollo y Cierre" },
      { label: "Rúbricas Analíticas", value: "Criterios e Indicadores SEP" },
      { label: "Tiempo de Entrega", value: "Listo en Segundos" }
    ],
    features: [
      { iconName: "BookOpen", title: "Bóveda Curricular Central", desc: "Nodos oficiales clasificados por Campos Formativos, Contenidos y Procesos de Desarrollo de Aprendizaje (PDA)." },
      { iconName: "Zap", title: "Sistema Internacional Cambridge", desc: "Soporte para programas bilingües con competencias internacionales en inglés y ciencias." },
      { iconName: "CheckCircle2", title: "Boletas Formativas Automatizadas", desc: "Cálculo oficial de promedios formativos sin hojas de cálculo manuales ni riesgos de error." }
    ],
    portalUrl: "/teacher",
    pitchScript: "El mayor dolor de cabeza de sus profesores es la sobrecarga administrativa generada por los formatos de planeación analítica. Con ISkool, el maestro selecciona el grado, campo formativo o materia Cambridge y el sistema le entrega en segundos la planeación completa estructurada en tres momentos didácticos con su correspondiente rúbrica analítica, lista para el aula.",
    keySalesPoint: "Sus maestros disponen de planeaciones de alto rigor pedagógico de forma inmediata, liberando tiempo valioso para la docencia frente a grupo.",
    diagnosticQuestion: "¿Cuánto tiempo invierten sus docentes cada fin de semana en redactar formatos de planeación para cumplir con la normatividad?",
    objectionBuster: "Las planeaciones son 100% editables y adaptables al contexto particular de su colegio y a las necesidades de cada grupo."
  },

  // SLIDE 2: SHOWCASE PORTAL DOCENTE EN VIVO
  {
    id: 2,
    type: "showcase",
    portalName: "PORTAL DOCENTE EN VIVO",
    highlightCategory: "Portal Docente · Demostración en Vivo",
    badge: "Demostración en Vivo · Bóveda Curricular & Panel de Maestros",
    title: "Panel Docente: Consulta, Edición y Evaluación Formativa",
    subtitle: "Explora la interfaz donde el maestro gestiona sus asignaturas, pasa lista con un clic y consulta las planeaciones de la Bóveda Curricular.",
    narrativeCaption: "Vista funcional del portal docente: acceso directo a planeaciones curriculares, control de asistencias y evidencias de aprendizaje.",
    metrics: [
      { label: "Fases Curriculares", value: "Fase 1 a Fase 6" },
      { label: "Gestión de Asistencia", value: "Pase de Lista Digital" }
    ],
    features: [],
    portalUrl: "/teacher",
    pitchScript: "Aquí pueden observar el portal del profesor en funcionamiento real. Desde esta pantalla el maestro visualiza sus asignaturas asignadas, genera o consulta planeaciones analíticas de la Bóveda y registra asistencias y calificaciones de manera ágil.",
    keySalesPoint: "Interfaz limpia y profesional que no requiere semanas de capacitación y que los maestros adoptan con naturalidad desde el primer día.",
    diagnosticQuestion: "¿Sus coordinadores tienen acceso en tiempo real a las planeaciones de todos los docentes sin tener que pedir carpetas impresas?",
    objectionBuster: "Todo queda respaldado en la Bóveda Central institucional con acceso seguro y auditoría permanente."
  },

  // SLIDE 3: ESTUDIO DE ACTIVIDADES GAMIFICADAS · CONSTRUCTOR DE RETOS
  {
    id: 3,
    type: "curtain",
    portalName: "ESTUDIO DE RETOS GAMIFICADOS",
    highlightCategory: "Herramientas de Gamificación · Lienzo Digital",
    badge: "Estudio de Actividades · Constructor Visual de Retos Interactivos",
    title: "Lienzo de Retos Interactivos con 17 Nodos Pedagógicos",
    subtitle: "Los maestros crean experiencias educativas gamificadas conectando bloques visuales: escape rooms, duelos contra jefes temáticos, secuencias cronológicas y reactivos analíticos.",
    narrativeCaption: "Estudio de Actividades: Diseña rutas interactivas con simuladores, acertijos y recompensas evaluadas automáticamente.",
    metrics: [
      { label: "Bloques Disponibles", value: "17 Nodos Interactivos" },
      { label: "Mecánicas Gamificadas", value: "Escape Room & Jefes RPG" },
      { label: "Evaluación del Alumno", value: "Calificación Inmediata" },
      { label: "Asignación a Grupos", value: "Publicación con 1 Clic" }
    ],
    features: [
      { iconName: "Layers", title: "Lienzo de Flujo por Nodos", desc: "Arrastra y conecta bloques didácticos para crear itinerarios de aprendizaje guiados." },
      { iconName: "Trophy", title: "Mecánicas de Desafío Real", desc: "Escape rooms con cifrados numéricos, duelos de conocimiento contra jefes y líneas cronológicas." },
      { iconName: "Zap", title: "Simulador en Vivo para el Docente", desc: "El profesor prueba la actividad antes de publicarla y valida cada reactivo e interactivo." }
    ],
    portalUrl: "/teacher/studio",
    pitchScript: "Para competir con el atractivo de los dispositivos digitales, ISkool incluye el Estudio de Actividades Gamificadas. En lugar de fotocopias o cuestionarios aburridos, el docente crea secuencias interactivas con 17 tipos de nodos: enigmas de escape room, emparejamiento conceptual, retos de orden cronológico y batallas de conocimiento. La plataforma califica al instante y registra el avance del estudiante.",
    keySalesPoint: "Transforma el contenido académico formal en experiencias dinámicas que los alumnos resuelven con entusiasmo voluntario.",
    diagnosticQuestion: "¿Cómo logran hoy que los alumnos muestren interés genuino al resolver ejercicios y tareas escolares?",
    objectionBuster: "Incluye un generador rápido que estructura proyectos gamificados completos en segundos a partir del tema curricular solicitado."
  },

  // SLIDE 4: SHOWCASE ESTUDIO GAMIFICADO EN VIVO
  {
    id: 4,
    type: "showcase",
    portalName: "ESTUDIO GAMIFICADO EN VIVO",
    highlightCategory: "Herramientas de Gamificación · Demostración en Vivo",
    badge: "Demostración en Vivo · Lienzo Digital y Simulador de Flujos",
    title: "Lienzo de Bloques: Construcción Visual de Retos",
    subtitle: "Comprueba cómo se interconectan los nodos de aprendizaje y cómo el simulador interactivo ejecuta cada desafío en tiempo real.",
    narrativeCaption: "Vista operativa del Estudio: conexión de nodos interactivos, ajuste de parámetros pedagógicos y prueba en simulador.",
    metrics: [
      { label: "Modo de Vista", value: "Lienzo & Lista de Nodos" },
      { label: "Simulador", value: "Ejecución en Tiempo Real" }
    ],
    features: [],
    portalUrl: "/teacher/studio",
    pitchScript: "Este es el lienzo en acción. Observen cómo cada nodo representa un momento didáctico: una introducción narrativa con personajes históricos, un reactivo analítico, un reto de escape room y un cofre de recompensas al concluir. Todo es visual y configurable.",
    keySalesPoint: "Flexibilidad total para diseñar desde una prueba corta formativa hasta proyectos transversales gamificados.",
    diagnosticQuestion: "¿Conoce alguna otra herramienta escolar que integre un editor de flujos interactivos adaptado al modelo educativo mexicano e internacional?",
    objectionBuster: "Los flujos se guardan en la biblioteca institucional del colegio para que otros maestros puedan aprovecharlos."
  },

  // SLIDE 5: PORTAL DEL ALUMNO · GAMIFICACIÓN Y ECONOMÍA DE MÉRITO
  {
    id: 5,
    type: "curtain",
    portalName: "PORTAL DEL ALUMNO · RUTA GAMIFICADA",
    highlightCategory: "Portal del Alumno · Motivación Escolar",
    badge: "Portal del Alumno · Aprendizaje Adaptativo & Economía de Mérito",
    title: "El Camino del Héroe: Motivación Escolar Real",
    subtitle: "Los estudiantes recorren un mapa de misiones pedagógicas, acumulan puntos de experiencia (XP) y gemas basadas exclusivamente en su esfuerzo académico y constancia diaria.",
    narrativeCaption: "Portal del Alumno: Misiones formativas, pase de batalla educativo y economía basada 100% en el mérito del estudiante.",
    metrics: [
      { label: "Economía Escolar", value: "100% Mérito Académico" },
      { label: "Ruta de Aprendizaje", value: "Misiones por Nivel Escolar" },
      { label: "Portafolio Digital", value: "Bitácora de Evidencias" },
      { label: "Seguridad y Privacidad", value: "Entorno Cerrado sin Anuncios" }
    ],
    features: [
      { iconName: "Trophy", title: "Sendero de Desafíos", desc: "Cada tarea o reto del profesor aparece como una misión en el mapa interactivo del alumno." },
      { iconName: "Award", title: "Economía de Mérito", desc: "Monedas y gemas obtenidas exclusivamente por resolver retos, entregar a tiempo y superarse." },
      { iconName: "Shield", title: "Entorno Institucional Seguro", desc: "Plataforma completamente cerrada, sin publicidad externa ni riesgos de distracción comercial." }
    ],
    portalUrl: "/student",
    pitchScript: "El portal del alumno es el corazón de la motivación en ISkool. Los estudiantes avanzan por un mapa de aventuras adaptado a su nivel madurativo. Cada tarea entregada y cada reto completado otorga gemas y experiencia. Aquí las recompensas no se compran con dinero: se ganan con disciplina y constancia escolar.",
    keySalesPoint: "Fomenta una sana cultura de autosuperación académica donde cumplir con los deberes escolares se convierte en un logro gratificante.",
    diagnosticQuestion: "¿Cómo reconocen y motivan hoy a los estudiantes que demuestran un avance constante en su aprendizaje?",
    objectionBuster: "Todo el sistema de recompensas y artefactos está regulado por reglas escolares y supervisado por los directores."
  },

  // SLIDE 6: SHOWCASE PORTAL DEL ALUMNO EN VIVO
  {
    id: 6,
    type: "showcase",
    portalName: "PORTAL DEL ALUMNO EN VIVO",
    highlightCategory: "Portal del Alumno · Demostración en Vivo",
    badge: "Demostración en Vivo · Mapa de Misiones & Panel del Estudiante",
    title: "Experiencia Estudiantil: Retos, Niveles y Avance Personal",
    subtitle: "Observa la interfaz que los estudiantes utilizan todos los días para consultar sus tareas, resolver desafíos y revisar sus logros académicos.",
    narrativeCaption: "Demostración del portal del estudiante: senderos curriculares interactivos, visualización de XP y retroalimentación formativa.",
    metrics: [
      { label: "Nivel de Progresión", value: "Visual y Gradual" },
      { label: "Registro de Tareas", value: "Sincronizado al Instante" }
    ],
    features: [],
    portalUrl: "/student",
    pitchScript: "Esta es la interfaz que ven sus alumnos. Es moderna, intuitiva y atractiva. El alumno tiene claridad absoluta sobre qué tareas tiene pendientes, qué retos ha desbloqueado y cuánto ha progresado en sus asignaturas.",
    keySalesPoint: "Cero fricción para los alumnos y cero quejas de 'no supe qué tarea tenía que hacer'.",
    diagnosticQuestion: "¿Se imaginan presentar este portal interactivo a los padres de familia durante sus sesiones de admisiones e inscripciones?",
    objectionBuster: "Funciona en computadoras de escritorio, laptops y tabletas sin requerir instalaciones pesadas de software."
  },

  // SLIDE 7: PORTAL DE PADRES Y TUTORES · COMUNICACIÓN POR WHATSAPP & MAGIC LINK
  {
    id: 7,
    type: "curtain",
    portalName: "PORTAL DE TUTORES · WHATSAPP & MAGIC LINK",
    highlightCategory: "Portal de Familias · Comunicación Directa",
    badge: "Portal de Tutores · Notificaciones Inmediatas por WhatsApp & Acceso Seguro por Magic Link",
    title: "Comunicación Familiar Directa por WhatsApp y Magic Link",
    subtitle: "Sin contraseñas que olvidar ni aplicaciones complejas: los padres reciben notificaciones directas por WhatsApp y acceden a su portal institucional mediante un Magic Link seguro de un solo clic.",
    narrativeCaption: "Portal de Tutores: Asistencias, calificaciones y avisos escolares enviados al instante por WhatsApp con acceso seguro por Magic Link.",
    metrics: [
      { label: "Canal de Notificación", value: "Mensajes por WhatsApp" },
      { label: "Método de Acceso", value: "Magic Link Seguro" },
      { label: "Reporte de Asistencia", value: "Notificación Inmediata" },
      { label: "Seguimiento Familiar", value: "Boletas y Estados de Cuenta" }
    ],
    features: [
      { iconName: "MessageSquare", title: "Notificaciones Automáticas por WhatsApp", desc: "El padre recibe avisos directos en su teléfono: falta a clase, tarea entregada, reporte de conducta o aviso general." },
      { iconName: "Key", title: "Acceso Instantáneo por Magic Link", desc: "El tutor entra a su expediente familiar con un enlace seguro único enviado a su correo o celular, sin recordar contraseñas." },
      { iconName: "Receipt", title: "Estados de Cuenta y Comprobantes", desc: "Consulta transparente de colegiaturas pagadas, saldos vigentes y recibos de pago en formato digital." }
    ],
    portalUrl: "/parent",
    pitchScript: "El involucramiento de los padres es decisivo para la retención escolar. Muchas plataformas fracasan porque los padres olvidan sus usuarios y contraseñas. En ISkool lo resolvimos con dos tecnologías directas: mensajes automáticos por WhatsApp cuando su hijo tiene una falta o un reporte, y acceso instantáneo por Magic Link. El padre da un toque en su teléfono y entra directamente a ver calificaciones, asistencias y pagos.",
    keySalesPoint: "Elimina los pretextos de 'no me llegó el aviso' y fideliza a las familias con una comunicación moderna, ágil y transparente.",
    diagnosticQuestion: "¿Cuántas llamadas o reclamos recibe su recepción escolar por circulares en papel no entregadas o avisos no leídos?",
    objectionBuster: "Los enlaces Magic Link cuentan con cifrado criptográfico seguro y expiran automáticamente para garantizar la privacidad familiar."
  },

  // SLIDE 8: SHOWCASE PORTAL DE TUTORES EN VIVO
  {
    id: 8,
    type: "showcase",
    portalName: "PORTAL DE TUTORES EN VIVO",
    highlightCategory: "Portal de Familias · Demostración en Vivo",
    badge: "Demostración en Vivo · Panel Familiar de Seguimiento",
    title: "Panel Familiar: Transparencia Académica y Control Escolar",
    subtitle: "Visualiza cómo el tutor consulta el avance de sus hijos, el historial de asistencias de la semana y los comunicados del colegio.",
    narrativeCaption: "Vista funcional del portal familiar: expediente de alumnos del hogar, asistencias registradas y calificaciones.",
    metrics: [
      { label: "Visión del Hogar", value: "Multi-Hijo en 1 Cuenta" },
      { label: "Historial Escolar", value: "Asistencias y Tareas al Día" }
    ],
    features: [],
    portalUrl: "/parent",
    pitchScript: "Así ve el padre de familia la información de sus hijos. Puede alternar fácilmente entre hermanos matriculados en la institución, ver las faltas del mes justificadas o injustificadas, y consultar las calificaciones oficiales sin acudir a la dirección.",
    keySalesPoint: "Las familias perciben una escuela altamente organizada, profesional y cercana a sus necesidades.",
    diagnosticQuestion: "¿Qué tan satisfechos están sus padres de familia con la velocidad de respuesta y comunicación de su colegio?",
    objectionBuster: "El colegio define qué información se publica y en qué fechas específicas se abren las boletas de evaluación."
  },

  // SLIDE 9: PORTAL DE FINANZAS Y COBRANZA · FACTURACIÓN SAT CFDI 4.0
  {
    id: 9,
    type: "curtain",
    portalName: "PORTAL DE FINANZAS · COBRANZA & SAT",
    highlightCategory: "Administración Financiera · Flujo de Caja",
    badge: "Portal de Finanzas · Cobranza Automatizada & Facturación Electrónica SAT CFDI 4.0",
    title: "Cobranza Escolar Blindada y Facturación Electrónica SAT",
    subtitle: "Monitorea colegiaturas pagadas y pendientes, automatiza recordatorios de cobro y genera facturas electrónicas CFDI 4.0 con el complemento educativo del SAT.",
    narrativeCaption: "Portal de Finanzas: Control riguroso de ingresos, estados de cuenta familiares, conciliación bancaria y timbrado fiscal oficial.",
    metrics: [
      { label: "Facturación Fiscal", value: "CFDI 4.0 Complemento IEDU" },
      { label: "Control de Pagos", value: "Conciliación Automatizada" },
      { label: "Estados de Cuenta", value: "Digitales por Familia" },
      { label: "Nómina y Gastos", value: "Control Administrativo Total" }
    ],
    features: [
      { iconName: "DollarSign", title: "Cobranza de Colegiaturas", desc: "Registro claro de pagos en ventanilla, transferencias bancarias o pasarelas digitales con generación de recibos." },
      { iconName: "Receipt", title: "Facturación SAT CFDI 4.0", desc: "Emisión de comprobantes fiscales con CURP del alumno y nivel educativo conforme a las reglas del SAT." },
      { iconName: "Shield", title: "Auditoría Financiera Escolar", desc: "Reportes consolidados de ingresos mensuales, cuentas por cobrar y conciliación financiera en tiempo real." }
    ],
    portalUrl: "/admin",
    pitchScript: "La salud financiera de un colegio depende de una cobranza oportuna y una facturación sin errores. El Portal de Finanzas de ISkool gestiona las colegiaturas de cada alumno, genera estados de cuenta familiares claros y timbra facturas electrónicas CFDI 4.0 con el complemento para instituciones educativas del SAT. Los directores tienen control absoluto del flujo de caja día con día.",
    keySalesPoint: "Evita fugas de ingresos, facilita el pago a las familias y asegura el estricto cumplimiento fiscal de la institución.",
    diagnosticQuestion: "¿Cuánto tiempo dedica su departamento administrativo a emitir facturas manuales a los padres de familia cada fin de mes?",
    objectionBuster: "Se integra con los catálogos fiscales y bancarios de su colegio manteniendo los datos protegidos bajo altos estándares de seguridad."
  },

  // SLIDE 10: PORTAL DE DIRECCIÓN & COORDINACIÓN · CONTROL INTEGRAL 360°
  {
    id: 10,
    type: "curtain",
    portalName: "PORTAL DIRECTIVO · SUPERVISIÓN 360°",
    highlightCategory: "Supervisión Directiva · Mando Institucional",
    badge: "Portal de Dirección · Tablero Ejecutivo 360° & Auditoría Académica",
    title: "Supervisión Directiva y Coordinación Académica 360°",
    subtitle: "El director y el coordinador escolar supervisan en tiempo real el cumplimiento del programa curricular, el ausentismo estudiantil y el desempeño de los docentes.",
    narrativeCaption: "Portal de Dirección: Tablero ejecutivo con indicadores de operación escolar, cobertura de PDAs de la SEP y expedientes 360°.",
    metrics: [
      { label: "Supervisión Escolar", value: "Tablero Central en Vivo" },
      { label: "Cobertura Curricular", value: "Auditoría de PDAs SEP" },
      { label: "Expedientes Escolares", value: "Historial 360° por Alumno" },
      { label: "Gestión de Grupos", value: "Horarios y Asignaturas" }
    ],
    features: [
      { iconName: "Compass", title: "Tablero Ejecutivo Central", desc: "Métricas consolidadas de asistencia escolar, matrícula activa y estatus operativo del colegio en una sola pantalla." },
      { iconName: "Users", title: "Expediente del Alumno 360°", desc: "Ficha médica, registros de conducta, asistencias históricas y bitácora académica del estudiante." },
      { iconName: "BookOpen", title: "Supervisión Curricular", desc: "El coordinador verifica el avance de cada maestro en el programa de estudios oficial y las asignaturas Cambridge." }
    ],
    portalUrl: "/director",
    pitchScript: "Para el equipo directivo, ISkool es la cabina de control del colegio. El director no tiene que esperar reportes de fin de mes: abre su panel y ve al instante qué grupos tienen mayor ausentismo, qué maestros van al día con sus planeaciones y el estado general de la institución. Información veraz y oportuna para tomar decisiones estratégicas.",
    keySalesPoint: "Brinda a la dirección escolar tranquilidad operativa absoluta y control integral de la institución.",
    diagnosticQuestion: "¿Tienen hoy una herramienta que les muestre en un solo clic la salud operativa y académica de todo su plantel?",
    objectionBuster: "Los accesos están estrictamente segmentados por roles para que cada directivo y coordinador vea únicamente lo que le compete."
  },

  // SLIDE 11: CIERRE DE VENTAS · AGENDAR PRUEBA PILOTO PARA EL COLEGIO
  {
    id: 11,
    type: "curtain",
    portalName: "ALIANZA INSTITUCIONAL · PRUEBA PILOTO",
    highlightCategory: "Cierre Ejecutivo · Alianza Escolar",
    badge: "Alianza Institucional · Paso Siguiente para su Colegio",
    title: "Transforma tu Colegio con una Prueba Piloto Institucional",
    subtitle: "Comprueba el impacto real de ISkool en tu institución: planeaciones inmediatas para tus maestros, comunicación directa por WhatsApp con tus familias y finanzas bajo control.",
    narrativeCaption: "Alianza ISkool: Implementación guiada, acompañamiento directo y prueba piloto configurada con los grupos de tu colegio.",
    metrics: [
      { label: "Implementación", value: "Configuración en 48 Horas" },
      { label: "Capacitación", value: "Talleres Llave en Mano" },
      { label: "Soporte Institucional", value: "Acompañamiento Dedicado" },
      { label: "Prueba Piloto", value: "Entorno Real para tu Plantel" }
    ],
    features: [
      { iconName: "Zap", title: "Despliegue Rápido", desc: "Configuramos tu catálogo de materias, grupos y docentes para que comiencen a operar de inmediato." },
      { iconName: "Users", title: "Capacitación a Todo el Personal", desc: "Sesiones prácticas guiadas para maestros, administrativos, coordinadores y directivos." },
      { iconName: "Calendar", title: "Prueba Piloto sin Compromiso", desc: "Validación en aula con grupos muestra para certificar la satisfacción de docentes y alumnos." }
    ],
    portalUrl: "/",
    pitchScript: "Estimados directivos: la mejor forma de comprobar las bondades de ISkool es viéndolo funcionar con sus propios grupos y profesores. Los invitamos a iniciar una Prueba Piloto institucional. Nuestro equipo se encarga de la configuración inicial y capacita a sus maestros para que comiencen a generar planeaciones y actividades interactivas. Agendemos hoy mismo la sesión de inducción para su colegio.",
    keySalesPoint: "Cierre comercial de alto valor con demostración práctica y acompañamiento cercano sin riesgo para el colegio.",
    diagnosticQuestion: "¿Podemos agendar esta semana la sesión técnica de 30 minutos para cargar sus grupos muestra e iniciar la prueba piloto?",
    objectionBuster: "La prueba piloto no interrumpe sus operaciones actuales y nuestro equipo técnico brinda asistencia en cada paso."
  }
];

export default function PromoPage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoRequested, setDemoRequested] = useState<boolean>(false);

  // Form state para agendar prueba piloto
  const [schoolName, setSchoolName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentSlide = SLIDES[currentIndex];

  // Auto-play suave (sin medidores ni números de tiempo en pantalla)
  useEffect(() => {
    if (!isPlaying) {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setTimeout(() => {
      handleNext();
    }, 12000);

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [currentIndex, isPlaying]);

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const restartPresentation = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className={className} />;
      case "Zap":
        return <Zap className={className} />;
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
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "DollarSign":
        return <DollarSign className={className} />;
      case "Calendar":
        return <Calendar className={className} />;
      case "MessageSquare":
        return <MessageSquare className={className} />;
      case "Key":
        return <Key className={className} />;
      case "Receipt":
        return <Receipt className={className} />;
      case "Compass":
        return <Compass className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white font-sans overflow-hidden flex flex-col justify-between transition-all duration-700 select-none"
    >
      {/* Resplandor neón esmeralda y turquesa de fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Trama sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Encabezado Superior / Barra de Control */}
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-emerald-500/30 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/40 text-emerald-400 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
                ISkool Académico
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse" />
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">
                  Presentación Ejecutiva Institucional
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Indicador de diapositiva activa (sin medidores de tiempo) */}
        <div className="hidden md:flex flex-col items-center gap-1 w-2/5 max-w-md">
          <div className="flex justify-between w-full text-xs font-semibold text-slate-300">
            <span className="truncate max-w-[280px] font-bold text-white flex items-center gap-1.5">
              <span className="text-emerald-400">●</span> {currentSlide.portalName}
            </span>
            <span className="text-teal-300 font-mono text-xs font-bold">
              {currentIndex + 1} / {SLIDES.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800/90 rounded-full overflow-hidden border border-emerald-500/30">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 transition-all duration-300 shadow-md shadow-emerald-500/30"
              style={{ width: `${((currentIndex + 1) / SLIDES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Botonera de Acciones de Control */}
        <div className="flex items-center gap-2">
          {/* Botón Guión de Ventas */}
          <button
            onClick={() => setIsTeleprompterOpen(!isTeleprompterOpen)}
            title="Abrir Guión de Ventas y Argumentario para Directores"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isTeleprompterOpen
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30"
                : "bg-slate-800/80 hover:bg-slate-700/80 border-emerald-500/30 text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guión de Ventas</span>
          </button>

          {/* Reproducción Automática Suave */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-400" /> <span className="hidden sm:inline">Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400" /> <span className="hidden sm:inline">Reproducir</span>
              </>
            )}
          </button>

          {/* Botón Principal Dorado: Agendar Prueba Piloto */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 border border-amber-400/50 transition-all cursor-pointer hover:scale-102"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Agendar Prueba Piloto</span>
          </button>

          {/* Reiniciar */}
          <button
            onClick={restartPresentation}
            title="Reiniciar presentación"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-emerald-500/30 text-slate-300 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Pantalla Completa */}
          <button
            onClick={toggleFullscreen}
            title="Pantalla completa"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-emerald-500/30 text-slate-300 transition-all cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Sub-Header: Módulo Activo */}
      <div className="relative z-40 px-6 py-2 flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-emerald-500/20 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">Módulo en Pantalla:</span>
          <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-xs shadow-emerald-500/20">
            {currentSlide.highlightCategory}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="hidden sm:inline text-teal-400 font-bold">◄ Usa las flechas del teclado o el botón de abajo para avanzar ►</span>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DE LA DIAPOSITIVA */}
      <main className="relative z-40 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {currentSlide.type === "curtain" ? (
          /* CORTINA EJECUTIVA DE PRESENTACIÓN */
          <div className="w-full max-w-5xl animate-fadeIn flex flex-col gap-6 sm:gap-7">
            
            {/* Badge de Encabezado */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-md shadow-emerald-500/20 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-amber-400" />
                {currentSlide.badge}
              </span>
              <span className="text-xs font-semibold text-teal-300 bg-teal-950/60 border border-teal-500/30 px-3.5 py-1 rounded-full uppercase tracking-wider">
                Datos Comprobables del Sistema
              </span>
            </div>

            {/* Título y Subtítulo */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-teal-100 bg-clip-text text-transparent">
                {currentSlide.title}
              </h1>
              <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Fila de Datos Comprobables (Sin estimaciones ni porcentajes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
              {currentSlide.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md flex flex-col justify-between shadow-lg shadow-emerald-500/10 hover:border-teal-400/50 transition-all hover:scale-102"
                >
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{m.label}</span>
                  <span className="text-base sm:text-lg font-black mt-1.5 text-white leading-snug">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Puntos de Valor Funcional Tangible */}
            {currentSlide.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {currentSlide.features.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-teal-500/30 backdrop-blur-md flex flex-col gap-2 hover:border-emerald-400/50 transition-all shadow-md shadow-slate-950/50"
                  >
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/30 text-amber-400 w-fit">
                      {renderIcon(f.iconName, "h-5 w-5")}
                    </div>
                    <h4 className="text-sm font-bold text-white">{f.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Acciones Interactivas */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {currentSlide.portalUrl && currentSlide.portalUrl !== "/" && (
                <div className="flex items-center gap-3">
                  <Link
                    href={currentSlide.portalUrl}
                    target="_blank"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all hover:scale-103 border border-emerald-400/30"
                  >
                    Abrir Portal en Vivo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-xs text-slate-400 italic hidden sm:inline">
                    Demostración interactiva en la siguiente diapositiva.
                  </span>
                </div>
              )}

              {/* Botón Dorado de Agendar Prueba Piloto */}
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-xl shadow-amber-500/30 border border-amber-400/50 transition-all hover:scale-103 flex items-center gap-2 cursor-pointer ml-auto"
              >
                <Calendar className="h-4 w-4" />
                <span>Agendar Prueba Piloto para tu Colegio</span>
              </button>
            </div>
          </div>
        ) : (
          /* SHOWCASE EN VIVO (IFRAME FUNCIONAL DEL PORTAL) */
          <div className="w-full max-w-6xl animate-fadeIn flex flex-col gap-3">
            {/* Barra superior de la Demostración */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                  PORTAL FUNCIONAL EN VIVO · {currentSlide.portalName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold">
                <span className="hidden sm:inline">{currentSlide.title}</span>
                {currentSlide.portalUrl && (
                  <Link
                    href={currentSlide.portalUrl}
                    target="_blank"
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:underline bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 transition-colors font-bold"
                  >
                    Abrir en Nueva Pestaña <Maximize2 className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Contenedor del Iframe con Borde Neón */}
            <div className="relative w-full h-[62vh] min-h-[420px] rounded-3xl border border-teal-400/40 bg-slate-950 overflow-hidden shadow-2xl shadow-teal-500/10">
              {currentSlide.portalUrl ? (
                <iframe
                  src={currentSlide.portalUrl}
                  className="w-full h-full border-none pointer-events-auto bg-slate-950"
                  title={currentSlide.portalName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <GraduationCap className="h-16 w-16 text-emerald-400 animate-pulse mb-4" />
                  <h3 className="text-2xl font-bold text-white">Cargando Demostración...</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Franja de Argumento de Valor */}
      <div className="relative z-40 border-t border-emerald-500/20 bg-slate-950/80 backdrop-blur-md px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 max-w-4xl">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] tracking-wider uppercase shrink-0 border border-amber-500/30">
            <Sparkles className="h-3 w-3" /> Propuesta de Valor
          </div>
          <p className="text-slate-200 font-medium truncate">
            {currentSlide.narrativeCaption}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-semibold">100% Alineado SEP / NEM 2024-2026 + Cambridge</span>
          <span>·</span>
          <span className="text-teal-400">Sin Marcas Comerciales</span>
        </div>
      </div>

      {/* PIE DE PÁGINA / NAVEGADOR DE DIAPOSITIVAS */}
      <footer className="relative z-50 border-t border-emerald-500/30 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Botones Anterior / Siguiente */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-emerald-500/30 text-xs font-bold text-slate-300 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40 transition-all cursor-pointer"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Indicadores de Diapositivas */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-xl py-1 px-2 scrollbar-none">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              title={`${idx + 1}. ${s.portalName}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md shadow-emerald-500/50"
                  : "w-2.5 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

        {/* Cierre / Llamado a la Acción */}
        <div className="text-right text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-2">
          <span>ISkool Académico © 2026</span>
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            Agendar Prueba Piloto
          </button>
        </div>
      </footer>

      {/* DRAWER LATERAL: GUIÓN DE VENTAS PARA EL PRESENTADOR */}
      {isTeleprompterOpen && (
        <aside className="fixed inset-y-0 right-0 z-60 w-full max-w-md bg-slate-900/95 border-l border-emerald-500/40 shadow-2xl flex flex-col backdrop-blur-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header del Guión */}
          <div className="p-4 border-b border-emerald-500/30 flex items-center justify-between bg-slate-950/90">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Guión de Ventas Institucional</h3>
                <p className="text-[10px] text-teal-400 font-semibold">Tácticas de alto valor para directores</p>
              </div>
            </div>
            <button
              onClick={() => setIsTeleprompterOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Diapositiva Actual */}
          <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">
              {currentSlide.portalName}
            </span>
            <span className="text-[11px] font-mono text-teal-400 font-bold">
              Diapositiva {currentIndex + 1} de {SLIDES.length}
            </span>
          </div>

          {/* Contenido del Argumentario */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            
            {/* Lo que debes decir */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2.5 shadow-md">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block">
                🎙️ Discurso Recomendado:
              </span>
              <p className="text-sm text-slate-100 font-medium leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-white/5">
                "{currentSlide.pitchScript}"
              </p>
            </div>

            {/* Argumento de Cierre */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
              <span className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Propuesta de Valor Clave:
              </span>
              <p className="text-slate-200 font-medium leading-relaxed">
                {currentSlide.keySalesPoint}
              </p>
            </div>

            {/* Pregunta de Diagnóstico */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/30 space-y-1">
              <span className="text-[10px] uppercase font-black text-teal-300 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Pregunta de Diagnóstico al Director:
              </span>
              <p className="text-slate-300 font-medium italic">
                "{currentSlide.diagnosticQuestion}"
              </p>
            </div>

            {/* Manejo de Objeción */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-black text-emerald-400 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Manejo de Objeción:
              </span>
              <p className="text-slate-300 font-medium leading-relaxed">
                {currentSlide.objectionBuster}
              </p>
            </div>

            {/* Índice Rápido */}
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Índice de Módulos:
              </span>
              <div className="space-y-1">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-[11px] transition cursor-pointer ${
                      idx === currentIndex
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-xs"
                        : "bg-white/5 hover:bg-white/10 text-slate-300"
                    }`}
                  >
                    <span className="truncate max-w-[280px]">
                      {idx + 1}. {s.portalName}
                    </span>
                    <span className="text-[10px] text-teal-400 font-mono">
                      {s.type === "showcase" ? "En vivo" : "Guía"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* MODAL: AGENDAR PRUEBA PILOTO PARA EL COLEGIO */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 flex flex-col gap-5 text-white animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Agendar Prueba Piloto para tu Colegio</h3>
                  <p className="text-xs text-teal-300 font-medium">Entorno institucional configurado para tus grupos</p>
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
                <h4 className="text-base font-bold text-white">¡Prueba Piloto Solicitada con Éxito!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nos comunicaremos con <strong>{contactName || "la dirección del plantel"}</strong> para programar la sesión de carga de grupos y capacitación inicial de <strong>{schoolName || "su colegio"}</strong>.
                </p>
                <button
                  onClick={() => {
                    setDemoRequested(false);
                    setIsDemoModalOpen(false);
                  }}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 transition cursor-pointer shadow-lg shadow-amber-500/30"
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
                  <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-1">
                    Nombre del Colegio o Institución Educativa
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Ej. Colegio Bilingüe Siglo XXI"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-1">
                      Nombre del Directivo o Responsable
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ej. Prof. Roberto Morales"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-1">
                      Teléfono / WhatsApp de Contacto
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Ej. 55 1234 5678"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-1">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="direccion@colegio.edu.mx"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Respuesta prioritaria en menos de 2 horas hábiles.
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition cursor-pointer flex items-center gap-1.5 border border-amber-400/50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Confirmar Solicitud de Piloto</span>
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
